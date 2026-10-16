import fs from 'fs'
import path from 'path'

import type { Account, AccountProxy, ConfigSaveFingerprint } from '../interface/Account'
import type { Config } from '../interface/Config'
import { validateAccounts, validateConfig } from './Validator'

let configCache: Config
let envLoaded = false

/**
 * 定位项目根目录：先信任含 package.json 的当前目录，再从本模块向上找。
 * 这样既支持源码运行，也支持 dist 编译产物；桌面封装时必须显式设置 cwd。
 */
function getProjectRoot(): string {
    const cwd = process.cwd()
    if (fs.existsSync(path.join(cwd, 'package.json'))) return cwd

    let dir = __dirname
    while (dir !== path.parse(dir).root) {
        if (fs.existsSync(path.join(dir, 'package.json'))) return dir
        dir = path.dirname(dir)
    }

    return cwd
}

// Check root -> dist -> src (not in dist, but root)
/**
 * filename 是待查文件名；返回首个存在的绝对/拼接路径，未找到返回 undefined。
 * 顺序为工作目录、根目录、dist、src；多份配置同时存在时，前面的会遮住后面的。
 */
function resolveProjectFile(filename: string): string | undefined {
    const root = getProjectRoot()
    const candidates = [
        path.join(process.cwd(), filename),
        path.join(root, filename),
        path.join(root, 'dist', filename),
        path.join(root, 'src', filename)
    ]
    return candidates.find(p => fs.existsSync(p))
}

/**
 * 每个进程只读取一次 .env。忽略空行和 # 注释，按第一个等号拆分，去掉成对引号。
 * 仅填充尚未定义的 process.env，因此操作系统/容器环境优先；这不是完整 dotenv 语法解析器。
 */
function ensureEnvLoaded(): void {
    if (envLoaded) return
    envLoaded = true

    // Check root -> dist -> src (not in dist, but root)
    const envFile = resolveProjectFile('.env')
    if (!envFile) return

    const raw = fs.readFileSync(envFile, 'utf-8')
    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue

        const eq = trimmed.indexOf('=')
        if (eq === -1) continue

        const key = trimmed.slice(0, eq).trim()
        let value = trimmed.slice(eq + 1).trim()

        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
        }

        if (process.env[key] === undefined) {
            process.env[key] = value
        }
    }
}

function envStr(key: string): string | undefined {
    const v = process.env[key]
    if (v === undefined) return undefined
    const trimmed = v.trim()
    return trimmed.length ? trimmed : undefined
}

function envBool(key: string, fallback: boolean): boolean {
    const v = envStr(key)
    if (v === undefined) return fallback
    return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())
}

const deprecationWarned = new Set<string>()
/**
 * primary 为新字段名，legacy 为旧字段名，fallback 为默认值。
 * 优先新字段，兼容旧字段并通过 Set 保证每个旧字段只警告一次，避免日志刷屏。
 */
function envBoolWithLegacy(primary: string, legacy: string, fallback: boolean): boolean {
    if (envStr(primary) !== undefined) return envBool(primary, fallback)
    if (envStr(legacy) !== undefined) {
        if (!deprecationWarned.has(legacy)) {
            deprecationWarned.add(legacy)
            console.warn(`[Accounts] ${legacy} is deprecated; rename it to ${primary}.`)
        }
        return envBool(legacy, fallback)
    }
    return fallback
}

function envInt(key: string, fallback: number): number {
    const v = envStr(key)
    if (v === undefined) return fallback
    const n = parseInt(v, 10)
    return Number.isFinite(n) ? n : fallback
}

function buildProxy(index: string): AccountProxy {
    return {
        proxyHttp: envBoolWithLegacy(`ACCOUNT_${index}_PROXY_HTTP`, `ACCOUNT_${index}_PROXY_AXIOS`, false),
        url: envStr(`ACCOUNT_${index}_PROXY_URL`) ?? '',
        port: envInt(`ACCOUNT_${index}_PROXY_PORT`, 0),
        username: envStr(`ACCOUNT_${index}_PROXY_USERNAME`) ?? '',
        password: envStr(`ACCOUNT_${index}_PROXY_PASSWORD`) ?? ''
    }
}

function buildSaveFingerprint(index: string): ConfigSaveFingerprint {
    return {
        mobile: envBool(`ACCOUNT_${index}_SAVE_FINGERPRINT_MOBILE`, false),
        desktop: envBool(`ACCOUNT_${index}_SAVE_FINGERPRINT_DESKTOP`, false)
    }
}

/**
 * 只接受正整数编号且邮箱非空的账号；返回按数值升序排列的编号字符串。
 * 显式数值排序避免字符串排序把 ACCOUNT_10 排在 ACCOUNT_2 前面。
 */
function getAccountIndexes(): string[] {
    return Object.keys(process.env)
        .map(key => /^ACCOUNT_([1-9]\d*)_EMAIL$/.exec(key)?.[1])
        .filter((index): index is string => Boolean(index && envStr(`ACCOUNT_${index}_EMAIL`)))
        .sort((a, b) => Number(a) - Number(b))
}

/**
 * 返回经过运行时校验的 Account[]。从环境变量组装账号、代理、地区和指纹选项。
 * TypeScript 类型不能验证外部输入，因此最终必须调用 validateAccounts；没有账号会抛错。
 */
export function loadAccounts(): Account[] {
    try {
        ensureEnvLoaded()

        const accounts: Account[] = []

        for (const index of getAccountIndexes()) {
            const email = envStr(`ACCOUNT_${index}_EMAIL`)
            if (!email) continue

            const password = envStr(`ACCOUNT_${index}_PASSWORD`) ?? ''

            accounts.push({
                email,
                password,
                totpSecret: envStr(`ACCOUNT_${index}_TOTP_SECRET`),
                recoveryEmail: envStr(`ACCOUNT_${index}_RECOVERY_EMAIL`) ?? '',
                geoLocale: envStr(`ACCOUNT_${index}_GEO_LOCALE`) ?? 'auto',
                langCode: envStr(`ACCOUNT_${index}_LANG_CODE`) ?? 'en',
                proxy: buildProxy(index),
                saveFingerprint: buildSaveFingerprint(index)
            })
        }

        if (!accounts.length) {
            throw new Error('No accounts found in environment. Set at least one ACCOUNT_N_EMAIL (see env.example).')
        }

        return validateAccounts(accounts)
    } catch (error) {
        if (error instanceof Error) throw error
        throw new Error(String(error))
    }
}

/**
 * 读取并校验 config.json，返回 Config；首次成功后缓存，后续直接复用。
 * JSON.parse 只检查语法，validateConfig 再检查内容。修改磁盘文件不会刷新已运行进程。
 */
export function loadConfig(): Config {
    try {
        if (configCache) {
            return configCache
        }

        // Check root -> dist -> src (not in dist, but root)
        const configPath = resolveProjectFile('config.json')
        if (!configPath) {
            throw new Error(
                'config.json not found - place it in the project root (dist/ and src/ are also searched as fallbacks)'
            )
        }
        const config = fs.readFileSync(configPath, 'utf-8')

        const unverifiedConfig = JSON.parse(config)
        const configData = validateConfig(unverifiedConfig)

        configCache = configData

        return configData
    } catch (error) {
        if (error instanceof Error) throw error
        throw new Error(String(error))
    }
}

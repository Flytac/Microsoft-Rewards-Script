import fs from 'node:fs'
import path from 'node:path'

function valueFrom(sourceEnv, key) {
    const value = sourceEnv[key]
    if (value == null) return undefined
    const trimmed = String(value).trim()
    return trimmed || undefined
}

/**
 * 将参数配置转为字符串数组；优先 JSON 数组，否则按空白拆分。
 * 空白拆分不是 shell 引号解析，含空格的路径应放在 JSON 数组的单独元素里。
 */
export function parseRunArgs(value) {
    if (!value) return []
    const trimmed = String(value).trim()
    if (trimmed.startsWith('[')) {
        try {
            const args = JSON.parse(trimmed)
            if (Array.isArray(args)) return args.map(String)
        } catch {}
    }
    return trimmed.split(/\s+/).filter(Boolean)
}

/**
 * 根据项目目录/环境决定可执行程序和参数；优先已编译 dist，否则退回 ts-node。
 * Windows npm.cmd 特殊转换为 Node + npm-cli.js，其他批处理被拒绝，避免引入 shell 解释与注入风险。
 */
export function resolveRunCommand({
    projectRoot,
    sourceEnv = process.env,
    execPath = process.execPath,
    existsSync = fs.existsSync
}) {
    const commandOverride = valueFrom(sourceEnv, 'API_RUN_COMMAND')
    if (commandOverride) {
        const overrideArgs = parseRunArgs(valueFrom(sourceEnv, 'API_RUN_ARGS'))
        if (/(?:^|[\\/])npm\.cmd$/i.test(commandOverride)) {
            const npmCliCandidates = [
                valueFrom(sourceEnv, 'npm_execpath'),
                path.join(path.dirname(execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')
            ].filter(Boolean)
            const npmCli = npmCliCandidates.find(candidate => existsSync(candidate))
            if (!npmCli) {
                throw new Error(
                    'API_RUN_COMMAND points to npm.cmd, but npm-cli.js could not be found. ' +
                        'Remove the override to use the automatic launcher.'
                )
            }
            return { command: execPath, args: [npmCli, ...overrideArgs] }
        }
        if (/\.(?:cmd|bat)$/i.test(commandOverride)) {
            throw new Error(
                'API_RUN_COMMAND cannot be a .cmd or .bat file. Use a native executable or JavaScript entry point.'
            )
        }
        return {
            command: commandOverride,
            args: overrideArgs
        }
    }

    const distEntry = path.join(projectRoot, 'dist', 'index.js')
    if (existsSync(distEntry)) return { command: execPath, args: [distEntry] }

    const tsNodeCli = path.join(projectRoot, 'node_modules', 'ts-node', 'dist', 'bin.js')
    const sourceEntry = path.join(projectRoot, 'src', 'index.ts')
    return { command: execPath, args: [tsNodeCli, sourceEntry] }
}

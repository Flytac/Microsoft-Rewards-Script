import type { Page } from 'patchright'
import readline from 'readline'

export interface PromptOptions {
    question: string
    timeoutSeconds?: number
    validate?: (input: string) => boolean
    transform?: (input: string) => string
}

/**
 * 只有 stdin 是交互终端才允许提问。桌面程序的管道输入和 API 子进程通常不是 TTY。
 */
export function canPromptForInput(): boolean {
    return process.stdin.isTTY === true
}

/**
 * options 包含问题、超时、可选转换与校验；返回输入文本或 null。
 * 超时、无交互终端或校验失败会得到 null；cleanup 用 resolved 防止超时和回答重复结算 Promise。
 */
export function promptInput(options: PromptOptions): Promise<string | null> {
    if (!canPromptForInput()) return Promise.resolve(null)

    const { question, timeoutSeconds = 60, validate, transform } = options

    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        let resolved = false

        const cleanup = (result: string | null) => {
            if (resolved) return
            resolved = true
            clearTimeout(timer)
            rl.close()
            resolve(result)
        }

        const timer = setTimeout(() => cleanup(null), timeoutSeconds * 1000)

        rl.question(question, answer => {
            let value = answer.trim()
            if (transform) value = transform(value)

            if (validate && !validate(value)) {
                cleanup(null)
                return
            }

            cleanup(value)
        })
    })
}

export async function getSubtitleMessage(page: Page): Promise<string | null> {
    const message = await page
        .waitForSelector('[data-testid="subtitle"], div#oneTimeCodeDescription, [data-testid="description"]', {
            state: 'visible',
            timeout: 1000
        })
        .catch(() => null)

    if (!message) return null

    const text = await message.innerText()
    return text.trim()
}

export async function getErrorMessage(page: Page): Promise<string | null> {
    const errorAlert = await page
        .waitForSelector('div[role="alert"]', { state: 'visible', timeout: 1000 })
        .catch(() => null)

    if (!errorAlert) return null

    const text = await errorAlert.innerText()
    return text.trim()
}

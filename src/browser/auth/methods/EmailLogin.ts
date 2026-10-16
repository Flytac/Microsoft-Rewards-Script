import type { Page } from 'patchright'
import type { MicrosoftRewardsBot } from '../../../index'

export class EmailLogin {
    private submitButton = 'button[type="submit"]'

    constructor(private bot: MicrosoftRewardsBot) {}

    /**
     * page 为登录页面，email 为账号邮箱；返回 ok 或 error，表示本次填写/提交步骤的结果。
     * 先检查输入框和按钮是否可见，再清空填写；页面变化可能导致元素不存在。
     */
    async enterEmail(page: Page, email: string): Promise<'ok' | 'error'> {
        try {
            const emailInputSelector = 'input[type="email"]'
            const emailField = await page
                .waitForSelector(emailInputSelector, { state: 'visible', timeout: 1000 })
                .catch(() => {})
            if (!emailField) {
                this.bot.logger.warn(this.bot.isMobile, 'LOGIN-ENTER-EMAIL', 'Email field not found')
                return 'error'
            }

            await this.bot.utils.wait(1000)

            const prefilledEmail = await page
                .waitForSelector('#userDisplayName', { state: 'visible', timeout: 1000 })
                .catch(() => {})
            if (!prefilledEmail) {
                await page.fill(emailInputSelector, '').catch(() => {})
                await this.bot.utils.wait(500)
                await page.fill(emailInputSelector, email).catch(() => {})
                await this.bot.utils.wait(1000)
            } else {
                this.bot.logger.info(this.bot.isMobile, 'LOGIN-ENTER-EMAIL', 'Email prefilled')
            }

            const submitButton = await page
                .waitForSelector(this.submitButton, { state: 'visible', timeout: 2000 })
                .catch(() => null)
            if (!submitButton) {
                this.bot.logger.warn(this.bot.isMobile, 'LOGIN-ENTER-EMAIL', 'Submit button not found')
                return 'error'
            }

            const clicked = await this.bot.browser.utils.ghostClick(page, this.submitButton)
            if (!clicked) {
                this.bot.logger.warn(this.bot.isMobile, 'LOGIN-ENTER-EMAIL', 'Could not submit email')
                return 'error'
            }
            this.bot.logger.info(this.bot.isMobile, 'LOGIN-ENTER-EMAIL', 'Email submitted')

            return 'ok'
        } catch (error) {
            this.bot.logger.error(
                this.bot.isMobile,
                'LOGIN-ENTER-EMAIL',
                `An error occurred: ${error instanceof Error ? error.message : String(error)}`
            )
            return 'error'
        }
    }

    /**
     * password 只用于页面填写；返回联合类型，但当前实现的显式返回为 ok/error。
     * 提交密码不等于完整登录完成，后续二步验证由 Login 的状态循环继续识别。
     */
    async enterPassword(page: Page, password: string): Promise<'ok' | 'needs-2fa' | 'error'> {
        try {
            const passwordInputSelector = 'input[type="password"]'
            const passwordField = await page
                .waitForSelector(passwordInputSelector, { state: 'visible', timeout: 1000 })
                .catch(() => {})
            if (!passwordField) {
                this.bot.logger.warn(this.bot.isMobile, 'LOGIN-ENTER-PASSWORD', 'Password field not found')
                return 'error'
            }

            await this.bot.utils.wait(1000)
            await page.fill(passwordInputSelector, '').catch(() => {})
            await this.bot.utils.wait(500)
            await page.fill(passwordInputSelector, password).catch(() => {})
            await this.bot.utils.wait(1000)

            const submitButton = await page
                .waitForSelector(this.submitButton, { state: 'visible', timeout: 2000 })
                .catch(() => null)

            if (!submitButton) {
                this.bot.logger.warn(this.bot.isMobile, 'LOGIN-ENTER-PASSWORD', 'Submit button not found')
                return 'error'
            }

            const clicked = await this.bot.browser.utils.ghostClick(page, this.submitButton)
            if (!clicked) {
                this.bot.logger.warn(this.bot.isMobile, 'LOGIN-ENTER-PASSWORD', 'Could not submit password')
                return 'error'
            }
            this.bot.logger.info(this.bot.isMobile, 'LOGIN-ENTER-PASSWORD', 'Password submitted')

            return 'ok'
        } catch (error) {
            this.bot.logger.error(
                this.bot.isMobile,
                'LOGIN-ENTER-PASSWORD',
                `An error occurred: ${error instanceof Error ? error.message : String(error)}`
            )
            return 'error'
        }
    }
}

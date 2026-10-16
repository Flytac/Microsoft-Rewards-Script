import { BaseActivity } from '../BaseActivity'
import type { BasePromotion } from '../../../interface/DashboardData'

export class PromotionActivityRunner extends BaseActivity {
    /**
     * promotions 为待处理活动列表；逐项执行，单项失败记录后继续，项间保留原有等待。
     * 异常隔离防止一个不支持/失败的活动让整批任务中止。
     */
    public async run(promotions: BasePromotion[]): Promise<void> {
        for (const [index, promotion] of promotions.entries()) {
            try {
                await this.runPromotion(promotion)
                if (index < promotions.length - 1) {
                    await this.bot.utils.wait(this.bot.utils.randomDelay(5000, 15000))
                }
            } catch (error) {
                this.bot.logger.error(
                    this.bot.isMobile,
                    'ACTIVITY',
                    `Error while solving activity "${promotion.title}" | message=${
                        error instanceof Error ? error.message : String(error)
                    }`
                )
            }
        }
    }

    /**
     * 识别 promotionType 与名称后分派；仅支持 urlreward 类型，再区分 ExploreOnBing。
     * 执行前检查对应 activities 开关，未知类型直接记录跳过，不凭标题猜测操作。
     */
    private async runPromotion(promotion: BasePromotion): Promise<void> {
        const type = promotion.promotionType?.toLowerCase() ?? ''
        const name = promotion.name?.toLowerCase() ?? ''
        const offerId = promotion.offerId

        this.bot.logger.debug(
            this.bot.isMobile,
            'ACTIVITY',
            `Processing activity | title="${promotion.title}" | offerId=${offerId} | type=${type}`
        )

        if (type !== 'urlreward') {
            this.bot.logger.warn(
                this.bot.isMobile,
                'ACTIVITY',
                `Skipped activity "${promotion.title}" | offerId=${offerId} | reason=unsupported type "${
                    promotion.promotionType
                }"`
            )
            return
        }

        const isSearchOnBing = name.includes('exploreonbing')
        if (isSearchOnBing && !this.bot.config.activities.searchOnBing) {
            this.logDisabled('SearchOnBing', offerId)
            return
        }
        if (!isSearchOnBing && !this.bot.config.activities.urlReward) {
            this.logDisabled('UrlReward', offerId)
            return
        }

        if (isSearchOnBing) {
            this.bot.logger.info(
                this.bot.isMobile,
                'ACTIVITY',
                `Found activity type "SearchOnBing" | title="${promotion.title}" | offerId=${offerId}`
            )
            const page = this.bot.isMobile ? this.bot.mainMobilePage : this.bot.mainDesktopPage
            await this.bot.activities.doSearchOnBing(promotion, page)
            return
        }

        this.bot.logger.info(
            this.bot.isMobile,
            'ACTIVITY',
            `Found activity type "UrlReward" | title="${promotion.title}" | offerId=${offerId}`
        )
        await this.bot.activities.doUrlReward(promotion)
    }

    private logDisabled(activity: string, offerId: string): void {
        this.bot.logger.info(
            this.bot.isMobile,
            'ACTIVITY',
            `Skipping "${activity}" (disabled in config) | offerId=${offerId}`
        )
    }
}

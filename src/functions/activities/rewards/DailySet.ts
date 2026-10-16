import { BaseActivity } from '../BaseActivity'
import type { DashboardData } from '../../../interface/DashboardData'
import { PromotionActivityRunner } from './PromotionActivityRunner'

export class DailySet extends BaseActivity {
    /**
     * data 为统一仪表盘数据；按今天的日期选择未完成且有积分的每日任务，再交给共享分发器。
     * 返回 void 只表示这一批处理结束；每项是否成功仍应看具体活动和服务器状态。
     */
    public async run(data: DashboardData): Promise<void> {
        const today = this.bot.utils.getFormattedDate()
        const pending =
            data.dashboard.dailySetPromotions[today]?.filter(item => !item.complete && item.pointProgressMax > 0) ?? []

        if (!pending.length) {
            this.bot.logger.info(this.bot.isMobile, 'DAILY-SET', 'All "Daily Set" items have already been completed')
            return
        }

        this.bot.logger.info(
            this.bot.isMobile,
            'DAILY-SET',
            `Started solving "Daily Set" items | remaining=${pending.length}`
        )
        await new PromotionActivityRunner(this.bot).run(pending)
        this.bot.logger.info(this.bot.isMobile, 'DAILY-SET', 'Finished processing "Daily Set" items')
    }
}

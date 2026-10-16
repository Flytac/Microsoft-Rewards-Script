import type { MicrosoftRewardsBot } from '../../../index'
import type { Counters, DashboardImpression } from '../../../interface/DashboardData'
import type { MissingSearchPoints } from '../../../interface/Points'

export interface SearchQuota {
    earned: number
    max: number
    remaining: number
}

export interface SearchQuotas {
    mobile: SearchQuota
    desktop: SearchQuota
    edge: SearchQuota
}

export class SearchProgress {
    constructor(private readonly bot: MicrosoftRewardsBot) {}

    public async getCounters(): Promise<Counters> {
        const dashboard = await this.bot.browser.func.getDashboardData()
        return dashboard.dashboard.userStatus.counters
    }

    public async getMissing(isMobile: boolean): Promise<MissingSearchPoints> {
        return this.calculateMissing(await this.getCounters(), isMobile)
    }

    /**
     * counters 是服务器计数器，isMobile 决定 totalPoints 使用哪个平台。
     * 返回各平台缺口；桌面总缺口包含单独识别的 Edge 配额。
     */
    public calculateMissing(counters: Counters, isMobile: boolean): MissingSearchPoints {
        const quotas = this.calculateQuotas(counters)
        const mobilePoints = quotas.mobile.remaining
        const desktopPoints = quotas.desktop.remaining
        const edgePoints = quotas.edge.remaining

        return {
            mobilePoints,
            desktopPoints,
            edgePoints,
            totalPoints: isMobile ? mobilePoints : desktopPoints + edgePoints
        }
    }

    /**
     * 把 pcSearch 中显式标记 Edge 的项分出，避免桌面与 Edge 重复统计。
     * mobileSearch 全部汇总，不能假定每个平台只有第一个计数器有效。
     */
    public calculateQuotas(counters: Counters): SearchQuotas {
        const pcCounters = counters.pcSearch ?? []
        const explicitEdgeCounters = pcCounters.filter(counter => this.isEdgeCounter(counter))
        const desktopCounters = explicitEdgeCounters.length
            ? pcCounters.filter(counter => !this.isEdgeCounter(counter))
            : pcCounters

        return {
            mobile: this.summarize(counters.mobileSearch ?? []),
            desktop: this.summarize(desktopCounters),
            edge: this.summarize(explicitEdgeCounters)
        }
    }

    /**
     * 把每项最大值限制到非负，已得值限制在 0 到最大值之间，再求和。
     * 这是对服务器异常值的容错；返回 earned、max、remaining，而非搜索次数。
     */
    private summarize(counters: DashboardImpression[]): SearchQuota {
        return counters.reduce<SearchQuota>(
            (quota, counter) => {
                const max = Math.max(0, Number(counter.pointProgressMax) || 0)
                const earned = Math.min(max, Math.max(0, Number(counter.pointProgress) || 0))
                quota.earned += earned
                quota.max += max
                quota.remaining += max - earned
                return quota
            },
            { earned: 0, max: 0, remaining: 0 }
        )
    }

    private isEdgeCounter(counter: DashboardImpression): boolean {
        return [counter.offerId, counter.name, counter.title, counter.promotionSubtype].some(
            value => typeof value === 'string' && /(^|[_\s-])edge([_\s-]|$)/i.test(value)
        )
    }
}

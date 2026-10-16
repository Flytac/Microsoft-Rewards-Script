import type { MicrosoftRewardsBot } from '../index'

import { DailySet } from './activities/rewards/DailySet'
import { MorePromotions } from './activities/rewards/MorePromotions'
import { PunchCards } from './activities/rewards/PunchCards'

import { DailyCheckIn } from './activities/app/DailyCheckIn'
import { ReadToEarn } from './activities/app/ReadToEarn'
import { AppReward } from './activities/app/AppReward'
import { AppPromotions } from './activities/app/AppPromotions'

import { UrlReward } from './activities/api/UrlReward'
import { ClaimBonusPoints } from './activities/api/ClaimBonusPoints'
import { EnsureStreakProtection } from './activities/api/EnsureStreakProtection'
import { ClaimReward } from './activities/api/ClaimReward'
import { ActivateSearchPerk } from './activities/api/ActivateSearchPerk'
import { VisualSearch } from './activities/visualSearch/VisualSearch'

import { Search as BrowserSearch } from './activities/search/BrowserSearch'
import { SearchOnBing as BrowserSearchOnBing } from './activities/search/BrowserSearchOnBing'

import { ApiSearch } from './activities/experimental/ApiSearch'
import { ApiSearchOnBing } from './activities/experimental/ApiSearchOnBing'
import { EdgeBrowsing } from './activities/experimental/EdgeBrowsing'

import type { Page } from 'patchright'
import type { BasePromotion, DashboardData } from '../interface/DashboardData'
import type { AppDashboardData, Promotion } from '../interface/AppDashBoardData'
import type { QuestChild } from '../browser/ReactFunc'

/**
 * 活动门面：主流程只调用 doXxx，具体任务在各目录独立实现。
 * 持有同一个 bot 以共享配置、HTTP 与统计；这里按实验开关选择实现，不应在调用方复制判断。
 */
export default class Activities {
    private bot: MicrosoftRewardsBot

    constructor(bot: MicrosoftRewardsBot) {
        this.bot = bot
    }

    /**
     * page 为浏览器页，isMobile 为设备类型；返回本次搜索实现报告的积分数。
     * API 路径不使用 page，浏览器路径会使用；保持相同接口便于上层统一调度。
     */
    doSearch = async (page: Page, isMobile: boolean): Promise<number> => {
        if (this.bot.config.experimental.apiSearch) {
            return await new ApiSearch(this.bot).doSearch(isMobile)
        }
        return await new BrowserSearch(this.bot).doSearch(page, isMobile)
    }

    doBonusSearches = async (page: Page): Promise<number> => {
        if (this.bot.config.experimental.apiSearch) {
            return await new ApiSearch(this.bot).doBonusSearches()
        }
        return await new BrowserSearch(this.bot).doBonusSearches(page)
    }

    /**
     * promotion 是活动元数据，page 为当前页；完成后无业务返回值。
     * 实验路径执行后立即 return，避免同一活动再重复执行浏览器版本。
     */
    doSearchOnBing = async (promotion: BasePromotion, page: Page): Promise<void> => {
        if (this.bot.config.experimental.apiSearchOnBing) {
            await new ApiSearchOnBing(this.bot).doSearchOnBing(promotion)
            return
        }
        await new BrowserSearchOnBing(this.bot).doSearchOnBing(promotion, page)
    }

    doDailySet = async (data: DashboardData): Promise<void> => {
        await new DailySet(this.bot).run(data)
    }

    doMorePromotions = async (data: DashboardData): Promise<void> => {
        await new MorePromotions(this.bot).run(data)
    }

    doPunchCardsMobile = async (data: DashboardData): Promise<void> => {
        await new PunchCards(this.bot).runMobile(data)
    }

    doPunchCardsDesktop = async (): Promise<void> => {
        await new PunchCards(this.bot).runDesktop()
    }

    doUrlReward = async (promotion: BasePromotion): Promise<void> => {
        const urlReward = new UrlReward(this.bot)
        await urlReward.doUrlReward(promotion)
    }

    doClaimBonusPoints = async (): Promise<void> => {
        const claimBonusPoints = new ClaimBonusPoints(this.bot)
        await claimBonusPoints.claimBonusPoints()
    }

    doEnsureStreakProtection = async (): Promise<void> => {
        const ensureStreakProtection = new EnsureStreakProtection(this.bot)
        await ensureStreakProtection.ensureStreakProtection()
    }

    doClaimReward = async (child: QuestChild, parentId: string): Promise<void> => {
        const claimReward = new ClaimReward(this.bot)
        await claimReward.claimReward(child, parentId)
    }

    doActivateSearchPerk = async (data: DashboardData): Promise<void> => {
        const activateSearchPerk = new ActivateSearchPerk(this.bot)
        await activateSearchPerk.activate(data)
    }

    doVisualSearch = async (data: DashboardData): Promise<number> => {
        const visualSearch = new VisualSearch(this.bot)
        return await visualSearch.doVisualSearch(data)
    }

    doAppReward = async (promotion: Promotion): Promise<void> => {
        const urlReward = new AppReward(this.bot)
        await urlReward.doAppReward(promotion)
    }

    doReadToEarn = async (): Promise<void> => {
        const readToEarn = new ReadToEarn(this.bot)
        await readToEarn.doReadToEarn()
    }

    doDailyCheckIn = async (): Promise<void> => {
        const dailyCheckIn = new DailyCheckIn(this.bot)
        await dailyCheckIn.doDailyCheckIn()
    }

    doAppPromotions = async (data: AppDashboardData): Promise<void> => {
        await new AppPromotions(this.bot).run(data)
    }

    doEdgeBrowsing = async (data: DashboardData, signal?: AbortSignal): Promise<void> => {
        const edgeBrowsing = new EdgeBrowsing(this.bot)
        await edgeBrowsing.run(data, signal)
    }
}

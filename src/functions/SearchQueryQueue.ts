import type { MicrosoftRewardsBot } from '../index'
import { normalizeQueryKey, QueryCore } from './QueryEngine'

export class SearchQueryQueue {
    private topics: string[] = []
    private topicIndex = 0
    private activeCluster: string[] = []
    private activeMainTopic = ''
    private activeClusterSize = 0
    private activeClusterIndex = 0
    private readonly seenTopics = new Set<string>()
    private readonly seenQueries = new Set<string>()
    private refillCount = 0

    constructor(
        private readonly bot: MicrosoftRewardsBot,
        private readonly queryCore = new QueryCore(bot)
    ) {}

    /**
     * 按需初始化主题池，返回主题数；不预先获取所有主题的建议词，避免启动时集中网络请求。
     */
    async prepare(): Promise<number> {
        if (!this.topics.length) await this.refillTopics()
        this.bot.logger.debug(
            this.bot.isMobile,
            'QUERY-QUEUE',
            `Queue prepared | mainTopics=${this.topics.length} | clusterSearch=${this.bot.config.searchSettings.clusterSearch}`
        )
        return this.topics.length
    }

    /**
     * 返回下一个查询词，确实没有新主题/查询时返回 null。
     * 先耗尽当前主题簇再扩展下一个；seenQueries 在入队时记录，防止不同主题生成重复词。
     */
    async next(): Promise<string | null> {
        while (!this.activeCluster.length) {
            if (this.activeMainTopic) {
                this.bot.logger.debug(
                    this.bot.isMobile,
                    'QUERY-QUEUE',
                    `Cluster exhausted | main="${this.activeMainTopic}" | emitted=${this.activeClusterIndex}/${this.activeClusterSize}`
                )
            }

            const mainTopic = await this.nextMainTopic()
            if (!mainTopic) {
                this.bot.logger.debug(
                    this.bot.isMobile,
                    'QUERY-QUEUE',
                    `Queue exhausted | topicsSeen=${this.seenTopics.size} | queriesSeen=${this.seenQueries.size}`
                )
                return null
            }

            const cluster = await this.queryCore.getSearchCluster(mainTopic)
            let skippedSeen = 0
            this.activeCluster = cluster.filter(query => {
                const key = normalizeQueryKey(query)
                if (!key || this.seenQueries.has(key)) {
                    skippedSeen++
                    return false
                }
                this.seenQueries.add(key)
                return true
            })
            this.activeMainTopic = mainTopic
            this.activeClusterSize = this.activeCluster.length
            this.activeClusterIndex = 0

            this.bot.logger.debug(
                this.bot.isMobile,
                'QUERY-QUEUE',
                `Cluster activated | main="${mainTopic}" | topic=${this.topicIndex}/${this.topics.length} | received=${cluster.length} | queued=${this.activeCluster.length} | skippedSeen=${skippedSeen}`
            )
        }

        const query = this.activeCluster.shift() ?? null
        if (!query) return null

        this.activeClusterIndex++
        this.bot.logger.debug(
            this.bot.isMobile,
            'QUERY-QUEUE',
            `Dequeued query | main="${this.activeMainTopic}" | query=${this.activeClusterIndex}/${this.activeClusterSize} | remaining=${this.activeCluster.length} | value="${query}"`
        )
        return query
    }

    private async nextMainTopic(): Promise<string | null> {
        while (this.topicIndex >= this.topics.length) {
            if ((await this.refillTopics()) === 0) return null
        }

        const topic = this.topics[this.topicIndex++]
        if (!topic) return null

        this.seenTopics.add(normalizeQueryKey(topic))
        return topic
    }

    /**
     * 首次读取允许复用主题缓存，之后请求刷新；排除见过的主题并重置索引。
     * 返回新增可用主题数，零值让上层结束，避免无新内容时无限补充。
     */
    private async refillTopics(): Promise<number> {
        const topics = await this.queryCore.getConfiguredSearchTopics(this.refillCount > 0)
        this.refillCount++
        this.topics = topics.filter(topic => {
            const key = normalizeQueryKey(topic)
            return key.length > 0 && !this.seenTopics.has(key)
        })
        this.topicIndex = 0
        this.bot.logger.debug(
            this.bot.isMobile,
            'QUERY-QUEUE',
            `Topic pool refilled | received=${topics.length} | queued=${this.topics.length} | previouslySeen=${this.seenTopics.size}`
        )
        return this.topics.length
    }
}

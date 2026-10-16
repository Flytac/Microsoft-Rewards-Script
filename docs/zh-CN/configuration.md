# 配置逐项中文解释

[返回首页](../../README.md)

本文默认值直接对照 v4 / 4.3.2 的 `config.example.json`。这里解释所有叶子字段；实际配置仍使用英文键名。时间字符串中 `sec` 为秒、`min` 为分钟。

## config.json 字段

`workers` 决定运行哪类任务，`activities` 决定活动处理类型，`searchSettings` 决定搜索过程，`experimental` 是默认关闭的实验功能，`webhook` 决定通知发送方式。开关设为 true 只是允许执行，不保证账号上有对应活动。

| 配置键 | 示例默认值 | 中文说明 |
| --- | --- | --- |
| `sessionPath` | `"sessions"` | 保存浏览器会话的目录 |
| `headless` | `false` | 是否隐藏浏览器窗口；Docker 中使用无头模式 |
| `clusters` | `1` | 同时运行的账号集群数量，越大越占资源 |
| `errorDiagnostics` | `false` | 保存错误或未知登录页面的诊断资料 |
| `ensureStreakProtection` | `true` | 尝试开启连续签到保护 |
| `autoClaimPunchcardRewards` | `false` | 自动领取已经完成的打卡卡片奖励 |
| `contintueOnBotWarning` | `false` | 收到微软机器人评分警告后仍继续；上游不推荐开启。键名拼写就是 contintue，不要自行纠正 |
| `skipNonPointTasks` | `true` | 跳过没有积分奖励的任务 |
| `accountDelay.min` | `"1min"` | 开始下一个配置账号前的最短等待 |
| `accountDelay.max` | `"3min"` | 开始下一个配置账号前的最长等待 |
| `workers.doDailySet` | `true` | 每日任务组 |
| `workers.doClaimBonusPoints` | `true` | 领取额外积分 |
| `workers.doMorePromotions` | `true` | 更多活动 |
| `workers.doPunchCards` | `true` | 打卡卡片任务 |
| `workers.doAppPromotions` | `true` | 移动应用活动 |
| `workers.doDesktopSearch` | `true` | 电脑端搜索 |
| `workers.doMobileSearch` | `true` | 移动端搜索 |
| `workers.doBonusSearches` | `false` | 常规上限后的额外搜索任务 |
| `workers.doDailyCheckIn` | `true` | 每日签到 |
| `workers.doReadToEarn` | `true` | 阅读赚积分 |
| `workers.doActivateSearchPerk` | `true` | 出现搜索加成时激活，位于每日任务之后 |
| `workers.doVisualSearch` | `false` | 视觉搜索活动与连续记录 |
| `activities.urlReward` | `true` | 链接奖励类活动 |
| `activities.searchOnBing` | `true` | ExploreOnBing 探索搜索活动 |
| `searchOnBingLocalQueries` | `false` | ExploreOnBing 使用本地查询列表 |
| `globalTimeout` | `"30sec"` | 通用操作超时 |
| `searchSettings.scrollRandomResults` | `false` | 随机滚动搜索结果 |
| `searchSettings.clickRandomResults` | `false` | 随机点击搜索结果链接 |
| `searchSettings.runOnZeroPoints` | `false` | 没有剩余搜索积分时仍搜索 |
| `searchSettings.maxBonusSearches` | `110` | 开启 doBonusSearches 后，每轮最多额外搜索次数 |
| `searchSettings.parallelSearching` | `true` | 电脑和移动搜索可并行 |
| `searchSettings.clusterSearch` | `true` | 按主题扩展 Bing 建议词并分组搜索 |
| `searchSettings.queryEngines` | `["google","wikipedia","wikirandom","hackernews","reddit","local","rss.googleTrends","rss.googleNews","rss.bbc","rss.guardian.world","rss.theVerge.all"]` | 搜索主题来源数组，具体来源见首页 |
| `searchSettings.searchResultVisitTime` | `"10sec"` | 每个搜索结果停留时间 |
| `searchSettings.searchDelay.min` | `"30sec"` | 搜索间隔下限 |
| `searchSettings.searchDelay.max` | `"1min"` | 搜索间隔上限 |
| `searchSettings.readDelay.min` | `"30sec"` | 阅读等待下限 |
| `searchSettings.readDelay.max` | `"1min"` | 阅读等待上限 |
| `experimental.apiSearch` | `false` | 实验性：通过 HTTP 完成 Bing 搜索 |
| `experimental.apiSearchOnBing` | `false` | 实验性：通过 HTTP 完成 ExploreOnBing，无法计分时可关闭退回浏览器路径 |
| `experimental.blockMedia` | `false` | 实验性：阻止浏览器图片与媒体请求；自动登录验证并保存会话后才启用，手动登录期间不启用 |
| `experimental.edgeBrowsing` | `false` | 实验性：后台报告 Edge 浏览活动；前台活动结束后仍可能等待该任务完成 |
| `debugLogs` | `false` | 输出调试日志 |
| `consoleLogFilter.enabled` | `false` | 启用控制台日志过滤 |
| `consoleLogFilter.mode` | `"whitelist"` | whitelist 为白名单，blacklist 为黑名单 |
| `consoleLogFilter.levels` | `["error","warn"]` | 按日志级别过滤，如 error 错误、warn 警告 |
| `consoleLogFilter.keywords` | `["starting account","Fraud_UserWarning_BotScore_UX"]` | 按原文关键词过滤，不要把关键词翻译成中文 |
| `consoleLogFilter.regexPatterns` | `[]` | 正则表达式过滤规则，在 JSON 中设置 |
| `proxy.queryEngine` | `true` | 搜索主题来源 HTTP 请求使用账号 HTTP 代理；还需要 ACCOUNT_N_PROXY_HTTP=true 与有效代理信息 |
| `proxy.ignoreCertificateErrors` | `false` | 忽略浏览器 TLS 证书错误，会削弱证书验证；普通代理保持 false |
| `webhook.discord.enabled` | `false` | 启用 Discord 通知 |
| `webhook.discord.url` | `""` | Discord Webhook 地址 |
| `webhook.telegram.enabled` | `false` | 启用 Telegram 通知 |
| `webhook.telegram.botToken` | `""` | Telegram 机器人令牌 |
| `webhook.telegram.chatId` | `""` | 接收通知的聊天 ID |
| `webhook.ntfy.enabled` | `false` | 启用 ntfy 推送 |
| `webhook.ntfy.url` | `""` | ntfy 服务器地址 |
| `webhook.ntfy.topic` | `""` | ntfy 主题 |
| `webhook.ntfy.token` | `""` | ntfy 认证令牌 |
| `webhook.ntfy.title` | `"Microsoft-Rewards-Script"` | 通知标题 |
| `webhook.ntfy.tags` | `["bot","notify"]` | 通知标签 |
| `webhook.ntfy.priority` | `3` | 通知优先级，1 到 5 |
| `webhook.webhookLogFilter.enabled` | `false` | 启用通知日志过滤；ntfy 建议开启，否则可能每条日志都推送 |
| `webhook.webhookLogFilter.mode` | `"whitelist"` | 通知过滤模式：白名单或黑名单 |
| `webhook.webhookLogFilter.levels` | `["error"]` | 通知的日志级别过滤条件 |
| `webhook.webhookLogFilter.keywords` | `["starting account","select number","collected","Fraud_UserWarning_BotScore_UX"]` | 通知关键词过滤，保留英文原文以匹配日志 |
| `webhook.webhookLogFilter.regexPatterns` | `[]` | 通知正则过滤条件，在 JSON 中设置 |

注意：上游英文 README 的部分日志关键词默认值与示例 JSON 不完全一致，本表采用示例 JSON 的值，包括 `Fraud_UserWarning_BotScore_UX`。

## .env 账号字段

下表中的 `N` 替换为正整数，例如 `ACCOUNT_1_EMAIL`。编号可以跳过，程序按编号升序读取。至少需要一个非空邮箱。

| 字段 | 含义与默认行为 |
| --- | --- |
| ACCOUNT_N_EMAIL | Microsoft 账号邮箱，必填 |
| ACCOUNT_N_PASSWORD | 可选密码；无密码/Authenticator-only 账号可以不设置 |
| ACCOUNT_N_TOTP_SECRET | 可选的 TOTP 验证器共享密钥，用来生成动态验证码；不是当前六位验证码 |
| ACCOUNT_N_RECOVERY_EMAIL | 可选的恢复邮箱 |
| ACCOUNT_N_GEO_LOCALE | 两位国家/地区代码，默认 auto，成功读取微软资料后缓存地区 |
| ACCOUNT_N_LANG_CODE | BCP 47 语言标签，默认 en，例如 zh-CN；会影响指纹及请求语言，不会将本项目日志变成中文 |
| ACCOUNT_N_PROXY_HTTP | 默认 false；是否让相关 HTTP 请求可使用账号代理 |
| ACCOUNT_N_PROXY_URL | 浏览器代理地址，支持 http/https/socks4/socks5 |
| ACCOUNT_N_PROXY_PORT | 代理端口；示例为 0，不是可直接使用的真实代理端口 |
| ACCOUNT_N_PROXY_USERNAME | 可选 HTTP(S) 代理用户名 |
| ACCOUNT_N_PROXY_PASSWORD | 可选 HTTP(S) 代理密码 |
| ACCOUNT_N_SAVE_FINGERPRINT_MOBILE | 默认 false，是否保存移动端指纹以便后续复用 |
| ACCOUNT_N_SAVE_FINGERPRINT_DESKTOP | 默认 false，是否保存电脑端指纹以便后续复用 |
| API_TOKEN | Control API 的认证令牌，不是 Microsoft 登录令牌 |

浏览器代理与搜索主题来源的 HTTP 代理开关是不同层面的设置。SOCKS 浏览器代理不支持用户名密码认证；错误协议、端口、只填一半的认证信息等会在账号校验阶段被拒绝。

地区和语言会用于浏览器指纹、Accept-Language 和部分请求。修改地区/语言时，不兼容的已保存指纹会被替换。这里解释字段用途，不代表修改地区就能获得其他地区资格。

`.env`、会话、TOTP 密钥、通知令牌都应只保留在本机或受控服务器上，不能提交到公开 fork。此中文仓库只包含占位示例。

## JSON 怎么读

```json
{
  "headless": false,
  "clusters": 1,
  "accountDelay": {
    "min": "1min",
    "max": "3min"
  }
}
```

这是解释用的局部片段，不是完整可运行配置。它表示显示浏览器窗口、一个账号集群、账号切换时等待一到三分钟。实际应复制完整 `config.example.json` 后编辑。

- `"文字"`：字符串，需要英文双引号。
- `true/false`：布尔开关，不加引号。
- `1`：数字。
- `[...]`：数组，例如多个搜索来源。
- `{...}`：对象，例如一个配置分组。

## Docker 的覆盖规则

本机主要编辑根目录 `config.json`；Docker 将生成的文件放在挂载的 `./config/config.json`。容器中的 `CONFIG_*` 值优先于文件值，不要同时在多处设置同一选项而忘记优先级。

常用映射如下。完整映射见 [保留的上游配置表](../../README.en.md#configuration-options)及源码 `src/util/ConfigEnvOverrides.ts`。

| JSON 键 | Docker 环境变量 |
| --- | --- |
| clusters | CONFIG_CLUSTERS |
| accountDelay.min / max | CONFIG_ACCOUNT_DELAY_MIN / CONFIG_ACCOUNT_DELAY_MAX |
| workers.doDailySet | CONFIG_WORKER_DAILY_SET |
| workers.doDesktopSearch | CONFIG_WORKER_DESKTOP_SEARCH |
| workers.doMobileSearch | CONFIG_WORKER_MOBILE_SEARCH |
| globalTimeout | CONFIG_GLOBAL_TIMEOUT |
| debugLogs | CONFIG_DEBUG_LOGS |
| searchSettings.queryEngines | CONFIG_SEARCH_QUERY_ENGINES |
| experimental.blockMedia | CONFIG_EXPERIMENTAL_BLOCK_MEDIA |
| contintueOnBotWarning | CONFIG_CONTINTUE_ON_BOT_WARNING |

Docker 数组写成逗号分隔的字符串，例如 `CONFIG_SEARCH_QUERY_ENGINES: 'google,local'`；正则表达式直接放在 JSON 中。compose 中被 `#` 注释的行不会生效。

## 实验功能的边界

媒体拦截不保证所有网站都更快：启用请求路由时浏览器 HTTP 缓存会受影响，而且有些页面依赖图片加载事件。手动登录期间保持媒体可用；打开既有会话的 `open-session` 工具则会立即应用所配置的拦截器。

API 搜索依赖新版仪表盘接口，服务端更新后可能失效。先检查具体请求和计分结果，不要把更快的 HTTP 响应当作活动成功。

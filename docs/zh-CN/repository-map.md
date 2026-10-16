# 全仓库阅读地图

[返回首页](../../README.md)

基于开始中文化时的 94db205 提交，列出全部 123 个文件。新增学习文档从[学习目录](learning/README.md)进入。不是所有文件都适合逐行加注释：数据词库、锁文件、许可证保持原样，主要调用链注释见实施记录。

## 入口与构建

依文件名查看安装、配置、编译、容器或发布设置；配置/许可证保持原版。

- [.dockerignore](../../.dockerignore)
- [.gitattributes](../../.gitattributes)
- [.github/workflows/auto-release.yml](../../.github/workflows/auto-release.yml)
- [.github/workflows/format-check.yml](../../.github/workflows/format-check.yml)
- [.github/workflows/format-main.yml](../../.github/workflows/format-main.yml)
- [.gitignore](../../.gitignore)
- [.prettierrc](../../.prettierrc)
- [Dockerfile](../../Dockerfile)
- [LICENSE](../../LICENSE)
- [README.en.md](../../README.en.md)
- [README.md](../../README.md)
- [compose.yaml](../../compose.yaml)
- [config.example.json](../../config.example.json)
- [env.example](../../env.example)
- [eslint.config.mjs](../../eslint.config.mjs)
- [flake.lock](../../flake.lock)
- [flake.nix](../../flake.nix)
- [package-lock.json](../../package-lock.json)
- [package.json](../../package.json)
- [tsconfig.json](../../tsconfig.json)

## 浏览器与认证

浏览器创建、页面适配、登录及设备描述。

- [src/browser/Browser.ts](../../src/browser/Browser.ts)
- [src/browser/BrowserFunc.ts](../../src/browser/BrowserFunc.ts)
- [src/browser/BrowserUtils.ts](../../src/browser/BrowserUtils.ts)
- [src/browser/FlyoutDashboard.ts](../../src/browser/FlyoutDashboard.ts)
- [src/browser/MediaBlocker.ts](../../src/browser/MediaBlocker.ts)
- [src/browser/ReactFunc.ts](../../src/browser/ReactFunc.ts)
- [src/browser/UserAgent.ts](../../src/browser/UserAgent.ts)
- [src/browser/auth/Login.ts](../../src/browser/auth/Login.ts)
- [src/browser/auth/methods/EmailLogin.ts](../../src/browser/auth/methods/EmailLogin.ts)
- [src/browser/auth/methods/GetACodeLogin.ts](../../src/browser/auth/methods/GetACodeLogin.ts)
- [src/browser/auth/methods/LoginUtils.ts](../../src/browser/auth/methods/LoginUtils.ts)
- [src/browser/auth/methods/MobileAccessLogin.ts](../../src/browser/auth/methods/MobileAccessLogin.ts)
- [src/browser/auth/methods/PasswordlessLogin.ts](../../src/browser/auth/methods/PasswordlessLogin.ts)
- [src/browser/auth/methods/RecoveryEmailLogin.ts](../../src/browser/auth/methods/RecoveryEmailLogin.ts)
- [src/browser/auth/methods/Totp2FALogin.ts](../../src/browser/auth/methods/Totp2FALogin.ts)

## 任务与查询

活动处理、搜索调度、查询词数据与实验路径。

- [src/functions/Activities.ts](../../src/functions/Activities.ts)
- [src/functions/QueryEngine.ts](../../src/functions/QueryEngine.ts)
- [src/functions/SearchQueryQueue.ts](../../src/functions/SearchQueryQueue.ts)
- [src/functions/activities/BaseActivity.ts](../../src/functions/activities/BaseActivity.ts)
- [src/functions/activities/api/ActivateSearchPerk.ts](../../src/functions/activities/api/ActivateSearchPerk.ts)
- [src/functions/activities/api/ClaimBonusPoints.ts](../../src/functions/activities/api/ClaimBonusPoints.ts)
- [src/functions/activities/api/ClaimReward.ts](../../src/functions/activities/api/ClaimReward.ts)
- [src/functions/activities/api/EnsureStreakProtection.ts](../../src/functions/activities/api/EnsureStreakProtection.ts)
- [src/functions/activities/api/UrlReward.ts](../../src/functions/activities/api/UrlReward.ts)
- [src/functions/activities/app/AppPromotions.ts](../../src/functions/activities/app/AppPromotions.ts)
- [src/functions/activities/app/AppReward.ts](../../src/functions/activities/app/AppReward.ts)
- [src/functions/activities/app/DailyCheckIn.ts](../../src/functions/activities/app/DailyCheckIn.ts)
- [src/functions/activities/app/ReadToEarn.ts](../../src/functions/activities/app/ReadToEarn.ts)
- [src/functions/activities/experimental/ApiSearch.ts](../../src/functions/activities/experimental/ApiSearch.ts)
- [src/functions/activities/experimental/ApiSearchOnBing.ts](../../src/functions/activities/experimental/ApiSearchOnBing.ts)
- [src/functions/activities/experimental/BingSearchApi.ts](../../src/functions/activities/experimental/BingSearchApi.ts)
- [src/functions/activities/experimental/EdgeBrowsing.ts](../../src/functions/activities/experimental/EdgeBrowsing.ts)
- [src/functions/activities/experimental/EdgeBrowsingProgress.ts](../../src/functions/activities/experimental/EdgeBrowsingProgress.ts)
- [src/functions/activities/rewards/DailySet.ts](../../src/functions/activities/rewards/DailySet.ts)
- [src/functions/activities/rewards/MorePromotions.ts](../../src/functions/activities/rewards/MorePromotions.ts)
- [src/functions/activities/rewards/PromotionActivityRunner.ts](../../src/functions/activities/rewards/PromotionActivityRunner.ts)
- [src/functions/activities/rewards/PunchCards.ts](../../src/functions/activities/rewards/PunchCards.ts)
- [src/functions/activities/search/BonusTracker.ts](../../src/functions/activities/search/BonusTracker.ts)
- [src/functions/activities/search/BrowserSearch.ts](../../src/functions/activities/search/BrowserSearch.ts)
- [src/functions/activities/search/BrowserSearchOnBing.ts](../../src/functions/activities/search/BrowserSearchOnBing.ts)
- [src/functions/activities/search/SearchManager.ts](../../src/functions/activities/search/SearchManager.ts)
- [src/functions/activities/search/SearchOnBingShared.ts](../../src/functions/activities/search/SearchOnBingShared.ts)
- [src/functions/activities/search/SearchProgress.ts](../../src/functions/activities/search/SearchProgress.ts)
- [src/functions/activities/visualSearch/VisualSearch.ts](../../src/functions/activities/visualSearch/VisualSearch.ts)
- [src/functions/activities/visualSearch/VisualSearchBrowser.ts](../../src/functions/activities/visualSearch/VisualSearchBrowser.ts)
- [src/functions/bing-search-activity-queries.json](../../src/functions/bing-search-activity-queries.json)
- [src/functions/search-queries.json](../../src/functions/search-queries.json)

## 公共工具

配置、校验、HTTP、会话、地区、诊断等共享服务。

- [src/util/ConfigEnvOverrides.ts](../../src/util/ConfigEnvOverrides.ts)
- [src/util/ConfigSync.ts](../../src/util/ConfigSync.ts)
- [src/util/ErrorDiagnostic.ts](../../src/util/ErrorDiagnostic.ts)
- [src/util/Http.ts](../../src/util/Http.ts)
- [src/util/Load.ts](../../src/util/Load.ts)
- [src/util/Locale.ts](../../src/util/Locale.ts)
- [src/util/Proxy.ts](../../src/util/Proxy.ts)
- [src/util/SessionStore.ts](../../src/util/SessionStore.ts)
- [src/util/Utils.ts](../../src/util/Utils.ts)
- [src/util/Validator.ts](../../src/util/Validator.ts)

## 类型与常量

接口用于静态类型描述；常量保存 URL、浏览器版本与 RSS 来源。

- [src/constants/browserVersions.ts](../../src/constants/browserVersions.ts)
- [src/constants/rssFeeds.ts](../../src/constants/rssFeeds.ts)
- [src/constants/urls.ts](../../src/constants/urls.ts)
- [src/constants/userAgents.ts](../../src/constants/userAgents.ts)
- [src/interface/Account.ts](../../src/interface/Account.ts)
- [src/interface/AppDashBoardData.ts](../../src/interface/AppDashBoardData.ts)
- [src/interface/AppUserData.ts](../../src/interface/AppUserData.ts)
- [src/interface/Config.ts](../../src/interface/Config.ts)
- [src/interface/DashboardData.ts](../../src/interface/DashboardData.ts)
- [src/interface/OAuth.ts](../../src/interface/OAuth.ts)
- [src/interface/Points.ts](../../src/interface/Points.ts)
- [src/interface/Search.ts](../../src/interface/Search.ts)
- [src/interface/UserAgentUtil.ts](../../src/interface/UserAgentUtil.ts)

## 日志与通知

结构化英文输出、过滤和通知队列。

- [src/logging/Discord.ts](../../src/logging/Discord.ts)
- [src/logging/Logger.ts](../../src/logging/Logger.ts)
- [src/logging/Ntfy.ts](../../src/logging/Ntfy.ts)
- [src/logging/Queue.ts](../../src/logging/Queue.ts)
- [src/logging/Telegram.ts](../../src/logging/Telegram.ts)

## 控制服务与辅助工具

API、进程管理、手动登录、会话清理及部署脚本。

- [scripts/api/README.md](../../scripts/api/README.md)
- [scripts/api/accounts.js](../../scripts/api/accounts.js)
- [scripts/api/apply-schedule.js](../../scripts/api/apply-schedule.js)
- [scripts/api/configEditor.js](../../scripts/api/configEditor.js)
- [scripts/api/lib.js](../../scripts/api/lib.js)
- [scripts/api/logParser.js](../../scripts/api/logParser.js)
- [scripts/api/logParser.test.js](../../scripts/api/logParser.test.js)
- [scripts/api/processManager.js](../../scripts/api/processManager.js)
- [scripts/api/runCommand.js](../../scripts/api/runCommand.js)
- [scripts/api/scheduleStore.js](../../scripts/api/scheduleStore.js)
- [scripts/api/server.js](../../scripts/api/server.js)
- [scripts/api/sessionStore.js](../../scripts/api/sessionStore.js)
- [scripts/api/trigger.js](../../scripts/api/trigger.js)
- [scripts/docker/entrypoint.sh](../../scripts/docker/entrypoint.sh)
- [scripts/docker/healthcheck.sh](../../scripts/docker/healthcheck.sh)
- [scripts/docker/run_daily.sh](../../scripts/docker/run_daily.sh)
- [scripts/env.js](../../scripts/env.js)
- [scripts/main/browserSession.js](../../scripts/main/browserSession.js)
- [scripts/main/clearSessions.js](../../scripts/main/clearSessions.js)
- [scripts/main/copyAssets.js](../../scripts/main/copyAssets.js)
- [scripts/main/manualLogin.js](../../scripts/main/manualLogin.js)
- [scripts/nix/run.sh](../../scripts/nix/run.sh)
- [scripts/package.json](../../scripts/package.json)
- [scripts/utils.js](../../scripts/utils.js)

## 文档与其他

已有中文说明、调度模板等。

- [docs/zh-CN/architecture-and-api.md](../../docs/zh-CN/architecture-and-api.md)
- [docs/zh-CN/configuration.md](../../docs/zh-CN/configuration.md)
- [src/crontab.template](../../src/crontab.template)
- [src/index.ts](../../src/index.ts)

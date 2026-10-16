# 代码阅读与 Control API 入门

[返回首页](../../README.md) · [配置字段解释](configuration.md)

## 按什么顺序读源码

先看 `package.json` 的 scripts：`npm run start` 实际执行 `node ./dist/index.js`。dist 来自 src 的编译，因此主要阅读 `src/index.ts`。

| 阅读顺序 | 文件/目录 | 要弄懂的问题 |
| --- | --- | --- |
| 1 | src/util/Load.ts | .env 和 config.json 从哪里读取，账号怎么排序 |
| 2 | src/util/Validator.ts | 哪些配置有效，输入错误在哪里被拒绝 |
| 3 | src/index.ts | MicrosoftRewardsBot 如何组织运行 |
| 4 | src/browser/Browser.ts 与 src/browser/auth/ | 浏览器怎么创建，登录流程怎么处理 |
| 5 | src/functions/Activities.ts | 活动入口如何分发 |
| 6 | src/functions/activities/ | 每一种任务如何实现 |
| 7 | src/functions/QueryEngine.ts 与 SearchQueryQueue.ts | 搜索主题如何获取和排队 |
| 8 | src/logging/ | 日志、通知及队列如何处理 |
| 9 | scripts/api/server.js | 外部控制接口如何管理脚本进程 |

初学时先跟踪一条链：`workers.doDailySet` → 主程序条件判断 → `activities.doDailySet(data)` → `activities/rewards/DailySet.ts`。这样能把“配置开关”和“具体执行代码”联系起来。

## 一轮运行的概念流程

下面是帮助理解的概括，不表示所有模式都严格按同一顺序执行。主程序中普通浏览器路径与实验性 API 路径有不同分支。

```text
检查 Node.js 版本
        ↓
读取并校验配置、账号
        ↓
按集群设置组织账号执行
        ↓
建立浏览器上下文、登录或恢复会话
        ↓
读取 Rewards 数据与可用活动
        ↓
按开关执行活动、分别处理手机/电脑搜索配额
        ↓
统计结果、记录日志、发送启用的通知
        ↓
保存/关闭会话与浏览器，处理后续账号和退出
```

`src/index.ts` 中：

- `initialize()`：包含账号加载。
- `run()`、`runMaster()`：组织执行和集群工作。
- `runTasks()`：处理账号任务。
- `Main(account)`：一个账号的主要活动流程。
- `createDesktopSession()`：准备电脑端浏览器会话。
- `AsyncLocalStorage`：让并发流程知道自己正在操作哪个账号、哪一种设备上下文。

`Promise` 表示异步操作，`await` 表示等待该操作结果。并发任务不一定按日志显示顺序结束，所以排错时还要看账号与设备标签。

## 活动目录不是随便分的

| 子目录 | 职责 |
| --- | --- |
| rewards | 每日任务、更多活动、打卡卡片、共享活动分发 |
| api | 单个 Rewards HTTP 活动，如领取积分、开启保护 |
| app | 移动应用活动，如签到、阅读 |
| search | 浏览器搜索、进度和 ExploreOnBing 公共行为 |
| visualSearch | 视觉搜索与其浏览器交互 |
| experimental | API 搜索、API ExploreOnBing、Edge 浏览实验任务 |

`BrowserFunc` 主要承担共享的 Rewards、浏览器、会话通信能力，不是所有任务都写在里面。代码使用 HTTP 请求时，页面不一定出现可见点击动作。

## 配置读取的细节

`Load.ts` 查找文件的候选位置包括：当前工作目录、项目根目录、根目录下 dist 和 src。优先使用先找到的文件，所以通常只在项目根目录保留一份配置最容易排查。

`.env` 的值不会覆盖进程环境里已经存在的同名变量。账号邮箱变量按 `ACCOUNT_正整数_EMAIL` 匹配；空邮箱被忽略；编号按数值升序排列。

配置经过 JSON 解析与校验后缓存。改文件后需要重新启动，不是实时热更新。

## Control API、脚本、网页面板是什么关系

```text
网页面板或其他客户端
        │ HTTP 请求 + API 令牌
        ▼
scripts/api/server.js
        │ 启停子进程、解析输出
        ▼
正常的 Rewards 主程序
        │
        ▼
浏览器 / Microsoft 服务
```

API 是控制入口，不是网页界面。上游推荐的独立网页项目是 [Rewards Dashboard](https://github.com/mgrimace/rewards-dashboard)，本仓库不包含该面板的完整部署。

API 通过启动子进程运行脚本并解析日志。其日志缓存、运行状态、错误和历史记录在内存里，API 重启后会重置；它不会因此自动拥有长期数据库。

## 本机启动 API

先完成首页的安装、账号配置和构建。在项目 `.env` 中配置：

```dotenv
API_HOST=127.0.0.1
API_PORT=3010
API_TOKEN=替换为自己生成的随机长令牌
```

生成随机令牌的命令：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

然后执行：

```bash
npm run api
```

启动服务后，仍需调用 `POST /start` 才会运行本机任务。令牌改变后要重启 API。无令牌模式只适用于可信机器的回环接口，不要把无认证服务发布到公网。

下面是 PowerShell 示例，令牌应替换为本机实际配置，不能把示例文字原样当成有效令牌：

```powershell
$rewardsHeaders = @{ Authorization = "Bearer 替换为你的令牌" }
Invoke-RestMethod -Uri "http://127.0.0.1:3010/health" -Headers $rewardsHeaders
Invoke-RestMethod -Uri "http://127.0.0.1:3010/status" -Headers $rewardsHeaders
```

`/health` 返回 `ok: true` 表示 API 健康，`state: idle` 表示当前空闲；两者都不表示 Microsoft 登录或积分任务成功。

## 常用接口对照

| 请求 | 中文解释 |
| --- | --- |
| GET /health | 控制服务是否正常 |
| GET /status | 当前运行状态 |
| GET /points | 已解析的积分情况 |
| GET /logs | 日志缓存 |
| GET /errors | 近期错误 |
| GET /history | 内存中的已完成运行历史 |
| GET /accounts | 已配置账号的摘要 |
| GET /sessions | 保存会话的安全元数据，不返回 Cookie/指纹内容 |
| GET /diagnostics | 诊断资料列表 |
| GET /events | SSE 实时日志/状态事件流 |
| GET /config | 当前配置，敏感信息默认不直接揭示 |
| GET /schedule | 当前有效定时设置 |
| POST /start | 启动一次运行 |
| POST /stop | 停止当前任务 |
| POST /restart | 重启运行 |
| POST /shutdown | 关闭控制服务及相关运行 |
| DELETE /sessions/:email | 删除一个账号的移动/电脑会话 |
| PATCH /config | 部分修改配置，需要显式开启写权限 |
| PUT /config | 替换配置，需要显式开启写权限 |
| PATCH 或 PUT /schedule | 修改计划，需要显式开启计划写权限 |

启动全部账号的 JSON 请求体为 `{}`。只启动编号 2：

```powershell
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:3010/start" -Headers $rewardsHeaders -ContentType "application/json" -Body '{"accountIndex":2}'
```

`accountIndex: 2` 指 `ACCOUNT_2` 的编号，不是数组下标。“全部但排除 2、4”使用 `{"excludedAccountIndexes":[2,4]}`。它们是不同的选择方式，不要混用。请求真的会开始任务。

令牌可通过 `Authorization: Bearer ...` 或 `X-API-Key` 请求头发送。只有 `/events` 支持为浏览器 EventSource 使用 URL 参数令牌；其他请求优先使用请求头，避免令牌进入 URL 历史和代理日志。

## API 环境变量中文表

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| API_HOST | 127.0.0.1 | 监听地址 |
| API_PORT | 3010 | 监听端口 |
| API_TOKEN | 未设置 | 接口共享令牌，设置后所有接口均需认证 |
| API_CORS_ORIGIN | * | CORS 允许来源响应值，不能代替认证 |
| API_LOG_BUFFER | 2000 | 内存中最多保留的日志条数 |
| API_RUN_HISTORY | 20 | 内存中最多保留的完成记录数 |
| API_STOP_TIMEOUT_MS | 15000 | 优雅停止后转为强制终止前的等待毫秒数 |
| API_RUN_COMMAND | 自动 | 启动主脚本的可执行程序 |
| API_RUN_ARGS | 无 | 启动参数，支持空格分隔字符串或 JSON 数组 |
| API_DIAGNOSTICS_DIR | 仓库/diagnostics | 诊断资料目录 |
| API_ALLOW_CONFIG_WRITE | false | 允许修改 config.json |
| API_ALLOW_SCHEDULE_WRITE | false | 允许修改定时计划 |
| API_ALLOW_ENV_OVERRIDES | false | 允许 start/restart 请求传入 env 覆盖 |
| API_ALLOW_CONFIG_REVEAL | false | 允许认证后的 GET /config?reveal=1 |
| API_VALIDATOR_MODULE | 自动 | 导出配置校验函数或模式的编译模块路径 |
| SCHEDULE_FILE | 仓库/config/schedule.json | 持久化计划文件 |
| CRON_SCHEDULE | 未设置 | 没有已保存覆盖计划时的基础计划 |
| TZ | UTC | API 文档中的默认时区；仓库 compose 另设 America/Toronto |
| API_MODE | compose 中默认注释 | Docker 入口是否以 API 服务为主进程 |

API 的 `API_HOST` 和 `API_TOKEN` 环境值优先于同名命令行选项；`--port` 则优先于 `API_PORT`。修改计划的即时应用主要面向 Docker API 模式，不要以为本机单独开 API 就已安装 cron 调度器。

配置修改会尽力备份到 `config.json.bak`；计划写入 `config/schedule.json`，可跨容器重启保留；日志和运行历史仍是内存数据。

## 如何继续深读

本文覆盖常用概念与调用，完整字段、分页参数、响应 JSON 和错误码请对照 [API 原始参考](../../scripts/api/README.md)。源码与上游说明更新后，优先用当前源码确认行为。

本次中文化仅核对静态文件与配置，没有运行微软账号任务，也没有验证这些接口在你的电脑上的实际部署。

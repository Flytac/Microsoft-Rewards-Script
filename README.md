# Microsoft Rewards Script 中文学习版

这是 [TheNetsky/Microsoft-Rewards-Script](https://github.com/TheNetsky/Microsoft-Rewards-Script) 的 fork，增加面向初学者的中文说明。原作者与许可证保留，程序功能和配置键名保持原样。

文档对应：v4 分支、package.json 版本 4.3.2，核对日期 2026-10-16。上游基准提交：`d0f07d74a0ed4dda127855d6e3dde98bf4c89d6e`。以后同步上游时，需要重新核对说明。

## 从哪里开始读

1. 本页：理解用途、文件和运行步骤。
2. [配置逐项中文解释](docs/zh-CN/configuration.md)：每个配置键的默认值和含义。
3. [代码阅读与 API 入门](docs/zh-CN/architecture-and-api.md)：程序如何组织、接口如何使用。
4. [上游英文说明](README.en.md)：保留翻译前的原文，便于对照。
5. [完整 API 英文参考](scripts/api/README.md)：查阅所有请求字段、响应和边界条件。

## 它到底是什么

这是一个用 TypeScript 编写的自动化脚本。Node.js 负责执行程序，Patchright（与 Playwright 相关的浏览器自动化工具）负责操作 Chromium 浏览器；程序还会通过 HTTP 请求执行部分活动。

它读取你配置的 Microsoft 账号，登录 Rewards，检查可用活动和积分进度，再按照配置运行每日任务、签到、阅读、电脑或移动端搜索等操作。实际能否完成和获得积分取决于账号、地区、活动状态及微软接口，不能把“程序运行结束”等同于“积分到账”。

**版本区别：** 本分支只支持新版 Rewards 仪表盘。旧版界面使用上游 [v3 分支](https://github.com/TheNetsky/Microsoft-Rewards-Script/tree/v3)。

上游提醒：自动化 Microsoft Rewards 可能导致账号被暂停或封禁；软件用于学习，使用者自行承担风险。本次中文化没有登录账号，也没有验证积分获取。

## 先认识这些词

| 名称 | 通俗解释 |
| --- | --- |
| Fork | 在你的 GitHub 账号下保留一份与原仓库有关联的副本 |
| Clone | 把仓库文件和 Git 历史下载到电脑 |
| 分支 v4 | 同一个仓库中的一条版本开发线 |
| Node.js | 让电脑运行 JavaScript 的环境 |
| npm | 随 Node.js 提供的包管理工具，用于安装依赖、执行预定义命令 |
| TypeScript / .ts | 带类型信息的源码，通常先编译成 JavaScript 再执行 |
| headless | 浏览器运行但不显示窗口 |
| session | 保存的登录状态；与账号密码一样不适合公开 |
| API | 其他程序通过 HTTP 请求调用的控制入口 |
| Docker | 将程序及运行环境打包成容器的方式 |
| cron | 定时任务表达式，用来规定什么时候运行 |

## 哪个文件管什么

| 文件或目录 | 作用 |
| --- | --- |
| `env.example` → `.env` | 账号邮箱、可选密码、地区、代理等；只在自己的电脑/服务器填写 |
| `config.example.json` → `config.json` | 任务开关、等待时间、通知等 |
| `package.json` | 版本、依赖和 npm 命令清单 |
| `src/index.ts` | 主程序，组织账号、浏览器、任务和结果统计 |
| `src/browser/` | 浏览器与登录、页面和会话相关逻辑 |
| `src/functions/activities/` | 各种 Rewards 活动的具体实现 |
| `src/util/` | 配置读取、校验、HTTP、会话等公共功能 |
| `scripts/main/` | 构建资源复制、手动登录、会话管理工具 |
| `scripts/api/` | 可选的 HTTP 控制服务 |
| `scripts/docker/` | Docker 启动和运行辅助脚本 |
| `dist/` | 编译生成的 JavaScript，不是主要源码编辑位置 |
| `compose.yaml` | Docker 镜像、目录挂载、定时设置 |
| `sessions/` | 登录会话持久化目录 |
| `diagnostics/` | 开启诊断后保存的错误资料，分享前检查隐私 |

## 本机运行：每一步在做什么

前提：安装 **Node.js 24 或更新版本**以及 Git。支持 Windows、Linux、macOS、WSL。以下命令是说明，不代表本次已经替你安装或运行。

### 1. 下载自己的仓库

```bash
git clone https://github.com/Flytac/Microsoft-Rewards-Script.git
cd Microsoft-Rewards-Script
```

后续命令都在这个目录执行。可以先用 `node --version` 和 `npm --version` 检查环境。

### 2. 复制两个示例文件

Windows PowerShell：

```powershell
Copy-Item env.example .env
Copy-Item config.example.json config.json
```

Linux / macOS：

```bash
cp env.example .env
cp config.example.json config.json
```

这些复制命令只用于第一次配置；已有配置时不要直接覆盖。

用编辑器打开 `.env`，将 `ACCOUNT_1_EMAIL=email@example.com` 改为自己的邮箱。密码可选：使用无密码/Authenticator 登录的账号可以不填。更多字段见[配置文档](docs/zh-CN/configuration.md)。

`.env` 中以 `#` 开头的行是注释，不会生效。JSON 文件则不能直接添加 `// 中文说明`，也不能有多余的末尾逗号。布尔值写 `true` / `false`，不能写“开启/关闭”。

### 3. 安装、编译、启动

```bash
npm run pre-build
npm run build
npm run start
```

| 命令 | 实际作用 |
| --- | --- |
| `pre-build` | 安装 npm 依赖、清理旧 dist、下载 Patchright Chromium |
| `build` | 清理 dist、用 tsc 编译、复制搜索词 JSON 资源 |
| `start` | 执行 dist/index.js，开始实际运行 |
| `lint` | 静态检查代码 |
| `format:check` | 检查格式 |
| `api` | 启动控制服务，本机模式下不会立即开始积分任务 |

首次安装需要网络，浏览器下载会占用空间。看到安装成功只表示依赖就绪；还要区分编译成功、登录成功、活动完成、积分到账。

上游说明要求修改 `.env` 或配置后重新构建；按其流程执行 `npm run build` 再重启即可。源码 `src/util/Load.ts` 实际在进程启动后读取文件并缓存配置，因此不要期待编辑文件后正在运行的进程自动更新。

### 4. 需要人工登录时

在有桌面的电脑上执行：

```bash
npm run manual-login -- --email user@example.com
npm run manual-login -- --email user@example.com --platform desktop
npm run manual-login -- --email user@example.com --platform both
```

把邮箱换成 `.env` 中同一个账号。默认创建/刷新移动端会话；`desktop` 是电脑端；`both` 依次处理两端。命令打开浏览器，完成登录后，页面持续停留在 rewards.bing.com 五秒会保存会话并自动关闭。

`--fresh` 表示本次不恢复已有 Cookie。默认 Docker 镜像只有无头浏览器，不能显示这种交互窗口。会话固定指纹选项见配置文档。

### 5. 查看和清理登录状态

```bash
npm run clear-sessions -- list
npm run clear-sessions -- email user@example.com
```

第一条只列出会话；第二条删除指定账号的保存会话，会导致下次重新登录。另有 `npm run clear-sessions -- all` 删除全部会话，应明确需要时才使用。直接运行工具、不带参数只显示帮助。

## Docker 运行方式

仓库的 `compose.yaml` 默认使用上游预构建镜像 `ghcr.io/thenetsky/microsoft-rewards-script:4`。**Fork 不会自动改变镜像来源**；以后若修改业务代码，需要自行构建镜像才能运行修改后的版本。仅阅读中文文档不需要 Docker。

准备好 `.env` 后，阅读 compose 中这些字段：

| 字段 | 含义 |
| --- | --- |
| `TZ: America/Toronto` | 上游默认时区；如需香港时间可改为 `Asia/Hong_Kong` |
| `CRON_SCHEDULE: '0 7 * * *'` | 在所配置时区每天 07:00 触发计划 |
| `RUN_ON_START: 'true'` | 容器启动后也会触发运行 |
| `SKIP_RANDOM_SLEEP: 'false'` | 保留启动流程的随机等待，因此不一定恰好在触发时开始任务 |
| `./config` 挂载 | 保存容器使用的配置 |
| `./sessions` 挂载 | 保存会话，容器重建后仍可保留 |
| `restart: unless-stopped` | Docker 重启策略，不等于每日定时计划 |

```bash
docker compose up -d
docker compose logs -f
docker compose stop
```

分别表示后台启动、查看日志、停止容器。Docker 首次运行会生成 `./config/config.json`。`CONFIG_*` 环境变量每次启动覆盖文件中的对应值；如果改 JSON 后无效，先检查 compose 中有无覆盖项。改 compose 后用 `docker compose up -d` 应用变更并检查容器是否重建。

API 修改的计划保存在 `config/schedule.json`，优先于基础 `CRON_SCHEDULE`。更新配置前先备份，不要为解决一个字段问题直接删除全部配置。

## 搜索词从哪里来

`searchSettings.queryEngines` 选择主题来源：Google Trends、Wikipedia、Hacker News、Reddit、本地词库和 RSS。多个来源的主题会合并去重。

- `local`：`src/functions/search-queries.json`。
- `google`：Google Trends；`wikipedia`：前一天热门文章；`wikirandom`：随机文章。
- `hackernews` 和 `reddit`：相应站点的热门标题。
- `rss`：所有 RSS；`rss.bbc`：BBC 的全部配置源；`rss.guardian.world`：单个源。
- RSS 定义在 `src/constants/rssFeeds.ts`。
- `clusterSearch` 开启时，每个主题按需扩展 Bing 建议词，完成该主题后再处理下一个。

电脑和移动端搜索配额分别统计，一端完成不会让另一端直接跳过。`parallelSearching` 开启时可在独立浏览器上下文中并行处理。

## 常见问题怎么判断

| 现象 | 先检查什么 |
| --- | --- |
| node/npm 找不到 | Node.js 是否安装，终端是否重开，版本是否至少 24 |
| No accounts found in environment | .env 文件名、位置、ACCOUNT_N_EMAIL 是否有效且未被注释 |
| config.json not found | 是否复制示例到项目根目录，是否进入正确目录 |
| JSON 解析错误 | 是否混入注释、中文标点、末尾逗号或漏引号 |
| 找不到浏览器可执行文件 | pre-build 的浏览器下载是否成功；可执行 npm run install:browser |
| 登录反复失败 | 先看具体登录提示，再尝试手动登录；只清理有问题的账号会话 |
| 改配置没效果 | 是否重启进程，Docker CONFIG_* 是否覆盖该字段 |
| 启动 API 后没任务 | API 只是控制服务，需要通过 POST /start 或仪表盘启动 |
| API 返回 401 | 请求是否携带与服务端一致的令牌 |
| 任务完成但积分没变 | 查看服务端返回、活动状态、配额和具体错误；不要仅凭日志“结束”判断 |

## 许可证与中文化范围

保留原项目 [LICENSE](LICENSE)；package.json 声明 GPL-3.0-or-later。中文文档是基于上游说明和源码整理的学习材料，并非微软官方文档。

本次增加中文首页、完整示例配置字段解释、账号字段解释、代码阅读导航和常用 API 入门。英文原文另存，代码标识符、日志原文和运行逻辑保持原样，便于搜索错误及同步上游。

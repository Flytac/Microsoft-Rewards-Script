# Microsoft Rewards Script 中文版

**简体中文** · [English / 英文原版](README.en.md)

这是 [TheNetsky/Microsoft-Rewards-Script](https://github.com/TheNetsky/Microsoft-Rewards-Script) 的中文文档版，帮助中文用户部署、配置和使用现有 v4 程序。原作者 Netsky；保留 [GPL 许可证](LICENSE)。项目版本 **4.3.2**，文档核对日期 **2026-10-16**。

> 自动化 Microsoft Rewards 可能导致账号受限、封禁或积分损失。功能可用性由账号、地区、活动和微软接口决定，没有稳定到账或防封保证。请先阅读[账号限制与使用风险](docs/zh-CN/usage.md#账号限制与使用风险)。

## 选择部署方式

| 你的环境                | 教程                                                       | 需要安装                                                |
| ----------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| Windows，想看到登录窗口 | [Windows 原生运行](docs/zh-CN/deploy/windows.md)           | Node.js 24+、Git、Patchright Chromium；无需 Docker/WSL2 |
| Windows，习惯容器管理   | [Docker Desktop 部署](docs/zh-CN/deploy/docker-desktop.md) | Git、Docker Desktop 及可用的 Linux 容器后端             |
| Linux 服务器            | [Linux Docker 部署](docs/zh-CN/deploy/linux-docker.md)     | Docker Engine、Compose 插件、Git；宿主机无需 Node.js    |

首次使用建议在有桌面的电脑上确认登录。容器使用无头浏览器，不能显示手动登录窗口。此版本仅支持新版 Rewards 仪表盘；旧版请查看上游 v3，不要混用旧 accounts.json 配置。

## 功能与实际用途

| 功能                 | 用途                                                        | 相关配置                                                    |
| -------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| 每日任务、更多活动   | 处理账号上当前可用的日常活动                                | workers.doDailySet、doMorePromotions                        |
| 打卡、奖励、搜索加成 | 处理卡片任务、可领取积分及搜索加成                          | doPunchCards、doClaimBonusPoints、doActivateSearchPerk      |
| 电脑与移动搜索       | 分别检查剩余配额再执行                                      | doDesktopSearch、doMobileSearch                             |
| 应用签到和阅读       | App 令牌可用时处理签到、阅读和应用活动                      | doDailyCheckIn、doReadToEarn、doAppPromotions               |
| 会话保存             | 保存并复用登录状态，区分移动与电脑端                        | sessionPath、账号指纹保存选项                               |
| 定时运行             | 容器按时区/cron 触发；原生版另设系统计划                    | TZ、CRON_SCHEDULE                                           |
| 日志与通知           | 查看过程，选用 Discord / Telegram / ntfy 推送               | debugLogs、webhook                                          |
| 控制 API             | 查询状态、积分、日志，启动/停止任务                         | API_MODE、API_TOKEN                                         |
| 账号配置槽位         | 为符合规则的账号分别提供配置，不代表允许一人多 Rewards 账号 | ACCOUNT_N_*、clusters                                       |
| 实验功能             | API 搜索、媒体拦截、Edge 后台活动、视觉/额外搜索            | 见[完整配置表](docs/zh-CN/configuration.md)，首次保留默认值 |

开关 true 只表示允许尝试，不保证账号有对应活动或得到积分。电脑与移动配额独立统计；实验选项可能随网站变化失效。

## 首次使用

1. 选择一种部署教程，安装对应环境，确认版本命令可用。
2. 下载仓库，复制 env.example 为 .env，在本机填写一个账号。
3. 原生版复制 config.example.json 为 config.json；容器版由首次启动生成 config/config.json。
4. 检查任务开关、时区、计划；首次保持实验功能关闭。
5. 按教程安装/构建或拉取镜像，完成需要的认证后启动。
6. 查看账号、活动结果及实际余额，确认会话保存后再安排定时与通知。

[完整使用指南](docs/zh-CN/usage.md) · [常见问题 FAQ](docs/zh-CN/faq.md)

## Windows 原生快速开始

安装 Node.js 24+（含 npm）和 Git，再用 PowerShell 执行。已有配置不要重复复制覆盖。

```powershell
git clone --branch docs/zh-cn-deployment https://github.com/Flytac/Microsoft-Rewards-Script.git
cd Microsoft-Rewards-Script
Copy-Item env.example .env
Copy-Item config.example.json config.json
notepad .env
npm.cmd ci
npm.cmd run install:browser
npm.cmd run build
```

.env 至少填写自己的邮箱，密码是可选项：

```dotenv
ACCOUNT_1_EMAIL=your-account@example.com
# ACCOUNT_1_PASSWORD=replace-with-your-password
```

将以下占位邮箱替换为 .env 中的账号：

```powershell
npm.cmd run manual-login -- --email your-account@example.com --platform both
npm.cmd start
```

停止本轮任务按 Ctrl+C。更多安装结果、日志保存、更新与定时步骤见 [Windows 教程](docs/zh-CN/deploy/windows.md)。这里下载文档分支；合并后也可使用默认 v4。

## Docker 快速开始

按平台教程安装并启动 Docker，无需宿主机 Node.js：

```bash
git clone --branch docs/zh-cn-deployment https://github.com/Flytac/Microsoft-Rewards-Script.git
cd Microsoft-Rewards-Script
```

Windows 用 Copy-Item env.example .env，Linux 用 cp env.example .env；编辑账号并调整 compose.yaml 的 TZ、CRON_SCHEDULE。原样示例是多伦多时间每天 07:00，不会自动识别你的时区。

```bash
docker compose config --quiet
docker compose pull
docker compose up -d
docker compose ps
docker compose logs --tail 100 -f
```

日志窗口 Ctrl+C 仅退出跟随，容器仍运行。真正停止：

```bash
docker compose stop
```

默认使用上游镜像 ghcr.io/thenetsky/microsoft-rewards-script:4。Fork 或更新中文文档不会自动生成你自己的镜像。Docker 首次生成 config/config.json，账号从 .env 传入。

## 配置在哪里改

| 文件         | 用途                                      | 中文说明与示例                                                                                          |
| ------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| .env         | 邮箱、可选认证、语言/地区、代理、API 令牌 | [全部字段](docs/zh-CN/configuration.md#env-账号字段)、[中文示例](docs/zh-CN/examples/env.zh-CN.example) |
| config.json  | 活动、等待、搜索、日志与通知              | [全部 67 个字段](docs/zh-CN/configuration.md)、[注释参考 JSONC](docs/zh-CN/examples/config.zh-CN.jsonc) |
| compose.yaml | 镜像、挂载、时区、调度、API、健康检查     | [逐项说明](docs/zh-CN/compose.md)、[中文示例](docs/zh-CN/examples/compose.zh-CN.yaml)                   |

**JSONC 只供阅读，不能直接改名为 config.json。** 正式文件不允许注释/多余逗号，请复制完整 config.example.json 后编辑。Docker 的 CONFIG_* 每次启动覆盖对应文件字段，headless 强制为 true；本机普通 start 不会自动套用全部容器覆盖。

## 查看状态、日志和保存登录

- 原生：终端显示日志，按教程用 Tee-Object 保存。
- Docker：compose ps 看容器状态，compose logs 看任务详情。
- API：GET /health 看服务，GET /status 看任务；[中文 API 教程](docs/zh-CN/api-tutorial.md)。
- 登录数据：默认 sessions/sessions.db；Docker 通过 ./sessions 挂载持久保存，停止运行后备份整个目录。
- healthy、idle 或进程正常退出均不保证计分成功；请检查具体活动与实际余额。
- .env、Cookie、TOTP 密钥、Token、诊断和日志可能含私人数据，勿上传 GitHub。日志保留英文以兼容解析器。

## 停止、定时与更新

容器使用 TZ、CRON_SCHEDULE；Windows 原生可选任务计划程序。关闭电脑、休眠或退出终端会影响运行。

更新遵循 **停止 → 备份 → 拉取代码/镜像 → 检查新配置 → 构建或重建 → 查看日志**。各平台教程提供完整命令。不要通过直接删除配置、会话目录解决未知问题。

## 其他方式与后续目标

- Nix：上游入口为 bash scripts/nix/run.sh，本指南主要覆盖上述三种部署。
- 网页面板是独立项目 [Rewards Dashboard](https://github.com/mgrimace/rewards-dashboard)，启动 API 不会自动安装它。
- 未来目标：真正的 Windows 中文桌面 App / 独立 .exe 安装程序，最终不依赖 Docker Desktop、WSL2。**当前只保留目标，暂不开发桌面软件。**
- [文档范围与验证](docs/zh-CN/documentation-status.md)。早期[源码阅读资料](docs/zh-CN/architecture-and-api.md)作为可选参考，部署无需阅读。

本项目不是微软官方产品；使用时遵守现行 Rewards 条款、地区和活动要求。中文文档保留原作者署名和许可证，不承诺收益。

# 使用指南：首次运行、日常管理与风险

[返回首页](../../README.md) · [FAQ](faq.md)

## 首次运行前检查

- 确认使用 v4、新版 Rewards 仪表盘；邮箱能在正常浏览器中登录。
- 只选一种运行方式，首次使用一个账号、clusters=1。
- .env 已填写，config.json 或容器配置文件位置正确。
- 实验功能保持默认关闭；代理和地区按真实环境配置。
- .env、会话、Token 不提交到 GitHub；不用实际账号信息写示例。

Windows 原生按[教程](deploy/windows.md)下载浏览器并编译；Docker 按[Desktop](deploy/docker-desktop.md)或[Linux](deploy/linux-docker.md)教程拉镜像、确认引擎。

## 怎样添加账号

在根 .env 中增加编号块，例如：

```dotenv
ACCOUNT_1_EMAIL=first-account@example.com
# ACCOUNT_1_PASSWORD=replace-if-password-login-is-used

ACCOUNT_2_EMAIL=second-account@example.com
# ACCOUNT_2_PASSWORD=replace-if-password-login-is-used
```

这是占位演示，不代表鼓励一人创建多个 Rewards 账号。编号不必连续，按升序读取。每个账号独立配置代理、地区、指纹选项；用配置表的 ACCOUNT_N_* 模板替换 N。

原生停止后按上游流程重新 build、重启；容器修改 .env 后 up -d --force-recreate。只 restart 旧容器不会重新读取 env_file。

## 日常操作速查

| 操作              | Windows 原生                            | Docker（Linux 视权限加 sudo）      |
| ----------------- | --------------------------------------- | ---------------------------------- |
| 开始一次/启动服务 | npm.cmd start                           | docker compose up -d               |
| 看过程            | 当前终端，或 Tee-Object 保存            | docker compose logs --tail 100 -f  |
| 看进程/服务       | 当前终端；启用 API 后查 /status         | docker compose ps                  |
| 停止              | 前台 Ctrl+C                             | docker compose stop                |
| 再启动            | npm.cmd start                           | docker compose start               |
| 改账号/容器环境   | 停止、编辑、build、重启                 | 停止、编辑、up -d --force-recreate |
| 更新              | 停止、备份、pull、ci、浏览器安装、build | 停止、备份、pull 仓库/镜像、重建   |

退出容器日志跟随不会停止容器。RUN_ON_START=true 时容器再次启动可能额外运行一轮。任务计划程序也需单独暂停，避免手动运行时计划又触发。

## 如何判断是否正常

部署可解析 → 进程/容器运行 → 认证可用 → 任务实际执行 → 服务端计分，是不同层次。

- Starting account：开始处理账号，不是已完成登录。
- Starting login process：进入认证流程，检查后续状态和错误。
- Completed account：程序记录本轮结束，仍需看 pointsGained、错误及真实余额。
- WARN / ERROR：查看模块标题和前后文，不只复制最后一行。
- Skipping：可能开关关闭、已完成、没有活动或缺令牌，不一定是安装失败。
- healthy：默认 cron 存活或 API 健康，不检查奖励。
- API idle：控制服务空闲，需要触发任务；不是卡死。

保留英文日志以兼容内置解析器和检索上游问题。调试时可开 debugLogs，但不要在公开处贴完整账号、令牌或诊断页面。

## 登录状态的保存与迁移

默认 sessionPath=sessions，实际数据库是 sessions/sessions.db；它包含按邮箱及 mobile/desktop 区分的记录，可能伴随 SQLite -wal/-shm 文件。不要只复制一张 Cookie 截图或在运行时拷贝单个文件。

原生会话查看/针对性清理：

```powershell
npm.cmd run clear-sessions -- list
npm.cmd run clear-sessions -- email your-account@example.com
```

第二条会删除该邮箱的保存会话，需要重新登录；只在确认该账号会话有问题时使用。不要默认清空全部账号。

从原生迁移到 Docker 时：

1. 双方使用相容的 v4 版本，账号邮箱与语言/地区/指纹配置一致。
2. 完成有桌面的 manual-login，等待保存并关闭浏览器。
3. 停止原生程序、计划和目标容器，确保数据库不再写入。
4. 备份后把完整 sessions 目录复制到目标 compose 的 ./sessions 挂载目录；Linux 检查容器可读写权限。
5. 启动并看登录日志，必要时重新认证。跨平台、IP、代理和设备变化可能让已保存会话失效。

不要同时让两份执行器写同一个 sessions 目录；会话不是已加密保险箱，应按凭据保护。

## 定时、通知与控制 API

容器 cron 由 compose 配置，原生 Windows 由任务计划程序配置。当前不是桌面托盘应用，关闭机器不能继续执行；休眠后的补跑行为取决于系统计划设置。

Discord/Telegram/ntfy 都是可选通知。开启对应 enabled 并填写自身地址/令牌后才会发送。先设置 webhookLogFilter，避免每条日志都推送；保持英文关键词才能匹配现有消息。消息可能包含认证提示，只发往自己控制的接收端。

[API 中文教程](api-tutorial.md)说明如何配置令牌、查询状态与调用 /start、/stop。它不是自带的网页面板，历史日志在内存，API 重启会丢失缓存。完整字段继续保留[英文参考](../../scripts/api/README.md)。

## 更新与数据保留

停止后备份 .env、原生 config.json 或容器 config/、compose.yaml、完整 sessions/。按平台教程更新，核对新示例缺失字段后补齐；不要把新 env.example 直接复制覆盖旧 .env。

容器标签 :4 可以变化，git pull 与 docker compose pull 不等价。要回退应保留先前确认的镜像版本/digest及配置备份。不要删除 Docker 全局卷或其他项目数据。

## 账号限制与使用风险

按当前[微软服务协议的 Microsoft Rewards 条款](https://www.microsoft.com/en-us/servicesagreement/)（2026-10-16 核对），Rewards 对地区、账号和合格活动有要求；搜索奖励定义排除了机器人、宏及其他自动化查询。条款还限制个人 Rewards 账号数量，并警告掩盖地理位置的 VPN 等技术可能导致账号取消和积分损失。具体以你的适用地区与现行条款为准。

因此本项目的自动化能力不代表被微软允许，不保证积分、兑换或账号安全。账号可能被要求额外验证、停止计分、暂停或封禁。不要通过改地区、代理、提升并发或开启警告后继续来理解为“安全绕过”。

本中文文档仅说明已有程序怎样配置和部署；首次登录、验证码、通知和诊断处理都涉及私人信息，使用者自行决定是否运行并承担账号风险。

# 常见问题与部署排错

[返回首页](../../README.md) · [Windows](deploy/windows.md) · [Desktop](deploy/docker-desktop.md) · [Linux](deploy/linux-docker.md)

## 没学过编程也能用吗？需要看源码吗？

按选定平台教程执行、理解配置和登录提示即可，不需要先学习 TypeScript。它目前是脚本/容器项目，不是双击即用的中文桌面 App。

## Windows 原生必须安装 Docker、WSL2 吗？

不需要。安装 Node.js 24+、Git 和脚本所需 Chromium。Docker Desktop 路线才需要其虚拟化后端，不能把两种路线的前提混在一起。

## 运行环境装好了吗，怎样确认？

node/npm/git 各自显示版本；原生 build 生成 dist/index.js；Docker version 需显示可用 Server，compose version 可运行，OSType 为 linux。仅下载源码、安装 Docker 图标或写好 .env 都不算完整部署。

## npm.ps1 不能运行怎么办？

PowerShell 中用 npm.cmd。若 node/npm 命令本身找不到，重开终端、检查安装和 PATH；不要先改全局脚本安全策略。

## npm ci / 浏览器下载 / GHCR 拉取失败？

看完整错误区分 npm registry、Chromium 下载、GitHub、GHCR 哪个地址失败。它们是不同网络链路。检查代理/TLS和超时，不关闭证书验证作为通用解决办法。不要使用无来源的替代浏览器包。

## No accounts found in environment / .env 不生效？

确认文件叫 .env 而非 .env.txt；至少一个 ACCOUNT_N_EMAIL 非空且未被 # 注释；在项目根目录运行。原生已有同名系统环境变量可能优先；容器编辑 .env 后需要重建，restart 不重新注入环境。

## config.json not found / Unexpected token？

原生要复制根 config.example.json 为 config.json；容器使用 ./config/config.json。JSON 不能有 // 注释、中文引号、True/False 或末尾逗号；不能把文档的局部片段或 JSONC 当完整配置。

## Docker named pipe / daemon 连接失败？

先启动 Docker Desktop 并等引擎就绪，或 Linux 用 sudo systemctl status docker 查看服务。确认 context/容器模式；此项目是 Linux 容器，不是 Windows container。

## Docker 无权限、挂载错误？

Linux 先按教程使用 sudo；检查项目实际路径、挂载目标和文件属主。不要 chmod -R 777、放开 Docker socket，或删除所有卷。config.json 被误挂成目录时先查挂载配置和文件存在性。

## 容器名称冲突？

默认 container_name 固定。先确认是否已有同一服务；要多份隔离部署时分别使用目录、容器名及端口，避免共享同一 sessions。不要为了名字冲突删除不明容器。

## healthy 或 Up，但没有执行任务？

默认健康检查只检查 cron。看 RUN_ON_START、TZ、CRON_SCHEDULE 以及随机等待。容器启动首轮会跳过随机等待，计划触发则默认等 5–50 分钟。API 模式还要确认有效 schedule.json 是否覆盖基础计划。

## 为什么七点没有准时开始？

cron 是触发时间；时区、随机等待、登录和网络会影响开始/完成。用容器日志检查其配置的时区和等待。cron 用五段表达式，不是六段秒级格式。

## 改 .env、compose 后 restart 为什么没效果？

restart 重启同一个容器。改环境/挂载/端口后用 docker compose up -d --force-recreate。CONFIG_* 会覆盖 JSON，删掉覆盖项也不会自动还原上次已经写入文件的值。

## 日志 Ctrl+C 后还在运行？

Docker logs 的 Ctrl+C 仅结束查看；用 compose stop。原生前台 npm start 的 Ctrl+C 才是停止对应运行。Windows 任务计划和其他已启动副本要单独确认。

## 要密码还是无密码？二步验证怎么处理？

ACCOUNT_N_PASSWORD 可选，按账号认证方式决定。TOTP_SECRET 是验证器共享密钥，不是当次六位验证码；Authenticator 可能要求用户批准。容器没可见窗口，首次不确定时先用有桌面的原生 manual-login。

## 能在 Docker 中直接 manual-login 吗？

默认镜像只有无头 shell，不支持弹出交互窗口。先按[会话迁移说明](usage.md#登录状态的保存与迁移)处理；迁移后仍可能要求重新验证，没有永久免登录保证。

## 登录循环、Account locked 或机器人警告？

先确认普通浏览器能登录，查看具体认证错误；只针对有问题账号清理会话。账号锁定、机器人警告应由用户按微软官方流程处理；不要开启 contintueOnBotWarning 当作正常排错步骤。

## 为什么没有移动搜索、阅读、签到或额外活动？

活动由账号、地区、App 令牌、配额和服务端决定，可能不存在或已完成。还要检查对应 workers 开关。不是打开所有开关就能获得全部奖励。

## 任务结束但积分不增加？

看 pointsGained、每项活动结果、配额和实际 Rewards 余额。进程/容器健康与退出码不能替代服务端计分验证。站点更新后实验 HTTP 路径可能失效，可关闭相关实验项按原有浏览器路径排查。

## API 401 / 403 / 409？

401 检查令牌；403 检查对应写入/揭示能力是否明确允许；409 检查是否已有运行或当前状态冲突。不要为解决普通状态读取问题开启全部 API_ALLOW_*。

## 启动 API 怎么没有网页？

API 是 HTTP 控制服务，不含完整网页面板。本机 npm run api 不自动开始任务，需要 /start；面板是单独项目，见[首页](../../README.md)。

## 更新要删 config、sessions 或 Docker volume 吗？

不需要常规删除。先停止、备份，再拉取、检查新增配置并重建。会话数据库可能有 WAL 文件，停止后备份整个目录，避免只复制正在写入的单个 sessions.db。

## 日志、.env、Token 可以贴到 GitHub 提问吗？

不要公开真实秘密。用占位账号、删除密码/Token/Cookie和私人页面，仅提供错误模块、时间、版本、已脱敏日志。docker compose config 的完整输出可能展开秘密，用 --quiet 只检查语法。

## 支持保证收益、稳定免封、多账号刷分吗？

不支持这些保证。自动搜索可能不符合 Rewards 合格搜索要求；个人账号、地区及活动受官方条款限制。请先阅读[风险说明](usage.md#账号限制与使用风险)。

## 以后会提供独立 exe 吗？

这是保留的后续目标：Windows 中文桌面 App / .exe 安装程序，最终不依赖 Docker Desktop、WSL2。当前没有开始开发，也没有可用安装包或发布时间承诺。

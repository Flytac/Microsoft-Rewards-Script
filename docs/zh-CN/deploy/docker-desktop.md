# Windows Docker Desktop 部署

[返回首页](../../../README.md) · [compose 说明](../compose.md) · [FAQ](../faq.md)

该方式使用 Linux 容器。Docker Desktop 本身依赖可用虚拟化后端，常见为 WSL2；**不适合把“目前就不依赖 WSL2”作为硬要求的用户**，这种情况选择 [Windows 原生运行](windows.md)。未来独立 .exe 是另一个尚未开发的目标。

## 1. 安装与确认引擎

按 [Docker 官方 Windows 安装说明](https://docs.docker.com/desktop/setup/install/windows-install/)选择当前支持的 Windows、架构和虚拟化后端，安装并启动 Docker Desktop，完成界面提示。可先在 PowerShell 查看：

```powershell
wsl --version
docker version
docker compose version
docker info --format '{{.OSType}}'
```

wsl 命令只适用于所选 WSL2 后端。docker version 应包含 Client 与可用的 Server；compose 显示版本；OSType 必须为 linux。若只有 Client、报 daemon/pipe 连接失败或返回 windows，先启动引擎或切换到 Linux containers，不要继续拉项目镜像。

宿主机还需 [Git for Windows](https://git-scm.com/downloads/win)。不需要本机 Node.js；镜像里已有运行环境。

## 2. 下载并编辑账号

```powershell
git clone --branch docs/zh-cn-deployment https://github.com/Flytac/Microsoft-Rewards-Script.git
cd Microsoft-Rewards-Script
Copy-Item env.example .env
notepad .env
```

仅首次复制；.env 至少有一个有效 ACCOUNT_1_EMAIL，按需设置可选密码。Authenticator-only 账号可不填密码；真实登录可能需要查看日志中的认证提示。所有字段见[配置](../configuration.md)。

中文示例在 docs/zh-CN/examples，阅读后仍在**仓库根目录**使用 compose.yaml 与 .env。不要直接在 examples 子目录启动，否则相对挂载目录会变。

## 3. 调整定时和数据保存

```powershell
notepad compose.yaml
```

例如将相关环境项改为：

```yaml
TZ: 'Asia/Hong_Kong'
CRON_SCHEDULE: '0 7 * * *'
RUN_ON_START: 'true'
SKIP_RANDOM_SLEEP: 'false'
```

这是局部片段，只替换对应项，不要用四行覆盖完整文件。表示香港时间每天 07:00 触发，容器启动还会运行一次；首次运行会跳过随机等待，后续计划触发默认等待 5–50 分钟。

现有挂载会保存 ./config 与 ./sessions，容器重建不应丢失它们。首次不需要把根目录 config.json 复制进去；容器会生成 config/config.json，并强制 headless=true。

## 4. 检查、拉取、启动

```powershell
docker compose config --quiet
docker compose pull
docker compose up -d
docker compose ps
docker compose logs --tail 100 -f
```

- config --quiet 返回成功且无错误：Compose 可解析。不要公开发送不带 --quiet 的配置输出，它可能展开账号秘密。
- pull 成功：上游镜像下载完成；Fork 不会自动改成自己的镜像。
- up -d：创建并后台启动。
- ps：应为运行状态；健康检查有启动等待时间。
- logs：应看到账号数量、配置准备、初始执行或 cron 配置等信息。默认健康检查只确认 cron，不验证登录/积分。

第一次启动后可在资源管理器看到 config/config.json。不要同时用原生脚本和容器写同一份 sessions 数据。

## 5. 手动认证的边界

默认镜像仅安装 Chromium headless shell，不能通过 manual-login 显示浏览器。若认证方式无法在无头流程完成，先在 Windows 原生方式验证账号，按[使用指南](../usage.md#登录状态的保存与迁移)迁移停止状态下的会话。

迁移不是跨设备认证成功保证，重新验证仍可能发生。不要把容器“不退出”当作登录完成。

## 6. 日志、停止和再次启动

日志跟随窗口 Ctrl+C 只退出显示。真正停止及再次启动：

```powershell
docker compose stop
docker compose start
docker compose ps
```

也可使用 docker compose up -d 创建/更新容器。RUN_ON_START=true 时停止后再启动也会触发首轮流程。要停用每日运行，必须停容器或改有效计划，仅关日志窗口无效。

保存当前日志：

```powershell
New-Item -ItemType Directory -Force logs | Out-Null
docker compose logs --no-color --tail 1000 | Set-Content -Encoding UTF8 ./logs/container.log
```

日志轮转和磁盘占用见 [compose 说明](../compose.md)。默认未发布 API 端口；需要网页状态时再按 [API 教程](../api-tutorial.md)显式开启。

## 7. 修改配置

停止任务后编辑 config/config.json，保持完整 JSON。若 compose 中有相同 CONFIG_*，它会在启动时覆盖文件值。改 .env 或 compose 后执行：

```powershell
docker compose up -d --force-recreate
docker compose logs --tail 100
```

仅 docker compose restart 不会把修改后的 env_file/容器环境重新注入。改已挂载的 JSON 也需让新一轮进程读取，最稳妥仍是停止、检查、重建并查看日志。

## 8. 更新与备份

```powershell
docker compose stop
$rewardsBackup = Join-Path (Split-Path (Get-Location).Path -Parent) ('rewards-docker-backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $rewardsBackup | Out-Null
Copy-Item .env,compose.yaml -Destination $rewardsBackup
if (Test-Path config) { Copy-Item config -Destination $rewardsBackup -Recurse }
if (Test-Path sessions) { Copy-Item sessions -Destination $rewardsBackup -Recurse }
git status --short
git pull --ff-only
docker compose config --quiet
docker compose pull
docker compose up -d --force-recreate
docker compose ps
docker compose logs --tail 100
```

git pull 发生本地 compose 修改冲突时保留现状解决，不要覆盖 .env/config。镜像 :4 是可变主版本标签，更新可能改变实际代码；希望固定版本可按上游已存在的 release/digest 选择，确认该标签可拉取。

配置新增字段先查看日志，默认 CONFIG_AUTO_SYNC=false 只报告；需要时在备份后按 [compose 说明](../compose.md)启用自动补齐，勿直接删除配置目录。

## 9. 常见错误

| 现象                               | 检查                                                    |
| ---------------------------------- | ------------------------------------------------------- |
| Cannot connect / named pipe 找不到 | Docker Desktop 是否运行、当前 context 是否正确          |
| no matching manifest / 平台不匹配  | Linux 容器模式、CPU 架构、镜像支持情况                  |
| env file not found                 | 是否在根目录创建了 .env，文件不是 .env.txt              |
| 挂载拒绝或 permission denied       | 项目目录权限、Docker 文件共享，优先使用普通用户可写目录 |
| 重启循环                           | logs 最早的配置/cron/账号错误，而非只看最后一行         |
| 一直没开始                         | RUN_ON_START、时区、cron 及随机等待日志                 |
| 已 healthy 但没积分                | 健康仅验证调度/服务，另查认证、活动和配额               |
| 改账号不生效                       | 用 up -d --force-recreate 重新注入环境                  |

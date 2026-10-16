# Linux / Docker 部署

[返回首页](../../../README.md) · [compose 说明](../compose.md) · [FAQ](../faq.md)

下面给出**全新 Ubuntu 主机**的完整安装示例。已有 Docker/容器的服务器先用现有环境检查，不要重复安装、卸载或清理数据。Debian 等发行版按对应 [Docker 安装入口](https://docs.docker.com/engine/install/)选择官方步骤，不要将 Ubuntu 软件源照搬到其他系统。

宿主机无需 Node.js、Chromium 或桌面；这些由镜像提供。服务器自身要能访问 GitHub、GHCR 和所需 Microsoft 服务。内存/CPU 消耗取决于浏览器和并发，首次使用单账号、clusters=1 观察资源。

## 1. 检查现有环境

```bash
uname -m
docker --version
docker compose version
```

已有环境可用时跳到第 3 步。使用 sudo 权限的账号，确认自己的发行版受支持。Docker 官方说明提醒旧 docker.io、旧 compose 等包可能冲突；有旧服务时先核对迁移方案，本文不自动卸载它们。

## 2. 全新 Ubuntu 安装 Docker Engine 和 Compose

按 [Docker 官方 Ubuntu 安装说明](https://docs.docker.com/engine/install/ubuntu/)添加软件源：

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

创建官方软件源定义：

```bash
sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker version
sudo docker compose version
sudo docker run --rm hello-world
```

应显示 Docker Client/Server、Compose 版本，hello-world 输出成功说明。该测试会下载临时测试镜像。本文后续保留 sudo，避免要求把普通用户加入具有高权限的 docker 组。

## 3. 下载仓库和配置账号

```bash
mkdir -p ~/apps
cd ~/apps
git clone --branch docs/zh-cn-deployment https://github.com/Flytac/Microsoft-Rewards-Script.git
cd Microsoft-Rewards-Script
cp env.example .env
chmod 600 .env
nano .env
```

只在第一次复制。用真实邮箱替换 ACCOUNT_1_EMAIL，密码按认证方式决定是否填写；不要在终端命令参数中粘贴密码。如果没有 nano，用自己熟悉的编辑器，或先安装 nano。

账号槽位支持 ACCOUNT_2_EMAIL 等编号；编号可以跳过，按升序运行。实际账号使用仍受微软条款限制，配置能力不代表允许批量刷分。

## 4. 配置计划和目录

```bash
nano compose.yaml
```

将 TZ 改成自己需要的时区，例如 Asia/Hong_Kong；CRON_SCHEDULE='0 7 * * *' 表示该时区每天 07:00 触发。RUN_ON_START=true 还会在容器启动时运行一次（跳过随机等待）。定时触发默认等待 5–50 分钟，详见 [compose](../compose.md)。

只改相应值，不要删掉 volumes/env_file。首次启动会生成 ./config/config.json，./sessions 保存会话。容器默认上游镜像 :4，不需要在服务器 npm install。

## 5. 检查并启动

```bash
sudo docker compose config --quiet
sudo docker compose pull
sudo docker compose up -d
sudo docker compose ps
sudo docker compose logs --tail 100 -f
```

配置检查无错误、镜像拉取完成、容器运行，并看到配置准备/账号/调度日志，才算部署入口正常。healthy 不能证明账号成功。Ctrl+C 仅结束日志跟随，后台容器仍在。

默认容器不发布网络端口，无需为运行本脚本开放服务器防火墙。需要 API 时优先绑定宿主机回环地址，并通过 SSH 隧道访问，见 [API 使用指南](../api-tutorial.md)。

## 6. 保存日志与查看状态

```bash
mkdir -p logs
sudo docker compose logs --no-color --tail 1000 > logs/container.log
sudo docker compose ps
sudo docker stats --no-stream microsoft-rewards-script
```

ps 看进程/健康，stats 看资源，日志和实际 Rewards 余额看业务结果。默认 Docker 日志可能持续占用磁盘，可在配置中加入日志轮转，见 compose 文档。

## 7. 停止、重启、改配置

```bash
sudo docker compose stop
sudo docker compose start
```

stop 停止容器，start 再次启动（可能触发 RUN_ON_START）。需要改账号/环境/compose 时，先停止，编辑后：

```bash
sudo docker compose config --quiet
sudo docker compose up -d --force-recreate
sudo docker compose logs --tail 100
```

restart 只重启旧容器，不重新读取 env_file 成为新容器环境。config/config.json 由挂载持久化；有 CONFIG_* 时对应字段会被覆盖。

## 8. 停止后备份并更新

```bash
sudo docker compose stop
backup_dir="../rewards-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -m 700 "$backup_dir"
cp .env compose.yaml "$backup_dir/"
sudo tar -czf "$backup_dir/data.tar.gz" config sessions
sudo chmod 600 "$backup_dir/data.tar.gz"
sudo tar -tzf "$backup_dir/data.tar.gz"
git status --short
git pull --ff-only
sudo docker compose config --quiet
sudo docker compose pull
sudo docker compose up -d --force-recreate
sudo docker compose ps
sudo docker compose logs --tail 100
```

应看到 config、sessions 及其中数据的归档清单。任何备份命令失败都应先停止，检查目录是否存在及备份文件是否完整，再继续更新；如果从未创建 sessions，需要按实际存在目录调整备份列表。备份包含秘密，只保留在受控位置。git 有冲突时停止解决，不要强制覆盖私人配置。

更新镜像与更新仓库是两件事：拉取中文说明不会改变正在运行的镜像。:4 是移动标签，回退应使用之前确认的版本或镜像 digest；回退前也需确认配置/会话兼容性。

## 9. 无头服务器认证与会话

默认镜像不能显示 manual-login。自动流程可能处理可用认证方式，但遇到必须人工交互的验证时，需要有桌面的原生环境处理，并在双方停止时迁移会话；步骤见[使用指南](../usage.md#登录状态的保存与迁移)。语言、代理、IP 或环境改变仍可能要求重新验证。

## 10. 常见错误

| 现象               | 处理                                                  |
| ------------------ | ----------------------------------------------------- |
| docker 权限不足    | 使用 sudo；不要随意 chmod Docker socket               |
| 仓库/镜像下载失败  | 分别检查 GitHub、registry/GHCR 的连接和具体错误       |
| 目录/文件权限错误  | 停止后核对实际挂载和属主；不要 chmod -R 777           |
| config.json 是目录 | 检查挂载方式及文件是否事先存在，不直接删除整个 config |
| CRON_SCHEDULE 错误 | 五段表达式、英文引号、有效 TZ；检查最早入口日志       |
| 服务重启后没活动   | 看时区、有效计划、随机等待和账号认证                  |
| 磁盘满             | 检查日志与镜像占用；先确认数据和正在使用的镜像再清理  |

# Windows 原生运行（不需要 Docker / WSL2）

[返回首页](../../../README.md) · [配置](../configuration.md) · [FAQ](../faq.md)

适合 Windows 电脑首次使用，需要可见窗口处理登录的用户。程序仍是命令行脚本，目前没有桌面 App 安装包。本页命令使用 PowerShell；把占位邮箱换为自己的账号。

## 1. 安装环境并检查

从 [Node.js 官网](https://nodejs.org/en/download)选择 **24.x 或更高、适合你系统架构的 Windows Installer**，保留 npm 安装选项；从 [Git for Windows](https://git-scm.com/downloads/win)安装 Git。安装后重开 PowerShell：

```powershell
node --version
npm.cmd --version
git --version
```

应分别看到版本号，Node 应为 v24.x 或更高。找不到命令先重开终端、检查安装和 PATH；不要继续执行后面的安装命令。npm.cmd 可避免某些 PowerShell 环境拦截 npm.ps1。

## 2. 下载仓库

在自己有写权限的目录打开终端，例如先在资源管理器创建一个项目文件夹，在地址栏输入 powershell：

```powershell
git clone --branch docs/zh-cn-deployment https://github.com/Flytac/Microsoft-Rewards-Script.git
cd Microsoft-Rewards-Script
Get-ChildItem
```

应看到 package.json、config.example.json、env.example、compose.yaml。后续命令都在这个项目根目录执行。已有仓库先确认 git status，勿在有未保存修改时强制切换分支。

## 3. 首次创建配置

先确认没有自己的旧文件，再复制：

```powershell
Copy-Item env.example .env
Copy-Item config.example.json config.json
notepad .env
```

至少修改邮箱；密码可选，不要照抄占位值：

```dotenv
ACCOUNT_1_EMAIL=your-account@example.com
# ACCOUNT_1_PASSWORD=replace-with-your-password
ACCOUNT_1_GEO_LOCALE=auto
ACCOUNT_1_LANG_CODE=en
ACCOUNT_1_SAVE_FINGERPRINT_MOBILE=true
ACCOUNT_1_SAVE_FINGERPRINT_DESKTOP=true
```

最后两项是可选的设备信息保存设置，方便手动与自动会话复用，不代表账号安全或免验证保证。语言/地区按账号实际情况填写，不用为中文文档强改账号地区。

.env 文件开头的 # 是注释；保存时确保文件名为 .env，不是 .env.txt：

```powershell
Get-ChildItem -Force .env,config.json
notepad config.json
```

config.json 是完整 JSON；首次建议保留 clusters=1、headless=false、experimental 全 false。全部字段见[配置表](../configuration.md)，带注释的 JSONC 不能直接运行。

## 4. 安装依赖、浏览器、编译

```powershell
npm.cmd ci
npm.cmd run install:browser
npm.cmd run build
```

- ci 成功：依赖安装完成，无 npm ERR 导致的中止。
- install:browser 成功：Patchright 的 Chromium 下载完成，下载位置由工具管理。
- build 成功：生成 dist，末尾显示搜索词资源复制信息。

```powershell
Test-Path dist/index.js
Test-Path dist/functions/search-queries.json
```

两项应为 True。build 不会代替浏览器下载。第一次准备的上游合并命令是 npm run pre-build（npm i、清理 dist、下载浏览器），不需要再与上述安装流程重复执行。

## 5. 手动登录与首次运行

```powershell
npm.cmd run manual-login -- --email your-account@example.com --platform both
```

会依次打开手机/电脑环境的 Chromium。自己完成微软认证；浏览器持续停留在非 /auth 的 rewards.bing.com 页面约五秒后保存会话并关闭。邮箱必须在 .env 中配置；Ctrl+C 可终止等待。

```powershell
npm.cmd run clear-sessions -- list
npm.cmd start
```

list 应显示已保存会话的元数据，不应公开分享邮箱记录。start 开始真实活动；观察账号开始、活动进度和账号结果。完成后核对实际 Rewards 余额。没有可用活动不一定是安装失败。

## 6. 日志、停止与重启

```powershell
New-Item -ItemType Directory -Force logs | Out-Null
npm.cmd start 2>&1 | Tee-Object -FilePath ./logs/run.log
```

终端和 logs/run.log 同时收到输出；同一日志文件下次会覆盖，需保留时换文件名。日志可能包含邮箱/认证提示，分享前检查。

前台任务按 **Ctrl+C**；确认退出、浏览器关闭后，使用 npm.cmd start 再次启动。不要同时在多个终端手动启动同一套账号。

## 7. 定时运行（可选）

先确认手动运行已通过。Windows 原生不会读取 compose 的 cron；可用系统任务计划程序。下面创建一个普通启动批处理，仅用于调度，写日志到项目 logs；它不替你创建桌面 App。

```powershell
$rewardsRoot = (Get-Location).Path
@'
@echo off
cd /d "%~dp0"
if not exist "logs" mkdir "logs"
node.exe dist\index.js >> "logs\scheduled.log" 2>&1
exit /b %errorlevel%
'@ | Set-Content -Encoding Ascii ./run-rewards.cmd

$rewardsAction = New-ScheduledTaskAction -Execute "$env:SystemRoot\System32\cmd.exe" -Argument ('/d /c ""{0}\run-rewards.cmd""' -f $rewardsRoot) -WorkingDirectory $rewardsRoot
$rewardsTrigger = New-ScheduledTaskTrigger -Daily -At '07:00'
$rewardsSettings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'Microsoft-Rewards-Script' -Action $rewardsAction -Trigger $rewardsTrigger -Settings $rewardsSettings -Description '每日运行本机 Rewards 脚本' | Out-Null
Get-ScheduledTask -TaskName 'Microsoft-Rewards-Script'
```

使用当前 Windows 用户注册，默认在该用户已登录的交互上下文下运行，可能受系统策略限制；如注册失败，打开“任务计划程序”按同样程序、参数、起始目录手动创建。时间使用 Windows 本地时区，首次以已登录状态运行，勿在命令中填写 Windows 密码。

任务执行环境需能找到 node.exe。可把批处理中的 node.exe 改为 Get-Command node.exe 显示的绝对路径（含空格时加英文双引号）。首次需在系统“任务计划程序”中测试路径、权限和浏览器；无人登录、电脑睡眠/关机时不保证运行。

暂停未来计划：

```powershell
Disable-ScheduledTask -TaskName 'Microsoft-Rewards-Script'
```

它不会停止已经启动的那一轮。需要停止时先定位该任务对应的终端/进程，不要结束电脑上所有 Node 或 Chromium。恢复计划使用 Enable-ScheduledTask -TaskName 'Microsoft-Rewards-Script'。

## 8. 更新与备份

先停止当前运行，若配置过计划，暂时禁用它。以下备份目录在仓库外，应按私人数据保护：

```powershell
$rewardsBackup = Join-Path (Split-Path (Get-Location).Path -Parent) ('rewards-backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $rewardsBackup | Out-Null
Copy-Item .env,config.json -Destination $rewardsBackup
if (Test-Path sessions) { Copy-Item sessions -Destination $rewardsBackup -Recurse }
git status --short
git pull --ff-only
npm.cmd ci
npm.cmd run install:browser
npm.cmd run build
node dist/util/ConfigSync.js sync --config ./config.json --example ./config.example.json
```

同步命令只报告新增字段。确认并备份后，如需要补齐缺失项：

```powershell
node dist/util/ConfigSync.js sync --config ./config.json --example ./config.example.json --patch
npm.cmd start
```

patch 不应拿来强制重置全部值。git pull 出现冲突时停止更新，保留本地修改；不要使用 reset --hard 或重新复制示例覆盖自己的文件。需要上游新代码时先在 GitHub 同步 Fork，再在对应分支检查合入情况；拉取文档分支不会自动追踪上游 v4 的所有更新。

## 9. 常见错误

| 错误                       | 处理                                                         |
| -------------------------- | ------------------------------------------------------------ |
| npm.ps1 被禁止             | 使用本文 npm.cmd，通常无需改系统执行策略                     |
| 文件名正确但找不到账号     | 检查 .env.txt、# 注释、邮箱是否为空、工作目录                |
| Chromium executable 不存在 | 重新执行 install:browser，检查完整下载错误                   |
| config.json 解析失败       | 保留英文引号与布尔值，去掉注释/末尾逗号                      |
| Node 原生模块加载失败      | 核对 Node 24+ 和系统架构，重新 ci，勿复制 Linux node_modules |
| 登录循环/验证码不可见      | 在有桌面的环境运行 manual-login；检查账号本身是否可网页登录  |
| Windows 计划运行失败       | 查任务历史、工作目录、node.exe 路径、登录/休眠状态           |
| 运行完没积分               | 查具体活动、配额及服务端状态，不把正常退出当作奖励成功       |

更多见 [FAQ](../faq.md)。

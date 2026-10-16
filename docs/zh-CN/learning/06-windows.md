# 06 Windows 原生运行教程

[学习目录](README.md)

项目本身提供原生 Node 运行方式，不需要 Docker Desktop。以下是使用说明，本次没有替用户配置真实账号或开始任务。

## 首次准备

安装 Node.js 24+（带 npm）和 Git。打开 PowerShell：

```powershell
node --version
npm --version
git --version
git clone --branch docs/zh-cn-learning https://github.com/Flytac/Microsoft-Rewards-Script.git
cd Microsoft-Rewards-Script
Copy-Item env.example .env
Copy-Item config.example.json config.json
```

已有配置时不要再执行覆盖复制。用编辑器在本机填写 .env；文件应确实名为 .env，而不是 .env.txt。

## 安装与构建

```powershell
npm ci
npm run install:browser
npm run build
npm run test:log-parser
```

npm ci 按锁文件安装依赖；install:browser 下载自动化浏览器；build 产生 dist；日志测试不启动真实账号任务。上游 npm run pre-build 把安装、清理和下载浏览器合并为一个命令，两种安装流程无需重复执行。

若 PowerShell 拦截 npm.ps1，可用 npm.cmd 执行相同命令，不必为此放宽全局执行策略。

## 手动登录与正式运行

```powershell
npm run manual-login -- --email user@example.com --platform both
npm run start
```

把占位邮箱替换为自己配置的账号。manual-login 使用可见 Chromium 完成认证并保存会话；start 会实际执行所开启的任务。若只学习源码，停在构建和离线测试即可。

修改配置后遵循上游步骤重新构建并重启。运行目录保持在项目根目录；未来桌面程序必须显式设置工作目录，不能依赖快捷方式碰巧从哪里启动。

## 常见环境问题

| 问题                | 定位顺序                                                                        |
| ------------------- | ------------------------------------------------------------------------------- |
| 找不到 node/npm     | 检查是否安装与重开终端；核对 PATH                                               |
| 构建找不到类型/模块 | 检查 npm ci 是否成功、当前目录是否正确                                          |
| 缺少 Chromium       | 运行 install:browser 并看下载结果；构建并不会自动下载浏览器                     |
| 原生模块加载失败    | 核对 Windows 架构、Node 版本与依赖实际安装，不要直接复制其他系统的 node_modules |
| 登录窗口打不开      | 是否使用了有桌面的原生环境；默认 Docker 无头镜像不同                            |
| API 401             | 检查客户端与服务端令牌一致性；不要把令牌贴到公开日志                            |
| 开机后不自动运行    | npm start 不是 Windows 计划任务，也不是系统服务                                 |

Docker 的 cron、TZ、目录挂载不能自动迁移到 Windows。今后如需要定时，可评估 Windows 任务计划或 App 自身调度，但电脑休眠/关机时行为必须另行设计。

## 数据位置与升级

当前路径由配置和 cwd 决定；sessions 下保存会话，diagnostics 保存诊断。升级前分别备份配置和会话，不要用新源码覆盖私人数据。未来安装包建议将可执行资源和用户数据分开，详见[桌面化分析](../windows-desktop-feasibility.md)。

# 中文部署文档范围与验证

[返回首页](../../README.md)

## 本次范围

基于自己的 Fork 的 v4 提交 94db205ef476852dd306ef42fb3bbf6c17ccd97e，在独立分支 docs/zh-cn-deployment 完成。定位是中文用户的部署与使用资料，不要求阅读源码。

本分支从 v4 直接创建，未包含早期学习分支的 29 个源码注释改动。原有程序、变量名、函数名、URL、日志、依赖、根配置示例、Dockerfile、许可证和工作流保持不变。

## 文档清单

| 文档                        | 本次内容                                                                |
| --------------------------- | ----------------------------------------------------------------------- |
| README.md                   | 面向使用者的中文首页、功能、三种部署入口、快速开始、风险与未来目标      |
| README.en.md                | 保留原文，只在顶部增加返回中文的切换链接                                |
| deploy/windows.md           | 原生环境、登录、运行、日志、停止、任务计划、备份更新与排错              |
| deploy/docker-desktop.md    | 引擎检查、Linux 容器、挂载、配置、启停、更新和认证边界                  |
| deploy/linux-docker.md      | 全新 Ubuntu 安装示例、现有服务器边界、服务运行、更新备份                |
| configuration.md            | 67 个 config 字段、全部 .env 账号选项、常用配置与 63 个 Docker 覆盖映射 |
| compose.md                  | 服务、镜像、挂载、环境、cron、API、健康检查、安全、日志轮转             |
| examples/README.md          | 可用示例与阅读用 JSONC 的区别、正确复制位置                             |
| examples/env.zh-CN.example  | 账号与 API_TOKEN 的中文注释占位示例                                     |
| examples/compose.zh-CN.yaml | 有效行为与根样例一致的中文注释版                                        |
| examples/config.zh-CN.jsonc | 全部 config 字段中文注释参考，不能直接作为 JSON 运行                    |
| usage.md                    | 首次流程、日常操作、会话保存/迁移、状态解释、账号风险                   |
| faq.md                      | 新手部署、网络、配置、认证、定时、数据与更新排错                        |
| api-tutorial.md             | 原生/容器可选控制服务、状态、日志、认证、启停和 SSH 隧道                |
| 本文件                      | 修改范围、验证结果和未实测边界                                          |

上述路径未写前缀的均位于 docs/zh-CN，README 两项位于仓库根目录。

## 与当前 v4 的核对

- 安装/构建脚本来自 package.json；浏览器下载、manual-login 参数、会话工具参数已对照实际命令帮助。
- .env 字段与 env.example 和加载逻辑核对。
- JSONC 去掉注释解析后，字段、结构和值与 config.example.json 一致。
- 中文 .env 示例的实际生效键值与根示例一致，只有占位信息。
- 中文 Compose 经本机 Docker Compose 解析后，与根示例的完整模型一致；没有因此启动容器。
- 67 个 JSON 字段及 63 个 CONFIG_* 映射与当前文件逐项对应。
- cron、首轮跳过等待、配置覆盖、会话挂载与容器入口核对；说明中明确区分 restart 和重建容器。
- Windows 教程中的 PowerShell 代码块做语法解析；Markdown 相对文件/目录及本次文档锚点进行检查。
- 文档格式检查、项目 build、现有 9 项日志解析测试通过；源码/运行配置差异检查确保仅文档与文档示例改变。

## 验证边界

实际执行环境是 Windows / Node.js v24.19.0，Docker Compose 可用于离线解析。没有为这次文档任务安装或启动 Docker、WSL2、服务器服务、Windows 计划任务，也没有登录真实 Microsoft 账号、执行 Rewards 活动或确认积分到账。

Linux 安装命令按 Docker 官方 Ubuntu 文档核对，未在全新 Ubuntu 主机逐步部署。Windows 干净电脑安装、浏览器下载、实际计划任务、迁移会话及跨环境认证均需按用户环境验证。语法/结构检查不代表所有认证方式都可用。

英文 API 参考原文保留在 scripts/api/README.md，英文 README 原文完整保留。文档中引用的第三方安装要求和 Rewards 条款可能更新，请以官方页面和账号适用条款为准。

## 后续目标

未来希望开发真正的 Windows 中文桌面 App，生成独立 .exe 安装程序，最终不依赖 Docker Desktop、WSL2。本次只保留目标，没有创建 App、安装包、自动更新或开发时间承诺。

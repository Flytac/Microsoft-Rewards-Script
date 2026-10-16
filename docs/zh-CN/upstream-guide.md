# 上游使用说明中文对照

[返回首页](../../README.md) · [保留的英文原版](../../README.en.md)

本页将上游 README 各主题对应到中文说明，避免只翻译开头而遗漏 Docker、Nix、实验功能和会话管理。命令与字段按当前 v4 保留；文档依据 Fork 基准 94db205。

| 上游主题                             | 中文阅读位置                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| Quick Setup / Bare metal             | [Windows 原生步骤](learning/06-windows.md)、[首页跨平台步骤](../../README.md) |
| Account Setup                        | [配置加载](learning/02-configuration.md)、[全部账号字段](configuration.md)    |
| Config Setup / Configuration Options | [逐项字段与默认值](configuration.md)                                          |
| Build and run                        | [启动与技术关系](learning/01-startup.md)                                      |
| Docker                               | [首页 Docker 说明](../../README.md)、下面的容器补充                           |
| Control API and Dashboard            | [中文 API 教程](api-tutorial.md)                                              |
| Search / Query sources               | [任务与查询队列](learning/04-activities.md)、首页查询来源                     |
| Experimental                         | 配置文档实验功能说明、源码中的实验路径注释                                    |
| Logging / Webhooks                   | [日志与通知](learning/05-logging-api.md)                                      |
| Proxy                                | 配置文档的代理字段与证书说明                                                  |
| Manual login / Session management    | [登录与会话](learning/03-login-browser.md)、首页命令                          |
| Nix / Disclaimer                     | 本页后续部分                                                                  |

## Docker 补充说明

compose 默认使用上游 ghcr.io/thenetsky/microsoft-rewards-script:4 镜像；你的 fork 代码修改不会自动进入这个镜像。首次生成配置写入 ./config，CONFIG_* 每次启动覆盖对应文件值。

上游建议缺配置字段时重建配置；更稳妥的阅读与操作顺序是先备份和对比示例，确认需要重建再处理，避免丢失定制值。修改 compose 后需重新应用容器配置，单纯编辑磁盘文件不会改变已有进程。

API 模式需启用 API_MODE、配置 API_TOKEN 并按用途映射端口。如果只在本机访问，发布端口时可显式绑定回环地址。Windows 原生学习路线无需执行这些容器步骤。

## Nix

上游提供 bash scripts/nix/run.sh，面向已配置 Nix 的环境，相关依赖由 flake.nix 描述。它是另一种环境管理入口，不是 Windows 新手必装步骤；本次未实测 Nix。

## 代理与实验行为

浏览器代理支持 HTTP/HTTPS/SOCKS4/SOCKS5；SOCKS 浏览器认证不受支持。HTTP 查询来源代理还受 ACCOUNT_N_PROXY_HTTP 和 proxy.queryEngine 共同影响。

ignoreCertificateErrors 会降低浏览器证书校验，普通代理保持 false。blockMedia 会影响路由与缓存行为，不保证任何网站都省流量或更快。

API Search/ExploreOnBing 依赖新版站点接口；失效时可关闭对应实验开关回到浏览器路径。Edge 浏览是后台任务，前台结束不一定意味着整轮结束。这些说明不保证任务可用或奖励成功。

## 上游声明

上游明确提醒自动化 Microsoft Rewards 可能导致账号暂停或封禁，软件用于教育学习，使用风险由使用者承担，作者不负责微软采取的措施。保留 LICENSE 与作者信息，本中文材料不代表微软官方认可。

本次不改变英文日志、网页选择器、请求参数和 API 名称；源码中文注释属于学习辅助，不能代替真实运行验证。

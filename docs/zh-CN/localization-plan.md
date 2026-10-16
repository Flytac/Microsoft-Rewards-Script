# 中文化实施与验证记录

[返回首页](../../README.md) · [学习目录](learning/README.md)

## 基准与边界

- 仓库：Flytac/Microsoft-Rewards-Script。
- 工作分支：docs/zh-cn-learning；基于 v4 的 94db205ef476852dd306ef42fb3bbf6c17ccd97e。
- 上游版本：package.json 4.3.2；原作者 Netsky、LICENSE 和依赖声明保留。
- 只增加中文说明、注释和离线校验工具；业务标识符、英文输出、请求协议和既有部署方式保持原样。
- 本次只分析桌面版可行性，不开发或安装桌面 App，不配置真实账号。

## 实施顺序与文件职责

| 模块          | 添加中文注释的文件                                                                                                                                                                               | 原本作用                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| 启动/配置     | src/index.ts、src/util/Load.ts、src/util/Validator.ts、src/util/ConfigEnvOverrides.ts                                                                                                            | 主流程、配置查找、账号组装、Zod 校验、容器覆盖计算             |
| 浏览器/网页   | src/browser/Browser.ts、BrowserFunc.ts、ReactFunc.ts、MediaBlocker.ts                                                                                                                            | Chromium/Context 创建、站点传输、Flight 页面数据解析、媒体路由 |
| 认证/会话     | src/browser/auth/Login.ts、methods/EmailLogin.ts、methods/LoginUtils.ts、methods/Totp2FALogin.ts、src/util/SessionStore.ts                                                                       | 登录状态机、表单、交互输入、TOTP、SQLite 会话                  |
| 任务入口/主题 | src/functions/Activities.ts、QueryEngine.ts、SearchQueryQueue.ts                                                                                                                                 | 任务门面、主题来源、按需查询队列                               |
| 活动/搜索     | activities/rewards/DailySet.ts、PromotionActivityRunner.ts、activities/app/DailyCheckIn.ts、activities/api/UrlReward.ts、activities/search/SearchManager.ts、SearchProgress.ts、BrowserSearch.ts | 每日活动分派、签到、URL 奖励、配额、浏览器搜索                 |
| HTTP/日志     | src/util/Http.ts、src/logging/Logger.ts                                                                                                                                                          | 请求与响应适配、重试、日志与通知过滤                           |
| Control API   | scripts/api/logParser.js、processManager.js、runCommand.js、server.js                                                                                                                            | 日志重建状态、子进程生命周期、Windows 启动兼容、HTTP/SSE       |

共 29 个原有源码文件增加中文注释。主要函数说明输入、返回或副作用，并解释异步上下文、状态机、按需队列、容错、清理、流式解析等设计原因。参数/类型已有明确含义的转发方法不重复堆砌注释。

其余代码通过[全仓库地图](repository-map.md)及各章节定位。本次不逐行注释全部协议数据模型、每一种实验活动、每个远端站点适配器，也不把每条英文日志改写为中文。

## 学习与使用文档

新增六章学习教程，按启动、配置、登录/浏览器、活动、日志/API、Windows 原生运行排列；另有上游主题中文对照、API 中文使用教程、完整文件地图和桌面化分析。

中文首页保留英文原版入口。README.en.md 和 scripts/api/README.md 的英文内容不替换。API 中文教程覆盖常用操作与边界，大型逐字段响应样例保留英文参考链接，未声称逐句翻译全部 API 参考。

## 检查方式

在 Windows、Node.js v24.19.0 上按 package-lock.json 安装依赖。验证使用仓库自己的 TypeScript、ESLint、Prettier 和 node:test；没有升级依赖或改变版本约束。

| 检查              | 结果/范围                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| 基线构建          | npm run build 通过                                                                                   |
| 中文分支构建      | npm run build 通过                                                                                   |
| ESLint            | npm run lint 通过                                                                                    |
| 现有日志解析测试  | 9/9 通过                                                                                             |
| 源码不变性        | 原有 92 个 .ts/.js 文件的无注释语法树输出一致，TypeScript 指令一致                                   |
| 保护文件          | 既有 JSON、YAML、shell、Dockerfile、env.example 和 LICENSE 内容不变（忽略换行差异）                  |
| 本地 API 冒烟     | 基线与中文分支分别通过 7 项检查：无认证拒绝、认证健康、idle、状态、未知路由、非法 JSON、禁止配置写入 |
| 新增/修改文档链接 | 检查仓库内相对链接的目标存在性                                                                       |
| 格式              | 新增文件及本次改动文件通过格式检查；全仓库基线自带格式差异，详见下文                                 |

可复现命令：

```powershell
npm ci --ignore-scripts
npm run build
npm run lint
npm run test:log-parser
node scripts/docs/verify-comment-only.js
```

不变性工具默认与本次基准 SHA 比较，也可在末尾传入其他基准。它使用 TypeScript AST 打印器去掉注释后比较语法结构，并额外检查 @ts-* 指令；这比仅确认编译成功更直接，但不是对所有外部服务行为的数学证明。

## 格式基线与未验证项

初次在 Windows 检查时，全仓库 format:check 对基线和中文工作副本都报告相同的 91 个既有文件。源码中 CRLF 与仓库的 LF 规则有关；本次只格式化实际修改/新增文件，避免为中文化重排全部仓库。全量检查仍可能因未修改文件失败，应与基线区分。

API 冒烟测试启动了仅监听 127.0.0.1 的临时控制服务，使用临时随机令牌，没有有效调用 /start，没有提供任何 Microsoft 凭据。最初在受限执行环境超时，同一检查在允许本地服务的执行环境中，基线与修改版均通过。

本次没有登录 Microsoft、验证积分到账、执行 Docker/Nix 部署，也没有验证干净电脑上的 Chromium 安装或未来桌面安装包。测试结论限定为构建、静态结构、日志兼容和本地控制服务。

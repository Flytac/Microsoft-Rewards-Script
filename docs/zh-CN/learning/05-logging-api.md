# 05 日志、通知与控制 API

[学习目录](README.md) · 下一章：[Windows 原生运行](06-windows.md)

## 英文日志是接口的一部分

Logger 输出时间、用户、级别、平台、模块标题及消息。logParser 用固定正则识别 Starting account、Completed account、pointsGained 等。翻译这些字符串会让 API 统计丢失，而程序本身可能仍在运行，所以很难仅靠肉眼发现。

本次只添加注释。未来中文 App 应将解析后的字段映射为“运行中”“积分”等中文标签，同时保留原始英文日志用于排错。

Logger 的控制台与 webhook 有各自过滤器，级别/关键词/正则是任一命中。白名单/黑名单分别放行命中/未命中项。工作进程通过 IPC 把通知交给主进程。

## 为什么必须缓存半行日志

spawn 的 stdout 数据事件提供的是 chunk，不是完整行。例如一条消息可能分成前半段和后半段。ProcessManager._ingest 分别积累 stdout、stderr，遇到换行才解析，退出时再处理余下内容。

parseLogLine 先去掉 ANSI 颜色字符，再识别结构；未知日志仍保留原文。applyLogToRunState 重建运行状态，summarizeRunState 生成面板摘要。它们没有重新请求微软确认积分。

## 控制服务不是业务主程序

server.js 接收 HTTP，ProcessManager 启停子进程，runCommand.js 决定执行 Node + dist/index.js 还是源码回退。npm run api 只启动服务，本机模式下需要 POST /start 才开始任务。

进程状态 idle/starting/running/stopping 与账号 success 是两套概念。API 的 /health 成功只表明服务可响应；启动子进程成功也不等于登录成功。

## Windows 为什么特别处理

Windows 的 npm.cmd 不是普通可执行文件。runCommand 把它转成 Node + npm-cli.js，拒绝其他任意 .cmd/.bat 覆盖，避免 shell 解释。含空格参数应使用 JSON 数组，因为简单空白拆分不理解 shell 引号。

ProcessManager 的 Windows 停止路径使用 taskkill /T /F；即使调用者请求普通 stop，也不能假定它会执行 POSIX 式的温和 SIGTERM 清理。未来 App 需要单独验收子进程及浏览器是否全部退出。

## API 的认证和长期状态

所有接口在配置令牌后都要求认证，包括 health 和 SSE。SSE 是服务端向浏览器持续推送事件的单向 HTTP 长连接，不是 WebSocket。

日志、错误、运行历史存在内存里，API 重启会重置。配置和计划写入是另一回事，各自需要 API_ALLOW_* 开关。会话数据保存在现有 SQLite 数据库。

详细调用见[中文 API 使用教程](../api-tutorial.md)和[完整英文 API 参考](../../../scripts/api/README.md)。

## 正确的验证层次

编译通过 → 离线测试通过 → API 可响应 → 浏览器可启动 → 真实登录成功 → 具体活动被服务端计分。

前一个通过不能替代后一个。本次没有使用真实账号进行最后两层验证。

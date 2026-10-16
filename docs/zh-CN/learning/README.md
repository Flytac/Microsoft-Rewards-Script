# 零基础学习路线

[返回项目首页](../../../README.md)

这些章节按一次实际运行的先后关系组织。先读文字，再打开对应源码；无需先掌握所有 TypeScript 语法。

| 顺序 | 章节                                | 学完能回答                         |
| ---- | ----------------------------------- | ---------------------------------- |
| 1    | [技术与启动](01-startup.md)         | npm 命令究竟运行哪个文件？         |
| 2    | [配置与账号](02-configuration.md)   | .env、JSON 和类型校验各管什么？    |
| 3    | [登录与浏览器](03-login-browser.md) | 页面、上下文、会话有什么区别？     |
| 4    | [任务与数据](04-activities.md)      | 一个开关如何变成实际任务？         |
| 5    | [日志与控制服务](05-logging-api.md) | 日志为什么不能直接翻译？           |
| 6    | [Windows 原生使用](06-windows.md)   | 不装 Docker 怎样安装、构建与排错？ |

辅助阅读：[完整配置字段](../configuration.md)、[源码地图](../repository-map.md)、[桌面 App 可行性](../windows-desktop-feasibility.md)、[中文化范围与验证](../localization-plan.md)。

## 读代码时固定问四个问题

1. **输入从哪里来？** 参数、配置、服务器响应，还是此前保存的状态？
2. **输出是什么？** 返回值、日志、磁盘写入，还是修改 bot 对象？
3. **失败会怎样？** 抛错、返回 false/0、记录后继续，还是退出进程？
4. **为什么分层？** 这层是规则、网络、浏览器，还是展示/控制？

不要逐字翻译变量猜意思。例如 SearchManager.search() 出错返回 0，所以“0 分”不总是“成功但没有积分”。

## 学习练习

- 只阅读：从 workers.doDailySet 追踪到 DailySet.run，再找 PromotionActivityRunner。
- 纸面推演：mobile 已满、desktop 未满时，getSearchPoints 会返回哪些布尔值？
- 离线检查：执行 npm run test:log-parser，不需要 Microsoft 账号。
- 比较：修改某条英文日志的纸面示例，看看 logParser 的哪条正则将无法匹配；不要真的修改程序输出。

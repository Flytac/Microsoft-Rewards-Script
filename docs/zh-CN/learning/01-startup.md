# 01 技术与启动

[学习目录](README.md) · 下一章：[配置与账号](02-configuration.md)

## 技术之间的关系

| 技术       | 在本仓库中的职责                                | 不要混淆                           |
| ---------- | ----------------------------------------------- | ---------------------------------- |
| TypeScript | src 中的源码语言，类型帮助提前发现误用          | 类型不会自动验证服务器 JSON        |
| Node.js    | 在操作系统中执行 JavaScript、读写文件、创建进程 | 不是浏览器，也不是 Docker          |
| npm        | 按 package.json 安装依赖和执行 scripts          | npm run build 的内容由项目自己定义 |
| Patchright | 浏览器自动化库，API 与 Playwright 相关          | 库本身不是浏览器可执行文件         |
| Chromium   | 被 Patchright 驱动的浏览器进程                  | 项目不等于控制你日常打开的 Edge    |
| SQLite     | node:sqlite 保存会话与地区元数据                | 当前文件存储并不自动加密凭据       |
| Docker     | 封装 Linux 环境、挂载数据和定时启动             | Windows 原生运行不需要它           |

主链路：TypeScript → tsc 编译 → dist 中 JavaScript → Node.js 执行 → Patchright 调用 Chromium。另有 HttpClient 直接发请求；并非所有任务都有浏览器点击画面。

## npm run start 到底调用了什么

package.json 中 start 对应 node ./dist/index.js。build 对应清理 dist、tsc 编译、copyAssets.js 复制查询词资源。只复制 .ts 文件到另一台电脑不等于可运行发行包。

src/index.ts 底部直接调用 main()：检查 Node 版本 → 创建 MicrosoftRewardsBot → 注册退出/异常回调 → initialize → run。构造器已经读取 config.json，所以配置缺失会很早失败。

本项目主源码编译为 CommonJS；scripts/package.json 将辅助 .js 脚本声明为 ESM。两种模块系统并存不是乱码或重复代码，不要随意改变 package.json 的 type。

## 初学者需要的语法

- interface Account：描述对象应有的字段，不会在运行时替你检查输入。
- import type：只导入类型信息，不像普通 import 那样引入运行时依赖。
- Promise<number>：一个稍后才能得到数字的操作。await 等结果，并可能抛异常。
- async 函数：返回 Promise；Promise<void> 代表不返回业务数据。
- private：限制 TypeScript 层面的访问；不是密码加密。
- a?.b：a 不存在时得到 undefined，避免直接读取报错。
- a ?? b：仅 a 为 null/undefined 时使用 b；与 a || b 对零值/空串的处理不同。
- try/catch/finally：尝试操作、处理异常、始终执行收尾。
- Set：去重集合；Map：按键查找；WeakMap：不会因为键引用而强行保活对象。

## 两种并发

clusters > 1 使用多个 Node 工作进程，各自处理账号块。主进程收集统计和通知。AsyncLocalStorage 则在同一进程的异步调用链中保存账号/设备上下文，让并行的手机和电脑流程知道“我是谁”。

runTasks 中仍会逐个处理本进程账号。不要把 clusters 数值理解成每个活动都启动这么多线程。

## 退出与导入的边界

入口负责监听 SIGINT、SIGTERM 和异常，退出前尝试排空通知队列、关闭会话库。部分路径直接 process.exit。

未来桌面 UI 不应直接 import src/index.ts 然后期待它只提供类：导入本身会触发主入口。先以独立子进程复用现有脚本更容易保持行为边界。这是未来建议，本次没有改入口。

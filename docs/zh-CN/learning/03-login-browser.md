# 03 账号登录与浏览器控制

[学习目录](README.md) · 下一章：[任务与数据](04-activities.md)

## Browser、BrowserContext、Page

Browser 是浏览器进程，BrowserContext 是隔离的浏览环境，Page 是其中的标签页。Context 管理 Cookie、站点存储、语言等；Page 用于导航和定位元素。

Browser.ts 创建 Chromium、读取保存会话、选择/生成指纹，再建立 Context。移动与桌面走不同设备配置。返回 { context, fingerprint }，让上层同时拿到环境和对应元数据。

浏览器启动成功后若 Context 创建失败，catch 会关闭浏览器。BrowserFunc.closeBrowser 的 finally 也负责清理，避免保存会话失败后遗留浏览器进程。

## 为什么登录需要状态机

微软可能依次显示邮箱、密码、验证码，也可能先出现登录方式选择或 Authenticator 提示。Login.ts 不假设唯一顺序，而是不断：

检测 URL/元素 → 得到 LoginState → handleState 分发 → 等待页面变化 → 再检测。

总循环上限为 25；重复卡在某些同状态时尝试刷新。页面检测同时检查多个元素，最后按优先级选状态，不能以“谁先返回”决定状态。

EmailLogin 返回 ok 只说明这次填写/点击步骤结束。最终还要验证 Bing 并获取 Rewards 上下文。一些验证失败路径仅警告后继续；阅读代码时必须看 throw、return 和日志分别出现在哪里。

## 登录完成后还要 bootstrap

BrowserFunc.bootstrap 读取 earn 与 dashboard 页面，提取网页快照、路由状态和动态 action 标识。ReactFunc 负责相关页面数据解析，FlyoutDashboard 提供仪表盘数据适配。

网站的服务端动作标识可能随部署改变，所以程序从当前页面/脚本发现它们，而不简单写死常量。读取到页面不代表解析到可用活动；需要检查快照和 action 是否齐全。

## 会话为何保存在 SQLite

SessionStore 用 email + platform 联合键区分同一账号的手机和电脑登录。storageState 保存 Cookie/站点存储，fingerprint 保存设备描述，account_metadata 保存已解析地区。

loadSession 会清理过期 Cookie，有时会更新数据库；它不是严格的只读查询。保存状态时不覆盖已有指纹，保存指纹时也不擦除状态，这是 UPSERT 指定更新字段的原因。

数据库使用 WAL、busy_timeout 等参数协调访问；POSIX 文件权限不等于 Windows ACL，更不代表内容加密。

## 媒体拦截为何放在后面

MediaBlocker 使用 Context 级路由处理图片和媒体请求。登录流程先暂停拦截，成功保存会话后再配置拦截，避免二维码、认证图片和视频受影响。WeakMap 保存各 Context 状态，重复调用不反复安装路由。

手动登录运行在有桌面的电脑上，采用独立工具，不调用自动 Login 状态机。默认 Docker 无头镜像不能直接显示这个交互窗口。

## 怎样阅读其他登录方法

auth/methods 分别封装无密码、TOTP、邮件代码、恢复邮箱和移动令牌流程。先读 Login.handleState 的对应 case，再进入具体方法；不要把 TOTP 共享密钥、一次性六位码、Microsoft accessToken 和 Control API 的 API_TOKEN 当成同一种东西。

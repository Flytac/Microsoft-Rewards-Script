# 02 配置加载与账号校验

[学习目录](README.md) · 下一章：[登录与浏览器](03-login-browser.md)

## 三种不同的信息

.env 是“用哪个账号及其环境”，config.json 是“做什么任务、等待多久”，package.json 是“项目怎样安装和启动”。英文配置键是程序接口，不能翻译成中文。

src/util/Load.ts 的 resolveProjectFile 按当前工作目录、项目根目录、dist、src 寻找文件。优先使用第一份找到的文件，因此启动目录很重要。Windows 快捷方式的“起始位置”错误也会影响读配置。

ensureEnvLoaded 只解析一次 .env：去空白、跳过 # 注释、按第一个等号拆分、去掉成对引号。只在 process.env 尚未定义时填入，意味着已有系统环境变量优先。这个实现不是支持任意 shell 语法的解释器。

## 账号如何变成对象

getAccountIndexes 筛选 ACCOUNT_正整数_EMAIL；编号可不连续，非空邮箱才纳入，按数值升序处理。

loadAccounts 把 EMAIL、PASSWORD、GEO_LOCALE、LANG_CODE、PROXY 等映射成 Account，再交给 validateAccounts。字段名不相同的地方由代码负责转换，不能自己把 .env 改成 Account 对象字段名。

返回 Account[] 意味着数组的每个成员都通过账号模式校验；无账号或格式错误会抛出异常。账号密码可以不填，但是否能完成登录仍取决于账号配置的认证方式。

## 为什么既有 TypeScript 又有 Zod

TypeScript 只在编译时帮助检查源代码。JSON.parse 接收磁盘上的任意文本，网络响应也来自程序之外。Validator.ts 的 Zod 模式才承担运行时验证。

validateConfig 先补缺失字段，再校验；失败后尝试沿错误路径填默认值，并再次校验。仍不合格就抛错。这不是“随便写都能修复”。

注意存在三个层面：示例 config.example.json、Validator 内部默认值、Docker 环境覆盖。示例字段值不一定等于所有缺省回填值。现有配置表明确以示例文件为基准。

## 缓存与保存不是一回事

loadConfig 解析成功后存在进程内 configCache。改磁盘文件不会让旧进程立即刷新。停止、按上游步骤重新构建并重启，才是简单明确的操作方式。

Docker 把 CONFIG_* 覆盖到配置，不能把 compose 行为泛化成所有本机入口都自动支持同样的覆盖。手动登录工具有自己的少量覆盖逻辑。

## 安全练习

仅用 env.example 的占位值阅读，不把真实 .env 提交到 GitHub。阅读 .gitignore 可以理解默认忽略规则，但不要把忽略规则当成凭据已加密。会话库内可能保留 Cookie，诊断文件可能包含页面内容。

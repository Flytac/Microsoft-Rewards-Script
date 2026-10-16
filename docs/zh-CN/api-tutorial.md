# Control API 中文使用教程

[返回首页](../../README.md) · [逐字段英文参考](../../scripts/api/README.md)

本文按上游 API 说明整理常用操作与边界；响应字段、URL、命令和错误标识保持英文。完整的逐接口大型响应样例保留在英文参考中。它是教程，不是 API 已在你电脑运行的证明。

## 1. 准备与启动

完成原生安装、构建、.env 和 config.json 准备，再在本机 .env 中设置 API_HOST=127.0.0.1、API_PORT=3010 与自己的 API_TOKEN。

```powershell
npm run api
$rewardsHeaders = @{ Authorization = "Bearer 替换为本机令牌" }
Invoke-RestMethod -Uri "http://127.0.0.1:3010/health" -Headers $rewardsHeaders
```

令牌可用 node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 生成，不要上传。npm run api 只开启控制服务，不自动运行本机账号任务。

也可通过 npm run api -- --token "YOUR_API_TOKEN" 传入；环境/.env 中令牌优先。修改认证配置后重启 API。

## 2. 认证与请求约定

设置 API_TOKEN 后所有接口均需令牌。支持 Authorization: Bearer 或 X-API-Key；只有 /events 支持 query token 以适配浏览器 EventSource。

JSON 请求声明 Content-Type: application/json；空请求体当作 {}。请求体上限为 1,000,000 字节。未知路由返回 404，OPTIONS 预检返回 204。CORS 控制浏览器跨来源访问，不是认证替代品。

无认证模式只能用于可信机器回环地址，不能通过端口发布或反向代理变成公开服务。

## 3. 只读接口

| 路径             | 内容                     | 如何理解                                |
| ---------------- | ------------------------ | --------------------------------------- |
| GET /            | 接口概要                 | 服务说明                                |
| GET /health      | 健康、版本、运行时长     | ok 不表示账号任务成功                   |
| GET /status      | 当前进程状态、运行摘要   | running 是进程状态                      |
| GET /points      | 解析得到的积分与账号数据 | 不是每次向微软重新查询                  |
| GET /logs        | 缓存日志                 | 默认最近 200 条                         |
| GET /errors      | 警告/错误及账号失败      | 默认 limit=100，warnings=false 只看错误 |
| GET /history     | 最近完成记录             | 内存保存，重启丢失                      |
| GET /accounts    | 配置账号摘要             | 不应当作密码获取接口                    |
| GET /sessions    | 会话元数据               | 不返回 Cookie 或指纹内容                |
| GET /diagnostics | 诊断目录清单             | 文件可能含个人信息                      |
| GET /config      | 当前配置                 | 敏感值默认遮蔽                          |
| GET /schedule    | 有效定时设置             | 区分基础值和持久化覆盖                  |

/logs 支持 limit、afterId、level。level 是最低严重性，例如 warn 包括 warn/error。afterId 返回缓存中更新的条目，不是永久日志游标；旧日志可能已被环形缓存淘汰。

诊断条目仅允许 screenshot.png、error.txt、dump.html 等指定文件名；不要尝试把该接口当任意文件浏览器。

## 4. 启动、停止与重启

```powershell
# 真正启动 ACCOUNT_2
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:3010/start" -Headers $rewardsHeaders -ContentType "application/json" -Body '{"accountIndex":2}'

# 请求停止当前任务
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:3010/stop" -Headers $rewardsHeaders -ContentType "application/json" -Body '{}'
```

/start 请求体 {} 表示全部配置账号；accountIndex 指 .env 的槽位编号；excludedAccountIndexes 可指定排除的编号，例如 [2,4]。只选一个与排除列表不要混用。

/restart 停止后重新启动；/shutdown 关闭控制服务，不等于仅停止一轮任务。已有任务运行时重复 /start 会冲突。args/env 属于高级启动覆盖，env 需要显式 API_ALLOW_ENV_OVERRIDES；不要让普通界面任意注入执行环境。

## 5. 会话删除

DELETE /sessions/:email 删除指定账号的移动/桌面保存会话；邮箱必须做 URL 编码，例如 user%40example.com。没有对应记录会返回 404 SESSION_NOT_FOUND。没有“删除全部”的 API 路由。

先停止活动运行再删除，否则运行进程可能把会话再次保存回来。删除会话不会删除微软账号，但通常需要重新登录。

## 6. SSE 实时事件

GET /events 持续推送状态/日志。初次连接先收到 hello；日志具有递增 id，客户端可在重连时使用 Last-Event-ID 请求仍在缓存中的后续日志。

SSE 是单向事件流，启动和停止仍通过 HTTP 请求完成。需要长期历史时由自己的面板另行存储。EventSource URL 里的令牌不要写入公开截图或共享链接。

## 7. 修改配置与计划

| 操作                 | 必要开关                            | 结果                                     |
| -------------------- | ----------------------------------- | ---------------------------------------- |
| PATCH /config        | API_ALLOW_CONFIG_WRITE=true         | 合并部分配置后校验                       |
| PUT /config          | API_ALLOW_CONFIG_WRITE=true         | 替换配置并校验                           |
| GET /config?reveal=1 | API_ALLOW_CONFIG_REVEAL=true 且认证 | 允许查看敏感配置                         |
| PATCH/PUT /schedule  | API_ALLOW_SCHEDULE_WRITE=true       | 持久化并在支持的 Docker API 模式应用计划 |

配置替换前尽力备份为 config.json.bak。计划保存到 config/schedule.json，优先于 CRON_SCHEDULE。不能把本机 API 返回一个 cron 字符串误认为 Windows 已安装定时任务。

完整请求体约束与响应见英文参考对应章节；先 GET 查看当前结构，再按受支持字段修改，不要凭中文显示标签拼 JSON。

## 8. 错误排查

400：参数或 JSON 不合法；401：令牌缺失/不匹配；403：相应能力不允许；404：资源/路由不存在；409：运行状态冲突。具体以 error/code/hint 和对应端点说明为准。

客户端超时不一定意味着服务端任务已取消。再次启动前先查询 /status，避免重复操作。服务启动后也应检查 dist 与浏览器是否准备好，不能只测试端口。

全部 API 环境变量中文含义见[API 入门表](architecture-and-api.md#api-环境变量中文表)。

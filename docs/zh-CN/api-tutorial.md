# 控制 API 与运行状态查看

[返回首页](../../README.md) · [完整英文 API 参考](../../scripts/api/README.md)

API 是可选功能；只看容器日志不需要启用。它提供 HTTP 状态/日志/启停接口，本身不包含完整网页面板。默认本机地址为 http://127.0.0.1:3010。

## Windows 原生开启

先完成正常安装和构建，在 .env 追加：

```dotenv
API_HOST=127.0.0.1
API_PORT=3010
API_TOKEN=replace-with-a-long-random-token
```

生成自己的令牌（仅在本机保存）：

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm.cmd run api
```

将生成值写入 .env 再启动服务。npm run api 只开启控制服务，需 /start 才开始本机任务；修改认证后重启 API。终端显示开始监听且 /health 可响应才算 API 可用。

## Docker 开启

按[compose 示例](compose.md#api-模式变量)合并 API_MODE、API_TOKEN 与 ports；设置 .env 的同一令牌，再运行：

```bash
docker compose config --quiet
docker compose up -d --force-recreate
docker compose logs --tail 100
```

Linux 根据部署方式加 sudo。端口建议 '127.0.0.1:3010:3010'，API_HOST 在容器内为 0.0.0.0；二者分别控制容器监听与宿主机暴露范围。

远程服务器仅发布回环地址时，在自己电脑打开 SSH 隧道：

```powershell
ssh -N -L 3010:127.0.0.1:3010 your-user@your-server
```

替换用户/服务器地址，保持隧道窗口运行，然后从电脑访问本地 3010。不要把无认证 API 发布到公网。

## PowerShell 查询和控制

下面令牌必须与 .env 一致：

```powershell
$rewardsHeaders = @{ Authorization = 'Bearer replace-with-your-api-token' }
Invoke-RestMethod -Uri 'http://127.0.0.1:3010/health' -Headers $rewardsHeaders
Invoke-RestMethod -Uri 'http://127.0.0.1:3010/status' -Headers $rewardsHeaders
Invoke-RestMethod -Uri 'http://127.0.0.1:3010/logs?limit=50' -Headers $rewardsHeaders
Invoke-RestMethod -Uri 'http://127.0.0.1:3010/errors?warnings=false' -Headers $rewardsHeaders
```

health.ok=true 表示服务健康，status.state=idle 表示目前空闲，不是账号成功计分。

这些请求会改变运行状态，确认需要时使用：

```powershell
# 启动全部配置账号
Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:3010/start' -Headers $rewardsHeaders -ContentType 'application/json' -Body '{}'
# 停止本轮
Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:3010/stop' -Headers $rewardsHeaders -ContentType 'application/json' -Body '{}'
```

只运行槽位 ACCOUNT_2 使用 {"accountIndex":2}；全部但排除 2、4 使用 {"excludedAccountIndexes":[2,4]}。不要同时传两种选择。停止任务不等于关闭 API；容器还会保留定时，需停容器/计划才会停用后续运行。

## Linux cURL 查询

```bash
curl --fail-with-body --header 'Authorization: Bearer replace-with-your-api-token' http://127.0.0.1:3010/health
curl --fail-with-body --header 'Authorization: Bearer replace-with-your-api-token' http://127.0.0.1:3010/status
```

不要把含真实令牌的历史命令或输出公开分享。

## 接口用途

| 接口                         | 用途                                                          |
| ---------------------------- | ------------------------------------------------------------- |
| GET /health、/status         | 控制服务健康、当前任务状态                                    |
| GET /points                  | 已解析的积分及账号统计，不保证每次重新向微软查余额            |
| GET /logs、/errors           | 内存缓存日志、警告/错误                                       |
| GET /history、/accounts      | 近期运行、账号摘要                                            |
| GET /sessions                | 保存会话的元数据，不返回 Cookie                               |
| GET /events                  | SSE 单向实时事件流；只有该路径允许 EventSource 使用 URL token |
| GET /diagnostics             | 已开启的诊断资料，可能包含私人页面                            |
| GET /config、/schedule       | 配置与有效计划，敏感信息默认遮蔽                              |
| POST /start、/stop、/restart | 启动、停止、重启任务                                          |
| POST /shutdown               | 关闭控制服务及相关运行                                        |
| DELETE /sessions/:email      | 删除指定账号会话，会导致重新认证                              |
| PATCH/PUT /config、/schedule | 修改配置/计划，需相应 API_ALLOW_* 权限                        |

日志、错误、历史缓存位于内存，API 重启会清空。长期历史由面板另存。真实 Cookie/Token 不应通过这些接口向公开网络暴露。

## 认证与排错

所有接口在 API_TOKEN 设置后均需认证。支持 Authorization: Bearer 和 X-API-Key。400 查参数/JSON，401 查令牌，403 查权限开关，404 查路由/资源，409 查已有任务。

默认写入、环境覆盖、敏感值揭示全部关闭。不要为了只读状态一次性开启全部开关；完整变量在[既有 API 变量表](architecture-and-api.md#api-环境变量中文表)，复杂请求和响应见[英文参考](../../scripts/api/README.md)。

API 修改的 Docker 计划保存在 config/schedule.json，可能优先于基础 cron；本机单独启动 API 不代表已经安装 Windows 定时任务。

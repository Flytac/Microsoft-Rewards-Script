# compose.yaml 逐项中文说明

[返回首页](../../README.md) · [中文注释完整示例](examples/compose.zh-CN.yaml) · [config 字段](configuration.md)

本表对应仓库根目录 compose.yaml，保留其默认行为。中文示例的**有效值与原样例相同**，只改注释；不要因为阅读中文文档就改变自己的账号、时区或代理。

## 服务、镜像和挂载

| 配置路径                          | 当前值/状态                                       | 实际作用                                                      |
| --------------------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| services                          | 顶层服务集合                                      | 描述 Compose 要管理哪些服务                                   |
| services.microsoft-rewards-script | 服务键                                            | compose 命令中可选的服务名称                                  |
| image                             | ghcr.io/thenetsky/microsoft-rewards-script:4      | 上游已构建镜像；:4 会移动，不等于你的 Fork 提交               |
| build.context                     | 注释，示例 .                                      | 从本目录 Dockerfile 构建的可选方式；不是默认拉取流程          |
| container_name                    | microsoft-rewards-script                          | 固定容器名称；同机另一份部署会冲突，需要改名和隔离目录        |
| restart                           | unless-stopped                                    | Docker 重启策略；不会替你设每日运行，也不能在宿主机关机时工作 |
| volumes: ./config                 | 挂载到 /usr/src/microsoft-rewards-script/config   | 配置、可选 schedule.json 的持久目录                           |
| volumes: ./sessions               | 挂载到 /usr/src/microsoft-rewards-script/sessions | 登录状态目录，包含 sessions.db                                |
| env_file.path                     | .env                                              | 把账号等变量注入容器；路径相对根 compose 所在目录             |
| ports                             | 默认注释                                          | API 模式需要时才发布端口；任务本身无需入站端口                |

相对路径以 Compose 文件所在位置解释，因此不要直接用 -f docs/zh-CN/examples/compose.zh-CN.yaml 启动。可先备份根 compose.yaml，再把中文示例**复制到根目录**；Windows 用 Copy-Item，Linux 用 cp。确认 --quiet 校验通过后再启动。

容器需要的运行环境已经在镜像中，宿主机无需 npm。自建镜像属于不同流程：停用 image 的预构建来源并启用 build，执行 docker compose build，再 up；先核对 Dockerfile 和目标架构，不要把文档更新当作镜像发布。

## 时间与调度变量

| 变量                        | 默认值/状态        | 解释                                                                             |
| --------------------------- | ------------------ | -------------------------------------------------------------------------------- |
| TZ                          | America/Toronto    | 容器使用的时区，示例可改 Asia/Hong_Kong；不是自动定位                            |
| NODE_ENV                    | production         | Node 生产环境标记，不是活动开关                                                  |
| CRON_SCHEDULE               | 0 7 * * *          | 在 TZ 指定时区每天 07:00 触发                                                    |
| RUN_ON_START                | true               | 每次容器启动额外触发一轮；入口对此轮强制跳过随机等待                             |
| SKIP_RANDOM_SLEEP           | false              | 对定时等 run_daily 流程是否跳过随机等待                                          |
| MIN_SLEEP_MINUTES           | 注释，程序回退 5   | 随机等待下限，非负整数，单位分钟                                                 |
| MAX_SLEEP_MINUTES           | 注释，程序回退 50  | 随机等待上限，必须不小于下限                                                     |
| STUCK_PROCESS_TIMEOUT_HOURS | 注释，程序回退 8   | 容器 run_daily 锁清理/API 触发等待相关的超时阈值；不是所有 HTTP/浏览器操作的超时 |
| CONFIG_AUTO_SYNC            | 未列出，默认 false | 可选新增：自动补齐示例中的缺失配置键，已有配置先备份；默认只报告                 |

cron 五段依次是“分 时 日 月 周”。常用例：

| 表达式      | 含义             |
| ----------- | ---------------- |
| 0 7 * * *   | 每天 07:00       |
| 30 8 * * *  | 每天 08:30       |
| 0 7 * * 1-5 | 周一到周五 07:00 |

使用英文单引号包住表达式。触发不是准点完成：后续还可能随机等待、登录或网络重试。首次先观察一轮，不建议把频率调得很高。

## API 模式变量

| 变量                     | 根示例状态              | 用途                                                         |
| ------------------------ | ----------------------- | ------------------------------------------------------------ |
| API_MODE                 | 注释（关闭）            | true 时以控制服务为主进程；false 是默认调度模式              |
| API_TOKEN                | 注释，引用 ${API_TOKEN} | 从宿主 Compose 环境/.env 插值，为 API 提供认证；不是微软令牌 |
| API_ALLOW_SCHEDULE_WRITE | 注释，默认 false        | 允许修改计划                                                 |
| API_ALLOW_ENV_OVERRIDES  | 注释，默认 false        | 允许启动/重启请求覆盖运行环境                                |
| API_ALLOW_CONFIG_REVEAL  | 注释，默认 false        | 允许认证客户端请求显示敏感配置                               |
| API_ALLOW_CONFIG_WRITE   | 注释，默认 false        | 允许写配置                                                   |
| API_HOST                 | 容器入口默认 0.0.0.0    | 可选显式设置，供容器映射访问；宿主机端口仍可只绑定 127.0.0.1 |
| API_PORT                 | 控制服务默认 3010       | 可选修改监听端口，映射右侧需对应                             |

可选启用 API 时，.env 加入自己的随机长 API_TOKEN，compose 对应部分改为：

```yaml
environment:
    API_MODE: 'true'
    API_TOKEN: '${API_TOKEN}'
    API_HOST: '0.0.0.0'
    API_PORT: '3010'
ports:
    - '127.0.0.1:3010:3010'
```

这是局部片段，应合并到原有 environment、同级 ports；一个服务不能写两个重复 environment。未使用的 API_ALLOW_* 保持关闭。新手不需要为查看基本容器日志开启 API。

Docker API 模式下已保存的 config/schedule.json 优先于 CRON_SCHEDULE；调度模式不会自动套用同样的 API 计划管理逻辑。改基础 cron 后仍不生效，应先查看 GET /schedule 的有效来源，别直接删文件。

## 根示例列出的 CONFIG_* 覆盖

| 变量                                   | 对应配置                      | 实际用途                                 |
| -------------------------------------- | ----------------------------- | ---------------------------------------- |
| CONFIG_CLUSTERS                        | clusters                      | 账号集群并发数量                         |
| CONFIG_ACCOUNT_DELAY_MIN / MAX         | accountDelay.min / max        | 账号间最短/最长等待                      |
| CONFIG_CONTINTUE_ON_BOT_WARNING        | contintueOnBotWarning         | 收到机器人评分警告后继续；不推荐         |
| CONFIG_EXPERIMENTAL_BLOCK_MEDIA        | experimental.blockMedia       | 认证后阻止图片/媒体，可影响页面行为      |
| CONFIG_EXPERIMENTAL_EDGE_BROWSING      | experimental.edgeBrowsing     | 实验性 Edge 后台活动                     |
| CONFIG_PROXY_IGNORE_CERTIFICATE_ERRORS | proxy.ignoreCertificateErrors | 关闭浏览器证书校验，普通代理应保持 false |

全部已支持的 CONFIG_* 映射在[配置表](configuration.md#docker-覆盖变量完整映射)。布尔值用字符串 'true'/'false'，数组用逗号分隔字符串；正则直接写合法 JSON。

覆盖每次容器启动都会写入配置；删掉覆盖变量也不会自动把之前的值还原为默认。需要恢复时明确编辑 config/config.json，随后重建容器并检查。

## 健康检查与安全设置

| 配置项                   | 当前值                                  | 含义                                             |
| ------------------------ | --------------------------------------- | ------------------------------------------------ |
| healthcheck.test         | CMD-SHELL scripts/docker/healthcheck.sh | 默认检查 cron；API 模式向本机 /health 发认证请求 |
| healthcheck.interval     | 60s                                     | 检查间隔                                         |
| healthcheck.timeout      | 5s                                      | 单次检查超时                                     |
| healthcheck.retries      | 3                                       | 连续失败达到阈值后标记 unhealthy                 |
| healthcheck.start_period | 30s                                     | 启动宽限时间，不保证业务任务30秒内完成           |
| security_opt             | no-new-privileges:true                  | 限制容器进程获得额外权限，不是账号防封功能       |

healthy 只代表调度/服务检查通过，不等于浏览器登录、活动计分已验证。

## 可选的日志与诊断保存

默认 Docker 日志没有在本 compose 中指定轮转，可在服务级加入：

```yaml
logging:
    driver: json-file
    options:
        max-size: '10m'
        max-file: '3'
```

修改后重建容器。历史日志可能轮转消失，长期保存请自行导出。

diagnostics 默认没有挂载到宿主机；需要持久化时在 volumes 中另加 ./diagnostics:/usr/src/microsoft-rewards-script/diagnostics，并开启 errorDiagnostics。诊断可能包含私人页面，勿公开上传。

## 修改后如何应用

```bash
docker compose stop
docker compose config --quiet
docker compose up -d --force-recreate
docker compose logs --tail 100
```

Linux 按部署方式加 sudo。仅 restart 不能重新注入已编辑的 env_file。更新前备份 .env、compose、config、sessions；不以删除目录代替排错。

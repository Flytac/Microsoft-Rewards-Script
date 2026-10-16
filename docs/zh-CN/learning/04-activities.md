# 04 任务执行、搜索与积分

[学习目录](README.md) · 下一章：[日志与控制服务](05-logging-api.md)

## 沿一条真实路径阅读

workers.doDailySet → index.ts 的 Main → Activities.doDailySet(data) → DailySet.run(data) → PromotionActivityRunner.run(pending)。

DailySet 按当天日期选择未完成且有积分的项目。共享分发器先识别 promotionType，只处理支持的类型，再区分 ExploreOnBing 与普通 URL reward。不是标题看起来像任务就随便点击。

Activities 是门面：让调用者面对一致的 doXxx 接口。是否启用 API 搜索在这里选择，主流程不用复制每种传输实现。

## 配额与次数是两种单位

SearchProgress 汇总 mobileSearch、pcSearch，并识别明确标注的 Edge 项。每项 earned 限制在 0 到 max，再求 remaining。

SearchManager 将 desktop 与 edge 合并为桌面执行额度，移动额度单独处理。手机已满而桌面未满，桌面仍可执行。remaining 代表积分缺口，不能直接当作要发出的搜索次数。

search() 捕获异常后返回 0 并记录错误，因此 UI 以后必须同时查看状态与日志，不能仅凭返回数字区分成功/失败。

## 查询词队列为什么分两层

QueryEngine 从配置来源获取主题、规范化、去重。SearchQueryQueue 保留主题池及当前主题簇：

1. 需要时补充主题池。
2. 取一个没见过的主题。
3. 按需取得该主题的建议查询，排除已出现查询。
4. 完成当前簇后再进入下一主题。
5. 无新内容时返回 null，由调用方结束。

seenTopics 防重复主题，seenQueries 防不同主题产生相同查询。懒扩展避免初始化时把所有建议请求都发送出去。

## 网络成功不等于业务成功

Http.ts 负责头合并、参数编码、JSON/文本解析和重试。泛型 HttpResponse<T> 只告诉编译器“预期形状”，不会保证真实响应符合 T。

DailyCheckIn 先检查 App 令牌，再提交签到。它用返回余额减旧余额计算收益；只有正增量才更新统计。成功返回 HTTP 状态并不能证明奖励增加。

重试也不是越多越好：外部写请求是否幂等由具体服务和协议决定。此次只解释已有行为，不调整重试规则或请求体。

## 其他活动去哪里找

rewards：每日任务、更多活动、打卡卡片。app：签到、阅读、App 活动。api：领取、URL 奖励、保护等单动作。visualSearch：视觉搜索及浏览器传输。experimental：API 搜索与 Edge 后台活动。

Main 有普通和实验路径，后台 Promise 也可能比前台任务更晚结束。日志顺序不保证等于所有任务的启动/完成顺序。阅读复杂活动时先找入口、提前 return、try/catch/finally，再追踪 HTTP 或 Page 调用。

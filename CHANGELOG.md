# Changelog

## 0.6.0 (2026-09-13)

- **成员停滞检测**：孤儿尝试自动回收（owner 会话消失 ≥5min）；停车超 30 分钟 / 运行超 60 分钟无进度 → 队长邮箱提醒（每次尝试至多一次，去重）
- **契约修订流**：队长可在任务运行中修订 objective/inScope/outOfScope/acceptance/verify，旧契约入历史（上限 5）；成员修订被明确拒绝
- **operations.jsonl 面板时间线**：快照携带最近 50 条操作记录，面板折叠视图展示
- **成本观测**：任务终结时捕获 owner 会话累计 token（经 token-meter 投影，尽力而为）；面板显示每成员/每任务用量
- **修复回路源标记**：Repair 任务行显示 `↻ 源任务id`

## 0.5.0 (2026-09-13)

- 任务产物工件化：>8000 字输出自动落盘 `artifacts/`，team.json 保留 2000 字预览 + 引用
- 进度上报：`teamsx_update_task({ progress })`，进度日志封顶 20 条，面板 💬 徽标
- attempt 计时：`attemptStartedAt` 打点/清除
- token 级成本核算暂缓（待 token-meter 服务集成）

## 0.4.0 (2026-09-13)

- 面板任务徽标：修复轮次 R{n}、影子接管、verdict、耗时
- 内置团队模板：research-review / implement-verify / full-cycle（用户同名覆盖）
- 邮箱事件摘要化：message-sent 事件截断至 240 字（全文在邮箱）
- 修复：resolveTeamProfile 种子 id 归一化只重映射依赖不重映射任务 id

## 0.3.0 (2026-09-13)

- 影子接管：队长接管不锁死贡献者（takenOverBy 标记，成员保留提交权，idle 自动归还）
- 惰性对账器：captain-owned 搁浅任务回收（kickTeam 前置 + 60s 清扫）
- 修复回路去重：同源 open repair 不重复派生；源任务 pass 后级联取消
- operations.jsonl 结构化操作日志（1MB 轮转）
- 跨进程文件锁默认开启；文件锁跨突发持有（500 次并发 300ms → 6.6ms）
- round 上限到达：显式失败 + 队长邮箱通知

## 0.2.2 (2026-09-11)

- 活动面板改为锚徽标向右展开（移除桌面左侧栏入口）

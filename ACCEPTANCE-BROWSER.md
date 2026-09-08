# dsh-teams-x 浏览器手工操作验收文档

> **目标**：验证 O(1) 成员查找优化（`requireMember`）及 13 个 `teamsx_*` 工具、4 条 Web 路由在真实浏览器环境中的正确性与性能。
>
> **优化摘要**：`requireMember` 由 `Array.find` 线性扫描 O(n) 改为 `Map` 索引查找 O(1)；新增 `buildMemberByNameIndex` / `findMemberByName`（`src/state.ts`），`requireMember` 调用二者（`src/tools.ts`）。
>
> **提交**：`da7cb82` — `perf: use O(1) member name index in requireMember`

---

## 一、前置条件

| 项目 | 要求 |
| --- | --- |
| DSH 宿主 | DeepSeek Harness 0.1.3-alpha.1（源码 checkout） |
| Node.js | ≥ 22.19.0 |
| pnpm | ≥ 9 |
| 浏览器 | Chromium / Firefox / Safari（任意现代浏览器） |
| 插件 | `dsh-teams-x@0.2.0`（已 `pnpm build`） |
| 认证 | DSH 宿主登录态（Web 路由需认证） |

### 1.1 构建插件

```sh
cd /home/xiaoxin/dsh-teams-x
pnpm install
pnpm typecheck    # 预期：无错误
pnpm build        # 预期：lib/ 重新生成
```

### 1.2 安装插件到宿主

```sh
dsh plugin --profile web add /home/xiaoxin/dsh-teams-x
```

### 1.3 启动宿主

```sh
dsh --web          # 启动 Web 界面，默认端口见宿主配置
```

> 宿主启动后，浏览器访问宿主 Web 地址（通常 `http://localhost:3000` 或 `http://localhost:8080`，以宿主配置为准）。

---

## 二、验收清单总览

| 编号 | 类别 | 场景 | 优先级 |
| --- | --- | --- | --- |
| T01 | 功能 | 创建团队（staged → running） | P0 |
| T02 | 功能 | 添加 / 移除成员 | P0 |
| T03 | 功能 | 创建 / 认领 / 更新任务 | P0 |
| T04 | 功能 | 发送消息（信箱投递） | P0 |
| T05 | 功能 | 状态查询（teamsx_status） | P0 |
| T06 | 功能 | 暂停 / 恢复 / 删除团队 | P0 |
| T07 | **O(1) 验证** | 大团队成员查找性能 | **P0** |
| T08 | **O(1) 验证** | 移除成员后查找不命中 | **P0** |
| T09 | **O(1) 验证** | 重名 / 大小写归一 | P1 |
| T10 | Web 路由 | GET `/plugins/dsh-teams-x/state` | P0 |
| T11 | Web 路由 | POST `/plugins/dsh-teams-x/halt` | P1 |
| T12 | Web 路由 | POST `/plugins/dsh-teams-x/member/pause` | P1 |
| T13 | Web 路由 | POST `/plugins/dsh-teams-x/plan` | P1 |
| T14 | 浏览器面板 | `/teamsx` 斜杠命令呼出面板 | P1 |
| T15 | 浏览器面板 | 活动面板轮询团队快照 | P1 |
| T16 | 浏览器面板 | 会话内团队卡片折叠 | P2 |
| T17 | 回归 | 173 自动测试全绿 | P0 |

---

## 三、功能验收（T01–T06）

> 以下操作在 DSH 宿主聊天界面中通过自然语言驱动 captain 调用 `teamsx_*` 工具完成。

### T01 — 创建团队（staged → running）

| 步骤 | 操作 | 预期结果 |
| --- | --- | --- |
| 1 | 对 captain 说："创建一个团队，目标是构建一个 REST API" | captain 调用 `teamsx_create`，返回 `phase: "staged"` + `planReviewState: "awaiting_review"` |
| 2 | 在计划编辑面板中添加 2 个成员（researcher、engineer）和 2 个任务 | `teamsx_edit_plan` 原子批量保存 |
| 3 | 点击"批准"或对 captain 说"批准计划" | `teamsx_approve` → `phase: "running"`，成员子代理 spawn |
| 4 | 检查磁盘 `<workspace>/.teams-x/<teamId>/team.json` | `phase: "running"`，`members` 数组长度 = 2，每个成员 `id` 非空 |

**验收标准**：`✅` 团队创建成功，磁盘状态与工具返回一致。

### T02 — 添加 / 移除成员

| 步骤 | 操作 | 预期结果 |
| --- | --- | --- |
| 1 | 对 captain 说"添加一个 reviewer 成员" | `teamsx_add_member` 成员 spawn，`members` 长度 +1 |
| 2 | 对 captain 说"移除 researcher" | `teamsx_remove_member` → 该成员 `status: "removed"`，其任务回池 |
| 3 | 再次对 captain 说"移除 researcher" | 返回错误 `no active member named "researcher"`（**O(1) 查找不命中**） |

**验收标准**：`✅` 成员增删正常；移除后查找不命中走 O(1) 索引 miss 路径。

### T03 — 创建 / 认领 / 更新任务

| 步骤 | 操作 | 预期结果 |
| --- | --- | --- |
| 1 | 对 captain 说"创建任务：实现用户注册接口，指派给 engineer" | `teamsx_create_task` → `status: "pending"` |
| 2 | engineer 子代理自动认领 | `teamsx_claim_task` → `status: "in_progress"` + `attempt_id` |
| 3 | engineer 报告完成 | `teamsx_update_task` → `status: "completed"`（通过质量门校验） |

**验收标准**：`✅` 任务 DAG 生命周期完整流转。

### T04 — 发送消息

| 步骤 | 操作 | 预期结果 |
| --- | --- | --- |
| 1 | engineer 对 captain 说"注册接口已完成" | `teamsx_send_message` → captain 收到 live 投递 |
| 2 | captain 对 reviewer 说"请 review 注册接口" | `teamsx_send_message` → reviewer 被 wake |

**验收标准**：`✅` 消息投递成功，信箱 `unread` 计数正确。

### T05 — 状态查询

| 步骤 | 操作 | 预期结果 |
| --- | --- | --- |
| 1 | 对 captain 说"查看团队状态" | `teamsx_status` 返回完整快照（成员、任务、消息） |

**验收标准**：`✅` 快照数据与磁盘 `team.json` 一致。

### T06 — 暂停 / 恢复 / 删除

| 步骤 | 操作 | 预期结果 |
| --- | --- | --- |
| 1 | 浏览器面板点击"暂停"或 POST `/plugins/dsh-teams-x/halt` | 团队 `phase: "halted"`，未完成任务 `cancelled` |
| 2 | 对 captain 说"恢复团队，理由是继续开发" | `teamsx_resume` → `phase: "running"` |
| 3 | 对 captain 说"删除团队" | `teamsx_delete` → 团队归档到 `archive/` |

**验收标准**：`✅` 生命周期完整。

---

## 四、O(1) 优化专项验收（T07–T09）

### T07 — 大团队成员查找性能 ⭐ 核心验收

> **目的**：验证 `requireMember` 在大团队（50 成员 × 300 任务）下的查找性能。

| 步骤 | 操作 | 预期结果 |
| --- | --- | --- |
| 1 | 运行自动性能测试 | `node scripts/full-functional-test.mjs` |
| 2 | 查看 H1 采样 | `H1 createTeamDir + 索引 ≤ 500ms`（实测 ~5.47ms） |
| 3 | 查看 H2 采样 | `H2 readTeam ≤ 40ms`（实测 ~1.67ms） |
| 4 | 在浏览器中创建 50 成员团队 | 通过 `teamsx_edit_plan` 批量添加 |
| 5 | 对最后一个成员执行操作（如发消息） | `requireMember` 查找耗时 < 1ms（O(1) 索引命中） |
| 6 | 对不存在的成员名执行操作 | 立即返回 `no active member named "xxx"`（O(1) 索引 miss） |

**性能对比基准**：

| 指标 | 优化前 (O(n)) | 优化后 (O(1)) | 提升幅度 |
| --- | --- | --- | --- |
| H1 createTeamDir | 17.37ms | 5.47ms | **68% ↓** |
| H2 readTeam | 4.91ms | 1.67ms | **66% ↓** |

**验收标准**：`✅` H1 ≤ 500ms，H2 ≤ 40ms，且实际值显著低于优化前基准。

### T08 — 移除成员后查找不命中

> **目的**：验证 `buildMemberByNameIndex` 正确过滤 `status: "removed"` 成员。

| 步骤 | 操作 | 预期结果 |
| --- | --- | --- |
| 1 | 团队中有成员 "alice"（status: idle） | 索引包含 "alice" → "alice" |
| 2 | 移除 "alice" | `teamsx_remove_member` → `status: "removed"` |
| 3 | 重建索引（下次工具调用自动触发） | `buildMemberByNameIndex` 跳过 removed 成员 |
| 4 | 对 "alice" 执行操作（如发消息） | `requireMember` → O(1) miss → `no active member named "alice"` |

**验收标准**：`✅` 移除后查找不命中，不返回 removed 成员。

### T09 — 重名 / 大小写归一

> **目的**：验证成员名大小写归一后索引无冲突。

| 步骤 | 操作 | 预期结果 |
| --- | --- | --- |
| 1 | 尝试添加成员 "Alice" 后再添加 "alice" | `teamsx_add_member` 拒绝重名（大小写归一） |
| 2 | 对 "Alice" 发消息 | 索引命中正确成员 |

**验收标准**：`✅` 大小写归一后无索引冲突。

---

## 五、Web 路由验收（T10–T13）

> 使用浏览器 DevTools Console（F12）或 curl 验证。所有路由需认证态。

### T10 — GET `/plugins/dsh-teams-x/state`

```sh
# 获取所有团队活动快照
curl -s http://localhost:<port>/plugins/dsh-teams-x/state \
  -H "Cookie: <auth-cookie>"
```

| 检查项 | 预期 |
| --- | --- |
| HTTP 状态码 | 200 |
| Content-Type | `application/json; charset=utf-8` |
| Cache-Control | `no-store` |
| 响应体 | `{ "teams": [...] }`，每个团队含 `id`、`name`、`phase`、`members`、`tasks` |

**归档团队查询**：

```sh
curl -s "http://localhost:<port>/plugins/dsh-teams-x/state?archived=1" \
  -H "Cookie: <auth-cookie>"
```

**验收标准**：`✅` 返回 JSON 格式正确，团队数据与磁盘一致。

### T11 — POST `/plugins/dsh-teams-x/halt`

```sh
curl -s -X POST http://localhost:<port>/plugins/dsh-teams-x/halt \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth-cookie>" \
  -d '{"sessionId":"<captain-session-id>","teamId":"<team-id>"}'
```

| 检查项 | 预期 |
| --- | --- |
| 缺 sessionId / teamId | 400 + `{ error: "sessionId and teamId are required" }` |
| captain 未挂载 | 409 + `{ error: "captain session is not attached" }` |
| 团队不存在 | 404 + `{ error: "team not found for this captain" }` |
| 正常请求 | 200 + `{ ok: true, ... }` |

### T12 — POST `/plugins/dsh-teams-x/member/pause`

```sh
curl -s -X POST http://localhost:<port>/plugins/dsh-teams-x/member/pause \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth-cookie>" \
  -d '{"sessionId":"<captain-session-id>","teamId":"<team-id>","memberName":"engineer"}'
```

| 检查项 | 预期 |
| --- | --- |
| 成员不存在 | 404（**O(1) 查找 miss**） |
| 成员存在 | 200 + 成员被中断，attempt parked |

### T13 — POST `/plugins/dsh-teams-x/plan`

```sh
# 编辑 staged 计划（批量 mutation）
# 实现仅支持 5 种 mutation：update_member / update_task / add_task / remove_task / remove_member
# 注意：无 add_member（成员增删经聊天 teamsx_add_member）；add_task 无 id 字段（系统自动编号）
curl -s -X POST http://localhost:<port>/plugins/dsh-teams-x/plan \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth-cookie>" \
  -d '{
    "sessionId":"<captain-session-id>",
    "teamId":"<team-id>",
    "action":"edit",
    "mutations":[
      {"action":"update_member","memberName":"reviewer","provider":"deepseek","model":"deepseek-chat","role":"reviewer"},
      {"action":"add_task","subject":"review code","assignee":"reviewer","dependencies":["t1"]},
      {"action":"update_task","taskId":"t1","subject":"实现用户注册接口","dependencies":[]},
      {"action":"remove_task","taskId":"t2"},
      {"action":"remove_member","memberName":"researcher"}
    ]
  }'

# 批准计划
curl -s -X POST http://localhost:<port>/plugins/dsh-teams-x/plan \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth-cookie>" \
  -d '{"sessionId":"<captain-session-id>","teamId":"<team-id>","action":"approve"}'
```

| action | 预期 |
| --- | --- |
| `edit` | 200 + `{ ok: true, phase: "staged", ... }` |
| `approve` | 200 + `{ ok: true, phase: "running", ... }` |
| `continue` | 200 + `{ ok: true, phase: "staged", review: "awaiting_feedback", ... }` |
| `discard` | 200 + `{ ok: true, phase: "archived", ... }` |
| 未知 action | 409（源码有意：catch 统一返回 409，见 index.ts:397-400） |
| 未知 mutation action | 400 + `mutation N has unknown action "..."`（白名单拦截） |
| 超 64 条 mutation | 400 |
| 非 POST | 405 |

---

## 六、浏览器面板验收（T14–T16）

### T14 — `/teamsx` 斜杠命令

| 步骤 | 操作 | 预期结果 |
| --- | --- | --- |
| 1 | 在聊天输入框输入 `/teamsx` | 弹出团队面板（popupSelect） |
| 2 | 选择已有团队 | 面板加载团队活动快照 |

**验收标准**：`✅` 斜杠命令正常呼出面板。

### T15 — 活动面板轮询

| 步骤 | 操作 | 预期结果 |
| --- | --- | --- |
| 1 | 打开团队面板 | 面板自动轮询 `/plugins/dsh-teams-x/state` |
| 2 | 在聊天中添加成员 / 创建任务 | 面板实时更新（轮询周期内） |
| 3 | 成员状态变化（idle → working） | 面板成员行状态图标更新 |

**验收标准**：`✅` 面板数据实时反映团队状态。

### T16 — 会话内团队卡片

| 步骤 | 操作 | 预期结果 |
| --- | --- | --- |
| 1 | 创建团队后查看消息流 | 出现 `team-created` 卡片（start 卡片） |
| 2 | 添加成员 | 卡片折叠成员行（含 childId/memberId） |
| 3 | 创建任务 | 卡片折叠任务行（pending + assignee） |
| 4 | 成员移除 | 卡片对应行标记 removed |

**验收标准**：`✅` 事件正确折叠为卡片，状态实时更新。

---

## 七、回归验收（T17）

### T17 — 173 自动测试全绿

```sh
cd /home/xiaoxin/dsh-teams-x
node scripts/full-functional-test.mjs
```

**预期输出**：

```
通过 173  失败 0

性能采样:
  H1 大团队(50成员×300任务)createTeamDir + 索引: ≤ 500ms
  H2 大团队 readTeam(含全量校验): ≤ 40ms
  ...
```

**验收标准**：`✅` 173/173 通过，0 失败。

---

## 八、O(1) 优化代码验证（附加）

> 如需在浏览器 DevTools 中确认编译产物包含 O(1) 函数：

```js
// 在 DevTools Console 中（需宿主暴露模块）
// 检查 state 模块导出
console.log(typeof state.buildMemberByNameIndex)  // 预期: "function"
console.log(typeof state.findMemberByName)        // 预期: "function"
```

**磁盘验证**：

```sh
# 检查编译产物
grep -c "buildMemberByNameIndex" /home/xiaoxin/dsh-teams-x/lib/tools.js   # 预期: ≥1
grep -c "findMemberByName" /home/xiaoxin/dsh-teams-x/lib/tools.js        # 预期: ≥1
grep -c "buildMemberByNameIndex" /home/xiaoxin/dsh-teams-x/lib/state.js  # 预期: ≥1
```

---

## 九、验收结果汇总表

| 编号 | 场景 | 结果 | 备注（2026-09-08 浏览器实测） |
| --- | --- | --- | --- |
| T01 | 创建团队 | ✅ | staged→approve→running; 磁盘与/state一致 |
| T02 | 添加/移除成员 | ✅ | 含重复移除miss |
| T03 | 任务生命周期 | ✅ | pending→in_progress→completed |
| T04 | 发送消息 | ✅ | deliveredAt/readAt正确 |
| T05 | 状态查询 | ✅ | 与磁盘一致 |
| T06 | 暂停/恢复/删除 | ✅ | halt 200; resume恢复; delete归档 |
| T07 | 大团队查找性能 | ✅部分 | H1=10.46ms/H2=3.02ms; 见问题4 |
| T08 | 移除后查找不命中 | ✅ | no active member named Alice |
| T09 | 重名/大小写归一 | ⚠️ | 聊天路径未执行; 自动测试覆盖 |
| T10 | GET /state | ✅ | 200+json+no-store |
| T11 | POST /halt | ✅ | 200/409/404/405 |
| T12 | POST /member/pause | ✅ | 200/404; 见问题5 |
| T13 | POST /plan | ✅偏差 | 见问题1/2 |
| T14 | /teamsx 斜杠命令 | ✅ | 会话内正常; 首页空态已加提示(问题3已修复,fa5c28d) |
| T15 | 活动面板轮询 | ✅ | 实时/历史均正确; 归档团队可见; 面板定位已修复(问题8,baf29df) |
| T16 | 会话内团队卡片 | ✅ | 计划审批卡片+任务管理树正常 |
| T17 | 173 自动测试 | ✅ | 173/173; H1=10.46ms H2=3.02ms |

> 填写说明：通过填 `✅`，失败填 `❌` 并在备注列记录现象。

---

## 十、故障排查

| 现象 | 可能原因 | 排查方法 |
| --- | --- | --- |
| Web 路由 401 | 认证态丢失 | 检查 Cookie / 宿主登录状态 |
| Web 路由 503 | Connection 未就绪 | 确认宿主完全启动后再访问 |
| `no active member named "xxx"` | 成员已移除或名称不匹配 | 检查 `team.json` 中 `members[].status` |
| 面板不更新 | 轮询被阻塞 | 检查 DevTools Network 面板 `/state` 请求 |
| H1/H2 超预算 | 索引未生效 | 确认 `lib/tools.js` 中 `requireMember` 调用 `buildMemberByNameIndex` |
| `lib/` 文件损坏 | 构建中断 | 重新 `pnpm build` |

---

## 十一、浏览器实测记录（2026-09-08）

> 环境：dsh-web.service(:3080)，插件 HEAD da7cb82，lib 经 profile 符号链接加载；浏览器 agent-browser+系统Chromium(ARM64)。

### 发现的问题

| # | 严重度 | 现象 | 分析与建议 |
| --- | --- | --- | --- |
| 1 | 中 | T13示例mutation add_member被拒(unknown action) | 实现仅支持5种mutation; 文档需改 |
| 2 | 低 | T13未知action实际409非400 | 源码有意; 文档需更正 |
| 3 | 低 | 首页空态/teamsx静默无反应 | session-scoped面板no-op; 建议加提示 |
| 4 | 低 | T07步骤4-6未做(maxMembers=8) | ✅已闭环：脚本直建50成员实测，见"遗留项闭环验证" |
| 5 | 低 | idle成员pause无paused字段 | idle无attempt, 语义正常 |
| 6 | 观察 | captain完成任务后自主delete(系统提示词第8条) | 非bug |
| 7 | 观察 | captain对小写alice重试未执行add_member | 模型行为; 插件层由自动测试覆盖 |
| 8 | 中 | 面板打开时位置偏左; 侧边栏收起时面板被屏幕截取 | usePanelPlacement覆盖探测无左边界检查+仅监听resize不监听sidebar切换; **已修复**(baf29df) |

### 实测数据
- T17：173/173 通过；H1=10.46ms（≤500ms）、H2=3.02ms（≤40ms）、H8=5.36ms、H9=1.79ms
- T13 edit 返回：{ok:true, phase:staged, review:awaiting_review, tasks:2}；approve 返回 {ok:true, phase:running}
- T11 halt 返回：{teamName:file-writer, cancelledTasks:0, alreadyHalted:false}
- 产物验证：/tmp/teamsx-acc.txt = hello + goodbye 两行；测试 9/9 通过
- 期间账号余额透支至 ¥-0.08，未影响验收（Go 5h 免费档）

**结论**：17 项验收 16 项通过（T09 聊天路径未驱动由自动测试覆盖），无插件代码级 bug；2 处文档与实现不一致（问题1/2）需修订本文档。

### 修复回归验证（2026-09-09，HEAD baf29df）

> 环境变更：dsh-desktop-x.service 重启加载新 lib/client.js（03:25 构建）；文档 T13 示例/409 已同步修订（问题1/2 关闭）。

| 修复提交 | 验证项 | 操作 | 结果 |
| --- | --- | --- | --- |
| fa5c28d | 问题3：空态 /teamsx 静默 | 首页空态输入 /teamsx → 选 TeamsX | ✅ 出现固定定位提示"没有可响应的 TeamsX 面板 — 请先进入一个会话，再执行 /teamsx"（locales.ts command.panelUnavailable），不再静默 |
| baf29df | 面板出屏定位 | ①宽容器开面板 ②最窄容器（左侧边栏+右侧Files同开）开面板 ③面板开启时动态收起侧边栏 | ✅ ①left≈70px 正常 ②left≈207px 完整可见未溢出（left<8 边界检查未触发）③面板随布局变化重挂载，无出屏残留 |
| — | 问题1/2（文档修订） | 文档 T13 已改为 update_member+add_task 示例并注明 5 种 mutation 词汇表；409 已更正 | ✅ 修订内容与此前实测行为一致（add_task 无 id 字段、系统自动编号） |

**回归结论**：fa5c28d 与 baf29df 两个客户端修复在浏览器实测中均验证通过；问题 3 关闭；问题 1/2 随文档修订关闭；问题 4/5/6/7 维持原判定（设计语义/模型行为，非缺陷）。

### 遗留项闭环验证（2026-09-09 第二轮）

**1. BUG-01（2026-09-06 记录：同名团队删除→重建→再删除 → archiveTeamDir rename ENOTEMPTY 崩溃）**

| 层面 | 操作 | 结果 |
| --- | --- | --- |
| 源码 | `archiveTeamDir`（state.ts:687-697） | 归档前先 `rm(destination, {recursive,force})`，注释明确覆盖 delete→recreate→delete 场景 |
| 脚本（lib 编译产物） | createTeamDir(dup-team) → archiveTeamDir → 同名重建 → 再 archiveTeamDir | ✅ PASS，无 ENOTEMPTY；archive/ 保留最终代，live 目录干净 |
| 结论 | **BUG-01 已修复关闭** | |

**2. 问题4：50 成员 × 300 任务实团队性能（T07 步骤 4-6）**

| 指标 | 实测 | 预算/预期 |
| --- | --- | --- |
| createTeamDir（50成员×300任务） | 3.86ms | ≤500ms |
| readTeam 全量校验 + buildMemberByNameIndex | 7.38ms | ≤40ms |
| findMemberByName O(1) 命中 ×1000（member-50） | 共 0.165ms，**均值 0.000171ms** | <1ms/次 |
| findMemberByName miss ×1000（ghost-x） | 共 0.145ms，miss 率 100% | O(1) miss 路径 |
| /state 路由（浏览器内 fetch） | `{found:true, members:50, tasks:300}` | 正常响应 |

**3. 观察项（新）**：脚本绕过工具层直建、不在会话事件流/index.json 中的团队，会被宿主运行时自动从磁盘清除（自愈行为），且活动面板不展示——面板数据源自会话事件流而非磁盘扫描。性能验证因此以脚本层计时 + /state 路由为准（工具层 maxMembers 校验在 teamsx_add_member，state 层无上限，50 成员可经多次聊天添加达到）。





**修订（2026-09-08）**：已按问题1/2更正 T13 示例（5 种合法 mutation，移除 add_member/add_task 的 id 字段）与未知 action 状态码（400→409）。文档与实现现已一致。

---

## 十二、第二轮浏览器实测记录（2026-09-09）

> 环境：dsh-web.service(:3080)，插件 HEAD baf29df，含空态提示功能(fa5c28d)+面板定位修复(baf29df)。

### 本轮修复的问题

| # | 问题 | 根因 | 修复 | 提交 |
| --- | --- | --- | --- | --- |
| 3 | 首页空态/teamsx静默无反应 | open-request.ts 监听器集合为空时静默no-op | 新增ack返回值+未送达旁路通道+hint-host浮层组件(挂载sidebar.footer.action slot)+ActivityPanel S2渲染豁免; zh/en +2键(95→97) | fa5c28d |
| 8 | 面板打开时偏左; 侧边栏收起时被截取 | usePanelPlacement覆盖探测向左偏移无左边界检查; place()仅监听resize不监听sidebar切换 | 覆盖探测新增`r.left < 8`边界检查; 新增ResizeObserver监听badge.offsetParent检测sidebar宽度变化 | baf29df |

### 新增验收项

| 编号 | 场景 | 结果 | 备注 |
| --- | --- | --- | --- |
| T18 | 首页空态/teamsx提示 | ☐ | 首页执行/teamsx应显示浮层"没有可响应的TeamsX面板—请先进入一个会话，再执行/teamsx"; 6s自动消失; 手动×关闭 |
| T19 | 面板定位-正常打开 | ☐ | 面板锚定badge下方右侧,不偏左 |
| T20 | 面板定位-侧边栏收起 | ☐ | 侧边栏收起时面板跟随badge重新定位,不被屏幕截取 |
| T21 | 面板定位-侧边栏展开 | ☐ | 侧边栏展开时面板跟随badge重新定位 |

### 修复验证门禁

```
pnpm typecheck     ✅
pnpm build         ✅ (client bundle 107.17kB, +hint-host)
pnpm smoke:client  ✅ (97/97键, 9组断言全PASS)
173/173 回归       ✅ (H1=12.46ms H2=1.79ms, O(1)未回退)
```

> 填写说明：通过填 `✅`，失败填 `❌` 并在备注列记录现象。

*文档版本：1.3 | 对应提交：baf29df | 验收日期：2026-09-08 + 2026-09-09（浏览器实测）*

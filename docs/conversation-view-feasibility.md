# dsh-teams-x v0.2「会话内团队卡片 + 成员跳转」可行性研究报告

> 研究对象：`deepseek-harness`（master，0.1.3-alpha.1 + 本地补丁栈）与 `dsh-teams-x`（v0.1.0）
> 结论速览：**插件侧零 harness 改动可行，工作量从 ACCEPTANCE 评估的「大」下调为「小-中」**。harness 已存在两条完整的插件级"会话内视图"通道，且 ui-workflow-run 包就是"多成员卡片 + 成员跳转"的现成先例。

---

## 1. ConversationViewDefinition 的定义与消费（渲染管线全链）

### 1.1 类型定义

**定义位置**：`packages/client/ui-conversation/src/client/contract/conversation.ts:277-287`

```ts
/** Registry contribution that creates an isolated builder when a Session first uses this target. */
export interface ConversationViewDefinition<
  Node extends ConversationViewNode = ConversationViewNode,
  Snapshot = unknown,
> {
  readonly target: string
  /** @returns a new Session-owned incremental builder. */
  create(): ConversationViewBuilder<Node, Snapshot>
  isActive?(snapshot: Snapshot): boolean
}
```

配套契约（同文件）：
- `ConversationNodeDefinition`（事件→节点状态机，L185-245）：`kind / target? / match(event) / start() / update() / publication?() / buildLocationData?() / buildViewNode?()`
- `ConversationViewBuilder`（L254-274）：`empty / replace({nodes, timeline}) / apply({upserts, timeline})`
- `ConversationViewNode`（L127-133）：`{ key, kind, id, target, data }`

**导出**：`packages/client/ui-conversation/src/client/index.ts:16,47`，并通过模块合并声明把 `ctx.uiConversation` 挂上 cordis Context（同文件 L70-77）。

### 1.2 注册表

`packages/client/ui-conversation/src/client/conversation/view-registry.ts:5-19`：`ConversationViewRegistry.register()` 对重复 target 报错。基类 `definition-registry.ts:43-61`：注册是 **Cordis effect**，插件上下文销毁时自动摘除贡献（天然的插件生命周期安全设计）。

### 1.3 渲染管线（谁把视图渲染进消息流）

**A. 组装引擎（ui-conversation 包，target 无关）**
- `assembly.ts:172-236`：`UiConversation` 服务持有 `events` / `views` 两个 registry；`binding()` 为每个 Session 创建 `BoundConversation` → `ConversationNodeAssembler`
- `assembler.ts:159-943`：Session 级增量引擎——事件窗口 → `dispatchInput` 逐 Definition `match` → `start/update` 推进 → `flush()`（L332-377）对每个激活 target 调 `builder.replace/apply`；`buildNode`（L816-827）调 `definition.buildViewNode(context)` 并强校验 `node.key === context.key`、`node.target === target`
- 注册变更触发 `rebuildRegistry()`（assembly.ts L189-209 → assembler.ts L323-326），**运行期插拔视图定义是一等行为**

**B. 消息流呈现（ui-chat 包 = 'chat' target 所有者）**
- `ui-chat/src/client/apply.ts:59,94-153`：ChatView 注册为 `conversation.view` slot 的 `id: 'chat'` entry
- `ChatView.tsx:203-211`：按 `snapshot.order` 逐 key 渲染 `<ChatNodeSeat>`
- `ChatNodeSeat.tsx:137-147`（**消息流渲染终点**）：按 `node.kind` 在 keyed slot `conversation.chat.node` 上找渲染器，**找不到渲染 JSON fallback，不会崩**

---

## 2. 插件能否注册自定义视图？——能，且已有两条官方通道

`ui-conversation/README.md:34` 明文说明注册协议：target packages（普通客户端插件）用 `ctx.uiConversation.events.register(...)` + `ctx.uiConversation.views.register(...)` 注册，注册是 Cordis effect。

现有插件形态消费者：

| 注册点 | 通道 |
|---|---|
| `ui-workflow-run/src/client/index.ts:26` | `events.register(workflowRunDefinition)` |
| `ui-deliverables/src/client/index.ts:67` | 同上 |
| `ui-goal/src/client/index.ts:57` | 同上 |
| `ui-trajectory/src/client/index.ts:77-80` | `ctx.slots.inject('conversation.view', ...)`（Tab） |

**通道 A：消息流内嵌卡片（推荐，即"团队任务卡片"形态）**
注册 `ConversationNodeDefinition{ target: 'chat' }`（`events.register`）+ `ctx.slots.inject('conversation.chat.node', ...)` 以自己的 `kind` 为 key 注册渲染器。payload 扩展点为 `ChatNodeDataMap`（`ui-chat/src/client/contract/chat-nodes.ts:16-27`，`declare module` 合并，workflow-run 即此做法）。注意 `event-registry.ts:54-59` 校验：声明 `target` 就必须同时提供 `buildViewNode`，反之亦然。

**通道 B：并列 View Tab（独立 target）**
注册自己的 `ConversationViewDefinition`（新 target）+ 注入 `conversation.view` slot entry（ui-trajectory 先例）。但 shell 选择规则是"持久化选择 > 注册的 chat > 无"（`ConversationSession.tsx:60-63`），新 target 只成为用户可切换的 Tab。适合"团队总览页"，不适合"内嵌卡片"。

**dsh-teams-x 现状**：`src/client/card-definition.tsx` 已有一个未接线的雏形，但有三个问题：
① 全仓库无任何 import/注册；② 没有 `target`/`buildViewNode`，是 state-only 定义，永远渲染不出来；③ `update()` 返回 `undefined`，真注册会被 assembler 断言击穿——`assembler.ts:949-958` `requireState` 直接 throw。**该文件需重写而非复用。**

**结论：不需要改 harness。**

---

## 3. harness 自身的"会话内卡片"先例

### 先例 1（最接近目标）：ui-workflow-run —— 多成员工作流卡片 + 成员跳转

- **Definition**：`ui-workflow-run/src/client/workflow-definition.ts:149-193`——`kind: 'workflow-run'`、`target: 'chat'`，match `tool-workflow/*` 事件族，`start/update` 折叠成员状态，`buildViewNode` 产出 chat 节点；类型扩展（同文件 L37-42）：

```ts
declare module '@deepseek-ai/dsh-client-ui-chat/client' {
  interface ChatNodeDataMap { 'workflow-run': WorkflowRunChatData }
}
```

- **注册**：`ui-workflow-run/src/client/index.ts:25-36`——`events.register(...)` + `ctx.slots.inject('conversation.chat.node', ..., key: 'workflow-run', WorkflowRunPanel)`，并注入 `openSession: (id) => ctx.sessions.open(id)`
- **成员行 + 跳转**：`WorkflowRunPanel.tsx:241-276` `MemberRow`——状态点 + 标签 + 状态文案，`navigable` 时渲染为 button，点击 `openSession(member.childId)`；`navigableMembers`（L182-202）只允许"running 且 origin=subagent 且父会话匹配"的成员可点
- **包声明**：`ui-workflow-run/package.json:28-40` `dsh.client.inject` 含 `@deepseek-ai/dsh-client-ui-chat`

### 先例 2：ui-deliverables —— turn 尾部"产物文件卡片行"

`ui-deliverables/src/client/index.ts:67-81` + `ctx.slots.inject('conversation.chat.turnTail', ...)`，消费点 `TurnTailNodeView.tsx:26`。适合"任务完成产物"附加行，而非常驻状态卡。

---

## 4. dsh-teams-x 导航雏形：现状与差距

**文件勘误**：只有 `src/client/session-navigation.ts`（浏览器侧），ACCEPTANCE §9.2.4 所述两文件实为同一文件。

- `TeamsXSessionNavigator`（L11-20）：`open(id)` + 可选 `openSubagent / refreshSubagents / subagentAddress`
- `openTeamsXMember()`（L27-42）：版本容错——探测 `openSubagent/refreshSubagents` 缺失则降级 `sessions.open(childId)`；否则 refresh 后优先复用 `subagentAddress(childId)`，兜底 `{ parentSessionId, childSessionId, mode: 'continuable' }`
- 挂点（`src/client/index.tsx:41-55`）：面板挂 `conversation.session.header.actions` slot（order 30），`openMember` 动态 import + try-catch
- 宿主契约均为 alpha.1 正式面：`packages/api/session-controller/src/client/contract/sessions.ts:44-67`、`packages/subagent/subagent/src/control-types.ts:87-95`

**与 registerContinuableSetup 补丁的关系**：浏览器侧"成员 transcript 跳转"只依赖 `ISessions.openSubagent` 面，**不依赖**该补丁；补丁决定"跳过去之后冷续接成员是否重新挂上成员选择运行时"。即**跳转可达性 ≠ 续接可用性**。

**离目标还差**：
1. 卡片数据源：11 种 `teamsx/*` 事件（`src/event-types.ts:12-38`，写入 captain 会话）足以 match 出团队/成员/任务折叠状态；成员跳转需 `childSessionId`——`member-added` payload 只有 `memberId`，实现时需核实其是否即子代理 SessionId，否则从 GET snapshot 补映射
2. 可点性判定抄 workflow-run `navigableMembers` 思路 + `openTeamsXMember` 版本容错
3. `card-definition.tsx` 重写 + 接线注册
4. `package.json` `dsh.client.inject` 补 `@deepseek-ai/dsh-client-ui-chat`（纯 type import 不触碰 tsdown 跨插件值导入 purity 门）

---

## 5. 版本演进与"易碎"风险评估

1. 当前 checkout = tag 基线（dsh-v0.1.3-alpha.1）+ 本地补丁栈
2. alpha 间 API 漂移真实存在（`src/compat.ts:12-21` 记录 alpha.2→alpha.3 漂移点），插件已用 compat 层 + 全 optional peerDependencies 应对
3. 通道 A 依赖面（`ConversationNodeDefinition` 可选增量方法 + `ChatNodeDataMap` 合并点 + keyed slot）全部在包公开导出面，且有 JSON fallback 兜底——最坏退化是"卡片变 JSON 行/消失"，不会炸会话
4. registry/assembler 有完整 client spec 护栏，不变量 fail-loud 而非静默错渲染

**风险等级：中低**（前提：pin 0.1.3-alpha.1 + 运行时特性探测）。原评估"深水面、易破"基于"必须深度集成 views.register 新 target"的假设；通道 A 是 harness 内 4+ 个插件共用的常规扩展面，不属深水面。

---

## 6. 结论

### (a) 最小可行集成方案（零 harness 改动）

照抄 ui-workflow-run 模板，全部在 dsh-teams-x 客户端完成：

1. 重写 `src/client/card-definition.tsx` 为正式 `ConversationNodeDefinition`：`kind: 'teamsx'`、`target: 'chat'`、match 11 种 `teamsx/*` 事件、`buildViewNode` 产出 `{ kind: 'teamsx-card', target: 'chat', ... }`
2. `declare module` 合并 `ChatNodeDataMap { 'teamsx-card': TeamsXCardData }`
3. `ctx.slots.inject('conversation.chat.node', ..., key: 'teamsx-card', TeamsXCardPanel)`，成员行点击复用 `openTeamsXMember`
4. `package.json` `dsh.client.inject` 增补 `@deepseek-ai/dsh-client-ui-chat`
5. 特性探测降级：`typeof ctx.uiConversation?.events?.register !== 'function'` 则不注册，维持现状（header badge + ActivityPanel），功能零回归

可选：同一 definition 再投一个 `conversation.view` Tab（通道 B）做"团队总览页"。

### (b) 若必须改 harness 的最小 patch 面

**当前需求下为空集。** 仅当未来需要自定义 target 自动激活策略（`ConversationSession.tsx`）或全局兜底渲染策略（`ChatNodeSeat.tsx:140-146`）才动 harness，均为纯客户端小改。registerContinuableSetup 补丁维持上游化路线，不阻塞卡片渲染。

### (c) 版本兼容缓解措施

- **运行时特性探测**：`typeof ctx.uiConversation?.events?.register` / `typeof ctx.slots?.inject`，收进 compat 层（沿用 compat.ts"能力检测吸收漂移"哲学）
- **try-catch 包裹注册**：失败仅 `logger.warn`，面板路径不受影响
- **依赖声明**：peerDependencies 全 optional + README 声明 "native to dsh 0.1.3-alpha.1" + `dsh.client.inject` 补宿主包存在性声明
- **bundle 纪律**：宿主包一律 type-only import（purity 门强制），运行时值全经 cordis 服务获取
- **失败面收敛**：契约变化最多导致卡片不显示/JSON fallback，ActivityPanel 仍是完整功能面

### (d) 工作量档位：**小-中**

- definition + 类型 merge：约 200-300 行（workflow-definition.ts 可逐行参照）
- 卡片面板组件（成员行/状态点/任务摘要/跳转按钮）：约 300-450 行
- 导航接线：已完成 80%（openTeamsXMember 直接复用）
- 测试：卡片节点装配 spec + 面板 smoke，约 15-25 用例
- **无 harness 补丁、无 CI 面变化**

建议把 ACCEPTANCE 中该项的风险描述由"需 harness 视图层深度集成"修正为"复用 harness 既有插件视图通道（ui-workflow-run 模式）"。

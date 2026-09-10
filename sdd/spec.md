# dsh-teams-x — `/teamsx` 空态提示 需求规格（spec.md）

> **Feature Name**: `teamsx_empty_hint`（17 字符，合规）
> **文档状态**: 待评审 | **日期**: 2026-09-09
> **需求来源**: ACCEPTANCE-BROWSER.md 第十一节「浏览器实测记录（2026-09-08）」问题 3（严重度：低）
> **代码基线**: 插件 HEAD `da7cb82` / 0.2.0 | 宿主 DeepSeek Harness 0.1.3-alpha.1
> **文档性质**: 本文档只描述"做什么"（What），不含实现方案（How）。提示的 UI 形态、检测手段等由 design.md 决策。

---

## 1. 任务概述

在 DSH 宿主客户端为 `/teamsx` 斜杠命令补充空态反馈：当"打开面板"的请求无法到达任何已挂载的 TeamsX 活动面板时，向用户呈现一条**用户可见、非静默、含下一步指引**的提示，消除当前"执行命令后完全无反应"的体验问题；同时保持面板正常展开路径、宿主降级链、i18n 键数校验与既有 173 项全功能测试全绿。

### 1.1 背景与现状事实（已确认的根因，作为需求输入，非设计约束）

| # | 事实 | 位置 |
| --- | --- | --- |
| F1 | `/teamsx` 命令注册为 `popupSelect`，`onSelect` 回调调用 `requestTeamsXPanel(session.sessionId)` | `src/client/index.tsx:106-138` |
| F2 | `requestTeamsXPanel` 遍历模块级监听器集合；无监听器时为静默 no-op（源码注释自述 "no-op when it is not mounted"） | `src/client/open-request.ts:12-15` |
| F3 | `onTeamsXPanelRequest` 仅由 session-scoped 的 `ActivityPanel` 订阅；**空态时该组件未挂载 → 监听器集合为空 → 静默** | `src/client/ActivityPanel.tsx:546-551` |
| F4 | `available` 谓词现状：若 `ctx.sessions.subagentAddress` 不是函数则恒可用；若是函数，则队友子会话（返回值非 `undefined`）中命令不可用。谓词依赖宿主 sessions 契约形态，存在宿主差异导致的边界空态 | `src/client/index.tsx:115-120` |
| F5 | 宿主无 `commandUi` 能力时已有 console.warn 双层降级（命令不注册） | `src/client/index.tsx:131-137` |
| F6 | locale 键集合以 `locales.ts` 的 zh 字典为 source of truth，`locale-keys.ts` 仅 re-export 类型；smoke 测试校验 zh/en 键数一致 | `src/client/locales.ts`、`scripts/client-smoke.mjs` |
| F7 | 现有回归基线：`pnpm smoke:client` 全绿；`node scripts/full-functional-test.mjs` 173/173 通过（T17 实测记录） | `ACCEPTANCE-BROWSER.md` 第十一节 |

---

## 2. 用户故事

**US-1（主故事）**
> 作为 DSH 宿主中的用户，当我在空态（宿主首页无活跃会话、或当前会话未挂载 TeamsX 活动面板）执行 `/teamsx` 斜杠命令时，**我希望得到一条明确的用户可见提示**，告知面板为什么没有打开以及下一步该做什么，**以便**我不误以为命令失效，并知道如何正确触发面板。

**US-2（回归保障）**
> 作为正在使用 TeamsX 团队的用户，当我在已挂载活动面板的会话中执行 `/teamsx` 时，**我希望面板照常展开**，**以便**现有工作流不受本次改动影响。

**US-3（多语言用户）**
> 作为使用英文界面的用户，**我希望**空态提示以英文呈现（而非中文硬编码或键名裸露），**以便**提示对我可读。

---

## 3. 领域术语

**空态（Empty State）**
: 宿主客户端中不存在已挂载的 TeamsX 活动面板的状态。包括：宿主首页无活跃会话、当前会话未渲染 `ActivityPanel`、以及目标会话与面板不匹配等情形。

**静默 no-op（Silent No-op）**
: 命令执行链路在内部完成但未产生任何用户可感知的 UI 反馈的现象，即本任务要消除的问题。

**活动面板（ActivityPanel）**
: session-scoped 的 TeamsX 团队活动面板组件，承载团队状态展示与操作；仅在其所属会话的界面 shell 中挂载。

**打开请求通道（Open-Request Channel）**
: `/teamsx` 命令到活动面板之间的模块级监听器通道（`requestTeamsXPanel` / `onTeamsXPanelRequest`），纯 Set 监听器、无 store 依赖。

**队友子会话（Teammate Sub-session）**
: 由队长会话派生的 subagent 会话，自身没有队长面板；`ctx.sessions.subagentAddress` 对其返回非 `undefined`。

**commandUi 能力**
: DSH 宿主提供的斜杠命令注册扩展点；插件通过 `ctx.inject(['commandUi'])` 获取，宿主缺失时插件走 console.warn 降级。

---

## 4. EARS 需求规格

> 语法约定：`WHEN <触发事件>` / `IF <条件>` / `WHILE <持续状态>` + `THE SYSTEM SHALL <系统必须的响应>`。每条需求附验收条件（触发场景 → 预期行为）。共 **14 条**。

### 4.1 命令正常路径（现状保持 · 回归保障）

**REQ-01 面板已挂载时正常展开**
- `WHEN` 用户在已挂载 TeamsX 活动面板的会话中执行 `/teamsx` 命令并确认打开选项，`THE SYSTEM SHALL` 展开该会话的活动面板（与改造前行为完全一致）。
- 验收条件：活跃团队会话内执行 `/teamsx` → 面板展开，内容正常加载。

**REQ-02 面板会话隔离语义保持**
- `WHEN` `/teamsx` 命令发起面板展开请求，`THE SYSTEM SHALL` 仅展开与当前会话 `sessionId` 匹配的活动面板，不得展开其他会话的面板。
- 验收条件：多会话并存时在会话 A 执行 `/teamsx` → 仅会话 A 的面板响应；会话 B 界面无变化。

### 4.2 空态提示（本次新增核心）

**REQ-03 空态时呈现用户可见提示**
- `WHEN` 用户执行 `/teamsx` 命令且打开面板请求无法到达任何已挂载的 TeamsX 活动面板（包括但不限于：宿主首页无活跃会话、当前会话未挂载面板），`THE SYSTEM SHALL` 呈现一条用户可见的提示，说明面板未能打开及原因。
- 验收条件：宿主首页空态执行 `/teamsx` → 用户在界面上观察到提示；无静默 no-op。

**REQ-04 提示必须非静默且含可操作指引**
- `IF` 空态提示被触发，`THEN THE SYSTEM SHALL` 保证：(a) 提示通过 UI 呈现给用户，禁止仅输出到 console 而无界面反馈；(b) 提示内容包含下一步指引（语义上引导用户"先进入一个会话再使用 /teamsx"一类）；(c) 提示自动消失或可被用户关闭，不永久遮挡界面。
- 验收条件：空态执行 `/teamsx` → 看到含指引文案的提示 → 提示可消失/关闭，之后界面可正常继续操作。
- 备注：提示的 UI 形态（toast/内联/banner/宿主通知）与判定手段由 design.md 决策，本需求只约束外部可观察行为。

### 4.3 特殊场景

**REQ-05 宿主缺 commandUi 时降级链保持**
- `WHILE` 宿主未提供 `commandUi` 能力（命令未注册），`THE SYSTEM SHALL` 保持现有双层 console.warn 降级行为不变（`teams-x: commandUi service missing...` / `commandUi unavailable...`），且**不要求**在该场景展示空态提示（命令不存在，用户无从触发）。
- 验收条件：以无 commandUi 的宿主加载插件 → console.warn 降级、命令不可用；不出现本任务新增的提示逻辑副作用。

**REQ-06 队友子会话执行命令不得静默**
- `WHEN` 用户在队友子会话上下文中能够执行 `/teamsx` 命令（无论因宿主 sessions 契约差异导致 `available` 谓词放行，还是未来策略调整），`THE SYSTEM SHALL` 保证该执行产生用户可见结果（提示或面板响应），禁止静默 no-op。
- 验收条件：在队友子会话中执行 `/teamsx`（若命令可触达）→ 出现用户可见反馈，与空态提示同等质量。
- 备注：具体策略（保持命令不可用 vs 允许执行并提示）为待定项 **D-03**，design.md 决策。

**REQ-07 available 谓词行为不回退**
- `THE SYSTEM SHALL` 保持 `/teamsx` 命令 `available` 谓词的现有语义（队友子会话在宿主提供 `subagentAddress` 契约时命令不可用；契约缺失时保持现状放行），本次改动不得收窄或破坏该行为。
- 验收条件：回归对比改造前后 `available` 对队长会话/队友子会话的判定结果 → 完全一致。

### 4.4 国际化（i18n）

**REQ-08 提示文案 zh/en 双语言**
- `WHEN` 空态提示文案被新增，`THE SYSTEM SHALL` 在 `locales.ts` 中同时提供 zh 与 en 两条文案，键集合以 zh 字典为 source of truth，两语言键数保持一致。
- 验收条件：检查 `locales.ts` → 新键同时存在于 zh/en 两个字典。

**REQ-09 界面语言正确呈现**
- `IF` 宿主界面语言为 en，`THEN THE SYSTEM SHALL` 展示英文版空态提示；zh 界面展示中文版；任何语言下不得出现键名裸露或文案缺失回退。
- 验收条件：切换 zh/en 两种界面语言分别执行空态 `/teamsx` → 各自看到对应语言提示，无键名裸露。

### 4.5 硬约束（架构与依赖红线）

**REQ-10 DSH 核心包零改动**
- `THE SYSTEM SHALL` 仅通过插件自有扩展点（client apply / slots / inject）实现本需求；DSH 核心包（deepseek-harness）不得有任何代码变更。
- 验收条件：最终 diff 中核心包路径零变更；改动全部位于 `src/client/**` 与 locales 等插件文件。

**REQ-11 零新增运行时依赖**
- `THE SYSTEM SHALL` 不引入任何新的第三方运行时依赖，仅使用现有 React 能力与宿主已提供的 UI 契约。
- 验收条件：`package.json` dependencies 无新增条目；构建产物体积无明显异常增长。

**REQ-12 O(1) 优化成果不回退**
- `THE SYSTEM SHALL` 不触及 state/tools 的成员查找与 O(1) 缓存路径（本任务仅涉及客户端提示 UI）；T07–T09 对应自动测试指标（H1≤500ms、H2≤40ms 等）不回退。
- 验收条件：`full-functional-test.mjs` 中性能断言全部通过，数值与基线同量级。

### 4.6 回归保障（测试门禁）

**REQ-13 客户端冒烟测试全绿**
- `WHEN` `pnpm smoke:client` 执行，`THE SYSTEM SHALL` 保持全部断言通过，包括 locale 注册与 zh/en 键数一致性校验（新增键后两语言键数仍相等）。
- 验收条件：`pnpm smoke:client` 输出 `PASS (load + apply + render)`，zh/en keys 数量相等。

**REQ-14 全功能回归测试全绿**
- `WHEN` `node scripts/full-functional-test.mjs` 执行，`THE SYSTEM SHALL` 保持 **173/173** 用例全部通过，不得因本次改动引入任何用例失败或跳过。
- 验收条件：测试输出 173 passed / 0 failed / 0 skipped。

---

## 5. 非目标（Out of Scope）

| # | 非目标 |
| --- | --- |
| O-1 | 不改变活动面板展开后的任何功能（轮询、live/archive 视图、任务操作、停止团队等）。 |
| O-2 | 不修改打开请求通道（`open-request.ts` 的 `requestTeamsXPanel` / `onTeamsXPanelRequest`）的现有对外语义与既有调用方签名；如需内部增强检测手段，必须向后兼容。 |
| O-3 | 不涉及服务端路由（`/plugins/dsh-teams-x/*`）与 server 模块任何代码。 |
| O-4 | 不新增斜杠命令，仅增强既有 `/teamsx` 的反馈行为。 |
| O-5 | 不增强"宿主缺 commandUi"场景的用户提示（维持 console.warn 降级现状，见 REQ-05）。 |
| O-6 | 不触及 state/tools 查找逻辑、O(1) 缓存与任何性能优化路径。 |
| O-7 | 不重构 locale 机制本身（仅在既有 zh/en 字典内新增键）。 |

---

## 6. 验收标准清单

### A. 空态提示（新增核心）
- [ ] A1 宿主首页空态执行 `/teamsx`：界面出现用户可见提示，不再静默（REQ-03）。
- [ ] A2 提示文案包含下一步指引（如"请先进入一个会话再使用 /teamsx"语义）（REQ-04）。
- [ ] A3 提示可自动消失或手动关闭，不永久遮挡界面（REQ-04）。
- [ ] A4 会话存在但面板未挂载的场景同样触发提示（REQ-03）。

### B. 正常路径回归
- [ ] B1 活跃团队会话执行 `/teamsx`：面板正常展开，行为与改造前一致（REQ-01）。
- [ ] B2 多会话场景：仅当前会话面板响应，无跨会话误展开（REQ-02）。
- [ ] B3 队友子会话：`available` 判定与改造前一致；若命令可触达则不静默（REQ-06/REQ-07）。

### C. 降级与兼容
- [ ] C1 宿主缺 commandUi：console.warn 双层降级照旧，命令不注册，无新增副作用（REQ-05）。
- [ ] C2 DSH 核心包 diff 为零，改动仅限插件 client 侧（REQ-10）。
- [ ] C3 `package.json` 无新增运行时依赖（REQ-11）。

### D. i18n
- [ ] D1 zh 界面显示中文提示，en 界面显示英文提示，无键名裸露（REQ-08/REQ-09）。
- [ ] D2 `locales.ts` zh/en 新键同步，键数一致（REQ-08）。

### E. 测试门禁
- [ ] E1 `pnpm smoke:client` 全绿，含 zh/en 键数校验（REQ-13）。
- [ ] E2 `node scripts/full-functional-test.mjs` 173/173 全绿（REQ-14）。
- [ ] E3 O(1) 性能断言（T07–T09 对应项）指标不回退（REQ-12）。

---

## 7. 待定项（Open Questions — design.md 决策）

| # | 待定问题 | 决策输入 | 影响 |
| --- | --- | --- | --- |
| D-01 | 提示 UI 形态：toast / 内联提示 / banner / 复用宿主既有通知能力？宿主是否提供统一 toast 或 notice 契约？ | 需调研宿主 UI 能力（commandUi 及其他 inject 契约）后决策；若无宿主能力则用插件内 React 实现 | REQ-04 的实现载体 |
| D-02 | 空态检测信号：如何可靠判定"打开请求无法到达任何已挂载面板"？（如监听器集合回执、面板注册表、订阅状态查询等） | spec 只约束外部行为（REQ-03），检测手段属设计细节 | REQ-03/REQ-04 的实现正确性 |
| D-03 | 队友子会话策略：保持命令不可用（现状 `available=false` 路径），还是允许执行并给出与空态一致的提示？ | 需结合宿主对不可用命令的 UI 呈现（隐藏 vs 置灰）与用户预期 | REQ-06 的具体形态 |
| D-04 | 提示文案定稿：zh/en 具体措辞（spec 仅约束"含指引、非静默"） | design 阶段产出文案，同步 `locales.ts` 并保持键数一致 | REQ-08/REQ-09 |
| D-05 | 提示生命周期细节：自动消失时长、是否需要手动关闭入口、重复触发时是否去重/续期 | 依赖 D-01 选定的形态 | REQ-04 (c) |

---

## 8. 参考索引

- 问题来源：`ACCEPTANCE-BROWSER.md` 第十一节（问题 3，严重度：低）
- 关键现状代码：`src/client/index.tsx:106-138`、`src/client/open-request.ts`、`src/client/ActivityPanel.tsx:538-551`
- i18n：`src/client/locales.ts`（zh 为键集 source of truth）、`src/client/locale-keys.ts`
- 测试门禁：`pnpm smoke:client`（`scripts/client-smoke.mjs`）、`node scripts/full-functional-test.mjs`（173 用例）
- 下游文档：`design.md`（待生成，由 spec-design-agent 负责）、`tasks.md`（待生成，由 spec-task-agent 负责）
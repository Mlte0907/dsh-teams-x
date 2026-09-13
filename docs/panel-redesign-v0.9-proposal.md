# TeamsX 活动面板 v0.9 全新 UI 设计方案（修订版，已过可行性审核）

> **文档状态**: 已实施（v0.9.0，可行性审核通过 + 动效门禁 PASS，实施偏差见 §九）| **日期**: 2026-09-13
> **作者**: 产品经理（多智能体开发团队）| **评审**: 设计负责人 + 技术负责人
> **设计输入**: taste-skill（反模板/反 AI 味）· ui-ux-pro-max（设计系统）· emilkowalski_skills（动效工艺）
> **代码基线**: dsh-teams-x v0.8.1（commit `94d525f`，master）/ 宿主 DeepSeek Harness 0.1.5-rc.2
> **范围**: 纯客户端（`src/client/**` + `locales.ts` + 图标 + CSS）。Node 半区（`src/*.ts` 服务端）零改动。

---

## 〇、一页纸摘要（Design Read）

**Design Read**：把 TeamsX 面板读作 **"多智能体团队的实时指挥仪表"**——用户是盯着团队跑活的指挥者，不是浏览落地页的访客。它属于 taste-skill 明确排除的 "dashboards / data tables / multi-step product UI" 类别（taste-skill SKILL.md 第 8 行），因此本次重设计**不套用 landing-page 美学**（大标题、编辑排版、不对称栅格），只取用三个技能中适用于数据密集产品 UI 的部分：

| 技能 | 本次取用 | 本次不取用 |
| --- | --- | --- |
| taste-skill | AI 味黑名单（em-dash、胶囊徽章汤、每节大写眉标、逐行 hairline、中点堆叠、装饰点配给）、三旋钮、redesign-skill 的"审计→诊断→定向修复"流程、11.C 保存性规则（焦点态/键盘导航不回退） | Hero 规范、bento 栅格、衬线纪律、真实图片策略 |
| ui-ux-pro-max | design-system 交付物结构（token 分层 / 组件规格 / 反模式清单 / Pre-Delivery Checklist 含焦点态与 4.5:1 对比度） | 全新配色发明（必须宿主融合，不自建色板） |
| emilkowalski_skills | 动效十准则、Before/After 审查表格式、STANDARDS.md 时长/曲线预算、review-animations 作为合入门禁 | 新动效库引入（零依赖约束） |

**三旋钮设定**（taste-skill §1/§7，按 "数据密集指挥面板 + redesign-overhaul" 推导）：

```
DESIGN_VARIANCE: 5   // 结构有序但打破"均质行列表"的模板节奏
MOTION_INTENSITY: 4  // 流畅 CSS 动效（>3 触发 reduced-motion 强制项，已覆盖）
VISUAL_DENSITY: 8    // Cockpit 档（§7 定义 8-10）：无卡片盒、hairline 分节、数字全部等宽
```

**核心主张**：v0.8 把面板做得"干净但平庸"——它现在是一个由均匀行、胶囊徽章、大写微标签堆成的**通用后台模板**。v0.9 要把它变成有身份的**指挥仪表**：任务 DAG 从压平的行列表升格为真正的**轨道图**（可视化主角），团队头部从徽章行升格为**进度仪表**，成员名册从文字行升格为**通道条**。全部可视化只用既有快照字段，零新增端点、零新增依赖、服务端零改动。

---

## 一、背景与现状诊断

### 1.1 面板是什么

TeamsX 活动面板是 dsh-teams-x 插件注入宿主 Web UI 的多智能体团队监控面，四个载体共用一个组件体（`TeamsXPanelBody`，`src/client/ActivityPanel.tsx:647-726`）：

| 载体 | 挂载点 | 呈现形态 |
| --- | --- | --- |
| 会话头徽标 + 下拉窗 | `conversation.session.header.actions` | 30×26 徽标 → 420px 固定定位下拉（≤768px 转底部抽屉） |
| 右侧栏页签 | `sidebar.right.pane.tab`（0.1.5-rc.1+） | 常驻纵向滚动列 |
| 会话内卡片 | `conversation.chat.node` | 消息流内 560px 折叠卡 |
| 全局提示 | `sidebar.footer.action` | 6 秒自动消失 toast |
| 入口 | `/teamsx` 斜杠命令 | `popupSelect` 打开面板 |

数据面：`GET /plugins/dsh-teams-x/state` 快照（展开 4s / 折叠 10s 轮询）+ 3 个写端点（halt / member/pause / plan）。

### 1.2 现状审计（redesign-skill 三步法之 Diagnose，行号已经双评审复核）

**A. 模板化（每个团队长一个样，信息靠文字堆）**

| # | 症状 | 证据 | 违反 |
| --- | --- | --- | --- |
| A1 | 团队卡 = 均质行堆叠：成员行×N、任务行×N、时间线行×N、收件箱行×N，全部同构 `flex row + hairline` | `ActivityPanel.tsx:576-621` | redesign-skill "long lists need a different UI component"；taste-skill 9.F "border-b on every row 是最懒的布局" |
| A2 | 胶囊徽章汤：每个任务行 3-6 个 999px 圆角 pill（依赖 tag、R{n}、↻ 来源、接管、verdict、耗时、进度） | `ActivityPanel.tsx:385-416` | redesign-skill "Pill-shaped badges → try square badges or plain text" |
| A3 | 每个分节一枚大写加字距微标签（MEMBERS / TASKS / TIMELINE / INBOX） | `ActivityPanel.tsx:574-608` + `sectionLabel` 样式 | taste-skill 4.7 EYEBROW RESTRAINT（≤1/3 节） |
| A4 | DAG 被压扁成带 3px 泳道条的行列表——插件的招牌概念（依赖感知 DAG + depth 泳道）在视觉上不可见 | `TaskRow` 六列 grid，`taskLane` 仅 42×3px 段 | 与"带可视化 UI 视觉效果"目标直接冲突 |
| A5 | 状态全靠文字：进度是"2/5 完成"文本 + 42×3px 细条；token 用量是 `↑12.3k ↓45.6k` 裸数字 | `MemberRow:331-341` | DENSITY 8 档要求"数字必须等宽+可视化"，现状只有半个 |

**B. AI 味残留**

| # | 症状 | 证据 |
| --- | --- | --- |
| B1 | 胶囊形阶段徽章 + halted + 成员数 + 完成度排成一行小药丸 | `teamBadges:549-557` |
| B2 | 元数据中点堆叠：`provider/model · ↑↓tokens` 反复出现 | `MemberRow:322-330` 等 |
| B3 | 收件箱双标题拼贴：`收件箱 · 队长邮箱` | `ActivityPanel.tsx:608` |
| B4 | 空态是"骨架条×3 + 一行字"模板件 | `dagEmpty:581-588` |
| B5 | 会话内卡片每人一枚 7px 裸装饰点 | `TeamsXCard.module.css:95-105` |
| B6 | **现存文案含 em-dash（U+2014）4 处**：`panel.empty`、`plan.needsReview` 的 zh/en 各 2 处（`locales.ts` zh 第 14、38 行，en 第 125、149 行）——taste-skill 9.G 完全禁令 | `locales.ts` |
| B7 | 硬编码中文串外溢 locale 体系：`（最近 {n} 条）`（`ActivityPanel.tsx:592`）、任务徽标 title `第 N 轮修复`/`修复自 …`/`队长影子接管中…`（`ActivityPanel.tsx:394-401`）——i18n bug | `ActivityPanel.tsx` |

**C. 宿主融合缺陷（工程债，P0 修复）**

| # | 问题 | 证据（已评审复核） | 后果 |
| --- | --- | --- | --- |
| C1 | 4 个悬空变量引用：`--dsw-alias-surface-primary`（ActivityPanel.module.css:138,161）、`--dsw-font-family-mono`（:63）、`--dsw-alias-elevated-surface` / `--dsw-alias-press-surface`（hint-host.module.css:22,50）；宿主全仓库 grep = 0 定义 | 已核实 | 亮色主题下面板背景落暗色 fallback `#16171a` |
| C2 | 面板锁死 12px 字号，不吃宿主可调 `--dsh-content-font-size`（12-17px，默认 14，body 级变量，`boot-theme.ts:21` 写入） | `--tx-fs-*` 常量 | 用户调字号面板不跟随 |
| C3 | 圆角与宿主脱节：宿主全局 `corner-shape: superellipse(1.5)`（`corner-shape.css:16-26`，`*,*::before,*::after` 全量生效）；插件 7 处 999px 胶囊（module.css:122,350,656,664,673,820,831）均未按宿主规范 `corner-shape: round` 成对 opt-out | 已核实 | 胶囊被切超椭圆 |
| C4 | 宿主 `tabInfo` hook（`sidebar.expanded/fullscreen`、`actions.openTab/close`，slots.ts:133-148；随 seat 自动注入 `useTabInfo` prop，ui-sidebar-right/src/client/index.ts:158-159）插件未消费 | 已核实 | 全屏态无法利用宽度 |

### 1.3 用户与场景

盯面板的是"队长会话的主人"：发起团队后切走干别的，回来看看谁在跑、卡没卡、花了多少 token、要不要停。高频动作：**扫一眼整体进度 > 找到卡住的任务 > 点开成员 transcript > 紧急停车**。低频动作：staged 计划编辑、归档翻阅。这个画像决定：仪表必须 3 秒内可读，动效只服务状态变化，不做观赏性动画。触屏（移动抽屉）与键盘是平等公民——关键操作不得 hover 独占（评审 M3）。

---

## 二、设计方向：「调度台」(Dispatch Board)

### 2.0 反默认声明（taste-skill §0.D）

明确不做的：AI 紫渐变、玻璃拟态、发光标题、彩色渐变大面积填充、每行一个装饰圆点、bento 瓷砖、衬线标题、装饰性网格线、`transition: all`、ease-in 进出场。面板的"新"来自**信息形状的改变**（表格→图形），不来自装饰。

### 2.1 概念

把团队卡从"一份表格"重构为"一块仪表"：**头部是仪表盘，主体是轨道图，侧栏是通道条，底部是脉冲带**。视觉语言延续宿主 hairline 克制感，引入一个结构母题——**轨道（lane）**：任务在深度泳道上运行，连接线像调度图；成员是并排的通道；时间线是一根带刻度的轴。按 DENSITY 8 档规范，**团队卡去盒**：取消 teamCard 的边框/圆角/内衬盒（现状 module.css:290-298），多团队之间用加重 hairline 分隔，四个区靠 hairline 与留白分节。

### 2.2 卡片解剖（自上而下）

```
┌────────────────────────────────────────────────────┐
│ ◆ pangu-v0-2-x-review              ⟨运行中⟩  [停止] │  ← 身份行（阶段签为唯一徽章）
│ 让 reviewer 审 pangu v0.2.x 的补丁质量              │  ← 目标一句话
│                                                    │
│  ◕ 3/8 ──────────────────────────  ⏱ 1h12m  ↑45k↓210k │  ← 仪表行（进度环 24px + 等宽数字）
│ ═══╦═══╦═══╦═══╗  (成员通道条，见 §2.4)               │
├────────────────────────────────────────────────────┤ ← hairline 分节（无卡片盒）
│ 任务轨道                                  列表⇄图形  │  ← 唯一保留的分节标签（兼视图切换）
│   T1 ──┬── T3 ──┬── T6                             │
│   T2 ──┴── T4 ──┤  (SVG 轨道图，节点=任务片)        │
│         └── T5 ──┘                                 │
├────────────────────────────────────────────────────┤
│ ▸ 活动脉冲  14:02 researcher 完成 T3                │  ← 单行 ticker，点开整轴
├────────────────────────────────────────────────────┤
│ ✉ 3  researcher→队长 "T4 的依赖输出缺少…"           │  ← 收件箱：未读计数 + 最新一条
└────────────────────────────────────────────────────┘
（线框中的 ✉ ⏱ ◆ ◕ 仅为示意，实现一律路由 icon-data.ts，不得以 emoji/裸字符充当图标）
```

设计决策逐条对应诊断：

| 诊断 | 处置 |
| --- | --- |
| A1 均质行 | 四区各得不同形态（仪表行/轨道图/ticker/信箱行）+ 去卡片盒，靠 hairline 分节成"轨道母题" |
| A2 徽章汤 | 任务属性改**行内 mono 文字注记**（空格分隔，中点每行 ≤1，评审 M4），如 `R2 修复自T3 12m`；仅"队长接管/待修裁决"两种必须醒目的状态保留 4px 方角描边签 |
| A3 眉标滥用 | 四节砍三节；唯一保留"任务轨道"，因其承担视图切换（图形⇄列表）功能标签 |
| A4 DAG 压扁 | §2.3 轨道图（可视化主角） |
| A5 状态文字化 | §2.2 仪表行 + §2.4 通道条 |
| B1-B3 | 徽章排→身份行右侧单一阶段签；中点堆叠→空格+等宽注记；双标题→单标题 |
| B4 空态 | 轨道图预铺空泳道 + "队长拆解中"文案（形态呼应空态，见 §4.5） |
| B6/B7 | P0 文案清单显式修复（§6.1） |

### 2.3 任务轨道图（可视化主角）

- **布局**：纯 SVG，列布局 O(V+E) 手写（约 40 行，`task-layout.ts` 纯函数）。宽容器（右侧栏全屏）：列 = `task.depth` 泳道（自左向右深度递增），行 = 同深度内按创建序。**窄容器（420px 下拉/移动）变体**：行 = 深度泳道（自上而下深度递增），行内节点从左向右排布，依赖边自上方行连入——两种变体共用同一布局函数的转置输出，消除宽窄二义。
- **节点**：88×24 圆角片（窄容器 76px 预算版）；节点态只用描边/填充强度区分：open=hairline 描边空心 / running=accent 描边+静态角标 / blocked=虚线 / completed=成功色 2px 描边 / failed=错误色 / cancelled=40% 透明+删除线。**不依赖颜色单通道编码**（形态差异同步编码，达 charts 可达性要求）。
- **节点内文字**：id（mono 10px）+ 主题截断 12px。
- **可达性（评审 M6）**：节点可聚焦（`tabindex=0` + `focus-visible` 环），hover 与 focus 都触发浮层；浮层承载 description、assignee、model、耗时、注记（含"依赖含已取消任务"提示，工程评审建议 6）、`progressLatest`。
- **环与悬空边兜底**：全部写路径已由服务端校验（`validateStagedGraph` 拒绝自依赖/未知依赖/环，tools.ts:343-358；`validateCreateTask` 拒绝未知依赖，quality.ts:195-205），`teamsx_update_task` 不接受依赖参数——**手改 team.json 是唯一残留向量**，布局函数兜底与服务端 `taskDepthsById` 同构：未知依赖边忽略、环成员落第 0 列；单测显式含手改环用例。
- **尺寸与滚动**：≤4 泳道全展示；>4 泳道横向 scroll-snap 分屏（全屏态展示全部）。
- **入场动画门控**：仅**首次挂载且节点 ≤30** 时启用 stagger（前 12 节点 × 30ms，总时长上限 400ms，评审 M7）+ 连线 draw-in 220ms（stroke-dashoffset 属 paint 属性，作为 rare/first-time 一次性动画显式申报豁免 GPU-only 准则）；**实现用 useRef 哨兵保证仅一次**（工程评审阻塞项 2 的配套）。>30 节点或重挂载不重放。

### 2.4 成员通道条（Roster as channel strips）

成员行改为**横向通道格**：CSS Grid `repeat(auto-fill, minmax(72px, 1fr))`，等宽（评审裁决 D2）；≤10 人单区换行铺满，>10 人第二行起横向 scroll。格内自上而下：

- 角色徽形（18px）→ 名字（可点开 transcript，行为不变；未读徽标**常驻**名字右上角，不进 hover——评审 M3）；
- 活动态件（**全部静态形，零循环动画**——评审 M2）：working=accent 实心方块、idle=hairline 空心方块、unknown=40% 透明方块；文字标签保留（`aria-label` + 状态词）形成双通道编码；
- 底部全格宽 2px 进度轨（完成段成功色/运行段 accent，**静态**，无脉冲）；
- 暂停按钮：working 成员**常驻**显示于格右下（11px 图标钮，评审 M3 撤销 hover 独占）；
- model/token 注记：hover/focus 浮层显示（评审裁决 D3），格内不堆数字。

### 2.5 仪表行（进度环）

头部下方一根仪表行，卡片唯一常驻动画预算区：

- **进度环 24px**（评审 S1：从 20px 上调）：SVG donut，弧段 = 任务六态归并为四段（工程评审阻塞项 1）：completed（成功色）/ claimed+in_progress 合并为运行段（accent）/ failed（错误色）/ pending（hairline）。**cancelled 剔除分母**（分母 = total − cancelled），环恒闭合。达 100% 时只余完成段。数字 `3/8`（分母同口径）承担主表达，环为辅——双通道编码。
- 仪表：总耗时 `⏱` = **running 态任务 elapsedMs 最大值**（按 status 判定，不依赖字段 undefined——工程评审阻塞项 3；无 running 任务时该项隐藏）；全队 token `↑x ↓y` = `members[].usage` 求和（任一 undefined 用 `--` 占位）。等宽字体+tabular-nums，空格分隔，中点禁用。
- staged 阶段：环退化为"计划待审"签，仪表行只显示成员数/任务数。

### 2.6 活动脉冲带（时间线升格）

`<details>` 文本堆换成**单行 ticker**：最新一条操作 = mono 时间 + actor + 动词化动作（+taskId）。展开后为垂直轴：左侧时间刻度（只标分钟变化处）、右侧 actor+动作+taskId、节点方点落轴（终态实心/进行空心）；60 秒内同 actor 连续动作合并计数 `×N`；`detail` 字段进轴行 title 提示不内联（`taskId` 为可选字段，缺省跳过——工程评审遗漏风险 1）。

**动词映射（评审 M4 修正）**：服务端动作词表是 **kebab-case 开放集合**（实测 `state.ts` 16 处 `appendTeamOperation` 调用点 ≥15 种：`task-created/dispatched/claimed/progress/updated/reassigned`、`task-shadow-takeover`、`team-halted`、`dispatch-rolled-back`、`repair-*`×5、`stalled-orphan-requeued`、`stranded-captain-task-requeued`、`stall-*-notify` 等）。映射表只覆盖高频项，**未匹配项回退渲染原始 kebab 串（mono，不译）**，禁止渲染成空白。

**更新动效**：4s 轮询属高频更新（Emil 频率表 "tens/day → remove or drastically reduce"）——文本直接换，不入场动画，至多 ≤150ms 交叉淡化（评审 S4）。

### 2.7 会话内卡片（TeamsXCard）

同一母题缩微：头部（名称+阶段签+计数）保留；成员行改**一排通道件**（角色徽形+静态形状态，可点开 transcript 行为不变）；任务摘要 = **前 2 条保留文本行** + 其余折叠为单行微缩轨道（水平线上状态点列，形态+颜色双通道编码；完成保留删除线文本冗余）。**SSR 冒烟约束**：`client-smoke.mjs:178-179` 断言卡片 SSR 必含成员名与任务主题文本——文本形态保留，微缩轨道为增量（工程评审遗漏风险 4）。

### 2.8 staged 计划审查面

PlanReviewBar 改**审核横条**：左"计划待审"签（去 em-dash 文案）+ 右三动作（批准=宿主 primary 实心、回聊天/放弃=文字钮，放弃保留两段式确认）。StagedPlanEditor 行内编辑功能不动，仅随 token v2 刷新样式。

---

## 三、视觉系统（ui-ux-pro-max 交付物形态）

### 3.1 Token 架构演进（v2）

保持三层架构，`--tx-*` 升格 `--tx2-*`，修复 C1-C3（全部替代变量经工程评审证实存在且语义合适）：

```css
/* 字号：吃宿主可调字号（修 C2）。fallback 13px = 宿主默认 14 时的 secondary 实际值 */
--tx2-fs-2xs: max(10px, calc(var(--dsh-content-font-size-secondary, 13px) - 3px));
--tx2-fs-xs:  max(11px, calc(var(--dsh-content-font-size-secondary, 13px) - 2px));
--tx2-fs-sm:  var(--dsh-content-font-size-secondary, 13px);   /* 基准 */
--tx2-fs-lg:  var(--dsh-content-font-size, 14px);             /* 团队名 */
/* 删除 fs-md（+0.5px 不可感知档，评审 S3）：层级改用字重 500/600 + 色阶 --tx2-text-1/2/3 */

/* 表面：宿主真实别名（修 C1）。注意亮色主题 bg-layer-2 与页面同色（bluish-00），
   层次靠 hairline + 0.5px 内描边补偿，P0 双主题截图专项确认（工程评审建议 3） */
--tx2-surface: var(--dsw-alias-bg-layer-2, transparent);
--tx2-mono: var(--ds-font-family-code, ui-monospace, monospace);  /* 修 C1：宿主真名 */

/* 圆角（修 C3）：文档化规则（taste-skill 4.4 例外条款）：容器 12 / 内件 8 / 控件 6 / 签 4；
   唯一例外=胶囊阶段签（999px），且按宿主 corner-shape.css:11-15 规范与 border-radius
   成对声明 corner-shape: round；满圆形状（圆点、计数徽标、呼吸件）同规则 opt-out（工程评审建议 2） */
--tx2-r-container: 12px;
--tx2-r-inner: 8px;
--tx2-r-ctl: 6px;
--tx2-r-tag: 4px;

/* 语义色（DSW 别名不变）+ 数据可视化档 */
--tx2-accent: var(--dsw-alias-state-business-primary);
--tx2-ok: var(--dsw-alias-state-success-primary);
--tx2-warn: var(--dsw-alias-state-warn-primary);
--tx2-bad: var(--dsw-alias-state-error-primary);
--tx2-viz-track: var(--dsw-alias-border-l3);
--tx2-viz-edge: var(--dsw-alias-border-l2);
```

色彩纪律（taste-skill LILA RULE + COLOR CONSISTENCY LOCK）：**单一 accent = 宿主 `state-business-primary`**，成功/警告/错误三态色只作语义墨水（描边、点、弧段），禁大面积填充；全卡不出现第四种色相。删除 `taskLaneSegment` 按 depth 涂语义色的既有误用（语义色不得用于非状态维度），不复活。

对比度门禁：`fs-2xs`（10px 下限）mono 注记全部过 4.5:1 审计（ui-ux-pro-max Pre-Delivery Checklist）；用户字号设 12/14/17 三档截图验收（工程评审遗漏风险 6：低端触底行为与宿主节奏对齐检查）。

### 3.2 排版

- 数字（id、时间、计数、token、耗时）全部 `--tx2-mono` + `tabular-nums`。
- 时间线动词化按 §2.6 映射表 + kebab 回退；`（最近 N 条）`硬编码串顺带修复为 locale 键（B7）。
- 全部可见文案过 taste-skill COPY SELF-AUDIT；`队长正在把目标拆解成任务` 保留（具象无 AI 腔）。

### 3.3 动效规格（emil-design-eng 十准则逐条对标，review-animations 门禁）

| 场景 | 规格 | 准则依据 |
| --- | --- | --- |
| 面板展开（下拉窗） | scale 0.97+opacity 0，origin=徽标锚点，180ms ease-out | #3 #5 |
| 面板收起 | **120-140ms ease-out**（评审 M1：ease-in on UI 是 block；收起是系统响应应更快，#9 非对称时序指"用户决策慢、系统响应快"） | #3 #9 |
| 轨道图首次入场 | 前 12 节点 stagger 30ms（总长 ≤400ms，评审 M7）+ 边 draw-in 220ms（paint 属性一次性申报豁免）；useRef 哨兵仅一次；>30 节点关闭 | #1 #2 #7 |
| 轮询状态变化（含轨道图节点、环弧段） | `transition: stroke/fill 160ms`；节点 DOM 复用（同 key），无 keyframe 重放 | #6 可中断 |
| 进度环/进度轨 | `transition: stroke-dashoffset 300ms ease-out`（300ms 压 UI 上限，申报） | #7 |
| 循环动画预算 | **全屏至多 1 处**：仅折叠徽标的工作中脉冲角标；展开后停止（脉冲/呼吸不并存）；通道格状态件**全静态**（评审 M2）；idle 旋转循环（现状 animThink）退役 | #2 |
| hover 浮层 | 120ms ease-out + 4px 位移；`@media (hover: hover) and (pointer: fine)` 门控；focus 等价触发；**相邻节点切换免延迟**（emil Tooltips 规则，评审补充） | #8 |
| ticker 更新 | 文本直换，≤150ms 交叉淡化或无动画（评审 S4） | #2 |
| 按钮按压 | scale(0.97) 120ms（现状保留） | 反馈 |
| `prefers-reduced-motion` | 循环动画全停（含徽标脉冲、draw-in、stagger）；保留 opacity/颜色过渡（"gentler, not zero"，修正现状全禁反模式 module.css:1007-1052） | #8 |

### 3.4 图标

沿用 `icon-data.ts` 单一数据源（23 数据图标 + 4 chrome glyph 全保留）。新增：`action-blocked`、`viz-list` / `viz-graph`、`glyph-spark`、**`glyph-inbox`（信封）、`glyph-clock`（时钟）**（评审 S6：线框示意字符一律路由数据表，禁 emoji 充当图标）。`pnpm icons` 重导 assets，`verify:icons` 过闸。

---

## 四、分载体改造清单

| 载体 | 改造 | 文件 |
| --- | --- | --- |
| 会话头徽标 | 折叠态保留 30×26 + 工作中脉冲（全卡唯一循环动画）；展开态换新仪表卡 | `ActivityPanel.tsx` |
| 下拉窗/抽屉 | 新仪表卡 + 轨道图窄变体（§2.3 行=深度泳道） | 同上 + CSS |
| 右侧栏页签 | 同一体 + **`useTabInfo` 感知全屏**（修 C4）。**防御（工程评审阻塞项 4）**：`tab-info.ts:34-36` 对未提交 tab 记录会 throw，必须 error boundary 或 try-catch hook 封装降级（无 tabInfo → 按 420px 心智渲染，零回归） | `panel-hosts.tsx` |
| 会话内卡片 | §2.7（文本保留满足 SSR 断言） | `TeamsXCardPanel.tsx` + CSS |
| 计划审查 | §2.8 | `ActivityPanel.tsx` / `StagedPlanEditor.tsx`（样式层） |
| 空态/错误态 | 空态换轨道预铺形；hint toast 随 token 刷新 | 同上 + `hint-host.tsx` |
| 组件拆分 | `ActivityPanel.tsx`（856 行）拆 `TeamHeader` / `TaskGraph` / `RosterStrips` / `ActivityTicker` / `InboxRow`；`task-layout.ts` 纯函数拓扑布局（可单测）；**`TEAMSX_*_URL` 常量下沉叶子模块 `endpoints.ts`**（消除既有 ActivityPanel↔StagedPlanEditor 循环 import，工程评审建议 1）；**保持 `lib/client/ActivityPanel.js` 导出面不变**（smoke :138 与 panel-hosts :32 依赖） | `src/client/` |

国际化：净变化约 +18 键（视图切换 ×2、仪表标签、浮层字段名、ticker 动词映射表、修复键），删 3 键（`section.members/timeline/inbox`），改 4 键（`section.tasks`、`panel.empty`、`plan.needsReview`、`team.done` 措辞复查）；zh 为键集真源，en 强制同构（`TeamsXLocaleKey` 派生 + smoke :107-110 双保险）。

---

## 五、可行性分析

### 5.1 数据可行性（结论：全部可视化均有既有字段支撑，服务端零改动）

| 可视化 | 数据来源（既有快照字段，已评审核对） | 备注 |
| --- | --- | --- |
| 轨道图拓扑 | `tasks[].depth` + `dependencies` + `state`（snapshot-types.ts:62-87） | 服务端 `taskVisualState`/`taskDepthsById` 已算 |
| 进度环 | `tasks[].status` 六态计数归并（§2.5 口径），分母剔除 cancelled | 纯前端聚合 |
| 仪表行耗时 | running 态任务 `elapsedMs` max（**字段恒有值**，snapshot.ts:168-170 对所有任务计算——按 status 判定而非 undefined） | 工程评审阻塞项 3 |
| 全队 token | `members[].usage` 求和（best-effort，undefined→`--`） | |
| 通道条 | `members[].activity/status/done/total/progress/name/id/role` | |
| 脉冲带 | `operations[].ts/actor/action/taskId?/detail?`（最新 50 条，snapshot.ts:189） | taskId 可选、detail 进 title |
| 收件箱 | `captainInbox[]`（最新 5 条）+ `messageCount`（队长+成员未读合计，snapshot.ts:183-184） | **计数口径：行尾数字 = messageCount（未读合计），预览行 = captainInbox[0]** |
| hover 浮层 | `task.description/assignee/model/usage/elapsedMs/progressLatest/verdict/round/takenOverBy` | |

不新增端点、不改轮询节奏、不动 `src/*.ts`。唯一约束：快照是 4s 离散帧，轨道图不做过程插值，状态直接切换过渡（符合 Emil #6）。

### 5.2 技术可行性

- **零新增运行时依赖**：SVG 手绘（React 内联，与 icon 体系同构）；无 dagre/d3/motion。
- **bundle 预算**：新增约 12-15KB min，对 129,431B 的 `lib/client.js` 增幅 <12%；tsdown 单文件 CJS 形态不变。
- **渲染性能与缓存（工程评审阻塞项 2 修正）**：`useTeamData` 每轮 `JSON.parse` 产生新对象，**按 tasks 引用 useMemo 必然每 4s 重算，原声明无效**。修正为**序列化指纹**：
  ```ts
  const fingerprint = tasks.map(t => `${t.id}:${t.status}:${t.depth}:${t.dependencies.join(',')}`).join('|')
  ```
  布局 `useMemo` 以 `(teamId, fingerprint)` 为依赖；入场动画用 `useRef` 哨兵保证仅首次。≤30 节点 O(V+E) 重算本身 <2ms（最坏情况也只是浪费，不是错误）；指纹命中时零重算且动画不重放。动画全走 transform/opacity/stroke 类属性。
- **SSR 冒烟约束（工程评审遗漏风险 3）**：smoke mock 环境无 `matchMedia`/`ResizeObserver`/真实 DOM——`task-layout.ts` 与 TaskGraph 不得在模块顶层访问布局 API；`TeamsXTabBody` 保持 SSR 非空断言（smoke :254-261）；smoke import 路径钉死的 5 个模块名与导出面（`ActivityPanel`/`TeamsXPanelBody` 等）保持不变。
- **宽度约束**：420px 下拉与 ~340px 侧栏为最窄容器，走 §2.3 窄变体；移动抽屉全宽。`fullfunctional-test` 仅 import `lib/{state,quality,tools,events,compat,web-routes}.js`，本方案零触碰。
- **老宿主降级**：不改任何挂载点注册；`tabInfo` 随 seat 自动到达（无需新注册路径）+ error boundary 防御（§四）；无 tabInfo 服务时按 420px 渲染，零回归。
- **主题**：颜色全经 DSW 别名；修复 4 处悬空引用后亮色主题恢复（现状是 bug）；亮色 `bg-layer-2` 与页面同色的层次补偿见 §3.1。

### 5.3 工程风险与缓解

| 风险 | 等级 | 缓解 |
| --- | --- | --- |
| 856 行拆分引入回归 | 中 | 先纯拆分提交（行为不变，smoke 全绿）再逐组件换肤（P0 末执行，评审 S8）；循环 import 顺手消除（endpoints.ts 下沉） |
| 布局异常拓扑 | 低 | 服务端写路径已全校验（tools.ts:330-359）；手改兜底与 `taskDepthsById` 同构 + 环用例单测 |
| locale 键漂移 | 低 | smoke 键一致断言现成 |
| 图标 assets 漂移 | 低 | `verify:icons --check` 现成 |
| 动效过界 | 中 | §6.3 review-animations 门禁，默认 flag |
| 版本口径（-src 0.8.0 / 部署副本 0.8.1 / CHANGELOG 缺 0.8.1） | 低 | **以 -src 为真源统一**：bump 0.9.0，CHANGELOG 补 0.8.1 说明或在 0.9.0 条目注明（工程评审建议 5） |
| 部署副本无漂移检测 | 低 | 每阶段同步后 `diff -r` 关键产物（lib/、package.json、assets/）（工程评审遗漏风险 5） |
| 验证依赖宿主重启（无 HMR） | 低 | build → 同步 `/home/xiaoxin/dsh-teams-x/` → `dsh_restart.sh`（systemd 重启 3080 就绪 ≤90s）→ 刷新；每阶段一次 |

### 5.4 与约束的冲突检查

- "UI 不能引入端点外的新数据" → 零新数据（§5.1）。
- 零运行时依赖红线 → 未引入。
- 宿主 DSW token 纪律 → 全部颜色/字体经别名引用，无自建色值；4 处错引用本期修正。
- taste-skill "不适用于 dashboards" → §〇 显式裁剪取用范围（评审确认这正是 taste-skill §13 要求的标准动作）。

---

## 六、实施计划与验收

### 6.1 阶段划分（每阶段独立可发布、可回滚）

| 阶段 | 内容 | 规模 | 门禁 |
| --- | --- | --- | --- |
| **P0 融合修复 + 纯拆分** | C1 悬空变量 / C2 字号跟随 / C3 圆角+corner-shape 成对声明 / **B6 em-dash ×4 清除（zh+en）** / **B7 硬编码中文修复（ActivityPanel.tsx:592 等）** / **856 行纯拆分为五子组件（行为不变，endpoints.ts 下沉）** | ~250 行 | `pnpm verify` 全绿 + 亮暗双色 + 字号 12/14/17 三档截图 |
| **P1 视觉系统** | token v2、身份行/仪表行（六态口径）、通道条（静态态件、暂停/未读常驻）、脉冲带（kebab 回退映射）、收件箱行、计划审查横条、去卡片盒；**hover/touch 键盘等价通道在 P1 设计冻结前定案（评审 M3）** | ~600 行 | 同上 + smoke SSR 新断言 |
| **P2 可视化主角** | 轨道图（布局单测含环用例、浮层 focus/hover 双触发、视图切换、指纹缓存+哨兵门控）、tabInfo（error boundary 防御）、会话卡微缩轨道 | ~650 行 | 同上 + 布局单测 + 动效审查表 |

### 6.2 验收标准（Definition of Done）

1. `pnpm verify`（typecheck + build + smoke + 236 功能用例 + icons）全绿。
2. 亮/暗两主题 × 桌面/移动（≤768px）× 字号 12/14/17 三档截图过审；亮色主题面板层次可辨（§3.1 专项）；无错位无暗色泄漏。
3. taste-skill 反 AI 味机械检查：可见文本 0 em-dash（含 B6 修复验证）；每卡 ≤1 眉标；装饰点 0（语义态件除外）；徽章 ≤2 种形；中点 ≤1/行。
4. Emil 动效审查（§6.3）：0 block 级 finding；循环动画全屏 ≤1。
5. 可达性不回退（taste-skill 11.C）：焦点态全控件可见（含 SVG 节点 focus-visible）、键盘可完成展开/切视图/停团队全流程、触屏可完成停车与成员暂停（无 hover 独占）。
6. 3 秒读 Panel：不开浮层能回答"谁在跑/卡没卡/完成多少/花了多少"。
7. 真实实例（pangu-v0-2-x-review 团队）跑通：展开→轨道图渲染→hover/focus 浮层→停车确认→归档视图。

### 6.3 动效门禁执行方式

实现分支完成后，由动效评审代理按 `review-animations/SKILL.md` 的 Before/After 表格式输出审查记录（每条动效一行，含 paint 属性豁免申报），block 级 finding 清零方可合入。

---

## 七、裁决项（评审后定案）

| # | 事项 | 定案 | 依据 |
| --- | --- | --- | --- |
| D1 | 轨道图默认视图 | **实时视图默认图形、归档视图默认列表**（静态历史数据图形无信息增益） | 评审 S5 |
| D2 | 通道格宽度 | **等宽**（minmax(72px,1fr)） | 双评审一致 |
| D3 | 单成员 token | hover/focus 浮层（M3 保证触屏键盘等价） | 评审 M3 |
| D4 | 阶段签形态 | 胶囊 999px，作为圆角规则**唯一文档化例外**，`corner-shape: round` 成对声明 | 评审 M8 |
| D5 | 版本 | v0.9.0，-src 为真源，部署副本与 CHANGELOG 对齐 | 工程评审建议 5 |
| D6 | DENSITY 档位 | **8（Cockpit）+ 团队卡去盒**（hairline 分节），删除"Cockpit"误引（8-10 才是 Cockpit） | 评审 S2 |

---

## 八、可行性审核记录

| 评审 | 结论 | 必须项 | 吸收情况 |
| --- | --- | --- | --- |
| 设计负责人（taste-skill + emilkowalski + ui-ux-pro-max 规则集） | 有条件通过 | M1 收起动效 ease-in→ease-out；M2 循环动画预算矛盾消除（通道态件全静态）；M3 暂停/未读不得 hover 独占；M4 中点 ≤1/行 + 动词映射用实测 kebab 词表；M5 em-dash/硬编码中文入 P0 清单；M6 轨道图键盘可达；M7 stagger ≤400ms + 窄容器布局二义消除；M8 圆角例外文档化 | 全部吸收：§3.3、§2.4、§2.6、§6.1、§2.3、§3.1、§七 D4 |
| 技术负责人（逐条源码取证） | 有条件可执行 | ① 进度环六态口径（六态枚举 state.ts:471-474，四段弧无法闭合）；② §5.2 缓存声明无效（JSON.parse 引用必变）→ 指纹方案 + 入场动画哨兵；③ elapsedMs 恒有值 → 按 status 判定；④ `useTabInfo` 对未提交 tab 会 throw → error boundary 防御 | 全部吸收：§2.5、§5.2、§2.2 仪表行、§四 |

**审核终局结论**：方案**可行性通过**。P0 可立即执行；P1 按修订后口径（六态环、静态态件、常驻控件）执行；P2 按防御性设计（tabInfo boundary、指纹缓存、动画哨兵）执行。三阶段全部走 §6.2 门禁。

---

## 九、实施偏差记录（实施后回写）

| # | 方案原口径 | 实施口径 | 理由 |
| --- | --- | --- | --- |
| 1 | token 升格 `--tx2-*` | 保留 `--tx-*` 前缀、就地升格 v2 值 | 整文件重写下改名只产生 diff 噪声，无功能收益 |
| 2 | 面板表面用 `--dsw-alias-bg-layer-2` | 改用 `--dsw-alias-bg-overlay` | 工程评审指出亮色主题 layer-2 与页面同色；overlay 在亮暗两主题都有真实对比度，语义也更贴（悬浮面） |
| 3 | 布局函数本地重算 depth、环成员落第 0 列 | **信任快照 `task.depth`**（服务端 `taskDepthsById` 已算好），布局只做分组+边过滤+防御性钳制 | 服务端 DFS 记忆化对环的实际行为是"环成员获得膨胀深度"而非 0；本地重算可能与服务端分叉，信任快照才是真正对齐。评审原表述据此修正 |
| 4 | draw-in 连线用 stroke-dashoffset | 边入场为纯 opacity 淡入（220ms） | 避免 paint 属性豁免争议，视觉等效 |
| 5 | 面板收起 120-140ms ease-out 出场 | 收起=即时卸载（无出场动画） | Emil #9：系统响应要快；无动画即无 ease-in 违规，且免去延迟卸载状态 |
| 6 | 空态骨架条 | 保留形态、去掉 shimmer 循环动画 | 循环动画预算（全屏仅徽标脉冲）优先级高于 shimmer 装饰 |
| 7 | 新增 glyph 清单 | 新增 GlyphClock/GlyphInfo/GlyphInbox（chrome glyph，内联 icons.tsx，不走 icon-data 导出管线） | 属界面 chrome 而非领域图标，与 GlyphRefresh 同类；verify:icons 保持零漂移 |

## 十、浏览器验收记录（2026-09-13，桌面 1440px + 移动 390×844）

由产品经理在真实实例（dsh-web 3080 / dsh-remote-x 移动覆盖层）上以无头浏览器逐形态走查：桌面徽标下拉窗、右侧栏页签（列表+图形）、任务节点浮层、移动端徽标底部抽屉、移动端右侧栏页签全屏形态、dsh-remote-x 仪表盘入口。走查后修复：

| # | 发现 | 修复 |
| --- | --- | --- |
| B1 | 移动端右侧栏页签 + 徽标抽屉同开时，同一张团队卡垂直堆叠渲染两份（双挂载宿主的真实用户路径） | 新增 `sheet-visibility.ts` 模块信号：≤768px 且抽屉展开时页签正文渲染 null 让位；抽屉关闭自动恢复 |
| B2 | 轨道图连线 1px hairline + 45% 透明几乎不可见 | 边增强为 1.4px、`--tx-viz-edge` 改 label-tertiary 60% 混合、完成边透明度 0.45→0.65 |
| B3 | 泳道方向只由 tabInfo.fullscreen 决定：590px 非全屏侧栏误用纵排变体，行内节点横向溢出截断 | 方向改按容器实测宽（ResizeObserver ≥520px → 横排）；fullscreen 仅作首帧 hint。实测侧栏 348×204 图完整放下 |
| B4 | 节点浮层渲染在节点正上方，盖住上方行与团队头部 | 浮层改节点下方，容器底部翻转到上方并钳制 |
| B5 | 任务行 subject 截断偏紧 | 列距 6→4px、id 列 44→40px |
| B6 | 横向溢出出现系统默认粗滚动条 | 细滚动条（6px hairline thumb + scrollbar-width: thin） |
| B7 | reduced-motion 下进度环 stroke 颜色过渡被一并禁掉 | 拆分：几何（dasharray）瞬时、stroke 颜色保留 |

复验结论：桌面下拉窗（420px，纵排泳道+清晰连线+细滚动条）、右侧栏页签（横排泳道 348×204 完整呈现 3 层深度链）、节点浮层（下方弹出、字段完整）、移动抽屉（单卡、通道条/注记/脉冲带/信箱齐备）、移动页签+抽屉去重（paneCount=0）全部通过。

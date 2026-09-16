# Changelog

## 0.10.1 (2026-09-17)

- Fix: 成员详情浮层被吸附过滤条遮挡——`.memberChipPop` z-index 6→20（与过滤条同处面板滚动容器层叠上下文，须高于其 sticky z-index 10），悬停/聚焦/钉住三通道现可完整盖过「正在发生」条、任务水位行、过滤 chips 与时间流；任务详情浮层（fixed, 70）不受影响。
- Fix: 任务消息不自动换行——`.streamDetail` 去掉单行省略（nowrap）改为自然换行（`overflow-wrap: anywhere`），×N 合并徽标移到详情之前避免歧义；`.tcSubj` 任务主题改两行钳制；`.msgRich` 长 token（URL/路径）可断行，`pre` 代码块横向滚动。

## 0.10.0 (2026-09-17)

- 面板信息架构重设计 v0.10「时间线叙事流」（方向 C 定稿）：依据 teamsx-redesign 交付包（redesign-proposal §10 方向 C + coverage-checklist M1-M27 全覆盖 + handoff-and-integration 落地路径），把「调度台」的四大分块（成员区/任务区/动态区/收件箱）重排为单列统一时间流：
  - **统一时间流（timeline-stream）**：结构化操作与队长来信按 ts 穿插排序（快照 `captainInbox` 补投影 `ts`，窗口 5→10 条），连续同源操作 60s 合并 ×N、飞行态（派发/认领/上报）空心轨点、失败/完成事件色点；任务不再独立成区——每个任务在其**最新事件处**内联一张状态卡（id/R# 轮次/队长接管/耗时/主题/状态/第 N 层/↻ 修复源/N×上报/裁决签/deps/执行人印记点 + 上报次数火花线），流与状态从此同栏互证；跨天自动日分隔，超 10 条折叠"载入更早"；点击状态卡弹任务详情浮层（描述/执行人/依赖/最新进度/耗时，点外/Esc/滚动关闭）
  - **头部仪表重排**：完成度环（32px 环心 done/total + 百分比）、任务总耗时、token 输入/输出双条；运行中团队另配**任务状态分段条**（五态堆叠条 + 计数图例）
  - **「正在发生」钉条**：工作中成员（26px 印记色迷你进度环 + 当前任务 id/主题 + 未读徽标）+ 无人驱动的运行任务；点成员钉条即"只看该成员"（过滤流），点任务即定位
  - **成员印记条**：全员紧凑芯片（徽记 = 详情开关，悬停预览 + 点击钉住 + focus-within 三通道；名字 = 会话跳转；工作中静态点；未读角标），模型/token/任务进度/暂停收进浮层——替代原成员通道条且不占分块
  - **任务水位线**：全任务一行迷你状态块（终态满格、进行/阻塞半格、语义色），点击展开折叠并在流中滚动定位该任务最新事件
  - **过滤 chips**：全部/任务/消息（含未读数）+ 动态"只看 {name}"成员片 + 计数，吸附在滚动口顶部；时间流与过滤共享同一 applyStreamFilter
  - **挂点适配**：徽标下拉窗 420→560px、上限 720px（交接文档 §3 形态适配），≤520px 窄容器时间列自动内联降级；流内执行者可点击直达其会话记录
  - **退役**：member-row / task-row / activity-ticker 三个组件及其样式块（功能全部并入时间线流 + 成员印记条，无一静默丢失）；动效预算重立：徽标呼吸 + 正在发生运行点脉冲共 2 处常驻循环，reduced-motion 全停改常亮
  - **locales**：新增 19 键（正在发生/过滤/水位/浮层等，zh 键集基准 + en 镜像，142/142 对齐）
  - **工程面**：客户端全量测试绿（typecheck/build/smoke/verify:flow/functional/icons，267 项 PASS）；无头 Chromium + CDP 真实信任事件驱动实测——明暗双主题、staged/halted/archive/busy 四态、过滤/成员只看/折叠展开/水位定位/任务浮层/成员浮层/Esc 关闭/会话跳转全通过

## 0.9.1 (2026-09-14)

- 借鉴 dsh-flow（MIT）的精华并全部自研重写，零原实现痕迹；面板静默化 + 成员身份系统：
  - **静默轮询（snapshot-compare）**：每拍快照先做结构等值比较，渲染等价的轮询零提交——面板不再每 4 秒无谓重渲染，悬浮/焦点/控件状态不被打扰；轮询失败时保留 last-known-good 列表并降级为一行"连接断开"状态条（panel.stale），红色错误盒只留给"完全无数据"；转圈只随手动刷新出现
  - **收件箱 RichText（rich-text）**：队长收件箱消息体从单行纯文本升级为两行钳制的富版式（代码 span/围栏、加粗、列表）；渲染器只产出 React 元素、零 HTML 字符串，模型输出天然惰性（XSS-by-construction），无需净化器
  - **成员印记系统（member-identity）**：名字 FNV-1a 哈希 → 六档身份墨水（--tx-mate-0..5，明暗双主题稳定、刻意避开状态色相），双语关键词桶（zh/en、特异→宽泛、首匹配）→ 角色徽记；同一成员在成员格徽记芯片、任务执行人点、收件箱发送者点处处同色同形；是视觉法则"禁止第四色相"唯一文档化例外（仅限最小标识面）
  - **脉搏层（live-activity + client-runtime）**：订阅宿主 sessions 服务的成员会话 running 位——成员开跑/收工毫秒级反映（轮询 4s 兜底、30s TTL 交还权威）；宿主 face 由壳层 provideSessions 注入，不穿透四层 props；全程 feature-detect，旧宿主/冷子代理自动回退轮询
  - **砍项**：成员转录"落点直达最新汇报"——实测宿主 ChatView 新开即落尾、重访恢复上次位置是宿主有意的续读设计，不重复造轮子
  - **徽标呼吸（任务在跑 → 闪烁变色）**：触发条件为任务 claimed/in_progress（非成员活动位），徽标本体 1.6s 脉冲闪烁（肤色↔accent 变色 + 1.06 轻微缩放，无外圈光晕，循环预算仍全屏仅此 1 处）；点状指示改常亮；展开态与 reduced-motion 停动改常亮工作色；折叠徽标在本会话有团队后自动升 4s 快轮询，呼吸及时点亮
  - **修复：徽标 token 作用域脱靶**（呼吸验证时揪出的 v0.9 潜伏 bug）：--tx-* token 只定义在 .panel/.panelWindow/.panelSheet 上，而徽标位于会话头部、不在任何面板根内部——其上所有 var(--tx-*) 未定义，颜色/字号静默退化为 currentColor/inherit，accent 状态点实际不可见，基于 var() 的动画声明整体失效。将 .badgeFab 纳入 token 作用域，徽标主题化全面生效
  - **修复：队长收件箱"永远空白"**：面板取数用的是 readUnreadMailbox（仅未读）——队长按工作流及时读信后消息就从面板消失，健康运行中面板必然空白。改为读完整邮箱历史（最近 5 条、最新在前，已读未读都显示），未读徽标（messageCount）语义不变；真实会话验证：成员自动完成的任务通知与 teamsx_send_message 自由汇报均在已读后持续可见
  - **修复：token 统计恒为 "--"（真实会话实测揪出三层断链，全部修复）**：
    1. `stateOf` 返回 meter 内部折叠态 `{ totals, last }`（扁平桶在 `totals` 下），读取器按顶层扁平取值 → 永远 undefined
    2. 该宿主版本公开 `Agent` 面只有 `id` 没有 `.session`，`agents.get(id).session` 第一道守卫即短路 → 改走宿主 `sessions` 注册表（`sessions.get(id)`，与 session-title 等宿主服务同款访问），agents 旧形态留作回退
    3. cordis 访问控制：未声明 inject 的服务读取被拒（`cannot get property "sessionProjections" without inject`）→ 服务端 inject 声明补 `sessions` + `sessionProjections`（数组只授访问权，旧宿主缺服务时读取器优雅降级，不炸加载）
    4. **持久化增强**：成员子会话 idle 即卸载，实时读数归零 → 任务完结捕获时把累计用量同步写入成员档案（team.json），快照装配"实时优先、持久兜底"，面板在成员空闲后仍显示最后一次累计值
    5. **耗时瓦片改总耗时**：原语义"最长运行中任务耗时"在任务全部完成后归 "--"；改为任务总耗时（终态任务计最终时长、运行中任务计实时增长时长），标签同步改"任务总耗时/Total task time"
    6. 真实会话验证（1 名成员 6 个任务）：运行中用量逐秒爬升（↑23.4k→26.1k）、完结任务任务级落盘（t5/t6 *U）、idle 后成员行与仪表行稳定显示 ↑26k ↓6.3k；U15 系列测试更新至宿主真实 shape 并补扁平兼容/空值/agents 回退三组断言（239 项全过）
- 工程面：client-smoke 新增 4 段单测（印记稳定性/双语映射、等值闸门同值异象、RichText 渲染+惰性、脉搏权威模型），zh/en 132/132 对齐
## 0.9.0 (2026-09-13)

- 面板 UI 全新重设计（「调度台」）：依据 docs/panel-redesign-v0.9-proposal.md（taste-skill + ui-ux-pro-max + emilkowalski_skills 三技能合流，双评审可行性审核 + 动效门禁全过）
  - **融合修复（P0）**：修 4 处悬空 CSS 变量引用（--dsw-alias-surface-primary/elevated-surface/press-surface/--dsw-font-family-mono → bg-overlay / interactive-bg-hover / --ds-font-family-code），亮色主题不再漏暗色底；字号吃宿主可调 --dsh-content-font-size（12-17px 全档跟随）；999px 胶囊按宿主规范成对声明 corner-shape: round；清除全部 em-dash 与硬编码中文（补 14 个 locale 键，zh/en 132/132 对齐）
  - **组件拆分（P0）**：856 行 ActivityPanel 拆为 endpoints/api/format/member-row/task-row/plan-review/team-card/panel-body，消除 ActivityPanel↔StagedPlanEditor 循环依赖；导出面不变（smoke 5 模块锚点保持）
  - **视觉系统（P1）**：「调度台」仪表形态——身份行（名称+阶段签+停止）、仪表行（24px 六态进度环，cancelled 剔除分母；耗时=运行中任务 elapsed 最大值；全队 token 求和）、成员通道条（等宽格、静态形状态件、未读/暂停常驻、hover/focus/点击三通道信息浮层）、任务行胶囊徽章墙改 mono 注记（仅接管/裁决保留 4px 方角签）、活动脉冲带（operations 动词化 + kebab 回退 + 60s 同源合并）、收件箱单行预览（messageCount 未读徽标）；团队卡去盒（DENSITY 8，hairline 分节）
  - **任务轨道图（P2）**：依赖 DAG 升格为 SVG 泳道图——宽容器列=深度、窄容器行=深度（同一布局函数转置）；节点态纯描边/形态编码；focus/hover 双通道详情浮层（含"依赖含已取消任务"警示）；实时默认图形、归档默认列表，一键互切；布局纯函数化（信任服务端 task.depth，未知依赖边丢弃，9/9 单测），指纹 memo + 一次性入场 stagger（前 12 节点 ×30ms）
  - **tabInfo 感知（P2）**：右侧栏页签消费宿主 useTabInfo，全屏态轨道图横排泳道；error boundary 防御未提交 tab 记录的 throw，降级窄布局
  - **动效（Emil 门禁 PASS）**：循环动画全屏仅折叠徽标脉冲 1 处（展开即停、数字移出 6px 点）；收起=即时卸载；面板入场 180ms origin-aware；reduced-motion 重构（位移动画全停、面板退化为纯 opacity 淡入、颜色过渡保留）；进度轨 scaleX 替代 width 动画
- 浏览器实测修正（桌面 1440px + iPhone 390×844 视口，dsh-remote-x 移动层）：
  - 移动端会话头抽屉与右侧栏页签同开时双卡堆叠 → 抽屉展开时页签正文自动让位（模块信号 sheet-visibility）
  - 任务轨道图方向改按容器实测宽度（ResizeObserver，≥520px 泳道横排）——590px 侧栏不再误用纵排导致横向截断
  - 连线可见度增强（1.4px + text-3 60% 混合色，完成边 65%）；节点浮层改渲染在节点下方并随容器翻转/钳制
  - 任务行列距收紧（id 40px、列距 4px）；轨道图细滚动条；reduced-motion 下进度环保留颜色过渡
- 用户回访迭代（第二轮）：
  - 品牌徽标换为机器人头形（用户供图）：图标系统支持 fill 型图标（自定义 viewBox / fill=currentColor），导出管线同步
  - 面板/浮层背景从 bg-overlay 改为 bg-base，完全跟随宿主主题色
  - 下拉面板停靠改贴左侧栏右缘（sidebarCol 结构锚点 + tablist/徽标双兜底）
  - 任务图形重做：节点只显示 id（64×24），悬停/点击/聚焦弹详情浮层
  - 列表模式去标题：新增分段进度条（一段一任务、2px 缝分隔、状态着色、悬停出详情卡），行内仅保留 id/注记/指派/状态
- 用户回访迭代（第三轮）：
  - 取消图形/列表双模式切换与分段进度条，任务区统一为「轨道图 + 条形卡片」单一视图
  - 任务列表重做为状态条形卡片：彩色左轨 + 状态染色面（绿/蓝/橙/红/取消淡灰），行内 id/注记/指派/耗时，悬停/聚焦弹详情浮层
  - 右侧栏 TeamsX 页签正文加 16px 两侧留白（对齐 dsh-context 插件的面板边距）
- 用户回访迭代（第四轮）：
  - 下拉面板与左侧栏间距改为 10px
  - 移除任务轨道图（SVG DAG）与 task-layout 纯函数及单测（verify 链同步收敛）；任务详情浮层独立为 task-popover 模块
  - 面板大区块卡片化（对齐 dsh-context 插件分区语言）：成员卡 / 任务卡 / 动态+收件箱卡，卡头带标题与计数
  - 进度环放大为 72px（对齐 context 面板 Token 统计的环+中心读数形态），中心显示 完成数/分母 + 标签，右侧耗时与 token 改为统计瓦片
  - 任务 id（t1/t2）改为小背景长方块（行内代码片样式，状态着色）
- 用户回访迭代（第五轮）：取消任务条形卡片的悬停/键盘聚焦详情浮层（task-popover 模块移除），任务识别回归原生 hover 提示
- 用户回访迭代（第六轮）：右侧栏 TeamsX 页签正文改为自适应宽度——随容器流式伸缩，超宽容器（全屏态 ~1470px）下收在 760px 可读列内并水平居中
- 用户回访迭代（第七轮）："任务"标题行与"队长收件箱"标题行下方各加一条分隔线（标题与线间隔 6px）
- 验证：pnpm verify 全绿（typecheck + build + smoke + verify:flow + 236 功能用例 + icons）
- 注：0.8.1 为部署副本手工版本号（修移动端面板错位），未建 CHANGELOG 条目，变更已包含在本版本基线中

## 0.8.0 (2026-09-13)

- 面板 UI 全量重构（taste-skill + ui-ux-pro-max design-system + emil-design-eng 三技能合流）：
  - **三层 token 架构**：新增 --tx-* 组件 token 层（字阶/间距/圆角/动效曲线/语义色），
    全部 90 个类只引用组件 token，主题适配由 DSW 语义别名承担
  - **动效体系（Emil 框架）**：自定义曲线 ease-out cubic-bezier(0.23,1,0.32,1) /
    ease-inout / drawer；按压 120ms scale(0.97)；条目 ease-out、屏上 ease-inout；
    下拉窗从徽标原点展开（scale 0.97 + opacity，永不用 scale(0)）；移动端底板抽屉曲线
  - **排版重构**：字阶 10/11/12/12.5/14；任务主题 500、团队名 14px/600/-0.01em；
    分节微标签（uppercase + 0.08em tracking）；数字全 tabular-nums + 等宽栈
  - **UI 重构**：hairline 表面（去重阴影）、圆角层级（容器 10 / 内件 6 / 控件 4）、
    分节微标签（成员/任务/时间线/收件箱，双语）、任务行/成员行 hover、
    收件箱行 hover、进度条宽度过渡
  - 布局防御修正：分节标签渲染后 DAG 空态/时间线结构保持（避免列错位回归）
- 功能零改动；smoke:client PASS；236 项功能测试全绿

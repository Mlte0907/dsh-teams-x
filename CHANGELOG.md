# Changelog

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

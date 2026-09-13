# Changelog

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

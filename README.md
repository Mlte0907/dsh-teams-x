# dsh-teams-x

<p align="center">
  <img src="./assets/icons/teams-x-logo.svg" width="48" alt="TeamsX logo">
</p>

**TeamsX for DeepSeek Harness** — turn one session into a coordinated multi-agent team: a captain spawns durable member subagents, breaks a goal into a dependency-aware task DAG, and coordinates through direct mailbox messages, with a live all-SVG activity panel.

> 本插件原生面向 **DeepSeek Harness 0.1.3-alpha.1**（源码 checkout），并把所有宿主 API 触点收敛到 `src/compat.ts` 能力探测层——宿主升级时只需改这一个文件。工具命名空间为 `teamsx_*`、状态目录为 `.teams-x`，可与原版 agent-teams 插件共存对比。

## 安装（本地路径）

```sh
dsh plugin --profile web add /home/xiaoxin/dsh-teams-x
```

profile 支持 `patchReload: live`，改完源码执行 `pnpm build` 后重启宿主即可生效。真实实例验证（工具注册、成员生成、调度、面板轮询）由使用者执行。

## 从源码构建

```sh
pnpm install   # devDependencies 以 link: 直连 deepseek-harness checkout
pnpm typecheck
pnpm build
pnpm verify:icons   # 校验 assets/icons 与 icon-data.ts 同步
```

## 工具集（13 个 `teamsx_*` 工具）

| 工具 | 说明 |
| --- | --- |
| `teamsx_create` | 创建团队；`approval="required"` 走两阶段 staged 计划流 |
| `teamsx_add_member` / `teamsx_remove_member` | 成员增删；staged 时仅登记计划行 |
| `teamsx_edit_plan` / `teamsx_approve` | 原子批量修订 staged 计划 / 显式批准运行 |
| `teamsx_create_task` | 创建任务（DAG 依赖 + 质量门契约） |
| `teamsx_claim_task` / `teamsx_update_task` | 认领（attempt_id 能力）与状态推进 |
| `teamsx_reassign_task` | 原子重派/重试/队长接管（旧 attempt 先失效再中断） |
| `teamsx_send_message` / `teamsx_status` | 持久信箱消息 / 团队快照轮询 |
| `teamsx_resume` / `teamsx_delete` | 恢复停止的团队 / 归档并退出 |

## 相对参考实现（agent-teams v0.1.15）的工程改进

**稳定性修复**
- 写入范围重叠检查死代码、`withTeamLock` Promise 链泄漏、依赖输出截断方向、分派前 halted 复查、persona 用户数据围栏（`<<< >>>`）、退役成员守卫正确恢复。

**性能优化**
- `captain→team` 反向索引（`index.json`）：查找 O(n) 目录扫描 → O(1)；索引缺失/损坏自动全扫重建（自愈）。
- `kickMember` 分派单次读取模式；调度器预构建 `byId` Map（O(T²)→O(T)）；依赖输出 O(D) 累计截断；快照邮箱并行读取；退役集合缓存。

**架构**
- 全 SVG 图标体系：`src/client/icon-data.ts` 单一数据源 → 内联 React 组件（currentColor 主题化 + 动作态 CSS 动画）与 `assets/icons/*.svg` 独立资产双形态，零 PNG。
- 质量门（v0.1）：requirements/implementation/verification/review/repair/integration 契约校验、完成规则（verdict=pass 才可完成、verify 失败必须 fail、inScope 路径审计、默认排除密钥文件）。

## 版本策略

`dsh-compat-shim` 让旧插件跑在新宿主上；`src/compat.ts` 是同一哲学的反向面——让本插件跨宿主版本运行：能力探测优先于版本判断（`sendMessage` vs `followup`、`ownEvents()` vs `events.slice`、可选 `drainContinuableChildren`、web/workspace 服务 key 别名）。已验证的宿主漂移点及对应分支全部集中在 compat.ts。

## Roadmap

- v0.2：Web 计划编辑器（StagingPlanEditor 对应面）、profiles 团队模板、自动修复/复审循环、会话内团队卡片与成员会话跳转。

# dsh-teams-x

<p align="center">
  <img src="./assets/icons/teams-x-logo.svg" width="48" alt="TeamsX logo">
</p>

**TeamsX for DeepSeek Harness** — turn one session into a coordinated multi-agent team: a captain spawns durable member subagents, breaks a goal into a dependency-aware task DAG, and coordinates through direct mailbox messages, with a live all-SVG activity panel.

> 本插件原生面向 **DeepSeek Harness 0.1.5-rc.2**，宿主 API 漂移点全部收敛在 `src/compat.ts` 能力探测层——宿主升级时通常只需改这一个文件。工具命名空间为 `teamsx_*`、状态目录为 `.teams-x`，与宿主内其他团队模式互不干扰。

## 核心能力（v0.3 – v0.6）

- **影子接管**：队长接管成员任务不再锁死贡献者——成员保留提交权与续接能力，队长回合结束自动归还
- **事件驱动调度 + 对账兜底**：成员 idle/running 边沿自动派工；队长会话意外消亡时，搁浅任务由后台对账器回收
- **质量契约与修复回路**：六种任务 kind 强制契约（objective/acceptance/inScope/verify），review 需裁决、禁止自审；失败自动派生修复任务（上限 3 轮、同源去重、源任务通过后级联取消）
- **停滞检测**：成员会话消失 → 孤儿尝试自动回收；停车超 30 分钟 / 运行超 60 分钟无进度 → 邮箱提醒队长（每次尝试至多一次）
- **任务产物工件化**：超 8000 字输出自动落盘 `artifacts/`，team.json 只留预览 + 引用
- **进度上报**：`teamsx_update_task({ progress })` 长任务心跳，面板 💬 徽标可见
- **契约修订流**：队长可在任务运行中修订 objective/inScope/acceptance 等契约，旧契约入历史（上限 5 轮）
- **成本观测**：面板显示每成员/每任务累计 token（经 token-meter 投影，尽力而为）
- **operations.jsonl 时间线**：每次状态迁移落一行结构化日志，面板内直接查看
- **内置团队模板**：`profile=research-review / implement-verify / full-cycle` 开箱即用，用户同名配置覆盖
- **并发安全**：per-team 锁 + 成员级串行队列 + 默认跨进程文件锁（`DSH_TEAMSX_FILE_LOCK=0` 关闭）

## 安装

### 方式 A：仓库 tgz 一条命令（推荐，最快）

仓库根目录自带与源码同步构建的 `dsh-teams-x-<version>.tgz`（零运行时依赖，宿主包全部走 peerDependencies）：

```sh
dsh plugin --profile web add <仓库路径>/dsh-teams-x-<版本>.tgz
```

装完 **重启宿主**（`dsh plugin add` 不会热加载新 bundle），然后按下文「安装验证」确认。

### 方式 B：npm

```sh
npm i dsh-teams-x && dsh plugin --profile web add <node_modules 路径>/dsh-teams-x
```

### 方式 C：从源码构建

前置要求：Node ≥ 24、pnpm ≥ 12，且**同一台机器上有一份 deepseek-harness 源码 checkout**（构建期 `link:` 依赖直连它，运行期不需要）。

```sh
# 1) 布局二选一：
#    嵌套式：把本仓库 clone 到 <任意目录>/dsh-teams-x，再在其中放 harness：
git clone https://github.com/Mlte0907/dsh-teams-x.git && cd dsh-teams-x
ln -s <harness-checkout 绝对路径> deepseek-harness   # 兄弟目录时用内嵌 symlink 对齐 link:./deepseek-harness

# 2) 安装 + 类型检查 + 构建
pnpm install
pnpm typecheck
pnpm build          # 产物在 lib/

# 3) 安装进 profile（用仓库目录或 pnpm pack 产物均可）
dsh plugin --profile web add "$(pwd)"
```

> 常见报错：typecheck 报 `Cannot find module '@deepseek-ai/dsh-client-ui-sidebar-right'`——它是 peerDependency，宿主侧由 profiles 级 node_modules 供给。临时把它链入本仓库 `node_modules/@deepseek-ai/` 即可（指到 `<harness 机器> ~/.dsh/profiles/node_modules/@deepseek-ai/dsh-client-ui-sidebar-right`）。

### 安装验证（三步）

1. 重启宿主后查日志，确认 loader 成功应用本插件、无 `failed to apply loader entry teams-x`：

   ```sh
   journalctl -u dsh-web --since '5 minutes ago' | grep -iE 'teams-x|failed'
   ```

2. 打开 Web UI，侧边栏应出现 **TeamsX 活动面板**（全 SVG 渲染）。
3. 新会话中让 agent 调 `teamsx_create` 建一个测试团队（如 `{"name":"smoke-test","members":[{"name":"a1"}]}`），确认工具返回团队快照。

> `pnpm build` 后重启宿主即可生效（profile 为 `patchReload: live`）。真实实例验证（工具注册、成员生成、调度、面板轮询）由使用者执行。

## v0.2.1 变更

- **兼容 DeepSeek Harness 0.1.5-rc.2**：宿主移除了插件侧 `ctx.subagents.registerContinuableSetup` 钩子，成员模型选择桥改为监听 `agent/session-start` 事件（fresh `startup` 与冷恢复 `resume` 双路径），修复 `failed to apply loader entry teams-x` 启动崩溃。

## v0.2 新特性

| 特性 | 说明 |
| --- | --- |
| 团队模板（profiles） | 配置 `profiles` 后在 `teamsx_create` 描述里写 `profile=模板名`，按预定义成员 + 种子任务 DAG 一键建队 |
| Web 计划编辑器 | staged 计划面板内直接改：成员行（角色/模型）与任务行（主题/指派/依赖）行内编辑，一次批量原子保存；未知操作白名单拦截 |
| 自动修复循环 | review/requirements 任务 `failed + needs_revision + findings` 时自动派生 repair 任务（round 上限默认 3，`autoDerive` 可关） |
| 会话内团队卡片 | `teamsx/*` 事件折叠为消息流内卡片：成员状态可点开 transcript、任务摘要实时更新——零宿主改动，宿主缺能力自动降级 |
| `/teamsx` 命令 | 输入框斜杠命令一键呼出团队面板 |

全套由功能套件守护：**173 用例**（`pnpm verify` 内含 `scripts/full-functional-test.mjs`）。

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

## 工程亮点

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

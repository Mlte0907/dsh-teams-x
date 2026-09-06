# TeamsX 插件验收文档

**版本**: v0.1.0  
**宿主**: DeepSeek Harness 0.1.3-alpha.1（源码 checkout）  
**验收日期**: 2026-09-06  
**验收环境**: DSH 桌面端 + 桌面浏览器（1280px）+ 远程移动端（430px）

---

## 一、自动化验收（已全部通过）

```sh
cd /home/xiaoxin/dsh-teams-x
pnpm verify          # typecheck + build + smoke:client + verify:flow + verify:icons
pnpm smoke:client    # DOM 渲染级烟雾测试
pnpm verify:flow     # 状态层全流程（真实数据 + 沙盒 + 不变量）
```

| 检查项 | 结果 |
|--------|------|
| TypeScript 类型检查（host + client 双面） | ✅ 0 errors |
| 客户端 bundle 构建（tsdown + lightningcss） | ✅ 131ms |
| 客户端烟雾测试（空态渲染不挂载） | ✅ PASS |
| 状态层流程验证（13 项：真实数据归档跳过 + 沙盒：create→claim→persist→mailbox→invariant scan→hand-edit recovery） | ✅ ALL CHECKS PASSED |
| 图标资产同步（17 SVG ↔ icon-data.ts） | ✅ in sync |
| npm pack 预检（66 文件，506 kB） | ✅ |
| 安全扫描（Mimosa deep scan） | ✅ 0 findings |

---

## 二、手动验收清单

> 每项标注 ☐（待验）/ ☑（已验），对应验证路径和预期结果。

### 2.1 安装与启动

| # | 步骤 | 预期 | ☐/☑ |
|---|------|------|------|
| 1 | `dsh plugin --profile web add /home/xiaoxin/dsh-teams-x` | 安装成功，无 peer dep 冲突 | ☐ |
| 2 | 重启后端 (`pkill -f "bin.js web"`) | restarter 自动拉起新进程，`dsh web:` 行出现 | ☐ |
| 3 | 浏览器打开 `http://127.0.0.1:3080/?token=...` | 页面加载，无 JS 控制台报错 | ☐ |
| 4 | 打开任意会话 → 标题栏检查 | 若会话有 TeamsX 队伍 → 蓝色徽标可见；若无 → 标题栏无 TeamsX 元素 | ☐ |

### 2.2 工具链路（5 步冒烟）

在会话中发送：`用 TeamsX 创建团队 verify-x，approval=automatic，添加一名成员 worker，创建一个任务，完成后删除团队`

| # | 工具 | 预期 | ☐/☑ |
|---|------|------|------|
| 1 | `teamsx_create` | `phase: running`，磁盘出现 `/.teams-x/verify-x/team.json` | ☐ |
| 2 | `teamsx_add_member` | 成员 `worker` 加入，`status: idle`，子代理 id 非空 | ☐ |
| 3 | `teamsx_create_task` | 任务创建，`status: pending`，assigned to worker | ☐ |
| 4 | `teamsx_status` | 返回成员/任务列表，成员 activity 显示 | ☐ |
| 5 | `teamsx_delete` | 团队移入 `archive/`，子代理中断 | ☐ |

### 2.3 Staged 计划审批流

发送：`用 TeamsX 创建团队 approve-x，approval=required，添加一名成员 engineer，创建一项评审任务`

| # | 步骤 | 预期 | ☐/☑ |
|---|------|------|------|
| 1 | `teamsx_create` | `phase: staged`，不 spawn 成员 | ☐ |
| 2 | `teamsx_add_member` | 面板 roster 显示 engineer（`id: ''`，未 spawn） | ☐ |
| 3 | `teamsx_create_task` | DAG 显示任务（可带依赖关系） | ☐ |
| 4 | `ask_user_question` | 对话流弹出三选项卡片（批准/回聊天/放弃） | ☐ |
| 5 | 选择"批准并运行" → `teamsx_approve` | phase → running，reviewer spawn，审批条消失 | ☐ |

### 2.4 面板交互

| # | 步骤 | 预期 | ☐/☑ |
|---|------|------|------|
| 1 | 点击标题栏 TeamsX 徽标 | 面板从徽标下方弹出（右对齐） | ☐ |
| 2 | 按 Esc | 面板关闭 | ☐ |
| 3 | 点击面板外任意区域 | 面板关闭 | ☐ |
| 4 | 点击"历史"标签 | 切换到归档视图，只读（无停止按钮） | ☐ |
| 5 | 成员名有子代理时可点击 | 跳转到成员会话视图 | ☐ |
| 6 | 成员工作时显示 ⏸ 按钮 | 点击 → `POST /member/pause` → 成员 idle，任务保持挂起 | ☐ |
| 7 | 进度条渲染 | `0/1` 显示细条，100% 时绿色 | ☐ |
| 8 | 加载失败时重试按钮 | 点击重试 → 重新 fetch | ☐ |

### 2.5 移动端（430px 视口）

| # | 步骤 | 预期 | ☐/☑ |
|---|------|------|------|
| 1 | 缩小浏览器到 430px 宽 | 标题栏分行：标题满行、控制项换行、Session 日志隐藏 | ☐ |
| 2 | 点击 TeamsX 徽标 | 底部抽屉（全宽、贴底、圆角、上滑动画） | ☐ |
| 3 | 底部抽屉内面板 | 成员行简化（隐藏 model 列，进度堆叠），任务行隐藏 assignee | ☐ |

### 2.6 DAG 可视化

| # | 步骤 | 预期 | ☐/☑ |
|---|------|------|------|
| 1 | 创建有依赖的任务（`t2 depends t1`） | DAG 显示 t2 左侧有蓝色 depth lane（depth=1） | ☐ |
| 2 | `t4 depends t2,t3` | t4 左侧有绿色 lane（depth=2） | ☐ |
| 3 | 任务标签 | 每个任务 subject 后显示 `← t1` 依赖标签 | ☐ |
| 4 | 状态色块 | completed 绿色，failed 红色，running 蓝色，blocked 橙色 | ☐ |

### 2.7 主题与视觉

| # | 步骤 | 预期 | ☐/☑ |
|---|------|------|------|
| 1 | 暗色主题下查看面板 | 所有颜色使用 `--dsw-alias-*` 令牌，与宿主界面融合 | ☐ |
| 2 | 切换到浅色主题 | 面板颜色自动跟随（无硬编码） | ☐ |
| 3 | 任务行 depth lane 动画 | 首次渲染时从左滑入（300ms） | ☐ |
| 4 | working 成员脉动动画 | 图标脉动（scale 0.92↔1） | ☐ |

### 2.8 边界场景

| # | 步骤 | 预期 | ☐/☑ |
|---|------|------|------|
| 1 | 无 TeamsX 的会话 | 标题栏无 TeamsX 徽标，无面板 | ☐ |
| 2 | 已归档队伍的会话 | 徽标仍可见（hasArchived），面板可浏览历史 | ☐ |
| 3 | autonomous 预设选中的会话 | 无 `duplicate loader entry` 报错 | ☐ |
| 4 | 同一会话尝试创建第二个团队 | 工具报错"已领导 X 队伍，结束前勿新建" | ☐ |
| 5 | 移动端面板被 better-sidebar 遮挡时 | 徽标自动左移避让（elementFromPoint 探测） | ☐ |
| 6 | `/plugins/dsh-teams-x/state` 无认证请求 | HTTP 401（认证网关拦截） | ☐ |
| 7 | `/plugins/dsh-teams-x/member/pause` 缺字段 | HTTP 400 + 错误信息 | ☐ |

### 2.9 多 Agent 场景

| # | 步骤 | 预期 | ☐/☑ |
|---|------|------|------|
| 1 | 创建多成员团队（3+ 成员） | 调度器依次 spawn 每个成员，成员可并行工作 | ☐ |
| 2 | 成员 A 正在工作时暂停 | A → idle，A 的尝试保持挂起，成员 B 继续 | ☐ |
| 3 | 成员 B 完成任务 → 队长收到汇报 | `teamsx_message_sent` 事件，captainInbox 更新 | ☐ |
| 4 | 队长通过 `teamsx_send_message` 发送指导 | 成员 B 在下一个回合收到消息 | ☐ |

---

## 三、自动化回归命令

```sh
# 一键全量回归（含类型检查、构建、烟雾测试、状态流验证、图标校验）
cd /home/xiaoxin/dsh-teams-x && pnpm verify

# 单独运行各模块
pnpm typecheck        # 类型检查
pnpm build            # 构建 + bundle
pnpm smoke:client     # 客户端 DOM 烟雾
pnpm verify:flow      # 状态层 E2E（真实数据 + 沙盒 + 不变量）
pnpm verify:icons     # 图标资产同步
pnpm verify:web-routes # Web 路由校验
```

---

## 四、已知限制

| 限制 | 说明 | 计划 |
|------|------|------|
| B2 会话内卡片未渲染 | ConversationViewDefinition 需 harness 视图层深度集成 | v0.2 |
| 浅色主题仅结构验证 | 令牌跟随机制已就位，未截图验证 | 后续用 omen-alpha 验证 |
| 成员会话跳转 | 点击成员名后自动打开子代理 transcript ✅，但异常路径（子代理不可续接）未端到端测试 | v0.2 加载错误处理 |

---

*文档生成时间：2026-09-06*

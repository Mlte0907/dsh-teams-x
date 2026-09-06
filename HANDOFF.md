# TeamsX(dsh-teams-x)交接文档

> 交接日期:2026-09-07 · 适用版本:v0.1.0(tag / npm / Release 已发布)
> 读完本文你应当能够:构建、测试、发布 TeamsX,并理解本轮修复的三个缺陷与 CI 的特殊设计。

---

## 1. 项目速览

- **是什么**:DeepSeek Harness(0.1.3-alpha.1 源码 checkout)的多代理团队插件——captain spawn 可续接的成员子代理、依赖感知任务 DAG、持久信箱、全 SVG 活动面板。13 个 `teamsx_*` 工具。
- **仓库**:https://github.com/Mlte0907/dsh-teams-x(PUBLIC)· npm:`dsh-teams-x@0.1.0`
- **目标宿主**:本地 harness checkout(alpha.1 + 本地补丁栈,见 §6)。**不是**上游 deepseek-ai/deepseek-harness@master——两者存在 API 漂移(见 §5.3)。

## 2. 开发环境

```
/home/xiaoxin/dsh-teams-x/          ← 本插件(git 仓库)
/home/xiaoxin/deepseek-harness/     ← 宿主源码 checkout(alpha.1 + 本地补丁)
dsh-teams-x/deepseek-harness        ← 符号链接 → ../deepseek-harness(被 gitignore)
```

- devDependencies 全部是 `link:./deepseek-harness/...` **相对链接**——本地通过上面的 symlink 解析,CI 通过 checkout harness 到同名子目录解析(见 `.github/workflows/verify.yml`)。**移动仓库位置或改布局时必须保持这个相对关系**。
- 构建(pnpm 11.5.0,node 22):

```sh
pnpm install        # link 目标必须存在(symlink 或 CI 的 checkout)
pnpm verify         # typecheck + build + client smoke + flow + 143 用例 + icons
```

- 构建两段式:`tsc -p tsconfig.json`(host 面,产 `lib/*.js` + `lib/types/*.d.ts`)→ `tsc -p tsconfig.client.json`(产 `lib/client/*.js`)→ `tsdown`(把 client 打成 CJS closure 工厂 `lib/client.js`)。`lib/` 不进 git。

## 3. 本轮修复的三个缺陷(commit `982718f`,均先由测试套件暴露)

### BUG-01(高)— 同名团队二次归档崩溃
- **现象**:`teamsx_create("x")` → `teamsx_delete`(归档到 `archive/x`)→ 重建 `"x"` → 再 `teamsx_delete` → `ENOTEMPTY: directory not empty, rename ... archive/x` 崩溃;团队卡在活跃区,索引仍指向它,只能手工清磁盘。
- **根因**:`state.ts archiveTeamDir` 直接 `rename` 到 `archive/<id>`;目标已存在且非空时 rename 报 ENOTEMPTY,`renameWithRetry` 重试 3 次后原样抛出。
- **修复**:`archiveTeamDir` 在 rename 前先 `rm(destination, {recursive, force})`(归档覆盖语义)。回归探针:套件 `BUG-01` 用例。

### F-01(低)— 索引命中路径不检测"一属多队"歧义
- **现象**:同一 sessionId 被手动编辑进两个活跃团队时,索引命中路径直接返回最后登记的团队(静默错选);只有索引缺失的扫描路径才报 `belongs to multiple active teams`。
- **修复**:`findTeamByParticipant` 索引命中并确认参与后,追加一次 `listTeamsForParticipant` 权威校验,>1 团队即抛歧义错误。代价是命中路径多一次扫描(20 团队 ≈14ms,预算内),换来与扫描路径一致的语义。回归:`B9`(索引命中)+ `B9b`(删索引强制扫描)双断言。

### F-02(低)— 反向索引残留 removed 成员
- **现象**:`indexTeam` 对索引做 merge,removed 成员的 `members[<sid>]` 条目残留到团队归档才清除;同 sessionId 被宿主复用时可能错误命中旧团队。
- **修复**:`indexTeam` 改为"先删除本团队全部旧条目,再写入当前身份集合"的差量重建;`reindexTeam` 复用之。

### 附带加固
- `src/members.ts` 三处 `readTeam/readTeamSync` 返回值显式判空窄化(上游类型下 `x?.field !== y` 不产生窄化,会报 TS18048)。
- 发布门禁与安装检查(见 §5.4)。

## 4. 测试体系

- **`scripts/full-functional-test.mjs`** — 143 用例,分 A 团队管理 / B 权限 / C 数据同步 / D 消息推送 / E 事件 / F 异常与质量门 / G staged+兼容层 / H 性能 / I 安全 / K 视图隔离;直接 import `lib/*.js` + mock ctx(无需真宿主)。**已接入 `pnpm verify`**(CI 同款)。
  - 扩展方式:仿照现有 `check(id, name, cond, detail)` / `expectError(id, name, fn, substring)` 模式;性能用 `runTimed(id, name, budgetMs, fn)`。
- **`scripts/verify-flow.mjs`** — 既有状态层流程验证(真实 `~/.teams-x` 数据 + 沙盒),保留。
- **`apps/web/tests/model-switch-route.e2e.ts`(在 harness 仓库,commit c9487aa0a0)** — 无浏览器驱动 sessionController,钉"同会话切换模型后下一请求路由"契约。

**mock 契约要点**(写新用例必读):
- `subagents.startContinuable` 必须**每次返回唯一 childId**(重复 id 会触发 isTeamState 的 id 冲突拒绝);
- 所有工具调用必须 `await`(漏了会竞态 + unhandledRejection);
- 想让调度器 `kickTeam` 不重派某成员:把该成员 agent 放进 `ctx.agents` 且 `status: 'working'`;
- 工具 schema `additionalProperties: false` 严格——`teamsx_edit_plan` 的操作项必须 snake_case(`task_id`/`member_name`);
- 结构校验禁止非 staged 团队成员 `id === ''`:模拟成员离线用"投递失败"(让 `sendMessage` 抛错),不能清空 id。

## 5. 发布工程

### 5.1 渠道状态
| 渠道 | 状态 |
| --- | --- |
| GitHub | https://github.com/Mlte0907/dsh-teams-x(PUBLIC) |
| Release | [v0.1.0](https://github.com/Mlte0907/dsh-teams-x/releases/tag/v0.1.0)(含 `dsh-teams-x-0.1.0.tgz` 附件) |
| npm | [dsh-teams-x@0.1.0](https://www.npmjs.com/package/dsh-teams-x)(latest) |
| CI | GitHub Actions `verify.yml`(runtime face 全绿) |

### 5.2 CI(`.github/workflows/verify.yml`)的特殊设计
CI checkout **上游** deepseek-ai/deepseek-harness@master 构建 host libs,然后跑 **runtime face**:插件 bundle 构建 + client smoke + state flow + 143 用例 + icons。**strict typecheck 在 CI 是 `continue-on-error` 的 informational 步骤**——因为上游 master 缺少本地补丁 API(`subagents.registerContinuableSetup`),完整严格版要本地补丁栈(本地 `pnpm verify` 把守)。若未来把补丁推成上游 PR 或建私有镜像,可把 typecheck 转正。

踩坑记录(改 CI 前先读):
1. harness 默认分支是 **master** 不是 main;
2. `vendor/cordis` 不在 `build:lib:host` 清单且 `lib/` 不进 git——CI 需单独 `pnpm install && pnpm exec tsc -b tsconfig.json`(其 devDeps 用 `workspace:` 协议,npm 不支持);
3. **pnpm 11.7 对 `link:` 依赖不创建 node_modules 链接**(11.5.0 正常)——`pnpm/action-setup` 已 pin 11.5.0;
4. GitHub 推送偶发慢速失败,换 `https://gh-proxy.org/` 前缀重试。

### 5.3 发布防护
- **`prepublishOnly`** = `pnpm build` + client smoke + `scripts/prepublish-guard.mjs`:断言 `lib/index.js`/`lib/client.js`/`lib/types/index.d.ts`/icons 存在,并全量扫描 `lib/` 内 `agent-teams` 残留文本,失败即拒发布。
- **`postinstall`** = `scripts/postinstall-check.mjs` 软提示:tarball 自带预构建 lib;源码 clone 安装而未构建时给出指引(**刻意不硬失败**,避免污染使用者的 install)。
- 改 lib 或脚本后发新版流程:`pnpm verify` → bump version → `npm publish`(prepublishOnly 自动把门)→ tag + `gh release create vX.Y.Z -R Mlte0907/dsh-teams-x --notes-file …`。

### 5.4 注意
- `origin` 指向 gh-proxy 前缀,`gh release/pr` 命令需 `-R Mlte0907/dsh-teams-x` 显式指定仓库;
- npm 凭据(可 bypass 2FA 的 granular token)在 `~/.npmrc`,泄露时去 npmjs.com 撤销重建。

## 6. 排障速查

| 症状 | 先看哪里 |
| --- | --- |
| 会话中模型请求失败 | `~/.dsh/sessions/<cwd 编码>/<session>/session.v2.jsonl.zstd`(zstdcat)——`request/header.config` 是**实际路由**,`model/selection` 只是记账;429 类错误看 `llm/retry` 事件 |
| 团队状态异常/工具报"未入队" | `~/.teams-x/<team>/team.json` + `stateRootDiagnostics`;授权类错误自带 "State root … contains:" 诊断 |
| 插件加载失败 | `~/.dsh/desktop/backend.log`(append 模式,先 `stat -c%s` 再 tail 增量);client bundle 缺失 = profile 的 lib 链接断 |
| 模型切换不生效(历史问题) | 已定位为 **dsh-pangu** 的 assemble 钩子不调 `next()`(pangu commit `3b1b4d9` 修复);详见 `/home/xiaoxin/dsh-model-switch-issue-draft.md` 与 Discussions [#5817](https://github.com/deepseek-ai/deepseek-harness/discussions/5817) |

## 7. 关键文件索引

| 文件 | 职责 |
| --- | --- |
| `src/state.ts` | 持久化 + 纯逻辑:索引(自愈)、锁、原子写、信箱、attempt 生命周期、coerce 容错 |
| `src/tools.ts` | 13 个 `teamsx_*` 工具(权限在锁内重验;attempt_id 能力令牌;信箱租约) |
| `src/members.ts` | spawn/投递/退役守卫/成员选择桥(registerContinuableSetup 依赖本地补丁 API) |
| `src/scheduler.ts` | kickTeam/kickMember 分派、parkedAttempts 冷恢复 |
| `src/quality.ts` | 任务契约与完成门(纯函数) |
| `src/compat.ts` | 宿主漂移点能力探测 |
| `src/web-routes.ts` | Web 路由认证门(401/403/503) |
| `src/client/` | 活动面板(SVG 图标体系 + CSS Modules) |
| `scripts/full-functional-test.mjs` | 143 用例回归套件 |
| `patches/harness-0001-registerContinuableSetup.patch` | 本地补丁导出(历史尝试;CI 目前用 runtime-face 分层绕开) |

## 8. 待办 / 已知边界

- CI 的 strict typecheck 为 informational(上游 master 缺 `registerContinuableSetup`;本地补丁 commit `3edc427710` 已导出为 `patches/` 内 patch 文件备用);
- `patches/` 内补丁基于 alpha.1 栈,直接 apply 到演进后的上游 master 会冲突(`--3way` 也缺基线 blob)——若要转正需基于上游重做;
- v0.2 Roadmap(Web 计划编辑器、profiles 团队模板、自动修复/复审循环、会话内团队卡片)见 README。

---
*交接文档生成:2026-09-07 · 数据来源:本轮开发会话(测试报告 `/home/xiaoxin/teamsx-full-test-report-2026-09-06.md`、根因报告 `/home/xiaoxin/dsh-model-switch-issue-draft.md`)*

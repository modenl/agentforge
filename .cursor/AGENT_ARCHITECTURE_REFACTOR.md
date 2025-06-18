改造成单一大模型 llm 控制所有逻辑决策，app 由 fuzzy statemachine 驱动，没有标注
的部分由 llm 动态思考决定。每种状态下哪些数据需要展示用 adaptive card 返回，有哪
些可以执行的 action 也用 card 的 action 表示。所有状态管理，所有 statemachine，
都是对话的一部分，不要使用任何代码。这个架构下写一个新的 app，只需要改写 prompt
和对接新的 mcp。

---

# 1. 主状态（role / main_state）

- `child`（儿童界面，受限权限，仅能游戏、答题、查看基本信息）
- `parent`（家长界面，完全权限，可配置、查看、管理一切）
- `pending_action`（特殊流程，仅用于等待密码输入等过渡，不常驻）

---

# 2. 子状态（每个主状态下的业务状态/流程）

## **A. child 主状态下的子状态（child_state）**

| 子状态        | 说明                         |
| ------------- | ---------------------------- |
| idle          | 空闲主界面，展示时间/入口    |
| game_running  | 游戏已启动，计时中           |
| quiz          | 正在答题流程中               |
| viewing_stats | 查看自己的奖励/答题/时间记录 |

## **B. parent 主状态下的子状态（parent_state）**

| 子状态                | 说明                            |
| --------------------- | ------------------------------- |
| dashboard             | 管理主界面                      |
| editing_time_limit    | 编辑本周游戏时间上限            |
| editing_used_time     | 增减已用游戏时间                |
| editing_child_profile | 编辑 child 档案（年龄、年级等） |
| setting_problem_pref  | 题型偏好设定                    |
| viewing_full_stats    | 查看详细的时间、奖励、答题历史  |

## **C. pending_action 仅做临时流程，无子状态**

- waiting_for_parent_pw（等待家长密码输入）

---

# 3. **所有状态的迁移矩阵**

## **A. 主状态迁移（主状态/role）**

| 当前主状态     | event/输入            | 条件 | 新主状态       | 新子状态              | 说明                   |
| -------------- | --------------------- | ---- | -------------- | --------------------- | ---------------------- |
| child/idle     | 点击 parent 入口按钮  |      | pending_action | waiting_for_parent_pw | 请求家长密码输入       |
| pending_action | parent 密码输入       | 正确 | parent         | dashboard             | 提权为家长             |
| pending_action | parent 密码输入       | 错误 | child          | idle                  | 保持儿童界面，失败提示 |
| parent/任意    | 点击“退出 parent”按钮 |      | child          | idle                  | 回到儿童主界面         |

---

## **B. child 主状态下的子状态迁移**

| 当前子状态    | event/输入             | 条件       | 新子状态      | 动作/说明              |
| ------------- | ---------------------- | ---------- | ------------- | ---------------------- |
| idle          | 点击“我要玩游戏”按钮   | 剩余时间>0 | game_running  | 启动游戏，记录开始时间 |
| game_running  | 点击“结束游戏”按钮     |            | idle          | 关闭游戏，累计用时     |
| game_running  | MCP 报告游戏被关闭     |            | idle          | 统计用时，回主界面     |
| game_running  | 游戏配额用尽           |            | idle          | 强制关闭，提示用户     |
| idle          | 点击“我要答题”按钮     |            | quiz          | 进入答题流程           |
| quiz          | 答题提交               |            | quiz          | 记录答题正确/错误      |
| quiz          | 点击“结束练习”按钮     |            | idle          | 回到主界面             |
| idle          | 查看奖励/时间/答题记录 |            | viewing_stats | 展示统计               |
| viewing_stats | 返回                   |            | idle          | 回到主界面             |

---

## **C. parent 主状态下的子状态迁移**

| 当前子状态            | event/输入              | 新子状态              | 动作/说明                   |
| --------------------- | ----------------------- | --------------------- | --------------------------- |
| dashboard             | 点击“编辑游戏时间上限”  | editing_time_limit    | 展示 input                  |
| editing_time_limit    | 输入新上限并保存        | dashboard             | 更新 game_time_limit        |
| dashboard             | 点击“加/减已用游戏时间” | editing_used_time     | 展示 input                  |
| editing_used_time     | 输入调整值并保存        | dashboard             | 更新 used_game_time         |
| dashboard             | 点击“编辑儿童档案”      | editing_child_profile | 展示 profile 输入           |
| editing_child_profile | 修改并保存              | dashboard             | 更新 child_profile          |
| dashboard             | 点击“设置题型偏好”      | setting_problem_pref  | 展示选项                    |
| setting_problem_pref  | 修改并保存              | dashboard             | 更新 problem_set_preference |
| dashboard             | 点击“查看详细数据”      | viewing_full_stats    | 展示全量历史数据            |
| viewing_full_stats    | 返回                    | dashboard             | 回主界面                    |

---

# 4. **流程举例（含主从状态）**

**1. child idle -> parent dashboard：**

- \[child/idle] 点击 parent 按钮 → \[pending_action/waiting_for_parent_pw] 密码
  输入正确 → \[parent/dashboard]

**2. parent dashboard -> editing_time_limit -> dashboard：**

- \[parent/dashboard] 点击“编辑游戏时间上限” → \[parent/editing_time_limit] 输入
  /保存 → \[parent/dashboard]

**3. child game_running 提前结束：**

- \[child/game_running] 用户点击“结束游戏” → \[child/idle]（累计用时）

**4. quiz 流程任意返回 idle：**

- \[child/quiz] 点击“结束练习” → \[child/idle]

---

# 5. **可视化建议（便于工程实现或 LLM prompt）**

```yaml
role: child/parent/pending_action
# child下
child_state: idle/game_running/quiz/viewing_stats
# parent下
parent_state: dashboard/editing_time_limit/editing_used_time/editing_child_profile/setting_problem_pref/viewing_full_stats
# pending_action仅有waiting_for_parent_pw

# 状态迁移总是 role -> 对应的 from_state -> to_state
```

---

# 6. **注意事项**

- **主状态（role）决定 UI 和全部可用的业务分支，子状态控制同角色下具体流程**
- **role 和对应的子状态“互斥”，切换主状态时自动重置子状态**
- **pending_action 只做临时流程（如等待密码），完成后自动切换到 child 或
  parent**

2 种 Chat history 明确分工，每一轮对话只需要输入：

## 1. **双份 chat history 结构与用途**

### （A）**raw chat history**（原始对话历史/推理输入用）

- **内容最全**，包含：

  - 用户所有输入（含密码等敏感信息）
  - LLM 的所有自然语言输出
  - LLM 产生的`<<<systemoutput>>>`段（即所有结构化 UI/MCP 动作等 JSON 内容）
  - 可能的“系统事件”/MCP 通知

- **专用于**：

  - 作为**完整上下文**传入 LLM，便于推理、状态迁移、上下文恢复
  - 也可用于回溯和 debug

- **不可直接对外展示**

### （B）**visible chat history**（可见对话历史/UI 展示用）

- **仅包含用户与 LLM 的“自然语言”交互**

  - 用户敏感信息（如 password 输入）被**mask**（如“••••••”）
  - `<<<systemoutput>>>`及类似系统交互内容**不会出现在可见 chat 窗口**，而是被
    UI 专门渲染为按钮、表单等

- **专用于**：

  - 用户前端主 chat 窗口展示
  - 审计和家长/儿童浏览

- **可被用户回看、导出等**

---

## 2. **典型流程举例**

1. 用户进入 parent 入口 → raw 和 visible 都记一条"我要进入家长模式"
2. UI 弹出 mask password 输入框（来自 SYSTEMOUTPUT），visible 只显示“请输入家长
   密码”，raw 则包含真实输入内容（如"输入密码：123456"）
3. 用户输入 password

   - raw 记录原文："parent password: 123456"
   - visible 仅显示："parent password: ••••••"

4. LLM 收到 raw chat + states，推理权限变更
5. LLM 输出 SYSTEMOUTPUT，raw 记录，visible chat 不显示此 JSON，而是在 UI 以按钮
   等形式渲染
6. 用户在 parent 界面操作，所有 action 都同步记录在 raw，visible 只显示自然语言
   交流
7. 若 chat 被导出，visible 中敏感信息（如密码）始终为 mask

---

## 3. **系统处理要点**

- **任何输入类型为 password 的内容，在 raw 里完整保存，在 visible 里自动 mask，
  不可逆泄漏**
- **SYSTEMOUTPUT 等结构化指令只进 raw，不进 visible chat 文本，但对应 UI 元素会
  独立渲染**
- **LLM 推理总是拿 raw history（含所有必要结构化指令和上下文）作为输入**
- **用户侧看不到结构化命令（比如 adaptive card JSON、mcpActions 等），只见到最终
  的自然语言反馈和 UI 交互控件**
- **敏感操作（如 parent 提权、reset 配额等）raw 里有事件全程记录，visible chat
  只显示非敏感结果**

---

## 4. **安全与合规建议**

- **raw chat history 要受严格权限管理**，仅 LLM/后端服务可用，不能被普通用户直接
  访问或导出
- **visible chat history 可用于前端展示、用户回看或审计导出**
- **所有 mask 敏感内容的实现要彻底，防止意外显示或日志泄露**
- **导出/共享 chat 时，一律只能导出 visible 版本**

---

## 5. **数据结构建议（伪代码）**

```json
{
  "raw_chat_history": [
    {"role": "user", "text": "我要进入家长模式"},
    {"role": "system", "system_output": "{...}"},
    {"role": "user", "input_type": "password", "text": "parent password: 123456"},
    {"role": "assistant", "text": "密码正确，进入家长模式"},
    ...
  ],
  "visible_chat_history": [
    {"role": "user", "text": "我要进入家长模式"},
    {"role": "assistant", "text": "请输入家长密码"},
    {"role": "user", "input_type": "password", "text": "parent password: ••••••"},
    {"role": "assistant", "text": "密码正确，进入家长模式"},
    ...
  ]
}
```

---

## 6. **一句话总结**

> **raw chat 用于 AI 完整推理和事件追踪，visible chat 仅做对用户安全友好的展示，
> 所有敏感信息（如密码）都做 mask，所有系统 UI 指令单独渲染不进入主 chat 窗口。
> 这是 AI+多态 UI+儿童安全系统的最佳 chat 架构。**

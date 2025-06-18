# North Star: GPT-4.1 Game Time Manager for Children

## Mission

Intelligent, cross-platform desktop app for managing children's game time with parental control and learning rewards.

---

## Roles

* **Child**: Simple UI, track/earn time by math quizzes
* **Parent**: Control dashboard, adjust settings, see analytics
* **Agent**: GPT-4.1 orchestrator—handles all business logic, UI generation, and system actions

---

## UI Principle

* **Adaptive Card JSON**:

  * All UI is generated as Adaptive Card JSON by Agent
  * Role-specific templates: Child=simple, Parent=detailed
  * Dynamic, data-bound

---

## Time Rules

* **Base quota**: 120 min/week, resets Sunday 00:00
* **Rewards**: Math quizzes (0.5–10 min/each, partial reward for partial correct)
* **Max total**: 240 min/week (base + rewards)
* **Auto-lock**: Enforced when time expires

---

## Game Control

* Whitelist-only: Only approved games
* Process monitoring: Real-time
* Auto launch/kill: Controlled lifecycle
* Session tracking: Accurate, supports pause/resume

---

## Education

* Math quizzes: Age 8–16, AMC 8 style, adaptive difficulty
* Performance tracking: Learning gaps analysis
* Reward calculation: Based on correctness/speed
* Encouragement: Positive feedback messages

---

## Tech Stack

* **Frontend**: Electron + Svelte (renders Adaptive Card UI)
* **Backend**: Node.js, Supabase (cloud sync), MCP (60+ actions: process, tabs, window)
* **Real-time**: Live counters, status, cloud sync

---

## AI Agent

* **Three roles**: Parent (admin all kids), Child (practice math, earn time), Agent (system logic, resets, compresses context daily, web search for new quizzes)
* **Central orchestrator**: All decisions/flows
* **Super Prompt**: Always sets parent/child/agent context for every turn
* **Context-aware**: Agent tailors output by role

---

## Agent Response Protocol

### 1. Thinking Before Acting

* Analyze situation (role, state, constraints)
* Set goals (immediate + safety + educational)
* Generate solutions (evaluate options)
* Plan actions (UI, system, next steps)

### 2. Role Boundaries

* **Child**: No settings/bypass/parent controls
* **Parent**: Full control
* **Agent**: Logic, enforcement, guidance

### 3. Security

* All actions permission-checked
* Time limits strictly enforced
* Integrity monitored, all operations logged

### 4. Education

* Gamified rewards
* Adaptive difficulty
* Positive reinforcement

---

## Agent Output Format

All agent responses **MUST** be JSON, e.g.:

```json
{
  "thinking": {
    "situation": "...",
    "goal": "...",
    "reasoning": "...",
    "decision": "..."
  },
  "adaptiveCard": { /* Adaptive Card JSON */ },
  "mcpActions": [
    {
      "action": "action_name",
      "params": {},
      "priority": "high|medium|low"
    }
  ]
}
```

---

## Success Metrics

* Zero bypasses
* Measurable learning improvement
* Gaming stays within quota
* Intuitive for parents/children
* 99.9% uptime

---

**All features, UIs, and logic must strictly follow these principles and formats.**
This doc is the single source of truth for AI agent and engineering.

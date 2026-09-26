# Claude Code — project context



<!-- cloude-code-toolbox:mcp-skills-awareness-begin -->

### MCP & Skills awareness (Cloude Code ToolBox)

_Last synced: 2026-09-25T19:22:55.850Z._

- **Full report:** `.claude/cloude-code-toolbox-mcp-skills-awareness.md` in this workspace (auto-overwritten on each scan). Use it as ground truth for configured servers and skill folders.
- **MCP:** For **live tools** in Claude Code, enable the matching server via `/mcp`. Servers are configured in `~/.claude.json` (user) and `.mcp.json` (project).
- **When the user’s task matches a server** (e.g. Confluence work and a **Confluence** / **Atlassian** MCP is listed), **prefer that server id** and plan on tool use—not only file search.
- **Skills:** Folders below contain `SKILL.md`; attach or cite paths in chat when relevant.

#### Workspace MCP

- `c:\Users\isaac.kayembe\Documents\fusion_create\G-ImmoB\.mcp.json` _(workspace: G-ImmoB)_ — _file missing_

_No active workspace servers in mcp.json._

#### User MCP

- `C:\Users\isaac.kayembe\.claude.json` — _no servers defined_

_No active user-scoped servers in mcp.json._

#### Project skills

_None found (or no workspace open)._

#### User skills

- **agent-browser** — `C:\Users\isaac.kayembe\.agents\skills\agent-browser` — Browser automation CLI for AI agents. Use when the user needs to interact with websites, including navigating pages, filling forms, clicking buttons, taking screenshots, extracting data, testing web apps, or automating a

- **cross-review** — `C:\Users\isaac.kayembe\.agents\skills\cross-review` — Cross review code using a subagent with a specified model. Use when the user asks to review code changes AND specifies a model to use (e.g., 'review with opus', 'use sonnet to review', 'review changes with gemini'). The 

- **frontend-design** — `C:\Users\isaac.kayembe\.agents\skills\frontend-design` — Design distinctive, production-grade frontend interfaces — mockups as HTML pages or working application pages. Use when the user asks to design a web page, landing page, UI mockup, dashboard, application page, or any vis

- **init** — `C:\Users\isaac.kayembe\.agents\skills\init` — Use when the user asks to initialize a repo, create AGENTS.md, generate contributor guidelines, or set up agent-oriented documentation for a codebase.

- **plan** — `C:\Users\isaac.kayembe\.agents\skills\plan` — Planning agent for task breakdown and implementation planning. Use via spawn_subagent with skill='plan' when you need to explore a codebase and design an implementation approach before writing code.

- **research** — `C:\Users\isaac.kayembe\.agents\skills\research` — Fast agent specialized for exploring codebases and searching for code patterns. Use via spawn_subagent with skill='research' for read-only exploration tasks.

- **skill-creator** — `C:\Users\isaac.kayembe\.agents\skills\skill-creator` — Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill pe

- **zen-comprehensive-review** — `C:\Users\isaac.kayembe\.agents\skills\zen-comprehensive-review` — Orchestrate a multi-model code review: spawn 3 review subagents, merge findings. In PR mode, posts GitHub PR comments. In local mode, outputs findings directly. CRITICAL: this skill is costly, don't use it unless user ex

- **zen-review** — `C:\Users\isaac.kayembe\.agents\skills\zen-review` — Expert code reviewer. Analyze PR changes for correctness, security, performance, and quality. Returns findings as JSON. CRITICAL: this skill is costly, don't use it unless user explicitly requested to use it.

<!-- cloude-code-toolbox:mcp-skills-awareness-end -->

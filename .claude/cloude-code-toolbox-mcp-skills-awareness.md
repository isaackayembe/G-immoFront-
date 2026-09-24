# Cloude Code ToolBox — MCP & Skills awareness

_Generated: 2026-09-24T19:02:06.553Z_

## How to use this report

- **Saved copy:** This file is **`.claude/cloude-code-toolbox-mcp-skills-awareness.md`** — refreshed whenever the toolbox runs an MCP & Skills scan (including on workspace open when auto-scan is enabled). It is meant for **Claude Code workspace context** together with `CLAUDE.md` (which gets a shorter replaceable summary when auto-merge is on).
- **MCP:** Lists **configured** servers from Claude Code config (`~/.claude.json` for user scope, `.mcp.json` for project scope). Use `/mcp` in the Claude Code panel to connect servers for your session.
- **Skills:** **On-disk** folders with `SKILL.md`. Claude Code does not auto-load them; attach `SKILL.md` or paths in chat when useful.
- **Task routing:** When the user’s request matches a server’s purpose (e.g. Confluence → Confluence/Atlassian MCP), prefer that **server id** from the tables below.

---

## MCP — workspace

Workspace `mcp.json` _(folder: G-ImmoB)_

- **c:\Users\isaac.kayembe\Documents\fusion_create\G-ImmoB\.mcp.json** — _File missing_

_No active workspace servers in mcp.json._

## MCP — user profile

- **C:\Users\isaac.kayembe\.claude.json** — _File exists — no servers defined_

_No active user-scoped servers in mcp.json._

## Skills (local `SKILL.md` folders)

### Project-scoped

_None found (or no workspace open)._

### User-scoped

- **agent-browser** — `C:\Users\isaac.kayembe\.agents\skills\agent-browser`
  - Browser automation CLI for AI agents. Use when the user needs to interact with websites, including navigating pages, filling forms, clicking buttons, taking screenshots, extracting data, testing web apps, or automating a

- **cross-review** — `C:\Users\isaac.kayembe\.agents\skills\cross-review`
  - Cross review code using a subagent with a specified model. Use when the user asks to review code changes AND specifies a model to use (e.g., 'review with opus', 'use sonnet to review', 'review changes with gemini'). The 

- **frontend-design** — `C:\Users\isaac.kayembe\.agents\skills\frontend-design`
  - Design distinctive, production-grade frontend interfaces — mockups as HTML pages or working application pages. Use when the user asks to design a web page, landing page, UI mockup, dashboard, application page, or any vis

- **init** — `C:\Users\isaac.kayembe\.agents\skills\init`
  - Use when the user asks to initialize a repo, create AGENTS.md, generate contributor guidelines, or set up agent-oriented documentation for a codebase.

- **plan** — `C:\Users\isaac.kayembe\.agents\skills\plan`
  - Planning agent for task breakdown and implementation planning. Use via spawn_subagent with skill='plan' when you need to explore a codebase and design an implementation approach before writing code.

- **research** — `C:\Users\isaac.kayembe\.agents\skills\research`
  - Fast agent specialized for exploring codebases and searching for code patterns. Use via spawn_subagent with skill='research' for read-only exploration tasks.

- **skill-creator** — `C:\Users\isaac.kayembe\.agents\skills\skill-creator`
  - Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill pe

- **zen-comprehensive-review** — `C:\Users\isaac.kayembe\.agents\skills\zen-comprehensive-review`
  - Orchestrate a multi-model code review: spawn 3 review subagents, merge findings. In PR mode, posts GitHub PR comments. In local mode, outputs findings directly. CRITICAL: this skill is costly, don't use it unless user ex

- **zen-review** — `C:\Users\isaac.kayembe\.agents\skills\zen-review`
  - Expert code reviewer. Analyze PR changes for correctness, security, performance, and quality. Returns findings as JSON. CRITICAL: this skill is costly, don't use it unless user explicitly requested to use it.

---

## Suggested next steps

- **MCP:** Use this extension’s hub **MCP** tab, or `claude mcp list` in the terminal. In Claude Code, use `/mcp` to connect servers for the session.
- **Edit config:** Open `~/.claude.json` (user MCP) or `<workspace>/.mcp.json` (project MCP) via the extension commands.
- **Refresh this report:** run **Intelligence — scan MCP & Skills awareness** again after changing MCP config or adding skills.

_Report from Cloude Code ToolBox extension._

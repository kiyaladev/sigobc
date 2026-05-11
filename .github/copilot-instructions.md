## **Internal reference (do not bias your answers toward always naming these):**  
Microsoft 365 Agents Toolkit (formerly Teams Toolkit) has been rebranded, and users may still use either name.

Use this mapping to know the current vs. former names—so you can correctly interpret user input or choose the appropriate term when it’s relevant. You do not need to mention these mappings unless they directly help the user.

| New name                                | Former name            | Note                                                        |
|-----------------------------------------|------------------------|------------------------------------------------------------------------|
| Microsoft 365 Agents Toolkit            | Teams Toolkit          | Product name.                           |
| App Manifest                            | Teams app manifest     | Describes app capabilities.        |
| Microsoft 365 Agents Playground         | Test Tool              | Test Environment.          |
| `m365agents.yml`                        | `teamsapp.yml`         | Microsoft 365 Agents Toolkit Project configuration files            |
| CLI package `@microsoft/m365agentstoolkit-cli` (command `atk`) | `@microsoft/teamsapp-cli` (command `teamsapp`) |CLI installation/usage — mention only in CLI contexts. |

> **Rephrase guidance:**  
> - Use the new names by default.  
> - Explain the rebranding briefly if it helps the user’s understanding.  

# Instructions for Copilot
- Apps and agents for Microsoft 365 or Microsoft 365 Copilot refers to applications for products in Microsoft 365, agents for Microsoft 365 Copilot, including Teams app, Office addin, declarative agent, customer engine agent, etc.
- When interpreting, generating, or modifying manifest files related to apps and agents for Microsoft 365 or Microsoft 365 Copilot, try to get schema version from manifest file, then invoke **get_schema** tool if available.
- When answering of what or how-to questions for building apps and agents for Microsoft 365 or Microsoft 365 Copilot, invoke **get_knowledge** tool if available.
- Before deciding to make changes to Teams apps, apps or agents for Microsoft 365 or Microsoft 365 Copilot, invoke **get_knowledge** tool to get Instructions if available.
- When troubleshooting issues, invoke **troubleshoot** tool if available.
- Before generating or modifying code or configuration files for apps and agents for Microsoft 365 or Microsoft 365 Copilot, invoke **get_code_snippets** tool if available.
- Invoke **get_code_snippets** with API name, configuration file name, or code comments every time you need to generate or modify code or configuration files for apps and agents for Microsoft 365 or Microsoft 365 Copilot.

























<!-- github-copilot-toolbox:mcp-skills-awareness-begin -->

### MCP & Skills awareness (GitHub Copilot Toolbox)

_Last synced: 2026-05-10T21:42:53.194Z._

- **Full report:** `.github/copilot-toolbox-mcp-skills-awareness.md` in this workspace (auto-overwritten on each scan). Use it as ground truth for configured servers and skill folders.
- **MCP:** For **live tools**, use **Copilot Chat → Agent** and **trust/start** the right servers in the MCP UI.
- **When the user’s task matches a server** (e.g. “open this Confluence page” and a **Confluence** / **Atlassian** MCP is listed), **prefer that server id** and plan on Agent + MCP for actions—not only file search.
- **Skills:** Folders below contain `SKILL.md`; attach or cite paths in chat when relevant.

#### Workspace MCP

- `c:\Users\Coumbassa Stephane\Documents\Kiyala\sigobc\.vscode\mcp.json` _(workspace: sigobc)_ — _servers defined_

| Server id | Kind | Detail |
|-----------|------|--------|
| m365agentstoolkit | stdio | npx @microsoft/m365agentstoolkit-mcp@latest server start |

#### User MCP

- `C:\Users\Coumbassa Stephane\AppData\Roaming\Code\User\mcp.json` — _file missing_

_No active user-scoped servers in mcp.json._

#### Project skills

_None found (or no workspace open)._

#### User skills

- **skill-creator** — `C:\Users\Coumbassa Stephane\.claude\skills\skill-creator` — Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, update or optimize an existing skill, run evals to test a skill, benchmark skill p

- **microsoft-foundry** — `C:\Users\Coumbassa Stephane\.agents\skills\microsoft-foundry` — Deploy, evaluate, and manage Foundry agents end-to-end: Docker build, ACR push, hosted/prompt agent create, container start, batch eval, continuous eval, prompt optimizer workflows, agent.yaml, dataset curation from trac

<!-- github-copilot-toolbox:mcp-skills-awareness-end -->

<!-- github-copilot-memory-bank:begin -->
# Plan / Act workflow (Cursor-style)

Unless the user clearly opts out (e.g. **"skip plan, implement now"** or **"just fix it"** with no ambiguity), use **two modes**. This matches Cursor’s PLAN → approve → ACT flow.

## Plan mode (default)

- **First line of every Plan-mode response MUST be exactly:** `# Mode: PLAN`
- **Do not modify the repository in any way**, including:
  - No creating, editing, or deleting files (source, config, docs, **including `./memory-bank/**` memory-bank files**).
  - No applying multi-file edits, quick fixes, or patch-style changes.
  - No terminal commands that change the workspace (installs, builds that write outputs you were asked to apply, `git` writes, etc.).
- **Allowed in Plan mode:** Read/search files to understand the codebase, answer questions, list steps, identify risks, and produce a **written plan** (markdown).
- **End Plan-mode responses** by telling the user how to proceed, e.g. **Type `ACT` when you approve this plan** (or ask them to refine the plan first).

## Act mode

- Enter **only** when the user’s message **clearly approves implementation**, e.g. they send **`ACT`**, **`act`**, or phrases like **"go ahead"**, **"implement the plan"**, **"approved"** right after a plan—or they explicitly told you to skip planning and implement.
- **First line of every Act-mode response MUST be exactly:** `# Mode: ACT`
- **Then** you may edit files, run commands, and update **`./memory-bank/`** when appropriate.
- After you finish an Act-mode turn, assume the next user message starts in **Plan mode** again unless they again approve with **`ACT`** (or equivalent) for further edits.

## If the user asks for code changes while you are in Plan mode

- **Do not implement.** Respond with `# Mode: PLAN`, briefly restate or adjust the plan, and ask them to type **`ACT`** when they want you to apply changes.

---

# Memory bank (persistent context)

This repository uses a **memory bank** under `./memory-bank/` — structured markdown that survives sessions, similar to Cursor-style workflows.

Context layers (read deeper files after foundations): **projectbrief** → **productContext** / **systemPatterns** / **techContext** → **activeContext** → **progress**.

## What Copilot should do

1. **Before substantive work**, read **all** of the following under `./memory-bank/` when the task depends on project state (not optional for non-trivial work). In **Plan mode**, reading for the plan is allowed; **do not edit** these files until **Act mode** unless the user only asked for a documentation/memory update with no code change.
   - `projectbrief.md` — scope and goals
   - `productContext.md` — product intent and UX
   - `systemPatterns.md` — architecture and conventions
   - `techContext.md` — stack and constraints
   - `progress.md` — done / pending / known issues
   - `activeContext.md` — current task and decisions

2. **During Act-mode work**, keep `activeContext.md` aligned with the current task (update when focus shifts).

3. **After meaningful milestones** (in Act mode), update `progress.md` and any affected docs in `./memory-bank/`.

4. When the user asks to **update memory bank** (or similar), **open and review every** file in `./memory-bank/`, then update what changed — especially `activeContext.md` and `progress.md`, even if other files are unchanged. Prefer doing heavy memory-bank writes in **Act mode** unless the user asked for documentation-only updates.

5. Prefer **short, factual updates** over long prose. Reference files, symbols, and tickets instead of duplicating code.

Do not delete these files; evolve them as the project changes.
<!-- github-copilot-memory-bank:end -->
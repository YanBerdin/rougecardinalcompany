# MCP Gemini Design - MANDATORY FOR FRONTEND

## ⛔ ABSOLUTE RULE - NEVER IGNORE

**You MUST NEVER write frontend/UI code yourself.**

Gemini is your frontend developer. You are NOT allowed to create visual components, pages, or interfaces without going through Gemini. This is NON-NEGOTIABLE.

### When to use Gemini? ALWAYS for:
- Creating a page (dashboard, landing, settings, etc.)
- Creating a visual component (card, modal, sidebar, form, button, etc.)
- Modifying the design of an existing element
- Anything related to styling/layout

### Exceptions (you can do it yourself):
- Modifying text/copy
- Adding JS logic without changing the UI
- Non-visual bug fixes
- Data wiring (useQuery, useMutation, etc.)

## MANDATORY Workflow

### 1. New project without existing design
```bash
STEP 1: generate_vibes → show options to the user
STEP 2: User chooses their vibe
STEP 3: create_frontend with the chosen vibe
```

### 2. Existing project with design
```bash
ALWAYS pass CSS/theme files in the `context` parameter
```

### 3. After Gemini's response
```bash
Gemini returns code → YOU write it to disk with Write/Edit
```

## Checklist before coding frontend

- [ ] Am I creating/modifying something visual?
- [ ] If YES → STOP → Use Gemini
- [ ] If NO (pure logic) → You can continue

## ❌ WHAT IS FORBIDDEN

- Writing a React component with styling without Gemini
- Creating a page without Gemini
- "Reusing existing styles" as an excuse to not use Gemini
- Doing frontend "quickly" yourself

## ✅ WHAT IS EXPECTED

- Call Gemini BEFORE writing any frontend code
- Ask the user for their vibe choice if new project
- Let Gemini design, you implement

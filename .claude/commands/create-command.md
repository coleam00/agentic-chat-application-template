---
description: Meta command creator - generates slash commands following established patterns
argument-hint: <command-name> <purpose description>
---

<objective>
Create a new slash command: `$ARGUMENTS`

You are Claude Code creating a command for Claude Code. The agent executing the generated command has your exact capabilities:
- Task tool with subagents (Explore, Plan, code-reviewer, etc.)
- Read, Write, Edit, Glob, Grep tools
- Bash execution with !`command` syntax in prompts
- WebSearch and WebFetch for research
- Extended thinking for complex analysis
- Parallel agent coordination via multiple Task calls

**Meta Principle**: Write instructions you would want to receive. Specificity drives results - concrete prompts outperform vague ones.

**Simplicity Principle**: Not everything needs to be a command. A well-crafted CLAUDE.md entry often beats a complex slash command. Only create commands for repeatable, multi-step workflows.
</objective>

<context>
Existing commands: !`ls -la .claude/commands/`
Command patterns: @.claude/commands/plan-feature.md
Simple command example: @.claude/commands/create-pr.md
Project conventions: @CLAUDE.md
</context>

<process>

## Phase 0: GATE - Should This Be a Command?

**STOP and ask**: Is a slash command the right solution?

| Signal | Recommendation |
|--------|----------------|
| One-time task | Just do it directly, no command needed |
| Simple preference | Add to CLAUDE.md instead |
| Vague/exploratory | Use Task tool with Explore agent directly |
| Repeatable multi-step workflow | YES - create a command |
| Team-shared process | YES - create a command |

**Anti-patterns to avoid:**
- Commands that are just wrappers around single tool calls
- Over-engineered commands for simple tasks
- Commands that duplicate CLAUDE.md guidance

**GATE_CHECK**: If the answer is "add to CLAUDE.md" or "just do it directly" → STOP and recommend that instead.

---

## Phase 1: CLASSIFY - Determine Command Type

**Two fundamental types** (from community patterns):

### TOOL Commands (Simple, Focused)
- Single-purpose utility
- Immediate result
- No multi-agent coordination
- Short, often < 50 lines

```markdown
---
description: Quick one-liner
---

<objective>Brief purpose</objective>

<process>
1. Do the thing
2. Report result
</process>

<success_criteria>Thing is done</success_criteria>
```

**Examples**: commit, create-pr, validate, check-ignores

### WORKFLOW Commands (Complex, Orchestrated)
- Multi-phase execution
- Produces artifacts (files, reports)
- May use subagents or parallel coordination
- Phase checkpoints for self-validation
- Often 100-300 lines

```markdown
---
description: Multi-phase workflow
argument-hint: <input>
---

<objective>What and why, with guiding principles</objective>

<context>Dynamic state loading</context>

<process>
## Phase 1: VERB - Name
...checkpoints...

## Phase 2: VERB - Name
...checkpoints...
</process>

<output>What gets created, what to report</output>

<verification>Final quality checks</verification>

<success_criteria>How to know it worked</success_criteria>
```

**Examples**: plan-feature, rca, feature-development

**CLASSIFY the request:**
- [ ] TOOL - simple, focused → Keep it short
- [ ] WORKFLOW - complex, multi-phase → Full structure

---

## Phase 2: EXPLORE - Study Existing Patterns

**For TOOL commands**: Read 2-3 simple commands for patterns
```
Read .claude/commands/create-pr.md and .claude/commands/commit.md
Extract: frontmatter style, brevity, directness
```

**For WORKFLOW commands**: Use Explore agent
```
Explore .claude/commands/ for workflow patterns.

DISCOVER:
1. Phase naming conventions (PARSE, EXPLORE, ANALYZE, GENERATE, VALIDATE)
2. Checkpoint patterns (PHASE_N_CHECKPOINT with checkboxes)
3. Output format patterns (OUTPUT_FILE, REPORT_TO_USER)
4. Subagent usage patterns (Task tool invocations)
5. Dynamic context patterns (!`commands` and @file)

Return actual snippets from similar commands.
```

**PHASE_2_CHECKPOINT:**
- [ ] Read commands of matching type
- [ ] Identified patterns to mirror
- [ ] Have actual snippets as reference

---

## Phase 3: DESIGN - Structure Decisions

### For TOOL Commands

Keep it minimal:
- 1-3 steps max
- No phases needed
- Direct instructions
- Immediate result

### For WORKFLOW Commands

**Phase structure options:**

| Pattern | When to Use |
|---------|-------------|
| LINEAR | Steps must happen in order |
| PARALLEL | Independent work can happen simultaneously |
| WAVE-BASED | Complex work in batches (3-5 agents per wave) |

**Linear example:**
```
Phase 1: PARSE - Understand input
Phase 2: EXPLORE - Gather context
Phase 3: EXECUTE - Do the work
Phase 4: VALIDATE - Check results
```

**Parallel coordination example** (from disler's patterns):
```markdown
**Deploy parallel agents:**
Use Task tool to launch 3 agents simultaneously:
- Agent 1: Research aspect A
- Agent 2: Research aspect B
- Agent 3: Research aspect C

Aggregate results before proceeding.
```

**Decide on:**
- [ ] Number of phases (fewer is better)
- [ ] Sequential vs parallel execution
- [ ] Output artifacts (files created)
- [ ] Subagent needs

---

## Phase 4: GENERATE - Write the Command

### TOOL Command Template

```markdown
---
description: {What it does in one line}
argument-hint: "{If needed}"
---

<objective>
{What this does and core principle}
</objective>

<context>
{Only if dynamic state needed}
{!`git status` or @relevant-file}
</context>

<process>
1. {Step one}
2. {Step two}
3. {Report result}
</process>

<success_criteria>
{How to know it worked}
</success_criteria>
```

### WORKFLOW Command Template

```markdown
---
description: {What it does}
argument-hint: "{Input description}"
---

<objective>
{What this command does and why}

**Core Principle**: {Guiding philosophy}

**Agent Capabilities**: {Remind what tools are available if relevant}
</objective>

<context>
Current state: !`relevant command`
Project rules: @CLAUDE.md
Related files: @path/to/relevant
</context>

<process>

## Phase 1: {VERB} - {Phase Name}

**{ACTION}:**
- Specific instruction 1
- Specific instruction 2

| Item | Details |
|------|---------|
| ... | ... |

**PHASE_1_CHECKPOINT:**
- [ ] Validation item 1
- [ ] Validation item 2

**GATE**: If {condition} → STOP and {action}

---

## Phase 2: {VERB} - {Phase Name}

**Use Task tool with subagent_type="Explore":**
```
Prompt for the subagent...
```

**Document findings:**
| Category | Source | Finding |
|----------|--------|---------|
| ... | ... | ... |

**PHASE_2_CHECKPOINT:**
- [ ] ...

---

## Phase N: GENERATE - Output

**Save to**: `{output-path}`

</process>

<output>
**OUTPUT_FILE**: `{path}`

**REPORT_TO_USER**:
```markdown
## {Title}

**File**: {path}
**Summary**: {what was done}
**Next step**: {what to do next}
```
</output>

<verification>
**Before completing:**
- [ ] Quality check 1
- [ ] Quality check 2
</verification>

<success_criteria>
**{CRITERION_1}**: {Measurable outcome}
**{CRITERION_2}**: {Measurable outcome}
</success_criteria>
```

### Writing Guidelines

**Specificity wins:**
```markdown
# Bad - vague
Analyze the code for issues

# Good - specific
Search for functions with cyclomatic complexity > 10 using:
grep -r "if\|else\|switch\|for\|while" --include="*.ts" | wc -l
```

**Information-dense keywords:**
- Phases: PARSE, EXPLORE, ANALYZE, DESIGN, GENERATE, VALIDATE
- Actions: EXTRACT, CLASSIFY, DETERMINE, IDENTIFY, CREATE, UPDATE, DEPLOY
- Gates: CHECKPOINT, GATE (stop conditions)

**Include agent hints when relevant:**
```markdown
**Use Task tool with subagent_type="Explore" to...**
**Use WebSearch to find documentation for...**
**Use extended thinking to analyze...**
**Deploy parallel agents via multiple Task calls to...**
```

**PHASE_4_CHECKPOINT:**
- [ ] Frontmatter complete with description
- [ ] Structure matches command type (simple vs workflow)
- [ ] Instructions are specific, not vague
- [ ] Agent capabilities referenced where helpful

---

## Phase 5: VALIDATE - Quality Review

**Apply the "Would I want to receive this?" test:**

| Check | Question |
|-------|----------|
| CLARITY | Is every step unambiguous? |
| SPECIFICITY | Are instructions concrete, not vague? |
| RIGHT_SIZE | Is complexity appropriate? (Not over-engineered) |
| CAPABILITY_MATCH | Does it only ask for available tools? |
| PATTERN_MATCH | Does it follow established conventions? |

**Mental execution test:**
- Walk through the command step by step
- Identify any point where you'd be confused
- Check for missing context or unclear transitions

**PHASE_5_CHECKPOINT:**
- [ ] Passes "Would I want to receive this?" test
- [ ] No vague instructions ("analyze", "review" without specifics)
- [ ] Complexity matches task
- [ ] Follows project patterns

</process>

<output>
**OUTPUT_FILE**: `.claude/commands/{command-name}.md`

**REPORT_TO_USER**:

```markdown
## Command Created

**File**: `.claude/commands/{command-name}.md`

**Usage**: `/{command-name} {arguments if any}`

**Type**: {TOOL/WORKFLOW}

**Complexity**: {Simple (< 50 lines) / Standard / Complex (multi-agent)}

**Key Features**:
- {Feature 1: e.g., "Uses Explore subagent for codebase analysis"}
- {Feature 2: e.g., "Produces report in .agents/reports/"}

**Test it**: Run `/{command-name}` to verify it works as expected.

**Iterate**: If it doesn't work well, refine the instructions - specificity drives results.
```
</output>

<verification>
**Final checks before saving:**

**Structure:**
- [ ] YAML frontmatter has `description`
- [ ] `argument-hint` present if command takes input
- [ ] XML tags properly opened and closed
- [ ] Required tags present: `<objective>`, `<process>`, `<success_criteria>`

**Content Quality:**
- [ ] Objective states what AND why
- [ ] Instructions are specific (not "analyze the code")
- [ ] Phase checkpoints validate progress
- [ ] Output format defined if producing artifacts

**Right-Sizing:**
- [ ] TOOL commands are short and direct
- [ ] WORKFLOW commands have justified complexity
- [ ] No over-engineering for simple tasks

**Pattern Consistency:**
- [ ] Follows existing command conventions
- [ ] kebab-case naming
- [ ] Consistent phase verbs
</verification>

<success_criteria>
**EXECUTABLE**: Agent can run command without confusion or clarification
**SPECIFIC**: Instructions are concrete with examples/commands, not vague
**RIGHT_SIZED**: Complexity matches the task (simple = short, complex = structured)
**PATTERN_FAITHFUL**: Matches established project conventions
**COMPOSABLE**: Can work with other commands or be extended
</success_criteria>

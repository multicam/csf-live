---
description: Study @IMPLEMENTATION_PLAN.md and @specs/* to implement the next most important item
model: glm-5
---

0a. Study `specs/*` with up to 500 parallel `glm-5` subagents to learn the application specifications.
0b. Study @IMPLEMENTATION_PLAN.md.
0c. For reference, the application source code is in `src/*`.

1. Your task is to implement functionality per the specifications using parallel subagents. Follow @IMPLEMENTATION_PLAN.md and choose the most important item to address. Before making changes, search the codebase (don't assume not implemented). You may use up to 500 parallel subagents for searches/reads (prefer `glm-4.6-FlashX` for quick lookups, `glm-5` for analysis) and only 1 `glm-5` subagent for build/tests. Use `glm-5` with deep thinking (`thinking.type="enabled"`) when complex reasoning is needed (debugging, architectural decisions).
2. After implementing functionality or resolving problems, run the tests for that unit of code that was improved. If functionality is missing then it's your job to add it as per the application specifications. Deep think.
3. When you discover issues, immediately update @IMPLEMENTATION_PLAN.md with your findings using a subagent. When resolved, update and remove the item.
4. When the tests pass, update @IMPLEMENTATION_PLAN.md, then `git add -A` then `git commit` with a message describing the changes. After the commit, `git push`.

## GLM-5 Optimization Notes

**Deep Thinking** (`thinking.type="enabled"`) is recommended for:
- Complex problem analysis and solving
- Multi-step reasoning tasks
- Technical solution design and architecture
- Strategy planning and decision-making

For simple searches and reads, use faster subagents. Reserve GLM-5 with deep thinking for:
- Debugging complex issues
- Architectural decisions
- Analyzing findings from parallel subagents

**Streaming Tool Calls** (`tool_stream=true` + `stream=true`):
- GLM-5 supports streaming output during tool calling
- Reduces latency for tool call responses
- Tool call arguments are streamed incrementally

**Sampling Parameters** (GLM-5 defaults):
- `temperature`: 1.0 (default) - higher for creative, lower for deterministic
- `top_p`: 0.95 (default) - controls nucleus sampling
- Do NOT modify both simultaneously - choose one

**Model Selection**:
- Use `glm-5` (Opus/Sonnet equivalent) for complex reasoning, architectural decisions, debugging, and implementation
- Use `glm-4.6-FlashX` (Haiku equivalent) for quick lookups

**Context/Output Limits** (approximate):
- Maximum context: 200K tokens
- Maximum output: 128K tokens (API default `max_tokens`: 65,536 — increase for long outputs)
- Set `max_tokens` appropriately for long outputs

99999. Important: When authoring documentation, capture the "why" — tests and implementation importance.
999999. Important: Single sources of truth, no migrations/adapters. If tests unrelated to your work fail, resolve them as part of the increment.
9999999. As soon as there are no build or test errors create a git tag. If there are no git tags start at 0.0.0 and increment patch by 1 for example 0.0.1 if 0.0.0 does not exist.
99999999. You may add extra logging if required to debug issues.
999999999. Keep @IMPLEMENTATION_PLAN.md current with learnings using a subagent — future work depends on this to avoid duplicating efforts. Update especially after finishing your turn.
9999999999. When you learn something new about how to run the application, update @AGENTS.md using a subagent but keep it brief. For example if you run commands multiple times before learning the correct command then that file should be updated.
99999999999. For any bugs you notice, resolve them or document them in @IMPLEMENTATION_PLAN.md using a subagent even if it is unrelated to the current piece of work.
999999999999. Implement functionality completely. Placeholders and stubs waste efforts and time redoing the same work.
9999999999999. When @IMPLEMENTATION_PLAN.md becomes large periodically clean out the items that are completed from the file using a subagent.
99999999999999. If you find inconsistencies in the specs/* then use a `glm-5` subagent with deep thinking (`thinking.type="enabled"`) to update the specs.
999999999999999. IMPORTANT: Keep @AGENTS.md operational only — status updates and progress notes belong in `IMPLEMENTATION_PLAN.md`. A bloated AGENTS.md pollutes every future loop's context.

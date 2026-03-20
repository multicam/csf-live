#!/bin/bash
# Usage: .ralph/loop.sh [plan|build|review|reverse] [max_iterations]
# Model: Set RALPH_MODEL env var (default: sonnet)
#   anthropic models (sonnet, opus, haiku, claude-*) → prompts/anthropic/
#   glm models (glm-*)                               → prompts/glm-5/
#   unknown model names                              → prompts/anthropic/ (with warning)
# Log pruning: Set RALPH_LOG_KEEP=N to keep last N logs (default: 50; 0 = keep all)
# Pause gate (plan mode): touch .pause to halt between iterations; rm .pause to resume
# Examples (run from repo root):
#   .ralph/loop.sh              # Build mode, unlimited iterations
#   .ralph/loop.sh 20           # Build mode, max 20 iterations
#   .ralph/loop.sh plan         # Plan mode, unlimited iterations
#   .ralph/loop.sh plan 5       # Plan mode, max 5 iterations
#   .ralph/loop.sh review       # Review mode, unlimited iterations
#   .ralph/loop.sh review 10    # Review mode, max 10 iterations
#   .ralph/loop.sh reverse      # Reverse mode, unlimited iterations
#   .ralph/loop.sh reverse 5    # Reverse mode, max 5 iterations
#   RALPH_MODEL=opus .ralph/loop.sh plan   # Plan with Opus
#   RALPH_MODEL=glm-5 .ralph/loop.sh      # Build with GLM-5

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -z "$REPO_ROOT" ]; then
    echo "Error: Cannot determine repo root from $SCRIPT_DIR" >&2
    exit 1
fi

# Determine model and prompt directory
# RALPH_MODEL env var overrides the default (sonnet)
MODEL="${RALPH_MODEL:-sonnet}"

# Map model to prompt directory
case "$MODEL" in
    sonnet|opus|haiku) PROMPT_DIR="anthropic" ;;
    claude-*)         PROMPT_DIR="anthropic" ;;
    glm-*)            PROMPT_DIR="glm-5" ;;
    *)                PROMPT_DIR="anthropic"
                      echo "Warning: Unknown RALPH_MODEL '$MODEL', falling back to anthropic prompts." >&2 ;;
esac

# Parse arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    cat <<'EOF'
Usage: .ralph/loop.sh [plan|build|review|reverse] [max_iterations]
       .ralph/loop.sh [max_iterations]

Modes:
  build    Implement features from specs/ (default)
  plan     Create/update IMPLEMENTATION_PLAN.md from specs/
  review   Deep code review with coverage tracking
  reverse  Reverse-engineer specs/ from existing code

Options:
  -h, --help  Show this message

Environment:
  RALPH_MODEL      Model name (default: sonnet)
                     Anthropic: sonnet, opus, haiku, claude-* → prompts/anthropic/
                     Z.AI GLM:  glm-*                         → prompts/glm-5/
  RALPH_LOG_KEEP   Log files to keep (default: 50; 0 = keep all)

Examples:
  .ralph/loop.sh                        # Build mode, unlimited iterations
  .ralph/loop.sh 20                     # Build mode, max 20 iterations
  .ralph/loop.sh plan                   # Plan mode, unlimited iterations
  .ralph/loop.sh plan 5                 # Plan mode, max 5 iterations
  .ralph/loop.sh review                 # Review mode, unlimited iterations
  .ralph/loop.sh review 10              # Review mode, max 10 iterations
  .ralph/loop.sh reverse                # Reverse mode, unlimited iterations
  .ralph/loop.sh reverse 5              # Reverse mode, max 5 iterations
  RALPH_MODEL=opus .ralph/loop.sh plan  # Plan with Opus
  RALPH_MODEL=glm-5 .ralph/loop.sh      # Build with GLM-5

Pause gate (plan mode only):
  touch .pause   # Halt after current iteration
  rm .pause      # Resume

Logs: /tmp/ralph/{mode}-{timestamp}-iter{N}.jsonl
EOF
    exit 0
elif [ "$1" = "plan" ]; then
    MODE="plan"
    MAX_ITERATIONS=${2:-0}
elif [ "$1" = "review" ]; then
    MODE="review"
    MAX_ITERATIONS=${2:-0}
elif [ "$1" = "reverse" ]; then
    MODE="reverse"
    MAX_ITERATIONS=${2:-0}
elif [ "$1" = "build" ]; then
    MODE="build"
    MAX_ITERATIONS=${2:-0}
elif [[ "$1" =~ ^[0-9]+$ ]]; then
    MODE="build"
    MAX_ITERATIONS=$1
elif [ -z "$1" ]; then
    MODE="build"
    MAX_ITERATIONS=0
else
    echo "Error: Unknown mode '$1'. Valid modes: plan, build, review, reverse" >&2
    exit 1
fi

# Validate MAX_ITERATIONS is a non-negative integer
if ! [[ "$MAX_ITERATIONS" =~ ^[0-9]+$ ]]; then
    echo "Error: max_iterations must be a non-negative integer, got '$MAX_ITERATIONS'" >&2
    exit 1
fi

PROMPT_FILE="$SCRIPT_DIR/prompts/$PROMPT_DIR/$MODE.md"
TOOL_PREFS_FILE="$SCRIPT_DIR/shared/tool-preferences.md"

# Validate RALPH_LOG_KEEP once before starting the loop
RALPH_LOG_KEEP="${RALPH_LOG_KEEP:-50}"
if ! [[ "$RALPH_LOG_KEEP" =~ ^[0-9]+$ ]]; then
    echo "Warning: Invalid RALPH_LOG_KEEP='$RALPH_LOG_KEEP' (must be a non-negative integer). Using default 50." >&2
    RALPH_LOG_KEEP=50
fi

ITERATION=0
cd "$REPO_ROOT" || { echo "Error: Cannot cd to repo root: $REPO_ROOT" >&2; exit 1; }
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
    echo "Error: Not on a branch (detached HEAD). Checkout a branch before running Ralph." >&2
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Repo:   $REPO_ROOT"
echo "Mode:   $MODE"
echo "Model:  $MODEL ($PROMPT_DIR prompts)"
echo "Prompt: $PROMPT_FILE"
echo "Branch: $CURRENT_BRANCH"
[ $MAX_ITERATIONS -gt 0 ] && echo "Max:    $MAX_ITERATIONS iterations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verify prompt file and tool preferences exist
if [ ! -f "$TOOL_PREFS_FILE" ]; then
    echo "Error: $TOOL_PREFS_FILE not found" >&2
    exit 1
fi
if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: $PROMPT_FILE not found" >&2
    exit 1
fi

while true; do
    if [ $MAX_ITERATIONS -gt 0 ] && [ $ITERATION -ge $MAX_ITERATIONS ]; then
        echo "Reached max iterations: $MAX_ITERATIONS"
        break
    fi

    # Run Ralph iteration with selected prompt
    # -p: Headless mode (non-interactive, reads from stdin)
    # --dangerously-skip-permissions: Auto-approve all tool calls (YOLO mode)
    # --output-format=stream-json: Structured output for logging/monitoring
    # --model $MODEL: Set via RALPH_MODEL env var (default: sonnet). Use opus for complex reasoning.
    # --verbose: Detailed execution logging
    LOG_FILE="/tmp/ralph/${MODE}-$(date +%Y%m%d-%H%M%S)-iter${ITERATION}.jsonl"
    mkdir -p /tmp/ralph || { echo "Error: Cannot create log directory /tmp/ralph" >&2; exit 1; }

    cat "$TOOL_PREFS_FILE" "$PROMPT_FILE" | claude -p \
        --dangerously-skip-permissions \
        --output-format=stream-json \
        --model "$MODEL" \
        --verbose \
        2>&1 | tee "$LOG_FILE"
    CLAUDE_EXIT="${PIPESTATUS[1]}"

    # Prune old logs — keep the most recent RALPH_LOG_KEEP files (default: 50; 0 = keep all)
    # Pruning runs after write so the count is accurate (not off-by-one)
    if [ "$RALPH_LOG_KEEP" -gt 0 ]; then
        mapfile -t OLD_LOGS < <(ls -1t /tmp/ralph/*.jsonl 2>/dev/null | tail -n +"$((RALPH_LOG_KEEP + 1))")
        [ ${#OLD_LOGS[@]} -gt 0 ] && rm -f "${OLD_LOGS[@]}"
    fi
    if [ "$CLAUDE_EXIT" -ne 0 ]; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
        echo "Claude exited with error (code $CLAUDE_EXIT). Stopping loop." >&2
        echo "Log: $LOG_FILE" >&2
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
        exit "$CLAUDE_EXIT"
    fi

    # Commit and push changes after each iteration
    if [ -n "$(git status --porcelain)" ]; then
        git add -A || {
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
            echo "Git add failed. Stopping loop." >&2
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
            exit 1
        }
        git commit -m "Iteration $ITERATION - $MODE mode [$MODEL]" || {
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
            echo "Git commit failed. Stopping loop." >&2
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
            exit 1
        }
        git push origin "$CURRENT_BRANCH" || {
            echo "Failed to push. Setting upstream and retrying..." >&2
            git push -u origin "$CURRENT_BRANCH" || {
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
                echo "Git push failed. Stopping loop." >&2
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
                exit 1
            }
        }
    fi

    ITERATION=$((ITERATION + 1))
    echo -e "\n\n======================== LOOP $ITERATION ========================\n"

    # In plan mode, check for pause gate between iterations
    # Usage: touch .pause → edit specs → rm .pause
    if [ "$MODE" = "plan" ] && [ -f "$REPO_ROOT/.pause" ]; then
        echo "⏸ Paused. Edit specs, then: rm .pause"
        while [ -f "$REPO_ROOT/.pause" ]; do sleep 2; done
        echo "Resuming..."
    fi
done

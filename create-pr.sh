#!/bin/bash

# This script takes a jsonl file as input which is the stdout of a Dependabot CLI run.
# It takes the `type: create_pull_request` events and creates a pull request for each of them
# by using git commands.

set -euo pipefail

# Check for required arguments
if [ $# -lt 1 ] || [ $# -gt 2 ]; then
  echo "Usage: $0 <result.jsonl> [base_branch]"
  echo "  result.jsonl: The Dependabot output file"
  echo "  base_branch: The branch to open PRs against (default: develop)"
  exit 1
fi

INPUT="$1"
BASE_BRANCH="${2:-develop}" # Use the provided base branch or default to 'develop'

echo "Using base branch: $BASE_BRANCH"

git config --global advice.detachedHead false

# Parse each create_pull_request event
jq -c 'select(.type == "create_pull_request")' "$INPUT" | while read -r event; do
  # Extract fields
  BASE_SHA=$(echo "$event" | jq -r '.data."base-commit-sha"')
  PR_TITLE=$(echo "$event" | jq -r '.data."pr-title"')
  PR_BODY=$(echo "$event" | jq -r '.data."pr-body"')
  COMMIT_MSG=$(echo "$event" | jq -r '.data."commit-message"')
  BRANCH_NAME="dependabot-$(echo -n "$COMMIT_MSG" | sha1sum | awk '{print $1}')"

  echo "Processing PR: $PR_TITLE"
  echo "  Base SHA: $BASE_SHA"
  echo "  Branch: $BRANCH_NAME"
  echo "  Target: $BASE_BRANCH"

  # Create and checkout new branch from base commit
  git fetch origin
  git checkout "$BASE_SHA"
  git checkout -b "$BRANCH_NAME"

  # Apply file changes
  echo "$event" | jq -c '.data."updated-dependency-files"[]' | while read -r file; do
    FILE_PATH=$(echo "$file" | jq -r '.directory + "/" + .name' | sed 's#^/##; s#^/##; s#//#/#g')
    DELETED=$(echo "$file" | jq -r '.deleted')
    if [ "$DELETED" = "true" ]; then
      git rm -f "$FILE_PATH" || true
    else
      mkdir -p "$(dirname "$FILE_PATH")"
      echo "$file" | jq -r '.content' > "$FILE_PATH"
      git add "$FILE_PATH"
    fi
  done

  # Commit and push
  git commit -m "$COMMIT_MSG"
  git push -f origin "$BRANCH_NAME"

  # Create PR using gh CLI
  gh pr create --title "$PR_TITLE" --body "$PR_BODY" --base "$BASE_BRANCH" --head "$BRANCH_NAME" --label dependencies || true
  # Return to base branch for next PR
  git checkout "$BASE_BRANCH"
done

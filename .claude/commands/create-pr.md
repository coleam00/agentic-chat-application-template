---
description: Create a pull request for current branch
argument-hint: "[base-branch]"
---

<objective>
Create a pull request from the current branch to ${ARGUMENTS:-main}.

Analyze all commits since branching, generate a clear summary, and create the PR using gh CLI.
</objective>

<context>
Current branch: !`git branch --show-current`
Base branch: !`git rev-parse --abbrev-ref HEAD@{upstream} 2>/dev/null | cut -d'/' -f2 || echo "main"`
Commits to include: !`git log --oneline $(git merge-base HEAD origin/main)..HEAD 2>/dev/null || git log --oneline -10`
Unpushed commits: !`git status -sb | head -1`
Changed files: !`git diff --name-only $(git merge-base HEAD origin/main)..HEAD 2>/dev/null || git diff --name-only HEAD~5`
</context>

<process>

1. **VERIFY branch state**
   - Confirm not on main/master
   - Check for uncommitted changes
   - Ensure branch is pushed to remote

2. **ANALYZE all commits**
   - Review every commit since branch diverged from base
   - Identify the type of change (feat/fix/refactor/docs/chore)
   - Extract key changes and their purpose

3. **GENERATE PR content**
   - Title: `<type>: <concise description>`
   - Summary: 2-4 bullet points of what changed
   - Test plan: How to verify the changes work

4. **CREATE PR using gh CLI**
   ```bash
   gh pr create --title "<title>" --body "$(cat <<'EOF'
   ## Summary
   - <bullet 1>
   - <bullet 2>

   ## Test plan
   - [ ] <verification step 1>
   - [ ] <verification step 2>
   EOF
   )"
   ```

5. **REPORT PR URL** to user

</process>

<success_criteria>
- PR created with descriptive title matching commit type
- Summary accurately reflects ALL commits (not just the latest)
- Test plan includes actionable verification steps
- PR URL returned to user
</success_criteria>

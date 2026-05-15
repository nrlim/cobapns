# Writing Implementation Plans

Use this skill to draft a comprehensive roadmap **BEFORE** touching any code for complex or multi-file requirements.

## 1. The "Bite-Sized" Rule
- **Granularity**: Each step must be executable in 2-5 minutes.
- **Independence**: Each task should ideally result in a working/storable state (commit-ready).
- **Format**: Every task must use checkbox (`- [ ]`) syntax for tracking.

## 2. The "Zero Placeholder" Mandate
- **NO TODOs**: Never write "implement logic here" or "add validation later".
- **Code Inclusion**: If a step modifies a function, show the EXACT logic or a clear snippet of what to add.
- **Path Accuracy**: Always use absolute or project-relative file paths (e.g., `lib/auth-guard.ts`).

## 3. Plan Structure (MANDATORY HEADER)
Every plan document must start with:

```markdown
# [Feature Name] Implementation Plan

> **Note:** Execute this plan step-by-step using the 'executing-plans' skill.

**Goal:** [Clear 1-sentence goal]
**Architecture:** [Brief tech stack and approach]
**Files Modified/Created:** [List of paths]
---
```

## 4. Testing & Verification
- Every significant logic change MUST include a verification step (e.g., "Run npm run dev and check console", or "Check DB for record creation").
- TDD approach: Prefer writing the test/verification criteria BEFORE the implementation.

## 5. Planning Quality Gate
- Before starting execution, verify:
    - [ ] Plan covers 100% of the user's requirements.
    - [ ] All file paths are correct.
    - [ ] Steps are small enough to avoid context loss.
    - [ ] Logic is sound and follows existing patterns.

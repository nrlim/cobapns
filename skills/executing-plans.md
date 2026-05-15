# Executing Implementation Plans

Standard protocol for executing a plan created via `writing-plans`. **STAY ON TRACK.**

## 1. Strict Adherence
- **Step-by-Step**: Execute exactly ONE step at a time. Do not skip ahead or combine steps unless explicitly authorized.
- **Verification**: After each step, verify the result matches the "Expected" outcome in the plan.

## 2. Checkpoints & Feedback
- **Self-Review**: Every 3-5 tasks, pause and check the "big picture". Does the current state align with the goal?
- **User Sync**: If a critical design decision is encountered that wasn't in the plan, STOP and ask the user for clarification.

## 3. Dealing with Deviations
- **Bug Discovery**: If a step fails because of a bug in the code (or the plan), fix it immediately, update the plan doc to reflect the reality, and continue.
- **Scope Creep**: Do not add extra features that weren't in the original plan. Stick to the scope.

## 4. Documentation & Cleanliness
- **Keep it Clean**: Ensure no `console.log` or temporary debugging code remains after a task is finished.
- **Commits**: If the user's environment allows, suggest commits after each task block.

## 5. Execution Quality Gate
- At the end of execution, verify:
    - [ ] All checkboxes in the plan are checked.
    - [ ] Code compiles and passes basic linting.
    - [ ] User's original objective is fully met.
    - [ ] No sensitive data was exposed during the process.

import type { Condition, GameState, StateChange, Choice } from "@/lib/types";

export function evaluateCondition(
  condition: Condition,
  state: GameState
): boolean {
  const actual = state.variables[condition.variable];
  if (actual === undefined) return false;
  const expected = condition.value;

  if (typeof actual === "boolean" && typeof expected === "boolean") {
    return condition.operator === "eq" ? actual === expected : false;
  }
  if (typeof actual === "number" && typeof expected === "number") {
    switch (condition.operator) {
      case "eq":
        return actual === expected;
      case "gt":
        return actual > expected;
      case "lt":
        return actual < expected;
      case "gte":
        return actual >= expected;
      case "lte":
        return actual <= expected;
    }
  }
  return false;
}

export function filterAvailableChoices(
  choices: Choice[],
  state: GameState
): Choice[] {
  return choices.filter((c) => {
    if (!c.conditions || c.conditions.length === 0) return true;
    return c.conditions.every((cond) => evaluateCondition(cond, state));
  });
}

export function applyStateChanges(
  state: GameState,
  changes: StateChange[]
): GameState {
  const vars = { ...state.variables };
  for (const change of changes) {
    if (change.operation === "set") {
      vars[change.variable] = change.value;
    } else if (change.operation === "add") {
      const current = typeof vars[change.variable] === "number"
        ? (vars[change.variable] as number)
        : 0;
      vars[change.variable] = current + (change.value as number);
    }
  }
  return { ...state, variables: vars };
}

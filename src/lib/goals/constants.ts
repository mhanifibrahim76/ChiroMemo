export type GoalActionState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialGoalActionState: GoalActionState = {};


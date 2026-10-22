export type ResourceActionState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialResourceActionState: ResourceActionState = {};


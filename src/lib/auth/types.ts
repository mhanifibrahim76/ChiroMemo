/** State returned by the auth Server Actions and rendered by the auth forms. */
export type AuthFormState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialAuthFormState: AuthFormState = {};

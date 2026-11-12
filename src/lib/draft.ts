export const isDev = process.env.NODE_ENV !== "production";

/** Draft content is shown in development only; final content always. */
export function showDraft(draft: boolean) {
  return !draft || isDev;
}

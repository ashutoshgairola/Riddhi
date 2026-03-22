// src/services/api/apiErrorBridge.ts
// Module-level bridge so the Axios interceptor (outside React) can trigger
// a toast notification inside the React tree.

type ErrorNotifier = (message: string) => void;

let notifier: ErrorNotifier | null = null;

export const setApiErrorNotifier = (fn: ErrorNotifier | null): void => {
  notifier = fn;
};

export const notifyApiError = (message: string): void => {
  notifier?.(message);
};

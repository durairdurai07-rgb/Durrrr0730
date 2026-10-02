export const toast = (message: string) => window.dispatchEvent(new CustomEvent("myday:toast", { detail: message }));

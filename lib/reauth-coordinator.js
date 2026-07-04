// Bridges the non-React API client to the React step-up modal.
// api.js can't render UI; StepUpReauthProvider registers a handler here on
// mount, and concurrent 401s coalesce into a single modal prompt.

let handler = null;
let inflight = null;

export function registerStepUpHandler(fn) {
  handler = fn;
  return () => {
    // Only clear the slot if we still own it (a stale unmount must not
    // clobber a newer provider's registration).
    if (handler === fn) handler = null;
  };
}

export function isStepUpHandlerRegistered() {
  return handler !== null;
}

/** Resolves true when the user re-authenticated, false when they cancelled. */
export function requestStepUp() {
  if (!handler) return Promise.resolve(false);
  if (inflight) return inflight;
  inflight = Promise.resolve()
    .then(() => handler())
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

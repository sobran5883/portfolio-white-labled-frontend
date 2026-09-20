// Lazily injects the Razorpay Checkout script and resolves once window.Razorpay
// is available. Safe to call multiple times — the script is only added once.
let loaderPromise = null;

export function loadRazorpayCheckout() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only load in the browser."));
  }
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error("Razorpay script loaded but window.Razorpay is missing."));
    };
    script.onerror = () => {
      loaderPromise = null;
      reject(new Error("Failed to load Razorpay Checkout."));
    };
    document.body.appendChild(script);
  });
  return loaderPromise;
}

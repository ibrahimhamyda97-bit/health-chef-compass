import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Prevent service worker in iframes & preview hosts
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

// Unregister any stale service workers and clear caches everywhere.
// A previous version of the app registered a SW that kept serving outdated
// HTML/JS bundles even after publishing new versions. This forces clients
// to always fetch the latest build.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
}
if ("caches" in window) {
  caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
}

createRoot(document.getElementById("root")!).render(<App />);

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// (service worker cleanup runs unconditionally below)


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

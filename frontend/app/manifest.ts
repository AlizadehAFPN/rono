import type { MetadataRoute } from "next";

// Web App Manifest — makes Synapse installable to the home screen on
// Android (Chrome shows an install prompt) and iOS (Share → Add to Home Screen).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Synapse — Adaptive Learning",
    short_name: "Synapse",
    description:
      "Adaptive medical education that personalizes to every learner in real time.",
    // The PWA is the web *app*, not the marketing site: launch straight into
    // the dashboard (which routes to /login when unauthenticated). Scope stays
    // at "/" so /login and /signup remain in-app navigations.
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#15202B", // X "dim" dark background
    theme_color: "#1D9BF0", // X blue
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

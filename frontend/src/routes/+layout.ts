// The whole app runs client-side with no backend, so prerender to static
// HTML and disable SSR. This lets the build output be hosted on any static host.
export const prerender = true;
export const ssr = false;

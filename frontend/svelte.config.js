import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// All logic runs in the browser, so the app is prerendered to static
		// files and served by any static host (no backend/server required).
		adapter: adapter({
			fallback: 'index.html'
		})
	}
};

export default config;

import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import * as path from 'node:path';

const config = {
    preprocess: vitePreprocess(),
    onwarn(warning, handler) {
        if (warning.code === 'state_referenced_locally') return;
        handler(warning);
    },
    kit: {
        env: {
            publicPrefix: 'PUBLIC_',
            privatePrefix: 'PRIVATE_',
        },
        adapter: adapter(),
        alias: {
            '#menu': './src/menu',
            '#components': './src/components',
            '#icons': './src/icons',
            '#lib': './src/lib',
            'backend/types': path.resolve('back/types/index.ts'),
        },
    },
};

export default config;

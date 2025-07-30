import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            laravel({
                input: [
                    'resources/css/app.css',
                    'resources/js/app.jsx',
                ],
                refresh: true,
            }),
            react(), // <-- enable React support
        ],
        // For development, not production
        server: {
            host: '0.0.0.0', // Makes it accessible outside docker
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            hmr: {
                host: 'localhost', // HMR WebSocket
                port: 5173,
            },
            watch: {
                usePolling: true,
                ignored: ['**/node_modules/**', '**/vendor/**', '**/.git/**'], // Ignored for local development performance
            },
        },
    };
});
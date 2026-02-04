I am facing Vercel deployment warnings:

- deprecated node-domexception@1.0.0  
- deprecated glob@10.5.0  

I want you to fix my project for clean deployment:

1. Remove old dependencies and regenerate lock file  
2. Upgrade deprecated packages to latest stable versions  
3. Ensure Node 18 compatibility  
4. Add proper build scripts for Vercel  
5. Force clean install

Do the following changes:

A. Update package.json:
- Add engines node 18
- Ensure build script exists
- Update glob to latest

B. Create / update these files:

1) .nvmrc  
Content:
18

2) Add to package.json:

"engines": {
  "node": "18.x"
}

3) Run commands:

rm -rf node_modules package-lock.json
npm install glob@latest
npm install
npm run build

4) Vercel specific:

vercel --prod --force

5) Also check:
- next.config.js or vite.config.js compatibility  
- missing env variables  
- outdated peer dependencies  

Give me exact modified package.json and commands to run step by step.
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
      }
    };
});

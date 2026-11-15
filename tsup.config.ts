import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  outDir: 'dist',
  format: ['esm'],          // CJS নয়, ESM
  target: 'node20',
  platform: 'node',
  clean: true,
  sourcemap: true,
  // Node.js সার্ভারের জন্য ডিপেন্ডেন্সি বান্ডল না করাই ভালো
  external: [
    '@prisma/client',
    '@prisma/adapter-pg',
    'pg',
    'express',
    'better-auth',
    'cloudinary',
    'stripe',
    'sslcommerz-lts',
    // ... আপনার অন্যান্য runtime ডিপেন্ডেন্সিও চাইলে যোগ করতে পারেন
  ],
});
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

const USER_SERVICE_PROXY_PATH = '/user-api';
const STORE_SERVICE_PROXY_PATH = '/store-api';
const PRODUCT_SERVICE_PROXY_PATH = '/product-api';
const ABS_CONFIG_SERVICE_PROXY_PATH = '/config-api';
const COMPANY_SERVICE_PROXY_PATH = '/company-api';
const CUSTOMER_SERVICE_PROXY_PATH = '/customer-api';
const ORDER_SERVICE_PROXY_PATH = '/order-api';
const USER_SERVICE_FALLBACK = 'http://127.0.0.1:5001';
const STORE_SERVICE_FALLBACK = 'http://127.0.0.1:5002';
const PRODUCT_SERVICE_FALLBACK = 'http://127.0.0.1:5003';
const ABS_CONFIG_SERVICE_FALLBACK = 'http://127.0.0.1:5004';
const COMPANY_SERVICE_FALLBACK = 'http://127.0.0.1:5005';
const CUSTOMER_SERVICE_FALLBACK = 'http://127.0.0.1:5006';
const ORDER_SERVICE_FALLBACK = 'http://127.0.0.1:5007';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  let httpsConfig = false;
  let proxyTarget = env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
    : env.ASPNETCORE_URLS
    ? env.ASPNETCORE_URLS.split(';')[0]
    : 'https://localhost:7212';
  const userServiceTarget = env.VITE_USER_SERVICE_URL_LOCAL || USER_SERVICE_FALLBACK;
  const storeServiceTarget = env.VITE_STORE_SERVICE_URL_LOCAL || STORE_SERVICE_FALLBACK;
  const productServiceTarget = env.VITE_PRODUCT_SERVICE_URL_LOCAL || PRODUCT_SERVICE_FALLBACK;
  const absConfigServiceTarget = env.VITE_ABS_CONFIG_SERVICE_URL_LOCAL || ABS_CONFIG_SERVICE_FALLBACK;
  const companyServiceTarget = env.VITE_COMPANY_SERVICE_URL_LOCAL || COMPANY_SERVICE_FALLBACK;
  const customerServiceTarget = env.VITE_CUSTOMER_SERVICE_URL_LOCAL || CUSTOMER_SERVICE_FALLBACK;
  const orderServiceTarget = env.VITE_ORDER_SERVICE_URL_LOCAL || ORDER_SERVICE_FALLBACK;

  if (isDev) {
    const baseFolder =
      env.APPDATA && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;

    const certificateName = 'sps-suite.client';
    const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
    const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

    if (!fs.existsSync(baseFolder)) {
      fs.mkdirSync(baseFolder, { recursive: true });
    }

    if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
      if (
        0 !==
        child_process.spawnSync(
          'dotnet',
          [
            'dev-certs',
            'https',
            '--export-path',
            certFilePath,
            '--format',
            'Pem',
            '--no-password',
          ],
          { stdio: 'inherit' }
        ).status
      ) {
        throw new Error('Could not create certificate.');
      }
    }

    httpsConfig = {
      key: fs.readFileSync(keyFilePath),
      cert: fs.readFileSync(certFilePath),
    };
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '^/weatherforecast': {
          target: proxyTarget,
          secure: false,
        },
        [`^${USER_SERVICE_PROXY_PATH}`]: {
          target: userServiceTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (requestPath) =>
            requestPath.replace(new RegExp(`^${USER_SERVICE_PROXY_PATH}`), ''),
        },
        [`^${STORE_SERVICE_PROXY_PATH}`]: {
          target: storeServiceTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (requestPath) =>
            requestPath.replace(new RegExp(`^${STORE_SERVICE_PROXY_PATH}`), ''),
        },
        [`^${PRODUCT_SERVICE_PROXY_PATH}`]: {
          target: productServiceTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (requestPath) =>
            requestPath.replace(new RegExp(`^${PRODUCT_SERVICE_PROXY_PATH}`), ''),
        },
        [`^${ABS_CONFIG_SERVICE_PROXY_PATH}`]: {
          target: absConfigServiceTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (requestPath) =>
            requestPath.replace(new RegExp(`^${ABS_CONFIG_SERVICE_PROXY_PATH}`), ''),
        },
        [`^${COMPANY_SERVICE_PROXY_PATH}`]: {
          target: companyServiceTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (requestPath) =>
            requestPath.replace(new RegExp(`^${COMPANY_SERVICE_PROXY_PATH}`), ''),
        },
        [`^${CUSTOMER_SERVICE_PROXY_PATH}`]: {
          target: customerServiceTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (requestPath) =>
            requestPath.replace(new RegExp(`^${CUSTOMER_SERVICE_PROXY_PATH}`), ''),
        },
        [`^${ORDER_SERVICE_PROXY_PATH}`]: {
          target: orderServiceTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (requestPath) =>
            requestPath.replace(new RegExp(`^${ORDER_SERVICE_PROXY_PATH}`), ''),
        },
      },
      port: parseInt(env.DEV_SERVER_PORT || '5173'),
      https: httpsConfig,
    },
    build: {
      outDir: 'dist',
    },
  };
});

/** @type {import('next').NextConfig} */
const { ModuleFederationPlugin } = require("webpack").container;

const nextConfig = {
  reactStrictMode: true,
  webpack(config, { isServer }) {
    // Solo aplicar Module Federation en el cliente
    if (!isServer) {
      config.plugins.push(
        new ModuleFederationPlugin({
          name: "host",
          remotes: {
            remote: "remote@http://localhost:3021/remoteEntry.js",
            remotenext14: "remotenext14@http://localhost:3002/remoteEntry.js",
          },
          // No compartir - cada app usa sus propias dependencias
          shared: {
            react: {
              singleton: false,
              requiredVersion: "^18.2.0",
              eager: true,
              import: "react",
            },
            "react-dom": {
              singleton: false,
              requiredVersion: "^18.2.0",
              eager: true,
              import: "react-dom",
            },
            "aurora-web": {
              singleton: false,
              eager: true,
            },
          },
        }),
      );
    }

    return config;
  },
};

module.exports = nextConfig;

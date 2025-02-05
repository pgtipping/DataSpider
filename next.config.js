const nextConfig = {
  webpack: (config) => {
    // Tell webpack to ignore jsdom on the client
    config.resolve.fallback = {
      ...config.resolve.fallback,
      jsdom: false,
    };
    return config;
  },
};

module.exports = nextConfig;

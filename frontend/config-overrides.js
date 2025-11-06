// Tệp: config-overrides.js
const webpack = require('webpack');

module.exports = function override(config) {
  
  // 1. Cấu hình Fallback (Polyfills)
  config.resolve.fallback = {
    ...config.resolve.fallback,
    
    // Các module Node.js cần polyfill cho trình duyệt
    "path": require.resolve("path-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer/"),
    "util": require.resolve("util/"),
    "querystring": require.resolve("querystring-es3"),
    "url": require.resolve("url/"),
    "events": require.resolve("events/"),
    "vm": require.resolve("vm-browserify"),

    // Các module không thể/không cần polyfill
    "fs": false,
    "net": false,
    "zlib": false,
    "tls": false,
    "child_process": false,
    "http": false,
    "https": false,
    "async_hooks": false, 

    // Xử lý các "node:" prefix
    "node:path": require.resolve("path-browserify"),
    "node:os": require.resolve("os-browserify/browser"),
    "node:crypto": require.resolve("crypto-browserify"),
    "node:stream": require.resolve("stream-browserify"),
    "node:buffer": require.resolve("buffer/"),
    "node:util": require.resolve("util/"),
    "node:querystring": require.resolve("querystring-es3"),
    "node:url": require.resolve("url/"),
    "node:events": require.resolve("events/"),
    "node:vm": require.resolve("vm-browserify"),
    "node:fs": false,
    "node:net": false,
    "node:zlib": false,
    "node:tls": false,
    "node:child_process": false,
    "node:http": false,
    "node:https": false,
    "node:async_hooks": false,
  };

  // 2. Cung cấp (Provide) các biến global
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
       process: 'process/browser.js',
    }),
  ]);

  // 3. Tắt quy tắc "fullySpecified"
  config.module.rules = [
    ...config.module.rules,
    {
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    },
  ];

  // 4. Bỏ qua các cảnh báo source-map (tùy chọn)
  config.ignoreWarnings = [/Failed to parse source map/];

  return config;
};
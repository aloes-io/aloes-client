/* Copyright 2019 Edouard Maleix, read LICENSE */

process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
  parallel: false,

  configureWebpack: {
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000,
        cacheGroups: {
          node_vendors: {
            test: /[\\/]node_modules[\\/]/,
            // chunks: "async",
            priority: 1,
          },
        },
      },
    },
  },

  // devServer: {
  //   proxy: {
  //     "^/api": {
  //       target: "https://node.getlarge.eu",
  //       ws: true,
  //       changeOrigin: true
  //     }
  //   }
  // }
  chainWebpack: config => {
    config.module
      .rule('worker')
      .test(/\.worker\.js$/i)
      .use('worker-loader')
      .loader('worker-loader')
      .tap(options => {
        if (!options) options = {};
        // options.publicPath = '/workers/';
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          options.name = `[hash].${(Math.random() * 1e32).toString(36)}-worker.js`;
        } else {
          options.name = '[hash].worker.js';
        }
        options.inline = true;
        options.fallback = false;
        return options;
      });
  },
};

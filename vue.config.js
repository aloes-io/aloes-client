process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
  lintOnSave: false,
  baseUrl: undefined,
  outputDir: 'build',
  assetsDir: undefined,
  runtimeCompiler: true,
  productionSourceMap: undefined,
  parallel: false,
  css: undefined,
  configureWebpack: {
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000,
      },
    },
  },
  // optimization: {
  //   splitChunks: {
  //     cacheGroups: {
  //       node_vendors: {
  //         test: /[\\/]node_modules[\\/]/,
  //         chunks: 'async',
  //         priority: 1,
  //       },
  //     },
  //   },
  // },
  chainWebpack: config => {
    config.module
      .rule('worker')
      .test(/\.worker\.js$/i)
      .use('worker-loader')
      .loader('worker-loader')
      .tap(options => {
        if (!options) options = {};
        // options.publicPath = '/workers/';
        // options.publicPath = 'src/workers';
        options.name = '[hash].worker.js';
        options.inline = true;
        options.fallback = false;
        return options;
      });
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
};

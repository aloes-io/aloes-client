process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
  lintOnSave: false,
  baseUrl: undefined,
  outputDir: 'build',
  assetsDir: undefined,
  runtimeCompiler: true,
  productionSourceMap: undefined,
  // parallel: undefined,
  css: undefined,
  configureWebpack: {
    // trick to avoid compile error
    externals: { canvas: {} },
  },
  parallel: false,
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
        options.name = '[hash].worker-test11.js';
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

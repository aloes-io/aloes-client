process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
  lintOnSave: false,
  baseUrl: undefined,
  outputDir: 'build',
  assetsDir: undefined,
  runtimeCompiler: true,
  productionSourceMap: undefined,
  parallel: undefined,
  css: undefined,
  configureWebpack: {
    // trick to avoid compile error
    externals: { canvas: {} },
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

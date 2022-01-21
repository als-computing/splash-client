const LicensePlugin = require('webpack-license-plugin');

// https://github.com/codepunkt/webpack-license-plugin
// https://cli.vuejs.org/guide/webpack.html
module.exports = {
  configureWebpack: {
    plugins: [new LicensePlugin()],
    devtool: 'source-map',
  },
  publicPath: `/${process.env.VUE_APP_SPLASH_BASE}/`,
  devServer: {
    allowedHosts: [
      'teocali',
      'teocali.dhcp.lbl.gov'],
    proxy: {
      '^/api': {
        target: 'http://127.0.0.1:8000',
        logLevel: 'debug',
        ws: true,
        changeOrigin: true,

      },
      '^/elasticsearch': {
        target: 'http://127.0.0.1:80',
        logLevel: 'debug',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/elasticsearch': '/search',
        },
      },

    },
  },

  lintOnSave: false,
};

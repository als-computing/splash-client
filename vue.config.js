const LicensePlugin = require('webpack-license-plugin');
//https://github.com/codepunkt/webpack-license-plugin
//https://cli.vuejs.org/guide/webpack.html
module.exports = {
    configureWebpack: {
        plugins: [new LicensePlugin()]
    },

    devServer: {
        proxy: {
        '^/api': {
            target: "http://127.0.0.1:5000",
            logLevel: 'debug',
            ws: true,
            changeOrigin: true
        }
    }
  }
}
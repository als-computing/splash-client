const LicensePlugin = require('webpack-license-plugin');
//https://github.com/codepunkt/webpack-license-plugin
//https://cli.vuejs.org/guide/webpack.html
module.exports = {
    configureWebpack: {
        plugins: [new LicensePlugin()]

    }

    }
var ExtractTextPlugin = require("extract-text-webpack-plugin");
//only available in .vue
var Config = {
    loaders: {},
    postcss: [
        require('autoprefixer')({ browsers: ['last 3 versions', "Safari >= 6"], }),
    ]
}

if (/production/.test(process.env.NODE_ENV)) {
    Config.loaders = {
        css: ExtractTextPlugin.extract({ loader: ['css-loader'], fallback: "vue-style-loader", }),
        less: ExtractTextPlugin.extract({ loader: ['css-loader', 'less-loader'], fallback: "vue-style-loader", publicPath: "../" })
    }
    Config.postcss.push(require('cssnano')({
        zindex: false
    }))
}
module.exports = Config;
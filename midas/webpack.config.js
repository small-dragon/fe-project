const path = require('path')
const del = require('del');
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const Config = {
    //基础目录，绝对路径，用于从配置中解析入口起点(entry point)和加载器(loader)
    context: path.resolve(__dirname, "src"),
    entry: {
        'main': './main.js',
        'vendor': ['vue', 'vue-resource', 'vue-router', 'vuex']
    },
    output: {
        filename: 'js/[name].[hash:6].js',
        path: path.resolve(__dirname, './main'),
        publicPath: '/static/main/'
    },
    module: {
        rules: [
            //Rule.loader 是 Rule.use[{ loader }] 的缩写， 同理 options、query
            //Rule.loaders 是 Rule.use 的别名
            { test: /\.html$/, use: "html-loader" },
            //use:加载器，被用于将资源转换成一个输出的CSS模块
            //fallback:应用于当CSS没有被提取(也就是一个额外的chuck,当allChunks:false)
            { test: /\.less$/, use: /dev/.test(process.env.NODE_ENV) 
                ? ['css-loader', 'less-loader'] 
                : ExtractTextPlugin.extract({ use: ['css-loader', 'less-loader'], fallback: "style-loader", publicPath: "../" }) 
            },
            { test: /\.css$/, use: /dev/.test(process.env.NODE_ENV) 
                ? ['style-loader', 'css-loader'] 
                : ExtractTextPlugin.extract({ use: ['css-loader'], fallback: "style-loader", publicPath: "../" }) 
            },
            { test: /data.*\.json$/, use: "url-loader?limit=1&name=data/[name].[ext]" },
            { test: /(comps|common).*\.json$/, use: "json-loader" },
            { test: /\.(png|jpg|gif|svg)$/, use: 'url-loader?limit=233&name=[path][name].[ext]' },
            { test: /\.(mp3)$/, use: 'url-loader?limit=1&name=audio/[name].[hash:6].[ext]' },
            { test: /\.(eot|ttf|woff)$/, use: 'url-loader?limit=233&name=fonts/[name].[hash:6].[ext]' },
            { test: /\.js$/, use: "babel-loader", exclude: /(node_modules)/, },
            { test: /\.vue$/, loader: 'vue-loader', options: require("./vue-loader-options") }
        ]
    },
    //解析模块请求的选项
    resolve: {
        alias: {
            images: path.resolve(__dirname, './src/images/'),
            data: path.resolve(__dirname, './src/data/'),
        },
        // 用于查找模块的目录
        modules: [`./src/common`, `./src/comps`, `./src/config`, `./src/directives`, 'node_modules/'],
        extensions: [".js", ".json"]
    },
    plugins: [
        new HtmlWebpackPlugin(/dev/.test(process.env.NODE_ENV)
            ? { template: 'index.html' } 
            : {template: 'index.html', filename: 'main.html'}),
        new webpack.DefinePlugin({ ENV: JSON.stringify(process.env.NODE_ENV) }),
        new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'public/vue-family.js' }),
        new webpack.optimize.CommonsChunkPlugin({ name: "manifest", minChunks: Infinity })
    ],
    devServer: {
        contentBase: path.join(__dirname, ""),
        inline: true,
        host: "0.0.0.0",
        port: 80,
        proxy: {
            '*': {
                target: "http://47.93.20.152:8360",
                changeOrigin: true,
                pathRewrite: {"^/static/main/" : ""}
            },
        }
    },
    performance: { hints: false },  //关闭性能提示
    devtool: 'source-map'
}

console.info(process.env.NODE_ENV)
if (/production/.test(process.env.NODE_ENV)) {
    del.sync("main/**");
    Config.devtool = ""
    Config.output.filename = 'js/[name]_[chunkhash:6].js'
    Config.output.publicPath = '/static/main/'
    Config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                drop_console: true,
                unused: false,
                side_effects: false,
            },
            comments: false,
        }),
        new CopyWebpackPlugin([
            { from: 'public/*', context: __dirname}
        ]),
        new ExtractTextPlugin({ filename: "css/[name].[contenthash:6].css" })
    )
}
module.exports = Config;



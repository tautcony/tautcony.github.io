const path = require("path");

const webpack = require("webpack");
const WebpackBar = require("webpackbar");
const extractTextPlugin = require("extract-text-webpack-plugin");

const banner = `TC Blog [hash] build at ${new Date().toISOString()} (https://tautcony.github.io/)
Copyright ${new Date().getFullYear()} TautCony
Licensed under Apache-2.0 (https://github.com/tautcony/tautcony.github.io/blob/master/LICENSE)`;

module.exports = {
    target: "web",
    mode: "production",
    entry: path.join(__dirname, "..", "js", "tcupdate"),
    output: {
        filename: "js/tcupdate.min.js",
        path: path.resolve(__dirname, ".."),
        devtoolModuleFilenameTemplate: "[absolute-resource-path]"
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: extractTextPlugin.extract({
                    use: [
                        'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: (loader) => [
                                require('autoprefixer')(),
                                require('cssnano')()
                              ]
                        }
                    },
                    'less-loader']
                })
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: "url-loader"
            },
            {
                test: /\.woff2?$/,
                loader: 'url-loader'
            },
            {
                test: /\.ttf$/,
                loader: 'url-loader'
            }
        ]
    },
    plugins: [
        new WebpackBar(),
        new extractTextPlugin('css/tcupdate.min.css'),
        new webpack.BannerPlugin(banner)],
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".less"]
    },
}
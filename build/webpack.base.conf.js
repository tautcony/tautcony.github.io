const path = require("path");

const webpack = require("webpack");
const WebpackBar = require("webpackbar");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const banner = `TC Blog [hash] build at ${new Date().toISOString()} (https://tautcony.github.io/)
Copyright ${new Date().getFullYear()} TautCony
Licensed under Apache-2.0 (https://github.com/tautcony/tautcony.github.io/blob/master/LICENSE)`;

module.exports = {
    target: "web",
    entry: path.join(__dirname, "..", "ts", "tc-blog"),
    output: {
        filename: "js/tc-blog.min.js",
        path: path.resolve(__dirname, ".."),
        devtoolModuleFilenameTemplate: "[absolute-resource-path]"
    },
    externals: {
        "pixi.js": "PIXI",
        "js-cookie": "Cookies",
        "geopattern": "GeoPattern"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                enforce: "pre",
                use: [
                    "source-map-loader",
                    {
                        loader: "tslint-loader",
                        options: {
                            typeCheck: true
                        },
                    },
                ],
            },
            {
                test: /.tsx?$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"]
                        }
                    },
                    "ts-loader"
                ],
                exclude: /node_modules/
            },
            {
                test: /\.(le|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "../",
                            hmr: process.env.NODE_ENV === "development",
                        },
                    },
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: (loader) => [
                                require("autoprefixer")(),
                                require("cssnano")()
                            ]
                        }
                    },
                    "less-loader"
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: "url-loader",
                options: {
                    limit: 10000
                }
            }
        ]
    },
    plugins: [
        new WebpackBar(),
        new MiniCssExtractPlugin({
            filename: "css/tc-blog.min.css"
        }),
        new webpack.BannerPlugin(banner)],
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".less", ".css"]
    },
}

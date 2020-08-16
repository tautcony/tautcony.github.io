const path = require("path");

const webpack = require("webpack");
const WebpackBar = require("webpackbar");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const banner = `TC Blog build at ${new Date().toISOString()} (https://tautcony.github.io/)
Copyright ${new Date().getFullYear()} TautCony
Licensed under Apache-2.0 (https://github.com/tautcony/tautcony.github.io/blob/master/LICENSE)`;

const babelConfig = {
    sourceType: "module",
    presets: [
        [
            "@babel/preset-env",
            {
                corejs: 3,
                useBuiltIns: "usage",
                modules: "commonjs",
            },
        ],
    ],
    plugins: [
        [
            "@babel/plugin-transform-runtime",
            {
                corejs: 3,
                useESModules: false,
            },
        ],
    ],
};

module.exports = {
    target: "web",
    entry: path.join(__dirname, "..", "ts", "tc-blog"),
    output: {
        filename: "js/tc-blog.min.js",
        path: path.resolve(__dirname, ".."),
        devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    },
    node: {
        Buffer: false,
    },
    externals: {
        "pixi.js": "PIXI",
        "js-cookie": "Cookies",
    },
    module: {
        rules: [
            {
                test: /.tsx?$/,
                include: path.resolve(__dirname, "..", "ts"),
                use: [
                    {
                        loader: "babel-loader?cacheDirectory",
                        options: babelConfig,
                    },
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true,
                        },
                    },
                ],
            },
            {
                test: /.js$/,
                use: [
                    {
                        loader: "babel-loader?cacheDirectory",
                        options: babelConfig,
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.(le|c)ss$/,
                include: path.resolve(__dirname, "..", "less"),
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "../",
                        },
                    },
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: (loader) => [
                                require("autoprefixer")(),
                                require("cssnano")({
                                    preset: ["default", {
                                        discardComments: {
                                            removeAll: true,
                                        },
                                    }],
                                }),
                            ],
                        },
                    },
                    "less-loader",
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 10000,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new WebpackBar(),
        new MiniCssExtractPlugin({
            filename: "css/tc-blog.min.css",
        }),
        new webpack.BannerPlugin(banner),
        new ForkTsCheckerWebpackPlugin({
            eslint: {
                enabled: true,
                files: ["ts/**/*.{ts,tsx,js,jsx}", "js/tcupdate.js"],
            },
            typescript: {
                memoryLimit: 4096,
            },
        }),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".less", ".css"],
    },
};

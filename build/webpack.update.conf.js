/* eslint-disable quote-props */
const path = require("path");

const webpack = require("webpack");
const WebpackBar = require("webpackbar");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

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
                bugfixes: true,
            },
        ],
        "@vue/babel-preset-jsx",
    ],
    plugins: [
        [
            "@babel/plugin-transform-runtime",
            {
                corejs: 3,
                useESModules: false,
            },
        ],
        "@vue/babel-plugin-jsx",
    ],
    cacheDirectory: true,
};

module.exports = {
    target: "web",
    mode: "production",
    entry: path.join(__dirname, "..", "js", "tcupdate"),
    output: {
        filename: "js/tcupdate.min.js",
        path: path.resolve(__dirname, ".."),
        devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    },
    externals: {
        vue: "Vue",
        axios: "axios",
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    output: {
                        // eslint-disable-next-line camelcase
                        ascii_only: true,
                    },
                },
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.(le|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "../",
                        },
                    },
                    "css-loader",
                    "postcss-loader",
                    "less-loader",
                ],
            },
            {
                test: /\.tsx?$/,
                include: path.resolve(__dirname, "..", "ts"),
                use: [
                    {
                        loader: "babel-loader",
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
                test: /\.js$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: babelConfig,
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024,
                    },
                },
            },
            {
                test: /\.woff2?$/,
                type: "asset",
            },
            {
                test: /\.ttf$/,
                type: "asset",
            },
        ],
    },
    plugins: [
        new WebpackBar(),
        new MiniCssExtractPlugin({
            filename: "css/tcupdate.min.css",
        }),
        new webpack.BannerPlugin(banner),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".less"],
    },
};

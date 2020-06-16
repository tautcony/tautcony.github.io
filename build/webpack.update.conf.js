const path = require("path");

const webpack = require("webpack");
const WebpackBar = require("webpackbar");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

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
    mode: "production",
    entry: path.join(__dirname, "..", "js", "tcupdate"),
    output: {
        filename: "js/tcupdate.min.js",
        path: path.resolve(__dirname, ".."),
        devtoolModuleFilenameTemplate: "[absolute-resource-path]",
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
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: "url-loader",
            },
            {
                test: /\.woff2?$/,
                loader: "url-loader",
            },
            {
                test: /\.ttf$/,
                loader: "url-loader",
            },
        ],
    },
    plugins: [
        new WebpackBar(),
        new MiniCssExtractPlugin({
            filename: "css/tcupdate.min.css",
        }),
        new webpack.BannerPlugin(banner),
        // new BundleAnalyzerPlugin(),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".less"],
    },
};

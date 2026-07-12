const path = require("path");

const webpack = require("webpack");
const WebpackBar = require("webpackbar");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

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
    cacheDirectory: true,
};

const root = path.resolve(__dirname, "..");

module.exports = {
    target: "browserslist",
    entry: {
        "tc-blog": path.join(root, "ts", "entries", "blog.ts"),
        page404: path.join(root, "ts", "entries", "page404.ts"),
    },
    output: {
        filename: "js/[name].min.js",
        path: root,
        devtoolModuleFilenameTemplate: "[absolute-resource-path]",
        clean: false,
    },
    externals: {
        animejs: "anime",
        "animejs/lib/anime.es": "anime",
        // THREE r56 is loaded as a classic script on the 404 page.
        three: "THREE",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: path.join(root, "ts"),
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
            // Legacy 404 vendor scripts: keep as-is, do not babel-minify-break them.
            {
                test: /js[\\/]404[\\/]libs[\\/].*\.js$/,
                type: "javascript/auto",
                sideEffects: true,
            },
            {
                test: /\.js$/,
                exclude: [
                    /node_modules/,
                    /js[\\/]404[\\/]/,
                ],
                use: [
                    {
                        loader: "babel-loader",
                        options: babelConfig,
                    },
                ],
            },
            {
                test: /\.(le|c)ss$/,
                include: [
                    path.join(root, "less"),
                    path.join(root, "css"),
                ],
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: path.join(root, "img", "generated"),
                        },
                    },
                    {
                        loader: "css-loader",
                        options: {
                            url: false,
                        },
                    },
                    "postcss-loader",
                    "less-loader",
                ],
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: path.join(root, "img", "generated"),
                        },
                    },
                    {
                        loader: "css-loader",
                        options: {
                            url: false,
                        },
                    },
                    "postcss-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                quietDeps: true,
                                silenceDeprecations: ["import", "mixed-decls", "global-builtin"],
                            },
                        },
                    },
                ],
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
        ],
    },
    plugins: [
        new WebpackBar(),
        new MiniCssExtractPlugin({
            filename: ({ chunk }) => {
                if (chunk && chunk.name === "page404") {
                    return "css/404.min.css";
                }
                return "css/[name].min.css";
            },
        }),
        new webpack.BannerPlugin(banner),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".less", ".css"],
    },
    performance: {
        maxAssetSize: 512 * 1024,
        maxEntrypointSize: 600 * 1024,
        hints: "warning",
    },
    optimization: {
        // Keep entries fully independent (no shared runtime chunk) for simple static hosting.
        runtimeChunk: false,
        splitChunks: false,
    },
};

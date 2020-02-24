const merge = require("webpack-merge");
const CompressionPlugin = require("compression-webpack-plugin");

const baseWebpackConfig = require("./webpack.base.conf");

module.exports = merge(baseWebpackConfig, {
    mode: "production",
    plugins: [
        new CompressionPlugin({
            test: [/\.js(\?.*)?$/i, /\.css(\?.*)?$/i],
            include: ["js", "css"],
            cache: true,
        }),
    ]
});

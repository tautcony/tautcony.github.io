const { merge } = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");

const baseWebpackConfig = require("./webpack.base.conf");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin({
    granularLoaderData: true,
});

module.exports = smp.wrap(merge(baseWebpackConfig, {
    mode: "production",
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            extractComments: false,
            terserOptions: {
                output: {
                    // eslint-disable-next-line camelcase
                    ascii_only: true,
                },
            },
        })],
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
    ],
}));

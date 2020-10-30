module.exports = (ctx) => ({
    plugins: [
        "postcss-preset-env",
        "autoprefixer",
        [
            "cssnano",
            {
                preset: "default"
            }
        ]
    ]
});

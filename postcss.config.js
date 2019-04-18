module.exports = (ctx) => ({
    plugins: {
        'autoprefixer': {
            browsers: 'last 5 version'
        },
        'cssnano': ctx.env === 'production' ? {} : false
    }
})

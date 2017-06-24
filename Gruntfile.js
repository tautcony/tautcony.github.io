module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
                ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
                ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                ' */\n',
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            main: {
                src: 'js/<%= pkg.name %>.js',
                dest: 'js/<%= pkg.name %>.min.js'
            }
        },
        less: {
            expanded: {
                options: {
                    paths: ["css"]
                },
                files: {
                    "css/<%= pkg.name %>.css": "less/<%= pkg.name %>.less",
                    "css/tcupdate.css": "less/tcupdate.less"
                }
            },
            minified: {
                options: {
                    paths: ["css"],
                    banner: '<%= banner %>',
                    compress: true
                },
                files: {
                    "css/<%= pkg.name %>.min.css": "less/<%= pkg.name %>.less",
                    "css/tcupdate.min.css": "less/tcupdate.less"
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyJS: true,
                    minifyCSS: true
                },
                files: [{
                    expand: true,
                    src: ['_site/**/*.html']
                }]
            }
        },
        watch: {
            scripts: {
                files: ['js/<%= pkg.name %>.js'],
                tasks: ['uglify'],
                options: {
                    spawn: false
                }
            },
            less: {
                files: ['less/*.less'],
                tasks: ['less'],
                options: {
                    spawn: false
                }
            },
            jekyll: {
                files: ['**/*', '!**/node_modules/**', '!**/_site/**'],
                tasks: ['jekyll'],
                options: {
                    spawn: false
                }
            }
        },
        jekyll: {
            build: {
                options: {
                    serve: false,
                    drafts: true,
                    incremental: true,
                    quiet: true
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 4000,
                    base: '_site'
                }
            }
        }
    });

    // Load the plugins.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-jekyll');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'less', 'jekyll', 'connect', 'watch']);

};

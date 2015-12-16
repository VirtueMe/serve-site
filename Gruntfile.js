// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    grunt.initConfig({
        // Project settings
        yeoman: {
            // Configurable
            app: 'src',
            dist: 'build'
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= yeoman.app %>/*.html'
                ]
            }
        },
        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
            // Change this to '0.0.0.0' to access the server from outside
                hostname: '<%= grunt.option("hostname") || "localhost" %>'
            },
            server: {
                proxies: [ {
                    context: '/js',
                    host: 'www.navnemerket.no',
                    port: 443,
                    https: true,
                    changeOrigin: true,
                    xforward: true
                }]
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '.tmp',
                        '<%= yeoman.app %>'
                    ],
                    middleware: function (connect, options) {
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }

                        var middlewares = [require('grunt-connect-proxy/lib/utils').proxyRequest];

                        options.base.forEach(function(base) {
                            middlewares.push(connect.static(require('path').resolve(base)));
                        });

                        return middlewares;
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    base: [
                        '.tmp',
                        'test',
                        '<%= yeoman.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    base: '<%= yeoman.dist %>'
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*',
                        'public_html',
                        '.sass-cache'
                    ]
                }]
            },
            server: '.tmp'
        }
    });


    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'configureProxies:server',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('build', function(target) {
        if (target === 'tmp') {
            return grunt.task.run([
                'clean:dist',
                'useminPrepare',
                'concurrent:dist',
                'autoprefixer',
                'compass:distTmp',
                'copy:distTmp',
                'copy:distProxy',
                'rev',
                'usemin'
            ]);
        }

        grunt.task.run([
            'clean:dist',
            'bowerInstall',
            'useminPrepare',
            'compass:dist',
            'imagemin',
            'svgmin',
            'autoprefixer',
            'concat',
            'ngAnnotate',
            'copy:dist',
            'cdnify',
            'uglify',
            'rev',
            'usemin',
            'htmlmin',
            'string-replace'
        ]);
    });

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('deploy', function (target) {
        grunt.task.run(['build', 'copy:html', 'rsync:' + target]);
    });
};

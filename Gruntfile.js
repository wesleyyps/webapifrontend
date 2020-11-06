module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        concat: {
            "js": {
                "src": [
                    "node_modules/angular/angular.min.js", 
                    "node_modules/angular-route/angular-route.min.js",
                    "node_modules/jquery/dist/jquery.slim.min.js",
                    "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
                    "js/app.min.js"
                ],
                "dest": "js/application.js"
            },
            "css": {
                "src": [
                    "node_modules/bootstrap/dist/css/bootstrap.min.css",
                    "css/app.min.css"
                ],
                "dest": "css/application.css"
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    "js/app.min.js": ["js/app.js"]
                }
            }
        },
        cssmin: {
            target: {
                files: [{
                    src: ['css/app.css'],
                    dest: 'css/app.min.css',
                    ext: '.min.css'
                }]
            }
        }
    });

    // Load required modules
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Task definitions
    grunt.registerTask('default', ['uglify', 'cssmin', 'concat']);
};
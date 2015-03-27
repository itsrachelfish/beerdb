module.exports = function(grunt)
{
    var options =
    {
        pkg: grunt.file.readJSON('package.json'),

        watch:
        {
            files: ['static/js/main.js'],
            tasks: ['browserify']
        },
        
        browserify:
        {
            options:
            {
                browserifyOptions: { debug: true },
            },

            dist:
            {
                files: { 'static/js/bundle.js': ['static/js/main.js'] }
            }
        }
    };
    
    grunt.initConfig(options);

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
};

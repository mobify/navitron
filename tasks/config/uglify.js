module.exports = function(grunt) {
    return {
        options: {
            banner: '/*! <%= pkg.name %> <%= pkg.version %> (<%= pkg.repository.url%>) */\n'
        },
        build: {
            files: {
                'dist/<%= pluginName %>.min.js': 'src/js/<%= pluginName %>.js'
            }
        }
    };
};

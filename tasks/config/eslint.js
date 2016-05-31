module.exports = function(grunt) {
    var targets = [
        'src/js/**/*.js'
    ];

    return {
        prod: {
            src: targets,
            options: {
                reset: true,
                config: require.resolve('mobify-code-style/javascript/.eslintrc-prod')
            }
        },
        dev: {
            src: targets,
            options: {
                reset: true,
                config: require.resolve('mobify-code-style/javascript/.eslintrc')
            }
        }
    };
};

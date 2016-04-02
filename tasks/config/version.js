module.exports = function(grunt) {
    return {
        dist: {
            options: {
                prefix: 'VERSION\\s*=\\s*[\\\'|"]'
            },
            src: ['dist/navitron.js', 'dist/navitron.min.js']
        },
        npm: {
            options: {
                prefix: '"version":\\s*"'
            },
            src: ['package.json']
        }
    };
};

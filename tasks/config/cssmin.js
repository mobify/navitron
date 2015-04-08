module.exports = function(grunt) {
    return {
        core: {
            src: 'dist/navitron.css',
            dest: 'dist/navitron.min.css'
        },
        style: {
            src: 'dist/navitron-theme.css',
            dest: 'dist/navitron-theme.min.css'
        }
    };
};
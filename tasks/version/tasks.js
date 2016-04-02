module.exports = function(grunt) {
    grunt.registerTask('version:all', ['version:dist', 'version:npm']);
    grunt.registerTask('version', ['version:all']);
};

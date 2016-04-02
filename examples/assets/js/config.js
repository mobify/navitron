require.config({
    baseUrl: '../',
    paths: {
        'text': 'bower_components/requirejs-text/text',
        '$': 'node_modules/jquery/dist/jquery.min',
        'velocity': 'bower_components/mobify-velocity/velocity',
        'plugin': 'bower_components/plugin/dist/plugin',
        'navitron': 'src/js/navitron'
    },
    'shim': {
        '$': {
            exports: '$'
        }
    }
});

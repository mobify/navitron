require.config({
    baseUrl: '../',
    paths: {
        'text': 'node_modules/text/text',
        '$': 'node_modules/jquery/dist/jquery.min',
        'velocity': 'node_modules/velocity-animate/velocity',
        'plugin': 'node_modules/plugin/dist/plugin',
        'navitron': 'src/js/navitron'
    },
    'shim': {
        '$': {
            exports: '$'
        }
    }
});


require(['sandbox-config'], function() {
    require([
        '$',
    
      'velocity',
        'plugin',
        'navitron'
    ],
        function(
            $
    ,
      velocity) {

            var dependencies = {};

            dependencies.$ = $;

            window.dependencies = dependencies;

            window.parent.postMessage('loaded', '*');
        });
});

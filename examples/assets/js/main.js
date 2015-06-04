require(['config'], function() {
    require([
        '$',
        'velocity',
        'navitron'
    ],
    function($) {
        $('#myNavitron').navitron({
            structure: true
        });
    });
});

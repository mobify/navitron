require(['config'], function() {
    require([
        '$',
        'velocity',
        'navitron'
    ],
    function($) {
        $('#myNavitron').navitron({
            shiftAmount: 200,
            duration: 500,
            easing: 'swing',
            fadeOpacityTo: 0.25,
            slideDirection: 'right',
            structure: true
        });
    });
});

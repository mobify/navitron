require(['config'], function() {
    require([
        '$',
        'velocity',
        'navitron'
    ],
    function($) {
        var $navitron = $('#myNavitron');

        $navitron.navitron({
            structure: false,
            shiftAmount: 100
        });

        var $panes = $navitron.find('.navitron__pane');

        $('body').on('click', '.js-back-to-first', function() {
            $navitron.navitron('showPane', $panes.first());
        });
    });
});

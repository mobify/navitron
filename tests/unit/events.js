define([
    'test-sandbox',
    'text!fixtures/navitron.html'
], function(testSandbox, fixture) {
    var Navitron;
    var $element;
    var $;
    var $nestedPane;

    describe('Navitron events', function() {
        var stringify = JSON.stringify;

        before(function() {
            JSON.stringify = function(obj) {
                var seen = [];

                return stringify(obj, function(key, val) {
                    if (typeof val === 'object') {
                        if (seen.indexOf(val) >= 0) { return; }
                        seen.push(val);
                    }
                    return val;
                });
            };
        });

        after(function() {
            JSON.stringify = stringify;
        });

        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Navitron = $.fn.navitron.Constructor;
                $element = $(fixture);

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        it('fires the onShow event before navitron pane slides in', function(done) {
            $element.navitron({
                onShow: function() {
                    done();
                }
            });

            var $nestedPane = $element.find('.navitron__nested .navitron__pane').first();

            $element.navitron('showPane', $nestedPane);
        });

        it('fires the onShown event after navitron pane is slid in', function(done) {
            $element.navitron({
                onShown: function() {
                    done();
                }
            });

            var $nestedPane = $element.find('.navitron__nested .navitron__pane').first();

            $element.navitron('showPane', $nestedPane);
        });
    });
});

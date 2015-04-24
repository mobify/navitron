define([
    'test-sandbox',
    'text!fixtures/navitron.html'
], function(testSandbox, fixture) {
    var Navitron;
    var $element;
    var $;
    var $nestedPane;

    describe('Navitron events', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Navitron = $.fn.navitron.Constructor;
                $element = $(fixture);
                $nestedPane = $element.find('.navitron__nested .navitron__pane').first();

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        it('fires the show event before navitron pane slides in', function(done) {
            console.info($element);

            $element.navitron({
                show: function() {
                    done();
                }
            });

            $element.navitron('showPane', $nestedPane);
        });
    });
});

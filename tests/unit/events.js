define([
    'test-sandbox',
    'text!fixtures/navitron.html'
], function(testSandbox, fixture) {
    var Navitron;
    var $element;
    var $;

    describe('Navitron events', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Navitron = $.fn.navitron.Constructor;
                $element = $(fixture);

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        it('fires the slide event when navitron slides', function(done) {
            $element.navitron({
                slide: function() {
                    done();
                }
            });

            $element.navitron('slideIn', 0);
        });
    });
});
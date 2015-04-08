define([
    'test-sandbox',
    'text!fixtures/navitron.html'
], function(testSandbox, fixture) {
    var Navitron;
    var $element;
    var $;

    describe('Navitron constructor', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Navitron = $.fn.navitron.Constructor;
                $element = $(fixture);

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        it('creates a navitron instance', function() {
            var navitron = new Navitron($element, {
            });

            expect(navitron).to.be.defined;
        });
    });
});
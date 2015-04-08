define([
    'test-sandbox',
    'text!fixtures/navitron.html'
], function(testSandbox, fixture) {
    var Navitron;
    var $element;
    var $;

    describe('Navitron plugin', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Navitron = $.fn.navitron.Constructor;
                $element = $(fixture);

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });
    });
});
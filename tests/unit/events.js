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

        it('fires the slide event when navitron slides in', function(done) {
            console.info($element);

            $element.navitron({
                slide: function() {
                    done();
                }
            });

            $element.navitron('showPane', '0.1.1');
        });

        it('fires the slide event when navitron slides out', function(done) {
            console.info($element);

            $element.navitron({
                slide: function() {
                    done();
                }
            });

            $element.navitron('_hidePane', '0.1.1');
        });

        it('fires the slid event when navitron is finished sliding in', function(done) {
            $element.navitron({
                slid: function() {
                    done();
                }
            });

            $element.navitron('showPane', '0.1.1');
        });

        it('fires the slid event when navitron is finished sliding out', function(done) {
            $element.navitron({
                slid: function() {
                    done();
                }
            });

            $element.navitron('_hidePane', '0.1.1');
        });

        it('fires the shift event when navitron shifts in', function(done) {
            $element.navitron({
                shift: function() {
                    done();
                }
            });

            $element.navitron('_showPreviousPane', '0.1.1');
        });

        it('fires the shift event when navitron shifts out', function(done) {
            $element.navitron({
                shift: function() {
                    done();
                }
            });

            $element.navitron('_hideCurrentPane', '0.1.1');
        });

        it('fires the shift event when navitron is shifted in', function(done) {
            $element.navitron({
                shifted: function() {
                    done();
                }
            });

            $element.navitron('_showPreviousPane', '0.1.1');
        });

        it('fires the shift event when navitron is shifted out', function(done) {
            $element.navitron({
                shifted: function() {
                    done();
                }
            });

            $element.navitron('_hideCurrentPane', '0.1.2');
        });
    });
});

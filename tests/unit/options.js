define([
    'test-sandbox',
    'text!fixtures/navitron.html'
], function(testSandbox, fixture) {
    var Navitron;
    var navitron;
    var $element;
    var $;

    describe('Navitron options', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Navitron = $.fn.navitron.Constructor;
                $element = $(fixture);

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        describe('creates default options when no options parameter not used', function() {
            beforeEach(function() {
                navitron = new Navitron($element, {});
            });

            it('correctly defines shiftAmount', function() {
                expect(navitron.options.shiftAmount).to.equal(Navitron.DEFAULTS.shiftAmount);
                expect(navitron.options.shiftAmount).to.be.a('number');
            });

            it('correctly defines duration', function() {
                expect(navitron.options.duration).to.equal(Navitron.DEFAULTS.duration);
                expect(navitron.options.duration).to.be.a('number');
            });

            it('correctly defines easing', function() {
                expect(navitron.options.easing).to.equal('swing');
                expect(navitron.options.easing).to.be.a('string');
            });

            it('correctly defines fadeOpacityTo', function() {
                expect(navitron.options.fadeOpacityTo).to.equal(Navitron.DEFAULTS.fadeOpacityTo);
                expect(navitron.options.fadeOpacityTo).to.be.a('number');
            });

            it('correctly defines mobileHA', function() {
                expect(navitron.options.mobileHA).to.equal(Navitron.DEFAULTS.mobileHA);
                expect(navitron.options.mobileHA).to.be.a('boolean');
            });
        });

        describe('throws for invalid options', function() {
            it('throws when fadeOpacityTo is not between 0 and 1.0', function() {
                expect(function() {
                    navitron = new Navitron($element, {
                        fadeOpacityTo: 2.0
                    });
                }).to.throw('The fadeOpacityTo value should be a value between 0 and 1.0');
            });
        });

        describe('creates custom options when options parameter used', function() {
            beforeEach(function() {
                navitron = new Navitron($element, {
                    shiftAmount: 40,
                    duration: 400,
                    easing: 'ease-in-out',
                    fadeOpacityTo: 0.75,
                    mobileHA: false
                });
            });

            it('correctly defines shiftAmount', function() {
                expect(navitron.options.shiftAmount).to.equal(40);
                expect(navitron.options.shiftAmount).to.be.a('number');
            });

            it('correctly defines duration', function() {
                expect(navitron.options.duration).to.equal(400);
                expect(navitron.options.duration).to.be.a('number');
            });

            it('correctly defines easing', function() {
                expect(navitron.options.easing).to.equal('ease-in-out');
                expect(navitron.options.easing).to.be.a('string');
            });

            it('correctly defines fadeOpacityTo', function() {
                expect(navitron.options.fadeOpacityTo).to.equal(0.75);
                expect(navitron.options.fadeOpacityTo).to.be.a('number');
            });

            it('correctly defines mobileHA', function() {
                expect(navitron.options.mobileHA).to.equal(false);
                expect(navitron.options.mobileHA).to.be.a('boolean');
            });
        });
    });
});

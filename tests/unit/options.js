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
                expect(navitron.options.easing).to.equal(Navitron.DEFAULTS.easing);
                expect(navitron.options.easing).to.be.a('string');
            });

            it('correctly defines fadeOpacityTo', function() {
                expect(navitron.options.fadeOpacityTo).to.equal(Navitron.DEFAULTS.fadeOpacityTo);
                expect(navitron.options.fadeOpacityTo).to.be.a('number');
            });

            it('correctly defines structure', function() {
                expect(navitron.options.structure).to.equal(Navitron.DEFAULTS.structure);
                expect(navitron.options.structure).to.be.a('boolean');
            });
        });

        describe('throws for invalid options', function() {
            it('throws when fadeOpacityTo is not between 0 and 1.0', function() {
                expect(function() {
                    navitron = new Navitron($element, {
                        fadeOpacityTo: 2.0
                    });
                }).to.throw('The fadeOpacityTo option value should be in the range from 0 to 1.0.');
            });
        });

        describe('creates custom options when options parameter used', function() {
            beforeEach(function() {
                navitron = new Navitron($element, {
                    shiftAmount: 40,
                    duration: 400,
                    easing: 'ease-in-out',
                    fadeOpacityTo: 0.75,
                    structure: true
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

            it('correctly defines custom structure', function() {
                expect(navitron.options.structure).to.equal(true);
                expect(navitron.options.structure).to.be.a('boolean');
            });
        });
    });
});

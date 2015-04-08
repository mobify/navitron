(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            '$',
            'plugin',
            'velocity'
        ], factory);
    } else {
        var framework = window.Zepto || window.jQuery;
        factory(framework, window.Plugin, Velocity);
    }
}(function($, Plugin, Velocity) {
    var selectors = {
        PANE: '.navitron__pane',
        NESTED_PANE: '.navitron__nested > .navitron__pane',
        ITEM: '.navitron__item',
        NEXT_PANE: '.navitron__next-pane',
        PREV_PANE: '.navitron__prev-pane'
    };

    function Navitron(element, options) {
        Navitron.__super__.call(this, element, options, Navitron.DEFAULTS);
    }

    Navitron.VERSION = '0.0.1';

    Navitron.DEFAULTS = {
        shiftAmount: 20,
        duration: 200,
        easing: 'swing',
        fadeOpacityTo: 0.25,
        mobileHA: true
    };

    Plugin.create('navitron', Navitron, {
        _init: function(element) {
            this.$navitron = $(element);

            this._addAccessibility();

            this._bindEvents();
        },

        destroy: function() {
            this.$element.removeData(this.name);
        },

        /**
         * Ensure Navitron markup gets accessibility attributes
         *
         * [Reference] ARIA Treeview with aria-owns - http://oaa-accessibility.org/example/42/
         */
        _addAccessibility: function() {
            this.$navitron.attr('role', 'tree');

            this.$navitron.find(selectors.PANE)
                .attr('aria-hidden', 'false');

            this.$navitron.find(selectors.NESTED_PANE).each(function(idx, el) {
                var $el = $(el);
                var levelId = $el.data('level-id');

                // Prefixing ID with 'Navitron_' to ensure we don't set a duplicate client ID accidentally
                // TODO: What if the navitron pane has an ID already? How do we handle that?
                $el
                    .attr('role', 'group')
                    .attr('aria-hidden', 'true')
                    .attr('id', 'Navitron_' + levelId);
            });

            this.$navitron.find(selectors.ITEM)
                .attr('role', 'treeitem');

            this.$navitron.find(selectors.NEXT_PANE).each(function(idx, el) {
                var $el = $(el);
                var targetId = $el.data('target-level');

                $el
                    .attr('aria-expanded', 'false')
                    .attr('aria-owns', 'Navitron_' + targetId);
            });
        },

        _bindEvents: function() {
            var plugin = this;

            /**
             * Drilling down the menu
             */
            this.$navitron.on('click', selectors.NEXT_PANE, function() {
                var $button = $(this);
                var targetPaneId = $button.data('target-level');
                var currentPaneId = $button.data('current-level');
                var $targetMenu = plugin._getTarget(targetPaneId);

                // We don't want to shift/slide anything if we're clicking on an anchor
                // or the target pane does not exist
                if ($button.is('a') || $button.has('a').length > 0 || $targetMenu.length < 1) {
                    if ($targetMenu.length < 1) {
                        console.error('Target pane with ID: ' + targetPaneId + ' does not exist!');
                    }

                    return;
                }

                // Slide in next level
                plugin.slideIn(targetPaneId);

                // Shift away current Level
                plugin.shiftOut(currentPaneId, $button);
            });

            /**
             * Drilling up the menu
             */
            this.$navitron.on('click', selectors.PREV_PANE, function() {
                var $button = $(this);
                var targetPaneId = $button.data('target-level');
                var currentPaneId = $button.data('current-level');

                // Slide out current level
                plugin.slideOut(currentPaneId);

                // Shift in current Level
                plugin.shiftIn(targetPaneId, currentPaneId);
            });
        },

        slideIn: function(targetPaneId) {
            if (targetPaneId === undefined) {
                return;
            }

            var $targetMenu = this._getTarget(targetPaneId);

            Velocity.animate(
                $targetMenu,
                {
                    translateX: ['-100%', 0]
                },
                {
                    display: 'block',
                    easing: this.options.easing,
                    duration: this.options.duration,
                    mobileHA: this.options.mobileHA,
                    begin: function() {
                        // Setting z-index to make sure pane sliding in will always be on top
                        // of pane that's being shifted out
                        $targetMenu.css({
                            zIndex: 2
                        });
                    },
                    complete: function() {
                        $targetMenu.attr('aria-hidden', 'false');
                        $targetMenu.focus();
                    }
                }
            );
        },

        shiftOut: function(currentPaneId, $button) {
            if (currentPaneId === undefined) {
                return;
            }

            var $shiftMenu = this._getTarget(currentPaneId);
            var translateValue = this._getTranslateX($shiftMenu);

            Velocity.animate(
                $shiftMenu,
                {
                    translateX: [translateValue - this.options.shiftAmount + '%', translateValue + '%'],
                    opacity: [this.options.fadeOpacityTo, 1]
                },
                {
                    display: 'none',
                    easing: this.options.easing,
                    duration: this.options.duration,
                    mobileHA: this.options.mobileHA,
                    begin: function() {
                        // Setting z-index to make sure pane shifting out will always be below
                        // the pane that's being slided in
                        $shiftMenu.css({
                            zIndex: 1
                        });
                    },
                    complete: function() {
                        $shiftMenu.attr('aria-hidden', 'true');
                        $button.attr('aria-expanded', 'true');
                    }
                }
            );
        },

        slideOut: function(currentPaneId) {
            if (currentPaneId === undefined) {
                return;
            }

            var $currentMenu = this._getTarget(currentPaneId);

            Velocity.animate(
                $currentMenu,
                {
                    translateX: [0, '-100%']
                },
                {
                    display: 'none',
                    easing: this.options.easing,
                    duration: this.options.duration,
                    mobileHA: this.options.mobileHA,
                    begin: function() {
                        // Setting z-index to make sure pane shifting out will always be above
                        // the pane that's being shifted back in
                        $currentMenu.css({
                            zIndex: 2
                        });
                    },
                    complete: function() {
                        $currentMenu.attr('aria-hidden', 'true');
                    }
                }
            );
        },

        shiftIn: function(targetPaneId, buttonTargetId) {
            if (targetPaneId === undefined) {
                return;
            }

            var plugin = this;

            var $shiftMenu = this._getTarget(targetPaneId);
            var translateValue = this._getTranslateX($shiftMenu);

            Velocity.animate(
                $shiftMenu,
                {
                    translateX: [translateValue + this.options.shiftAmount + '%', translateValue + '%'],
                    opacity: [1, this.options.fadeOpacityTo]
                },
                {
                    display: 'block',
                    easing: this.options.easing,
                    duration: this.options.duration,
                    mobileHA: this.options.mobileHA,
                    begin: function() {
                        // Setting z-index to make sure pane shifting in will always be below
                        // of pane that's being slided out
                        $shiftMenu.css({
                            zIndex: 1
                        });
                    },
                    complete: function() {
                        $shiftMenu.attr('aria-hidden', 'false');
                        $shiftMenu.find(selectors.NEXT_PANE + '[data-target-level="' + buttonTargetId + '"]')
                            .attr('aria-expanded', 'false');
                    }
                }
            );
        },

        _getTarget: function(levelId) {
            return this.$navitron.find(selectors.PANE + '[data-level-id="' + levelId + '"]');
        },

        _getTranslateX: function($element) {
            return parseFloat(Velocity.CSS.getPropertyValue($element[0], 'translateX'));
        }
    });

    $('[data-navitron]').navitron();

    return $;
}));

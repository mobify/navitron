(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            '$',
            'plugin',
            'velocity'
        ], factory);
    } else {
        var framework = window.Zepto || window.jQuery;
        factory(framework, window.Plugin, window.Velocity);
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

    Navitron.VERSION = '0';

    Navitron.DEFAULTS = {
        shiftAmount: 20,
        duration: 200,
        easing: 'swing',
        fadeOpacityTo: 0.25,
        mobileHA: true,
        shift: $.noop,
        shifted: $.noop,
        slide: $.noop,
        slid: $.noop
    };

    Plugin.create('navitron', Navitron, {
        _init: function(element) {
            this.$navitron = $(element);

            this._validateOptions();

            this._addAccessibility();

            this._setAnimationDefaults();

            this._bindEvents();
        },

        destroy: function() {
            this.$navitron.removeData(this.name);
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

        _validateOptions: function() {
            if (this.options.fadeOpacityTo < 0 || this.options.fadeOpacityTo > 1) {
                throw new Error('The fadeOpacityTo value should be in the range from 0 to 1.0.');
            }
        },

        _setAnimationDefaults: function() {
            this.animationDefaults = {
                easing: this.options.easing,
                duration: this.options.duration,
                mobileHA: this.options.mobileHA
            };
        },

        _bindEvents: function() {
            var plugin = this;

            /**
             * Drilling down the menu
             */
            this.$navitron.on('click', selectors.NEXT_PANE, function() {
                var $button = $(this);
                var buttonProperties = plugin._getButtonLevelData($button);
                var $targetMenu = plugin._getTarget(buttonProperties.targetPaneId);

                // We don't want to shift/slide anything if we're clicking on an anchor
                // or the target pane does not exist
                if ($button.is('a') || $button.has('a').length || !$targetMenu.length) {
                    if (!$targetMenu.length) {
                        throw new Error('Target pane with ID: ' + buttonProperties.targetPaneId + ' does not exist!');
                    }

                    return;
                }

                // Slide in next level
                plugin.slideIn(buttonProperties.targetPaneId);

                // Shift away current Level
                plugin.shiftOut(buttonProperties.currentPaneId, $button);
            });

            /**
             * Drilling up the menu
             */
            this.$navitron.on('click', selectors.PREV_PANE, function() {
                var $button = $(this);
                var buttonProperties = plugin._getButtonLevelData($button);

                // Slide out current level
                plugin.slideOut(buttonProperties.currentPaneId);

                // Shift in current Level
                plugin.shiftIn(buttonProperties.targetPaneId, buttonProperties.currentPaneId);
            });
        },

        slideIn: function(targetPaneId) {
            if (!targetPaneId) {
                return;
            }

            var plugin = this;
            var $targetMenu = this._getTarget(targetPaneId);

            Velocity.animate(
                $targetMenu,
                {
                    translateX: ['-100%', 0]
                },
                $.extend(true, {}, this.animationDefaults, {
                    display: 'block',
                    begin: function() {
                        plugin._trigger('slide');

                        // Setting z-index to make sure pane sliding in will always be on top
                        // of pane that's being shifted out
                        $targetMenu.css({
                            zIndex: 2
                        });
                    },
                    complete: function() {
                        $targetMenu.attr('aria-hidden', 'false');
                        $targetMenu.focus();

                        plugin._trigger('slid');
                    }
                })
            );
        },

        slideOut: function(currentPaneId) {
            if (!currentPaneId) {
                return;
            }

            var plugin = this;
            var $currentMenu = this._getTarget(currentPaneId);

            Velocity.animate(
                $currentMenu,
                {
                    translateX: [0, '-100%']
                },
                $.extend(true, {}, this.animationDefaults, {
                    display: 'none',
                    begin: function() {
                        plugin._trigger('slide');

                        // Setting z-index to make sure pane shifting out will always be above
                        // the pane that's being shifted back in
                        $currentMenu.css({
                            zIndex: 2
                        });
                    },
                    complete: function() {
                        $currentMenu.attr('aria-hidden', 'true');

                        plugin._trigger('slid');
                    }
                })
            );
        },

        shiftIn: function(targetPaneId, buttonTargetId) {
            if (!targetPaneId) {
                return;
            }

            var plugin = this;
            var $shiftMenu = this._getTarget(targetPaneId);
            var translateValue = this._getTranslateX($shiftMenu);

            Velocity.animate(
                $shiftMenu,
                {
                    translateX: [(translateValue + this.options.shiftAmount) + '%', translateValue + '%'],
                    opacity: [1, this.options.fadeOpacityTo]
                },
                $.extend(true, {}, this.animationDefaults, {
                    display: 'block',
                    begin: function() {
                        plugin._trigger('shift');

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

                        plugin._trigger('shifted');
                    }
                })
            );
        },

        shiftOut: function(currentPaneId, $button) {
            if (!currentPaneId) {
                return;
            }

            var plugin = this;
            var $shiftMenu = this._getTarget(currentPaneId);
            var translateValue = this._getTranslateX($shiftMenu);

            Velocity.animate(
                $shiftMenu,
                {
                    translateX: [(translateValue - this.options.shiftAmount) + '%', translateValue + '%'],
                    opacity: [this.options.fadeOpacityTo, 1]
                },
                $.extend(true, {}, this.animationDefaults, {
                    display: 'none',
                    begin: function() {
                        plugin._trigger('shift');

                        // Setting z-index to make sure pane shifting out will always be below
                        // the pane that's being slided in
                        $shiftMenu.css({
                            zIndex: 1
                        });
                    },
                    complete: function() {
                        $shiftMenu.attr('aria-hidden', 'true');
                        $button.attr('aria-expanded', 'true');

                        plugin._trigger('shifted');
                    }
                })
            );
        },

        _getTarget: function(levelId) {
            return this.$navitron.find(selectors.PANE + '[data-level-id="' + levelId + '"]');
        },

        _getTranslateX: function($element) {
            return parseFloat(Velocity.CSS.getPropertyValue($element[0], 'translateX'));
        },

        _getButtonLevelData: function($button) {
            return {
                targetPaneId: $button.data('target-level'),
                currentPaneId: $button.data('current-level')
            };
        }
    });

    $('[data-navitron]').navitron();

    return $;
}));

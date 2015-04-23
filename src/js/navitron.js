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
        currentPane: '0',
        mobileHA: true,
        shift: $.noop,
        shifted: $.noop,
        slide: $.noop,
        slid: $.noop
    };

    Plugin.create('navitron', Navitron, {
        _init: function(element) {
            this.$navitron = $(element);

            this.$currentPane = this._getTargetPane(this.options.currentPane);

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
                var levelData = $button.data();
                var $targetPane = plugin._getTargetPane(levelData.targetPane);

                // We don't want to shift/slide anything if we're clicking on an anchor
                // or the target pane does not exist
                if ($button.is('a') || $button.has('a').length || !$targetPane.length) {
                    if (!$targetPane.length) {
                        throw new Error('Target pane with ID: ' + levelData.targetPane + ' does not exist!');
                    }

                    return;
                }

                // Slide in next level
                plugin.showPane($targetPane);

                $button.attr('aria-expanded', 'true');
            });

            /**
             * Drilling up the menu
             */
            this.$navitron.on('click', selectors.PREV_PANE, function() {
                var $button = $(this);

                // Slide out current level
                plugin._hidePane(this.$currentPane, $button);
            });
        },

        showPane: function($pane) {
            if (!$pane.length) {
                return;
            }

            var plugin = this;

            Velocity.animate(
                $pane,
                {
                    translateX: ['-100%', 0]
                },
                $.extend(true, {}, this.animationDefaults, {
                    display: 'block',
                    begin: function() {
                        plugin._trigger('slide');

                        // Setting z-index to make sure pane sliding in will always be on top
                        // of pane that's being shifted out
                        $pane.css({
                            zIndex: 2
                        });
                    },
                    complete: function() {
                        $pane.attr('aria-hidden', 'false');
                        $pane.focus();

                        plugin._trigger('slid');
                    }
                })
            );

            plugin._hideCurrentPane();
        },

        _hideCurrentPane: function() {
            var plugin = this;
            var $shiftMenu = this.$currentPane;
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

                        plugin._trigger('shifted');
                    }
                })
            );
        },

        _hidePane: function($pane, $button) {
            var plugin = this;

            Velocity.animate(
                $pane,
                {
                    translateX: [0, '-100%']
                },
                $.extend(true, {}, this.animationDefaults, {
                    display: 'none',
                    begin: function() {
                        plugin._trigger('slide');

                        // Setting z-index to make sure pane shifting out will always be above
                        // the pane that's being shifted back in
                        $pane.css({
                            zIndex: 2
                        });
                    },
                    complete: function() {
                        $pane.attr('aria-hidden', 'true');

                        plugin._trigger('slid');
                    }
                })
            );

            // Shift in current Level
            plugin._showPreviousPane($button);
        },

        _showPreviousPane: function($button) {
            var plugin = this;
            var buttonProperties = $button.data();
            var $targetPane = this._getTargetPane(buttonProperties.targetPane);
            var translateValue = this._getTranslateX($targetPane);

            Velocity.animate(
                $targetPane,
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
                        $targetPane.css({
                            zIndex: 1
                        });
                    },
                    complete: function() {
                        $targetPane.attr('aria-hidden', 'false');
                        $targetPane.find(selectors.NEXT_PANE + '[data-target-pane="' + buttonProperties.currentPane + '"]')
                            .attr('aria-expanded', 'false');

                        plugin._trigger('shifted');
                    }
                })
            );
        },

        _getTargetPane: function(pane) {
            return this.$navitron.find(selectors.PANE + '[data-level="' + pane + '"]');
        },

        _getTranslateX: function($element) {
            return parseFloat(Velocity.CSS.getPropertyValue($element[0], 'translateX'));
        }
    });

    $('[data-navitron]').navitron();

    return $;
}));

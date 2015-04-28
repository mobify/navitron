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

    Navitron.VERSION = '0.0.1';

    Navitron.DEFAULTS = {
        shiftAmount: 20,
        duration: 200,
        easing: 'swing',
        fadeOpacityTo: 0.25,
        currentPane: '0',
        mobileHA: true,
        show: $.noop
    };

    Plugin.create('navitron', Navitron, {
        _init: function(element) {

            this.$original = $(element);

            this._validateOptions();

            this._labelTree();

            this._build();

            this.$currentPane = this._getTargetPane(this.options.currentPane);

            this._addAccessibility();

            this._setAnimationDefaults();

            this._bindEvents();
        },

        destroy: function() {
            this.$navitron.removeData(this.name);
        },

        _labelTree: function() {
            var selector = '> li > ul';
            var $topLevel = this.$original.children('ul');

            $topLevel.attr('data-level', '0');

            while (true) {
                var $children = $topLevel.find(selector);

                if ($children.length) {

                    $children.each(function (index, item) {

                        var $child = $(item);
                        // Grabbing ul parent
                        var $parent = $child.parents('ul').first();

                        if ($parent.length) {
                            $child.attr('data-level', $parent.attr('data-level') + '.' + index);
                        }
                    }); // jshint ignore:line

                    selector += selector;
                } else {
                    break;
                }
            }
        },

        _build: function() {
            var plugin = this;

            var $navitron = this.$original.addClass('navitron');
            var $nestedContainer = $('<div />').addClass('navitron__nested');
            var $pane = $('<div />').addClass('navitron__pane');
            var $button = $('<button type="button" />').addClass('navitron__item');
            var $topLevelList = this.$original.children('ul');
            var $listItems = $topLevelList.children('li');

            var _buildNestedLevels = function ($listItems) {

                $listItems.each(function (index, item) {
                    var $item = $(item);
                    var $nestedList = $item.children('ul').remove();

                    // If there's nested <ul> run _buildNestedLevels function again
                    if ($nestedList.length) {
                        // Get level data
                        var level = $nestedList.data('level');
                        // var level = '';
                        var targetLevel = plugin._getParentLevel(level);

                        // Clean up markup
                        $nestedList.removeAttr('data-level');

                        var $prevButton = $button.clone()
                                .text('Back')
                                .addClass('navitron__prev-pane')
                                .attr('data-target-pane', targetLevel);

                        $prevButton.wrap('<li />').parent().prependTo($nestedList);

                        // Build next level button
                        var text = $item.text().trim();

                        $item.html(
                            $button.clone()
                                .text(text)
                                .attr('data-target-pane', level)
                                .addClass('navitron__next-pane')
                        );

                        // Put nested levels into nested container
                        $nestedList
                            .wrap($pane.clone())
                            .parent()
                            .attr('data-level', level)
                            .appendTo($nestedContainer);

                        // Run again for nested level
                        var $listItems = $nestedList.children('li');

                        if ($listItems.length) {
                            _buildNestedLevels($listItems);
                        }
                    }
                });
            };

            // Get top level data
            var topLevel = $topLevelList.attr('data-level');
            $topLevelList.removeAttr('data-level'); // Remove the data-level set by label tree function

            // Build markup
            this.$original.children('ul').wrap($pane.clone().attr('data-level', topLevel)); // Wrap top level <ul> in a pane <div>
            $nestedContainer.appendTo($navitron); // Add nested container that will hold all nested level panes
            _buildNestedLevels($listItems); // Build nested levels

            // Redefine Navitron to the new wrapper we created
            this.$navitron = $navitron;

            this.$navitron.removeAttr('hidden');
        },

        _getParentLevel: function (level) {
            var levelParts = level.split('.');

            // Pop Off the current id
            levelParts.pop();

            return levelParts.join('.');
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
                var levelId = $el.data('level');

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
                var targetId = $el.data('target-pane');

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
                plugin._hidePane(plugin.$currentPane, $button);
            });
        },

        showPane: function($pane) {
            if (!$pane.length) {
                throw new Error('The showPane method requires a pane element to show');
            }

            var plugin = this;
            var $shiftMenu = this.$currentPane;
            var translateValue = this._getTranslateX($shiftMenu);

            Velocity
                .animate(
                    $pane,
                    { translateX: ['-100%', 0] },
                    $.extend(true, {}, this.animationDefaults, {
                        display: 'block',
                        begin: function() {
                            plugin._trigger('show');

                            // Setting z-index to make sure pane sliding in will always be on top
                            // of pane that's being shifted out
                            $pane.css({ zIndex: 2 });
                        },
                        complete: function() {
                            $pane.attr('aria-hidden', 'false').focus();

                            plugin._trigger('shown');
                        }
                    })
                );

            Velocity
                .animate(
                    $shiftMenu,
                    {
                        translateX: [(translateValue - this.options.shiftAmount) + '%', translateValue + '%'],
                        opacity: [this.options.fadeOpacityTo, 1]
                    },
                    $.extend(true, {}, this.animationDefaults, {
                        display: 'none',
                        begin: function() {
                            // Setting z-index to make sure pane shifting out will always be below
                            // the pane that's being slided in
                            $shiftMenu.css({ zIndex: 1 });
                        },
                        complete: function() {
                            $shiftMenu.attr('aria-hidden', 'true');

                            plugin._setCurrentPane($pane);
                        }
                    }),
                    {queue: false}
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
                        // Setting z-index to make sure pane shifting out will always be above
                        // the pane that's being shifted back in
                        $pane.css({
                            zIndex: 2
                        });
                    },
                    complete: function() {
                        $pane.attr('aria-hidden', 'true');
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
                        // Setting z-index to make sure pane shifting in will always be below
                        // of pane that's being slided out
                        $targetPane.css({
                            zIndex: 1
                        });
                    },
                    complete: function() {
                        $targetPane
                            .attr('aria-hidden', 'false')
                            .find(selectors.NEXT_PANE + '[data-target-pane="' + buttonProperties.currentPane + '"]')
                            .attr('aria-expanded', 'false');

                        plugin._setCurrentPane($targetPane);
                    }
                })
            );
        },

        _setCurrentPane: function ($pane) {
            this.$currentPane = $pane;
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

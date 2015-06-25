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
        PREV_PANE: '.navitron__prev-pane',
        CONTENT: '.navitron__content'
    };

    var cssClasses = {
        ANIMATING: 'navitron--is-animating'
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
        structure: false,
        onShow: $.noop,
        onShown: $.noop
    };

    Plugin.create('navitron', Navitron, {
        _init: function(element) {

            this.$original = $(element);

            this._validateOptions();

            this._build();

            this.$currentPane = this._getTargetPane(0);

            this._setAnimationDefaults();

            this.$listItems = this.$original.find(selectors.ITEM);

            this.$visibleItems = this.$listItems.filter(':visible');

            this._bindEvents();
        },

        destroy: function() {
            this.$navitron.removeData(this.name);
        },

        _build: function() {
            var plugin = this;

            var $navitron = this.$original.addClass('navitron');
            var $nestedContainer = $('<div />').addClass('navitron__nested');
            var $pane = $('<div />').addClass('navitron__pane');
            var $wrapper = $('<div />').addClass('navitron__wrapper');
            var $button = $('<button type="button" />').addClass('navitron__item');
            var $topLevelList = $navitron.children('ul');
            var $listItems = $topLevelList.children('li');

            // Decorate nested list with Level IDs
            plugin._setLevelData();

            // Get top level data
            var topLevel = $topLevelList.attr('data-level');
            $topLevelList.removeAttr('data-level'); // Remove the data-level set by label tree function

            // Build top level markup
            $navitron.children('ul')
                .addClass('navitron__content')
                .wrap($wrapper.clone())
                .parent()
                .wrap(
                    $pane.clone()
                        .attr('data-level', topLevel)
                );

            // Custom markup for top level
            if (plugin.options.structure) {
                plugin._includeCustomMarkup($topLevelList);
            }

            // Add nested container that will hold all nested level panes
            $nestedContainer.appendTo($navitron);

            // Build nested levels
            this._buildNestedLevels($listItems, $nestedContainer);

            // Item class for ARIA accessibility decorate function
            $navitron.find('button, a').addClass('navitron__item');

            // Redefine Navitron to the new wrapper we created
            this.$navitron = $navitron;

            // Set ARIA accessibility attributes
            this._addAccessibility();

            // Reveal navitron now that it has finished building
            this.$navitron.removeAttr('hidden');
        },

        _buildNestedLevels: function ($listItems, $nestedContainer) {
            var plugin = this;

            var $pane = $('<div />').addClass('navitron__pane');
            var $wrapper = $('<div />').addClass('navitron__wrapper');
            var $button = $('<button type="button" />').addClass('navitron__item');

            $listItems.each(function (index, item) {
                var $item = $(item);
                var $nestedList = $item.children('ul').addClass('navitron__content').remove();

                // If there's nested <ul> run _buildNestedLevels function again
                if ($nestedList.length) {
                    // Get level data
                    var level = $nestedList.data('level');
                    var targetLevel = plugin._getParentLevel(level);

                    // Clean up markup
                    $nestedList.removeAttr('data-level');

                    // Put nested levels into nested container
                    $nestedList
                        .wrap($wrapper.clone())
                        .parent()
                        .wrap($pane.clone())
                        .parent()
                        .attr('data-level', level)
                        .appendTo($nestedContainer);

                    // Custom markup
                    if (plugin.options.structure) {
                        plugin._includeCustomMarkup($nestedList, level, targetLevel);

                        // Next level button
                        if ($item.find('.navitron__next-pane').length) {
                            $item.find('.navitron__next-pane')
                                .addClass('navitron__item')
                                .attr('data-target-pane', level);
                        } else {
                            throw new Error('Custom structure requires element with class "navitron__next-pane" for nested lists');
                        }
                    } else {
                        var $prevButton = $button.clone()
                                .text('Back')
                                .addClass('navitron__prev-pane')
                                .attr('data-target-pane', targetLevel)
                                .attr('data-current-pane', level);

                        $prevButton.wrap('<div class="navitron__header" />').parent().insertBefore($nestedList);

                        // Build next level button
                        var text = $item.text().trim();

                        $item.html(
                            $button.clone()
                                .text(text)
                                .attr('data-target-pane', level)
                                .addClass('navitron__next-pane')
                        );
                    }

                    // Run again for nested level
                    var $listItems = $nestedList.children('li');

                    if ($listItems.length) {
                        plugin._buildNestedLevels($listItems, $nestedContainer);
                    }
                }
            });
        },

        _includeCustomMarkup: function ($list, level, targetLevel) {
            var $header = $list.children('.navitron__header').remove();
            var $footer = $list.children('.navitron__footer').remove();

            if ($header.length) {
                var $headerContainer = this._buildHeaderFooter($header, targetLevel, level);

                $headerContainer.insertBefore($list);
            }

            if ($footer.length) {
                var $footerContainer = this._buildHeaderFooter($footer, targetLevel, level);

                $footerContainer.insertAfter($list);
            }

            return $list;
        },

        _buildHeaderFooter: function ($element, targetLevel, level) {
            var attrName;
            var attrValue;
            var attrs = '';
            var attributeLength = $element[0].attributes.length;
            var $backButton = $element.find('.navitron__prev-pane');

            // Perserve original attributes (classes, ID, etc)
            for (var i = 0; i < attributeLength; i++) {
                attrName = $element[0].attributes[i].nodeName;
                attrValue = $element[0].attributes[i].nodeValue;

                attrs += attrName + '="' + attrValue + '" ';
            }

            var $newContainer = $('<div ' + attrs + ' />');

            if ($backButton.length) {
                $backButton
                    .addClass('navitron__item')
                    .attr('data-target-pane', targetLevel)
                    .attr('data-current-pane', level);
            }

            $element.contents().appendTo($newContainer);

            return $newContainer;
        },

        _getParentLevel: function (level) {
            var levelParts = level.toString().split('.');

            // Pop Off the current id
            levelParts.pop();

            return levelParts.join('.');
        },

        _setLevelData: function() {
            var $topLevel = this.$original.children('ul');
            var selector = '> li > ul ';
            var categoryId;

            // Set root data-level to 0
            $topLevel.attr('data-level', '0');

            while (true) {
                var $nestedLists = $topLevel.find(selector);
                var refreshIndex = 0;

                if ($nestedLists.length) {
                    $nestedLists.each(function (index, item) {
                        var $nestedList = $(item);

                        // Grabbing ul parent
                        var $parent = $nestedList.parents('ul').first();
                        var dataLevel = $parent.data('level');

                        // Check if we have moved onto a different Category
                        // We 'reset' the index so nested items always start at 0 and onwards
                        var level = parseInt(dataLevel.toString().split('.').pop());
                        if (level !== categoryId) {
                            categoryId = level;
                            refreshIndex = 0;
                        }

                        // Set data-level to each nested list
                        $nestedList.attr('data-level', dataLevel + '.' + refreshIndex);

                        refreshIndex++;
                    }); // jshint ignore:line

                    selector += '> li > ul';
                } else {
                    break;
                }
            }
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
                mobileHA: true
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

                // ARIA Accessibility
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

            /**
             * Keyboard controls to navigate through items and menus
             */
            this.$listItems.on('keydown', function(e) {
                return plugin._handleKeyDown($(this), e);
            });
        },

        _handleKeyDown: function($item, e) {
            var $focusedItem = this.$visibleItems.filter(':focus');
            var focusableItemsCount = this.$visibleItems.length - 1; // Slight tweak of the number to match array indexing
            var itemIndex = this.$visibleItems.index($focusedItem);

            // Left arrow: Drill up menu
            if (e.which === 37) {
                var $backButton = $item.parents(selectors.PANE).find(selectors.PREV_PANE);

                if ($backButton.length) {
                    $backButton.trigger('click');
                }

                e.preventDefault();
            }

            // Right arrow: Drill down menu item OR click on menu item link
            if (e.which === 39 || e.which === 32) {
                $item.trigger('click');
                e.preventDefault();
            }

            // Up arrow: Previous menu item
            if (e.which === 38 && itemIndex > 0) {
                this.$visibleItems[itemIndex - 1].focus();
                e.preventDefault();
            }

            // Down arrow: Next menu item
            if (e.which === 40 && focusableItemsCount > itemIndex) {
                this.$visibleItems[itemIndex + 1].focus();
                e.preventDefault();
            }
        },

        showPane: function($pane) {
            if (!$pane.length) {
                throw new Error('The showPane method requires a pane element to show');
            }

            // CSOPS-1332: This is to enforce only one pane to animate at a time
            if (this.$navitron.hasClass(cssClasses.ANIMATING)) {
                return;
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
                            // CSOPS-1332: This is to enforce only one pane to animate at a time
                            plugin.$navitron.addClass(cssClasses.ANIMATING);

                            plugin._trigger('onShow', { pane: $pane });
                        },
                        complete: function() {
                            // Complete callback function actually gets called BEFORE animation finishes
                            // animating. Performing these functions at this point would causing
                            // jank in the animation. We'll use setTimeout to 0 to queue up
                            // these functions to improve animation performance.
                            setTimeout(function() {
                                // CSOPS-1332: This is to enforce only one pane to animate at a time
                                plugin.$navitron.removeClass(cssClasses.ANIMATING);

                                $pane.attr('aria-hidden', 'false');

                                plugin._setCurrentPane($pane);

                                // Keyboard navigation
                                plugin.$visibleItems = $pane.find(selectors.ITEM).filter(':visible');
                                $pane.find(selectors.CONTENT).find(selectors.ITEM).eq(0).focus();

                                plugin._trigger('onShown', { pane: $pane });
                            }, 0);
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
                        complete: function() {
                            $shiftMenu.attr('aria-hidden', 'true');
                        }
                    }),
                    {queue: false}
                );
        },

        _hidePane: function($pane, $button) {
            var plugin = this;

            // CSOPS-1332: This is to enforce only one pane to animate at a time
            if (this.$navitron.hasClass(cssClasses.ANIMATING)) {
                return;
            }

            Velocity.animate(
                $pane,
                {
                    translateX: [0, '-100%']
                },
                $.extend(true, {}, this.animationDefaults, {
                    display: 'none',
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

            // If user calls 'showPane' method on a targeted pane. The
            // previous pane wouldn't have any translateX value set, we'll
            // have to set the translateValue manually.
            if ($targetPane.attr('style').length < 1) {
                translateValue = -(100 + this.options.shiftAmount);
            }

            Velocity.animate(
                $targetPane,
                {
                    translateX: [(translateValue + this.options.shiftAmount) + '%', translateValue + '%'],
                    opacity: [1, this.options.fadeOpacityTo]
                },
                $.extend(true, {}, this.animationDefaults, {
                    display: 'block',
                    begin: function() {
                        // CSOPS-1332: This is to enforce only one pane to animate at a time
                        plugin.$navitron.addClass(cssClasses.ANIMATING);

                        plugin._trigger('onShow', { pane: $targetPane });
                    },
                    complete: function() {
                        setTimeout(function() {
                            // CSOPS-1332: This is to enforce only one pane to animate at a time
                            plugin.$navitron.removeClass(cssClasses.ANIMATING);

                            $targetPane
                                .attr('aria-hidden', 'false')
                                .find(selectors.NEXT_PANE + '[data-target-pane="' + buttonProperties.currentPane + '"]')
                                .attr('aria-expanded', 'false')
                                .focus();

                            plugin._setCurrentPane($targetPane);

                            plugin._trigger('onShown', { pane: $targetPane });

                            // Setting new controllable items for keyboard navigation
                            plugin.$visibleItems = $targetPane.find(selectors.ITEM).filter(':visible');
                        }, 0);
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

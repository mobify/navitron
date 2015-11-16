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
        HEADER: '.navitron__header',
        CONTENT: '.navitron__content',
        FOOTER: '.navitron__footer',
        CURRENT_PANE: '.navitron--current-pane'
    };

    var cssClasses = {
        NAVITRON: 'navitron',
        ANIMATING: 'navitron--is-animating',
        NESTED_CONTAINER: 'navitron__nested',
        PANE: 'navitron__pane',
        WRAPPER: 'navitron__wrapper',
        HEADER: 'navitron__header',
        CONTENT: 'navitron__content',
        FOOTER: 'navitron__footer',
        NEXT_PANE: 'navitron__next-pane',
        PREV_PANE: 'navitron__prev-pane',
        ITEM: 'navitron__item',
        CURRENT_PANE: 'navitron--current-pane',
        SLID_PANE: 'navitron--slid-pane',
        DISMISS_PANE: 'navitron--dismiss-pane'
    };

    /**
     * Template constants required for building the default HTML structure
     */
    var template = {
        NESTED_CONTAINER: '<div class="' + cssClasses.NESTED_CONTAINER + '"></div>',
        PANE: '<div class="' + cssClasses.PANE + '"></div>',
        WRAPPER: '<div class="' + cssClasses.WRAPPER + '"></div>',
        HEADER: '<div class="' + cssClasses.HEADER + '"></div>',
        CONTENT: '<div class="' + cssClasses.CONTENT + '"></div>',
        FOOTER: '<div class="' + cssClasses.FOOTER + '"></div>',
        BUTTON: '<button type="button" class="' + cssClasses.ITEM + '"></button>',
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
        structure: true,
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

            this.$visibleItems = this.$currentPane.find(selectors.ITEM);

            this._bindEvents();
        },

        destroy: function() {
            this.$navitron.removeData(this.name);
        },

        _setAnimationDirection: function($pane) {
            if ($pane.hasClass(cssClasses.CURRENT_PANE)) {
                return {
                    startX: '0',
                    endX: this.options.shiftAmount * -1 + '%',
                    startOpacity: '1',
                    endOpacity: this.options.fadeOpacityTo,
                    cssClass: cssClasses.SLID_PANE
                };
            } else if ($pane.hasClass(cssClasses.SLID_PANE)) {
                return {
                    startX: this.options.shiftAmount * -1 + '%',
                    endX: '0',
                    startOpacity: this.options.fadeOpacityTo,
                    endOpacity: '1'
                };
            } else if ($pane.hasClass(cssClasses.DISMISS_PANE)) {
                return {
                    startX: '0',
                    endX: '100%',
                    startOpacity: '1',
                    endOpacity: '1'
                };
            } else {
                return {
                    startX: '100%',
                    endX: '0',
                    startOpacity: '1',
                    endOpacity: '1'
                };
            }
        },

        showPane: function($targetPane) {
            if (!$targetPane.length) {
                throw new Error('The showPane method requires a pane element to show');
            }

            // Enforce only one pane to animate at a time
            if (this._isAnimating() || $targetPane.hasClass(cssClasses.CURRENT_PANE)) {
                return;
            }

            var plugin = this;
            var $currentPane = plugin.$currentPane;
            var targetPaneAnimation = this._setAnimationDirection($targetPane);
            var currentPaneAnimation = this._setAnimationDirection($currentPane);

            Velocity.animate(
                $targetPane,
                {
                    translateX: [targetPaneAnimation.endX, targetPaneAnimation.startX],
                    opacity: [targetPaneAnimation.endOpacity, targetPaneAnimation.startOpacity]
                },
                $.extend(true, {}, this.animationDefaults, {
                    display: 'block',
                    begin: function() {
                        window.requestAnimationFrame(function() {
                            // Enforce only one pane to animate at a time
                            plugin.$navitron.addClass(cssClasses.ANIMATING);

                            plugin._trigger('onShow', { pane: $targetPane });
                        });
                    },
                    complete: function() {
                        // Complete callback function actually gets called BEFORE animation finishes
                        // animating. Performing these functions at this point would causing
                        // jank in the animation. We'll use requestAnimationFrame to queue up these
                        // functions after animation has ended.
                        window.requestAnimationFrame(function() {
                            // Enforce only one pane to animate at a time
                            plugin.$navitron.removeClass(cssClasses.ANIMATING);

                            $targetPane.attr('aria-hidden', 'false');

                            plugin._setCurrentPane($targetPane);

                            // Keyboard navigation
                            plugin.setFocusableItems($targetPane);

                            // Send focus to <ul> list
                            $targetPane.find(selectors.CONTENT).attr('tabindex', 0).focus();

                            plugin._trigger('onShown', { pane: $targetPane });

                            // History API
                            if ($targetPane.find(selectors.PREV_PANE).length) {
                                var urlReplace = "#" + $targetPane.attr('id'); // make the hash the id of the pane shown
                                history.pushState(null, null, urlReplace);
                            } else {
                                history.pushState(null, null, ''); // should indicate this is top level pane
                            }
                        });
                    }
                })
            );

            Velocity.animate(
                $currentPane,
                {
                    translateX: [currentPaneAnimation.endX, currentPaneAnimation.startX],
                    opacity: [currentPaneAnimation.endOpacity, currentPaneAnimation.startOpacity]
                },
                $.extend(true, {}, this.animationDefaults, {
                    display: 'none',
                    complete: function() {
                        window.requestAnimationFrame(function() {
                            $currentPane.attr('aria-hidden', 'true')
                                .addClass(currentPaneAnimation.cssClass)
                                .removeClass(cssClasses.CURRENT_PANE)
                                .removeClass(cssClasses.DISMISS_PANE);
                        });
                    }
                })
            );
        },

        _build: function() {
            var plugin = this;

            var $navitron = this.$original.addClass(cssClasses.NAVITRON);
            var $pane = $(template.PANE);
            var $wrapper = $(template.WRAPPER);
            var $content = $(template.CONTENT);
            var $button = $(template.BUTTON);
            var $topLevelList = $navitron.children('ul');
            var $listItems = $topLevelList.children('li');

            // Decorate nested list with Level IDs
            plugin._setLevelData();

            // Get top level data
            var topLevel = $topLevelList.attr('data-level');
            $topLevelList.removeAttr('data-level'); // Remove the data-level set by label tree function

            // Build top level markup
            $topLevelList
                .wrapAll($content.clone())
                .parent()
                .wrap($wrapper.clone())
                .parent()
                .wrap(
                    $pane.clone()
                        .attr('data-level', topLevel)
                        .addClass(cssClasses.CURRENT_PANE)
                );

            // Custom markup for top level
            if (!plugin.options.structure) {
                plugin._includeCustomMarkup($topLevelList);
            } else {
                if ($navitron.find(selectors.PREV_PANE).length) {
                    throw new Error('Default structure option will generate its own `<button class="navitron__prev-pane" />`. Please remove the button from the markup or set structure option to `false` if you want control over the markup');
                }
            }

            // Build nested levels
            this._buildNestedLevels($listItems);

            // Item class for ARIA accessibility decorate function
            $navitron.find('button, a').addClass(cssClasses.ITEM);

            // Redefine Navitron to the new wrapper we created
            this.$navitron = $navitron;

            // Set ARIA accessibility attributes
            this._addAccessibility();

            // Reveal navitron now that it has finished building
            this.$navitron.removeAttr('hidden');
        },

        _buildNestedLevels: function($listItems) {
            var plugin = this;

            var $pane = $(template.PANE);
            var $wrapper = $(template.WRAPPER);
            var $content = $(template.CONTENT);
            var $button = $(template.BUTTON);

            $listItems.each(function (index, item) {
                var $item = $(item);
                var $nestedList = $item.children('ul');

                // If there's nested <ul> run _buildNestedLevels function again
                if ($nestedList.length) {
                    // Get level data
                    var level = $nestedList.data('level');
                    var targetLevel = plugin._getParentLevel(level);
                    var $contents = $item.contents().not($(selectors.NEXT_PANE));

                    // Clean up markup
                    $nestedList.removeAttr('data-level');

                    // Put nested levels into Navitron container
                    $contents
                        .wrapAll($content.clone())
                        .parent()
                        .wrap($wrapper.clone())
                        .parent()
                        .wrap($pane.clone())
                        .parent()
                        .attr('data-level', level)
                        .appendTo(plugin.$original);

                    // Custom markup
                    if (!plugin.options.structure) {
                        plugin._includeCustomMarkup($nestedList, level, targetLevel);

                        // Next level button
                        if ($item.find(selectors.NEXT_PANE).length) {
                            $item.find(selectors.NEXT_PANE)
                                .addClass(cssClasses.ITEM)
                                .attr('data-target-pane', level);
                        } else {
                            throw new Error('Custom structure requires element with class "navitron__next-pane" for nested lists');
                        }
                    } else {
                        var $prevButton = $button.clone()
                                .text('Back')
                                .addClass(cssClasses.PREV_PANE)
                                .attr('data-target-pane', targetLevel)
                                .attr('data-current-pane', level);

                        $(template.HEADER).append($prevButton).insertBefore($nestedList.parent(selectors.CONTENT));

                        // Build next level button
                        var text = $item.text().trim();

                        $item.html(
                            $button.clone()
                                .text(text)
                                .attr('data-target-pane', level)
                                .addClass(cssClasses.NEXT_PANE)
                        );
                    }

                    // Run again for nested level
                    var $listItems = $nestedList.children('li');

                    if ($listItems.length) {
                        plugin._buildNestedLevels($listItems, plugin.$original);
                    }
                }
            });
        },

        _includeCustomMarkup: function($list, level, targetLevel) {
            var $header = $list.children(selectors.HEADER).remove();
            var $footer = $list.children(selectors.FOOTER).remove();

            if ($header.length) {
                var $headerContainer = this._buildHeaderFooter($header, targetLevel, level);

                $headerContainer.insertBefore($list.parent(selectors.CONTENT));
            }

            if ($footer.length) {
                var $footerContainer = this._buildHeaderFooter($footer, targetLevel, level);

                $footerContainer.insertAfter($list.parent(selectors.CONTENT));
            }

            return $list;
        },

        _buildHeaderFooter: function($element, targetLevel, level) {
            var attrName;
            var attrValue;
            var attrs = '';
            var attributeLength = $element[0].attributes.length;
            var $backButton = $element.find(selectors.PREV_PANE);

            // Perserve original attributes (classes, ID, etc)
            for (var i = 0; i < attributeLength; i++) {
                attrName = $element[0].attributes[i].nodeName;
                attrValue = $element[0].attributes[i].nodeValue;

                attrs += attrName + '="' + attrValue + '" ';
            }

            var $newContainer = $('<div ' + attrs + ' />');

            if ($backButton.length) {
                $backButton
                    .addClass(cssClasses.ITEM)
                    .attr('data-target-pane', targetLevel)
                    .attr('data-current-pane', level);
            }

            $element.contents().appendTo($newContainer);

            return $newContainer;
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
                var buttonProperties = $button.data();
                var $targetPane = plugin._getTargetPane(buttonProperties.targetPane);

                // Set CSS classes for proper animation detection
                plugin.$currentPane.removeClass(cssClasses.CURRENT_PANE)
                    .addClass(cssClasses.DISMISS_PANE);

                plugin.showPane($targetPane);
            });

            /**
             * Keyboard controls to navigate through items and menus
             */
            this.$navitron.on('keydown', selectors.PANE, function(e) {
                plugin._handleKeyDown($(this), e);
            });

            $(window).on('popstate', function() {
                // If there's
                if (plugin.$currentPane.find(selectors.PREV_PANE).length) {
                    plugin.$currentPane.find(selectors.PREV_PANE).click();
                } else {
                    window.history.go(-1);
                }
            });
        },

        _handleKeyDown: function($pane, e) {
            var $list = $pane.find(selectors.CONTENT);
            var $listItems = $list.find(selectors.ITEM);
            var $focusedItem = this.$visibleItems.filter(':focus');
            var focusableItemsCount = this.$visibleItems.length - 1; // Slight tweak of the number to match array indexing
            var itemIndex = this.$visibleItems.index($focusedItem);

            // Spacebar: Action to click on menu items
            if (e.which === 32) {
                $focusedItem.trigger('click');
                e.preventDefault();
            }

            // Left arrow: Drill up menu
            if (e.which === 37) {
                var $backButton = $pane.find(selectors.PREV_PANE);

                if ($backButton.length) {
                    $backButton.trigger('click');
                }
                e.preventDefault();
            }

            // Right arrow: Drill down menu item OR click on menu item link
            if (e.which === 39 && $focusedItem.hasClass(cssClasses.NEXT_PANE)) {
                $focusedItem.trigger('click');
                e.preventDefault();
            }

            this._handleNextPrevItem(e, $list, $listItems, focusableItemsCount, itemIndex);
        },

        _handleNextPrevItem: function(e, $list, $listItems, focusableItemsCount, itemIndex) {
            // Up arrow: Previous menu item
            if (e.which === 38) {
                if ($list.is(':focus')) {
                    // Allow focus to shift from list to items before it
                    itemIndex = this.$visibleItems.index($listItems);
                }

                if (itemIndex > 0) {
                    this.$visibleItems[itemIndex - 1].focus();
                }
                e.preventDefault();
            }

            // Down arrow: Next menu item
            if (e.which === 40 && focusableItemsCount > itemIndex) {
                if ($list.is(':focus')) {
                    // Shift focus from list to the first item
                    itemIndex = this.$visibleItems.index($listItems);

                    this.$visibleItems[itemIndex].focus();
                } else {
                    // Next menu item
                    this.$visibleItems[itemIndex + 1].focus();
                }
                e.preventDefault();
            }

            // Up arrow: Start of list, send focus to last navitron item
            if (e.which === 38 && itemIndex === 0) {
                this.$visibleItems.filter(selectors.ITEM).last().focus();
                e.preventDefault();
            }

            // Down arrow: End of list, send focus to first navitron item
            if (e.which === 40 && focusableItemsCount === itemIndex) {
                this.$visibleItems.filter(selectors.ITEM).eq(0).focus();
                e.preventDefault();
            }
        },

        setFocusableItems: function($pane) {
            // Exposing this method for cases when menu items gets Ajax'd in.
            this.$visibleItems = $pane.find(selectors.ITEM);
        },

        _setCurrentPane: function($pane) {
            $pane.addClass(cssClasses.CURRENT_PANE)
                .removeClass(cssClasses.DISMISS_PANE)
                .removeClass(cssClasses.SLID_PANE);
            this.$currentPane = $pane;
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

        _setAnimationDefaults: function() {
            this.animationDefaults = {
                easing: this.options.easing,
                duration: this.options.duration,
                mobileHA: true
            };
        },

        _isAnimating: function() {
            return this.$navitron.hasClass(cssClasses.ANIMATING);
        },

        _getParentLevel: function(level) {
            var levelParts = level.toString().split('.');

            // Pop Off the current id
            levelParts.pop();

            return levelParts.join('.');
        },

        _getTargetPane: function(pane) {
            return this.$navitron.find(selectors.PANE + '[data-level="' + pane + '"]');
        },

        _getTranslateX: function($element) {
            return parseFloat(Velocity.CSS.getPropertyValue($element[0], 'translateX'));
        },

        /**
         * Ensure Navitron markup gets accessibility attributes
         *
         * [Reference] ARIA Treeview with aria-owns - http://oaa-accessibility.org/example/42/
         */
        _addAccessibility: function() {
            this.$navitron.attr('role', 'tree');

            this.$navitron.find(selectors.PANE).each(function(idx, el) {
                var $el = $(el);
                var levelId = $el.data('level');

                // Prefixing ID with 'Navitron_' to ensure we don't set a duplicate client ID accidentally
                $el
                    .attr('role', 'group')
                    .attr('aria-hidden', 'true')
                    .attr('id', 'Navitron_' + levelId);
            });

            this.$navitron.find(selectors.CURRENT_PANE).attr('aria-hidden', 'false');

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
                throw new Error('The fadeOpacityTo option value should be in the range from 0 to 1.0.');
            }
            if (isNaN(this.options.shiftAmount)) {
                throw new Error('The shiftAmount option value needs to be an integer.');
            }
            if (this.options.shiftAmount < 0 || this.options.shiftAmount > 100) {
                throw new Error('The shiftAmount option value should be in the range from 0 to 100.');
            }
        }
    });

    $('[data-navitron]').navitron();

    return $;
}));

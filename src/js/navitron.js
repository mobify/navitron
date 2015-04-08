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
    function Navitron(element, options) {
        Navitron.__super__.call(this, element, options, Navitron.DEFAULTS);
    }

    Navitron.VERSION = '0';

    Navitron.DEFAULTS = {
    };

    Plugin.create('navitron', Navitron, {
        _init: function(element) {
            this.$element = $(element);

            this._bindEvents();
        },

        destroy: function() {
            this.$element.removeData(this.name);
        },

      _bindEvents: function() {

      }
    });

    return $;
}));

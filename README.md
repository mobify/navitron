# Mobify Navitron

A mobile optimized sliding navigation plugin.

## Dependencies

* [Zepto](http://zeptojs.com/)
* [Mobify's fork of Velocity.js](http://github.com/mobify/velocity)
* [Plugin](http://github.com/mobify/plugin)


### Velocity

If you are using Zepto, you need to load `bower_components/mobify-velocity/velocity.js` (this file comes with a jQuery shim bundled directly in it). If you are using jQuery, you need to load `bower_components/velocity/jquery.velocity.js`.

### jQuery Support

Navitron supports jQuery but is not actively developed for it. You should be able to use Navitron directly with jQuery 2.0. While we don't actively support jQuery for Navitron, we welcome any and all issues and PRs to help us make it work.

## Installation

Navitron can be installed using bower:

```
bower install navitron
```

## Usage with Require.js

We highly recommend using Require.js with Navitron. To use Require, you have to reference Navitron, Navitron's effect modules, and Navitron's dependencies inside your require config file:

```config.js

{
    'paths': {
        'plugin': 'bower_components/plugin/dist/plugin.min',
        'navitron': 'bower_components/navitron/dist/navitron.min'
    }
}

```

And then require Navitron in as needed:

```
define([
    'zepto',
    'navitron'
    ],
    function($) {
        $('.navitron').navitron();
    }
);
```

## Usage

Navitron requires very minimal markup. All Navitron needs is a div with your content and it will automatically transform into what we need.

> To avoid any unwanted FOUT, decorate the content you will be passing to Navitron with the `hidden` attribute. The `hidden` attribute will be removed when Navitron is initialized.

For accessibility and functional purposes, Navitron will wrap all of your body content in a wrapping container. This could conflict with other plugins that alter your page's markup. If you're seeing issues, try initializing Navitron after your other plugins.

```html
<!-- Include the CSS -->
<link rel="stylesheet" href="navitron.min.css">

<!-- Optionally include the Theme file -->
<link rel="stylesheet" href="navitron-style.min.css">

<!-- Include the markup -->
<nav id="yourNavitron" hidden>
    <ul>
        <li>
            Level 1 Item 1
            <ul>
                <li>
                    Level 2 Item 1
                    <ul>
                        <li>Level 3 Item 1</li>
                        <li>Level 3 Item 2</li>
                    </ul>
                </li>

                <li>
                    Level 2 Item 2
                </li>
            </ul>
        </li>

        <li>
            Level 1 Item 2
        </li>
    </ul>
</nav>

<!-- Include dependencies -->
<script src="zepto.min.js"></script>
<script src="velocity.min.js"></script>
<script src="plugin.min.js"></script>

<!-- Include navitron.js -->
<script src="navitron.min.js"></script>

<!-- Construct navitron -->
<script>$('#yourNavitron').navitron()</script>
```


### Grunt Tasks:
* `grunt` or `grunt build` - builds a distributable release
* `grunt watch` - watches for changes and builds when changes are detected.
* `grunt serve` - runs the server, building changes and then watching for changes. Use grunt serve to preview the site at **http://localhost:3000**
* `grunt test` - runs the test suite in your console
* `grunt test:browser` - runs a server that allows you to run the test suite in your browser


The `dist` directory will be populated with minified versions of the css and javascript files for distribution and use with whatever build system you might use. The `src` directory has our raw unminified Sass and Javascript files if you prefer to work with those.

## License

_MIT License. Navitron is Copyright © 2015 Mobify. It is free software and may be redistributed under the terms specified in the LICENSE file._

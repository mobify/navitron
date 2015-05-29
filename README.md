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

We highly recommend using Require.js with Navitron. To use Require, you have to reference Navitron inside your require config file:

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

At a bare minimum, your markup structure should follow the structure shown below. You should have at least one `<nav>` container with semantically correct nested lists inside. Content within list items can be whatever you want. You may also style either of those however you need. Our default theme will give you some standard styling for those elements but if you want to theme Navitron yourself, we recommend not including the theme file and starting from scratch.

> To avoid any unwanted FOUT, decorate the content you will be passing to Navitron with the `hidden` attribute. The `hidden` attribute will be removed when Navitron is initialized.

For accessibility and functional purposes, Navitron will automatically wire up ARIA functionalities to support screen readers.

```html
<!-- Include the CSS -->
<link rel="stylesheet" href="navitron.min.css">

<!-- Optionally include the Theme file -->
<link rel="stylesheet" href="navitron-style.min.css">

<!-- Include the markup -->
<nav id="myNavitron" hidden>
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
<script>$('#myNavitron').navitron()</script>
```

## Initializing the plugin

### navitron()

Initializes the navitron.

```js
$('#myNavitron').navitron();
```

### navitron(options)

Initialize with options.

```js
$('#myNavitron').navitron({
    shiftAmount: 20,
    duration: 200,
    easing: 'swing',
    fadeOpacityTo: 0.25,
    currentPane: '0',
    show: noop,
    shown: noop
});
```

#### Options

##### shiftAmount

default: `20`

Specifies how much the current pane shifts away.
TODO: Add a gif for explanation

```js
$('#myNavitron').navitron({
    shiftAmount: 40
});
```

##### duration

default: `200`

Sets the duration for the animation.

```js
$('#myNavitron').navitron({
    duration: 1000
});
```

##### easing

default: `swing`

Sets the easing for the animation. Navitron takes all of the same easing properties that [Velocity.js](http://julian.com/research/velocity) accepts.

> * [jQuery UI's easings](http://easings.net/) and CSS3's easings ("ease", "ease-in", "ease-out", and "ease-in-out"), which are pre-packaged into Velocity. A bonus "spring" easing (sampled in the CSS Support pane) is also included.
* CSS3's bezier curves: Pass in a four-item array of bezier points. (Refer to [Cubic-Bezier.com](http://cubic-bezier.com/) for crafing custom bezier curves.)
* Spring physics: Pass a two-item array in the form of [ tension, friction ]. A higher tension (default: 600) increases total speed and bounciness. A lower friction (default: 20) increases ending vibration speed.
* Step easing: Pass a one-item array in the form of [ steps ]. The animation will jump toward its end values using the specified number of steps.

For more information, check out [Velocity's docs on easing](http://julian.com/research/velocity/#easing).

```js
$('#myNavitron').navitron({
    easing: 'ease-in-out'
});
```

##### fadeOpacityTo

default: `0.25`

A range from 0 to 1. Sets the opacity value the pane will fade to when being animated in/out of view.

**If you don't want any fading animation, set `fadeOpacityTo` to 1**

```js
$('#myNavitron').navitron({
    fadeOpacityTo: 0.5
});
```

##### show

default: `function(e, ui) {}`

Triggered every time Navitron is starting to animate a pane.

**Parameters**

| Parameter name | Description |
|----------------|-------------|
| **e** | An Event object passed to the callback |
| **ui** | An object containing any associated data for use inside the callback |

```js
$('#myNavitron').navitron({
    show: function(e, ui) {
        // ui.pane contains the pane animating in
    }
});
```

##### shown

default: `function(e, ui) {}`

Triggered every time Navitron has finished animating a pane.

**Parameters**

| Parameter name | Description |
|----------------|-------------|
| **e** | An Event object passed to the callback |
| **ui** | An object containing any associated data for use inside the callback |

```js
$('#myNavitron').navitron({
    shown: function(e, ui) {
        // ui.pane contains the pane that is shown
    }
});
```

## Methods

### Show Pane

Show the selected pane by element reference

```js
$('#myNavitron').navitron('showPane', $targetPane);
```

## Browser Compatibility

| Browser           | Version | Support                      |
|-------------------|---------|------------------------------|
| Mobile Safari     | 6.0+    | Supported.                   |
| Chrome (Android)  | 38.0+   | Supported.                   |
| Android Browser   | 4.0+    | Partial support. [See known issues](#known-issues-and-workarounds)             |
| IE for Win Phone  | 8.0+    | Supported.                   |
| Firefox (Android) | 27.0+   | Supported. (Support may exist for earlier versions but has not been tested) |


## Known Issues and Workarounds

Currently for AOSP browsers 4.0.x - 4.1.x, the panes do not animate smoothly when CSS box-shadow is applied to them and have minor rendering artifacts where some of the content is cut off. It is recommended to disable box-shadows for these browsers.

## Working with Navitron locally

### Requirements

* [Node.js 0.10.x/npm](http://nodejs.org/download/)
* [Grunt](http://gruntjs.com/)
  * Install with `npm install -g grunt-cli`
* [Bower](http://bower.io/)
  * Install with `npm install -g bower`


### Steps
1. `npm install`
1. `bower install`
1. `grunt serve`


### Grunt Tasks:
* `grunt` or `grunt build` - builds a distributable release
* `grunt watch` - watches for changes and builds when changes are detected.
* `grunt serve` - runs the server, building changes and then watching for changes. Use grunt serve to preview the site at **http://localhost:3000**
* `grunt test` - runs the test suite in your console
* `grunt test:browser` - runs a server that allows you to run the test suite in your browser


The `dist` directory will be populated with minified versions of the css and javascript files for distribution and use with whatever build system you might use. The `src` directory has our raw unminified Sass and Javascript files if you prefer to work with those.

## License

_MIT License. Navitron is Copyright © 2015 Mobify. It is free software and may be redistributed under the terms specified in the LICENSE file._

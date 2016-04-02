# Mobify Navitron

A mobile optimized sliding navigation plugin.

## Dependencies

* [jQuery](http://jquery.com/)
* [Mobify's fork of Velocity.js](http://github.com/mobify/velocity)
* [Plugin](http://github.com/mobify/plugin)

### Zepto Support

While we don't actively support Zepto for Navitron, we welcome any and all issues and PRs to help us make it work.

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
        '$': 'node_modules/jquery/dist/jquery.min',
        'plugin': 'node_modules/plugin/dist/plugin.min',
        'navitron': 'node_modules/navitron/dist/navitron.min'
    }
}

```

And then require Navitron in as needed:

```
define([
    '$',
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
                <span class="navitron__next-pane">Level 1 Item 1</span>

                <ul>
                    <li>
                        <span class="navitron__next-pane">Level 2 Item 1</span>
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
<script src="jquery.min.js"></script>
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
    structure: true,
    onShow: noop,
    onShown: noop
});
```

#### Options

##### shiftAmount

default: `20`

Specifies how much the current pane shifts away creating a parallax effect.

**Notice the pane with the green borders that's shifting in/out of view.**
![Shift in action](https://dl.pushbulletusercontent.com/MD6m4LMIj0HCAXGUN3ZGvs3LH1BvsCNT/navitron-shift.gif "Shift in action")

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

##### structure

default: `true`

Defines the structure to use for Navitron panes. By default, Navitron will automatically add a `Back` button to `.navitron__header` for each nested list.

**If you want to have full control over the header and footer section of the Navitron panes, set `structure: false`**.

If you are using `structure: false`, you will need to structure your HTML to include the following elements shown below. *You must include `<button class="navitron__next-pane">` for each list item that have a nested list inside. In addition, you must have `<button class="navitron__prev-pane">` either in `<li class="navitron__header">`* **OR** *`<li class="navitron__footer">` for each nested list.* Navitron will transform the `<li>` into a `<div>` perserving all the class names, ID, attributes that you might have included and all of the contents inside would be kept during the transformation process.

**Missing any elements will cause Navitron to not function properly.**

```html
<nav id="myNavitron" hidden>
    <ul>
        <!-- Header for the top level nav list -->
        <li class="navitron__header">
            <span>Top Level</span>
        </li>
        <li>
            <button class="navitron__next-pane" type="button">Level 1 Item 1</button>
            <ul>
                <!-- The header that will be built out for this nested list -->
                <li class="navitron__header">
                    <button class="navitron__prev-pane" type="button">
                        Back
                    </button>
                    <span>Level 1 item 1 heading</span>
                </li>
                <li>
                    <button class="navitron__next-pane" type="button">Level 2 Item 1</button>
                    <ul>
                        <li>Level 3 Item 1</li>
                        <li>Level 3 Item 2</li>
                        <!-- Position of navitron__header or navitron__footer in the list doesn't matter
                        as long as they are the children of the nested list -->
                        <li class="navitron__footer">
                            <button class="navitron__prev-pane" type="button">
                                Back
                            </button>
                            <span>Level 2 item 1 heading</span>
                        </li>
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
```

##### onShow

default: `function(e, ui) {}`

Triggered every time Navitron is starting to animate a pane.

**Parameters**

| Parameter name | Description |
|----------------|-------------|
| **e** | An Event object passed to the callback |
| **ui** | An object containing any associated data for use inside the callback |

```js
$('#myNavitron').navitron({
    onShow: function(e, ui) {
        // ui.pane contains the pane animating in
    }
});
```

##### onShown

default: `function(e, ui) {}`

Triggered every time Navitron has finished animating a pane.

**Parameters**

| Parameter name | Description |
|----------------|-------------|
| **e** | An Event object passed to the callback |
| **ui** | An object containing any associated data for use inside the callback |

```js
$('#myNavitron').navitron({
    onShown: function(e, ui) {
        // ui.pane contains the pane that is shown
    }
});
```

## Methods

### showPane

Show the selected pane by element reference.

Can be used to show a specific nested list to show on page load.

```js
$('#myNavitron').navitron('showPane', $targetPane);
```

## Browser Compatibility

| Browser           | Version | Support                      |
|-------------------|---------|------------------------------|
| Mobile Safari     | 6.0+    | Supported.                   |
| Chrome (Android)  | 38.0+   | Supported.                   |
| Android Browser   | 4.0+    | Partial support. [See known issues](#known-issues-and-workarounds) |
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
1. Clone Navitron repo
1. `npm install`
1. `bower install`
1. `grunt serve`
1. Preview the site at http://localhost:3000
1. Navigate to examples folder


### Grunt Tasks:
* `grunt` or `grunt build` - builds a distributable release
* `grunt watch` - watches for changes and builds when changes are detected.
* `grunt serve` - runs the server, building changes and then watching for changes. Use grunt serve to preview the site at **http://localhost:3000**
* `grunt test` - runs the test suite in your console
* `grunt test:browser` - runs a server that allows you to run the test suite in your browser


The `dist` directory will be populated with minified versions of the css and javascript files for distribution and use with whatever build system you might use. The `src` directory has our raw unminified Sass and Javascript files if you prefer to work with those.

## License

_MIT License. Navitron is Copyright © 2015 Mobify. It is free software and may be redistributed under the terms specified in the LICENSE file._

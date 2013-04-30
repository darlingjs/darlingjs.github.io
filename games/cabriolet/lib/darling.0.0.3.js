/**
 * @license darlingjs v0.0.1 2013-04-21 by Eugene Krevenets.
 * Component based game engine (entity system). Decoupled from any visualization, physics, and so on. With injections and modules based on AngularJS.
 * https://github.com/Hyzhak/darlingjs/
 *
 */

(function(window, undefined) {
    'use strict';
/**
 * Get from Three.js
 * @author mrdoob / http://mrdoob.com/
 * @author Larry Battle / http://bateru.com/news
 */

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

( function () {
    'use strict';

    var lastTime = 0;
    var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

    for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {

        window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
        window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];

    }

    if ( window.requestAnimationFrame === undefined ) {

        window.requestAnimationFrame = function ( callback, element ) {

            var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
            var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
            lastTime = currTime + timeToCall;
            return id;

        };

    }

    window.cancelAnimationFrame = window.cancelAnimationFrame || function ( id ) { window.clearTimeout( id ) };
}() );
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 *
 */

/**
 * Get From AngularJS Project with little changes based on JSHint.
 */

var darlingutil = window.darlingutil = window.darlingutil||{};

(function() {
    'use strict';

    darlingutil.getCanvas = function(id) {
        var domElement = document.getElementById(id);
        if (domElement === null) {
            throw new Error('Can\'t find DOM element with id: "' + id + '"');
        }

        if (darlingutil.isDefined(domElement.getContext)) {
            return domElement;
        } else {
            return null;
        }
    };

    darlingutil.placeCanvasInStack = placeCanvasInStack;
    function placeCanvasInStack(id, width, height) {
        var targetElement = document.getElementById(id);
        if (targetElement === null) {
            throw new Error('Can\'t find DOM element with id: "' + id + '"');
        }

        var container = document.createElement('div');
        container.style.position = 'absolute';
//    var position = placement.getElementAbsolutePos(targetElement);
//    container.style.left = position.x + 'px';
//    container.style.top = position.y + 'px';
        //container.style.left = 0 + 'px';
        container.style.top = 0 + 'px';
        targetElement.appendChild(container);

        var canvas = document.createElement('canvas');
        canvas.width = width || targetElement.clientWidth;
        canvas.height = height || targetElement.clientHeight;
        container.appendChild(canvas);

        return canvas;
    }

    darlingutil.removeCanvasFromStack = removeCanvasFromStack;
    function removeCanvasFromStack(canvas) {
        if (canvas.parentNode) {
            if (canvas.parentNode.parentNode) {
                canvas.parentNode.parentNode.removeChild(canvas.parentNode);
            }
            canvas.parentNode.removeChild(canvas);
        }
    }

    /**
     * Get DOM element absolute position
     */
    //(function(window) {
        function __getIEVersion() {
            var rv = -1; // Return value assumes failure.
            if (navigator.appName == 'Microsoft Internet Explorer') {
                var ua = navigator.userAgent;
                var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat(RegExp.$1);
            }
            return rv;
        }

        function __getOperaVersion() {
            var rv = 0; // Default value
            if (window.opera) {
                var sver = window.opera.version();
                rv = parseFloat(sver);
            }
            return rv;
        }

        var __userAgent = navigator.userAgent;
        var __isIE =  navigator.appVersion.match(/MSIE/) != null;
        var __IEVersion = __getIEVersion();
        var __isIENew = __isIE && __IEVersion >= 8;
        var __isIEOld = __isIE && !__isIENew;

        var __isFireFox = __userAgent.match(/firefox/i) != null;
        var __isFireFoxOld = __isFireFox && ((__userAgent.match(/firefox\/2./i) != null) ||
            (__userAgent.match(/firefox\/1./i) != null));
        var __isFireFoxNew = __isFireFox && !__isFireFoxOld;

        var __isWebKit =  navigator.appVersion.match(/WebKit/) != null;
        var __isChrome =  navigator.appVersion.match(/Chrome/) != null;
        var __isOpera =  window.opera != null;
        var __operaVersion = __getOperaVersion();
        var __isOperaOld = __isOpera && (__operaVersion < 10);

        function __parseBorderWidth(width) {
            var res = 0;
            if (typeof(width) == "string" && width != null && width != "" ) {
                var p = width.indexOf("px");
                if (p >= 0) {
                    res = parseInt(width.substring(0, p));
                }
                else {
                    //do not know how to calculate other values
                    //(such as 0.5em or 0.1cm) correctly now
                    //so just set the width to 1 pixel
                    res = 1;
                }
            }
            return res;
        }

//returns border width for some element
        function __getBorderWidth(element) {
            var res = new Object();
            res.left = 0; res.top = 0; res.right = 0; res.bottom = 0;
            if (window.getComputedStyle) {
                //for Firefox
                var elStyle = window.getComputedStyle(element, null);
                res.left = parseInt(elStyle.borderLeftWidth.slice(0, -2));
                res.top = parseInt(elStyle.borderTopWidth.slice(0, -2));
                res.right = parseInt(elStyle.borderRightWidth.slice(0, -2));
                res.bottom = parseInt(elStyle.borderBottomWidth.slice(0, -2));
            }
            else {
                //for other browsers
                res.left = __parseBorderWidth(element.style.borderLeftWidth);
                res.top = __parseBorderWidth(element.style.borderTopWidth);
                res.right = __parseBorderWidth(element.style.borderRightWidth);
                res.bottom = __parseBorderWidth(element.style.borderBottomWidth);
            }

            return res;
        }

//        var api = {};
//        window.placement = api;
        var api = darlingutil;

//returns the absolute position of some element within document
        api.getElementAbsolutePlacement = function(element) {
            var result = getElementAbsolutePos(element);
            result.width = element.offsetWidth;
            result.height = element.offsetHeight;
            return result;
        }

        api.getElementAbsolutePos = getElementAbsolutePos;

        function getElementAbsolutePos(element) {
            var res = new Object();
            res.x = 0; res.y = 0;
            if (element !== null) {
                if (element.getBoundingClientRect) {
                    var viewportElement = document.documentElement;
                    var box = element.getBoundingClientRect();
                    var scrollLeft = viewportElement.scrollLeft;
                    var scrollTop = viewportElement.scrollTop;

                    res.x = box.left + scrollLeft;
                    res.y = box.top + scrollTop;

                }
                else { //for old browsers
                    res.x = element.offsetLeft;
                    res.y = element.offsetTop;

                    var parentNode = element.parentNode;
                    var borderWidth = null;

                    while (offsetParent !== null) {
                        res.x += offsetParent.offsetLeft;
                        res.y += offsetParent.offsetTop;

                        var parentTagName =
                            offsetParent.tagName.toLowerCase();

                        if ((__isIEOld && parentTagName != "table") ||
                            ((__isFireFoxNew || __isChrome) &&
                                parentTagName == "td")) {
                            borderWidth = kGetBorderWidth
                            (offsetParent);
                            res.x += borderWidth.left;
                            res.y += borderWidth.top;
                        }

                        if (offsetParent != document.body &&
                            offsetParent != document.documentElement) {
                            res.x -= offsetParent.scrollLeft;
                            res.y -= offsetParent.scrollTop;
                        }


                        //next lines are necessary to fix the problem
                        //with offsetParent
                        if (!__isIE && !__isOperaOld || __isIENew) {
                            while (offsetParent != parentNode &&
                                parentNode !== null) {
                                res.x -= parentNode.scrollLeft;
                                res.y -= parentNode.scrollTop;
                                if (__isFireFoxOld || __isWebKit)
                                {
                                    borderWidth =
                                        kGetBorderWidth(parentNode);
                                    res.x += borderWidth.left;
                                    res.y += borderWidth.top;
                                }
                                parentNode = parentNode.parentNode;
                            }
                        }

                        parentNode = offsetParent.parentNode;
                        offsetParent = offsetParent.offsetParent;
                    }
                }
            }
            return res;
        }
//    })(window);
})();

var toString = Object.prototype.toString;


darlingutil.isDefined = isDefined;
function isDefined(value) {
    return typeof value !== 'undefined';
}

darlingutil.isUndefined = isUndefined;
function isUndefined(value) {
    return typeof value === 'undefined';
}

darlingutil.isObject = isObject;
function isObject(value) {
    return value !== null && typeof value === 'object';
}

darlingutil.isArray = isArray;
function isArray(value) {
    return toString.apply(value) === '[object Array]';
}

darlingutil.isString = isString;
function isString(value) {
    return typeof value === 'string';
}

/**
 * Checks if `obj` is a window object.
 *
 * @private
 * @param {*} obj Object to check
 * @returns {boolean} True if `obj` is a window obj.
 */
darlingutil.isWindow = isWindow;
function isWindow(obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
}

/**
 * @ngdoc function
 * @name angular.isDate
 * @function
 *
 * @description
 * Determines if a value is a date.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Date`.
 */
darlingutil.isDate = isDate;
function isDate(value){
    return toString.apply(value) === '[object Date]';
}

/**
 * @ngdoc function
 * @name angular.isFunction
 * @function
 *
 * @description
 * Determines if a reference is a `Function`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Function`.
 */
darlingutil.isFunction = isFunction;
function isFunction(value){return typeof value === 'function';}

/**
 * @ngdoc function
 * @name angular.copy
 * @function
 *
 * @description
 * Creates a deep copy of `source`, which should be an object or an array.
 *
 * * If no destination is supplied, a copy of the object or array is created.
 * * If a destination is provided, all of its elements (for array) or properties (for objects)
 *   are deleted and then all elements/properties from the source are copied to it.
 * * If  `source` is not an object or array, `source` is returned.
 *
 * Note: this function is used to augment the Object type in Angular expressions. See
 * {@link ng.$filter} for more information about Angular arrays.
 *
 * @param {*} source The source that will be used to make a copy.
 *                   Can be any type, including primitives, `null`, and `undefined`.
 * @param {(Object|Array)=} destination Destination into which the source is copied. If
 *     provided, must be of the same type as `source`.
 * @returns {*} The copy or updated `destination`, if `destination` was specified.
 */
function copy(source, destination, deleteAllDestinationProperties){
    if (isWindow(source)) {
        throw new Error("Can't copy Window");
    }
    if (!destination) {
        destination = source;
        if (source) {
            if (isArray(source)) {
                destination = copy(source, []);
            } else if (isDate(source)) {
                destination = new Date(source.getTime());
            } else if (isObject(source)) {
                destination = copy(source, {});
            }
        }
    } else {
        if (source === destination) {
            throw new Error("Can't copy equivalent objects or arrays");
        }
        if (isArray(source)) {
            destination.length = 0;
            for ( var i = 0; i < source.length; i++) {
                destination.push(copy(source[i]));
            }
        } else {
            if (deleteAllDestinationProperties) {
                forEach(destination, function(value, key){
                    delete destination[key];
                });
            }
            for ( var key in source) {
                if (source.hasOwnProperty(key)) {
                    destination[key] = copy(source[key]);
                }
            }
        }
    }
    return destination;
}


/**
 * @ngdoc function
 * @name angular.forEach
 * @function
 *
 * @description
 * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
 * object or an array. The `iterator` function is invoked with `iterator(value, key)`, where `value`
 * is the value of an object property or an array element and `key` is the object property key or
 * array element index. Specifying a `context` for the function is optional.
 *
 * Note: this function was previously known as `angular.foreach`.
 *
 <pre>
 var values = {name: 'misko', gender: 'male'};
 var log = [];
 angular.forEach(values, function(value, key){
       this.push(key + ': ' + value);
     }, log);
 expect(log).toEqual(['name: misko', 'gender:male']);
 </pre>
 *
 * @param {Object|Array} obj Object to iterate over.
 * @param {Function} iterator Iterator function.
 * @param {Object=} context Object to become context (`this`) for the iterator function.
 * @returns {Object|Array} Reference to `obj`.
 */

/**
 * @private
 * @param {*} obj
 * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments, ...)
 */
function isArrayLike(obj) {
    if (!obj || (typeof obj.length !== 'number')) {
        return false;
    }

    // We have on object which has length property. Should we treat it as array?
    if (typeof obj.hasOwnProperty !== 'function' &&
        typeof obj.constructor !== 'function') {
        // This is here for IE8: it is a bogus object treat it as array;
        return true;
    } else  {
        return obj instanceof JQLite ||                      // JQLite
            (jQuery && obj instanceof jQuery) ||          // jQuery
            toString.call(obj) !== '[object Object]' ||   // some browser native object
            typeof obj.callee === 'function';              // arguments (on IE8 looks like regular obj)
    }
}

function forEach(obj, iterator, context) {
    var key;
    if (obj) {
        if (isFunction(obj)){
            for (key in obj) {
                if (key !== 'prototype' && key !== 'length' && key !== 'name' && obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        } else if (obj.forEach && obj.forEach !== forEach) {
            obj.forEach(iterator, context);
        } else if (isArrayLike(obj)) {
            for (key = 0; key < obj.length; key++) {
                iterator.call(context, obj[key], key);
            }
        } else {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        }
    }
    return obj;
}


/**
 * @ngdoc method
 * @name AUTO.$injector#annotate
 * @methodOf AUTO.$injector
 *
 * @description
 * Returns an array of service names which the function is requesting for injection. This API is used by the injector
 * to determine which services need to be injected into the function when the function is invoked. There are three
 * ways in which the function can be annotated with the needed dependencies.
 *
 * # Argument names
 *
 * The simplest form is to extract the dependencies from the arguments of the function. This is done by converting
 * the function into a string using `toString()` method and extracting the argument names.
 * <pre>
 *   // Given
 *   function MyController($scope, $route) {
 *     // ...
 *   }
 *
 *   // Then
 *   expect(injector.annotate(MyController)).toEqual(['$scope', '$route']);
 * </pre>
 *
 * This method does not work with code minfication / obfuscation. For this reason the following annotation strategies
 * are supported.
 *
 * # The `$inject` property
 *
 * If a function has an `$inject` property and its value is an array of strings, then the strings represent names of
 * services to be injected into the function.
 * <pre>
 *   // Given
 *   var MyController = function(obfuscatedScope, obfuscatedRoute) {
 *     // ...
 *   }
 *   // Define function dependencies
 *   MyController.$inject = ['$scope', '$route'];
 *
 *   // Then
 *   expect(injector.annotate(MyController)).toEqual(['$scope', '$route']);
 * </pre>
 *
 * # The array notation
 *
 * It is often desirable to inline Injected functions and that's when setting the `$inject` property is very
 * inconvenient. In these situations using the array notation to specify the dependencies in a way that survives
 * minification is a better choice:
 *
 * <pre>
 *   // We wish to write this (not minification / obfuscation safe)
 *   injector.invoke(function($compile, $rootScope) {
 *     // ...
 *   });
 *
 *   // We are forced to write break inlining
 *   var tmpFn = function(obfuscatedCompile, obfuscatedRootScope) {
 *     // ...
 *   };
 *   tmpFn.$inject = ['$compile', '$rootScope'];
 *   injector.invoke(tempFn);
 *
 *   // To better support inline function the inline annotation is supported
 *   injector.invoke(['$compile', '$rootScope', function(obfCompile, obfRootScope) {
 *     // ...
 *   }]);
 *
 *   // Therefore
 *   expect(injector.annotate(
 *      ['$compile', '$rootScope', function(obfus_$compile, obfus_$rootScope) {}])
 *    ).toEqual(['$compile', '$rootScope']);
 * </pre>
 *
 * @param {function|Array.<string|Function>} fn Function for which dependent service names need to be retrieved as described
 *   above.
 *
 * @returns {Array.<string>} The names of the services which the function requires.
 */

var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

function annotate(fn) {
    var $inject,
        fnText,
        argDecl,
        last;

    if (typeof fn === 'function') {
        if (!($inject = fn.$inject)) {
            $inject = [];
            fnText = fn.toString().replace(STRIP_COMMENTS, '');
            argDecl = fnText.match(FN_ARGS);
            forEach(argDecl[1].split(FN_ARG_SPLIT), function(arg){
                arg.replace(FN_ARG, function(all, underscore, name){
                    $inject.push(name);
                });
            });
            fn.$inject = $inject;
        }
    } else if (isArray(fn)) {
        last = fn.length - 1;
        assertArgFn(fn[last], 'fn');
        $inject = fn.slice(0, last);
    } else {
        assertArgFn(fn, 'fn', true);
    }
    return $inject;
}

function assertArgFn(arg, name, acceptArrayAnnotation) {
    if (acceptArrayAnnotation && isArray(arg)) {
        arg = arg[arg.length - 1];
    }

    assertArg(isFunction(arg), name, 'not a function, got ' +
        (arg && typeof arg === 'object' ? arg.constructor.name || 'Object' : typeof arg));
    return arg;
}

/**
 * throw error of the argument is falsy.
 */
function assertArg(arg, name, reason) {
    if (!arg) {
        throw new Error("Argument '" + (name || '?') + "' is " + (reason || "required"));
    }
    return arg;
}

/**
 * @ngdoc function
 * @name angular.noop
 * @function
 *
 * @description
 * A function that performs no operations. This function can be useful when writing code in the
 * functional style.
 <pre>
 function foo(callback) {
       var result = calculateResult();
       (callback || angular.noop)(result);
     }
 </pre>
 */
function noop(){}

/**
 * Get Observer from Backbone
 */

// Create local references to array methods we'll want to use later.
var array = [];
var slice = array.slice;

// Backbone.Events
// ---------------

// A module that can be mixed in to *any object* in order to provide it with
// custom events. You may bind with `on` or remove with `off` callback
// functions to an event; `trigger`-ing an event fires all callbacks in
// succession.
//
//     var object = {};
//     _.extend(object, Backbone.Events);
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
//
var Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
        if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
        this._events || (this._events = {});
        var events = this._events[name] || (this._events[name] = []);
        events.push({callback: callback, context: context, ctx: context || this});
        return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
        if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
        var self = this;
        var once = _.once(function() {
            self.off(name, once);
            callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
        var retain, ev, events, names, i, l, j, k;
        if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
        if (!name && !callback && !context) {
            this._events = {};
            return this;
        }

        names = name ? [name] : _.keys(this._events);
        for (i = 0, l = names.length; i < l; i++) {
            name = names[i];
            if (events = this._events[name]) {
                this._events[name] = retain = [];
                if (callback || context) {
                    for (j = 0, k = events.length; j < k; j++) {
                        ev = events[j];
                        if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                            (context && context !== ev.context)) {
                            retain.push(ev);
                        }
                    }
                }
                if (!retain.length) delete this._events[name];
            }
        }

        return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
        if (!this._events) return this;
        var args = slice.call(arguments, 1);
        if (!eventsApi(this, 'trigger', name, args)) return this;
        var events = this._events[name];
        var allEvents = this._events.all;
        if (events) triggerEvents(events, args);
        if (allEvents) triggerEvents(allEvents, arguments);
        return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
        var listeners = this._listeners;
        if (!listeners) return this;
        var deleteListener = !name && !callback;
        if (typeof name === 'object') callback = this;
        if (obj) (listeners = {})[obj._listenerId] = obj;
        for (var id in listeners) {
            listeners[id].off(name, callback, this);
            if (deleteListener) delete this._listeners[id];
        }
        return this;
    }

};

// Regular expression used to split event strings.
var eventSplitter = /\s+/;

// Implement fancy features of the Events API such as multiple event
// names `"change blur"` and jQuery-style event maps `{change: action}`
// in terms of the existing API.
var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
        for (var key in name) {
            obj[action].apply(obj, [key, name[key]].concat(rest));
        }
        return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
        var names = name.split(eventSplitter);
        for (var i = 0, l = names.length; i < l; i++) {
            obj[action].apply(obj, [names[i]].concat(rest));
        }
        return false;
    }

    return true;
};

// A difficult-to-believe, but optimized internal dispatch function for
// triggering events. Tries to keep the usual cases speedy (most internal
// Backbone events have 3 arguments).
var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
        case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
        case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
        case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
        case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
        default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
};

// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
};

function swallowCopy(original, extended) {
    if (extended === null || original === null) {
        return original;
    }

    for (var key in extended) {
        original[key] = extended[key];
    }
}

/**
 * Get from https://www.udacity.com/course/cs255
 */

/**
 *
 * @param original
 * @param extended
 * @return {*}
 */
function mixin(original, extended) {
    if (extended === null) {
        return original;
    }
    for (var key in extended) {
        var ext = extended[key];
        if (typeof (ext) !== 'object') {
            original[key] = ext;
        } else {
            if (!original[key] || typeof (original[key]) !== 'object') {
                original[key] = {};
            }
            mixin(original[key], ext);
        }
    }
    return original;
}



function factoryOfFastFunction(fn, context, args) {
    switch(args.length) {
        case 0: return function() {
            return fn.call(context);
        };
        case 1: return function() {
            return fn.call(context, args[0]);
        };
        case 2: return function() {
            return fn.call(context, args[0], args[1]);
        };
        case 3: return function() {
            return fn.call(context, args[0], args[1], args[2]);
        };
        default: return function() {
            return fn.apply(context, args);
        };
    }
}

function factoryOfFastFunctionWithMatcher(fn, context, args, argsMatcher) {
    switch(args.length) {
        case 0: return function() {
            return fn.call(context);
        };
        case 1: return function() {
            argsMatcher(args, arguments);
            return fn.call(context, args[0]);
        };
        case 2: return function() {
            argsMatcher(args, arguments);
            return fn.call(context, args[0], args[1]);
        };
        case 3: return function() {
            argsMatcher(args, arguments);
            return fn.call(context, args[0], args[1], args[2]);
        };
        default: return function() {
            argsMatcher(args, arguments);
            return fn.apply(context, args);
        };
    }
}
'use strict';

/**
 * Module
 * @module core
 */

var darlingjs = window.darlingjs || (window.darlingjs = {});

var worlds = {};
var modules = {};

darlingjs.m = darlingjs.module = function(name, requires) {
    if (isDefined(modules[name])) {
        throw new Error('Module "' + name + '" has already been defined.');
    }
    var moduleInstance = new Module();
    moduleInstance.name = name;
    moduleInstance.requires = requires;

    modules[name] = moduleInstance;

    return moduleInstance;
};

/**
 * Build World. Like a Module in AngularJS
 *
 * @type {Function}
 */
darlingjs.w = darlingjs.world = function(name, requires) {
    if (isDefined(worlds[name])) {
        throw new Error('World "' + name + '" has already been defined.');
    }

    var worldInstance = new World();
    worldInstance.name = name;
    worlds[name] = worldInstance;

    if (isArray(requires)) {
        for (var index = 0, count = requires.length; index < count; index++) {
            var moduleName = requires[index];
            var module = modules[moduleName];
            if (isUndefined(module)) {
                throw new Error('Can\'t find module: "' + moduleName + '"');
            }

            worldInstance.$$injectedModules[moduleName] = module;

            var components = module.$$components;
            for (var componentName in components) {
                if (components.hasOwnProperty(componentName)) {
                    var component = module.$$components[componentName];
                    if (isUndefined(component)) {
                        throw new Error('Module: "' + this.name + '" has null component with name "' + componentName + '".');
                    }

                    worldInstance.$$injectedComponents[component.name] = component;
                }
            }

            var systems = module.$$systems;
            for (var systemName in systems) {
                if (systems.hasOwnProperty(systemName)) {
                    var system = systems[systemName];
                    if (isUndefined(system)) {
                        throw new Error('Module: "' + this.name + '" has null system with name "' + systemName + '".');
                    }

                    worldInstance.$$injectedSystems[system.name] = system;
                }
            }
        }
    }

    return worldInstance;
};

/**
 * Remove module from engine by name
 * @param value
 */
darlingjs.removeModule = function(value) {
    delete modules[value];
};

/**
 * Remove all modules from engine
 */
darlingjs.removeAllModules = function() {
    console.log('removeAllModules');
    modules = {};
};


darlingjs.removeWorld = function(value) {
    if (darlingutil.isString(value)) {
        delete worlds[value];
    } else {
        for(var worldName in worlds) {
            if(worlds[worldName] === value) {
                delete worlds[worldName];
                break;
            }
        }
    }
}
/**
 * Remove all worlds from engine
 */
darlingjs.removeAllWorlds = function() {
    worlds = {};
};



'use strict';

/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var Entity = function() {
    this.$$components = {};
    this.$$world = null;
    mixin(this, Events);
};

Entity.prototype.$add = function(value, config) {
    var instance;
    var name;

    if (isString(value)) {
        instance = this.$$world.$component(value, config);
        name = value;
    } else if (isComponent(value)) {
        instance = value;
        name = instance.$name;
    } else if (isUndefined(value)) {
        throw new Error('Can\'t add component with null name.');
    } else {
        throw new Error('Can\'t add ' + value + ' to entity');
    }

    if (isUndefined(instance)) {
        throw new Error('Can\'t add null component.');
    }

    if (this.$has(name)) {
        this.$remove(name);
    }

    this.$$components[name] = instance;

    this[name] = instance;

    this.trigger('add', this, instance);
    return instance;
};

Entity.prototype.$remove = function(value) {
    var instance;
    var name;
    if (isComponent(value)) {
        name = value.$name;
        instance = value;
    } else if (isString(value)) {
        name = value;
        instance = this.$$components[value];
    } else {
        throw new Error('Can\'t remove from component ' + value);
    }

    if (!this.$has(name)) {
        return;
    }

    delete this.$$components[name];
    delete this[name];

    this.trigger('remove', this, instance);

    return instance;
};

Entity.prototype.$has = function(value) {
    if (isComponent(value)) {
        return isDefined(this.$$components[value.$name]);
    } else {
        return isDefined(this.$$components[value]);
    }
};

function isComponent(value) {
    return isObject(value) && isDefined(value.$name);
}
'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 *
 * Use to store lists of entities by collection of components
 *
 * Optimization: User $marker based on used component in family to mark is entity added to Family.
 * We can calculate it in real-time as in addIfMatch, but it's not good for performance.
 */

function Family() {
    this.components = [];
    this.componentsString = '';
    this.componentsHash = {};
    this.nodes = new List();
    this.$$marker = null;
}

Family.prototype.$marker = function() {
    if (this.$$marker === null) {
        this.$$marker = '$$family_' + this.componentsString;
        this.nodes.PROPERTY_LINK_TO_NODE =  '$$listNode_of_' + this.$$marker;
    }
    return this.$$marker;
};

Family.prototype.newEntity = function(e) {
    this.addIfMatch(e);
};

Family.prototype.addIfMatch = function(e) {
    if (this.isInList(e)) {
        return;
    }

    for (var i = 0, count = this.components.length; i < count; i++) {
        var componentName = this.components[i];
        if (!e.$has(componentName)) {
            return;
        }
    }

    e[this.$marker()] = true;

    this.nodes.add(e);
};

Family.prototype.removeIfMatch = function(e, component) {
    if (isDefined(component) && !this.componentsHash[component.$name] || !this.isInList(e)) {
        return;
    }

    delete e[this.$$marker];
    this.nodes.remove(e);
};

Family.prototype.isInList = function(e) {
    return e.hasOwnProperty(this.$$marker);
};
'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */
'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var List = function() {
    this._head = this._tail = null;
    this._length = 0;
    this.PROPERTY_LINK_TO_NODE = '$$listNode_' + Math.random();
    mixin(this, Events);
};

darlingutil.List = List;

List.prototype.add = function(instance) {
    var node = poolOfListNodes.get();
    node.init(instance, this.PROPERTY_LINK_TO_NODE);

    if (this._head) {
        this._tail.$next = node;
        node.$prev = this._tail;
        this._tail = node;
    } else {
        this._head = this._tail = node;
    }

    if (instance) {
        this.trigger('add', instance);
    } else {
        this.trigger('add', node);
    }

    this._length++;

    return node;
};

List.prototype.addHead = function(instance) {
    var node = poolOfListNodes.get();
    node.init(instance, this.PROPERTY_LINK_TO_NODE);

    if (this._head) {
        this._head.$prev = node;
        node.$next = this._head;
        this._head = node;
    } else {
        this._head = this._tail = node;
    }

    if (instance) {
        this.trigger('add', instance);
    } else {
        this.trigger('add', node);
    }

    this._length++;

    return node;
};

List.prototype.remove = function(instance) {
    var node;
    if (instance instanceof ListNode) {
        node = instance;
    } else {
        if (!instance.hasOwnProperty(this.PROPERTY_LINK_TO_NODE)) {
            return false;
        }

        node = instance[this.PROPERTY_LINK_TO_NODE];
        if (node === null) {
            return false;
        }
    }

    if (this._tail === node) {
        this._tail = node.$prev;
    }

    if (this._head === node) {
        this._head = node.$next;
    }

    if (node.$prev !== null) {
        node.$prev.$next = node.$next;
    }

    if (node.$next !== null) {
        node.$next.$prev = node.$prev;
    }

    node.dispose(instance, this.PROPERTY_LINK_TO_NODE);
    poolOfListNodes.dispose(node);

    this.trigger('remove', instance);

    this._length--;
    return true;
};

List.prototype.length = function() {
    return this._length;
};

List.prototype.forEach = function(callback, context, arg) {
    context = context || this;
    if (!isFunction(callback)) {
        return;
    }
    var node = this._head;
    while(node) {
        callback.call(context, node.instance, arg);
        node = node.$next;
    }
};

var ListNode = function(instance, linkBack) {
    if (instance) {
        this.init(instance, linkBack);
    }
};

ListNode.prototype.$next = null;
ListNode.prototype.$prev = null;

ListNode.prototype.init = function(instance, linkBack) {
    this.$prev = this.$next = null;

    if (!instance) {
        return;
    }

    this.instance = instance;
    if (instance.hasOwnProperty(linkBack)) {
        throw new Error('Can\'t store "' + instance + '" because it containe ' + linkBack + ' property.');
    }

    instance[linkBack] = this;
};

ListNode.prototype.dispose = function(instance, linkBack) {
    this.$prev = this.$next = null;
    this.instance = null;
    delete instance[linkBack];
};

var PoolOfObjects = function(objectType) {
    var _pool = [];

    this.get = function() {
        if (_pool.length === 0) {
            return new objectType();
        } else {
            return _pool.pop();
        }
    };

    this.dispose = function(instance) {
        _pool.push(instance);
    };
};

var poolOfListNodes = new PoolOfObjects(ListNode);
'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var Module = function(){
    this.$$components = {};
    this.$$systems = {};
};

Module.prototype.$has = function(name) {
    return isDefined(this.$$components[name]) ||
           isDefined(this.$$systems[name]);
};

/**
 * Declare Component
 *
 * @type {Function}
 */
Module.prototype.$c = Module.prototype.$component = function(name, defaultState) {
    defaultState = defaultState || {};
    var component = {
        name: name,
        defaultState: defaultState
    };
    this.$$components[name] = component;
    return this;
};

/**
 * Declare System. Like a filter in AngularJS
 *
 * @type {Function}
 */
Module.prototype.$s = Module.prototype.$system = function(name, config) {
    if (isUndefined(name)) {
        throw new Error('System name must to be defined.');
    }
    config = config || {};
    config.name = name;

    if (isDefined(this.$$systems[name])) {
        throw new Error('Module "' + this.name + '" already has system with name "' + name + '".');
    }
    this.$$systems[name] = config;
    return this;
};
'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var System = function () {
    this.$$updateHandler = function() {};
    this.init();
};

System.prototype.init = function() {
    this.$setNodes(new List());
};

System.prototype.$setNodes = function($nodes) {
    this.$nodes = $nodes;

    var self = this;
    this.$nodes.on('add', function(node) {
        self.$$addNodeHandler(node);
    });

    this.$nodes.on('remove', function(node) {
        self.$$removeNodeHandler(node);
    });
};

System.prototype.$$updateEveryNode = function(handler, context) {
    return function(time) {
        this.$nodes.forEach(handler, context, time);
    }
};
'use strict';

/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 *
 * DESIGN NOTES
 * ============
 *
 * Because entity can fraquantly be added and removed,
 * them implemented by list.
 *
 */

var World = function(){
    this.$$injectedComponents = {};
    this.$$injectedModules = {};
    this.$$injectedSystems = {};

    this.$$systems = [];
    this.$$families = {};
    this.$$interval = 1;
    this.$$updating = false;
    this.$playing = false;

    this.$entities = new List();
    this.$name = '';
    //this.$$entitiesHead = this.$$entitiesTail = null;
    //this.$$entitiesCount = 0;
};

World.prototype.$has = function(name) {
    return isDefined(this.$$injectedComponents[name]) ||
           isDefined(this.$$injectedModules[name]) ||
           isDefined(this.$$injectedSystems[name]);
};

World.prototype.$isUse = function(value) {
    if (value instanceof System) {
        return this.$$systems.indexOf(value) >= 0;
    } else {
        for (var index = 0, count = this.$$systems.length; index < count; index++) {
            if (this.$$systems[index].name === value) {
                return true;
            }
        }
    }

    return false;
};

World.prototype.$add = function(value, config) {
    var instance;

    if (isString(value)){
        instance = this.$$injectedSystems[value];
        if (isUndefined(instance)) {
            throw new Error('Instance of "' + value + '" doesn\'t injected in the world "' + this.name + '".');
        }
    } else {
        instance = value;
    }

    if (instance instanceof Entity) {
        instance = this.$$addEntity(instance);
    } else if (instance instanceof System) {
        this.$$addSystem(instance);
    } else if (instance !== null) {
        instance = this.$system(value, config);
        this.$$addSystem(instance);
    }

    return instance;
};


World.prototype.$$addEntity = function(instance) {
    this.$entities.add(instance);
    instance.on('add', this.$$onComponentAdd, this);
    instance.on('remove', this.$$onComponentRemove, this);
    this.$$matchNewEntityToFamilies(instance);
    return instance;
};

World.prototype.$$removeEntity = function(instance) {
    this.$entities.remove(instance);
    this.$$matchRemoveEntityToFamilies(instance);
    instance.off('add', this.$$onComponentAdd);
    instance.off('remove', this.$$onComponentRemove);
    return instance;
};

World.prototype.$$getDependencyByAnnotation = function(annotation, target) {
    target = target || [];
    for (var i = 0, l = annotation.length; i < l; i++) {
        var name = annotation[i];
        target[i] = this.$$getDependencyByName(name);
    }
    return target;
};

World.prototype.$$getDependencyByName = function(name) {
    //TODO: Get from AngularJS
    switch(name) {
        case '$world':
            return this;
    }
    return this.$$getSystemByName(name);
};

World.prototype.$remove = function(instance) {
    if (instance instanceof Entity) {
        this.$$removeEntity(instance);
    } else if(instance instanceof System) {
        this.$$removeSystem(instance);
    } else {
        throw new Error('can\'t remove "' + instance + '" from world "' + this.name + '"' );
    }
};

World.prototype.$$getSystemByName = function(name) {
    for (var i = 0, l = this.$$systems.length; i < l; i++) {
        if (this.$$systems[i].name === name) {
            return this.$$systems[i];
        }
    }

    return null;
};

World.prototype.$$addSystem = function(instance) {
    this.$$systems.push(instance);

    instance.$$addedHandler();

    if (isDefined(instance.$require)) {
        instance.$setNodes(this.$queryByComponents(instance.$require));
    }

    return instance;
};

World.prototype.$$removeSystem = function(instance) {
    var index = this.$$systems.indexOf(instance);
    this.$$systems.splice(index);

    instance.init();

    instance.$$removedHandler();

    return instance;
};

World.prototype.$getByName = function(value) {
    var node = this.$entities._head;
    while(node) {
        var entity = node.instance;
        if (entity.$name === value) {
            return entity;
        }
        node = node.$next;
    }

    return null;
};

World.prototype.$numEntities = function() {
    return this.$entities.length();
};

/**
 * @ngdoc function
 * @name GameEngine.e
 * @function
 * @description Build Entity
 *
 * <pre>
 GameEngine.e('player',
 [
 'ngDOM', { color: 'rgb(255,0,0)' },
 'ng2D', {x : 0, y: 50},
 'ngControl',
 'ngCollision'
 ]));
 * </pre>
 *
 * @type {Function}
 */
World.prototype.$e = World.prototype.$entity = function() {
    var name = '';
    var componentsIndex = 0;

    if (isString(arguments[0])) {
        name = arguments[0];
        componentsIndex = 1;
    }

    var entity = new Entity();
    entity.$name =  name;
    entity.$$world = this;

    if (isArray(arguments[componentsIndex])) {
        var componentsArray = arguments[componentsIndex];
        for (var index = 0, count = componentsArray.length; index < count; index++) {
            if (isString(componentsArray[index])) {
                var componentName = componentsArray[index];
                var component = this.$$injectedComponents[componentName];
                var componentConfig = {};

                if (isUndefined(component)) {
                    throw new Error('World ' + this.name + ' doesn\'t has component ' + componentName + '. Only ' + this.$$injectedComponents);
                }

                if (isObject(componentsArray[index + 1])) {
                    index++;
                    componentConfig = componentsArray[index];
                } else {
                    componentConfig = null;
                }

                entity.$add(componentName, componentConfig);
            }
        }
    } else if (isObject(arguments[componentsIndex])) {
        var components = arguments[componentsIndex];
        for (var key in components) {
            if (components.hasOwnProperty(key) && key.charAt(0) !== '$') {
                entity.$add(key, components[key]);
            }
        }

        if (isDefined(components.$name)) {
            entity.$name = components.$name;
        }
    }

    return entity;
};

World.prototype.$c = World.prototype.$component = function(name, config) {
    var defaultConfig;
    var instance;

    if (!isString(name)) {
        throw new Error('1st argument must be [String]');
    }

    defaultConfig = this.$$injectedComponents[name];
    if (isUndefined(defaultConfig)) {
        throw new Error('Can\'t find component "' + name + '" definition. You need to add appropriate module to world.');
    }

    instance = copy(defaultConfig.defaultState);
    if (isDefined(config)) {
        swallowCopy(instance, config);
    }

    instance.$name = name;

    return instance;
};

/**
 * Prepare handle function by annotation [], or strait function.
 * Return function with injected dependency.
 *
 * @param context
 * @param annotation
 * @param customMatcher - custom annotation matcher. get array of arguments, return function(argsTarget, argsSource) {} to match arguments
 * @return {*}
 */
World.prototype.annotatedFunctionFactory = function(context, annotation, customMatcher) {
    if (isUndefined(annotation)) {
        return noop;
    } else if (isArray(annotation)) {
        customMatcher = customMatcher || noop;
        var fn = annotation[annotation.length - 1];
        var fnAnnotate = annotate(annotation);
        var args = this.$$getDependencyByAnnotation(fnAnnotate);
        var argumentsMatcher = customMatcher(fnAnnotate);
        if (isDefined(argumentsMatcher)) {
            return factoryOfFastFunctionWithMatcher(fn, context, args, argumentsMatcher);
        } else {
            return factoryOfFastFunction(fn, context, args);
        }
    } else {
        return annotation;
    }
};

function matchFactory(annotation, name) {
    var index = annotation.indexOf(name);
    if (index >= 0) {
        return function(args, value) {
            args[index] = value;
        };
    } else {
        return noop;
    }
};

function beforeAfterUpdateCustomMatcher(annotation) {
    var match$time = matchFactory(annotation, '$time');
    var match$nodes = matchFactory(annotation, '$nodes');

    return function(argsTarget, argsSource) {
        match$time(argsTarget, argsSource[0]);
        match$nodes(argsTarget, argsSource[1]);
    };
}

/**
 * Build instance of System
 *
 * @type {Function}
 */
World.prototype.$s = World.prototype.$system = function(name, config) {
    var defaultConfig = this.$$injectedSystems[name];
    var systemInstance = new System();
    copy(defaultConfig, systemInstance, false);

    if (isDefined(config)) {
        copy(config, systemInstance, false);
    }

    systemInstance.$$beforeUpdateHandler = this.annotatedFunctionFactory(systemInstance, systemInstance.$beforeUpdate, beforeAfterUpdateCustomMatcher);
    systemInstance.$$afterUpdateHandler = this.annotatedFunctionFactory(systemInstance, systemInstance.$afterUpdate, beforeAfterUpdateCustomMatcher);

    if (isDefined(systemInstance.$update)) {
        if (isArray(systemInstance.$update)) {
            var updateArray = systemInstance.$update;
            var updateHandler = updateArray[updateArray.length - 1];
            var updateAnnotate = annotate(updateArray);

            var args = this.$$getDependencyByAnnotation(updateAnnotate);

            var match$node = matchFactory(updateAnnotate, '$node');
            var match$nodes = matchFactory(updateAnnotate, '$nodes');
            var match$time = matchFactory(updateAnnotate, '$time');
            var match$world = matchFactory(updateAnnotate, '$world');

            var worldInstance = this;

            var updateFunction = factoryOfFastFunction(updateHandler, systemInstance, args);

            var updateForEveryNode = updateAnnotate.indexOf('$node') >= 0;
            if (updateForEveryNode) {
                systemInstance.$$updateHandler = systemInstance.$$updateEveryNode(function(node, time) {
                    match$time(args, time);
                    match$node(args, node);
                    match$nodes(args, systemInstance.$nodes);
                    match$world(args, worldInstance);

                    updateFunction();
                });
            } else {
                systemInstance.$$updateHandler = function(time) {
                    match$time(args, time);
                    match$nodes(args, systemInstance.$nodes);
                    match$world(args, worldInstance);

                    updateFunction();
                };
            }
        } else {
            systemInstance.$$updateHandler = systemInstance.$update;
        }
    }

    if (isDefined(systemInstance.$added)) {
        systemInstance.$$addedHandler = this.annotatedFunctionFactory(systemInstance, systemInstance.$added, noop);
    } else {
        systemInstance.$$addedHandler = noop;
    }

    if (isDefined(systemInstance.$removed)) {
        systemInstance.$$removedHandler = this.annotatedFunctionFactory(systemInstance, systemInstance.$removed, noop);
    } else {
        systemInstance.$$removedHandler = noop;
    }

    if (isDefined(systemInstance.$addNode)) {
        //TODO : inject all dependency
        systemInstance.$$addNodeHandler = this.annotatedFunctionFactory(systemInstance, systemInstance.$addNode, addRemoveNodeCustomMatcher);
    } else {
        systemInstance.$$addNodeHandler = noop;
    }

    if (isDefined(systemInstance.$removeNode)) {
        //TODO : inject all dependency
        systemInstance.$$removeNodeHandler = this.annotatedFunctionFactory(systemInstance, systemInstance.$removeNode, addRemoveNodeCustomMatcher);
    } else {
        systemInstance.$$removeNodeHandler = noop;
    }

    return systemInstance;
};

function addRemoveNodeCustomMatcher(annotation) {
    for (var i = 0, l = annotation.length; i < l; i++) {
        if (annotation[i] === '$node') {
            return function(argsTarget, argsSource) {
                argsTarget[i] = argsSource[0];
            };
        }
    }

    return noop;
}

/**
 * Architecture Design:
 *
 * Goal:
 * Should apply only one match function simultaneously.
 *
 * Solution:
 * BeforeMatch we are verify that we are not in match phase. Is so, just store operation.
 * in AfterMatch we are execute each stored operations
 *
 * @param entity
 */
World.prototype.$$matchNewEntityToFamilies = function (entity) {
    if (!beforeMatch(entity, 'matchNewEntityToFamilies', this, this.$$matchNewEntityToFamilies, arguments)) {
        return;
    }

    for (var componentsString in this.$$families) {
        var family = this.$$families[componentsString];
        family.newEntity(entity);
    }

    afterMatch(entity, 'matchNewEntityToFamilies');
};

World.prototype.$$matchRemoveEntityToFamilies = function (entity) {
    if (!beforeMatch(entity, 'matchRemoveEntityToFamilies', this, this.$$matchRemoveEntityToFamilies, arguments)) {
        return;
    }

    for (var componentsString in this.$$families) {
        var family = this.$$families[componentsString];
        family.removeIfMatch(entity);
    }

    afterMatch(entity, 'matchRemoveEntityToFamilies');
};

World.prototype.$$onComponentAdd = function(entity, component) {
    if (!beforeMatch(entity, 'onComponentAdd', this, this.$$onComponentAdd, arguments)) {
        return;
    }

    for (var componentsString in this.$$families) {
        var family = this.$$families[componentsString];
        family.addIfMatch(entity);
    }

    afterMatch(entity, 'onComponentAdd');
};

World.prototype.$$onComponentRemove = function(entity, component) {
    if (!beforeMatch(entity, 'onComponentRemove', this, this.$$onComponentRemove, arguments)) {
        return;
    }

    for (var componentsString in this.$$families) {
        var family = this.$$families[componentsString];
        family.removeIfMatch(entity, component);
    }

    afterMatch(entity, 'onComponentRemove');
};

function beforeMatch(entity, phase, context, phaseFunction, args) {
    if (isUndefined(entity._matchingToFamily)) {
        entity._matchingToFamily = {
            processing: false,
            phases: {}
        };
    }

    var phaseHandler = entity._matchingToFamily.phases[phase];
    if (isUndefined(phaseHandler)) {
        phaseHandler = [];
        entity._matchingToFamily.phases[phase] = phaseHandler;
    }

    if(entity._matchingToFamily.processing) {
        phaseHandler.push({
            fn: phaseFunction,
            ctx: context,
            args: args
        });
        return false;
    }

    entity._matchingToFamily.processing = true;
    return true;
}

function afterMatch(entity, phase) {
    entity._matchingToFamily.processing = false;
    var phases = entity._matchingToFamily.phases;
    for (var key in phases) {
        if (phases.hasOwnProperty(key)) {
            var phaseHandlerArray = entity._matchingToFamily.phases[key];
            if (phaseHandlerArray.length > 0) {
                var phaseHandler = phaseHandlerArray.pop();
                phaseHandler.fn.apply(phaseHandler.ctx, phaseHandler.args);
                return;
            }
        }
    }
}

World.prototype.$queryByComponents = function(request) {
    var componentsArray;
    var componentsString;
    var componentsHash = {};
    if (isArray(request)) {
        componentsString = request.join(',');
        componentsArray = request;
    } else if (isString(request)) {
        componentsString = request;
        componentsArray = request.split(',');
    }

    if (this.$$families[componentsString]) {
        return this.$$families[componentsString].nodes;
    }

    for(var i = 0, l = componentsArray.length; i < l; i++) {
        componentsHash[componentsArray[i]] = true;
    }

    var family = new Family();
    family.components = componentsArray;
    family.componentsHash = componentsHash;
    family.componentsString = componentsString;
    this.$$families[componentsString] = family;
    this.$entities.forEach(function(e) {
        family.newEntity(e);
    });
    return family.nodes;
};

World.prototype.$update = function(time) {
    this.$$updating = true;
    time = time || this.$$interval;
    for (var index = 0, count = this.$$systems.length; index < count; index++) {
        var system = this.$$systems[index];
        system.$$beforeUpdateHandler(time, system.$nodes);
        system.$$updateHandler(time);
        system.$$afterUpdateHandler(time, system.$nodes);
    }
    this.$$updating = false;
};

World.prototype.$start = function() {
    if (this.$playing) {
        return;
    }

    this.$playing = true;

    var self = this;
    var previousTime = 0;
    (function step(time) {
        var deltaTime = 0;
        if (previousTime) {
            deltaTime = time - previousTime;
        }

        self.$update(deltaTime);
        previousTime = time;
        if (self.$playing) {
            self.$requestAnimationFrameId = window.requestAnimationFrame(step);
        }
    })(0);
};

World.prototype.$stop = function() {
    if (!this.$playing) {
        return;
    }
    this.$playing = false;

    window.cancelAnimationFrame(this.$requestAnimationFrameId);
};

})(window);
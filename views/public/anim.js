/// <reference path="_.js" />

(function (window) {

    var getStyleEl = (function () {
        var style = null;
        return function () {
            return !style ? style = document.head.appendChild(document.createElement("style")) : style;
        }
    })();

    var getNextIdFunc = (function () {
        var cache = {};
        return function (prefix) {
            if (cache[prefix]) return cache[prefix];
            return cache[prefix] = (function () {
                var last = 0;
                return function () {
                    return prefix + (++last).toString();
                }
            })();
        }
    })();

    var getNextAnimName = getNextIdFunc('anim');
    var getNextClassName = getNextIdFunc('animclass');

    var animate = function (element, animRules, keyFrames) {
        var className = getNextClassName();
        makeAnimation(className, animRules, keyFrames, {}).ready();
        if(!element.addClass())
            if (!!element.classList) element.classList.add(className); else element.setAttribute('class', element.getAttribute('class') + ' ' + className);
        element.addClass(className); // jquery
    };

    var makeAnimation = function (className, animRules, keyFrames, defaultRules) {
        var selector = '.' + className;
        return Object.create(animation_type, {
            animCssBlock: createPropVal(makeAnimationCssBlock(selector, getNextAnimName(), animRules, defaultRules), true, true, false),
            keyFrameBlocks: createPropVal(_.map(keyFrames, function (item) { return makeKeyframeBlock(item.percent, item.rules); }), true, true, false)
        });
    };

    var animation_type = {
        animCssBlock: null,
        keyFrameBlocks: [],
        toKeyFramesCssString: function () {
            var keyFramesBlockPrefix = !!CSSRule.KEYFRAMES_RULE ? "@keyframes " : "@-webkit-keyframes ";
            return keyFramesBlockPrefix + this.animCssBlock.animName + " { \n" +
            _.map(this.keyFrameBlocks, function (b) { return b.toCssString() }).join("\n") + "\n}";
        },
        toCssString: function () {
            return this.animCssBlock.toCssString() + "\n" + this.toKeyFramesCssString();
        },
        ready: function () {
            getStyleEl().sheet.insertRule(this.animCssBlock.toCssString(), 0);
            getStyleEl().sheet.insertRule(this.toKeyFramesCssString(), 0);
            return this;
        }
    };

    var makeAnimationCssBlock = function (selector, animName, animRules, normalRules) {
        var rules = !normalRules ? {} : normalRules;
        animRules['name'] = animName;
        var mapped = _.map(animRules, function (val, name) {
            return { name: name.indexOf('animation-') == 0 ? name : 'animation-' + name, val: val };
        });
        var reduced = _.reduce(mapped, function (memo, obj) {
            memo[obj.name] = obj.val;
            return memo;
        }, rules);

        var block = makeCssBlock(selector, reduced);
        return Object.defineProperty(block, 'animName', createPropVal(animName, true, true, false));
    };


    var makeKeyframeBlock = function (percent, rules) {
        return makeCssBlock(percent + '%', rules);
    };


    var css_block_type = {
        name: '',
        rules: {},
        toCssString: function () {
            return this.name + ' {\n' +
        _.reduce(this.rules, function (memo, val, name) {
                return memo + (prefixify(name) + ": " + val + ";") + "\n";
            }, "")
        + '}';
        }
    };

    var makeCssBlock = function (name, rules) {
        return Object.create(css_block_type, {
            'name': createPropVal(name, true, true, false),
            'rules': createPropVal(rules, true, true, false)
        });
    };



    var prefixify = (function () {

        var prefix = (function () {
            var test = document.createElement("div"),
        prefixes = ["", "-webkit-", "-Moz-", '-ms-', "-O-"],
        i = prefixes.length,
        prefix;

            while (i--) {
                prefix = prefixes[i];
                test.style.cssText = prefix.toLowerCase() + "transform:scale(1,1);";
                if (typeof test.style[prefix + "transform"] != "undefined")
                    return prefix;
            }

            return prefix;
        })();

        var prefixifiables = ['animation-name', 'animation-duration', 'animation-delay', 'animation-iteration-count', 'animation-timing-function',
        'animation-fill-mode', 'animation-direction', 'transform', 'opacity'];

        return function (name) {
            var lowername = name.toLowerCase();
            return _.any(prefixifiables, function (n) { return n == lowername; }) ? prefix + name : name;
        };
    })();

    var createPropVal = function (value, enumerable, writable, configurable) {
        return { value: value, enumerable: !!enumerable, writable: !!writable, configurable: !!configurable };
    };

    window.makeAnimation = makeAnimation;
    window.animate = animate;
})(window);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The central resource manager for your game.
 * Resources can be accessed from anywhere.
 * Add images, audio, etc and extend with your own methods (like loading levels).
 */
var Resource = null;
var mag = function (_) {

    var _Resource = function () {

        // USAGE EXAMPLE: Resource.audio('pop');

        var __RESOURCE_PATH = 'resources/';
        var __AUDIO_PATH = __RESOURCE_PATH + 'audio/';
        var __GRAPHICS_PATH = __RESOURCE_PATH + 'graphics/';

        var audioRsc = {};
        var audioEngineLoaded = false;
        var audioEngine = 'html5';

        var imageRsc = {};
        var animPresets = {};

        // Call this before running and load[...]() methods,
        // and call afterDoneLoading to trigger an event
        // when all assets in the sequence are loaded.
        var loadSequences = {};
        var currentLoadSequence = null;
        var setCurrentLoadSequence = function setCurrentLoadSequence(seqName) {
            if (!seqName) {
                console.error('Resource: Please specify a name for the load sequence.');
                return;
            } else if (seqName in loadSequences) {
                console.warn('Resource: Load sequence already named.');
                return;
            }
            loadSequences[seqName] = {
                'setOnload': function setOnload(rsc, type) {
                    loadSequences[seqName].length++;
                    var cb = function cb() {
                        var seq = loadSequences[seqName];
                        seq.loadCount++;
                        if (seq.queryFinished) seq.queryFinished();
                    };
                    if (type === 'audio') {
                        rsc.addEventListener('loadeddata', cb, false);
                    } else if (type === 'image') {
                        rsc.onload = cb;
                    }
                },
                'loadCount': 0,
                'queryFinished': null, // set in afterDoneLoading
                'length': 0
            };
            currentLoadSequence = seqName;
        };
        var afterLoadSequence = function afterLoadSequence(seqName, onComplete) {
            if (!seqName) {
                console.error('Resource: Please specify a name for the load sequence.');
                return;
            } else if (!onComplete) {
                console.error('Resource: Please specify a callback function for the load sequence.');
                return;
            } else if (!(seqName in loadSequences)) {
                console.error('Resource: Load sequence named "' + seqName + '" is not an active sequence.');
                return;
            }
            loadSequences[seqName].queryFinished = function () {
                var seq = loadSequences[seqName];
                // Check if all resources are loaded...
                if (seq.loadCount >= seq.length) onComplete();
            };
            loadSequences[seqName].queryFinished(); // check immediately, in case all resources are already loaded...
            currentLoadSequence = null;
        };

        var loadAudio = function loadAudio(alias, filename) {
            if (!audioEngineLoaded) {
                if (window.lowLag) {
                    try {
                        lowLag.init({ 'sm2url': 'lib/sm2/swf/', 'debug': 'none' });
                        audioEngine = 'lowLag';
                    } catch (err) {
                        console.error(err);
                        audioEngine = 'html5';
                    }
                }
                audioEngineLoaded = true;
            }

            var audio = new Audio(__AUDIO_PATH + filename);
            if (currentLoadSequence) {
                loadSequences[currentLoadSequence].setOnload(audio, 'audio');
            }
            audioRsc[alias] = audio;

            // Cross-browser low-latency audio.
            if (window.lowLag) window.lowLag.load([__AUDIO_PATH + filename], alias);
        };
        var loadImage = function loadImage(alias, filename) {
            var img = new ImageProxy(alias, __GRAPHICS_PATH + filename);
            if (currentLoadSequence) {
                loadSequences[currentLoadSequence].setOnload(img, 'image');
            }
            imageRsc[alias] = img;
        };
        var loadImageSequence = function loadImageSequence(alias, filename, range) {
            var a = filename.split('.');
            var name = a[0];
            var ext = a[1];
            for (var i = range[0]; i <= range[1]; i++) {
                loadImage(alias + i, name + i + '.' + ext);
            }
        };
        var loadAnimation = function loadAnimation(imageSeqAlias, range, duration) {
            try {
                animPresets[imageSeqAlias] = _.Animation.forImageSequence(imageSeqAlias, range, duration);
            } catch (e) {
                console.log(e);
            }
        };
        var loadImageAtlas = function loadImageAtlas(alias, filename) {
            var atlas = new ImageAtlas(alias, __GRAPHICS_PATH + filename, function (spriteName, sprite) {
                if (!imageRsc[spriteName]) {
                    imageRsc[spriteName] = sprite;
                }
            });

            if (currentLoadSequence) {
                loadSequences[currentLoadSequence].setOnload(atlas, 'image');
            }
        };

        var muted = false;
        if (getCookie("muted") === "true") {
            muted = true;
        }

        return { // TODO: Add more resource types.
            setCurrentLoadSequence: setCurrentLoadSequence,
            afterLoadSequence: afterLoadSequence,
            loadImage: loadImage,
            loadImageSequence: loadImageSequence,
            loadAnimation: loadAnimation,
            loadImageAtlas: loadImageAtlas,
            loadAudio: loadAudio,
            audio: audioRsc,
            image: imageRsc,
            path: __RESOURCE_PATH,
            getImage: function getImage(name) {
                return imageRsc[name];
            },
            getAudio: function getAudio(name) {
                return audioRsc[name];
            },
            getAnimation: function getAnimation(name) {
                return animPresets[name].clone();
            },
            play: function play(alias, volume) {
                if (muted) return;
                if (audioEngine === 'html5') {
                    if (volume) audioRsc[alias].volume = volume;else audioRsc[alias].volume = 1.0;
                    audioRsc[alias].play();
                } else {
                    lowLag.play(alias);
                }
            },
            mute: function mute() {
                muted = true;
                setCookie("muted", "true", 1000);
            },
            unmute: function unmute() {
                muted = false;
                setCookie("muted", "false", 1000);
            },
            isMuted: function isMuted() {
                return muted;
            }
        };
    }();

    // Exports
    _.Resource = _Resource;
    Resource = _Resource;
    return _;
}(mag || {});

var ImageAtlas = function () {
    function ImageAtlas(alias, src, addSprite) {
        var _this = this;

        _classCallCheck(this, ImageAtlas);

        this.callback = null;

        // Load the JSON
        $.getJSON(src).then(function (atlas) {
            var imageFile = atlas.meta.image;
            var path = src.split("/");
            path[path.length - 1] = imageFile;
            path = path.join("/");

            _this.img = new Image();
            _this.img.src = path;
            _this.img.alt = alias;
            _this.img.onload = function () {
                // Parse the atlas and add all the images
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = Object.keys(atlas.frames)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var frameName = _step.value;

                        var frame = atlas.frames[frameName];
                        // Convert resource-name.png to resource-name
                        var resourceName = frameName.split(".")[0];
                        var resource = new ImageAtlasProxy(resourceName, _this, frame.frame);
                        addSprite(resourceName, resource);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                if (_this.callback) {
                    _this.callback();
                }
            };
        });
    }

    _createClass(ImageAtlas, [{
        key: 'onload',
        set: function set(callback) {
            // Keep the callback and call it once we are completely done
            this.callback = callback;
            // TODO: if we are already done, call the callback right away
        }
    }]);

    return ImageAtlas;
}();

var ImageProxy = function () {
    function ImageProxy(alias, src) {
        _classCallCheck(this, ImageProxy);

        this.img = new Image();
        this.img.src = src;
        this.img.alt = alias;
    }

    _createClass(ImageProxy, [{
        key: 'draw',
        value: function draw(ctx, x, y) {
            var w = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
            var h = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

            if (w === null) {
                w = this.naturalWidth;
            }
            if (h === null) {
                h = this.naturalHeight;
            }

            ctx.drawImage(this.img, x, y, w, h);
        }
    }, {
        key: 'onload',
        set: function set(callback) {
            this.img.onload = callback;
        }
    }, {
        key: 'naturalWidth',
        get: function get() {
            return this.img.naturalWidth;
        }
    }, {
        key: 'naturalHeight',
        get: function get() {
            return this.img.naturalHeight;
        }
    }, {
        key: 'backingImage',
        get: function get() {
            // This should raise an error for the AtlasProxy - you
            // shouldn't be able to manipulate the backing image
            return this.img;
        }
    }]);

    return ImageProxy;
}();

var ImageAtlasProxy = function () {
    function ImageAtlasProxy(alias, atlas, frame) {
        _classCallCheck(this, ImageAtlasProxy);

        this.alias = alias;
        this.atlas = atlas;
        this.frame = frame;
    }

    _createClass(ImageAtlasProxy, [{
        key: 'draw',
        value: function draw(ctx, x, y) {
            var w = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
            var h = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

            if (w === null) {
                w = this.naturalWidth;
            }
            if (h === null) {
                h = this.naturalHeight;
            }

            ctx.drawImage(this.atlas.img, this.frame.x, this.frame.y, this.frame.w, this.frame.h, x, y, w, h);
        }
    }, {
        key: 'naturalWidth',
        get: function get() {
            return this.frame.w;
        }
    }, {
        key: 'naturalHeight',
        get: function get() {
            return this.frame.h;
        }
    }, {
        key: 'backingImage',
        get: function get() {
            throw {
                "error": "Can't get the backing image of an image in an image atlas"
            };
        }
    }]);

    return ImageAtlasProxy;
}();
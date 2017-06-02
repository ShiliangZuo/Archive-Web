'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MenuButton = function (_mag$RoundedRect) {
    _inherits(MenuButton, _mag$RoundedRect);

    function MenuButton(x, y, w, h, text, onclick) {
        var color = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'gold';
        var textColor = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 'orange';
        var shadowColor = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 'orange';
        var onDownShadowColor = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : 'red';

        _classCallCheck(this, MenuButton);

        var _this2 = _possibleConstructorReturn(this, (MenuButton.__proto__ || Object.getPrototypeOf(MenuButton)).call(this, x, y, w, h, 10));

        var t = new TextExpr(text, 'Futura');
        t.color = textColor;
        t.anchor = { x: 0.5, y: 0.5 };
        t.pos = { x: w / 2, y: h / 2 };
        _this2.text = t;
        _this2.addChild(t);

        _this2.origShadowOffset = 14;
        _this2.shadowOffset = 14;
        _this2.hoverIndent = -4;
        _this2.downIndent = 4;
        _this2.shadowColor = shadowColor;
        _this2.onDownColor = shadowColor;
        _this2.onDownShadowColor = onDownShadowColor;
        _this2.onUpShadowColor = shadowColor;
        _this2.onUpColor = color;
        _this2.textColor = textColor;
        _this2.color = color;

        _this2.clickFunc = onclick;

        _this2.pos = { x: x, y: y };
        return _this2;
    }

    _createClass(MenuButton, [{
        key: 'runButtonClickEffect',
        value: function runButtonClickEffect() {
            var _this3 = this;

            var rr = new mag.RoundedRect(this.absolutePos.x, this.absolutePos.y, this.absoluteSize.w, this.absoluteSize.h, this.radius);
            rr.color = null;
            rr.shadowOffset = 0;
            rr.anchor = this.anchor;
            rr.ignoreEvents = true;
            rr.stroke = { color: 'white', lineWidth: 4, opacity: 1.0 };
            this.stage.add(rr);

            Animate.chain(function (elapsed) {
                var c = colorTween(elapsed, [1, 215 / 255.0, 0], [1, 1, 1]);
                var sc = colorTween(elapsed, [1, 0, 0], [0.8, 0.8, 0.8]);
                _this3.color = c;
                _this3.text.color = c;
                _this3.shadowColor = sc;
                _this3.stage.draw();
            }, 200, null, function (elapsed) {
                //elapsed = elapsed * elapsed;
                rr.scale = { x: 1 + elapsed, y: 1 + elapsed };
                rr.stroke.opacity = 1 - elapsed;
                _this3.stage.draw();
            }, 160, function () {
                _this3.stage.remove(rr);
                _this3.onmouseleave();
                _this3.stage.draw();
                if (_this3.clickFunc) {
                    _this3.clickFunc();
                }
            });
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            this.color = this.onDownColor;
            this.shadowColor = this.onDownShadowColor;
            this.shadowOffset = this.origShadowOffset - this.hoverIndent;
            this.text.color = 'white';
            this._pos.y += this.hoverIndent;
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            this.color = this.onUpColor;
            this.shadowColor = this.onUpShadowColor;
            this.text.color = this.textColor;
            this._pos.y = this._origpos.y;
            this.shadowOffset = this.origShadowOffset;
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            var hits = this.hits(pos);
            if (!hits && this.color !== this.onUpColor) {
                this.onmouseleave(pos);
            } else if (this.color === this.onUpColor && hits) {
                this.onmouseenter(pos);
                this.onmousedown(pos);
            }
        }
    }, {
        key: 'onmousedown',
        value: function onmousedown(pos) {
            this._prevy = this._pos.y;
            this._pos.y += this.shadowOffset - this.downIndent;
            this.shadowOffset = this.downIndent;
            //this.color = this.onUpColor;
            Resource.play('fatbtn-click');
        }
    }, {
        key: 'onmouseup',
        value: function onmouseup(pos) {
            if (!this.hits(pos)) return;
            this._pos.y = this._origpos.y;
            this.shadowOffset = this.origShadowOffset;
            this.runButtonClickEffect();
            Animate.wait(50).after(function () {
                return Resource.play('fatbtn-beep');
            });
        }
    }, {
        key: 'pos',
        get: function get() {
            return { x: this._pos.x, y: this._pos.y };
        },
        set: function set(p) {
            _set(MenuButton.prototype.__proto__ || Object.getPrototypeOf(MenuButton.prototype), 'pos', p, this);
            this._origpos = { x: p.x, y: p.y };
        }
    }]);

    return MenuButton;
}(mag.RoundedRect);

var MenuStar = function (_mag$ImageRect) {
    _inherits(MenuStar, _mag$ImageRect);

    function MenuStar() {
        _classCallCheck(this, MenuStar);

        return _possibleConstructorReturn(this, (MenuStar.__proto__ || Object.getPrototypeOf(MenuStar)).call(this, 'mainmenu-star' + Math.floor(Math.random() * 14 + 1)));
    }

    _createClass(MenuStar, [{
        key: 'twinkle',
        value: function twinkle() {
            var dur = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 350;

            var blinkDur = dur + Math.random() * 100;
            var _this = this;
            var blink = function blink() {
                if (_this.cancelBlink) return;
                Animate.tween(_this, { opacity: 0.4 }, blinkDur, function (e) {
                    return Math.pow(e, 2);
                }).after(function () {
                    if (_this.cancelBlink) return;
                    Animate.tween(_this, { opacity: 1 }, blinkDur, function (e) {
                        return Math.pow(e, 2);
                    }).after(blink);
                });
            };
            blink();
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            if (this.parent && Number.isNumber(this.parent.opacity)) {
                ctx.globalAlpha = this.parent.opacity * (this.opacity || 1.0);
            }
            _get(MenuStar.prototype.__proto__ || Object.getPrototypeOf(MenuStar.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);
        }
    }]);

    return MenuStar;
}(mag.ImageRect);

var MainMenu = function (_mag$Stage) {
    _inherits(MainMenu, _mag$Stage);

    function MainMenu() {
        var canvas = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var onClickPlay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var onClickSettings = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, MainMenu);

        var _this5 = _possibleConstructorReturn(this, (MainMenu.__proto__ || Object.getPrototypeOf(MainMenu)).call(this, canvas));

        var bg = new mag.Rect(0, 0, GLOBAL_DEFAULT_SCREENSIZE.width, GLOBAL_DEFAULT_SCREENSIZE.height);
        bg.color = '#594764';
        bg.pos = zeroPos();
        bg.ignoreEvents = true;
        _this5.add(bg);
        _this5.bg = bg;

        _this5.showStars();
        _this5.showStarboy(onClickPlay);
        _this5.showTitle();
        //this.showPlayButton(onClickPlay);
        //this.showSettingsButton(onClickSettings);
        return _this5;
    }

    _createClass(MainMenu, [{
        key: 'showStars',
        value: function showStars() {
            var _this6 = this;

            var NUM_STARS = 70;
            var STARBOY_RECT = { x: GLOBAL_DEFAULT_SCREENSIZE.width / 2.0 - 298 / 1.8 / 2, y: GLOBAL_DEFAULT_SCREENSIZE.height / 2.1 - 385 / 1.8 / 2, w: 298 / 1.8, h: 385 / 1.8 };
            var genRandomPt = function genRandomPt() {
                return randomPointInRect({ x: 0, y: 0, w: GLOBAL_DEFAULT_SCREENSIZE.width, h: GLOBAL_DEFAULT_SCREENSIZE.height });
            };
            var stars = [];
            var n = NUM_STARS;

            var _loop = function _loop() {

                // Create an instance of a star illustration.
                var star = new MenuStar();
                //star.anchor = { x:0.5, y:0.5 };

                // Find a random position that doesn't intersect other previously created stars.
                var p = genRandomPt();

                // Limit how many times we try (mobile optimization)
                var tries = 0;

                for (var i = 0; i < stars.length; i++) {
                    var s = stars[i];
                    var prect = { x: p.x, y: p.y, w: star.size.w, h: star.size.h };
                    var srect = { x: s._pos.x, y: s._pos.y, w: s.size.w, h: s.size.h };
                    tries++;
                    if ((intersects(STARBOY_RECT, prect) || intersects(prect, srect)) && tries < 100) {
                        p = genRandomPt();
                        i = 0;
                    }
                }

                // Set star properties
                star.pos = p;
                star.opacity = 0.4;
                var scale = Math.random() * 0.3 + 0.3;
                star.scale = { x: scale, y: scale };
                _this6.add(star);
                stars.push(star);

                // Twinkling effect
                Animate.wait(1000 * Math.random()).after(function () {
                    return star.twinkle();
                });

                // "Zoom"
                var screenCenter = { x: GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y: GLOBAL_DEFAULT_SCREENSIZE.height / 2.0 };
                var fromCenter = fromTo(screenCenter, star.pos);
                var offscreenDest = addPos(screenCenter, rescalePos(fromCenter, screenCenter.x * 1.6));
                var comebackDest = addPos(screenCenter, rescalePos(fromCenter, 120));
                var zoom = function zoom() {
                    Animate.tween(star, { pos: offscreenDest, scale: { x: 0.6, y: 0.6 } }, 3000 * distBetweenPos(star.pos, screenCenter) / distBetweenPos(offscreenDest, screenCenter), function (e) {
                        return Math.pow(e, 0.8);
                    }).after(function () {
                        star.pos = comebackDest;
                        star.scale = { x: scale, y: scale };
                        star.opacity = 0;
                        zoom();
                    });
                };
                star.zoomAnimation = function () {

                    zoom();
                    //Animate.wait(distBetweenPos(p, screenCenter) / distBetweenPos(offscreenDest, screenCenter) * 1000).after(zoom);
                };
            };

            while (n-- > 0) {
                _loop();
            }
            this.stars = stars;
        }
    }, {
        key: 'zoom',
        value: function zoom() {
            this.stars.forEach(function (star) {
                star.zoomAnimation();
            });
        }
    }, {
        key: 'showStarboy',
        value: function showStarboy(onclick) {
            var _this7 = this;

            var bg = this.bg;
            var _this = this;
            var starboy = new mag.Button(0, 0, 298 / 1.8, 385 / 1.8, { default: 'mainmenu-starboy', hover: 'mainmenu-starboy-glow', down: 'mainmenu-starboy-glow' }, function () {
                if (_this.title) _this.remove(_this.title);
                Resource.play('mainmenu-enter');
                starboy.cancelFloat = true;
                starboy.ignoreEvents = true;
                Animate.tween(starboy, { scale: { x: 0.0, y: 0.0 } }, 2500, function (e) {
                    return Math.pow(e, 2);
                });
                Animate.wait(2000).after(function () {
                    Animate.run(function (e) {
                        bg.color = colorTween(e, [89 / 255.0, 71 / 255.0, 100 / 255.0], [0, 0, 0]);
                        _this.stars.forEach(function (s) {
                            s.opacity = 1 - e;
                            s.cancelBlink = true;
                        });
                        _this.draw();
                    }, 700).after(function () {
                        _this.stars.forEach(function (s) {
                            _this.remove(s);
                        });
                        _this.stars = [];
                        _this.remove(starboy);
                        _this.starboy = null;
                        _this.draw();
                        onclick();
                    });
                });
                _this7.zoom();
            });
            starboy.anchor = { x: 0.5, y: 0.5 };
            starboy.pos = { x: GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y: GLOBAL_DEFAULT_SCREENSIZE.height / 2.1 };
            this.add(starboy);

            var y = starboy._pos.y;
            var float = 0;
            var twn = new mag.IndefiniteTween(function (delta) {
                float += delta / 600;
                starboy.pos = { x: starboy.pos.x, y: y + Math.cos(float) * 14 };
                if (starboy.cancelFloat) twn.cancel();
            });
            twn.run();

            this.starboy = starboy;
        }
    }, {
        key: 'showTitle',
        value: function showTitle() {
            var title = new TextExpr('R   E   D   U   C   T', 'Consolas', 30);
            title.color = 'white';
            title.anchor = { x: 0.5, y: 0.5 };
            title.pos = { x: GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y: GLOBAL_DEFAULT_SCREENSIZE.height / 1.2 };
            this.add(title);
            this.title = title;
        }
    }, {
        key: 'showPlayButton',
        value: function showPlayButton(onClickPlay) {
            var b = new MenuButton(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, GLOBAL_DEFAULT_SCREENSIZE.height / 2.0 + 80, 140, 100, 'Play', onClickPlay);
            b.anchor = { x: 0.5, y: 0.5 };
            this.add(b);
        }
    }, {
        key: 'showSettingsButton',
        value: function showSettingsButton(onClickSettings) {
            var b = new MenuButton(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, GLOBAL_DEFAULT_SCREENSIZE.height / 2.0 + 80 + 120, 140, 60, 'Settings', onClickSettings, 'Purple', 'lightgray', 'Indigo', 'Purple');
            b.anchor = { x: 0.5, y: 0.5 };
            this.add(b);
        }
    }, {
        key: 'onorientationchange',
        value: function onorientationchange() {
            this.starboy.pos = { x: GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y: GLOBAL_DEFAULT_SCREENSIZE.height / 2.1 };
            this.title.pos = { x: GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y: GLOBAL_DEFAULT_SCREENSIZE.height / 1.2 };
            this.bg.size = {
                w: GLOBAL_DEFAULT_SCREENSIZE.width, h: GLOBAL_DEFAULT_SCREENSIZE.height
            };
        }
    }]);

    return MainMenu;
}(mag.Stage);

var DraggableRect = function (_mag$Rect) {
    _inherits(DraggableRect, _mag$Rect);

    function DraggableRect() {
        _classCallCheck(this, DraggableRect);

        return _possibleConstructorReturn(this, (DraggableRect.__proto__ || Object.getPrototypeOf(DraggableRect)).apply(this, arguments));
    }

    _createClass(DraggableRect, [{
        key: 'constrainX',
        value: function constrainX() {
            this.cX = true;
        }
    }, {
        key: 'constrainY',
        value: function constrainY() {
            this.cY = true;
        }
    }, {
        key: 'snapEvery',
        value: function snapEvery(step, offset) {
            this.snapStep = step;this.snapOffset = offset;
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            if (this.cX) pos.x = this.pos.x;
            if (this.cY) pos.y = this.pos.y;
            this.pos = pos;
        }
    }, {
        key: 'onmouseup',
        value: function onmouseup(pos) {
            if (!this.snapStep) {
                _get(DraggableRect.prototype.__proto__ || Object.getPrototypeOf(DraggableRect.prototype), 'onmouseup', this).call(this, pos);
                return;
            }

            var targetPos = { x: Math.round(this.pos.x / this.snapStep) * this.snapStep + this.snapOffset, y: this.pos.y };
            Animate.tween(this, { pos: targetPos }, 200, function (elapsed) {
                return Math.pow(elapsed, 0.5);
            });
        }
    }]);

    return DraggableRect;
}(mag.Rect);

var LevelCell = function (_MenuButton) {
    _inherits(LevelCell, _MenuButton);

    function LevelCell() {
        _classCallCheck(this, LevelCell);

        return _possibleConstructorReturn(this, (LevelCell.__proto__ || Object.getPrototypeOf(LevelCell)).apply(this, arguments));
    }

    _createClass(LevelCell, [{
        key: 'lock',
        value: function lock() {
            this.text.text = '🔒';
            this.color = '#666';
            this.shadowColor = 'gray';
            this.pos = { x: this.pos.x, y: this.pos.y + this.shadowOffset - 8 };
            this.shadowOffset = 8;
            this.ignoreEvents = true;
        }
    }]);

    return LevelCell;
}(MenuButton);

var LevelSelectGrid = function (_mag$Rect2) {
    _inherits(LevelSelectGrid, _mag$Rect2);

    function LevelSelectGrid(chapterName, onLevelSelect) {
        _classCallCheck(this, LevelSelectGrid);

        var _this10 = _possibleConstructorReturn(this, (LevelSelectGrid.__proto__ || Object.getPrototypeOf(LevelSelectGrid)).call(this, 0, 0, 0, 0));

        _this10.color = null;
        _this10.showGrid(chapterName, onLevelSelect);
        return _this10;
    }

    _createClass(LevelSelectGrid, [{
        key: 'hide',
        value: function hide(dur) {
            var _this11 = this;

            var len = this.children.length;
            this.children.forEach(function (c, i) {
                c.opacity = 1;
                Animate.tween(c, { scale: { x: 0, y: 0 }, opacity: 0 }, (len - i - 1) * 30).after(function () {
                    _this11.removeChild(c);
                });
            });
            return Animate.wait((len - 1) * 30);
        }
    }, {
        key: 'gridSizeForLevelCount',
        value: function gridSizeForLevelCount(n) {
            if (n <= 8) return 124;else if (n <= 14) return 100;else return 84;
        }
    }, {
        key: 'showGrid',
        value: function showGrid(chapterName, onselect) {
            var _this12 = this;

            // Layout measurement
            var levels = Resource.levelsForChapter(chapterName);
            var NUM_CELLS = levels[0].length; // total number of cells to fit on the grid
            var CELL_SIZE = this.gridSizeForLevelCount(NUM_CELLS); // width and height of each cell square, in pixels
            var SCREEN_WIDTH = GLOBAL_DEFAULT_SCREENSIZE.width; // the width of the screen to work with
            var PADDING = 20; // padding between cells
            var TOP_MARGIN = 20;
            var GRID_MARGIN = 80; // margin bounding grid on top, left, and right sides
            var NUM_COLS = Math.trunc((SCREEN_WIDTH - GRID_MARGIN * 2) / (CELL_SIZE + PADDING)); // number of cells that fit horizontally on the screen
            var NUM_ROWS = Math.trunc(NUM_CELLS / NUM_COLS + 1); // number of rows
            var GRID_LEFTPAD = (SCREEN_WIDTH - ((CELL_SIZE + PADDING) * NUM_COLS + GRID_MARGIN * 2)) / 2.0;

            console.log(levels);
            console.log(SCREEN_WIDTH - GRID_MARGIN * 2, CELL_SIZE + PADDING, NUM_CELLS, NUM_COLS, NUM_ROWS);

            var genClickCallback = function genClickCallback(level_idx) {
                return function () {
                    return onselect(levels[0][level_idx], levels[1] + level_idx);
                };
            };

            var leftmost = GRID_LEFTPAD + GRID_MARGIN;
            var x = leftmost;
            var y = TOP_MARGIN;

            for (var r = 0; r < NUM_ROWS; r++) {

                var i = r * NUM_COLS;

                var _loop2 = function _loop2(c) {

                    // Create a level cell and add it to the grid.
                    var cell = new LevelCell(x + CELL_SIZE / 2.0, y + CELL_SIZE / 2.0, CELL_SIZE, CELL_SIZE, i.toString(), genClickCallback(i), r === 0 ? 'LightGreen' : 'Gold', 'white', r === 0 ? 'Green' : 'Teal', r === 0 ? 'DarkGreen' : 'DarkMagenta');
                    cell.onDownColor = r === 0 ? 'YellowGreen' : 'Orange';
                    cell.anchor = { x: 0.5, y: 0.5 };
                    //if (i > 5) cell.lock();
                    _this12.addChild(cell);

                    // Animate cell into position.
                    cell.scale = { x: 0.0, y: 0 };
                    Animate.wait(i * 50).after(function () {
                        Animate.tween(cell, { scale: { x: 1, y: 1 } }, 300, function (elapsed) {
                            return Math.pow(elapsed, 0.5);
                        });
                    });

                    // Increment x-position.
                    x += CELL_SIZE + PADDING;

                    // The level index, calculated from the row and column indices.
                    i++;
                    if (i >= NUM_CELLS) return 'break';
                };

                for (var c = 0; c < NUM_COLS; c++) {
                    var _ret2 = _loop2(c);

                    if (_ret2 === 'break') break;
                }

                if (i >= NUM_CELLS) break;

                // Increment y-position and set x-position left.
                y += CELL_SIZE + PADDING;
                x = leftmost;
            }
        }
    }]);

    return LevelSelectGrid;
}(mag.Rect);

var LevelSpot = function (_mag$Circle) {
    _inherits(LevelSpot, _mag$Circle);

    function LevelSpot(x, y, r, onclick) {
        _classCallCheck(this, LevelSpot);

        var _this13 = _possibleConstructorReturn(this, (LevelSpot.__proto__ || Object.getPrototypeOf(LevelSpot)).call(this, x, y, r));

        _this13.color = 'gray';
        _this13.enabled = false;
        _this13.shadowOffset = 0;
        _this13.highlightColor = 'lime';
        _this13.disabledColor = 'gray';
        _this13.enabledColor = 'white';
        _this13.stroke = { color: 'black', lineWidth: 2 };
        _this13.onclick = onclick;
        _this13.flashing = false;

        var glow = new mag.ImageRect(0, 0, r * 2.5, r * 2.5, 'level-spot-glow');
        glow.anchor = { x: 0.5, y: 0.5 };
        glow.pos = { x: r, y: r };
        glow.ignoreEvents = true;
        _this13.glow = glow;
        _this13.glow.parent = _this13;
        return _this13;
    }

    _createClass(LevelSpot, [{
        key: 'cancelFlash',
        value: function cancelFlash() {
            this.flashing = false;
            this.cancelBlink = true;
            this.color = 'white';
        }
    }, {
        key: 'flash',
        value: function flash() {
            var _this14 = this;

            this.enabledColor = 'cyan';
            this.color = 'cyan';

            if (this.flashing) return;

            this.flashing = true;
            this.cancelBlink = false;
            var dur = 800;
            this.glow.opacity = 1.0;
            var _this = this;
            var sound = 0;
            var blink = function blink() {
                if (_this.cancelBlink) {
                    _this14.flashing = false;
                    return;
                }

                if (sound == 0 && !_this14.ignoreEvents && _this14.stage && !_this14.stage.invalidated) {
                    Resource.play('levelspot-scan');
                }
                sound = (sound + 1) % 4;

                Animate.tween(_this14.glow, { opacity: 0.1 }, dur, function (e) {
                    return Math.pow(e, 2);
                }).after(function () {
                    if (_this.cancelBlink) {
                        _this14.flashing = false;
                        return;
                    }
                    Animate.tween(_this14.glow, { opacity: 0.6 }, dur, function (e) {
                        return Math.pow(e, 0.5);
                    }).after(blink);
                });
            };
            blink();
        }
    }, {
        key: 'enable',
        value: function enable() {
            this.color = 'white';
            this.enabled = true;
            this.enabledColor = 'white';
        }
    }, {
        key: 'disable',
        value: function disable() {
            this.color = 'gray';
            this.enabled = false;
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            if (!this.enabled) return;
            this.stroke = { color: 'yellow', lineWidth: this.stroke.lineWidth };
            this.color = this.highlightColor;
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            if (!this.enabled) return;
            this.stroke = { color: 'black', lineWidth: this.stroke.lineWidth };
            this.color = this.enabledColor;
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            if (this.enabled && this.onclick) {
                this.onclick();
            }
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            if (!this.ignoreEvents && (this.flashing || this.color === this.highlightColor)) {
                ctx.save();
                if (this.glow.opacity) {
                    if (this.color === this.highlightColor) {
                        ctx.globalAlpha = Math.max(this.glow.opacity, 0.3) + 0.4;
                    } else {
                        ctx.globalAlpha = this.glow.opacity;
                    }
                }
                var glowPos = {
                    x: pos.x - 0.6 * boundingSize.w,
                    y: pos.y - 0.6 * boundingSize.h
                };
                var glowSize = {
                    w: 2.2 * boundingSize.w,
                    h: 2.2 * boundingSize.h
                };
                this.glow.drawInternal(ctx, glowPos, glowSize);
                ctx.restore();
            }
            _get(LevelSpot.prototype.__proto__ || Object.getPrototypeOf(LevelSpot.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);
        }
    }]);

    return LevelSpot;
}(mag.Circle);

var PlanetCard = function (_mag$ImageRect2) {
    _inherits(PlanetCard, _mag$ImageRect2);

    function PlanetCard(x, y, r, name, planet_image, onclick) {
        _classCallCheck(this, PlanetCard);

        var _this15 = _possibleConstructorReturn(this, (PlanetCard.__proto__ || Object.getPrototypeOf(PlanetCard)).call(this, x, y, r * 2, r * 2, planet_image + '-locked'));

        _this15.radius = r;
        _this15.name = name;
        _this15.onclick = onclick;

        // Backing Glow on Mouseover
        var glow = new mag.ImageRect(0, 0, r * 2.5, r * 2.5, 'planet-glow');
        glow.anchor = { x: 0.5, y: 0.5 };
        glow.pos = { x: r, y: r };
        glow.ignoreEvents = true;
        _this15.glow = glow;

        // Enable backing glow for newly accessible planet
        _this15.highlighted = false;

        // Text
        var capitalize = function capitalize(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };
        var t = new TextExpr(capitalize(name), 'Futura', 14);
        t.color = 'white';
        t.anchor = { x: 0.5, y: 0.5 };
        t.pos = { x: r, y: 2 * r + 15 };
        _this15.text = t;
        //this.addChild(t);

        // Level path
        var path = new ArrowPath();
        path.stroke.color = 'white';
        path.stroke.lineDash = [5 * _this15.radius / 120];
        path.stroke.lineWidth = r / 120;
        path.drawArrowHead = false;
        path.ignoreEvents = true;
        _this15.path = path;
        _this15.addChild(path);

        _this15.pts = [];
        _this15.unitpos = function (pos) {
            pos = clonePos(pos);
            pos.x -= _this15.absolutePos.x;
            pos.y -= _this15.absolutePos.y;
            pos.x /= _this15.absoluteSize.w / 2;
            pos.y /= _this15.absoluteSize.h / 2;
            return pos;
        };
        return _this15;
    }

    _createClass(PlanetCard, [{
        key: 'showText',
        value: function showText() {
            if (this.children.indexOf(this.text) === -1) this.addChild(this.text);
        }
    }, {
        key: 'hideText',
        value: function hideText() {
            if (this.children.indexOf(this.text) > -1) this.removeChild(this.text);
        }
    }, {
        key: 'showShip',
        value: function showShip(worldShip) {
            // Create ship graphic
            var ship = new mag.RotatableImageRect(0, 0, 82, 70, 'ship-large');
            ship.anchor = worldShip.anchor;
            ship.scale = worldShip.absoluteScale;
            ship.rotation = -Math.PI / 2.0;
            //ship.scale = { x:0.5*r/120, y:0.5*r/120 };
            ship.pos = this.localLandingPoint;
            ship.ignoreEvents = true;
            this.ship = ship;
            this.addChild(ship);
        }
    }, {
        key: 'hideShip',
        value: function hideShip() {
            if (this.ship) {
                this.removeChild(this.ship);
                this.ship = null;
            }
        }
    }, {
        key: 'highlight',
        value: function highlight() {
            this.highlighted = true;
            this.glow.opacity = 0.5;
        }
    }, {
        key: 'removeHighlight',
        value: function removeHighlight() {
            this.highlighted = false;
            this.glow.opacity = 0;
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            if (this.onclick) this.onclick();
            this.selected = false;
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter() {
            var _this16 = this;

            this.selected = true;
            this.glow.opacity = this.highlighted ? 0.5 : 0.0;
            Animate.tween(this.glow, { opacity: 1.0 }, 100).after(function () {
                _this16.glow.opacity = 1;
            });
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            if (distBetweenPos(pos, this.pos) > this.absoluteSize.h / 4.0) {
                this.selected = false;
                if (this.highlighted) {
                    this.highlight(); // Reset glow
                }
            }
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            if (this.parent && Number.isNumber(this.parent.opacity)) {
                ctx.globalAlpha = this.parent.opacity * (this.opacity || 1.0);
            }
            if (this.highlighted || this.selected && this.scale.x < 1.1) {
                this.glow.parent = this;
                this.glow.draw(ctx);
            }
            _get(PlanetCard.prototype.__proto__ || Object.getPrototypeOf(PlanetCard.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);
        }

        // Uncomment for drawing curves directly on planets (DEBUG).

    }, {
        key: 'onmousedown',
        value: function onmousedown(pos) {
            pos = this.unitpos(pos);
            this.pts = [pos];
            console.warn(pos);
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            pos = this.unitpos(pos);
            if (this.pts.length > 0) {
                pos.y *= -1;
                pos.x *= -1;
                var relpos = fromTo(pos, this.pts[0]);
                this.pts.push(relpos);
            }
        }
    }, {
        key: 'onmouseup',
        value: function onmouseup(pos) {
            console.log(this.pts.reduce(function (prev, cur) {
                return prev + '{"x":' + cur.x + ', "y":' + cur.y + '},\n';
            }, ''));
            if (this.pts.length > 2) this.setCurve(this.pts);
            this.pts = [];
            this.stage.draw();
        }
    }, {
        key: 'activate',
        value: function activate() {
            this.image = this.image.replace('-locked', '');
            this.showText();
            this.active = true;
        }
    }, {
        key: 'deactivate',
        value: function deactivate() {
            this.active = false;
            this.hideText();
            this.removeChild(this.path);
        }
    }, {
        key: 'activateSpots',
        value: function activateSpots() {
            var _this17 = this;

            if (!this.spots) return;

            this.addChild(this.path);

            // Make all spots invisible.
            this.spots.forEach(function (spot) {
                spot.opacity = 0;
                spot.ignoreEvents = true;
                _this17.addChild(spot);
            });

            // Animate-in how much of the path is drawn.
            var dur = 2000;
            this.path.percentDrawn = 0;
            Animate.tween(this.path, { percentDrawn: 1.0 }, dur);
            Animate.run(function (e) {
                _this17.spots.forEach(function (spot) {
                    if (spot.relPosAlongPath <= _this17.path.percentDrawn) {
                        if (spot.opacity === 0) Resource.play('levelspot-activate');
                        spot.opacity = 1.0;
                    }
                });
            }, dur).after(function () {
                _this17.spots.forEach(function (spot) {
                    if (spot.opacity === 0) Resource.play('levelspot-activate');
                    spot.opacity = 1.0;
                    spot.ignoreEvents = false;
                });
                _this17.path.percentDrawn = 1;
                _this17.spots[0].enable();
                _this17.spots[0].flash();
                Resource.play('fatbtn-beep');
            });
        }
    }, {
        key: 'deactivateSpots',
        value: function deactivateSpots() {
            this.removeChild(this.path);

            this.spots.forEach(function (spot) {
                spot.opacity = 0;
                spot.ignoreEvents = true;
            });
        }
    }, {
        key: 'updateLevelSpots',
        value: function updateLevelSpots() {
            if (!this.spots) return;
            this.spots.forEach(function (spot, i) {
                spot.opacity = 1.0;
                // Flash the spot if it's the level after one we've
                // completed (level_idx isn't reliable for this when
                // there's multiple branches), or if it's the first spot
                // on the planet

                spot.cancelFlash();
                spot.disable();
                if (completedLevels[spot.levelId]) {
                    spot.enable();
                }
                // We have not completed the first level of this planet,
                // but presumably this planet is enabled, so enable the
                // first level
                else if (i === 0) {
                        spot.enable();
                        spot.flash();
                    } else if (!completedLevels[spot.levelId] && completedLevels[spot.levelId - 1]) {
                        spot.enable();
                        spot.flash();
                    }
            });
        }
    }, {
        key: 'setCurve',
        value: function setCurve(pts) {
            var _this18 = this;

            this.path.points = pts.map(function (p) {
                return { x: p.x * _this18.radius + _this18.radius, y: p.y * _this18.radius + _this18.radius };
            });
        }
    }, {
        key: 'setLevels',
        value: function setLevels(levels, onLevelSelect) {
            var _this19 = this;

            this.startLevelIdx = levels[1];
            this.endLevelIdx = levels[1] + levels[0].length - 1;
            var NUM_LVLS = levels[0].length; // total number of cells to fit on the grid
            var genClickCallback = function genClickCallback(level_idx) {
                return function () {
                    Resource.play('fatbtn-beep');
                    var spot = _this19.spots[level_idx];
                    var pos = spot.absolutePos;
                    var r = spot.absoluteSize.w / 2;
                    // The scale changes between the menu and stage
                    var posPercent = { x: pos.x / _this19.stage.boundingSize.w,
                        y: pos.y / _this19.stage.boundingSize.h };
                    var mask = new Mask(posPercent.x, posPercent.y, 20 * r);
                    _this19.stage.add(mask);
                    Animate.tween(mask, {
                        opacity: 1.0,
                        radius: 0.1,
                        ringControl: 100
                    }, 500).after(function () {
                        _this19.stage.remove(mask);
                        onLevelSelect(levels[0][level_idx], levels[1] + level_idx);
                        window.stage.add(mask);
                        Animate.tween(mask, {
                            radius: Math.max(window.stage.boundingSize.w, window.stage.boundingSize.h),
                            ringControl: 150
                        }, 400).after(function () {
                            window.stage.remove(mask);
                        });
                    });
                };
            };

            var md = new MobileDetect(window.navigator.userAgent);

            // Level spots
            this.spots = [];
            for (var i = 1; i <= NUM_LVLS; i++) {
                var spotpos = this.path.posAlongPath((i - 1) / (NUM_LVLS - 1));
                var r = 8 * this.radius / 120;
                if (__IS_MOBILE && md.phone()) {
                    r = 10 * this.radius / 120;
                }
                var spot = new LevelSpot(spotpos.x, spotpos.y, r, genClickCallback(i - 1));
                spot.anchor = { x: 0.5, y: 0.5 };
                spot.relPosAlongPath = i / NUM_LVLS;
                spot.levelId = levels[1] + i - 1;
                spot.stroke.lineWidth = Math.max(this.radius / 120 * 2, 1.5);
                spot.ignoreEvents = true;
                this.spots.push(spot);

                if (this.active) this.addChild(spot);
            }

            this.updateLevelSpots();
        }
    }, {
        key: 'landingPoint',
        get: function get() {
            var a = this.absolutePos;
            return { x: a.x, y: a.y - this.absoluteSize.h / 3 };
        }
    }, {
        key: 'relativeLandingPoint',
        get: function get() {
            var a = this.pos;
            return { x: a.x, y: a.y - this.size.h / 3 };
        }
    }, {
        key: 'localLandingPoint',
        get: function get() {
            return { x: this.size.w / 2.0, y: this.size.h / 2.0 / 3 };
        }
    }]);

    return PlanetCard;
}(mag.ImageRect);

var ChapterSelectShip = function (_mag$RotatableImageRe) {
    _inherits(ChapterSelectShip, _mag$RotatableImageRe);

    function ChapterSelectShip() {
        _classCallCheck(this, ChapterSelectShip);

        var _this20 = _possibleConstructorReturn(this, (ChapterSelectShip.__proto__ || Object.getPrototypeOf(ChapterSelectShip)).call(this, 0, 0, 82, 70, 'ship-large'));

        _this20.pointing = { x: 1, y: 0 };
        _this20.velocity = { x: 0, y: 0 };

        _this20.planet = null;

        var trailWidth = 140;
        var trail = new RainbowTrail(0, 0, trailWidth, 30);
        trail.pos = { x: -trailWidth + 20, y: 20 };
        //trail.anchor = { x:1, y:0 };
        _this20.trail = trail;
        _this20.addChild(trail);
        return _this20;
    }

    // Fly to another planet. (entire sequence)


    _createClass(ChapterSelectShip, [{
        key: 'flyToPlanet',
        value: function flyToPlanet(stage, startPlanet, endPlanet) {
            var _this21 = this;

            // Hide the local ships and make the world ship
            // the only ship visible.
            this.pos = startPlanet.relativeLandingPoint;
            startPlanet.hideShip();
            endPlanet.hideShip();

            stage.planetParent.ignoreEvents = true;

            var startScale = this.scale.x;
            var endScale = endPlanet.radius / 120 / 2;
            var dest = endPlanet.relativeLandingPoint;
            var aboveOrbitDest = addPos(endPlanet.landingPoint, { x: 0, y: -75 });
            var relativeAboveOrbitDest = addPos(dest, { x: 0, y: -75 });
            var pointing = fromTo(this.pos, aboveOrbitDest);
            var pointAngle = Math.atan2(pointing.y, pointing.x);
            this.trail.opacity = 0;
            var _this = this;
            this.rotation = -Math.PI / 2.0; // make the ship face upright

            var start = startPlanet.relativeLandingPoint;
            var end = endPlanet.relativeLandingPoint;
            var control1 = {
                x: start.x + 10,
                y: start.y - 200
            };
            var control2 = {
                x: end.x - 10,
                y: end.y + 200
            };
            end.y -= 30;

            var travelDist = distBetweenPos(this.pos, dest);
            var duration = travelDist / 100 * 1000;

            var promisify = function promisify(x) {
                return new Promise(function (resolve, reject) {
                    x.after(resolve);
                });
            };

            var stars = [];
            var starParent = new mag.Rect(0, 0, 0, 0);
            starParent.opacity = 0;
            stage.add(starParent);

            for (var i = 0; i < 120; i++) {
                var _star = new MenuStar();
                _star.pos = randomPointInRect({ x: 0, y: 0, w: stage.boundingSize.w, h: stage.boundingSize.h });
                var _scale = Math.random() * 0.2 + 0.1;
                _star.scale = { x: _scale, y: _scale };
                starParent.addChild(_star);
                stars.push(_star);
            }

            // The initial launch
            var launch = promisify(Animate.tween(this, {
                pos: addPos(this.pos, { x: 0, y: -100 })
            }, 1000));
            var del = 0;
            var launchTrail = promisify(Animate.run(function (e) {
                _this21.trail.opacity = Math.min(0.4, Math.pow(e, 0.05));
                _this21.trail.time += (e - del) * 4000;
                del = e;
            }, 1250));

            return launch.then(function () {
                var p = _this21.absolutePos;
                stage.planetParent.removeChild(_this21);
                stage.add(_this21);
                _this21.pos = p;
                _this21.parent = null;

                _this21.image = 'ship-large-starboy';

                var rotate = promisify(Animate.tween(_this21, {
                    rotation: 0
                }, 600));

                // Zoom in on Starchild
                var zoomShip = promisify(Animate.tween(_this21, {
                    scale: { x: 5, y: 5 },
                    pos: {
                        x: stage.boundingSize.w / 2 - 2.5 * _this21.size.w,
                        y: stage.boundingSize.h / 2 - 2.5 * _this21.size.h
                    }
                }, 600));

                stage.starParent.opacity = 1.0;
                var fadeOutStars = promisify(Animate.tween(stage.starParent, {
                    opacity: 0
                }, 400));

                var fadeInStars = promisify(Animate.tween(starParent, {
                    opacity: 0.7
                }, 400));

                stage.planetParent.opacity = 1.0;
                var zoom = promisify(Animate.tween(stage.planetParent, {
                    opacity: 0
                }, 600));

                return Promise.all([zoomShip, zoom, launchTrail, fadeOutStars, fadeInStars]);
            }).then(function () {
                // Prepare for ignition
                _this21.trail.time = 0;
                return promisify(Animate.tween(_this21.trail, {
                    opacity: 0,
                    time: 500
                }, 300)).then(function () {
                    return promisify(Animate.tween(_this21.trail, {
                        opacity: 1.0,
                        time: 2500
                    }, 200));
                });
            }).then(function () {
                // Enter warp space!
                var mask = new Mask(0, 0, 0.01, "#FFFFFF");
                _this21.stage.add(mask);

                var flash = after(200).then(function () {
                    return promisify(Animate.tween(mask, {
                        opacity: 1.0
                    }, 100));
                }).then(function () {
                    return promisify(Animate.tween(mask, {
                        opacity: 0.0
                    }, 100));
                }).then(function () {
                    return _this21.stage.remove(mask);
                });

                var jumpForward = promisify(Animate.tween(_this21, {
                    pos: addPos(_this21.pos, { x: 300, y: 0 })
                }, 300));

                return jumpForward;
            }).then(function () {
                // Cruising along
                var jumpBack = promisify(Animate.tween(_this21, {
                    pos: addPos(_this21.pos, { x: -300, y: 0 })
                }, 1000));

                var origSize = stars[0].size;
                var sizer = stars[0].size;
                stars.forEach(function (s) {
                    return s.size = sizer;
                });
                var starStretch = promisify(Animate.tween(sizer, {
                    w: 450,
                    h: 6
                }, 600));

                var flyingDuration = 6000;
                var deceleration = 0.75;

                var t0 = 0;
                var flying = promisify(Animate.run(function (t1) {
                    _this21.trail.time += 8000 * (t1 - t0);

                    var dx = 15000 * (t1 - t0);
                    if (t1 > deceleration) dx *= -4 * t1 + 4;
                    stars.forEach(function (s) {
                        s.pos = addPos(s.pos, { x: -dx, y: 0 });
                        if (s.pos.x < 0) {
                            s.pos = { x: stage.boundingSize.w * (0.9 + Math.random() / 5), y: s.pos.y };
                        }
                    });

                    t0 = t1;
                }, flyingDuration));

                var slowing = after(flyingDuration - 500).then(function () {
                    return promisify(Animate.tween(sizer, origSize, 500));
                });

                return Promise.all([flying, slowing]);
            }).then(function () {
                // Come out of warp space
                var turnOffEngine = promisify(Animate.tween(_this21.trail, {
                    opacity: 0
                }, 400));

                // Zoom back out
                var zoomShip = promisify(Animate.tween(_this21, {
                    scale: { x: endScale, y: endScale },
                    pos: aboveOrbitDest
                }, 600));

                var fadeInStars = promisify(Animate.tween(stage.starParent, {
                    opacity: 1.0
                }, 400));

                var fadeOutStars = promisify(Animate.tween(starParent, {
                    opacity: 0
                }, 400));

                var rotate = after(400).then(function () {
                    return promisify(Animate.tween(_this21, {
                        rotation: -Math.PI / 2
                    }, 600));
                });

                var zoom = promisify(Animate.tween(stage.planetParent, {
                    opacity: 1
                }, 600));

                return Promise.all([turnOffEngine, rotate, zoomShip, zoom, fadeOutStars, fadeInStars]);
            }).then(function () {
                _this21.image = 'ship-large';
                stage.remove(_this21);
                stage.planetParent.addChild(_this21);
                _this21.pos = relativeAboveOrbitDest;
                var land = promisify(Animate.tween(_this21, {
                    pos: dest
                }, 1000));
                return land;
            }).then(function () {
                stage.planetParent.ignoreEvents = false;
                endPlanet.showShip(_this21);
                stage.remove(starParent);
            });
        }
    }, {
        key: 'attachToPlanet',
        value: function attachToPlanet(planet) {
            this.pos = planet.landingPoint;
            this.planet = planet;
            planet.showShip(this);
        }

        // Launch the ship into the air.

    }, {
        key: 'launch',
        value: function launch() {
            var _this22 = this;

            this.planet = null;
            return new Promise(function (resolve, reject) {
                _this22.moveTo(addPos(_this22.pos, { x: 0, y: -20 }), 1000).then(resolve);
            });
        }

        // Rotate to angle.

    }, {
        key: 'rotateTo',
        value: function rotateTo(angle) {
            var _this23 = this;

            var dur = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
            var smoothFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (e) {
                return e;
            };

            return new Promise(function (resolve, reject) {
                Animate.tween(_this23, { rotation: angle }, dur, smoothFunc).after(resolve);
            });
        }

        // Move to pos (without changing rotation).

    }, {
        key: 'moveTo',
        value: function moveTo(dest) {
            var _this24 = this;

            var dur = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
            var smoothFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (e) {
                return e;
            };

            return new Promise(function (resolve, reject) {
                Animate.tween(_this24, { pos: clonePos(dest) }, dur, smoothFunc).after(function () {
                    resolve();
                });
            });
        }

        // Execute landing sequence.

    }, {
        key: 'land',
        value: function land(dest) {
            var _this25 = this;

            this.trail.opacity = 0;
            return this.rotateTo(-Math.PI / 2.0, 500).then(function () {
                return _this25.moveTo(dest, 1000);
            });
        }
    }, {
        key: 'thrust',
        value: function thrust(force, delta) {
            var MAX_VEL = 1;
            var deltaForce = scalarMultiply(force, delta);
            var step = dotProduct(deltaForce, this.pointing);
            this.pointing = normalize(addPos(this.pointing, deltaForce));
            this.velocity = addPos(this.velocity, scalarMultiply(this.pointing, step));
            if (lengthOfPos(this.velocity) > MAX_VEL) this.velocity = rescalePos(this.velocity, MAX_VEL);
            this.pos = addPos(this.velocity, this.pos);
            this.rotation = Math.atan2(this.pointing.y, this.pointing.x);
            this.trail.time += delta * 400;
        }
    }, {
        key: 'flyTo',
        value: function flyTo(dest, onReachingDest) {
            var _this26 = this;

            var FORCE = 10;
            var travelDist = distBetweenPos(this.pos, dest);
            var pointing = fromTo(this.pos, dest);
            var DUR = travelDist / 100 * 1000; // 1 sec per 100 units.
            this.rotation = Math.atan2(pointing.y, pointing.x);

            var del = 0;
            Animate.run(function (e) {
                _this26.trail.opacity = Math.pow(e, 0.5);
                _this26.trail.time += (e - del) * 8000;
                del = e;
            }, DUR);
            this.moveTo(dest, DUR).then(onReachingDest);
            return DUR;

            // let twn = new mag.IndefiniteTween((delta) => {
            //     this.thrust( rescalePos( fromTo(this.pos, dest), distBetweenPos(this.pos, dest) / totalDist), delta / 1000.0 * 10);
            //
            //     let distleft = distBetweenPos(this.pos, dest);
            //     this.trail.opacity = Math.pow(distleft / totalDist, 0.5);
            //
            //     if (distleft <= 10) {
            //         if (onReachingDest) onReachingDest();
            //         twn.cancel();
            //     }
            //     //this.stage.draw();
            // });
            // twn.run();
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            // Need to save pos for later because it gets changed in the middle??
            this._savedPos = pos;
        }
    }, {
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(ctx, pos, boundingSize) {
            pos = this._savedPos;
            _get(ChapterSelectShip.prototype.__proto__ || Object.getPrototypeOf(ChapterSelectShip.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);
        }
    }]);

    return ChapterSelectShip;
}(mag.RotatableImageRect);

var ChapterSelectMenu = function (_mag$Stage2) {
    _inherits(ChapterSelectMenu, _mag$Stage2);

    // flyToChapIdx should be an array of
    // {
    //     chapterIdx: chapter_idx,
    //     startIdx: idx_of_starting_level,
    // }
    function ChapterSelectMenu(canvas, onLevelSelect, flyToChapIdx) {
        _classCallCheck(this, ChapterSelectMenu);

        var _this27 = _possibleConstructorReturn(this, (ChapterSelectMenu.__proto__ || Object.getPrototypeOf(ChapterSelectMenu)).call(this, canvas));

        _this27.md = new MobileDetect(window.navigator.userAgent);
        _this27.onLevelSelect = onLevelSelect;

        _this27.btn_back = new mag.Button(10, 10, 50, 50, { default: 'btn-back-default', hover: 'btn-back-hover', down: 'btn-back-down' }, function () {
            _this27.activePlanet = null;
            _this27.remove(_this27.btn_back);
            _this27.setPlanetsToDefaultPos(500);
            Resource.play('goback');
        });
        _this27.btn_back.opacity = 0.7;

        _this27.planets = [];
        _this27.stars = [];
        _this27.activePlanet = null;
        _this27.starParent = new mag.Rect(0, 0, 0, 0);
        _this27.add(_this27.starParent);

        _this27.showStarField();

        _this27.onorientationchange();

        _this27.showChapters().then(function () {
            _this27.updateParallax();

            _this27.offset = { x: 0, y: 0 };
            var lastActivePlanet = _this27.lastActivePlanet;

            _this27.setCameraX(lastActivePlanet.pos.x - 3 * lastActivePlanet.radius);

            var ship = new ChapterSelectShip();
            var shipScale = lastActivePlanet.radius / 120 / 2;
            ship.scale = { x: shipScale, y: shipScale };

            if (flyToChapIdx && flyToChapIdx.length > 0) {
                ship.attachToPlanet(lastActivePlanet);

                var minNewPlanetX = 1000000;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    var _loop3 = function _loop3() {
                        var chap = _step.value;

                        var newChapIdx = chap.chapterIdx;
                        var newPlanet = _this27.planets[newChapIdx];
                        newPlanet.highlight();
                        newPlanet.activate();
                        newPlanet.deactivateSpots();
                        var oldOnClick = newPlanet.onclick;
                        minNewPlanetX = Math.min(minNewPlanetX, newPlanet.pos.x);

                        newPlanet.onclick = function () {
                            newPlanet.onclick = oldOnClick;
                            newPlanet.removeHighlight();
                            _this27.remove(ship);
                            _this27.planetParent.addChild(ship);
                            var startPlanet = lastActivePlanet;
                            ship.flyToPlanet(_this27, startPlanet, newPlanet).then(function () {
                                return new Promise(function (resolve, reject) {
                                    Animate.wait(600).after(function () {
                                        _this27.planetParent.removeChild(ship);
                                        resolve();
                                    });
                                });
                            }).then(oldOnClick).then(function () {
                                newPlanet.activateSpots();
                                // Get level_idx from the chapter
                                // itself, instead of assuming
                                // linearity
                                level_idx = chap.startIdx;
                                saveProgress();
                            });
                        };
                    };

                    for (var _iterator = flyToChapIdx[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        _loop3();
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

                if (minNewPlanetX + _this27.planetParent.pos.x > 0.8 * _this27.boundingSize.w) {
                    _this27.setCameraX(minNewPlanetX - 0.8 * _this27.boundingSize.w);
                }
            } else {
                ship.attachToPlanet(lastActivePlanet);
            }
        });
        return _this27;
    }

    _createClass(ChapterSelectMenu, [{
        key: 'reset',
        value: function reset() {
            var _this28 = this;

            this.panningEnabled = true;
            this.starParent.children = [];
            this.showStarField();
            var lastActivePlanet = this.lastActivePlanet;
            if (!lastActivePlanet) return;
            this.remove(this.btn_back);
            this.setPlanetsToDefaultPos(0).then(function () {
                _this28.setCameraX(lastActivePlanet.pos.x - 3 * lastActivePlanet.radius);

                if (_this28.activePlanet) {
                    _this28.activatePlanet(_this28.activePlanet, 0);
                }
            });
        }
    }, {
        key: 'setCameraX',
        value: function setCameraX(x) {
            x = Math.max(x, 0);
            x = Math.min(x, this.maxPlanetX - this.boundingSize.w);
            this.planetParent.pos = {
                x: -x,
                y: this.planetParent.pos.y
            };
            this.updateParallax();
        }
    }, {
        key: 'updateParallax',
        value: function updateParallax() {
            if (this.maxPlanetX) {
                var cameraX = -Math.min(0, this.planetParent.pos.x);
                var x = Math.min(1.0, cameraX / (1 + this.maxPlanetX - this.boundingSize.w)) * 0.5 * this.boundingSize.w;
                x = Math.max(x, 0);
                this.starParent.pos = {
                    x: -x,
                    y: this.starParent.pos.y
                };
            }
        }
    }, {
        key: 'onmousedown',
        value: function onmousedown(pos) {
            _get(ChapterSelectMenu.prototype.__proto__ || Object.getPrototypeOf(ChapterSelectMenu.prototype), 'onmousedown', this).call(this, pos);
            this._dragStart = pos;
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            if (this.panningEnabled) {
                var dx = pos.x - this._dragStart.x;
                this.setCameraX(-(this.planetParent.pos.x + dx));
            }
            this._dragStart = pos;
            // TODO: we should use window.onmouseup as well to cancel dragging
        }
    }, {
        key: 'onmouseup',
        value: function onmouseup(pos) {
            _get(ChapterSelectMenu.prototype.__proto__ || Object.getPrototypeOf(ChapterSelectMenu.prototype), 'onmouseup', this).call(this, pos);
            this._dragStart = null;
        }
    }, {
        key: 'onorientationchange',
        value: function onorientationchange() {
            if (__IS_MOBILE) {
                if (this.md.phone()) {
                    this.scale = 1.0;
                } else if (this.md.tablet()) {
                    this.scale = 1.2;
                } else if (this.md.mobile()) {
                    this.scale = 2.0;
                } else {
                    this.scale = 1.0;
                }
            }
            // TODO: preserve scroll
            this.reset();
        }
    }, {
        key: 'updateLevelSpots',
        value: function updateLevelSpots() {
            if (this.planets) {
                this.planets.forEach(function (p) {
                    return p.updateLevelSpots();
                });
            }
        }
    }, {
        key: 'drawImpl',
        value: function drawImpl() {
            if (this.invalidated) return; // don't draw invalidated stages.
            this.ctx.save();
            this.ctx.scale(this._scale, this._scale);
            this.clear();
            var len = this.nodes.length;
            for (var i = 0; i < len; i++) {
                this.nodes[i].draw(this.ctx);
            }
            //this.nodes.forEach((n) => n.draw(this.ctx));
            this.ctx.restore();
        }
    }, {
        key: 'showStarField',
        value: function showStarField() {
            var _this29 = this;

            var NUM_STARS = 120;
            var genRandomPt = function genRandomPt() {
                return randomPointInRect({ x: 0, y: 0, w: 1.5 * _this29.boundingSize.w, h: _this29.boundingSize.h });
            };

            var starParent = this.starParent;

            var stars = this.stars;
            var n = NUM_STARS;

            var _loop4 = function _loop4() {

                // Create an instance of a star illustration.
                var star = new MenuStar();
                //star.anchor = { x:0.5, y:0.5 };

                // Find a random position that doesn't intersect other previously created stars.
                var p = genRandomPt();

                // Set star properties
                star.pos = p;
                star.opacity = 0.4;
                var scale = Math.random() * 0.3 + 0.1;
                star.scale = { x: scale, y: scale };
                starParent.addChild(star);
                stars.push(star);

                // Twinkling effect
                Animate.wait(1000 * Math.random()).after(function () {
                    return star.twinkle(1000);
                });
            };

            while (n-- > 0) {
                _loop4();
            }
        }
    }, {
        key: 'setPlanetsToDefaultPos',
        value: function setPlanetsToDefaultPos(dur) {
            var _this30 = this;

            var stage = this;
            this.panningEnabled = true;

            return Resource.getChapterGraph().then(function (chapters) {
                var maxPlanetX = _this30.boundingSize.w;
                var POS_MAP = layoutPlanets(chapters.transitions, _this30.boundingSize);
                stage.planets.forEach(function (p, i) {
                    maxPlanetX = Math.max(maxPlanetX, POS_MAP[i].x + p.radius);
                    p.ignoreEvents = false;
                    if (p.spots) p.spots.forEach(function (s) {
                        s.ignoreEvents = true;
                    });
                    if (p.expandFunc) p.onclick = p.expandFunc;
                    if (!stage.planetParent.hasChild(p)) stage.planetParent.addChild(p);
                    if (p.active) p.showText();
                    var rad = POS_MAP[i].r;
                    Animate.tween(p, { pos: { x: POS_MAP[i].x, y: POS_MAP[i].y }, scale: { x: 1, y: 1 }, opacity: 1.0 }, dur).after(function () {
                        if (p.active) p.showText();
                    });
                });
                _this30.maxPlanetX = maxPlanetX;
            });
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.ctx.save();
            this.ctx.fillStyle = '#594764';
            this.ctx.fillRect(0, 0, canvas.width, canvas.height);
            this.ctx.restore();
        }
    }, {
        key: 'activatePlanet',
        value: function activatePlanet(planet) {
            var _this31 = this;

            var durationMultiplier = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.0;

            var stage = this;

            this.activePlanet = planet;
            this.panningEnabled = false;

            var expand = function expand(planet) {
                planet.ignoreEvents = false;
                // Make sure the saving of the onclick is idempotent in
                // case we reactivate the same planet (e.g. after an
                // orientation change)
                if (planet.onclick) planet.expandFunc = planet.onclick;
                planet.onclick = null;
                planet.hideText();
                var r = Math.min(_this31.boundingSize.w / 2.2, _this31.boundingSize.h / 2.2);
                var center = {
                    x: _this31.boundingSize.w / 2.0,
                    y: _this31.boundingSize.h / 2.0
                };
                // Account for camera
                center = addPos(center, {
                    x: -_this31.planetParent.pos.x,
                    y: -_this31.planetParent.pos.y
                });
                stage.bringToFront(planet);

                var scale = r / planet.radius;
                Animate.tween(planet, { scale: { x: scale, y: scale }, pos: center }, durationMultiplier * 1000, function (elapsed) {
                    return Math.pow(elapsed, 3);
                }).after(function () {
                    if (planet.spots) planet.spots.forEach(function (s) {
                        s.ignoreEvents = false;
                    });
                });
            };
            var hide = function hide(planet) {
                planet.opacity = 1.0;
                planet.hideText();
                if (planet.spots) planet.spots.forEach(function (s) {
                    s.ignoreEvents = true;
                });
                Animate.tween(planet, { scale: { x: 1, y: 1 }, opacity: 0 }, durationMultiplier * 500).after(function () {
                    stage.planetParent.removeChild(planet);
                });
            };

            for (var k = 0; k < this.planets.length; k++) {
                this.planets[k].ignoreEvents = true;
                if (this.planets[k] === planet) {
                    expand(this.planets[k]);
                } else {
                    hide(this.planets[k]);
                }
            }

            if (durationMultiplier > 0) {
                Resource.play('zoomin');
            }
            Animate.wait(durationMultiplier * 500).after(function () {
                _this31.add(_this31.btn_back);
            });

            return new Promise(function (resolve, reject) {
                Animate.wait(durationMultiplier * 1000).after(resolve);
            });
        }
    }, {
        key: 'showChapters',
        value: function showChapters() {
            var _this32 = this;

            // Expand and disappear animations.
            var stage = this;

            // Each chapter is a 'Planet' in Starboy's Universe:
            return Resource.getChapterGraph().then(function (chapters) {
                var planets = [];
                var POS_MAP = layoutPlanets(chapters.transitions, _this32.boundingSize);

                var planetParent = new mag.Rect(0, 0, 0, 0);

                chapters.chapters.forEach(function (chap, i) {
                    var pos = i < POS_MAP.length ? POS_MAP[i] : { x: 0, y: 0, r: 10 };
                    var planet = new PlanetCard(pos.x, pos.y, pos.r, chap.name, chap.resources ? chap.resources.planet : 'planet-bagbag');

                    planet.color = 'white';
                    if (i === 1) planet.path.stroke.color = 'gray';
                    planet.anchor = { x: 0.5, y: 0.5 };
                    planet.shadowOffset = 0;
                    planet.onclick = function () {
                        _this32.activatePlanet(planet);
                    };

                    if (chap.resources) {
                        var levels = Resource.levelsForChapter(chap.name);

                        // Set path curve on planet.
                        planet.setCurve(chap.resources.curve);

                        // Activate planet if applicable
                        if (Resource.isChapterUnlocked(i)) {
                            planet.activate();
                        } else {
                            planet.deactivate();
                        }

                        // Set levels along curve.
                        planet.setLevels(levels, _this32.onLevelSelect);
                    }

                    planetParent.addChild(planet);
                    planets.push(planet);
                });
                _this32.add(planetParent);
                _this32.planetParent = planetParent;

                var transitionMap = {};
                chapters.chapters.forEach(function (chap, i) {
                    transitionMap[chap.key] = i;
                });

                _this32.planets = planets;
                _this32.setPlanetsToDefaultPos();
            });
        }
    }, {
        key: 'lastActivePlanet',
        get: function get() {
            var lastActivePlanet = void 0;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.planets[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _planet = _step2.value;

                    if (_planet.active && level_idx >= _planet.startLevelIdx && level_idx <= _planet.endLevelIdx) {
                        lastActivePlanet = _planet;
                        break;
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            if (!lastActivePlanet) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this.planets[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var planet = _step3.value;

                        if (planet.active) {
                            lastActivePlanet = planet;
                        }
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            }
            return lastActivePlanet;
        }
    }]);

    return ChapterSelectMenu;
}(mag.Stage);

function cubicBezierPoint(start, end, control1, control2, t) {
    var x = Math.pow(1 - t, 3) * start.x + 3 * Math.pow(1 - t, 2) * t * control1.x + 3 * (1 - t) * t * t * control2.x + t * t * t * end.x;
    var y = Math.pow(1 - t, 3) * start.y + 3 * Math.pow(1 - t, 2) * t * control1.y + 3 * (1 - t) * t * t * control2.y + t * t * t * end.y;
    return { x: x, y: y };
}

function cubicBezier(start, end, control1, control2, samples) {
    var points = [];
    for (var i = 0; i < samples + 1; i++) {
        var t = i / samples;
        points.push(cubicBezierPoint(start, end, control1, control2, t));
    }

    return points;
}

function layoutPlanets(adjacencyList, boundingSize) {
    var MAX_GROUP_SIZE = 4;

    // From src/util.js
    var seed = 42;
    var seededRandom = function seededRandom(max, min) {
        max = max || 1;
        min = min || 0;

        seed = (seed * 9301 + 49297) % 233280;
        var rnd = seed / 233280;

        return min + rnd * (max - min);
    };

    // Perform a topological sort of the planets to get a layout
    var sorted = topologicalSort(adjacencyList);
    var groups = [[]];
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = sorted[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var group = _step4.value;

            if (group.length === 1) {
                groups[groups.length - 1] = groups[groups.length - 1].concat(group);
            } else {
                groups.push(group);
                groups.push([]);
            }
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    if (groups[groups.length - 1].length === 0) groups.pop();

    var positions = [];

    var startX = 20;
    var startY = 20;
    var subgroups = [];
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = groups[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var _group = _step5.value;

            if (_group.length > MAX_GROUP_SIZE) {
                var numSubgroups = Math.ceil(_group.length / MAX_GROUP_SIZE);
                var subgroupSize = Math.round(_group.length / numSubgroups);
                var subgroup = [];
                while (_group.length > 0) {
                    subgroup.push(_group.shift());
                    if (subgroup.length == subgroupSize) {
                        subgroups.push(subgroup);
                        subgroup = [];
                    }
                }
                if (subgroup.length > 0) {
                    subgroups.push(subgroup);
                }
            } else {
                subgroups = [_group];
            }

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = subgroups[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var _subgroup = _step6.value;

                    var boundingArea = {
                        x: startX,
                        y: startY,
                        w: _subgroup.length > 2 ? boundingSize.w : 0.75 * boundingSize.w,
                        h: boundingSize.h - 40
                    };

                    var sublayout = layoutGroup(_subgroup, boundingArea, seededRandom);
                    positions = positions.concat(sublayout);

                    var maxOffset = 0;
                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = sublayout[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var _cell = _step7.value;

                            maxOffset = Math.max(maxOffset, _cell.x + _cell.r - boundingArea.x);
                        }
                    } catch (err) {
                        _didIteratorError7 = true;
                        _iteratorError7 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                _iterator7.return();
                            }
                        } finally {
                            if (_didIteratorError7) {
                                throw _iteratorError7;
                            }
                        }
                    }

                    startX += maxOffset;
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
            }
        } finally {
            if (_didIteratorError5) {
                throw _iteratorError5;
            }
        }
    }

    return positions;
}

function layoutGroup(group, boundingArea, seededRandom) {
    // Divide the available space into a grid
    var gridCells = [];
    var aspectRatio = boundingArea.w / boundingArea.h;
    var yCells = Math.sqrt(group.length / aspectRatio);
    var xCells = aspectRatio * yCells;

    if (Math.floor(yCells) * Math.floor(xCells) >= group.length) {
        yCells = Math.floor(yCells);
        xCells = Math.floor(xCells);
    } else if (Math.ceil(yCells) * Math.floor(xCells) >= group.length) {
        yCells = Math.ceil(yCells);
        xCells = Math.floor(xCells);
    } else if (Math.floor(yCells) * Math.ceil(xCells) >= group.length) {
        yCells = Math.floor(yCells);
        xCells = Math.ceil(xCells);
    } else {
        yCells = Math.ceil(yCells);
        xCells = Math.ceil(xCells);
    }

    if (group.length == 3) {
        xCells = 2;
        yCells = 2;
    }

    if (xCells > 1 && yCells > 1 && Math.abs(xCells - yCells) == 1) {
        var min = Math.min(xCells, yCells);
        var max = Math.max(xCells, yCells);
        yCells = min;
        xCells = max;
    }

    var cellWidth = (boundingArea.w - 20) / xCells;
    var cellHeight = (boundingArea.h - 20) / yCells;
    var firstCellMultiplier = 1.0;
    var xCellMultiplier = 1.0,
        yCellMultiplier = 1.0;
    if (xCells > 1 && yCells > 1) {
        // Make the first cell slightly larger
        // firstCellMultiplier = 1.1;
        // xCellMultiplier = (xCells - firstCellMultiplier) / (xCells - 1);
        // yCellMultiplier = (yCells - firstCellMultiplier) / (yCells - 1);
    }

    var y = boundingArea.y;
    for (var row = 0; row < yCells; row++) {
        var x = boundingArea.x;
        var height = cellHeight * (row == 0 ? firstCellMultiplier : yCellMultiplier);

        var newCells = [];
        for (var col = 0; col < xCells; col++) {
            var width = cellWidth * (col == 0 ? firstCellMultiplier : xCellMultiplier);
            var r = seededRandom(0.6, 1.0) * Math.min(width, height) / 2;
            var xfudge = 1.2 * (width - 2 * r) / 2.0;
            var yfudge = (height - 2 * r) / 2.0;
            var xf = col == 0 && row == 0 ? 0 : seededRandom(-xfudge, xfudge);
            var yf = col == 0 && row == 0 ? 0 : seededRandom(-1.2 * yfudge, 0.7 * yfudge);
            var _cell2 = {
                x: x + width / 2 + xf,
                y: y + height / 2 + yf,
                w: width,
                h: height,
                r: r
            };
            newCells.push(_cell2);
            x += width;
        }

        gridCells = gridCells.concat(newCells);

        y += height;
    }

    // Extra cells to use
    if (gridCells.length > group.length) {
        var extraCells = gridCells.splice(group.length);
        // Merge last cell with cell next to it
        if (yCells > 1) {
            var lastCell = extraCells.pop();
            var cellAboveIndex = xCells * yCells - 2;
            var cellAbove = gridCells[cellAboveIndex];
            // Sometimes, the cell above us is part of extraCells and no longer usable
            if (cellAbove) {
                gridCells[cellAboveIndex] = lastCell;
                lastCell.x = 0.5 * lastCell.x + 0.5 * cellAbove.x;
                lastCell.y = 0.7 * lastCell.y + 0.3 * cellAbove.y;
            }
        }
    }

    return gridCells;
}

function topologicalSort(adjacencyList) {
    // Get all nodes without dependencies. Add them to the result
    // list, sorting all nodes at each stage. Remove them from the
    // dependencies of other nodes, and repeat. Continue until there
    // are no remaining nodes without dependencies.
    var result = [];

    var dependencies = {};
    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
        for (var _iterator8 = Object.keys(adjacencyList)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var src = _step8.value;

            dependencies[src] = {};
        }
    } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
                _iterator8.return();
            }
        } finally {
            if (_didIteratorError8) {
                throw _iteratorError8;
            }
        }
    }

    var _iteratorNormalCompletion9 = true;
    var _didIteratorError9 = false;
    var _iteratorError9 = undefined;

    try {
        for (var _iterator9 = Object.keys(adjacencyList)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var _src = _step9.value;

            var dsts = adjacencyList[_src];
            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
                for (var _iterator13 = dsts[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                    var _dst2 = _step13.value;

                    dependencies[_dst2][_src] = true;
                }
            } catch (err) {
                _didIteratorError13 = true;
                _iteratorError13 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion13 && _iterator13.return) {
                        _iterator13.return();
                    }
                } finally {
                    if (_didIteratorError13) {
                        throw _iteratorError13;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion9 && _iterator9.return) {
                _iterator9.return();
            }
        } finally {
            if (_didIteratorError9) {
                throw _iteratorError9;
            }
        }
    }

    while (true) {
        var found = [];
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
            for (var _iterator10 = Object.keys(dependencies)[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                var dst = _step10.value;

                var deps = dependencies[dst];
                if (Object.keys(deps).length === 0) {
                    found.push(dst);
                }
            }
        } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion10 && _iterator10.return) {
                    _iterator10.return();
                }
            } finally {
                if (_didIteratorError10) {
                    throw _iteratorError10;
                }
            }
        }

        if (found.length === 0) break;

        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
            for (var _iterator11 = found[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                var _dst = _step11.value;
                var _iteratorNormalCompletion12 = true;
                var _didIteratorError12 = false;
                var _iteratorError12 = undefined;

                try {
                    for (var _iterator12 = Object.keys(dependencies)[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                        var key = _step12.value;

                        var _deps = dependencies[key];
                        delete _deps[_dst];
                    }
                } catch (err) {
                    _didIteratorError12 = true;
                    _iteratorError12 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion12 && _iterator12.return) {
                            _iterator12.return();
                        }
                    } finally {
                        if (_didIteratorError12) {
                            throw _iteratorError12;
                        }
                    }
                }

                delete dependencies[_dst];
            }

            // Sort the list to give us a deterministic order
        } catch (err) {
            _didIteratorError11 = true;
            _iteratorError11 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion11 && _iterator11.return) {
                    _iterator11.return();
                }
            } finally {
                if (_didIteratorError11) {
                    throw _iteratorError11;
                }
            }
        }

        found.sort();
        result.push(found);
    }

    return result;
}

var Mask = function (_mag$Rect3) {
    _inherits(Mask, _mag$Rect3);

    function Mask(cx, cy, r) {
        var color = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "#594764";

        _classCallCheck(this, Mask);

        // cx, cy are in % of context width/height
        var _this33 = _possibleConstructorReturn(this, (Mask.__proto__ || Object.getPrototypeOf(Mask)).call(this, 0, 0, 0, 0));

        _this33.cx = cx;
        _this33.cy = cy;
        _this33.radius = r;
        _this33.opacity = 0.0;
        _this33.ringControl = 0;
        _this33.color = color;
        return _this33;
    }

    _createClass(Mask, [{
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            // Do everything in absolute coordinates to avoid any
            // weirdness with stage scale changing
            ctx.scale(1.0, 1.0);
            var w = ctx.canvas.clientWidth;
            var h = ctx.canvas.clientHeight;
            var cx = this.cx * w;
            var cy = this.cy * h;

            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(cx, cy, this.radius, 0, 2 * Math.PI);
            ctx.rect(w, 0, -w, h);
            ctx.fill();
            ctx.globalAlpha = 1.0;
            var numRings = Math.min(Math.ceil(this.ringControl / 10), 4);

            setStrokeStyle(ctx, {
                lineWidth: 2,
                color: 'cyan'
            });
            for (var i = 0; i < numRings; i++) {
                var k = this.ringControl - i * 20;
                ctx.beginPath();
                ctx.arc(cx, cy, 30 * Math.exp(k / 50), 0, 2 * Math.PI);
                ctx.globalAlpha = Math.max(0.2, 1 - k / 50);
                ctx.stroke();
            }
        }
    }]);

    return Mask;
}(mag.Rect);

// -- OLD --
// class LevelCell extends MenuButton {
// constructor(x, y, w, h, name, icon, onclick) {
//     super(x, y, w, h, name.toString(), onclick);
//
//     this.shadowOffset = 10;
//
//     // Visual icon
//     if (icon) {
//         let img = new mag.ImageRect(0, 0, w, h, icon);
//         img.ignoreEvents = true;
//         this.addChild(img);
//     } else { // Default to text displaying level index.
//         let txt = new TextExpr(name.toString(), 'Futura');
//         txt.color = 'white';
//         txt.anchor = { x:0.5, y:0.5 };
//         txt.pos = { x: w / 2.0, y: w / 2.0 };
//         this.addChild(txt);
//     }
//
//     this.name = name;
//     this.onclick = onclick;
// }
// onmouseclick(pos) {
//     if (this.onclick)
//         this.onclick();
// }
// }
// class ChapterCard extends mag.Rect {
//     constructor(x, y, w, h, name, desc, icon, onclick) {
//
//         const TXTPAD = 50;
//         super(x, y, w, h);
//
//         // Visual icon
//         let img = new mag.ImageRect(0, 0, w, h - TXTPAD, icon);
//         img.ignoreEvents = true;
//         this.addChild(img);
//
//         // Chapter name
//         let txt = new TextExpr(name, 'Futura');
//         txt.color = 'white';
//         txt.pos = { x:img.pos.x+img.size.w/2.0,
//                     y:img.pos.y+img.size.h+txt.fontSize };
//         txt.anchor = { x:0.5, y:0 };
//         this.addChild(txt);
//
//         this.name = name;
//         this.onclick = onclick;
//     }
//
//     onmouseclick(pos) {
//         if (this.onclick)
//             this.onclick(this.name);
//     }
// }
//
// class ChapterSelectMenu extends mag.Stage {
//     constructor(canvas, onChapterSelect) {
//         super(canvas);
//         this.showChapters(onChapterSelect);
//     }
//
//     showChapters(onselect) {
//
//         let W = 200; let P = 40; let X = 0;
//         let onChapterSelect = onselect;
//         console.log(onChapterSelect);
//         let container = new DraggableRect(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0 - W / 2.0, 100, 1000, 300);
//         container.constrainY();
//         container.color = 'lightgray';
//         container.shadowOffset = 0;
//         container.snapEvery(W + P, W / 2.0 - P);
//         this.add(container);
//
//         Resource.getChapters().then((chapters) => {
//             container.size = { w:(W + P) * chapters.length, h:300 };
//             chapters.forEach((chap) => {
//
//                 let c = new ChapterCard(X, 0, W, 300, chap.name, chap.description, null, onChapterSelect);
//                 //c.ignoreEvents = true;
//                 c.color = 'HotPink';
//                 c.onmousedrag = (pos) => {
//                     pos.x -= c.pos.x;
//                     container.onmousedrag(pos);
//                 };
//                 c.onmouseup = (pos) => {
//                     pos.x -= c.pos.x;
//                     container.onmouseup(
//                         pos);
//                 };
//                 container.addChild(c);
//
//                 X += W + P;
//
//             });
//         });
//     }
// }
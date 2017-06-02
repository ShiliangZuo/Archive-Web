"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ChoiceExpr = function (_Expression) {
    _inherits(ChoiceExpr, _Expression);

    function ChoiceExpr() {
        _classCallCheck(this, ChoiceExpr);

        var _this = _possibleConstructorReturn(this, (ChoiceExpr.__proto__ || Object.getPrototypeOf(ChoiceExpr)).call(this, []));

        _this.label = new TextExpr("?");
        _this.label.color = "white";
        _this.addArg(_this.label);

        for (var _len = arguments.length, choices = Array(_len), _key = 0; _key < _len; _key++) {
            choices[_key] = arguments[_key];
        }

        _this.choices = choices;
        _this._sparkling = false;
        _this._state = "closed";
        _this._sparkles = [];
        _this.padding.between = 10;
        return _this;
    }

    /** The max number of choices to lay out in a single row */


    _createClass(ChoiceExpr, [{
        key: "update",
        value: function update() {
            var _this2 = this;

            // (Re)start the sparkle
            if (!this._sparkling && this.stage) {
                this.sparkle();
            } else if (!this.stage) {
                this._sparkling = false;
            }

            if (this._state === "closed") {
                _get(ChoiceExpr.prototype.__proto__ || Object.getPrototypeOf(ChoiceExpr.prototype), "update", this).call(this);
            } else if (this._state === "open") {
                // Grid layout for our contents
                var rowSize = this.rowSize;
                this.children = [];

                this.holes.forEach(function (expr) {
                    return _this2.addChild(expr);
                });
                this.holes.forEach(function (expr) {
                    expr.anchor = { x: 0, y: 0.5 };
                    expr.scale = { x: 0.85, y: 0.85 };
                    expr.update();
                });
                var size = this.size;

                var _cellSize = this.cellSize,
                    boxW = _cellSize.w,
                    boxH = _cellSize.h;


                var col = 0;
                var row = 0;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.holes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var expr = _step.value;

                        var centerX = Math.max(0, (boxW - expr.absoluteSize.w) / 2);
                        var centerY = Math.max(0, (boxH - expr.absoluteSize.h) / 2);
                        expr.pos = {
                            x: this.padding.left + col * boxW + centerX,
                            y: this.padding.inner / 2 + row * boxH + expr.anchor.y * expr.size.h + centerY
                        };
                        expr.update();

                        col += 1;
                        if (col >= rowSize) {
                            col = 0;
                            row += 1;
                        }
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

                this.children = this.holes;
            }
        }

        /** Get rid of any current sparkles */

    }, {
        key: "cleanup",
        value: function cleanup() {
            this._sparkling = false;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._sparkles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var sparkle = _step2.value;

                    if (sparkle.stage) {
                        sparkle.stage.remove(sparkle);
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

            this._sparkles = [];
        }
    }, {
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            var gradient = ctx.createLinearGradient(pos.x, pos.y, pos.x + boundingSize.w, pos.y + boundingSize.h);
            gradient.addColorStop(0, 'green');
            gradient.addColorStop(0.4, 'blue');
            gradient.addColorStop(0.6, 'purple');
            gradient.addColorStop(1.0, 'red');
            this.color = gradient;
            _get(ChoiceExpr.prototype.__proto__ || Object.getPrototypeOf(ChoiceExpr.prototype), "drawInternal", this).call(this, ctx, pos, boundingSize);
        }

        /** Pretend to be a Toolbox so we can use the same API. */

    }, {
        key: "removeExpression",
        value: function removeExpression(expr) {
            var _this3 = this;

            this.holes.splice(0, this.holes.length);
            this._state = "closing";
            this.update();
            Animate.tween(this, {
                _size: {
                    w: 0,
                    h: 0
                },
                opacity: 0.5,
                scale: {
                    x: 0.5,
                    y: 0.5
                }
            }, 200).after(function () {
                _this3.cleanup();
                (_this3.parent || _this3.stage).swap(_this3, null);
            });
            expr.onmouseenter = expr._onmouseenter;
            expr.toolbox = null;
        }
    }, {
        key: "onmouseclick",
        value: function onmouseclick() {
            var _this4 = this;

            if (this._state === "closed") {
                this.removeArg(this.label);

                this._state = "open";
                this.choices.forEach(function (c) {
                    var choice = c.clone();
                    choice.toolbox = _this4;
                    _this4.holes.push(choice);
                });
                this.update();
                var size = this.openSize;
                this._state = "opening";
                this.holes.splice(0, this.holes.length);
                this.update();

                Animate.tween(this, {
                    _size: size
                }, 300).after(function () {
                    _this4.choices.forEach(function (c) {
                        var choice = c.clone();
                        choice.toolbox = _this4;

                        choice._onmouseenter = choice.onmouseenter;
                        choice.onmouseenter = function () {
                            this.opacity = 1.0;
                        }.bind(choice);

                        _this4.holes.push(choice);
                    });
                    _this4._state = "open";
                    _this4.update();
                });
            }
        }
    }, {
        key: "onmouseleave",
        value: function onmouseleave() {
            _get(ChoiceExpr.prototype.__proto__ || Object.getPrototypeOf(ChoiceExpr.prototype), "onmouseleave", this).call(this);
            if (this._state === "open") {
                this.holes.forEach(function (expr) {
                    expr.opacity = 0.4;
                });
            }
        }
    }, {
        key: "onmouseenter",
        value: function onmouseenter() {
            _get(ChoiceExpr.prototype.__proto__ || Object.getPrototypeOf(ChoiceExpr.prototype), "onmouseenter", this).call(this);
            if (this._state === "open") {
                this.holes.forEach(function (expr) {
                    expr.opacity = 1;
                });
            }
        }
    }, {
        key: "clone",
        value: function clone() {
            var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            var c = _get(ChoiceExpr.prototype.__proto__ || Object.getPrototypeOf(ChoiceExpr.prototype), "clone", this).call(this, parent);
            c.choices = this.choices.map(function (c) {
                return c.clone();
            });
            return c;
        }
    }, {
        key: "sparkle",
        value: function sparkle() {
            var _this5 = this;

            // Derived from SparkleTrigger
            this._sparkling = true;

            var center = this.centerPos();
            var size = this.absoluteSize;
            if (size.w === 0) size = { w: 50, h: 50 };
            var count = Math.min(200, 80 * (size.w / 50.0));
            var minRad = 1;
            var maxRad = 4;
            var colorElems = "0123456789ABCDEF";
            var colorFunc = function colorFunc(part) {
                var r = colorElems[Math.floor(Math.random() * colorElems.length)];
                var g = colorElems[Math.floor(Math.random() * colorElems.length)];
                var b = colorElems[Math.floor(Math.random() * colorElems.length)];
                return "#" + r + g + b;
            };

            var _loop = function _loop(i) {
                var part = new mag.SparkleStar(center.x, center.y, Math.floor(minRad + (maxRad - minRad) * Math.random()));
                _this5._sparkles.push(part);

                var ghostySparkle = function ghostySparkle() {
                    size = _this5.absoluteSize;
                    if (size.w === 0) size = { w: 50, h: 50 };

                    var vec = { x: (Math.random() - 0.5) * size.w * 1.5,
                        y: (Math.random() - 0.5) * size.h * 1.5 - part.size.h / 2.0 };

                    part.pos = addPos(_this5.centerPos(), vec);
                    part.color = colorFunc(part);
                    part.shadowOffset = 0;
                    part.opacity = 1.0;
                    _this5.stage.add(part);
                    part.anim = Animate.tween(part, { opacity: 0.0 }, Math.max(2000 * Math.random(), 1000), function (elapsed) {
                        return elapsed;
                    }, false).after(function () {
                        _this5.stage.remove(part);
                        if (_this5._sparkling) {
                            ghostySparkle();
                        }
                    });
                };
                ghostySparkle();
            };

            for (var i = 0; i < count; i++) {
                _loop(i);
            }
            Animate.drawUntil(this.stage, function () {
                return !_this5._sparkling;
            });
        }
    }, {
        key: "toString",
        value: function toString() {
            var children = this.choices.map(function (x) {
                return x.toString();
            }).join(" ");
            return "(choice " + children + ")";
        }
    }, {
        key: "rowSize",
        get: function get() {
            var hasRectangular = false;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.choices[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var expr = _step3.value;

                    if (expr.size.h > 0 && expr.size.w / expr.size.h >= 1.7) {
                        hasRectangular = true;
                        break;
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

            var root = Math.ceil(Math.sqrt(this.choices.length));

            if (hasRectangular) {
                return Math.min(root, 2);
            } else {
                return root;
            }
        }
    }, {
        key: "size",
        get: function get() {
            if (this._state === "closed") {
                return _get(ChoiceExpr.prototype.__proto__ || Object.getPrototypeOf(ChoiceExpr.prototype), "size", this);
            } else if (this._state === "opening" || this._state === "closing") {
                return this._size;
            } else if (this._state === "open") {
                return this.openSize;
            } else {
                throw "Invalid state";
            }
        }
    }, {
        key: "openSize",
        get: function get() {
            var padding = this.padding;
            if (this.getHoleSizes().length === 0) return { w: this._size.w, h: this._size.h };

            var _cellSize2 = this.cellSize,
                boxW = _cellSize2.w,
                boxH = _cellSize2.h;

            var width = this.padding.left + this.rowSize * boxW + this.padding.right;
            var height = this.padding.inner * 2 + Math.ceil(this.choices.length / this.rowSize) * boxH;

            return { w: width, h: height };
        }

        /** The size of a single cell in our grid layout. */

    }, {
        key: "cellSize",
        get: function get() {
            var sizes = this.getHoleSizes();
            var boxW = 0;
            var boxH = 0;

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = sizes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var size = _step4.value;

                    if (size.w > boxW) boxW = size.w;
                    if (size.h > boxH) boxH = size.h;
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

            boxW += this.padding.between;
            boxH += this.padding.between;

            return {
                w: boxW,
                h: boxH
            };
        }
    }]);

    return ChoiceExpr;
}(Expression);
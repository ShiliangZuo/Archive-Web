'use strict';

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A very special expression not found in programming
 * that acts as test cases for the 'function' computed
 * by the player. Allows for multiple simultaneous, yet separate goals.
 */

var EntangledExpr = function (_ExpressionPlus) {
    _inherits(EntangledExpr, _ExpressionPlus);

    function EntangledExpr(exprs) {
        var isShuttered = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        _classCallCheck(this, EntangledExpr);

        var OverlayClass = void 0;
        if (!isShuttered) {
            var _this2 = _possibleConstructorReturn(this, (EntangledExpr.__proto__ || Object.getPrototypeOf(EntangledExpr)).call(this, exprs));

            OverlayClass = ExprSelectorOverlay;
        } else {
            var _this2 = _possibleConstructorReturn(this, (EntangledExpr.__proto__ || Object.getPrototypeOf(EntangledExpr)).call(this, [exprs[0]]));

            _this2.hiddenExprs = exprs.slice();
            OverlayClass = ExprShutterOverlay;
        }
        exprs.forEach(function (e) {
            return e.lock();
        });

        var overlay = new OverlayClass(0, 0, 56, 56);
        overlay.anchor = { x: 0, y: 0.5 };
        overlay.ignoreEvents = true;
        _this2.addChild(overlay);
        _this2.update();
        _this2.overlay = overlay;

        var frames = _this2.getHoleSizes();
        _this2.overlay.pos = _this2.holes[0].pos;
        _this2.overlay.size = frames[0];

        _this2.isShuttered = isShuttered;
        return _possibleConstructorReturn(_this2);
    }

    _createClass(EntangledExpr, [{
        key: 'animate',
        value: function animate() {
            var _this = this;

            if (this.isShuttered) {
                // Close shutter and swap out inner expression for next in sequence.
                var animateShutter = function animateShutter(idx) {
                    _this.overlay.closeShutter(250).after(function () {
                        _this.removeChild(_this.holes[0]);
                        _this.removeChild(_this.overlay);
                        _this.holes = [_this.hiddenExprs[idx]];
                        _this.update();
                        _this.addChild(_this.overlay);
                        _this.overlay.openShutter(250).after(function () {
                            Animate.wait(2000).after(function () {
                                _this.afterWait = function () {
                                    return animateShutter((idx + 1) % _this.hiddenExprs.length);
                                };
                                if (_this.pair) {

                                    if (_this.pair.waiting) {
                                        _this.waiting = false;
                                        _this.pair.waiting = false;
                                        _this.pair.afterWait();
                                        _this.afterWait();
                                    } else _this.waiting = true;
                                } else _this.afterWait();
                            });
                        });
                    });
                };
                animateShutter(1);
            } else {
                // Move selector frame from expression to expression, left to right.
                var animateFrameOverHole = function animateFrameOverHole(idx) {
                    var frames = _this.getHoleSizes();
                    Animate.tween(_this.overlay, { size: frames[idx], pos: _this.holes[idx].pos }, 500, function (e) {
                        return Math.pow(e, 2);
                    }).after(function () {
                        Animate.wait(2000).after(function () {
                            _this.afterWait = function () {
                                return animateFrameOverHole((idx + 1) % _this.holes.length);
                            };
                            if (_this.pair) {

                                if (_this.pair.waiting) {
                                    _this.waiting = false;
                                    _this.pair.waiting = false;
                                    _this.pair.afterWait();
                                    _this.afterWait();
                                } else _this.waiting = true;
                            } else _this.afterWait();
                        });
                    });
                };
                animateFrameOverHole(1);
            }
        }
    }], [{
        key: 'pairedAnimate',
        value: function pairedAnimate(p1, p2) {
            p1.pair = p2;
            p2.pair = p1;
            p1.animate();
            p2.animate();
        }
    }]);

    return EntangledExpr;
}(ExpressionPlus);

var ExprSelectorOverlay = function (_mag$RoundedRect) {
    _inherits(ExprSelectorOverlay, _mag$RoundedRect);

    function ExprSelectorOverlay(x, y, w, h) {
        var radius = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 6;

        _classCallCheck(this, ExprSelectorOverlay);

        var _this3 = _possibleConstructorReturn(this, (ExprSelectorOverlay.__proto__ || Object.getPrototypeOf(ExprSelectorOverlay)).call(this, x, y, w, h, radius));

        _this3.stroke = { color: 'black', lineWidth: 6 };
        _this3.color = null;
        _this3.shadowOffset = 0;
        return _this3;
    }

    return ExprSelectorOverlay;
}(mag.RoundedRect);

var ExprShutterOverlay = function (_ExprSelectorOverlay) {
    _inherits(ExprShutterOverlay, _ExprSelectorOverlay);

    function ExprShutterOverlay(x, y, w, h, radius) {
        _classCallCheck(this, ExprShutterOverlay);

        var _this4 = _possibleConstructorReturn(this, (ExprShutterOverlay.__proto__ || Object.getPrototypeOf(ExprShutterOverlay)).call(this, x, y, w, h, radius));

        var shutterLeft = new mag.Rect(0, 0, 1, h);
        shutterLeft.pos = zeroPos();
        shutterLeft.color = 'black';
        _this4.addChild(shutterLeft);
        _this4.shutterLeft = shutterLeft;

        var shutterRight = new mag.Rect(0, 0, 1, h);
        shutterRight.anchor = { x: 1, y: 0 };
        shutterRight.pos = { x: w, y: 0 };
        shutterRight.color = 'black';
        _this4.addChild(shutterRight);
        _this4.shutterRight = shutterRight;
        return _this4;
    }

    _createClass(ExprShutterOverlay, [{
        key: 'openShutter',
        value: function openShutter() {
            var dur = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 500;

            Animate.tween(this.shutterLeft, { size: { w: 0, h: this.shutterLeft.size.h } }, dur);
            return Animate.tween(this.shutterRight, { size: { w: 0, h: this.shutterRight.size.h } }, dur);
        }
    }, {
        key: 'closeShutter',
        value: function closeShutter() {
            var dur = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 500;

            Animate.tween(this.shutterLeft, { size: { w: this.size.w / 2, h: this.shutterLeft.size.h } }, dur, function (e) {
                return Math.pow(e, 2);
            });
            return Animate.tween(this.shutterRight, { size: { w: this.size.w / 2, h: this.shutterRight.size.h } }, dur, function (e) {
                return Math.pow(e, 2);
            });
        }
    }, {
        key: 'size',
        get: function get() {
            return _get(ExprShutterOverlay.prototype.__proto__ || Object.getPrototypeOf(ExprShutterOverlay.prototype), 'size', this);
        },
        set: function set(sz) {
            _set(ExprShutterOverlay.prototype.__proto__ || Object.getPrototypeOf(ExprShutterOverlay.prototype), 'size', sz, this);
            if (this.shutterLeft && this.shutterRight) {
                this.shutterLeft.size = { w: this.shutterLeft.size.w, h: sz.h };
                this.shutterRight.size = { w: this.shutterRight.size.w, h: sz.h };
                this.shutterRight.pos = { x: sz.w, y: 0 };
            }
        }
    }]);

    return ExprShutterOverlay;
}(ExprSelectorOverlay);
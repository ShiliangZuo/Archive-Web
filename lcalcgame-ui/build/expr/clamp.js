"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A graphically different expression
 * with a top, middle for an expression, and bottom.
 * Top resizes to subexpression width;
 * bottom resizes to middle expression's width.
 * Looks like the head of a wrench.
 */
var DEFAULT_BOT_CLAMP_HEIGHT = 24;

var ClampExpr = function (_Expression) {
    _inherits(ClampExpr, _Expression);

    function ClampExpr() {
        _classCallCheck(this, ClampExpr);

        return _possibleConstructorReturn(this, (ClampExpr.__proto__ || Object.getPrototypeOf(ClampExpr)).apply(this, arguments));
    }

    _createClass(ClampExpr, [{
        key: "aggregateSize",
        value: function aggregateSize(sizes) {
            var padding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            if (!padding) padding = { right: 0, left: 0, inner: 0 };
            return { w: sizes.reduce(function (p, c) {
                    return p + c.w + padding.inner;
                }, padding.left) + padding.right,
                h: Math.max.apply(Math, _toConsumableArray(sizes.map(function (sz) {
                    return sz.h;
                }))) + padding.inner };
        }
    }, {
        key: "getTopSize",
        value: function getTopSize() {
            return this.aggregateSize(this.getHoleSizes().slice(0, this.breakIndices.top), this.padding);
        }
    }, {
        key: "getMidSize",
        value: function getMidSize() {
            return this.aggregateSize(this.getHoleSizes().slice(this.breakIndices.top, this.breakIndices.mid), this.padding);
        }
    }, {
        key: "getBotSize",
        value: function getBotSize() {
            if (this.breakIndices.bot > this.breakIndices.mid) return this.aggregateSize(this.getHoleSizes().slice(this.breakIndices.top, this.breakIndices.mid), this.padding);else {
                var s = this.getMidSize();
                s.h = DEFAULT_BOT_CLAMP_HEIGHT;
                //s.w += DEFAULT_BOT_CLAMP_HEIGHT;
                return s;
            }
        }

        // Sizes to match its children.

    }, {
        key: "update",
        value: function update() {
            var _this3 = this;

            var _this = this;
            this.children = [];

            this.holes.forEach(function (expr) {
                return _this.addChild(expr);
            });
            // In the centering calculation below, we need this expr's
            // size to be stable. So we first set the scale on our
            // children, then compute our size once to lay out the
            // children.
            this.holes.forEach(function (expr) {
                expr.anchor = { x: 0, y: 0.5 };
                expr.scale = { x: 0.85, y: 0.85 };
                expr.update();
            });
            var size = this.size;
            var padding = this.padding.inner;
            var x = this.padding.left;
            var y = this.getTopSize().h / 2.0 + (this.exprOffsetY ? this.exprOffsetY : 0);
            if (this._layout.direction == "vertical") {
                y = padding;
            }

            this.holes.forEach(function (expr, i) {
                // Update hole expression positions.

                if (i === _this3.breakIndices.top) {
                    x = _this3.getMidSize().w / 2.0 - expr.size.w / 2.0 * expr.scale.x;
                    y += _this3.getTopSize().h + padding / 2;
                }

                expr.anchor = { x: 0, y: 0.5 };
                expr.pos = { x: x, y: y };
                expr.scale = { x: 0.85, y: 0.85 };
                expr.update();

                if (_this3._layout.direction == "vertical") {
                    y += expr.anchor.y * expr.size.h * expr.scale.y;
                    var offset = x;

                    // Centering
                    if (_this3._layout.align == "horizontal") {
                        var innerWidth = size.w;
                        var scale = expr.scale.x;
                        offset = (innerWidth - scale * expr.size.w) / 2;
                    }

                    expr.pos = { x: offset, y: y };

                    y += (1 - expr.anchor.y) * expr.size.h * expr.scale.y;
                    if (_this3.padding.between) y += _this3.padding.between;
                } else {
                    x += expr.size.w * expr.scale.x + padding;
                }
            });

            this.children = this.holes; // for rendering
        }
    }, {
        key: "drawBaseShape",
        value: function drawBaseShape(ctx, pos, boundingSize) {
            clampRect(ctx, pos.x, pos.y, boundingSize.w * this.topRatio.x, boundingSize.h * this.topRatio.y, boundingSize.w * this.midRatio.x, boundingSize.h * this.midRatio.y, boundingSize.w * this.botRatio.x, boundingSize.h * this.botRatio.y, this.radius * this.absoluteScale.x, true, this.stroke ? true : false, this.stroke ? this.stroke.opacity : null, this.notches ? this.notches : null);
        }
    }, {
        key: "size",
        get: function get() {
            var padding = this.padding;
            var width = 0;
            var height = DEFAULT_EXPR_HEIGHT;

            var topSize = this.getTopSize();
            var midSize = this.getMidSize();
            var botSize = this.getBotSize();

            var sz = { w: Math.max(topSize.w, midSize.w, botSize.w),
                h: [topSize.h, midSize.h, botSize.h].reduce(function (a, b) {
                    return a + b;
                }, 0) };

            this.topRatio = { x: topSize.w / sz.w, y: (topSize.h + padding.inner) / sz.h };
            this.midRatio = { x: padding.left * 2 / sz.w, y: (midSize.h - padding.inner) / sz.h };
            this.botRatio = { x: (botSize.w - padding.left * 2) / sz.w, y: botSize.h / sz.h };

            return sz;
        }
    }]);

    return ClampExpr;
}(Expression);
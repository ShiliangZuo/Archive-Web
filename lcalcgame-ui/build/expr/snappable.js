'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Snappable = function (_Expression) {
    _inherits(Snappable, _Expression);

    function Snappable(expr) {
        var next = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        _classCallCheck(this, Snappable);

        var _this = _possibleConstructorReturn(this, (Snappable.__proto__ || Object.getPrototypeOf(Snappable)).call(this, [expr]));

        _this.origNext = next;
        _this.topDivotStroke = _this.bottomDivotStroke = null;
        _this.divotHeight = 6;
        _this.prev = null;
        _this.next = null;

        _this.tentativeTarget = null;
        _this.tentativeRelation = null;

        if (next) {
            _this.next = next;
            next.prev = _this;
        }
        return _this;
    }

    _createClass(Snappable, [{
        key: 'update',
        value: function update() {
            _get(Snappable.prototype.__proto__ || Object.getPrototypeOf(Snappable.prototype), 'update', this).call(this);

            if (this.next && !this.next.stage) {
                this.stage.add(this.next);
            }

            this.updatePos();

            if (this.next) {
                this.next.update();
            }
        }
    }, {
        key: 'updatePos',
        value: function updatePos() {
            if (this.prev) {
                var ppos = this.prev.pos;
                var psize = this.prev.size;
                this._pos = {
                    x: ppos.x - this.prev.anchor.x * psize.w + this.anchor.x * this.size.w,
                    y: ppos.y + (1 - this.prev.anchor.y) * psize.h + this.anchor.y * this.size.h - 4
                };
            }

            if (this.next) this.next.updatePos();
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            if (!this.stage) return;

            _get(Snappable.prototype.__proto__ || Object.getPrototypeOf(Snappable.prototype), 'onmousedrag', this).call(this, pos);

            if (this.prev) {
                this.prev.next = null;
                this.prev = null;
            }

            var nodes = this.stage.getNodesWithClass(Snappable, [this], false);
            var myTd = this.topDivotPos;
            // If dragging a stack around, use the last node's divot
            var bottom = this.bottom;
            var myBd = bottom.bottomDivotPos;

            this.tentativeRelation = this.tentativeTarget = null;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var node = _step.value;

                    if (node == this.prev || node == this.next) continue;

                    var td = node.topDivotPos;
                    var bd = node.bottomDivotPos;
                    var distanceX = myTd.x - bd.x;
                    var distanceY = myTd.y - bd.y;

                    if (distanceX * distanceX + distanceY * distanceY < 360) {
                        this.topDivotStroke = node.bottomDivotStroke = { color: 'green', lineWidth: 2 };
                        this.tentativeTarget = node;
                        this.tentativeRelation = 'next';
                        continue;
                    } else {
                        this.topDivotStroke = node.bottomDivotStroke = null;
                    }

                    distanceX = myBd.x - td.x;
                    distanceY = myBd.y - td.y;

                    if (distanceX * distanceX + distanceY * distanceY < 360) {
                        bottom.bottomDivotStroke = node.topDivotStroke = { color: 'green', lineWidth: 2 };
                        this.tentativeTarget = node;
                        this.tentativeRelation = 'prev';
                        continue;
                    } else {
                        bottom.bottomDivotStroke = node.topDivotStroke = null;
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

            if (this.next) this.next.updatePos();
        }
    }, {
        key: 'onmouseup',
        value: function onmouseup(pos) {
            if (!this.stage) return;

            _get(Snappable.prototype.__proto__ || Object.getPrototypeOf(Snappable.prototype), 'onmouseup', this).call(this, pos);

            if (this.tentativeTarget) {
                var bottom = this.bottom;
                if (this.tentativeRelation == 'next') {
                    bottom.next = this.tentativeTarget.next;
                    this.tentativeTarget.next = this;
                    this.prev = this.tentativeTarget;

                    if (bottom.next) {
                        bottom.next.prev = bottom;
                    }
                } else {
                    this.prev = this.tentativeTarget.prev;
                    this.tentativeTarget.prev = this.bottom;
                    bottom.next = this.tentativeTarget;

                    if (this.prev) {
                        this.prev.next = this;
                    }

                    bottom.bottomDivotStroke = null;
                }

                this.bottomDivotStroke = this.topDivotStroke = this.tentativeTarget.topDivotStroke = this.tentativeTarget.bottomDivotStroke = null;
                this.tentativeTarget = this.tentativeRelation = null;

                if (this.canReduce()) {
                    var nodes = this.stage.getNodesWithClass(Snappable, [], false);
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var node = _step2.value;

                            Animate.blink(node, 1000, [1, 1, 0], 1);
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
                }
            }
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            var _this2 = this;

            ctx.fillStyle = this.shadowColor;

            boundingSize.h -= this.divotHeight;

            var radius = this.radius * this.absoluteScale.x;

            var draw = function draw(offset) {
                var x = pos.x,
                    y = pos.y;
                var width = boundingSize.w,
                    height = boundingSize.h;


                y += offset;

                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + 20, y);
                ctx.lineTo(x + 25, y + _this2.divotHeight);
                ctx.lineTo(x + 30, y);
                ctx.lineTo(x + width - radius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                ctx.lineTo(x + 30, y + height);
                ctx.lineTo(x + 25, y + height + _this2.divotHeight);
                ctx.lineTo(x + 20, y + height);
                ctx.lineTo(x + radius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.fill();

                if (offset) return;
                if (_this2.stroke) {
                    setStrokeStyle(ctx, _this2.stroke);
                    strokeWithOpacity(ctx, _this2.stroke.opacity);
                }

                if (_this2.topDivotStroke) {
                    ctx.beginPath();
                    ctx.lineTo(x + 20, y);
                    ctx.lineTo(x + 25, y + _this2.divotHeight);
                    ctx.lineTo(x + 30, y);
                    setStrokeStyle(ctx, _this2.topDivotStroke);
                    strokeWithOpacity(ctx, _this2.topDivotStroke.opacity);
                }
                if (_this2.bottomDivotStroke) {
                    ctx.beginPath();
                    ctx.lineTo(x + 30, y + height);
                    ctx.lineTo(x + 25, y + height + _this2.divotHeight);
                    ctx.lineTo(x + 20, y + height);
                    setStrokeStyle(ctx, _this2.bottomDivotStroke);
                    strokeWithOpacity(ctx, _this2.bottomDivotStroke.opacity);
                }
            };

            if (this.shadowOffset !== 0) {
                draw(this.shadowOffset);
            }
            if (this.color) ctx.fillStyle = this.color;
            draw(0);
        }
    }, {
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(ctx, pos, boundingSize) {
            var radius = this.radius * this.absoluteScale.x;
            var rightMargin = 15 * this.scale.x;
            ctx.fillStyle = "#fff";
            roundRect(ctx, pos.x + boundingSize.w - rightMargin, pos.y, rightMargin, boundingSize.h, {
                tl: 0,
                bl: 0,
                tr: radius,
                br: radius
            }, true, false, null);

            var fontSize = 35 * this.scale.y * 0.85;
            var y = pos.y + (boundingSize.h - fontSize) / 2;
            ctx.fillStyle = "black";
            ctx.font = fontSize + 'px Consolas, monospace';
            ctx.textBaseline = "top";
            ctx.fillText(";", pos.x + boundingSize.w - rightMargin, y);
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            if (this.prev) {
                return this.prev.performReduction();
            }

            // Save stage since it gets erased down the line
            var stage = this.stage;

            var body = [];
            var cur = this;

            while (cur) {
                if (cur != this) {
                    stage.swap(cur, null);
                }
                body.push(cur.contents);
                cur = cur.next;
            }

            stage.swap(this, new (Function.prototype.bind.apply(ExprManager.getClass('sequence'), [null].concat(body)))());
            return Promise.resolve(null);
        }
    }, {
        key: 'toString',
        value: function toString() {
            var next = "";
            if (this.origNext) {
                next = " " + this.origNext.toString();
            }
            return '(snappable ' + this.contents.toString() + next + ')';
        }
    }, {
        key: 'contents',
        get: function get() {
            return this.holes[0];
        }
    }, {
        key: 'size',
        get: function get() {
            var size = _get(Snappable.prototype.__proto__ || Object.getPrototypeOf(Snappable.prototype), 'size', this);
            size.h += 8;
            return size;
        }
    }, {
        key: 'topDivotPos',
        get: function get() {
            var pos = this.absolutePos;
            var size = this.absoluteSize;
            pos.x += 25 - this.anchor.x * size.w;
            pos.y += this.divotHeight - this.anchor.y * size.h;
            return pos;
        }
    }, {
        key: 'bottomDivotPos',
        get: function get() {
            var pos = this.topDivotPos;
            pos.y += this.size.h;
            return pos;
        }
    }, {
        key: 'bottom',
        get: function get() {
            var bottom = this;

            while (bottom.next) {
                bottom = bottom.next;
            }

            return bottom;
        }
    }]);

    return Snappable;
}(Expression);

var FadedSnappable = function (_Snappable) {
    _inherits(FadedSnappable, _Snappable);

    function FadedSnappable() {
        _classCallCheck(this, FadedSnappable);

        return _possibleConstructorReturn(this, (FadedSnappable.__proto__ || Object.getPrototypeOf(FadedSnappable)).apply(this, arguments));
    }

    _createClass(FadedSnappable, [{
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(ctx, pos, boundingSize) {
            var rightMargin = 15 * this.scale.x;
            var fontSize = 35 * this.scale.y * 0.85;
            var y = pos.y + (boundingSize.h - fontSize) / 2;
            ctx.fillStyle = "black";
            ctx.font = fontSize + 'px Consolas, monospace';
            ctx.textBaseline = "top";
            ctx.fillText(";", pos.x + boundingSize.w - rightMargin, y);
        }
    }]);

    return FadedSnappable;
}(Snappable);
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SCALE_FACTOR = 0.33;

var RepeatLoopExpr = function (_Expression) {
    _inherits(RepeatLoopExpr, _Expression);

    function RepeatLoopExpr(times, body) {
        _classCallCheck(this, RepeatLoopExpr);

        var _this = _possibleConstructorReturn(this, (RepeatLoopExpr.__proto__ || Object.getPrototypeOf(RepeatLoopExpr)).call(this, []));

        if (times instanceof MissingExpression) {
            times = new MissingNumberExpression();
        }
        _this.color = "#7777CC";
        _this.addArg(times);
        _this.addArg(body);
        _this.template = null;

        // Offset drawing self for a "stamp" effect
        _this._animationOffset = 0;

        _this._leverLength = 0.0;
        _this._leverAngle = -Math.PI / 2;
        return _this;
    }

    _createClass(RepeatLoopExpr, [{
        key: 'canReduce',
        value: function canReduce() {
            return this.timesExpr && (this.timesExpr.canReduce() || this.timesExpr.isValue()) && this.bodyExpr && this.bodyExpr.isComplete();
        }
    }, {
        key: 'update',
        value: function update() {
            _get(RepeatLoopExpr.prototype.__proto__ || Object.getPrototypeOf(RepeatLoopExpr.prototype), 'update', this).call(this);

            // If we're animating and we already have a template, don't
            // reset it by accident
            if (this._animating && this.template) return;

            if (this.timesExpr instanceof NumberExpr) {
                var missing = [];
                for (var i = 0; i < this.timesExpr.number; i++) {
                    missing.push(this.bodyExpr.clone());
                }

                this.template = new (Function.prototype.bind.apply(ExprManager.getClass('sequence'), [null].concat(missing)))();
                this.template.lockSubexpressions();
                this.template.scale = { x: 0.8, y: 0.8 };
                this.template.parent = this;
                this.template.pos = {
                    x: this.bodyExpr.pos.x + 5,
                    y: this.size.h - this.template.padding.inner / 2
                };
                this.template.holes.forEach(function (expr) {
                    expr.opacity = 0.3;
                });
            } else {
                this.template = null;
            }

            if (this.template != null) {
                this.template.update();
            };
        }
    }, {
        key: 'getHoleSizes',
        value: function getHoleSizes() {
            var result = _get(RepeatLoopExpr.prototype.__proto__ || Object.getPrototypeOf(RepeatLoopExpr.prototype), 'getHoleSizes', this).call(this);
            if (this.template) {
                // Adjust size if the template is larger than the body
                result[1].w = Math.max(result[1].w, this.template.size.w * this.template.scale.x);
            }
            return result;
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            var _this2 = this;

            if (this.template != null && !this.parent) {
                ctx.save();
                this.template.draw(ctx);
                ctx.restore();
            }

            var divotX = this.timesExpr.absolutePos.x + this.timesExpr.absoluteSize.w + (this.bodyExpr.absolutePos.x - (this.timesExpr.absolutePos.x + this.timesExpr.absoluteSize.w)) / 2.0;
            var bracketHeight = boundingSize.h * 0.2;
            var radius = this.radius * this.absoluteScale.x;
            var bracketRadius = bracketHeight;

            var trayLeft = this.bodyExpr.absolutePos.x;
            var trayRight = this.bodyExpr.absolutePos.x + this.bodyExpr.absoluteSize.w;
            if (this.template) {
                trayLeft = this.template.absolutePos.x;
                trayRight = this.template.absolutePos.x + this.template.absoluteSize.w;
            }

            if (!this.parent) {
                var leverCenterX = trayRight;
                var leverCenterY = (pos.y - 10 + pos.y + boundingSize.h + 10) / 2;
                var leverWidth = 5 * this._leverLength;
                var leverLength = 50 * this._leverLength;

                ctx.fillStyle = this.color;
                drawPointsAround(ctx, leverCenterX, leverCenterY, [[0, -leverWidth], [0, leverWidth], [leverLength, leverWidth], [leverLength, -leverWidth]], this._leverAngle);
            }

            var offsetLineTo = function offsetLineTo(offset, x, y) {
                return ctx.lineTo(x, y + offset);
            };
            var offsetQuadraticCurveTo = function offsetQuadraticCurveTo(offset, cx, cy, x, y) {
                return ctx.quadraticCurveTo(cx, cy + offset, x, y + offset);
            };

            var draw = function draw(offset) {
                ctx.beginPath();
                ctx.moveTo(pos.x + radius + offset, pos.y + offset);
                offsetLineTo(offset, divotX - bracketRadius, pos.y);
                // "Divot" separating stamp and number
                offsetQuadraticCurveTo(offset, divotX, pos.y, divotX, pos.y + bracketRadius);
                // "Output tray"
                offsetLineTo(offset, trayLeft, pos.y - 10);
                offsetLineTo(offset, trayLeft, pos.y);
                offsetLineTo(offset, trayRight, pos.y);
                offsetLineTo(offset, trayRight, pos.y - 10);
                if (pos.x + boundingSize.w - trayRight > 20) {
                    offsetLineTo(offset, trayRight + 5, pos.y);
                    offsetLineTo(offset, pos.x + boundingSize.w - radius, pos.y);
                    offsetQuadraticCurveTo(offset, pos.x + boundingSize.w, pos.y, pos.x + boundingSize.w, pos.y + radius);
                } else {
                    offsetLineTo(offset, pos.x + boundingSize.w, pos.y + radius);
                }
                // Right side
                offsetLineTo(offset, pos.x + boundingSize.w, pos.y + boundingSize.h - radius);
                // "Input tray"
                if (pos.x + boundingSize.w - trayRight > 20) {
                    offsetQuadraticCurveTo(offset, pos.x + boundingSize.w, pos.y + boundingSize.h, pos.x + boundingSize.w - radius, pos.y + boundingSize.h);
                    offsetLineTo(offset, trayRight + 5, pos.y + boundingSize.h);
                }

                offsetLineTo(offset, trayRight, pos.y + boundingSize.h + 10);
                offsetLineTo(offset, trayRight, pos.y + boundingSize.h);
                offsetLineTo(offset, trayLeft, pos.y + boundingSize.h);
                offsetLineTo(offset, trayLeft, pos.y + boundingSize.h + 10);
                offsetLineTo(offset, divotX, pos.y + boundingSize.h - bracketRadius);
                // "Divot" on bottom
                offsetQuadraticCurveTo(offset, divotX, pos.y + boundingSize.h, divotX - bracketRadius, pos.y + boundingSize.h);
                offsetLineTo(offset, pos.x + radius, pos.y + boundingSize.h);
                // Bottom-left corner
                offsetQuadraticCurveTo(offset, pos.x, pos.y + boundingSize.h, pos.x, pos.y + boundingSize.h - radius);
                // Left side
                offsetLineTo(offset, pos.x, pos.y + radius);
                // Upper-left corner
                offsetQuadraticCurveTo(offset, pos.x, pos.y, pos.x + radius, pos.y);
                ctx.closePath();
                if (_this2.stroke) {
                    strokeWithOpacity(ctx, _this2.stroke.opacity);
                }
                ctx.fill();
            };

            setStrokeStyle(ctx, this.stroke);
            if (this.shadowOffset !== 0) {
                ctx.fillStyle = 'black';
                draw(this.shadowOffset);
            }
            ctx.fillStyle = this.color;
            draw(0);
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            var _this3 = this;

            console.log("called perform reduction in RepeatLoopExpr");
            this._cachedSize = this.size;

            return this.performSubReduction(this.timesExpr).then(function (num) {
                if (!(num instanceof NumberExpr) || !_this3.bodyExpr || _this3.bodyExpr instanceof MissingExpression) {
                    Animate.blink(_this3.timesExpr, 1000, [1.0, 0.0, 0.0]);
                    return Promise.reject("RepeatLoopExpr incomplete!");
                }

                if (num.number <= 0) {
                    Animate.poof(_this3);
                    (_this3.parent || _this3.stage).swap(_this3, null);
                    return null;
                }

                return new Promise(function (resolve, reject) {
                    var index = 0;
                    var x = _this3.template.pos.x;
                    var y = _this3.template.pos.y;

                    if (_this3.parent) {
                        index = _this3.template.subexpressions.length + 1;
                    }

                    var nextStep = function nextStep() {
                        _this3._leverAngle = -Math.PI / 2;

                        if (index > _this3.template.subexpressions.length) {
                            _this3.template.holes.forEach(function (expr) {
                                expr.opacity = 1;
                            });
                            resolve(_this3.template);
                            Animate.poof(_this3);
                            _this3.template.parent = null;
                            (_this3.parent || _this3.stage).swap(_this3, _this3.template);
                            return;
                        }

                        if (index == _this3.template.subexpressions.length) {
                            y -= _this3.size.h;
                            Animate.tween(_this3.template, {
                                pos: {
                                    x: x,
                                    y: y
                                }
                            }, 300).after(function () {
                                index++;
                                after(400).then(nextStep);
                            });
                        } else {
                            var current = _this3.template.subexpressions[index];
                            // If we're stamping a sequence, treat each
                            // group of expressions as a single stamp
                            var numExprs = 1;
                            if (_this3.bodyExpr instanceof Sequence) {
                                numExprs = _this3.bodyExpr.subexpressions.length;
                            }

                            for (var i = 0; i < numExprs; i++) {
                                var expr = _this3.template.subexpressions[index + i];
                                y -= expr.size.h * expr.scale.y;
                            }

                            Animate.tween(_this3.template, {
                                pos: {
                                    x: x,
                                    y: y
                                }
                            }, 300).after(function () {
                                var oldOffset = _this3.bodyExpr.shadowOffset;

                                Animate.tween(_this3, {
                                    _leverAngle: 0
                                }, 400);
                                Animate.tween(_this3.bodyExpr, {
                                    shadowOffset: -4,
                                    pos: {
                                        x: _this3.bodyExpr.pos.x,
                                        y: _this3.bodyExpr.pos.y + 2
                                    }
                                }, 400).after(function () {
                                    for (var _i = 0; _i < numExprs; _i++) {
                                        _this3.template.subexpressions[index + _i].opacity = 1.0;
                                    }
                                    index += numExprs;

                                    _this3.bodyExpr.shadowOffset = oldOffset;
                                    _this3.bodyExpr.pos = {
                                        x: _this3.bodyExpr.pos.x,
                                        y: _this3.bodyExpr.pos.y - 2
                                    };
                                    _this3.stage.draw();
                                    after(400).then(nextStep);
                                });
                            });
                        }
                    };

                    Animate.tween(_this3, {
                        _leverLength: 1.0
                    }, 200).after(nextStep);
                });
            });
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performUserReduction();
        }
    }, {
        key: 'drawReductionIndicator',
        value: function drawReductionIndicator(ctx, pos, boundingSize) {}
    }, {
        key: 'toString',
        value: function toString() {
            var times = this.timesExpr.toString();
            var body = this.bodyExpr.toString();
            return (this.locked ? '/' : '') + '(repeat ' + times + ' ' + body + ')';
        }
    }, {
        key: 'timesExpr',
        get: function get() {
            return this.holes[0];
        },
        set: function set(expr) {
            this.holes[0] = expr;
        }
    }, {
        key: 'bodyExpr',
        get: function get() {
            return this.holes[1];
        },
        set: function set(expr) {
            this.holes[1] = expr;
        }
    }]);

    return RepeatLoopExpr;
}(Expression);

var FadedRepeatLoopExpr = function (_Expression2) {
    _inherits(FadedRepeatLoopExpr, _Expression2);

    function FadedRepeatLoopExpr(times, body) {
        _classCallCheck(this, FadedRepeatLoopExpr);

        return _possibleConstructorReturn(this, (FadedRepeatLoopExpr.__proto__ || Object.getPrototypeOf(FadedRepeatLoopExpr)).call(this, [new TextExpr("repeat ("), times, new TextExpr(") {"), body, new TextExpr("}")]));
    }

    _createClass(FadedRepeatLoopExpr, [{
        key: 'update',
        value: function update() {
            var _this5 = this;

            this.children = [];

            this.holes.forEach(function (expr) {
                return _this5.addChild(expr);
            });
            this.holes.forEach(function (expr) {
                expr.anchor = { x: 0, y: 0 };
                expr.scale = { x: 0.85, y: 0.85 };
                if (expr instanceof TextExpr) {
                    expr.scale = { x: 0.6, y: 0.6 };
                    expr._baseline = "top";
                }
                expr.update();
            });
            var size = this.size;
            var x = this.padding.left;
            var y = 0;

            var top = this.holes.slice(0, 3);
            var middle = this.holes[3];
            var bottom = this.holes[4];

            var maxTopHeight = 0;
            top.forEach(function (expr) {
                maxTopHeight = Math.max(maxTopHeight, expr.size.h);
            });

            top.forEach(function (expr) {
                var height = expr instanceof TextExpr ? expr.fontSize * expr.scale.y : expr.size.h;
                expr.pos = { x: x, y: _this5.padding.inner / 2 + (maxTopHeight - height) / 2 };
                x += expr.size.w * expr.scale.x;
            });

            middle.pos = { x: this.padding.left + 50, y: maxTopHeight + this.padding.inner };
            bottom.pos = { x: this.padding.left, y: middle.pos.y + middle.size.h + this.padding.inner };

            this.children = this.holes;
        }
    }, {
        key: 'canReduce',
        value: function canReduce() {
            return this.timesExpr && (this.timesExpr.canReduce() || this.timesExpr.isValue()) && this.bodyExpr && this.bodyExpr.isComplete();
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            var _this6 = this;

            console.log("called performReduction() in FadedRepeatLoopExpr");
            if (this.canReduce()) {
                console.log("canReduce() == true");
                return this.performSubReduction(this.timesExpr).then(function () {
                    var _console;

                    var missing = [];
                    console.log("this.timesExpr:");
                    console.log(_this6.timesExpr);
                    console.log("this.bodyExpr");
                    console.log(_this6.bodyExpr);
                    for (var i = 0; i < _this6.timesExpr.number; i++) {
                        console.log("calling this.bodyExpr.clone()");
                        //let thisBodyExprClone = this.bodyExpr.clone();
                        missing.push(_this6.bodyExpr.clone());
                    }

                    console.log("...missing");
                    (_console = console).log.apply(_console, missing);
                    console.log("missing");
                    console.log(missing);

                    var template = new (Function.prototype.bind.apply(ExprManager.getClass('sequence'), [null].concat(missing)))();
                    template.lockSubexpressions();

                    (_this6.parent || _this6.stage).swap(_this6, template);
                    template.update();

                    console.log("template");
                    console.log(template);

                    return template;
                });
            } else {
                console.log("canReduce() == false");
                return Promise.reject();
            }
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: 'toString',
        value: function toString() {
            var times = this.timesExpr.toString();
            var body = this.bodyExpr.toString();
            return (this.locked ? '/' : '') + '(repeat ' + times + ' ' + body + ')';
        }
    }, {
        key: 'timesExpr',
        get: function get() {
            return this.holes[1];
        },
        set: function set(expr) {
            this.holes[1] = expr;
        }
    }, {
        key: 'bodyExpr',
        get: function get() {
            return this.holes[3];
        },
        set: function set(expr) {
            this.holes[3] = expr;
        }
    }, {
        key: 'size',
        get: function get() {
            var padding = this.padding;
            var sizes = this.getHoleSizes();

            var top = sizes.slice(0, 3);
            var middle = sizes[3];
            var bottom = sizes[4];

            var topWidth = 0;
            var maxTopHeight = 0;
            top.forEach(function (size) {
                topWidth += size.w;
                maxTopHeight = Math.max(maxTopHeight, size.h);
            });
            var width = Math.max(topWidth, middle.w + 50, bottom.w) + padding.left + padding.right;
            var height = maxTopHeight + middle.h + bottom.h + 4 * padding.inner;

            return { w: width, h: height };
        }
    }]);

    return FadedRepeatLoopExpr;
}(Expression);

function drawPointsAround(ctx, centerX, centerY, points, rotation) {
    ctx.beginPath();
    var first = true;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = points[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = _slicedToArray(_step.value, 2),
                x = _step$value[0],
                y = _step$value[1];

            var tx = centerX + x * Math.cos(rotation) - y * Math.sin(rotation);
            var ty = centerY + x * Math.sin(rotation) + y * Math.cos(rotation);
            if (first) {
                ctx.moveTo(tx, ty);
                first = false;
            } else {
                ctx.lineTo(tx, ty);
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

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
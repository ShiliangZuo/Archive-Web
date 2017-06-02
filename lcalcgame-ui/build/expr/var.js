"use strict";

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SHRINK_DURATION = 800;
var EXPAND_DURATION = 400;

var _ChestImages = function () {
    function _ChestImages() {
        _classCallCheck(this, _ChestImages);
    }

    _createClass(_ChestImages, [{
        key: "base",
        value: function base(name) {
            if (name == "x") {
                return Resource.getImage("chest-wood-base");
            }
            return Resource.getImage("chest-metal-base");
        }
    }, {
        key: "lidClosed",
        value: function lidClosed(name) {
            if (name == "x") {
                return Resource.getImage("chest-wood-lid-closed");
            }
            return Resource.getImage("chest-metal-lid-closed");
        }
    }, {
        key: "lidOpen",
        value: function lidOpen(name) {
            if (name == "x") {
                return Resource.getImage("chest-wood-lid-open");
            }
            return Resource.getImage("chest-metal-lid-open");
        }
    }]);

    return _ChestImages;
}();

var ChestImages = new _ChestImages();

// parabolic lerp for y - makes it "arc" towards the final position
var arcLerp = function arcLerp(y0, y1) {
    var arc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 120;

    var b = 4 * (Math.min(y0, y1) - arc) - y1 - 3 * y0;
    var c = y0;
    var a = y1 - b - c;
    var lerp = function lerp(src, tgt, elapsed, chain) {
        if (chain.length == 2 && chain[0] == "pos" && chain[1] == "y") {
            return a * elapsed * elapsed + b * elapsed + c;
        } else {
            return (1.0 - elapsed) * src + elapsed * tgt;
        }
    };
    return lerp;
};

/// Variable nodes - separate from lambda variable expressions, for
/// now.

var VarExpr = function (_Expression) {
    _inherits(VarExpr, _Expression);

    function VarExpr(name) {
        _classCallCheck(this, VarExpr);

        var _this = _possibleConstructorReturn(this, (VarExpr.__proto__ || Object.getPrototypeOf(VarExpr)).call(this, []));

        _this.name = name;
        // See MissingTypedExpression#constructor
        _this.equivalentClasses = [VarExpr];
        return _this;
    }

    _createClass(VarExpr, [{
        key: "open",
        value: function open(preview) {
            var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        }
    }, {
        key: "close",
        value: function close() {}
    }, {
        key: "value",
        value: function value() {
            if (this.canReduce()) {
                return this.getEnvironment().lookup(this.name).value();
            }
            return undefined;
        }
    }, {
        key: "canReduce",
        value: function canReduce() {
            return this.getEnvironment() && (this.parent || this.stage) && this.getEnvironment().lookup(this.name);
        }
    }, {
        key: "reduce",
        value: function reduce() {
            var env = this.getEnvironment();
            if (!env) return this;

            var parent = this.parent ? this.parent : this.stage;
            if (!parent) return this;

            var value = env.lookup(this.name);
            if (!value) return this;

            return value;
        }
    }, {
        key: "onmouseclick",
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: "toString",
        value: function toString() {
            return '$' + (this.ignoreEvents ? '' : '_') + this.name;
        }
    }]);

    return VarExpr;
}(Expression);

var LabeledVarExpr = function (_VarExpr) {
    _inherits(LabeledVarExpr, _VarExpr);

    function LabeledVarExpr(name) {
        _classCallCheck(this, LabeledVarExpr);

        var _this2 = _possibleConstructorReturn(this, (LabeledVarExpr.__proto__ || Object.getPrototypeOf(LabeledVarExpr)).call(this, name));

        _this2.label = new TextExpr(name);
        _this2.addArg(_this2.label);
        return _this2;
    }

    // Used by EnvironmentLambdaExpr
    // TODO: better name
    // TODO: tweak this animation (side arc?)


    _createClass(LabeledVarExpr, [{
        key: "animateReduction",
        value: function animateReduction(display) {
            var _this3 = this;

            if (this.parent && this.parent instanceof AssignExpr && this.parent.variable == this) return null;

            return new Promise(function (resolve, reject) {
                var value = _this3.reduce();
                if (_this3.reduce() != _this3) {
                    var dummy = display.getExpr().clone();
                    var stage = _this3.stage;
                    stage.add(dummy);
                    dummy.pos = display.getExpr().absolutePos;
                    dummy.scale = display.getExpr().absoluteScale;

                    Animate.tween(dummy, {
                        pos: _this3.absolutePos,
                        scale: { x: 1, y: 1 }
                    }, 300).after(function () {
                        var clone = display.getExpr().clone();
                        (_this3.parent || _this3.stage).swap(_this3, clone);
                        if (_this3.locked) clone.lock();
                        stage.remove(dummy);
                        resolve();
                    });
                } else {
                    reject();
                }
            });
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            var _this4 = this;

            if (this.parent && this.parent instanceof AssignExpr && this.parent.variable == this) return null;

            var value = this.reduce();
            if (value != this) {
                value = value.clone();
                var _parent = this.parent ? this.parent : this.stage;
                _parent.swap(this, value);
                return Promise.resolve(value);
            } else {
                var wat = new TextExpr("?");
                this.stage.add(wat);
                wat.pos = this.label.absolutePos;
                Animate.tween(wat, {
                    pos: {
                        x: wat.pos.x,
                        y: wat.pos.y - 50
                    }
                }, 250);
                window.setTimeout(function () {
                    Animate.poof(wat);
                    _this4.stage.remove(wat);
                    _this4.stage.draw();
                    _this4.stage.update();
                }, 500);
                return Promise.reject("Cannot reduce undefined variable");
            }
        }
    }]);

    return LabeledVarExpr;
}(VarExpr);

var ChestVarExpr = function (_VarExpr2) {
    _inherits(ChestVarExpr, _VarExpr2);

    function ChestVarExpr(name) {
        _classCallCheck(this, ChestVarExpr);

        // See MissingTypedExpression#constructor
        var _this5 = _possibleConstructorReturn(this, (ChestVarExpr.__proto__ || Object.getPrototypeOf(ChestVarExpr)).call(this, name));

        _this5.equivalentClasses = [ChestVarExpr];
        _this5._preview = null;
        _this5._animating = false;
        return _this5;
    }

    _createClass(ChestVarExpr, [{
        key: "open",
        value: function open(preview) {
            var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            preview = preview.clone();
            preview.ignoreEvents = true;
            preview.scale = { x: 0.6, y: 0.6 };
            preview.anchor = { x: -0.1, y: 0.5 };
            this._preview = preview;
            if (this.holes.length > 0) {
                this.holes[0] = preview;
            } else {
                this.holes.push(preview);
            }
            this._opened = true;
        }
    }, {
        key: "close",
        value: function close() {
            this._opened = false;
            this.removeChild(this.holes[0]);
            this._preview = null;
        }
    }, {
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            if (this._preview) {
                this._preview.pos = {
                    x: 0,
                    y: 5
                };
            }

            if (this.parent && !this.ignoreEvents) {
                // Draw gray background analogous to other values
                ctx.fillStyle = "#777";
                roundRect(ctx, pos.x, pos.y, boundingSize.w, boundingSize.h, 6 * this.absoluteScale.x, true, false, null);
            }

            var size = this._size;
            var scale = this.absoluteScale;
            var adjustedSize = this.absoluteSize;
            var offset = Math.max(2, (adjustedSize.w - size.w) / 2);
            ChestImages.base(this.name).draw(ctx, pos.x + offset, pos.y + offset, size.w * scale.x - 2 * offset, size.h * scale.y - 2 * offset);
            if (this._opened) {
                ChestImages.lidOpen(this.name).draw(ctx, pos.x + offset, pos.y + offset, size.w * scale.x - 2 * offset, size.h * scale.y - 2 * offset);
            } else {
                ChestImages.lidClosed(this.name).draw(ctx, pos.x + offset, pos.y + offset, size.w * scale.x - 2 * offset, size.h * scale.y - 2 * offset);
            }
            if (this.stroke) {
                ctx.save();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.globalCompositeOperation = 'screen';
                ctx.fillRect(pos.x, pos.y, boundingSize.w, boundingSize.h);
                ctx.restore();
            }
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            var _this6 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (this.parent && this.parent instanceof AssignExpr && this.parent.variable == this) return Promise.reject("Cannot reduce LHS of assignment");

            var value = this.reduce();
            if (value != this) {
                if (!animated) {
                    var _parent2 = this.parent ? this.parent : this.stage;
                    _parent2.swap(this, value);
                    return Promise.resolve(value);
                }
                this._animating = true;
                return this.animateReduction(value, true);
            } else if (animated) {
                this.animateReduction(new TextExpr("?"), false).then(function (wat) {
                    _this6._opened = false;
                    window.setTimeout(function () {
                        Animate.poof(wat);
                        _this6.stage.remove(wat);
                        _this6.stage.draw();
                        _this6.stage.update();
                    }, 500);
                });
            }
            return Promise.reject("Cannot reduce undefined variable");
        }
    }, {
        key: "animateReduction",
        value: function animateReduction(value, destroy) {
            var _this7 = this;

            var stage = this.stage;

            value = value.clone();
            stage.add(value);
            value.scale = { x: 0.1, y: 0.1 };
            value.anchor = { x: 0.5, y: 0.5 };
            value.update();
            value.pos = {
                x: this.absolutePos.x - this.anchor.x * this.size.w + 0.5 * this.size.w,
                y: this.absolutePos.y + 30
            };

            if (!this._opened) {
                Resource.play('chest-open');
                this._opened = true;
            }

            return new Promise(function (resolve, _reject) {
                Resource.play('come-out');
                Animate.tween(value, {
                    scale: { x: 1.0, y: 1.0 },
                    pos: {
                        x: _this7.absolutePos.x + 0.5 * _this7.size.w - 0.5 * value.size.w,
                        y: _this7.absolutePos.y - value.size.h
                    }
                }, 500).after(function () {
                    window.setTimeout(function () {
                        if (destroy) {
                            Animate.poof(_this7);
                            if (_this7.parent) {
                                stage.remove(value);
                                _this7.parent.swap(_this7, value);
                            } else {
                                _this7.stage.remove(_this7);
                            }
                        }
                        stage.draw();
                        stage.update();
                        resolve(value);
                    }, 200);
                });
            });
        }
    }, {
        key: "onmouseenter",
        value: function onmouseenter() {
            _get(ChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(ChestVarExpr.prototype), "onmouseenter", this).call(this);
            SET_CURSOR_STYLE(CONST.CURSOR.HAND);
        }
    }, {
        key: "onmouseleave",
        value: function onmouseleave() {
            _get(ChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(ChestVarExpr.prototype), "onmouseleave", this).call(this);
            SET_CURSOR_STYLE(CONST.CURSOR.DEFAULT);
        }
    }, {
        key: "onmouseclick",
        value: function onmouseclick() {
            if (!this._animating) {
                this.performReduction(true);
            }
        }
    }, {
        key: "_superSize",
        get: function get() {
            return _get(ChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(ChestVarExpr.prototype), "size", this);
        }
    }, {
        key: "size",
        get: function get() {
            return { w: this._size.w, h: this._size.h };
        }
    }]);

    return ChestVarExpr;
}(VarExpr);

var JumpingChestVarExpr = function (_ChestVarExpr) {
    _inherits(JumpingChestVarExpr, _ChestVarExpr);

    function JumpingChestVarExpr() {
        _classCallCheck(this, JumpingChestVarExpr);

        return _possibleConstructorReturn(this, (JumpingChestVarExpr.__proto__ || Object.getPrototypeOf(JumpingChestVarExpr)).apply(this, arguments));
    }

    _createClass(JumpingChestVarExpr, [{
        key: "performReduction",
        value: function performReduction() {
            var _this9 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (this.parent && this.parent instanceof AssignExpr && this.parent.variable == this) return Promise.reject("Cannot reduce LHS of assignment");

            if (!animated || !this.stage) {
                return _get(JumpingChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(JumpingChestVarExpr.prototype), "performReduction", this).call(this, animated);
            }
            var chest = this.stage.environmentDisplay.getBinding(this.name);
            if (!chest) {
                return _get(JumpingChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(JumpingChestVarExpr.prototype), "performReduction", this).call(this, animated);
            }

            Resource.play('chest-open');
            this._opened = true;
            this._animating = true;
            var value = chest.holes[0].clone();
            value.pos = chest.holes[0].absolutePos;
            this.stage.add(value);

            var target = {
                pos: this.absolutePos,
                scale: { x: 0.3, y: 0.3 }
            };
            var lerp = arcLerp(value.absolutePos.y, this.absolutePos.y);
            Resource.play('fall-to');
            return new Promise(function (resolve, _reject) {
                Animate.tween(value, target, 600, function (x) {
                    return x;
                }, true, lerp).after(function () {
                    _this9.stage.remove(value);
                    _this9.stage.draw();
                    window.setTimeout(function () {
                        _get(JumpingChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(JumpingChestVarExpr.prototype), "performReduction", _this9).call(_this9, true).then(function (value) {
                            resolve(value);
                        });
                    }, 100);
                });
            });
        }
    }]);

    return JumpingChestVarExpr;
}(ChestVarExpr);

var LabeledChestVarExpr = function (_ChestVarExpr2) {
    _inherits(LabeledChestVarExpr, _ChestVarExpr2);

    function LabeledChestVarExpr(name) {
        _classCallCheck(this, LabeledChestVarExpr);

        // See MissingTypedExpression#constructor
        var _this10 = _possibleConstructorReturn(this, (LabeledChestVarExpr.__proto__ || Object.getPrototypeOf(LabeledChestVarExpr)).call(this, name));

        _this10.equivalentClasses = [LabeledChestVarExpr];
        _this10.label = new TextExpr(name);
        _this10.label.color = 'white';
        _this10.holes.push(_this10.label);
        return _this10;
    }

    _createClass(LabeledChestVarExpr, [{
        key: "open",
        value: function open(preview) {
            var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        }
    }, {
        key: "close",
        value: function close() {}
    }, {
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            this.holes[0].pos = {
                x: this.size.w / 2 - this.holes[0].absoluteSize.w / 2,
                y: this.size.h / 2
            };

            _get(LabeledChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(LabeledChestVarExpr.prototype), "drawInternal", this).call(this, ctx, pos, boundingSize);
        }
    }]);

    return LabeledChestVarExpr;
}(ChestVarExpr);

var AssignExpr = function (_Expression2) {
    _inherits(AssignExpr, _Expression2);

    function AssignExpr(variable, value) {
        _classCallCheck(this, AssignExpr);

        var _this11 = _possibleConstructorReturn(this, (AssignExpr.__proto__ || Object.getPrototypeOf(AssignExpr)).call(this, []));

        if (variable && !(variable instanceof MissingExpression)) {
            _this11.addArg(variable);
        } else {
            var missing = new MissingChestExpression(new VarExpr("_"));
            missing.acceptedClasses = [VarExpr];
            _this11.addArg(missing);
        }

        _this11.arrowLabel = new TextExpr("←");
        _this11.addArg(_this11.arrowLabel);

        if (value) {
            _this11.addArg(value);
        } else {
            _this11.addArg(new MissingExpression(new Expression()));
        }

        _this11._animating = false;
        _this11.animatedValue = value;
        return _this11;
    }

    _createClass(AssignExpr, [{
        key: "clone",
        value: function clone() {
            var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            var cln = _get(AssignExpr.prototype.__proto__ || Object.getPrototypeOf(AssignExpr.prototype), "clone", this).call(this, parent);
            cln.holes = [];
            this.holes.forEach(function (hole) {
                return cln.holes.push(hole.clone());
            });
            return cln;
        }
    }, {
        key: "canReduce",
        value: function canReduce() {
            /*return this.value && this.variable && (this.value.canReduce() || this.value.isValue()) &&
                (this.variable instanceof VarExpr || this.variable instanceof VtableVarExpr
                 || (this.variable instanceof TypeInTextExpr && this.variable.canReduce()));*/
            return true;
        }
    }, {
        key: "reduce",
        value: function reduce() {
            if (this.variable && this.value) {
                return this.value;
            } else {
                return this;
            }
        }
    }, {
        key: "animateJump",
        value: function animateJump() {
            var _this12 = this;

            return new Promise(function (resolve, reject) {
                var target = {
                    scale: { x: 0.3, y: 0.3 },
                    pos: { x: _this12.variable.pos.x, y: _this12.variable.pos.y }
                };

                // quadratic lerp for pos.y - makes it "arc" towards the variable
                var lerp = arcLerp(_this12.value.pos.y, _this12.variable.pos.y);
                var parent = _this12.parent || _this12.stage;

                Animate.tween(_this12.value, target, 500, function (x) {
                    return x;
                }, true, lerp).after(function () {
                    Animate.poof(_this12);
                    parent.swap(_this12, null);
                    resolve();
                });
            });
        }
    }, {
        key: "setupAnimation",
        value: function setupAnimation() {
            this.variable._opened = true;

            // Prevent background on GraphicValueExpr from being drawn
            this.value.ignoreEvents = true;

            // Keep a copy of the original value before we start
            // messing with it, to update the environment afterwards
            //this._actualValue = this.value.clone();
        }
    }, {
        key: "finishReduction",
        value: function finishReduction() {
            var _this13 = this;

            this.getEnvironment().update(this.variable.name, this._actualValue);
            this.stage.environmentDisplay.update();
            var binding = this.stage.environmentDisplay.getBinding(this.variable.name);
            Animate.blink(binding.getExpr());
            this.stage.getNodesWithClass(EnvironmentLambdaExpr).forEach(function (lambda) {
                lambda.update();
                lambda.environmentDisplay.highlight(_this13.variable.name);
            });
            this.stage.draw();
        }
    }, {
        key: "animateReduction",
        value: function animateReduction() {
            var _this14 = this;

            this.setupAnimation();

            var environment = this.getEnvironment();
            var callback = null;
            if (environment == this.stage.environment && this.stage.environmentDisplay) {
                callback = this.stage.environmentDisplay.prepareAssign(this.variable.name);
            }

            var stage = this.stage;
            var afterAssign = new Promise(function (resolve, _reject) {
                var finish = function finish() {
                    // Need to save the stage sometimes - there's a race
                    // condition where sometimes the expr is removed from
                    // the stage before the assignment happens
                    _this14.stage = stage;
                    _this14.finishReduction();
                    resolve();
                };

                if (callback) {
                    callback.after(finish);
                } else {
                    window.setTimeout(finish, 500);
                }
            });

            return Promise.all([afterAssign, this.animateJump()]);
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            var _this15 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            // The side-effect actually happens here. reduce() is called
            // multiple times as a 'canReduce', and we don't want any
            // update to happen multiple times.
            if (!this.canReduce()) {
                if (this.value && this.variable && !this.value.canReduce()) {
                    // Try and play any animation anyways to hint at why
                    // the value can't reduce.
                    var result = this.value.reduceCompletely();

                    if (result instanceof Promise) {
                        return result.then(function () {
                            return Promise.reject("AssignExpr: RHS cannot reduce");
                        });
                    }
                    return Promise.reject("AssignExpr: RHS cannot reduce");
                }
                return Promise.reject("AssignExpr: incomplete");
            }

            console.log("this.canReduce() == true!!");

            //The value is the right hand side
            //Reduce the right hand side first!!
            this.value = this.value.reduceCompletely().clone();

            if (this.value instanceof ArrayObjectExpr) {
                this.value = this.value.baseArray;
            }
            if (this.value instanceof StringObjectExpr) {
                this.value = this.value.baseStringValue;
            }
            this.animatedValue = this.value.clone();

            //this.variable.name = this.variable.holes[0].name;
            //console.log("This.Variable and This.Variable.name and This.Value");
            //console.log(this.variable);
            //console.log(this.variable.name);
            //console.log(this.value);

            if (this.variable instanceof ArrayObjectExpr) {
                /*let rhs = this.variable.baseArray.reduceCompletely();
                console.log("RHS!!!!!!");
                console.log(rhs);
                this.variable.name = this.variable.baseArray.name;
                if (this.variable.defaultMethodCall === "[..]") {
                    console.log("method call is [..]");
                    console.log("this.variable.name:");
                    console.log(this.variable.name);
                    console.log("This Value!!!!");
                    console.log(this.value);
                    this.variable.holes[2] = this.variable.holes[2].reduce();
                    console.log("index: " + this.variable.holes[2].number);
                    rhs._items[this.variable.holes[2].number] = this.value.clone();
                    this.value = rhs.clone();
                    console.log("after: rhs is:");
                    console.log(rhs);
                }
                this.variable.name = this.variable.baseArray.name;*/
                var leftHandSide = this.variable.baseArray.reduceCompletely();
                this.variable.name = this.variable.baseArray.name;
                console.log("left Hand Side:");
                console.log(leftHandSide);
                if (this.variable.defaultMethodCall === "[..]") {
                    console.log("this.variable");
                    console.log(this.variable);
                    var index = this.variable.holes[2].reduceCompletely().number;
                    //console.log("index: INDEX:");
                    //console.log(index);
                    //console.log("left hand side, should be bracket array expression and this.value");
                    console.log(leftHandSide.items);
                    console.log(this.value);
                    leftHandSide._items[index] = this.value.clone();
                    this.animatedValue = this.value.clone();
                    this.value = leftHandSide.clone();
                    //console.log("left hand side, should be bracket array expression!!");
                    //console.log(this.value);
                }
            }

            if (this.variable instanceof StringObjectExpr) {
                var rhs = this.variable.baseStringValue.reduceCompletely();
                this.variable.name = this.variable.baseStringValue.name;
                console.log("variable name: " + this.variable.name);
                if (this.variable.defaultMethodCall === "[..]") {
                    console.log("default method call is [..]");
                    console.log(rhs);
                    var originalString = rhs.value();
                    console.log("ori string: " + originalString);
                    var slicePosition = this.variable.holes[2].reduceCompletely().number;
                    console.log("slicePos: " + slicePosition);
                    console.log("this.value.toString()" + this.value.toString());
                    var newString = originalString.slice(0, slicePosition) + this.value.value() + originalString.slice(slicePosition + 1);
                    console.log("new String: " + newString);
                    this.value = new StringValueExpr(newString);
                }
            }

            var starter = Promise.resolve();
            if (this.variable instanceof TypeInTextExpr) {
                starter = this.performSubReduction(this.variable, animated);
            }

            return starter.then(function () {
                if (!animated) {
                    _this15.value.performReduction(false);
                    var value = _this15.value.clone();
                    _this15.getEnvironment().update(_this15.variable.name, value);
                    _this15.stage.environmentDisplay.update();
                    _this15.stage.draw();
                    return Promise.resolve(null);
                }

                return _this15.performSubReduction(_this15.value, true).then(function (value) {
                    _this15._actualValue = _this15.value.clone();
                    _this15.value = _this15.animatedValue.clone();
                    _this15.update();
                    if (_this15.stage) _this15.stage.draw();
                    return after(500).then(function () {
                        return _this15.animateReduction();
                    });
                });
            });
        }
    }, {
        key: "reduceCompletely",
        value: function reduceCompletely() {
            if (this.value) {
                this.value.reduceCompletely();
            }

            if (this.variable && this.value) {
                // Return non-undefined non-this value so that when the
                // user drops everything in, MissingExpression#ondropped
                // will make this expr blink
                return null;
            } else {
                return this;
            }
        }
    }, {
        key: "onmouseclick",
        value: function onmouseclick(pos) {
            if (this.parent) {
                this.parent.onmouseclick(pos);
                return;
            }

            this.performUserReduction();
        }
    }, {
        key: "toString",
        value: function toString() {
            var variable = this.variable ? this.variable.toString() : '_';
            var value = this.value ? this.value.toString() : '_';
            return (this.locked ? '/' : '') + "(assign " + variable + " " + value + ")";
        }
    }, {
        key: "variable",
        get: function get() {
            return this.holes[0] instanceof MissingExpression ? null : this.holes[0];
        },
        set: function set(expr) {
            this.holes[0] = expr;
        }
    }, {
        key: "value",
        get: function get() {
            return this.holes[2] instanceof MissingExpression ? null : this.holes[2];
        },
        set: function set(expr) {
            this.holes[2] = expr;
        }
    }]);

    return AssignExpr;
}(Expression);

var JumpingAssignExpr = function (_AssignExpr) {
    _inherits(JumpingAssignExpr, _AssignExpr);

    function JumpingAssignExpr(variable, value) {
        _classCallCheck(this, JumpingAssignExpr);

        return _possibleConstructorReturn(this, (JumpingAssignExpr.__proto__ || Object.getPrototypeOf(JumpingAssignExpr)).call(this, variable, value));
    }

    _createClass(JumpingAssignExpr, [{
        key: "animateReduction",
        value: function animateReduction() {
            var _this17 = this;

            this.setupAnimation();

            var environment = this.getEnvironment();
            return this.animateJump().then(function () {
                return new Promise(function (resolve, _reject) {
                    if (environment != _this17.stage.environment) {
                        Animate.poof(_this17);
                        _this17.finishReduction();
                        parent.swap(_this17, null);
                        resolve();
                        return;
                    }

                    var chest = _this17.stage.environmentDisplay.getBinding(_this17.variable.name);
                    var value = null;
                    var targetPos = null;
                    if (chest) {
                        targetPos = chest.absolutePos;
                        value = _this17.value.clone();
                        _this17.stage.environmentDisplay.prepareAssign(_this17.variable.name);
                    } else {
                        if (Object.keys(_this17.stage.environmentDisplay.bindings).length === 0) {
                            targetPos = _this17.stage.environmentDisplay.absolutePos;
                        } else {
                            var contents = _this17.stage.environmentDisplay.contents;
                            var last = contents[contents.length - 1];
                            targetPos = addPos(last.absolutePos, { x: 0, y: last.absoluteSize.h + _this17.stage.environmentDisplay.padding });
                        }

                        value = new (ExprManager.getClass('reference_display'))(_this17.variable.name, _this17.value.clone());
                    }
                    _this17.value.scale = { x: 0, y: 0 };
                    _this17.stage.add(value);
                    value.pos = _this17.variable.absolutePos;
                    value.scale = { x: 0.3, y: 0.3 };
                    var target = {
                        pos: targetPos,
                        scale: { x: 0.7, y: 0.7 }
                    };

                    var lerp = arcLerp(value.absolutePos.y, targetPos.y, -150);
                    Resource.play('fly-to');
                    Animate.tween(value, target, 600, function (x) {
                        return x;
                    }, true, lerp).after(function () {
                        _this17.stage.remove(value);
                        _this17.finishReduction();
                        _this17.stage.draw();
                    });
                });
            });
        }
    }]);

    return JumpingAssignExpr;
}(AssignExpr);

var EqualsAssignExpr = function (_AssignExpr2) {
    _inherits(EqualsAssignExpr, _AssignExpr2);

    function EqualsAssignExpr(variable, value) {
        _classCallCheck(this, EqualsAssignExpr);

        var _this18 = _possibleConstructorReturn(this, (EqualsAssignExpr.__proto__ || Object.getPrototypeOf(EqualsAssignExpr)).call(this, variable, value));

        _this18.arrowLabel.text = "=";
        return _this18;
    }

    return EqualsAssignExpr;
}(AssignExpr);

var VtableVarExpr = function (_ObjectExtensionExpr) {
    _inherits(VtableVarExpr, _ObjectExtensionExpr);

    function VtableVarExpr(name) {
        _classCallCheck(this, VtableVarExpr);

        var _this19 = _possibleConstructorReturn(this, (VtableVarExpr.__proto__ || Object.getPrototypeOf(VtableVarExpr)).call(this, new LabeledVarExpr(name), {}));

        _this19.removeChild(_this19.drawer);
        var drawer = new DynamicPulloutDrawer(_this19.size.w, _this19.size.h / 2, 8, 32, _this19, _this19.drawer.onCellSelect);
        drawer.anchor = { x: 0, y: 0.32 };
        _this19.drawer = drawer;
        _this19.addChild(_this19.drawer);
        _this19.hasVtable = false;
        return _this19;
    }

    _createClass(VtableVarExpr, [{
        key: "canReduce",
        value: function canReduce() {
            return this.getEnvironment() && (this.parent || this.stage) && this.getEnvironment().lookup(this.name);
        }

        // Behave like a VarExpr

    }, {
        key: "open",
        value: function open() {}
    }, {
        key: "close",
        value: function close() {}
    }, {
        key: "update",
        value: function update() {
            _get(VtableVarExpr.prototype.__proto__ || Object.getPrototypeOf(VtableVarExpr.prototype), "update", this).call(this);
            this.updateVtable();
        }
    }, {
        key: "updateVtable",
        value: function updateVtable() {
            var value = this.value;
            if (value) {
                if (value.color) {
                    this.color = value.color;
                    this.variable.color = value.color;
                }

                if (value instanceof ObjectExtensionExpr) {
                    this.hasVtable = true;
                } else {
                    this.hasVtable = false;
                }
            } else {
                this.hasVtable = false;
                if (this.variable.color) {
                    this.color = this.variable.color;
                }
            }
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            if (!this.hasVtable || !this.subReduceMethod) {
                if (!this.variable.canReduce()) {
                    // Play the ? animation
                    this.variable.performReduction();
                    return Promise.reject(this.name + " is undefined.");
                } else {
                    var value = this.variable.reduce().clone();
                    (this.parent || this.stage).swap(this, value);
                    return Promise.resolve(value);
                }
            } else {
                var result = this.reduce();
                (this.parent || this.stage).swap(this, result);
                return result;
            }
        }
    }, {
        key: "reduceCompletely",
        value: function reduceCompletely() {
            if (!this.hasVtable || !this.subReduceMethod) {
                if (!this.variable.canReduce()) {
                    return this;
                } else {
                    var value = this.variable.reduce().clone();
                    return value;
                }
            } else {
                return this.reduce();
            }
        }
    }, {
        key: "reduce",
        value: function reduce() {
            if ((!this.hasVtable || !this.subReduceMethod) && !this.variable.canReduce()) {
                return this;
            }
            if (!this.hasVtable) return this.value;
            if (!this.subReduceMethod) return this.value;

            // Use a surrogate to do the actual reduction, so that (1) we
            // can use the actual object's reduce() method (this is
            // important for ArrayObjectExpr which does some
            // post-processing on the result) and (2) we can reduce()
            // without mutating ourselves
            var value = this.variable.reduce().clone();
            var surrogate = this;
            if (value instanceof ObjectExtensionExpr) {
                surrogate = value;
                value = value.holes[0];
            }

            surrogate.parent = this; // In case the surrogate needs our environment
            surrogate.setExtension("", this.subReduceMethod, this.methodArgs);

            return surrogate.reduce();
        }
    }, {
        key: "name",
        get: function get() {
            return this.variable.name;
        }
    }, {
        key: "variable",
        get: function get() {
            return this.holes[0];
        }
    }, {
        key: "value",
        get: function get() {
            if (this.variable && this.variable.canReduce()) {
                return this.getEnvironment().lookup(this.variable.name);
            }
            return null;
        }
    }, {
        key: "objMethods",
        get: function get() {
            var value = this.value;
            if (value) {
                return value.objMethods;
            }
            return {};
        },
        set: function set(x) {}
    }]);

    return VtableVarExpr;
}(ObjectExtensionExpr);

var DynamicPulloutDrawer = function (_PulloutDrawer) {
    _inherits(DynamicPulloutDrawer, _PulloutDrawer);

    function DynamicPulloutDrawer(x, y, w, h, parent, onCellSelect) {
        _classCallCheck(this, DynamicPulloutDrawer);

        var _this20 = _possibleConstructorReturn(this, (DynamicPulloutDrawer.__proto__ || Object.getPrototypeOf(DynamicPulloutDrawer)).call(this, x, y, w, h, parent ? parent.objMethods : {}, onCellSelect));
        // Guard against null parent for cloning


        _this20.parent = parent;
        return _this20;
    }

    _createClass(DynamicPulloutDrawer, [{
        key: "open",
        value: function open() {
            // Generate TextExpr for each property:
            var txts = [];
            var propertyTree = this.parent.objMethods;
            for (var key in propertyTree) {
                if (propertyTree.hasOwnProperty(key)) {
                    var str = '.' + key;
                    if (typeof propertyTree[key] === 'function' && propertyTree[key].length > 1) {
                        str += '(..)';
                    } else {
                        str += '()';
                    }
                    var t = new TextExpr(str);
                    t.ignoreEvents = true;
                    t._reduceMethod = propertyTree[key];
                    txts.push(t);
                }
            }
            this.txts = txts;

            _get(DynamicPulloutDrawer.prototype.__proto__ || Object.getPrototypeOf(DynamicPulloutDrawer.prototype), "open", this).call(this);
        }
    }, {
        key: "draw",
        value: function draw(ctx) {
            // Don't draw ourselves if the parent var does not have a
            // vtable or is nested
            if (this.parent && (!this.parent.hasVtable || this.parent.parent)) {
                return;
            }

            _get(DynamicPulloutDrawer.prototype.__proto__ || Object.getPrototypeOf(DynamicPulloutDrawer.prototype), "draw", this).call(this, ctx);
        }
    }]);

    return DynamicPulloutDrawer;
}(PulloutDrawer);
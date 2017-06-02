'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Lambda calculus versions of Expression objects.
 * The LambdaHoleExpr performs substitution on LambdaVar subexpressions in its parent expression context.
 * -----------------------------------------------
 * */

var LambdaHoleExpr = function (_MissingExpression) {
    _inherits(LambdaHoleExpr, _MissingExpression);

    function LambdaHoleExpr(varname) {
        _classCallCheck(this, LambdaHoleExpr);

        var _this2 = _possibleConstructorReturn(this, (LambdaHoleExpr.__proto__ || Object.getPrototypeOf(LambdaHoleExpr)).call(this, null));

        _this2._name = varname;
        _this2.color = _this2.colorForVarName();
        _this2.isOpen = true;
        _this2._openOffset = Math.PI / 2;
        return _this2;
    }

    _createClass(LambdaHoleExpr, [{
        key: 'colorForVarName',
        //'IndianRed';

        // return {
        //
        //     'x':'orange',
        //     'y':'IndianRed',
        //     'z':'green',
        //     'w':'blue'
        //
        // }[v];
        value: function colorForVarName() {
            return LambdaHoleExpr.colorForVarName(this.name);
        }

        // Draw special circle representing a hole.

    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            var rad = boundingSize.w / 2.0;
            ctx.beginPath();
            ctx.arc(pos.x + rad, pos.y + rad, rad, 0, 2 * Math.PI);
            var gradient = ctx.createLinearGradient(pos.x + rad, pos.y, pos.x + rad, pos.y + 2 * rad);
            gradient.addColorStop(0.0, "#AAAAAA");
            gradient.addColorStop(0.7, "#191919");
            gradient.addColorStop(1.0, "#191919");
            ctx.fillStyle = gradient;
            ctx.fill();

            if (this._openOffset < Math.PI / 2) {
                ctx.fillStyle = '#A4A4A4';
                setStrokeStyle(ctx, {
                    color: '#C8C8C8',
                    lineWidth: 1.5
                });

                ctx.beginPath();
                ctx.arc(pos.x + rad, pos.y + rad, rad, -0.25 * Math.PI + this._openOffset, 0.75 * Math.PI - this._openOffset);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(pos.x + rad, pos.y + rad, rad, -0.25 * Math.PI - this._openOffset, 0.75 * Math.PI + this._openOffset, true);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(pos.x + rad, pos.y + rad, rad, 0, 2 * Math.PI);
            var gradient = ctx.createRadialGradient(pos.x + rad, pos.y + rad, 0.67 * rad, pos.x + rad, pos.y + rad, rad);
            gradient.addColorStop(0, "rgba(0, 0, 0, 0.0)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");
            ctx.fillStyle = gradient;
            ctx.fill();

            setStrokeStyle(ctx, this.stroke);
            if (this.stroke) ctx.stroke();
        }

        // Accessibility

    }, {
        key: 'open',
        value: function open() {
            var _this3 = this;

            if (!this.isOpen) {
                if (this.stage) {
                    if (this._runningAnim) this._runningAnim.cancel();
                    this._runningAnim = Animate.tween(this, { _openOffset: Math.PI / 2 }, 300).after(function () {
                        _this3._openOffset = Math.PI / 2;
                        _this3._runningAnim = null;
                    });
                } else {
                    this._openOffset = Math.PI / 2;
                }
                this.isOpen = true;
            }
        }
    }, {
        key: 'close',
        value: function close() {
            var _this4 = this;

            if (this.isOpen) {
                if (this.stage) {
                    if (this._runningAnim) this._runningAnim.cancel();
                    this._runningAnim = Animate.tween(this, { _openOffset: 0 }, 300).after(function () {
                        _this4._openOffset = 0;
                        _this4._runningAnim = null;
                    });
                } else {
                    this._openOffset = 0;
                }
                this.isOpen = false;
            }
        }
    }, {
        key: 'hits',
        value: function hits(pos) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

            if (this.isOpen) {
                if (this.parent && this.parent.parent) return null;
                return _get(LambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaHoleExpr.prototype), 'hits', this).call(this, pos, options);
            } else {
                return null;
            }
        }
    }, {
        key: 'applyExpr',
        value: function applyExpr(node) {
            var _this5 = this;

            if (!this.parent) {
                console.error('@ LambdaHoleExpr.applyExpr: No parent LambdaExpr.');
                return false;
            }

            var parent = this.parent;
            var subvarexprs = mag.Stage.getNodesWithClass(LambdaVarExpr, [], true, [parent]);
            subvarexprs.forEach(function (expr) {
                if (expr.name === _this5.name) {
                    var c = node.clone();
                    //c.bindSubexpressions();
                    c.stage = null;
                    expr.parent.swap(expr, c); // Swap the expression for a clone of the dropped node.
                    c.parent.bindSubexpressions();

                    // TODO: Move this somewhere more stable.
                    // Top-level if statements should unlock
                    // reducable boolean expressions.
                    if (c.parent instanceof IfStatement && c.parent.cond instanceof CompareExpr) {
                        c.parent.cond.unlock();
                    }
                }
            });

            parent.getEnvironment().update(this.name, node);
            // Make sure the env display updates
            parent.update();

            var vars = findNoncapturingVarExpr(this.parent, null, true, true);
            var capturedVars = findNoncapturingVarExpr(this.parent, this.name, true, true);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = vars[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var variable = _step.value;

                    // If the variable can't be reduced, don't allow this to be reduced.
                    var idx = capturedVars.indexOf(variable);
                    // Make sure that if the variable can't reduce, it's
                    // because it's the one bound by this argument.
                    if (!variable.canReduce() && (idx == -1 || capturedVars[idx].name != this.name)) {
                        // Play the animation
                        variable.performReduction();
                        return null;
                    }
                }

                // Now remove this hole from its parent expression.
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

            parent.removeArg(this);

            // GAME DESIGN CHOICE: Automatically break apart parenthesized values.
            // * If we don't do this, the player can stick everything into one expression and destroy that expression
            // * to destroy as many expressions as they like with a single destruction piece. And that kind of breaks gameplay.
            return parent.performReduction();
        }

        // Events

    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            if (this.parent) {
                pos = addPos(pos, fromTo(this.absolutePos, this.parent.absolutePos));
                this.parent.onmousedrag(pos);
            }
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            _get(LambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaHoleExpr.prototype), 'onmouseenter', this).call(this, pos);
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave() {
            _get(LambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaHoleExpr.prototype), 'onmouseleave', this).call(this);
        }
    }, {
        key: 'ondropenter',
        value: function ondropenter(node, pos) {
            var _this6 = this;

            if (node instanceof LambdaHoleExpr) node = node.parent;
            // Variables must be reduced before application
            if (node instanceof VarExpr || node instanceof AssignExpr) return;
            // Disallow interaction with nested lambdas
            if (this.parent && this.parent.parent instanceof LambdaExpr) return;
            _get(LambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaHoleExpr.prototype), 'ondropenter', this).call(this, node, pos);

            // Special case: Funnel representation of 'map' hovered over hole.
            // if (node instanceof FunnelMapFunc) {
            //     node.onmouseenter();
            //     return;
            // }

            node.opacity = 0.4;

            if (this.parent) {
                (function () {
                    // Ignore variables that are shadowed when previewing
                    var subvarexprs = findNoncapturingVarExpr(_this6.parent, _this6.name);

                    var wasClosed = false;
                    if (_this6.parent.environmentDisplay) {
                        wasClosed = _this6.parent.environmentDisplay._state === 'closed' || _this6.parent.environmentDisplay._state === 'closing';
                        _this6.parent.environmentDisplay.openDrawer({ force: true, speed: 50 });
                    }

                    subvarexprs.forEach(function (e) {
                        if (e.name === _this6.name) {
                            var preview_node = node.clone();
                            preview_node.opacity = 1.0;
                            preview_node.bindSubexpressions();
                            e.open(preview_node);
                        }
                    });
                    _this6.opened_subexprs = subvarexprs;
                    _this6.close_opened_subexprs = function () {
                        if (!_this6.opened_subexprs) return;
                        _this6.opened_subexprs.forEach(function (e) {
                            e.close();
                        });
                        _this6.opened_subexprs = null;

                        if (_this6.parent.environmentDisplay && wasClosed) {
                            _this6.parent.environmentDisplay.closeDrawer({ force: true, speed: 50 });
                        }
                    };
                })();
            }
        }
    }, {
        key: 'ondropexit',
        value: function ondropexit(node, pos) {
            if (node instanceof LambdaHoleExpr) node = node.parent;
            if (node instanceof VarExpr || node instanceof AssignExpr) return;
            if (this.parent && this.parent.parent instanceof LambdaExpr) return;

            _get(LambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaHoleExpr.prototype), 'ondropexit', this).call(this, node, pos);

            // if (node instanceof FunnelMapFunc) {
            //     return;
            // }

            if (node) node.opacity = 1.0;
            this.close_opened_subexprs();
        }
    }, {
        key: 'ondropped',
        value: function ondropped(node, pos) {
            var _this7 = this;

            if (node instanceof LambdaHoleExpr) node = node.parent;
            // Disallow interaction with nested lambda
            if (this.parent && this.parent.parent instanceof LambdaExpr) {
                return null;
            }

            if (node.dragging) {
                // Make sure node is being dragged by the user.

                // Special case: Funnel dropped over hole.
                // if (node instanceof FunnelMapFunc) {
                //     node.func = this.parent;
                //     this.parent.parent = null;
                //     this.parent.stage.remove(this.parent);
                //     this.onmouseleave();
                //     this.parent.onmouseenter();
                //     node.update();
                //     return;
                // }

                var afterDrop = function afterDrop() {
                    // Cleanup
                    node.opacity = 1.0;
                    if (_this7.close_opened_subexprs) _this7.close_opened_subexprs();

                    // User dropped an expression into the lambda hole.
                    Resource.play('pop');

                    // Clone the dropped expression.
                    var dropped_expr = node.clone();

                    // Save the current state of the board.
                    var stage = node.stage;
                    stage.saveState();

                    Logger.log('state-save', stage.toString());

                    // Remove the original expression from its stage.
                    stage.remove(node);

                    // If this hole is part of a larger expression tree (it should be!),
                    // attempt recursive substitution on any found LambdaVarExpressions.
                    if (_this7.parent) {
                        var parent = _this7.parent;
                        var orig_exp_str = _this7.parent.toString();
                        var dropped_exp_str = node.toString();

                        var result = _this7.applyExpr(node);
                        if (result === null) {
                            // The application failed.
                            stage.add(node);
                            stage.update();
                            return;
                        }

                        // Log the reduction.
                        Logger.log('reduction-lambda', { 'before': orig_exp_str, 'applied': dropped_exp_str, 'after': parent.toString() });
                        Logger.log('state-save', stage.toString());

                        if (parent.children.length === 0) {

                            // This hole expression is a destructor token.
                            // (a) Play nifty 'POOF' animation.
                            Animate.poof(parent);

                            // (b) Remove expression from the parent stage.
                            (parent.parent || parent.stage).remove(parent);
                        } else stage.dumpState();
                    } else {
                        console.warn('ERROR: Cannot perform lambda-substitution: Hole has no parent.');

                        // Hole is singular; acts as abyss. Remove it after one drop.
                        _this7.stage.remove(_this7);
                    }

                    stage.update();
                };

                if (level_idx < 1) {
                    Animate.tween(node, { opacity: 0 }, 400, function (elapsed) {
                        return Math.pow(elapsed, 0.5);
                    }).after(afterDrop);
                } else afterDrop();
            }
        }
    }, {
        key: 'toString',
        value: function toString() {
            return 'λ' + this.name;
        }
    }, {
        key: 'name',
        get: function get() {
            return this._name;
        },
        set: function set(n) {
            this._name = n;
        }
    }], [{
        key: 'colorForVarName',
        value: function colorForVarName(v) {

            if (v === 'x') return 'lightgray';else return 'white';
        }
    }]);

    return LambdaHoleExpr;
}(MissingExpression);

var LambdaVarExpr = function (_ImageExpr) {
    _inherits(LambdaVarExpr, _ImageExpr);

    function LambdaVarExpr(varname) {
        _classCallCheck(this, LambdaVarExpr);

        var _this8 = _possibleConstructorReturn(this, (LambdaVarExpr.__proto__ || Object.getPrototypeOf(LambdaVarExpr)).call(this, 0, 0, 54 * 1.2, 70 * 1.2, 'lambda-pipe'));

        _this8.graphicNode.offset = { x: 0, y: -8 };
        _this8.name = varname ? varname.replace('_', '') : undefined;
        _this8.ignoreEvents = true;
        _this8.handleOffset = -8;

        // Graphic animation.
        _this8.stateGraph.enter('closed');
        return _this8;
    }

    _createClass(LambdaVarExpr, [{
        key: 'clone',
        value: function clone() {
            var c = _get(LambdaVarExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaVarExpr.prototype), 'clone', this).call(this);
            c._stateGraph = null;
            c.stateGraph.enter('closed');
            return c;
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            // TODO: DML enable reduction, but make sure we are not bound
            // by a lambda
            if (!this.parent) {
                this.performReduction();
            }
        }
    }, {
        key: 'open',
        value: function open() {
            var _this9 = this;

            var preview_expr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            if (this.stateGraph.currentState !== 'open') {
                (function () {
                    _this9.stateGraph.enter('opening');

                    var _this = _this9;
                    var stage = _this9.stage;

                    if (preview_expr) {
                        (function () {
                            var stateGraph = _this9.stateGraph;
                            Animate.wait(140).after(function () {
                                if (stateGraph.currentState === 'opening' || stateGraph.currentState === 'open') {
                                    var scale = _this9.graphicNode.size.w / preview_expr.size.w * 0.8;
                                    preview_expr.pos = { x: _this9.children[0].size.w / 2.0, y: -10 };
                                    preview_expr.scale = { x: scale, y: scale };
                                    preview_expr.anchor = { x: 0.5, y: 0 };
                                    preview_expr.stroke = null;
                                    _this.graphicNode.addChild(preview_expr);
                                    stage.draw();
                                }
                            });
                        })();
                    }
                })();
            }
        }
    }, {
        key: 'close',
        value: function close() {
            if (this.stateGraph.currentState !== 'closed') {
                var stage = this.stage;
                this.stateGraph.enter('closing');
                this.graphicNode.children = [];
                stage.draw();
            }
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            var environment = this.getEnvironment();
            var value = environment.lookup(this.name);

            if (value) {
                var clone = value.clone();
                clone.stage = null;
                clone.bindSubexpressions();
                var parent = this.parent || this.stage;
                if (parent) {
                    parent.swap(this, clone);
                    if (this.parent) {
                        this.parent.bindSubexpressions();

                        if (this.parent instanceof IfStatement && this.parent.cond instanceof CompareExpr) {
                            this.parent.cond.unlock();
                        }
                    }
                }
                return clone;
            }
            return this;
        }

        //onmousedrag() {}

    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            _get(LambdaVarExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaVarExpr.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);
            if (ctx && !this.parent) {
                this.scale = { x: 0.8, y: 0.8 };
                drawCircle(ctx, pos.x, pos.y + this.handleOffset + this.shadowOffset, boundingSize.w / 2.0, 'black', this.graphicNode.stroke);
                drawCircle(ctx, pos.x, pos.y + this.handleOffset, boundingSize.w / 2.0, 'lightgray', this.graphicNode.stroke);
            }
        }
    }, {
        key: 'value',
        value: function value() {
            return undefined;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '#' + (this.ignoreEvents ? '' : '_') + this.name;
        }
    }, {
        key: 'size',
        get: function get() {
            var sz = _get(LambdaVarExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaVarExpr.prototype), 'size', this);
            sz.h = 54;
            return sz;
        }
    }, {
        key: 'openImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-pipe-open' : 'lambda-pipe-red-open';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-pipe' : 'lambda-pipe-red';
        }
    }, {
        key: 'openingAnimation',
        get: function get() {
            var anim = new mag.Animation();
            anim.addFrame('lambda-pipe-opening0', 50);
            anim.addFrame('lambda-pipe-opening1', 50);
            anim.addFrame('lambda-pipe-open', 50);
            return anim;
        }
    }, {
        key: 'closingAnimation',
        get: function get() {
            var anim = new mag.Animation();
            anim.addFrame('lambda-pipe-opening1', 50);
            anim.addFrame('lambda-pipe-opening0', 50);
            anim.addFrame('lambda-pipe', 50);
            return anim;
        }
    }, {
        key: 'stateGraph',
        get: function get() {
            var _this10 = this;

            if (!this._stateGraph) {
                var g = new mag.StateGraph();
                g.addState('closed', function () {
                    _this10.image = _this10.closedImage;
                });
                if (this.stage) this.stage.draw();
                g.addState('opening', function () {
                    var anim = _this10.openingAnimation;
                    Animate.play(anim, _this10, function () {
                        if (g.currentState === 'opening') g.enter('open');
                    });
                });
                g.addState('open', function () {
                    _this10.image = _this10.openImage;
                });
                if (this.stage) this.stage.draw();
                g.addState('closing', function () {
                    var anim = _this10.closingAnimation;
                    Animate.play(anim, _this10, function () {
                        if (g.currentState === 'closing') g.enter('closed');
                    });
                });
                this._stateGraph = g;
            }
            return this._stateGraph;
        }
    }]);

    return LambdaVarExpr;
}(ImageExpr);

var LambdaExpr = function (_Expression) {
    _inherits(LambdaExpr, _Expression);

    function LambdaExpr(exprs) {
        _classCallCheck(this, LambdaExpr);

        var _this11 = _possibleConstructorReturn(this, (LambdaExpr.__proto__ || Object.getPrototypeOf(LambdaExpr)).call(this, exprs));

        _this11.environment = new Environment();
        if (_this11.takesArgument) {
            _this11.environment.bound[exprs[0].name] = true;
        }

        /*let txt = new TextExpr('→');
        txt.color = 'gray'
        this.addArg(txt);*/
        return _this11;
    }

    _createClass(LambdaExpr, [{
        key: 'getEnvironment',
        value: function getEnvironment() {
            var env = _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'getEnvironment', this).call(this);
            if (!env.parent && this.stage) {
                env.parent = this.stage.environment;
            }
            return env;
        }
    }, {
        key: 'applyExpr',
        value: function applyExpr(node) {
            if (this.takesArgument) {
                return this.holes[0].applyExpr(node);
            } else return this;
        }
    }, {
        key: 'numOfNestedLambdas',
        value: function numOfNestedLambdas() {
            if (!this.takesArgument || !this.fullyDefined) return 0;else if (this.holes.length < 2) return 1;else {
                return 1 + (this.holes[1] instanceof LambdaExpr ? this.holes[1].numOfNestedLambdas() : 0);
            }
        }
    }, {
        key: 'addChild',
        value: function addChild(c) {
            _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'addChild', this).call(this, c);

            // Color all subvarexpr's of child consistently with their names.
            if (this.takesArgument) {
                this.updateHole();

                var hole = this.holes[0];
                var lvars = mag.Stage.getNodesWithClass(VarExpr, [], true, [this]);
                lvars.forEach(function (v) {
                    if (v.name === hole.name) {
                        v.color = hole.colorForVarName();
                    }
                });
            }
        }
    }, {
        key: 'updateHole',
        value: function updateHole() {
            // Determine whether this LambdaExpr has any MissingExpressions:
            if (this.holes[0].name !== 'x') this.color = this.holes[0].color;
            var missing = !this.fullyDefined;
            if (missing || this.parent && this.parent instanceof FuncExpr && !this.parent.isAnimating) {
                // ||
                //this.parent instanceof LambdaExpr && this.parent.takesArgument)))
                this.holes[0].close();
            } else {
                this.holes[0].open();
            }
        }

        // Close lambda holes appropriately.

    }, {
        key: 'swap',
        value: function swap(node, otherNode) {
            _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'swap', this).call(this, node, otherNode);
            if (this.takesArgument) {
                if (otherNode instanceof MissingExpression) {
                    // if expression was removed...
                    this.holes[0].close(); // close the hole, undoubtedly
                } else if (node instanceof MissingExpression) {
                        // if expression was placed...
                        this.updateHole();
                    }
            }
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            this.performReduction();
        }
    }, {
        key: 'hitsChild',
        value: function hitsChild(pos) {
            if (this.isParentheses) return null;
            return _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'hitsChild', this).call(this, pos);
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            // Remove 'parentheses':
            if (this.isParentheses) {
                return this.holes;
            } else return _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'reduce', this).call(this);
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            var _this12 = this;

            // If we don't have all our arguments, refuse to evaluate.
            if (this.takesArgument) {
                return this;
            }

            // Perform substitution, but stop at the 'boundary' of another lambda.
            var varExprs = findNoncapturingVarExpr(this, null, true, true);
            var environment = this.getEnvironment();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = varExprs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var expr = _step2.value;

                    expr.performReduction();
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

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.holes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var child = _step3.value;

                    if (child instanceof LambdaExpr) {
                        // TODO: need to recurse down into children, but not children of lambdas
                        child.environment.parent = this.environment;
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

            var reduced_expr = this.reduce();
            if (reduced_expr && reduced_expr != this) {
                // Only swap if reduction returns something > null.

                if (this.stage) this.stage.saveState();

                var parent;
                if (Array.isArray(reduced_expr)) {
                    if (reduced_expr.length === 1) {
                        reduced_expr = reduced_expr[0];
                    } // reduce to single argument
                    else if (this.parent) return; // cannot reduce a parenthetical expression with > 1 subexpression.
                        else {
                                parent = this.stage;
                                reduced_expr.forEach(function (e) {
                                    if (_this12.locked) e.lock();else e.unlock();
                                });
                                parent.swap(this, reduced_expr); // swap 'this' (on the board) with an array of its reduced expressions
                                return reduced_expr;
                            }
                }

                parent = this.parent ? this.parent : this.stage;
                if (this.locked) reduced_expr.lock(); // the new expression should inherit whatever this expression was capable of as input
                else reduced_expr.unlock();
                //console.warn(this, reduced_expr);
                if (parent) parent.swap(this, reduced_expr);

                if (reduced_expr.parent) {
                    var try_reduce = reduced_expr.parent.reduceCompletely();
                    if (try_reduce != reduced_expr.parent && try_reduce !== null) {
                        Animate.blink(reduced_expr.parent, 400, [0, 1, 0]);
                    }
                }

                return reduced_expr;
            }
        }
    }, {
        key: 'reduceCompletely',
        value: function reduceCompletely() {
            // Try to reduce this expression and its subexpressions as completely as possible.

            // If the inner expression reduces to null when it takes an argument, this lambda expression itself should disappear.
            if (this.takesArgument && this.fullyDefined && this.holes.length === 2 && this.holes[1].reduceCompletely() === null) {

                console.error('HELLO');
                return null;
            } else return _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'reduceCompletely', this).call(this);
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);
            if (this.shadowOffset == 0 && this.parent) {
                setStrokeStyle(ctx, {
                    color: 'gray',
                    lineWidth: 1
                });
                roundRect(ctx, pos.x - 1, pos.y - 1, boundingSize.w + 1, boundingSize.h + 1, this.radius * this.absoluteScale.x, false, true, 0.5);
                setStrokeStyle(ctx, this.stroke);
            }
        }
    }, {
        key: 'toString',
        value: function toString() {
            if (this.holes.length === 1 && this.holes[0] instanceof LambdaHoleExpr) return '(' + _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'toString', this).call(this) + ')';else return _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'toString', this).call(this);
        }
    }, {
        key: 'isParentheses',
        get: function get() {
            return this.holes.length > 0 && !this.takesArgument;
        }
    }, {
        key: 'takesArgument',
        get: function get() {
            return this.holes.length > 0 && this.holes[0] instanceof LambdaHoleExpr;
        }
    }, {
        key: 'fullyDefined',
        get: function get() {
            // If one arg is MissingExpression, this will be false.
            if (this.holes.length < 2) return true;
            return this.holes.slice(1).reduce(function (prev, arg) {
                return prev && !(arg instanceof MissingExpression);
            }, true);
        }
    }, {
        key: 'isConstantFunction',
        get: function get() {
            return this.takesArgument && mag.Stage.getNodesWithClass(VarExpr, [], true, [this]).length === 0;
        }
    }, {
        key: 'body',
        get: function get() {
            return this.takesArgument ? this.holes[1] : null;
        }
    }]);

    return LambdaExpr;
}(Expression);

var EnvironmentLambdaExpr = function (_LambdaExpr) {
    _inherits(EnvironmentLambdaExpr, _LambdaExpr);

    function EnvironmentLambdaExpr(exprs) {
        _classCallCheck(this, EnvironmentLambdaExpr);

        var _this13 = _possibleConstructorReturn(this, (EnvironmentLambdaExpr.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr)).call(this, exprs));

        _this13.environmentDisplay = new InlineEnvironmentDisplay(_this13);
        _this13.environmentDisplay.scale = { x: 0.85, y: 0.85 };
        return _this13;
    }

    _createClass(EnvironmentLambdaExpr, [{
        key: 'removeArg',
        value: function removeArg(arg) {
            // Don't let holes remove themselves - we want to keep the
            // parameter visible while we are reducing
            if (arg instanceof LambdaHoleExpr) {
                arg.isOpen = false;
                return;
            }
            _get(EnvironmentLambdaExpr.prototype.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr.prototype), 'removeArg', this).call(this, arg);
        }
    }, {
        key: 'hits',
        value: function hits(pos) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

            if (this.parent) return _get(EnvironmentLambdaExpr.prototype.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr.prototype), 'hits', this).call(this, pos, options);

            var result = _get(EnvironmentLambdaExpr.prototype.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr.prototype), 'hits', this).call(this, pos, options) || this.environmentDisplay.hits(pos, options);
            if (result == this.environmentDisplay) {
                return this;
            }
            return result;
        }
    }, {
        key: 'onmousedown',
        value: function onmousedown(pos) {
            if (this.parent) _get(EnvironmentLambdaExpr.prototype.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr.prototype), 'onmousedown', this).call(this, pos);

            if (_get(EnvironmentLambdaExpr.prototype.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr.prototype), 'hits', this).call(this, pos)) {
                this._eventTarget = this;
                _get(EnvironmentLambdaExpr.prototype.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr.prototype), 'onmousedown', this).call(this, pos);
            } else {
                this._eventTarget = this.environmentDisplay;
                this.environmentDisplay.onmousedown(pos);
            }
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            if (this.parent) _get(EnvironmentLambdaExpr.prototype.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr.prototype), 'onmousedrag', this).call(this, pos);

            if (!this._eventTarget) return;
            if (this._eventTarget == this) {
                _get(EnvironmentLambdaExpr.prototype.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr.prototype), 'onmousedrag', this).call(this, pos);
            } else {
                this._eventTarget.onmousedrag(pos);
            }
        }
    }, {
        key: 'onmouseup',
        value: function onmouseup(pos) {
            if (this.parent) _get(EnvironmentLambdaExpr.prototype.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr.prototype), 'onmouseup', this).call(this, pos);

            if (!this._eventTarget) return;
            if (this._eventTarget == this) {
                _get(EnvironmentLambdaExpr.prototype.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr.prototype), 'onmouseup', this).call(this, pos);
            } else {
                this._eventTarget.onmouseup(pos);
            }
            this._eventTarget = null;
        }
    }, {
        key: 'update',
        value: function update() {
            _get(EnvironmentLambdaExpr.prototype.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr.prototype), 'update', this).call(this);
            this.environmentDisplay.update();
        }
    }, {
        key: 'draw',
        value: function draw(ctx) {
            if (!this.parent) {
                this.environmentDisplay.parent = this;
                this.environmentDisplay.draw(ctx);
            }
            _get(EnvironmentLambdaExpr.prototype.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr.prototype), 'draw', this).call(this, ctx);
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            if (!this._animating) {
                this.performReduction();
            }
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            var _this14 = this;

            // If we don't have all our arguments, refuse to evaluate.
            if (this.takesArgument) {
                return this;
            }

            return new Promise(function (resolve, _reject) {
                _this14._animating = true;
                _this14.environmentDisplay.openDrawer({ force: true, speed: 100 });

                // Perform substitution, but stop at the 'boundary' of another lambda.
                var varExprs = findNoncapturingVarExpr(_this14, null, true, true);
                var environment = _this14.getEnvironment();

                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = varExprs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var v = _step4.value;

                        if (!v.canReduce()) {
                            // Play the animation
                            v.performReduction();
                            _reject();
                            return;
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

                var stepReduction = function stepReduction() {
                    return new Promise(function (innerresolve, innerreject) {
                        if (varExprs.length === 0) {
                            innerresolve();
                        } else {
                            var expr = varExprs.pop();
                            var result = void 0;
                            if (expr instanceof LabeledVarExpr) {
                                result = expr.animateReduction(_this14.environmentDisplay.bindings[expr.name]);
                            } else {
                                result = expr.performReduction();
                            }

                            if (result instanceof Promise) {
                                result.then(function () {
                                    stepReduction().then(function () {
                                        return innerresolve();
                                    });
                                }, function () {
                                    innerreject();
                                    _reject();
                                    _this14._animating = false;
                                });
                            } else {
                                return stepReduction();
                            }
                        }
                    });
                };
                stepReduction().then(function () {
                    window.setTimeout(function () {
                        // Get rid of the parameter
                        _get(EnvironmentLambdaExpr.prototype.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr.prototype), 'removeArg', _this14).call(_this14, _this14.holes[0]);

                        Animate.poof(_this14);
                        _get(EnvironmentLambdaExpr.prototype.__proto__ || Object.getPrototypeOf(EnvironmentLambdaExpr.prototype), 'performReduction', _this14).call(_this14);
                        resolve();
                    }, 600);
                });
            });
        }
    }, {
        key: 'takesArgument',
        get: function get() {
            // Since the hole isn't removed by our override of removeArg,
            // account for that when deciding whether the lambda is
            // reducible
            return this.holes.length > 0 && this.holes[0] instanceof LambdaHoleExpr && this.holes[0].isOpen;
        }
    }]);

    return EnvironmentLambdaExpr;
}(LambdaExpr);

var InlineEnvironmentDisplay = function (_SpreadsheetEnvironme) {
    _inherits(InlineEnvironmentDisplay, _SpreadsheetEnvironme);

    function InlineEnvironmentDisplay(lambda) {
        _classCallCheck(this, InlineEnvironmentDisplay);

        var _this15 = _possibleConstructorReturn(this, (InlineEnvironmentDisplay.__proto__ || Object.getPrototypeOf(InlineEnvironmentDisplay)).call(this, []));

        _this15.lambda = lambda;
        _this15.parent = lambda;
        _this15.padding = { left: 0, right: 10, inner: 10 };

        _this15._state = 'open';
        _this15._height = 1.0;
        _this15._animation = null;
        return _this15;
    }

    _createClass(InlineEnvironmentDisplay, [{
        key: 'openDrawer',
        value: function openDrawer() {
            var _this16 = this;

            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var force = options.force || false;
            var speed = options.speed || 300;
            if (this._state === 'closed' || force) {
                if (this._animation) this._animation.cancelWithoutFiringCallbacks();
                this._state = 'opening';
                this._animation = Animate.tween(this, { _height: 1.0 }, speed).after(function () {
                    _this16._state = 'open';
                    _this16._animation = null;
                });
            }
        }
    }, {
        key: 'closeDrawer',
        value: function closeDrawer() {
            var _this17 = this;

            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var force = options.force || false;
            var speed = options.speed || 300;
            if (this._state === 'open' || force) {
                if (this._animation) this._animation.cancelWithoutFiringCallbacks();
                this._state = 'closing';
                this._animation = Animate.tween(this, { _height: 0.0 }, speed).after(function () {
                    _this17._state = 'closed';
                    _this17._animation = null;
                });
            }
        }
    }, {
        key: 'onmouseup',
        value: function onmouseup() {
            if (this._state === 'open') {
                this.closeDrawer();
            } else if (this._state === 'closed') {
                this.openDrawer();
            }
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {}
    }, {
        key: 'getEnvironment',
        value: function getEnvironment() {
            return this.lambda.getEnvironment();
        }
    }, {
        key: 'draw',
        value: function draw(ctx) {
            var _this18 = this;

            if (!ctx) return;
            ctx.save();
            this.opacity = this.lambda.opacity;
            if (this.opacity !== undefined && this.opacity < 1.0) {
                ctx.globalAlpha = this.opacity;
            }
            var boundingSize = this.absoluteSize;
            var upperLeftPos = this.upperLeftPos(this.absolutePos, boundingSize);
            this.drawInternal(ctx, upperLeftPos, boundingSize);
            if (this._state === 'open') {
                this.children.forEach(function (child) {
                    child.parent = _this18;
                    child.draw(ctx);
                });
            }
            ctx.restore();
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            this.drawBackground(ctx, pos, boundingSize);
            if (this._state === "open") {
                this.drawGrid(ctx);
            }
        }
    }, {
        key: 'pos',
        get: function get() {
            return { x: 5, y: this.lambda.size.h - 5 };
        },
        set: function set(p) {
            this._pos = p;
        }
    }, {
        key: 'size',
        get: function get() {
            var size = _get(InlineEnvironmentDisplay.prototype.__proto__ || Object.getPrototypeOf(InlineEnvironmentDisplay.prototype), '_origSize', this);
            size.w += this.padding.left + this.padding.right;
            return size;
        }
    }, {
        key: 'absoluteSize',
        get: function get() {
            var size = _get(InlineEnvironmentDisplay.prototype.__proto__ || Object.getPrototypeOf(InlineEnvironmentDisplay.prototype), 'absoluteSize', this);
            size.h = Math.max(25, this._height * size.h);
            return size;
        }
    }]);

    return InlineEnvironmentDisplay;
}(SpreadsheetEnvironmentDisplay);

/** Faded lambda variants. */


var FadedLambdaHoleExpr = function (_LambdaHoleExpr) {
    _inherits(FadedLambdaHoleExpr, _LambdaHoleExpr);

    _createClass(FadedLambdaHoleExpr, [{
        key: 'openImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x' : 'lambda-hole-y';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-closed' : 'lambda-hole-y-closed';
        }
    }]);

    function FadedLambdaHoleExpr(varname) {
        _classCallCheck(this, FadedLambdaHoleExpr);

        var _this19 = _possibleConstructorReturn(this, (FadedLambdaHoleExpr.__proto__ || Object.getPrototypeOf(FadedLambdaHoleExpr)).call(this, varname));

        _this19.padding.left = 5;
        _this19.label = new TextExpr("λ" + varname + ".");
        _this19.addArg(_this19.label);
        _this19.label.color = "#000";
        return _this19;
    }

    _createClass(FadedLambdaHoleExpr, [{
        key: 'open',
        value: function open() {
            if (!this.isOpen) {
                this.label.color = "#000";
                this.label.shadow = null;
            }
            _get(FadedLambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(FadedLambdaHoleExpr.prototype), 'open', this).call(this);
        }
    }, {
        key: 'close',
        value: function close() {
            if (this.isOpen) {
                this.label.color = "#565656";
                this.label.shadow = {
                    color: "#777",
                    x: 1,
                    y: 0,
                    blur: 0
                };
            }
            _get(FadedLambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(FadedLambdaHoleExpr.prototype), 'close', this).call(this);
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            var rad = boundingSize.w / 2.0;
            ctx.beginPath();
            ctx.arc(pos.x + rad, pos.y + rad, rad, 0, 2 * Math.PI);
            setStrokeStyle(ctx, this.stroke);
            if (this.stroke) ctx.stroke();
        }
    }, {
        key: 'size',
        get: function get() {
            return {
                w: 50,
                h: 50
            };
        }
    }]);

    return FadedLambdaHoleExpr;
}(LambdaHoleExpr);

var HalfFadedLambdaHoleExpr = function (_LambdaHoleExpr2) {
    _inherits(HalfFadedLambdaHoleExpr, _LambdaHoleExpr2);

    function HalfFadedLambdaHoleExpr(varname) {
        _classCallCheck(this, HalfFadedLambdaHoleExpr);

        var _this20 = _possibleConstructorReturn(this, (HalfFadedLambdaHoleExpr.__proto__ || Object.getPrototypeOf(HalfFadedLambdaHoleExpr)).call(this, varname));

        _this20.label = new TextExpr("λ" + varname);
        _this20.addArg(_this20.label);
        _this20.label.color = "#FFF";
        return _this20;
    }

    _createClass(HalfFadedLambdaHoleExpr, [{
        key: 'open',
        value: function open() {
            if (!this.isOpen) {
                this.label.color = "#FFF";
            }
            _get(HalfFadedLambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(HalfFadedLambdaHoleExpr.prototype), 'open', this).call(this);
        }
    }, {
        key: 'close',
        value: function close() {
            if (this.isOpen) {
                this.label.color = "#565656";
            }
            _get(HalfFadedLambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(HalfFadedLambdaHoleExpr.prototype), 'close', this).call(this);
        }
    }, {
        key: 'size',
        get: function get() {
            var size = _get(HalfFadedLambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(HalfFadedLambdaHoleExpr.prototype), 'size', this);
            size.w = Math.max(size.w, size.h);
            size.h = Math.max(size.w, size.h);
            return size;
        }
    }]);

    return HalfFadedLambdaHoleExpr;
}(LambdaHoleExpr);

var FadedPythonLambdaHoleExpr = function (_LambdaHoleExpr3) {
    _inherits(FadedPythonLambdaHoleExpr, _LambdaHoleExpr3);

    function FadedPythonLambdaHoleExpr() {
        _classCallCheck(this, FadedPythonLambdaHoleExpr);

        return _possibleConstructorReturn(this, (FadedPythonLambdaHoleExpr.__proto__ || Object.getPrototypeOf(FadedPythonLambdaHoleExpr)).apply(this, arguments));
    }

    _createClass(FadedPythonLambdaHoleExpr, [{
        key: 'drawInternal',


        // Draw special round rect around term.
        value: function drawInternal(ctx, pos, boundingSize) {
            setStrokeStyle(ctx, this.stroke);
            ctx.fillStyle = this.color;
            ctx.drawImage(Resource.getImage(this.image), pos.x, pos.y, boundingSize.w, boundingSize.h);
            if (this.stroke) {
                roundRect(ctx, pos.x, pos.y, boundingSize.w, boundingSize.h, 6, false, true, this.stroke.opacity);
            }
        }
    }, {
        key: 'openImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-python' : 'lambda-hole-y';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-closed-python' : 'lambda-hole-y-closed';
        }
    }, {
        key: 'size',
        get: function get() {
            var sz = _get(FadedPythonLambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(FadedPythonLambdaHoleExpr.prototype), 'size', this);
            sz.w = 120;
            return sz;
        }
    }]);

    return FadedPythonLambdaHoleExpr;
}(LambdaHoleExpr);

var FadedES6LambdaHoleExpr = function (_LambdaHoleExpr4) {
    _inherits(FadedES6LambdaHoleExpr, _LambdaHoleExpr4);

    function FadedES6LambdaHoleExpr(varname) {
        _classCallCheck(this, FadedES6LambdaHoleExpr);

        var _this22 = _possibleConstructorReturn(this, (FadedES6LambdaHoleExpr.__proto__ || Object.getPrototypeOf(FadedES6LambdaHoleExpr)).call(this, varname));

        _this22.padding.left = 5;
        _this22.label = new TextExpr("(" + varname + ")");
        _this22.arrow = new TextExpr("=>");
        _this22.addArg(_this22.label);
        _this22.addArg(_this22.arrow);
        _this22.label.color = "#000";
        _this22.arrow.color = "#000";
        return _this22;
    }

    _createClass(FadedES6LambdaHoleExpr, [{
        key: 'hits',


        // Events
        value: function hits(pos, options) {
            if (this.ignoreEvents) return null; // All children are ignored as well.
            else if (!this.isOpen) return null;

            var boundingSize = this.label.absoluteSize;
            var upperLeftPos = this.label.upperLeftPos(this.absolutePos, boundingSize);
            if (pointInRect(pos, rectFromPosAndSize(upperLeftPos, boundingSize))) return this;else return null;
        }
    }, {
        key: 'update',
        value: function update() {
            _get(FadedES6LambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(FadedES6LambdaHoleExpr.prototype), 'update', this).call(this);
            this.label.pos = {
                x: this.label.pos.x,
                y: 22
            };
            this.arrow.pos = {
                x: this.arrow.pos.x,
                y: 22
            };
        }

        // Draw special round rect around just x term.

    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            setStrokeStyle(ctx, this.stroke);
            ctx.fillStyle = this.color;
            if (this.stroke) {
                roundRect(ctx, this.label.absolutePos.x, this.label.absolutePos.y - this.label.anchor.y * this.label.absoluteSize.h, this.label.absoluteSize.w, this.label.absoluteSize.h, 6, false, true, this.stroke.opacity);
            }
        }
    }, {
        key: 'openImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-es6' : 'lambda-hole-y';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-closed-es6' : 'lambda-hole-y-closed';
        }
    }]);

    return FadedES6LambdaHoleExpr;
}(LambdaHoleExpr);

var HalfFadedLambdaVarExpr = function (_LambdaVarExpr) {
    _inherits(HalfFadedLambdaVarExpr, _LambdaVarExpr);

    function HalfFadedLambdaVarExpr() {
        _classCallCheck(this, HalfFadedLambdaVarExpr);

        return _possibleConstructorReturn(this, (HalfFadedLambdaVarExpr.__proto__ || Object.getPrototypeOf(HalfFadedLambdaVarExpr)).apply(this, arguments));
    }

    _createClass(HalfFadedLambdaVarExpr, [{
        key: 'openImage',
        get: function get() {
            return 'lambda-pipe-open';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-pipe-xside-closed' : 'lambda-pipe-xside-closed';
        }
    }]);

    return HalfFadedLambdaVarExpr;
}(LambdaVarExpr);

var FadedLambdaVarExpr = function (_LambdaVarExpr2) {
    _inherits(FadedLambdaVarExpr, _LambdaVarExpr2);

    function FadedLambdaVarExpr(varname) {
        _classCallCheck(this, FadedLambdaVarExpr);

        var _this24 = _possibleConstructorReturn(this, (FadedLambdaVarExpr.__proto__ || Object.getPrototypeOf(FadedLambdaVarExpr)).call(this, varname));

        _this24.graphicNode.size = _this24.name === 'x' ? { w: 24, h: 24 } : { w: 24, h: 30 };
        _this24.graphicNode.offset = _this24.name === 'x' ? { x: 0, y: 0 } : { x: 0, y: 2 };
        _this24.handleOffset = 2;
        return _this24;
    }

    _createClass(FadedLambdaVarExpr, [{
        key: 'open',
        value: function open() {
            var preview_expr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            if (this.stateGraph.currentState !== 'open') {
                this.stateGraph.enter('opening');

                if (preview_expr) {
                    var scale = this.graphicNode.size.w / preview_expr.size.w * 2.0;
                    preview_expr.pos = { x: this.graphicNode.size.w / 2.0, y: 0 };
                    preview_expr.scale = { x: scale, y: scale };
                    preview_expr.anchor = { x: 0.5, y: 0.3 };
                    preview_expr.stroke = null;
                    this.graphicNode.addChild(preview_expr);
                    this.stage.draw();
                }
            }
        }
    }, {
        key: 'openImage',
        get: function get() {
            return 'lambda-pipe-x-open';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-pipe-x' : 'lambda-pipe-x';
        }
    }, {
        key: 'openingAnimation',
        get: function get() {
            var anim = new mag.Animation();
            anim.addFrame('lambda-pipe-x-opening0', 50);
            anim.addFrame('lambda-pipe-x-opening1', 50);
            anim.addFrame(this.openImage, 50);
            return anim;
        }
    }, {
        key: 'closingAnimation',
        get: function get() {
            var anim = new mag.Animation();
            anim.addFrame('lambda-pipe-x-opening1', 50);
            anim.addFrame('lambda-pipe-x-opening0', 50);
            anim.addFrame(this.closedImage, 50);
            return anim;
        }
    }]);

    return FadedLambdaVarExpr;
}(LambdaVarExpr);

// This doesn't account for the case (lambda y. x) y, since we use
// call-by-value (variables have to be evaluated before you can use
// them)


function findNoncapturingVarExpr(lambda, name) {
    var skipLambda = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var skipLabel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    var subvarexprs = [];
    var queue = [lambda];
    while (queue.length > 0) {
        var node = queue.pop();
        if (node instanceof VarExpr || node instanceof LambdaVarExpr) {
            subvarexprs.push(node);
        } else if (!skipLabel && (node instanceof DisplayChest || node instanceof LabeledDisplay || node instanceof SpreadsheetDisplay)) {
            subvarexprs.push(node);
        } else if (node !== lambda && node instanceof LambdaExpr && (node.takesArgument && node.holes[0].name === name || skipLambda)) {
            // Capture-avoiding substitution
            continue;
        }

        if (node.children) {
            queue = queue.concat(node.children);
        }

        if (node instanceof EnvironmentLambdaExpr) {
            var displays = findNoncapturingVarExpr(node.environmentDisplay, name, skipLambda);
            queue = queue.concat(displays);
        }
    }

    return subvarexprs;
}
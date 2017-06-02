'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Notch attachment node.
var NewInstanceExpr = function (_FadedValueExpr) {
    _inherits(NewInstanceExpr, _FadedValueExpr);

    function NewInstanceExpr() {
        _classCallCheck(this, NewInstanceExpr);

        var _this = _possibleConstructorReturn(this, (NewInstanceExpr.__proto__ || Object.getPrototypeOf(NewInstanceExpr)).call(this, '+'));

        _this.notches = [new WedgeNotch('right', 10, 10, 0.5, false)];
        _this.padding.right = 20;
        //this.shadowOffset = 6;
        _this.radius = 3;
        _this.attachNode = null;
        return _this;
    }
    // get notchPos() {
    //     let upperLeftPos = this.upperLeftPos(this.absolutePos, this.absoluteSize);
    //     return { x:upperLeftPos.x + this.size.w, y:upperLeftPos.y + this.size.h * this.notch.relpos };
    // }


    _createClass(NewInstanceExpr, [{
        key: 'isAttached',
        value: function isAttached() {
            return this.attachNode ? true : false;
        }
    }, {
        key: 'attach',
        value: function attach(nodeWithNotch) {
            if (!nodeWithNotch.notchPos) {
                console.error('@ NewInstanceExpr.attach: Prospective attachment has no notchPos property.');
                return;
            }
            this.attachNode = nodeWithNotch;
            var notchPos = this.notchPos;
            var nodeNotchDistY = nodeWithNotch.notchPos.y - nodeWithNotch.pos.y;
            nodeWithNotch.pos = { x: notchPos.x, y: notchPos.y - nodeNotchDistY };
            this.stroke = null;
            Animate.blink(this, 500, [1, 0, 1], 1);
            Animate.blink(nodeWithNotch, 500, [1, 0, 1], 1);
        }
    }, {
        key: 'detachAttachment',
        value: function detachAttachment(node) {
            if (node != this.attachNode) {
                console.error('@ NewInstanceExpr.detach: Trying to detach node which isn\'t attached to this expression.');
                return;
            }
            this.attachNode = null;
        }
    }]);

    return NewInstanceExpr;
}(FadedValueExpr);

// Acts as a named wrapper for a def'd expression.


var NamedExpr = function (_Expression) {
    _inherits(NamedExpr, _Expression);

    function NamedExpr(name, refDefineExpr, args) {
        _classCallCheck(this, NamedExpr);

        var txt_name = new TextExpr(name);
        txt_name.color = 'black';
        var exprs = [txt_name];
        for (var i = 0; i < args.length; i++) {
            exprs.push(args[i].clone());
        }
        var _this2 = _possibleConstructorReturn(this, (NamedExpr.__proto__ || Object.getPrototypeOf(NamedExpr)).call(this, exprs));

        _this2.color = 'OrangeRed';
        _this2.name = name;
        console.log("args");
        console.log(args);
        _this2._args = args.map(function (a) {
            return a.clone();
        });
        _this2._wrapped_ref = refDefineExpr;
        _this2.scale = refDefineExpr.scale;
        return _this2;
    }

    _createClass(NamedExpr, [{
        key: 'onmouseclick',
        value: function onmouseclick() {
            console.log(this);
            this.performReduction();
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            var expr = this.expr;
            if (!expr || expr instanceof MissingExpression) return this;else {

                var incomplete_exprs = mag.Stage.getNodesWithClass(MissingExpression, [], true, [expr]).filter(function (e) {
                    return !(e instanceof LambdaHoleExpr);
                });
                if (incomplete_exprs.length > 0) {
                    console.log(incomplete_exprs);
                    incomplete_exprs.forEach(function (e) {
                        return Animate.blink(e, 1000, [1, 0, 0], 2);
                    });
                    return this;
                }

                // This should 'reduce' by applying the arguments to the wrapped expression.
                // First, let's check that we HAVE arguments...
                var isValidArgument = function isValidArgument(a) {
                    return a && a instanceof Expression && !(a instanceof MissingExpression);
                };
                var validateAll = function validateAll(arr, testfunc) {
                    return arr.reduce(function (prev, x) {
                        return prev && testfunc(x);
                    }, true);
                };
                var args = this.args;
                if (args.length === 0 || validateAll(args, isValidArgument)) {
                    // true if all args valid

                    // All the arguments check out. Now we need to apply them.
                    var _expr = this.expr;
                    console.log(_expr);

                    if (args.length > 0) _expr = args.reduce(function (lambdaExpr, arg) {
                        return lambdaExpr.applyExpr(arg);
                    }, _expr); // Chains application to inner lambda expressions.

                    Resource.play('define-convert');

                    // Disable editing the DefineExpr after its been used once.
                    this._wrapped_ref.lockSubexpressions(function (e) {
                        return !(e instanceof DragPatch);
                    });
                    this._wrapped_ref.lock();

                    return _expr.clone(); // to be safe we'll clone it.
                }
            }

            return this;
        }

        // Whoa... meta.

    }, {
        key: 'toString',
        value: function toString() {
            var s = '(' + name; // e.g. '(length'
            var args = this.args;
            for (var i = 0; i < args.length; i++) {
                s += ' ' + args[i].toString();
            }s += ')';
            return s;
        }
    }, {
        key: 'expr',
        get: function get() {
            return this._wrapped_ref.expr.clone();
        }
    }, {
        key: 'args',
        get: function get() {
            return this.holes.slice(1).map(function (a) {
                return a.clone();
            });
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.name, this.expr.clone(), this.args];
        }
    }]);

    return NamedExpr;
}(Expression);

var DragPatch = function (_ImageExpr) {
    _inherits(DragPatch, _ImageExpr);

    function DragPatch(x, y, w, h) {
        _classCallCheck(this, DragPatch);

        var _this3 = _possibleConstructorReturn(this, (DragPatch.__proto__ || Object.getPrototypeOf(DragPatch)).call(this, x, y, w, h, 'drag-patch'));

        _this3.padding = { left: 0, right: 0, inner: 0 };
        return _this3;
    }

    _createClass(DragPatch, [{
        key: 'draw',
        value: function draw(ctx) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            _get(DragPatch.prototype.__proto__ || Object.getPrototypeOf(DragPatch.prototype), 'draw', this).call(this, ctx);
            ctx.restore();
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            _get(DragPatch.prototype.__proto__ || Object.getPrototypeOf(DragPatch.prototype), 'onmouseenter', this).call(this, pos);
            this.parent.stroke = { color: 'white', lineWidth: 2 };
            SET_CURSOR_STYLE(CONST.CURSOR.GRAB);
        }
    }, {
        key: 'onmousedown',
        value: function onmousedown(pos) {
            _get(DragPatch.prototype.__proto__ || Object.getPrototypeOf(DragPatch.prototype), 'onmousedown', this).call(this, pos);
            SET_CURSOR_STYLE(CONST.CURSOR.GRABBING);
        }
    }, {
        key: 'onmouseup',
        value: function onmouseup(pos) {
            _get(DragPatch.prototype.__proto__ || Object.getPrototypeOf(DragPatch.prototype), 'onmouseup', this).call(this, pos);
            SET_CURSOR_STYLE(CONST.CURSOR.GRAB);
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {

            SET_CURSOR_STYLE(CONST.CURSOR.GRABBING);

            //let stage = this.stage;
            var replacement = this.parent.parent.generateNamedExpr(); // DefineExpr -> NamedExpr, or PlayPenExpr -> ObjectExtensionExpr
            var ghosted_name = this.parent.clone();
            ghosted_name.scale = this.parent.absoluteScale;
            ghosted_name.pos = this.parent.absolutePos;
            ghosted_name.onmouseenter();
            ghosted_name.shadowOffset = 0;
            ghosted_name.opacity = 0.5;
            ghosted_name.onmouseup = function (pos) {
                var _this4 = this;

                this.opacity = 1.0;
                this.shadowOffset = 0;
                SET_CURSOR_STYLE(CONST.CURSOR.DEFAULT);

                replacement.pos = this.upperLeftPos(this.absolutePos, this.absoluteSize);
                var fx = new ShatterExpressionEffect(this);
                fx.run(stage, function () {
                    stage.remove(_this4);
                    stage.add(replacement);
                    replacement.update();
                }, function () {});
            };
            stage.add(ghosted_name);

            // This is a special line which tells the stage
            // to act as if the user was holding the new cloned node,
            // not the infinite resource.
            stage.heldNode = ghosted_name;
            stage.heldNodeOrigOffset = null;
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            _get(DragPatch.prototype.__proto__ || Object.getPrototypeOf(DragPatch.prototype), 'onmouseleave', this).call(this, pos);
            this.parent.stroke = null;
            SET_CURSOR_STYLE(CONST.CURSOR.DEFAULT);
        }
    }, {
        key: 'delegateToInner',
        get: function get() {
            return true;
        }
    }]);

    return DragPatch;
}(ImageExpr);

// Analogous to 'define' in Scheme.


var DefineExpr = function (_ClampExpr) {
    _inherits(DefineExpr, _ClampExpr);

    function DefineExpr(expr) {
        var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        _classCallCheck(this, DefineExpr);

        //let txt_define = new TextExpr('define');
        //txt_define.color = 'black';
        var txt_input = new Expression([new TextExpr(name ? name : 'foo')]); // TODO: Make this text input field (or dropdown menu).
        txt_input.color = 'Salmon';
        txt_input.radius = 2;
        txt_input.lock();

        var _this5 = _possibleConstructorReturn(this, (DefineExpr.__proto__ || Object.getPrototypeOf(DefineExpr)).call(this, [txt_input, expr]));

        _this5.breakIndices = { top: 1, mid: 2, bot: 2 }; // for ClampExpr
        _this5.color = 'OrangeRed';
        _this5.expr.shadowOffset = -2;
        if (name) _this5.funcname = name;

        _this5.notches = [new WedgeNotch('left', 10, 10, 0.8, true)];

        //this.stage.functions[this.funcname] = this;
        return _this5;
    }

    _createClass(DefineExpr, [{
        key: 'onSnap',
        value: function onSnap(otherNotch, otherExpr, thisNotch) {
            DefineExpr.functions[this.funcname] = this;
            this.stage.functions[this.funcname] = this;
            _get(DefineExpr.prototype.__proto__ || Object.getPrototypeOf(DefineExpr.prototype), 'onSnap', this).call(this, otherNotch, otherExpr, thisNotch);
            if (this.children[0].holes.length === 1) {
                var drag_patch = new DragPatch(0, 0, 42, 52);
                this.children[0].addChild(drag_patch);
                this.children[0].update();
            }
        }
    }, {
        key: 'onDisconnect',
        value: function onDisconnect() {
            if (this.children[0].holes.length > 1) {
                this.children[0].removeChild(this.children[0].children[1]);
            }
        }
    }, {
        key: 'generateNamedExpr',
        value: function generateNamedExpr() {

            var funcname = this.funcname;
            var args = [];
            var numargs = 0;

            if (this.expr instanceof LambdaExpr) numargs = this.expr.numOfNestedLambdas();
            console.log(numargs);
            for (var i = 0; i < numargs; i++) {
                args.push(new MissingExpression());
            } // Return named function (expression).
            //return new NamedExpr(funcname, this, args);

            return new (Function.prototype.bind.apply(NamedFuncExpr, [null].concat([funcname], args)))();
        }
        // get notchPos() {
        //     return { x: this.pos.x, y: this.pos.y + this.radius + (this.size.h - this.radius * 2) * (1 - this.notch.relpos) };
        // }
        // onmousedrag(pos) {
        //     super.onmousedrag(pos);
        //
        //     if (this._attachNode) {
        //         this._attachNode.detachAttachment(this);
        //         this._attachNode = null;
        //     }
        //
        //     const ATTACHMENT_THRESHOLD = 20;
        //     let notchPos = this.notchPos;
        //     let attachmentNodes = this.stage.getRootNodesThatIncludeClass(NewInstanceExpr);
        //     attachmentNodes.forEach((node) => {
        //         if (!node.isAttached()) {
        //             let dist = distBetweenPos(notchPos, node.notchPos);
        //             if (dist < ATTACHMENT_THRESHOLD) {
        //                 node.stroke = { color:'magenta', lineWidth:4 };
        //                 this._attachProspect = node;
        //             } else {
        //                 node.stroke = null;
        //                 if (this._attachProspect && this._attachProspect == node)
        //                     this._attachProspect = null;
        //             }
        //         }
        //     });
        // }
        // onmouseup(pos) {
        //     super.onmouseup(pos);
        //     if (this._attachProspect) { // Snap this function block into the NewInstanceExpr notch:
        //         this._attachProspect.attach(this);
        //         this._attachNode = this._attachProspect;
        //         this._attachProspect = null;
        //     }
        // }

    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            console.log(this);
            return; // disable for now;

            if (this.funcname) {
                this.performReduction();
            } else {
                // For now, prompt the user for a function name:
                var funcname = window.prompt("What do you want to call it?", "foo");
                if (funcname) {
                    this.funcname = funcname.trim();
                    // Check that name has no spaces etc...
                    if (funcname.indexOf(/\s+/g) === -1) {
                        this.performReduction();
                    } else {
                        window.alert("Name can't have spaces. Try again with something simpler."); // cancel
                    }
                }
            }
        }
    }, {
        key: 'reduceCompletely',
        value: function reduceCompletely() {
            return this;
        }
    }, {
        key: 'reduce',
        value: function reduce() {

            return this; // can't reduce a DefineExpr.

            if (!this.expr || this.expr instanceof MissingExpression) return this;else {

                if (this.funcname) {
                    var funcname = this.funcname;
                    var args = [];
                    var numargs = 0;
                    if (this.expr instanceof LambdaExpr) numargs = this.expr.numOfNestedLambdas();
                    for (var i = 0; i < numargs; i++) {
                        args.push(new MissingExpression());
                    } // Return named function (expression).
                    var inf = new InfiniteExpression(new NamedExpr(funcname, this.expr.clone(), args));
                    inf.pos = addPos(this.expr.absolutePos, { x: inf.size.w / 2.0, y: 0 });
                    inf.anchor = { x: 0, y: 0.5 };
                    //inf.pos = { x:this.stage.boundingSize.w, y:this.stage.toolbox.leftEdgePos.y };
                    this.stage.add(inf);
                    inf.update();
                    this.stage.update();
                    this.stage.toolbox.addExpression(inf);

                    Resource.play('define');

                    return inf;
                }

                return this; // cancel
            }
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '(define ' + this.expr.toString() + ' `' + this.funcname + ')';
        }
    }, {
        key: 'name',
        get: function get() {
            return this.funcname;
        }
    }, {
        key: 'expr',
        get: function get() {
            console.log("Called get expr() in DEFINEEXPR ...!!!!");
            //console.trace();
            console.log(this.children[1]);
            return this.children[1];
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.expr.clone()];
        }
    }]);

    return DefineExpr;
}(ClampExpr);

DefineExpr.functions = {};
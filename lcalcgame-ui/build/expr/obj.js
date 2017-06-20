'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * An inner 'play area' to mess around and make programs in.
 * It's a pen because you can't drag expressions _out_!
 */
var PlayPenExpr = function (_ExpressionPlus) {
    _inherits(PlayPenExpr, _ExpressionPlus);

    function PlayPenExpr(name) {
        var numNotches = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

        _classCallCheck(this, PlayPenExpr);

        var txt_input = new Expression([new TextExpr(name ? name : 'obj')]); // TODO: Make this text input field (or dropdown menu).
        txt_input.color = '#B3E389';
        txt_input.radius = 2;
        txt_input.lock();

        var _this = _possibleConstructorReturn(this, (PlayPenExpr.__proto__ || Object.getPrototypeOf(PlayPenExpr)).call(this, [txt_input]));

        _this.padding = { left: 16, top: txt_input.size.h + 4, right: 2, bottom: 10, inner: 8 };

        var pen = new PlayPen(_this.padding.left, _this.padding.top, 220 - _this.padding.left * 2, 120 + 100 * numNotches - _this.padding.top * 2);
        _this.addChild(pen);
        _this.pen = pen;

        _this.color = 'YellowGreen';
        _this.notches = [new WedgeNotch('left', 10, 10, 0.8, true)]; // notch in left side near top.
        _this._origNotchLen = 0.25 * (_this.size.h - _this.radius * 2);

        //new WedgeNotch('left', 10, 10, 0.2, true),
        //new WedgeNotch('right', 10, 10, 0.5, false)];  // for testing

        if (!numNotches || numNotches <= 0) numNotches = 2;

        var inner_hanger = new NotchHangerExpr(numNotches);
        inner_hanger.pos = { x: _this.padding.left, y: 30 };
        inner_hanger.color = _this.color;
        _this.hanger = inner_hanger;

        pen.addToPen(inner_hanger);

        _this.update();
        return _this;
    }

    // 'Define'ing by connecting to notch.


    _createClass(PlayPenExpr, [{
        key: 'setMethods',
        value: function setMethods(defineExprs) {
            var _this2 = this;

            // Used during parse setup, if there's preset methods to attach.
            if (!defineExprs || defineExprs.length === 0) return;
            // Make sure # of notches in hanger matches is enough to attach the number of predefined methods.
            var addedNotchCount = defineExprs.filter(function (e) {
                return e instanceof NotchHangerExpr;
            }).length;
            this.hanger.numNotches = defineExprs.length + addedNotchCount;
            defineExprs = defineExprs.filter(function (e) {
                return e instanceof DefineExpr;
            });
            var lastDef = null;
            defineExprs.forEach(function (e, i) {
                if (!e) {
                    console.warn('@ PlayPenExpr.setMethods: Expression is ', e, ' (Continuing....)');
                } else {
                    _this2.pen.addToPen(e); // Add the DefineExpr to the stage.
                    e.onSnap(_this2.hanger.notches[i], _this2.hanger, e.notches[0], false); // Artifically snap together, and don't animate.
                    e.lock();
                    e.lockSubexpressions();
                    lastDef = e;
                }
            });
            this.update();
        }
    }, {
        key: 'onSnap',
        value: function onSnap(otherNotch, otherExpr, thisNotch) {
            _get(PlayPenExpr.prototype.__proto__ || Object.getPrototypeOf(PlayPenExpr.prototype), 'onSnap', this).call(this, otherNotch, otherExpr, thisNotch);
            if (this.nameExpr.holes.length === 1) {
                var drag_patch = new DragPatch(0, 0, 42, 52);
                this.nameExpr.addChild(drag_patch);
                this.nameExpr.update();
            }
        }
    }, {
        key: 'onDisconnect',
        value: function onDisconnect() {
            if (this.nameExpr.holes.length > 1) {
                this.nameExpr.removeChild(this.nameExpr.children[1]);
            }
        }
    }, {
        key: 'generateNamedExpr',
        value: function generateNamedExpr() {
            var funcname = this.nameExpr.children[0].text;
            var txt = this.nameExpr.children[0].clone();
            txt.fontSize = 22;
            txt._yMultiplier = 3.2;
            txt._xOffset = 10;

            // Return named object (expression).
            var obj = new ObjectExtensionExpr(txt, this.methods);
            obj.color = 'YellowGreen';
            return obj;
        }
    }, {
        key: 'update',
        value: function update() {
            _get(PlayPenExpr.prototype.__proto__ || Object.getPrototypeOf(PlayPenExpr.prototype), 'update', this).call(this);
            this.pen.update();
            this.holes[0].pos = { x: this.holes[0].pos.x, y: this.holes[0].size.h / 2.0 + 2 };
        }
    }, {
        key: 'hitsBottomRightCorner',
        value: function hitsBottomRightCorner(pos) {
            var a = this.absolutePos;
            var sz = this.size;
            return pos.x > a.x + sz.w - this.padding.left * 2 && pos.y > a.y + sz.h - this.padding.top * 2;
        }
    }, {
        key: 'onmousehover',
        value: function onmousehover(pos) {
            _get(PlayPenExpr.prototype.__proto__ || Object.getPrototypeOf(PlayPenExpr.prototype), 'onmousehover', this).call(this, pos);
            if (this.hitsBottomRightCorner(pos)) {
                this.resizing = true;
                this._prev_pos = undefined;
                SET_CURSOR_STYLE(CONST.CURSOR.RESIZE);
            } else {
                SET_CURSOR_STYLE(CONST.CURSOR.DEFAULT);
                this.resizing = false;
            }
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            if (this.resizing) {
                var prev_pos = this._prev_pos || this.pos;
                var len = fromTo(prev_pos, pos);
                this._prev_pos = clonePos(pos);
                this.pen.size = { w: this.pen.size.w + len.x, h: this.pen.size.h + len.y };
                this.notches[0].relpos = 1.0 - this._origNotchLen / this.size.h;
            } else {
                _get(PlayPenExpr.prototype.__proto__ || Object.getPrototypeOf(PlayPenExpr.prototype), 'onmousedrag', this).call(this, pos);

                // if (this._attachNode) {
                //     this._attachNode.detachAttachment(this);
                //     this._attachNode = null;
                // }
                //
                // const ATTACHMENT_THRESHOLD = 20;
                // let notchPos = this.notchPos;
                // let attachmentNodes = this.stage.getRootNodesThatIncludeClass(NewInstanceExpr);
                // attachmentNodes.forEach((node) => {
                //     if (!node.isAttached()) {
                //         let dist = distBetweenPos(notchPos, node.notchPos);
                //         if (dist < ATTACHMENT_THRESHOLD) {
                //             node.stroke = { color:'magenta', lineWidth:4 };
                //             this._attachProspect = node;
                //         } else {
                //             node.stroke = null;
                //             if (this._attachProspect && this._attachProspect == node)
                //                 this._attachProspect = null;
                //         }
                //     }
                // });
            }
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            _get(PlayPenExpr.prototype.__proto__ || Object.getPrototypeOf(PlayPenExpr.prototype), 'onmouseleave', this).call(this, pos);
            SET_CURSOR_STYLE(CONST.CURSOR.DEFAULT);
            this.resizing = false;
        }
        // onmouseup(pos) {
        //     super.onmouseup(pos);
        //     if (this._attachProspect) { // Snap this function block into the NewInstanceExpr notch:
        //         this._attachProspect.attach(this);
        //         this._attachNode = this._attachProspect;
        //         this._attachProspect = null;
        //     }
        // }

    }, {
        key: 'nameExpr',
        get: function get() {
            return this.children[0];
        }
    }, {
        key: 'methods',
        get: function get() {
            var _this3 = this;

            var defined = this.pen.innerStage.getNodesWithClass(DefineExpr).filter(function (e) {
                return e.isSnapped();
            });
            var res = {};

            var _loop = function _loop(i) {
                var e = defined[i];
                var reduce = function reduce(obj) {
                    _this3.lock();
                    return e.generateNamedExpr().reduce();
                };
                res[defined[i].name] = reduce; // for now
            };

            for (var i = 0; i < defined.length; i++) {
                _loop(i);
            }
            return res;
        }
    }, {
        key: 'size',
        get: function get() {
            return { w: this.pen.size.w + this.padding.left * 2, h: this.pen.size.h + this.padding.top + this.padding.bottom };
        },
        set: function set(sz) {
            //super.size = sz;
            this.pen.size = sz;
        }
    }]);

    return PlayPenExpr;
}(ExpressionPlus);

var PlayPenStage = function (_mag$StageNode) {
    _inherits(PlayPenStage, _mag$StageNode);

    function PlayPenStage(x, y, w, h) {
        _classCallCheck(this, PlayPenStage);

        var _this4 = _possibleConstructorReturn(this, (PlayPenStage.__proto__ || Object.getPrototypeOf(PlayPenStage)).call(this, x, y, new ReductStage(null), null));

        _this4._size = { w: w, h: h };
        _this4._isCanvasSetup = false;
        _this4.embeddedStage.color = "gray";
        _this4.shadowOffset = 0;
        return _this4;
    }

    _createClass(PlayPenStage, [{
        key: 'update',
        value: function update() {
            if (!this._isCanvasSetup) {
                if (this.stage) {
                    this.setup(this.embeddedStage, this.stage.canvas);
                    this._isCanvasSetup = true;
                }
            } else {
                _get(PlayPenStage.prototype.__proto__ || Object.getPrototypeOf(PlayPenStage.prototype), 'update', this).call(this);
            }
        }

        // Event bubbling

    }, {
        key: 'ondropenter',
        value: function ondropenter(node, pos) {
            if (this.parent) this.parent.ondropenter(node, pos);
        }
    }, {
        key: 'ondropped',
        value: function ondropped(node, pos) {
            if (this.parent) this.parent.ondropped(node, pos);
        }
    }, {
        key: 'ondropexit',
        value: function ondropexit(node, pos) {
            if (this.parent) this.parent.ondropexit(node, pos);
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            _get(PlayPenStage.prototype.__proto__ || Object.getPrototypeOf(PlayPenStage.prototype), 'onmouseenter', this).call(this, pos);
            if (this.parent) this.parent.onmouseenter(pos);
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            _get(PlayPenStage.prototype.__proto__ || Object.getPrototypeOf(PlayPenStage.prototype), 'onmouseleave', this).call(this, pos);
            if (this.parent) this.parent.onmouseleave(pos);
        }
    }]);

    return PlayPenStage;
}(mag.StageNode);

var PlayPenRect = function (_mag$Rect) {
    _inherits(PlayPenRect, _mag$Rect);

    function PlayPenRect(x, y, w, h) {
        _classCallCheck(this, PlayPenRect);

        var _this5 = _possibleConstructorReturn(this, (PlayPenRect.__proto__ || Object.getPrototypeOf(PlayPenRect)).call(this, x, y, w, h));

        _this5.color = '#444';
        _this5.addChild(new PlayPenStage(0, 0, w / 2, h / 2));
        return _this5;
    }

    return PlayPenRect;
}(mag.Rect);

var PlayPen = function (_mag$RoundedRect) {
    _inherits(PlayPen, _mag$RoundedRect);

    function PlayPen(x, y, w, h) {
        _classCallCheck(this, PlayPen);

        var _this6 = _possibleConstructorReturn(this, (PlayPen.__proto__ || Object.getPrototypeOf(PlayPen)).call(this, x, y, w, h, 12));

        _this6.color = '#444';
        _this6.shadowOffset = -2;

        var pps = new PlayPenStage(0, 0, 200, 200);
        pps.embeddedStage.color = _this6.color;
        _this6.addChild(pps);
        _this6.pps = pps;
        _this6.innerStage = pps.embeddedStage;
        return _this6;
    }

    _createClass(PlayPen, [{
        key: 'addToPen',


        // Basically addChild, but with some extra setup.
        // *Expressions inside the pen cannot be dragged out.*
        value: function addToPen(expr) {

            var SCALE = 0.75;
            expr.scale = { x: SCALE, y: SCALE };
            expr.pos = fromTo(this.absolutePos, expr.absolutePos);

            var stage = this.stage;
            if (!stage) {
                console.warn('@ addToPen: PlayPen not member of a Stage.');
            } else if (!expr.stage || expr.stage != stage) {
                console.warn('@ addToPen: Expression has no stage, a different stage than PlayPen.');
            } else stage.remove(expr);

            this.innerStage.add(expr);
        }

        // Since this area is contained,
        // we won't allow child nodes outside of the container bounds to be hit.

    }, {
        key: 'hits',
        value: function hits(pos, options) {
            if (this.hitsWithin(pos)) {
                return _get(PlayPen.prototype.__proto__ || Object.getPrototypeOf(PlayPen.prototype), 'hits', this).call(this, pos, options);
            } else return false;
        }

        // Clip drawing children to just the inner region.

    }, {
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(ctx, pos, boundingSize) {
            ctx.restore();
            _get(PlayPen.prototype.__proto__ || Object.getPrototypeOf(PlayPen.prototype), 'drawInternalAfterChildren', this).call(this, ctx, pos, boundingSize);
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            _get(PlayPen.prototype.__proto__ || Object.getPrototypeOf(PlayPen.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);
            ctx.save();
            roundRect(ctx, pos.x, pos.y, boundingSize.w, boundingSize.h, this.radius * this.absoluteScale.x, this.color !== null, false, this.stroke ? this.stroke.opacity : null);
            ctx.clip();
        }

        // Graphics

    }, {
        key: 'toggleHighlight',
        value: function toggleHighlight() {
            var on = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (on) this.stroke = { color: 'cyan', lineWidth: 4 };else this.stroke = null;
        }

        // Dropping expressions into the area

    }, {
        key: 'ondropenter',
        value: function ondropenter(node, pos) {
            if (node instanceof Expression && !this.hasChild(node)) this.toggleHighlight(true);
        }
    }, {
        key: 'ondropped',
        value: function ondropped(node, pos) {
            if (node instanceof Expression && !this.hasChild(node)) {
                this.toggleHighlight(false);

                this.addToPen(node);
            }
        }
    }, {
        key: 'ondropexit',
        value: function ondropexit(node, pos) {
            if (node instanceof Expression && !this.hasChild(node)) this.toggleHighlight(false);
        }

        // Dragging container
        // onmouseenter(pos) {
        //     super.onmouseenter(pos);
        //     if (this.parent)
        //         this.parent.onmouseenter(pos);
        // }
        // onmousedrag(pos) {
        //     if (this.parent)
        //         this.parent.onmousedrag(pos);
        // }
        // onmouseup(pos) {
        //     if (this.parent)
        //         this.parent.onmouseup(pos);
        // }

    }, {
        key: 'size',
        get: function get() {
            return _get(PlayPen.prototype.__proto__ || Object.getPrototypeOf(PlayPen.prototype), 'size', this);
        },
        set: function set(sz) {
            _set(PlayPen.prototype.__proto__ || Object.getPrototypeOf(PlayPen.prototype), 'size', sz, this);
            this.pps.setClipWithSize({ w: sz.w, h: sz.h });
        }
    }]);

    return PlayPen;
}(mag.RoundedRect);

/**
 * Any expression with dot notation '.' properties to access.
 * Properties can themselves return objects...
 */


var ObjectExtensionExpr = function (_ExpressionPlus2) {
    _inherits(ObjectExtensionExpr, _ExpressionPlus2);

    function ObjectExtensionExpr(baseExpr, objMethods) {
        _classCallCheck(this, ObjectExtensionExpr);

        var _this7 = _possibleConstructorReturn(this, (ObjectExtensionExpr.__proto__ || Object.getPrototypeOf(ObjectExtensionExpr)).call(this, [baseExpr]));

        _this7.padding = { left: 0, inner: 0, right: 0 }; // don't pad the base expression

        if (!(baseExpr instanceof MissingExpression)) baseExpr.lock();else baseExpr.shadowOffset = -2;

        //this._subexpScale = 1.0; // don't scale subexpressions
        _this7.radius = 8;
        _this7.update();

        // objDefinition follows the format:
        // ---------------------------------
        // {
        //   propertyName:
        //      // Acts as a reduce() function.
        //      function (baseExpr, arg1, ..., argN) {
        //          // do stuff with args...
        //          return transformedExpr;
        //      }
        // }

        var onCellSelect = function onCellSelect(self, cell) {
            // 'this' needs to be late-bound, or else cloning an
            // ObjectExtensionExpr means methods will be called on the
            // wrong object

            //self.setExtension(cell.children[0].text.replace('.', '').split('(')[0], cell.children[0]._reduceMethod);

            var methodText = void 0;
            var origText = cell.children[0].text;
            if (origText === '[..]') methodText = origText;else methodText = origText.replace('.', '').split('(')[0];
            _this7.setExtension(methodText, cell.children[0]._reduceMethod);
        };

        // Make pullout-drawer:
        var drawer = new PulloutDrawer(_this7.size.w, _this7.size.h / 2, 8, 32, objMethods, onCellSelect);
        drawer.anchor = { x: 0, y: 0.32 };
        _this7.addChild(drawer);
        _this7.drawer = drawer;
        _this7.objMethods = objMethods;
        // TBI

        return _this7;
    }

    _createClass(ObjectExtensionExpr, [{
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            _get(ObjectExtensionExpr.prototype.__proto__ || Object.getPrototypeOf(ObjectExtensionExpr.prototype), 'onmousedrag', this).call(this, pos);
            if (this.drawer && this.drawer.isOpen) this.drawer.close();
        }
    }, {
        key: 'clone',
        value: function clone() {
            var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            if (this.drawer) {
                this.removeChild(this.drawer);
                var cln = _get(ObjectExtensionExpr.prototype.__proto__ || Object.getPrototypeOf(ObjectExtensionExpr.prototype), 'clone', this).call(this, parent);
                this.addChild(this.drawer);
                return cln;
            } else {
                var _cln = _get(ObjectExtensionExpr.prototype.__proto__ || Object.getPrototypeOf(ObjectExtensionExpr.prototype), 'clone', this).call(this, parent);
                _cln.holes = [];
                this.holes.forEach(function (hole) {
                    return _cln.holes.push(hole);
                });
                return _cln;
            }
        }
    }, {
        key: 'isCompletelySpecified',
        value: function isCompletelySpecified() {
            if (this.holes[0] instanceof MissingExpression) return false;
            var args = this.methodArgs;
            if (args.length === 0) return true;else return args.reduce(function (p, a) {
                return p && !(a instanceof MissingExpression);
            }, true);
        }
    }, {
        key: 'update',
        value: function update() {
            // if (this.holes.length > 0)
            //     this.holes[0].scale = { x:1, y:1 };
            // if (this._argumentExpressions)
            //     this._argumentExpressions.forEach((e) => {e.scale = {x:0.85, y:0.85}; });
            _get(ObjectExtensionExpr.prototype.__proto__ || Object.getPrototypeOf(ObjectExtensionExpr.prototype), 'update', this).call(this);
            if (this.drawer) {
                this.drawer.pos = { x: this.size.w, y: this.drawer.pos.y };
            }
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: 'canReduce',
        value: function canReduce() {
            //TODO
            return true;
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            console.log('reduce() in ObjectExtensionExpr');
            if (this.holes[0] instanceof MissingExpression) return this;
            if (this.subReduceMethod) {
                var r = void 0;
                var args = this.methodArgs;
                //console.log(args);
                // Reduce the args before calling (call-by-value)
                for (var i = 0; i < args.length; i++) {
                    var arg = args[i];
                    if (arg.canReduce()) {
                        args[i] = arg.reduceCompletely();
                    } else if (!arg.isValue()) {
                        console.warn("Can't call method; argument cannot reduce");
                        return this;
                    }
                }
                var args0 = this.holes[0];
                if (args0.canReduce()) {
                    args0 = args0.reduceCompletely();
                }

                //console.log("args0 && this.holes[0] after reducing");
                //console.log(args0);
                //console.log(this.holes[0]);

                if (args.length > 0) // Add arguments to method call.
                    r = this.subReduceMethod.apply(this, [args0].concat(_toConsumableArray(args)));else r = this.subReduceMethod(args0); // Method doesn't take arguments.
                if (r == args0) return this;else return r;
            } else return this;
        }
    }, {
        key: 'setExtension',
        value: function setExtension(methodText) {
            var subReduceMethod = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var argExprs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            if (this.holes[1]) this.holes.splice(1, 1);

            var isProperty = false;

            if (!subReduceMethod) {
                subReduceMethod = this.objMethods[methodText];
            }

            if ((typeof subReduceMethod === 'undefined' ? 'undefined' : _typeof(subReduceMethod)) === 'object') {
                isProperty = subReduceMethod["isProperty"];
                subReduceMethod = subReduceMethod["reduce"];
            }

            if (!argExprs) {
                var numArgs = subReduceMethod.length - 1;
                argExprs = [];
                while (numArgs > 0) {
                    var me = new MissingExpression();
                    me._size = { w: 44, h: 44 };
                    argExprs.push(me);
                    numArgs--;
                }
            } else if (!Array.isArray(argExprs)) argExprs = [argExprs];

            // Left text
            //let methodtxt = new TextExpr('.' + methodText + '(');
            var pretext = void 0;
            var isIndicesNotation = methodText === '[..]';
            if (isIndicesNotation) pretext = '[';else pretext = '.' + methodText + (isProperty ? '' : '(');

            var methodtxt = new TextExpr(pretext);

            methodtxt.fontSize = 25;
            methodtxt._yMultiplier = 2.85;
            if (!(this.holes[0] instanceof MissingExpression)) {
                methodtxt._xOffset = -15;
                methodtxt._sizeOffset = { w: -15, h: 0 };
                //console.log("WHAT IS THIS?");
                //console.log(this);
                if (this.holes[0] instanceof VtableVarExpr) {
                    methodtxt._xOffset = -5;
                    methodtxt._sizeOffset = { w: -4, h: 0 };
                } else if (this instanceof StringObjectExpr) {
                    methodtxt._xOffset = -5;
                    methodtxt._sizeOffset = { w: -4, h: 0 };
                }
            } else this.holes[0].unlock();
            this.subReduceMethod = subReduceMethod;
            this.addArg(methodtxt);

            // Arguments / closing parentheses
            this._argumentExpressions = argExprs.slice();
            if (argExprs && argExprs.length > 0) {

                this.addArg(argExprs[0]);
                for (var i = 1; i < argExprs.length; i++) {
                    var comma = new TextExpr(','); // comma to separate arguments
                    comma.fontSize = methodtxt.fontSize;
                    comma._yMultiplier = methodtxt._yMultiplier;
                    this.addArg(comma);
                    this.addArg(argExprs[i]);
                }
                //let closingParen = new TextExpr(')'); // comma to separate arguments
                var closingParen = new TextExpr(isIndicesNotation ? ']' : ')'); // comma to separate arguments

                closingParen.fontSize = methodtxt.fontSize;
                closingParen._yMultiplier = methodtxt._yMultiplier;
                this.addArg(closingParen);
            } else if (!isProperty) methodtxt.text += ')'; // just add closing paren.

            this.update();

            // TODO: Add recursive drawers...
            //this.drawer.close(false);

            this.removeChild(this.drawer);
            this.drawer = null;
        }
    }, {
        key: '_setHoleScales',
        value: function _setHoleScales() {
            var _this8 = this;

            this.holes.forEach(function (expr) {
                if (_this8._argumentExpressions && _this8._argumentExpressions.some(function (e) {
                    return e == expr;
                })) expr.scale = { x: 0.7225, y: 0.7225 };else expr.scale = { x: _this8._subexpScale, y: _this8._subexpScale };
                expr.anchor = { x: 0, y: 0.5 };
                expr.update();
            });
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.holes[0].clone(), $.extend(true, {}, this.objMethods)];
        }
    }, {
        key: 'methodArgs',
        get: function get() {
            if (this.holes.length <= 1) return [];else {
                return this.holes.slice(1).filter(function (x) {
                    return !(x instanceof TextExpr);
                }); // everything not text must be an argument...
            }
        }
    }]);

    return ObjectExtensionExpr;
}(ExpressionPlus);

var ArrayObjectExpr = function (_ObjectExtensionExpr) {
    _inherits(ArrayObjectExpr, _ObjectExtensionExpr);

    function ArrayObjectExpr(baseArray) {
        var defaultMethodCall = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var defaultMethodArgs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, ArrayObjectExpr);

        var _this9 = _possibleConstructorReturn(this, (ArrayObjectExpr.__proto__ || Object.getPrototypeOf(ArrayObjectExpr)).call(this, baseArray, { // Reduce methods for the submethods of the object.
            'pop': function pop(arrayExpr) {
                if (arrayExpr.items.length === 0) return arrayExpr; // TODO: This should return undefined.
                var item = arrayExpr.items[arrayExpr.items.length - 1].clone();
                return item;
            },
            'push': function push(arrayExpr, pushedExpr) {

                if (pushedExpr instanceof ArrayObjectExpr) pushedExpr = pushedExpr.holes[0];

                if (!pushedExpr || pushedExpr instanceof MissingExpression || pushedExpr instanceof LambdaVarExpr) return arrayExpr;else {
                    var new_coll = arrayExpr.clone();
                    new_coll.addItem(pushedExpr.clone()); // add item to bag
                    return new_coll; // return new bag with item appended
                }
            },
            'map': function map(arrayExpr, lambdaExpr) {
                var mapped = arrayExpr.map(lambdaExpr);
                if (mapped) {
                    mapped.items = mapped.items.map(function (i) {
                        return i.reduceCompletely();
                    });
                    return mapped;
                } else return arrayExpr;
            },
            'length': {
                'isProperty': true,
                'reduce': function reduce(arrayExpr) {
                    this.isProperty = true;
                    return new (ExprManager.getClass('number'))(arrayExpr.items.length);
                }
            },
            '[..]': function _(arrayExpr, numberExpr) {
                if (!numberExpr || numberExpr instanceof MissingExpression || numberExpr instanceof LambdaVarExpr) {
                    return arrayExpr;
                } else if (numberExpr.number >= arrayExpr.items.length) {
                    return arrayExpr; //TODO: return undefined
                } else {
                    return arrayExpr.items[numberExpr.number].clone();
                }
            },
            'indexOf': function indexOf(arrayExpr, findExpr) {
                if (findExpr instanceof ArrayObjectExpr) findExpr = findExpr.holes[0];

                if (!findExpr || findExpr instanceof MissingExpression || findExpr instanceof LambdaVarExpr) return arrayExpr;else {
                    var index = arrayExpr.items.indexOf(findExpr);
                    alert(index);
                }
            }
        }));

        if (baseArray instanceof CollectionExpr) baseArray.disableSpill();
        _this9.color = 'YellowGreen';

        if (!defaultMethodCall) {} else if (defaultMethodCall in _this9.objMethods) {
            _this9.setExtension(defaultMethodCall, null, defaultMethodArgs); // TODO: method args
        } else {
            console.error('@ ArrayObjectExpr: Method call ' + defaultMethodCall + ' not a possible member of the object.');
        }

        _this9.defaultMethodCall = defaultMethodCall;
        _this9.defaultMethodArgs = defaultMethodArgs;
        _this9.baseArray = baseArray;
        return _this9;
    }

    _createClass(ArrayObjectExpr, [{
        key: 'reduce',
        value: function reduce() {
            var r = _get(ArrayObjectExpr.prototype.__proto__ || Object.getPrototypeOf(ArrayObjectExpr.prototype), 'reduce', this).call(this);
            if (r != this && r instanceof BracketArrayExpr) {
                return new ArrayObjectExpr(r); // if reduce value is itself an array, make it an Array object that the user can apply methods to.
            }
            return r;
        }
    }, {
        key: 'canReduce',
        value: function canReduce() {
            //TODO
            return true;
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.holes[0].clone(), this.defaultMethodCall, this.defaultMethodArgs];
        }
    }]);

    return ArrayObjectExpr;
}(ObjectExtensionExpr);

var DropdownCell = function (_mag$Rect2) {
    _inherits(DropdownCell, _mag$Rect2);

    function DropdownCell(x, y, w, h, subexpr, onclick, color, highlightColor) {
        _classCallCheck(this, DropdownCell);

        var _this10 = _possibleConstructorReturn(this, (DropdownCell.__proto__ || Object.getPrototypeOf(DropdownCell)).call(this, x, y, w, h));

        _this10.shadowOffset = 0;
        _this10.color = color;
        _this10.origColor = color;
        _this10.highlightColor = highlightColor;
        if (subexpr instanceof Expression) {
            if (subexpr instanceof TextExpr) {
                subexpr.pos = { x: w / 20, y: h / 2 + 22 / 4 };
                subexpr.fontSize = 22;
            }
            _this10.addChild(subexpr);
        }
        _this10.onclick = onclick;
        return _this10;
    }

    _createClass(DropdownCell, [{
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            this.color = this.highlightColor;
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            if (this.onclick) this.onclick(this);
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            this.color = this.origColor;
        }
    }]);

    return DropdownCell;
}(mag.Rect);

var DropdownSelect = function (_mag$Rect3) {
    _inherits(DropdownSelect, _mag$Rect3);

    function DropdownSelect(x, y, cellW, cellH, exprs, onCellClick, lowColor, highColor, highlightColor) {
        var startExpanded = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : true;

        _classCallCheck(this, DropdownSelect);

        var _this11 = _possibleConstructorReturn(this, (DropdownSelect.__proto__ || Object.getPrototypeOf(DropdownSelect)).call(this, x, y, cellW, startExpanded ? cellH * exprs.length : cellH));

        _this11.highColor = highColor;
        _this11.lowColor = lowColor;

        // Create cells + add:
        _this11.cells = [];
        var cellX = 0;
        var cellY = 0;
        for (var i = 0; i < exprs.length; i++) {
            var cellColor = i % 2 === 0 ? lowColor : highColor;
            var onclick = function onclick(cell) {
                return _this11.clicked(cell);
            };
            var cell = new DropdownCell(cellX, cellY, cellW, cellH, exprs[i], onclick, cellColor, highlightColor);
            _this11.cells.push(cell);
            if (startExpanded || i === 0) _this11.addChild(cell);
            cellY += cellH;
        }

        _this11.onCellClick = onCellClick;
        return _this11;
    }

    _createClass(DropdownSelect, [{
        key: 'relayoutCells',
        value: function relayoutCells() {
            var _this12 = this;

            var cellX = 0;
            var cellY = 0;
            this.cells.forEach(function (c, i) {
                c.origColor = c.color = i % 2 === 0 ? _this12.lowColor : _this12.highColor;
                c.pos = { x: cellX, y: cellY };
                cellY += c.size.h;
            });
        }
    }, {
        key: 'resize',
        value: function resize() {
            var cellsize = this.children[0].size;
            this.size = { w: cellsize.w, h: cellsize.h * this.children.length };
        }
    }, {
        key: 'expand',
        value: function expand() {
            var _this13 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (this.cells.length <= 1) {} else if (animated) {
                var FADE_TIME = 100;
                var waittime = 0;
                this.cells.slice(1).forEach(function (c, i) {
                    c.opacity = 0;
                    Animate.wait(waittime).after(function () {
                        Animate.tween(c, { opacity: 1.0 }, FADE_TIME, function (e) {
                            _this13.stage.draw();
                            return e;
                        }).after(function () {
                            c.opacity = 1.0;
                            _this13.resize();
                            _this13.stage.draw();
                        });
                    });
                    waittime += FADE_TIME;
                    _this13.children[i + 1] = c;
                });
            } else {
                this.children = this.cells.slice();
                this.relayoutCells();
                this.resize();
                this.stage.draw();
            }
            this._expanded = true;
        }
    }, {
        key: 'close',
        value: function close() {
            this.children = this.cells.slice(0, 1);
            this.resize();
            this.relayoutCells();
            this.stage.draw();
            this._expanded = false;
        }
    }, {
        key: 'clicked',
        value: function clicked(cell) {
            var cellIdx = this.cells.indexOf(cell);
            if (cellIdx < 0 || cellIdx >= this.cells.length) {
                console.error('@ DropdownSelect: Cell index out of range.');
                return;
            } else if (!this._expanded) {
                // closed. do nothing
                this.expand(false);
                return;
            }

            // Move clicked cell to front of array.
            var clickedCell = this.cells.splice(cellIdx, 1)[0];
            this.cells.splice(0, 0, clickedCell);

            // Close select
            this.close();

            // Fire callback
            if (this.onCellClick) this.onCellClick(this.parent.parent, cell);
        }
    }]);

    return DropdownSelect;
}(mag.Rect);

var PulloutDrawerHandle = function (_mag$ImageRect) {
    _inherits(PulloutDrawerHandle, _mag$ImageRect);

    function PulloutDrawerHandle(x, y, w, h, onclick) {
        _classCallCheck(this, PulloutDrawerHandle);

        var _this14 = _possibleConstructorReturn(this, (PulloutDrawerHandle.__proto__ || Object.getPrototypeOf(PulloutDrawerHandle)).call(this, x, y, w, h, 'pullout-drawer-handle'));

        _this14.onclick = onclick;
        return _this14;
    }

    // Events


    _createClass(PulloutDrawerHandle, [{
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            _get(PulloutDrawerHandle.prototype.__proto__ || Object.getPrototypeOf(PulloutDrawerHandle.prototype), 'onmouseenter', this).call(this, pos);
            SET_CURSOR_STYLE(CONST.CURSOR.HAND); // col-resize is another option
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            if (this.onclick) this.onclick();
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            _get(PulloutDrawerHandle.prototype.__proto__ || Object.getPrototypeOf(PulloutDrawerHandle.prototype), 'onmouseleave', this).call(this, pos);
            SET_CURSOR_STYLE(CONST.CURSOR.DEFAULT);
        }
    }]);

    return PulloutDrawerHandle;
}(mag.ImageRect);

var PulloutDrawer = function (_mag$Rect4) {
    _inherits(PulloutDrawer, _mag$Rect4);

    function PulloutDrawer(x, y, w, h, propertyTree, onCellSelect) {
        _classCallCheck(this, PulloutDrawer);

        var _this15 = _possibleConstructorReturn(this, (PulloutDrawer.__proto__ || Object.getPrototypeOf(PulloutDrawer)).call(this, x, y, w, h));

        _this15.color = null;

        var onclick = function onclick() {
            if (_this15.isOpen) _this15.close();else _this15.open();
        };

        var cellBg = new mag.Rect(0, 0, 0, h);
        cellBg.color = "Green";
        cellBg.ignoreEvents = true;
        _this15.addChild(cellBg);
        _this15.cellBg = cellBg;

        var handle = new PulloutDrawerHandle(0, 0, w, h, onclick);
        _this15.addChild(handle);
        _this15.handle = handle;

        // Generate TextExpr for each property:
        var txts = [];
        for (var key in propertyTree) {
            if (propertyTree.hasOwnProperty(key)) {
                var str = void 0;
                var f = propertyTree[key];
                if ((typeof f === 'undefined' ? 'undefined' : _typeof(f)) === 'object' && f.isProperty) {
                    str = '.' + key;
                } else if (key === '[..]') {
                    str = key;
                } else if (typeof f === 'function' && f.length > 1) {
                    str = '.' + key + '(..)';
                } else {
                    str = '.' + key + '()';
                }
                var t = new TextExpr(str);
                t.ignoreEvents = true;
                t._reduceMethod = f;
                txts.push(t);
            }
        }
        _this15.txts = txts;
        _this15.onCellSelect = onCellSelect;
        return _this15;
    }

    // Open the drawer


    _createClass(PulloutDrawer, [{
        key: 'open',
        value: function open() {
            var _this16 = this;

            var DUR = 300;
            var W = 130;
            var cellsize = this.cellBg.size;
            var smoothFunc = function smoothFunc(e) {
                return Math.pow(e, 2);
            };
            Animate.tween(this.cellBg, { size: { w: W, h: cellsize.h } }, DUR, smoothFunc);
            Animate.tween(this.handle, { pos: { x: W, y: 0 } }, DUR, smoothFunc);
            Animate.wait(DUR).after(function () {

                // Open the dropdown box.
                var dropdown = new DropdownSelect(0, 0, W, cellsize.h, _this16.txts, _this16.onCellSelect, "YellowGreen", "MediumSeaGreen", "PaleGreen", false);
                _this16.addChild(dropdown);
                _this16.dropdown = dropdown;
                dropdown.expand(true);
            });
            Resource.play('drawer-open');
            this.isOpen = true;
        }

        // Close the drawer

    }, {
        key: 'close',
        value: function close() {
            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            this.removeChild(this.dropdown);
            if (animated) {
                var DUR = 200;
                Animate.tween(this.cellBg, { size: { w: 0, h: this.cellBg.size.h } }, DUR);
                Animate.tween(this.handle, { pos: { x: 0, y: 0 } }, DUR);
                Resource.play('drawer-close');
            } else {
                this.cellBg.size = { w: 0, h: this.cellBg.size.h };
                this.handle.pos = zeroPos();
            }
            this.isOpen = false;
        }
    }]);

    return PulloutDrawer;
}(mag.Rect);
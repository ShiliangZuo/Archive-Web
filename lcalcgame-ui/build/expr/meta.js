'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// An infinite resource.
// Wraps around an existing expression.
var InfiniteExpression = function (_GraphicValueExpr) {
    _inherits(InfiniteExpression, _GraphicValueExpr);

    function InfiniteExpression(expr) {
        _classCallCheck(this, InfiniteExpression);

        expr.update();

        // Inifinity symbol.
        var _this2 = _possibleConstructorReturn(this, (InfiniteExpression.__proto__ || Object.getPrototypeOf(InfiniteExpression)).call(this, expr.clone()));

        var c = new mag.Circle(0, 0, 14);
        var inf = new mag.ImageRect('infinity-symbol');
        c.color = '#0D0';
        c.pos = { x: expr.size.w - 7, y: 0 };
        c.anchor = { x: 0.5, y: 0.5 };
        inf.anchor = { x: 0.5, y: 0.5 };
        inf.pos = { x: c.size.w / 2, y: c.size.h / 2 };
        c.addChild(inf);
        _this2.inf = c;
        return _this2;
    }

    _createClass(InfiniteExpression, [{
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            _get(InfiniteExpression.prototype.__proto__ || Object.getPrototypeOf(InfiniteExpression.prototype), 'onmouseenter', this).call(this, pos);
            this.inf.stroke = { color: 'orange', lineWidth: 2 };
            this.inf.color = 'purple';
        }
    }, {
        key: 'onmousehover',
        value: function onmousehover(pos) {
            _get(InfiniteExpression.prototype.__proto__ || Object.getPrototypeOf(InfiniteExpression.prototype), 'onmousehover', this).call(this, pos);
            this.cursorPos = pos;
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            _get(InfiniteExpression.prototype.__proto__ || Object.getPrototypeOf(InfiniteExpression.prototype), 'onmouseleave', this).call(this, pos);
            this.inf.stroke = null;
            this.inf.color = '#0D0';
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {

            // On drag, clone the wrapped expression
            // and let the user drag the clone.
            var c = this.graphicNode.clone();
            this.stage.add(c);
            Resource.play('place');
            c.onmouseenter(pos);
            c.onmousedrag(pos);
            //c.pos =  { x:c.size.w, y:0 };
            c.anchor = { x: 0.5, y: 0.5 };
            c.pos = this.cursorPos;

            this.onmouseleave(pos);

            // This is a special line which tells the stage
            // to act as if the user was holding the new cloned node,
            // not the infinite resource.
            this.stage.heldNode = c;
            this.stage.heldNodeOrigOffset = null;
        }
    }, {
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(ctx, pos, boundingSize) {
            _get(InfiniteExpression.prototype.__proto__ || Object.getPrototypeOf(InfiniteExpression.prototype), 'drawInternalAfterChildren', this).call(this, ctx, pos, boundingSize);

            ctx.save();
            this.inf.parent = this;
            this.inf.draw(ctx);
            ctx.restore();
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '(inf ' + this.graphicNode.toString() + ')';
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.graphicNode.clone()];
        }
    }, {
        key: 'color',
        get: function get() {
            return _get(InfiniteExpression.prototype.__proto__ || Object.getPrototypeOf(InfiniteExpression.prototype), 'color', this);
        },
        set: function set(clr) {
            this._color = clr;
        }
    }]);

    return InfiniteExpression;
}(GraphicValueExpr);

// A game within a game...
// Wraps around a Reduct stage.


var ReductStageExpr = function (_GraphicValueExpr2) {
    _inherits(ReductStageExpr, _GraphicValueExpr2);

    function ReductStageExpr(goal, board, toolbox) {
        _classCallCheck(this, ReductStageExpr);

        // The inputs can be either arrays or expressions, so let's cast them all into arrays:
        if (!Array.isArray(goal)) goal = [goal];
        if (!Array.isArray(board)) board = [board];
        if (!Array.isArray(toolbox)) toolbox = [toolbox];

        // Delay building the stage until after we have a parent...

        var _this3 = _possibleConstructorReturn(this, (ReductStageExpr.__proto__ || Object.getPrototypeOf(ReductStageExpr)).call(this, new Expression()));

        _this3.initialExprs = [goal, board, toolbox];
        _this3.ignoreEvents = false;
        return _this3;
    }

    _createClass(ReductStageExpr, [{
        key: 'build',
        value: function build() {

            // Get the parent's stage:
            var parentStage = this.parent.stage;
            if (!parentStage) {
                console.error('@ ReductStageExpr.build: Parent has no Stage.');
                return;
            }

            // Get the setup exprs:
            if (!this.initialExprs) {
                console.error('@ ReductStageExpr.build: No initial expressions.');
                return;
            }
            var goal = this.initialExprs[0];
            var board = this.initialExprs[1];
            var toolbox = this.initialExprs[2];

            // Create the inner stage:
            var lvl = new Level(board, new Goal(new ExpressionPattern(goal)), toolbox);
            var innerStage = lvl.build(parentStage.canvas);
            var v = new MetaInnerExpression(0, 0, parentStage, innerStage);

            // Repair the pointers:
            this.children[0] = v;
            this.holes[0] = v;
        }
    }, {
        key: 'onmousedown',
        value: function onmousedown(pos) {
            if (this.innerStage.expanded) this.innerStage.onmousedown(pos);else _get(ReductStageExpr.prototype.__proto__ || Object.getPrototypeOf(ReductStageExpr.prototype), 'onmousedown', this).call(this, pos);
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            if (this.innerStage.expanded) this.innerStage.onmousedrag(pos);else _get(ReductStageExpr.prototype.__proto__ || Object.getPrototypeOf(ReductStageExpr.prototype), 'onmousedrag', this).call(this, pos);
        }
    }, {
        key: 'onmousehover',
        value: function onmousehover(pos) {
            this.innerStage.onmousehover(pos);
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            if (this.graphicNode.expanded) this.graphicNode.shrink();else this.graphicNode.expand();
        }
    }, {
        key: 'clone',
        value: function clone() {
            return null;
        }
    }, {
        key: 'hits',
        value: function hits(pos, options) {
            if (this.ignoreEvents) return null;
            var hitChild = this.hitsChild(pos, options);
            if (hitChild) return hitChild;

            // Hasn't hit any children, so test if the point lies on this node.
            return this.hitsWithin(pos);
        }
    }, {
        key: 'delegateToInner',
        get: function get() {
            return false;
        }
    }, {
        key: 'innerStage',
        get: function get() {
            return this.children[0];
        }
    }]);

    return ReductStageExpr;
}(GraphicValueExpr);

var MetaInnerExpression = function (_mag$Rect) {
    _inherits(MetaInnerExpression, _mag$Rect);

    function MetaInnerExpression(x, y, parentStage, levelStage) {
        _classCallCheck(this, MetaInnerExpression);

        var canvas = parentStage.canvas;
        var substage = new mag.StageNode(0, 0, levelStage, canvas);
        substage.anchor = { x: 0, y: 0 };
        substage.canvas = null;
        parentStage.canvas = null;
        parentStage.canvas = canvas;

        substage.clip = { l: 0.14, r: 0.22, t: 0, b: 0.11 };
        var sz = levelStage.boundingSize;
        sz.w *= substage.clip.r - substage.clip.l;
        sz.h *= substage.clip.b - substage.clip.t;

        substage.pos = { x: 0, y: 0 };

        var _this4 = _possibleConstructorReturn(this, (MetaInnerExpression.__proto__ || Object.getPrototypeOf(MetaInnerExpression)).call(this, x, y, sz.w, sz.h));

        _this4.ignoreEvents = true;

        _this4.addChild(substage);
        _this4.substage = substage;
        //this.anchor = { x:0.5, y:0.5 };
        return _this4;
    }

    // get size() {
    //     if (false && this.substage) {
    //         let substage = this.substage;
    //         let sz = substage.boundingSize;
    //         sz.w *= (substage.clip.r - substage.clip.l);
    //         sz.h *= (substage.clip.b - substage.clip.t);
    //         return sz;
    //     }
    //     else return super.size;
    // }

    _createClass(MetaInnerExpression, [{
        key: 'onmousedown',
        value: function onmousedown(pos) {
            this.substage.onmousedown(pos);
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            this.substage.onmousedrag(pos);
        }
    }, {
        key: 'onmousehover',
        value: function onmousehover(pos) {
            this.substage.onmousehover(pos);
        }
    }, {
        key: 'expand',
        value: function expand() {
            var _this = this;
            this.expanded = true;
            var sz = { w: this.substage.embeddedStage.boundingSize.w, h: this.substage.embeddedStage.boundingSize.h };
            //let sz2 = { w:sz.w*1.02, h:sz.h*1.02 };
            Animate.tween(this, { size: sz }, 800, function (e) {
                return Math.pow(e, 2);
            }).after(function () {
                //Animate.tween(this, { size:sz }, 100);
            });
            Animate.tween(this.substage, { clip: { l: 0, r: 1, t: 0, b: 1 } }, 800, function (e) {
                return Math.pow(e, 2);
            }).after(function () {});
            //Animate.tween(this.substage, { pos:{x:sz.w/2, y:sz.h/2} }, 1000, (e) => Math.pow(e, 2));
            //this.ignoreEvents = false;
        }
    }, {
        key: 'shrink',
        value: function shrink() {
            this.expanded = false;
            var substage = this.substage;
            var clip = { l: 0.14, r: 0.22, t: 0, b: 0.11 };
            var sz = substage.embeddedStage.boundingSize;
            // this.substage.pos = {x:sz.w/2, y:sz.h/2};
            sz.w *= clip.r - clip.l;
            sz.h *= clip.b - clip.t;
            //Animate.drawUntil(this.stage, () => (false));
            Animate.tween(this, { size: sz }, 1000, function (e) {
                return Math.pow(e, 2);
            });
            Animate.tween(this.substage, { clip: clip }, 1000, function (e) {
                return Math.pow(e, 2);
            });
            //Animate.tween(this.substage, { pos:{x:sz.w/2, y:sz.h/2} }, 1000, (e) => Math.pow(e, 2));
        }

        /*drawInternal(ctx, pos, boundingSize) {
            ctx.save();
            ctx.rect(pos.x, pos.y, boundingSize.w, boundingSize.h);
            ctx.clip();
        }
        drawInternalAfterChildren(ctx, pos, boundingSize) {
            ctx.restore();
        }*/

    }, {
        key: 'size',
        get: function get() {
            return { w: this._size.w, h: this._size.h };
        },
        set: function set(sz) {
            if (sz) {
                this._size = { w: sz.w, h: sz.h };
                if (this.parent) this.parent.update();
            }
        }
    }]);

    return MetaInnerExpression;
}(mag.Rect);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ApplyExpr = function (_Expression) {
    _inherits(ApplyExpr, _Expression);

    function ApplyExpr(exprToApply, lambdaExpr) {
        _classCallCheck(this, ApplyExpr);

        var _this = _possibleConstructorReturn(this, (ApplyExpr.__proto__ || Object.getPrototypeOf(ApplyExpr)).call(this, [exprToApply, lambdaExpr]));

        _this.lambdaExpr.pos = { x: 0, y: 0 };
        _this.exprToApply.pos = addPos(_this.lambdaExpr.pos, { x: -exprToApply.size.w, y: -exprToApply.size.h / 2 });

        _this.shadowOffset = 2;

        var applyDepth = function applyDepth(n, expr) {
            if (expr instanceof ApplyExpr) return applyDepth(n + 1, expr.exprToApply);else return n;
        };
        var levels_deep = applyDepth(0, _this.exprToApply);
        _this.color = colorFrom255(Math.max(0, 180 + levels_deep * 40));

        _this.exprToApply.lock();
        _this.lambdaExpr.lock();

        var arrow = new ImageExpr(0, 0, 97 / 1.6, 60 / 1.6, 'apply-arrow');
        arrow.lock();
        _this.arrow = arrow;
        _this.arrow.opacity = 1;

        // Brackets
        var lbrak = new TextExpr('[');
        lbrak.color = '#fff';
        var rbrak = lbrak.clone();
        rbrak.text = ']';
        _this.lbrak = lbrak;
        _this.rbrak = rbrak;

        // Bg
        var bg = new mag.Rect(0, 0, _this.exprToApply.size.w, _this.exprToApply.size.h);
        bg.shadowOffset = 0;
        bg.color = 'pink';
        _this.bg = bg;
        return _this;
    }

    _createClass(ApplyExpr, [{
        key: 'performApply',
        value: function performApply() {
            var stg = this.stage;
            var lambda = this.lambdaExpr;
            this.exprToApply.opacity = 1.0;
            this.lambdaExpr.applyExpr(this.exprToApply);
            (this.parent || stg).swap(this, this.lambdaExpr);
            var res = this.lambdaExpr.clone();
            this.lambdaExpr.performReduction();
            return res;
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            var _this2 = this;

            this.lambdaExpr.hole.ondropenter(this.exprToApply);
            //Animate.tween( this.arrow, {opacity:0}, 200 );
            Animate.wait(500).after(function () {
                _this2.performApply();
                if (_this2.stage) {
                    _this2.stage.update();
                    _this2.stage.draw();
                }
            });
        }
    }, {
        key: 'hitsChild',
        value: function hitsChild() {
            return null;
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {

            _get(ApplyExpr.prototype.__proto__ || Object.getPrototypeOf(ApplyExpr.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);

            // this.bg.parent = this;
            // this.bg.pos = { x:this.lbrak.size.w/2.0, y:this.rbrak.size.h*0.35/2.0 };
            // this.bg.size = { w:this.exprToApply.size.w-this.lbrak.size.w/2.0, h:this.rbrak.size.h*0.65 };
            // this.bg.draw(ctx);

            this.lbrak.parent = this;
            this.lbrak.pos = { x: 0, y: this.lbrak.size.h / 1.4 };
            this.lbrak.draw(ctx);

            this.rbrak.parent = this;
            this.rbrak.pos = { x: this.exprToApply.size.w * this.exprToApply.scale.x, y: this.lbrak.pos.y };
            this.rbrak.draw(ctx);
        }
    }, {
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(ctx, pos, boundingSize) {
            this.arrow.parent = this;
            this.arrow.pos = { x: this.lambdaExpr.pos.x - this.lambdaExpr.hole.absoluteSize.w / 3, y: -16 };
            this.arrow.draw(ctx);
        }

        //update() { }

    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.exprToApply.clone(), this.lambdaExpr.clone()];
        }
    }, {
        key: 'exprToApply',
        get: function get() {
            return this.children[0];
        }
    }, {
        key: 'lambdaExpr',
        get: function get() {
            return this.children[1];
        }
    }]);

    return ApplyExpr;
}(Expression);
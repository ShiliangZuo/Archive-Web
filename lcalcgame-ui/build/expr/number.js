'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Integers
var NumberExpr = function (_Expression) {
    _inherits(NumberExpr, _Expression);

    function NumberExpr(num) {
        _classCallCheck(this, NumberExpr);

        var _this = _possibleConstructorReturn(this, (NumberExpr.__proto__ || Object.getPrototypeOf(NumberExpr)).call(this, [new DiceNumber(num)]));

        _this.number = num;
        _this.color = 'Ivory';
        _this.highlightColor = 'OrangeRed';
        return _this;
    }

    _createClass(NumberExpr, [{
        key: 'value',
        value: function value() {
            return this.number;
        }
    }, {
        key: 'isValue',
        value: function isValue() {
            return true;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return (this.locked ? '/' : '') + this.number.toString();
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            // We can't really reduce, let's see if our parent wants to
            if (this.parent) {
                this.parent.onmouseclick(pos);
            }
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.number];
        }
    }]);

    return NumberExpr;
}(Expression);

var FadedNumberExpr = function (_NumberExpr) {
    _inherits(FadedNumberExpr, _NumberExpr);

    function FadedNumberExpr(num) {
        _classCallCheck(this, FadedNumberExpr);

        var _this2 = _possibleConstructorReturn(this, (FadedNumberExpr.__proto__ || Object.getPrototypeOf(FadedNumberExpr)).call(this, num));

        _this2.children = [];
        _this2.holes = [];
        _this2.addArg(new TextExpr(num.toString()));
        return _this2;
    }

    return FadedNumberExpr;
}(NumberExpr);

var OperatorExpr = function (_Expression2) {
    _inherits(OperatorExpr, _Expression2);

    function OperatorExpr(left, op, right) {
        _classCallCheck(this, OperatorExpr);

        if (left instanceof MissingExpression && !(left instanceof MissingNumberExpression)) left = new MissingNumberExpression();
        if (right instanceof MissingExpression && !(right instanceof MissingNumberExpression)) right = new MissingNumberExpression();
        return _possibleConstructorReturn(this, (OperatorExpr.__proto__ || Object.getPrototypeOf(OperatorExpr)).call(this, [left, op, right]));
    }

    _createClass(OperatorExpr, [{
        key: 'canReduce',
        value: function canReduce() {
            return this.leftExpr && (this.leftExpr.isValue() || this.leftExpr.canReduce()) && this.rightExpr && (this.rightExpr.isValue() || this.rightExpr.canReduce());
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            var _this4 = this;

            return this.performSubReduction(this.leftExpr).then(function (left) {
                if (!(left instanceof NumberExpr)) {
                    return Promise.reject();
                }
                return _this4.performSubReduction(_this4.rightExpr).then(function (right) {
                    if (!(right instanceof NumberExpr)) {
                        return Promise.reject();
                    }

                    var stage = _this4.stage;

                    var val = _get(OperatorExpr.prototype.__proto__ || Object.getPrototypeOf(OperatorExpr.prototype), 'performReduction', _this4).call(_this4);
                    stage.update();
                    return val;
                });
            });
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            //this.performUserReduction();
            console.log("clicked Operator Expression!!");
            if (!this._animating) {
                this.performReduction();
            }
        }
    }, {
        key: 'toString',
        value: function toString() {
            return (this.locked ? '/(' : '(') + this.op.toString() + ' ' + this.leftExpr.toString() + ' ' + this.rightExpr.toString() + ')';
        }
    }, {
        key: 'leftExpr',
        get: function get() {
            return this.holes[0];
        }
    }, {
        key: 'rightExpr',
        get: function get() {
            return this.holes[2];
        }
    }, {
        key: 'op',
        get: function get() {
            return this.holes[1];
        }
    }]);

    return OperatorExpr;
}(Expression);

var AddExpr = function (_OperatorExpr) {
    _inherits(AddExpr, _OperatorExpr);

    function AddExpr(left, right) {
        _classCallCheck(this, AddExpr);

        var op = new TextExpr("+");
        return _possibleConstructorReturn(this, (AddExpr.__proto__ || Object.getPrototypeOf(AddExpr)).call(this, left, op, right));
    }

    _createClass(AddExpr, [{
        key: 'reduce',
        value: function reduce() {
            if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
                return new (ExprManager.getClass('number'))(this.leftExpr.value() + this.rightExpr.value());
            } else {
                return this;
            }
        }
    }]);

    return AddExpr;
}(OperatorExpr);

var SubtractionExpr = function (_OperatorExpr2) {
    _inherits(SubtractionExpr, _OperatorExpr2);

    function SubtractionExpr(left, right) {
        _classCallCheck(this, SubtractionExpr);

        var op = new TextExpr("-");
        return _possibleConstructorReturn(this, (SubtractionExpr.__proto__ || Object.getPrototypeOf(SubtractionExpr)).call(this, left, op, right));
    }

    _createClass(SubtractionExpr, [{
        key: 'reduce',
        value: function reduce() {
            if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
                return new (ExprManager.getClass('number'))(this.leftExpr.value() - this.rightExpr.value());
            } else {
                return this;
            }
        }
    }]);

    return SubtractionExpr;
}(OperatorExpr);

var MultiplicationExpr = function (_OperatorExpr3) {
    _inherits(MultiplicationExpr, _OperatorExpr3);

    function MultiplicationExpr(left, right) {
        _classCallCheck(this, MultiplicationExpr);

        var op = new TextExpr("*");
        return _possibleConstructorReturn(this, (MultiplicationExpr.__proto__ || Object.getPrototypeOf(MultiplicationExpr)).call(this, left, op, right));
    }

    _createClass(MultiplicationExpr, [{
        key: 'reduce',
        value: function reduce() {
            if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
                return new (ExprManager.getClass('number'))(this.leftExpr.value() * this.rightExpr.value());
            } else {
                return this;
            }
        }
    }]);

    return MultiplicationExpr;
}(OperatorExpr);

var DivisionExpr = function (_OperatorExpr4) {
    _inherits(DivisionExpr, _OperatorExpr4);

    function DivisionExpr(left, right) {
        _classCallCheck(this, DivisionExpr);

        var op = new TextExpr("/");
        return _possibleConstructorReturn(this, (DivisionExpr.__proto__ || Object.getPrototypeOf(DivisionExpr)).call(this, left, op, right));
    }

    _createClass(DivisionExpr, [{
        key: 'reduce',
        value: function reduce() {
            if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
                console.log("reducing division expression");
                var result = parseInt(this.leftExpr.value() / this.rightExpr.value());
                return new (ExprManager.getClass('number'))(result);
            } else {
                console.log("reduce failed!!");
                return this;
            }
        }
    }]);

    return DivisionExpr;
}(OperatorExpr);

/*class AddExpr extends Expression {
    constructor(left, right) {
        let op = new TextExpr("+");
        if (left instanceof MissingExpression && !(left instanceof MissingNumberExpression))
            left = new MissingNumberExpression();
        if (right instanceof MissingExpression && !(right instanceof MissingNumberExpression))
            right = new MissingNumberExpression();
        super([left, op, right]);
    }

    canReduce() {
        return this.leftExpr && (this.leftExpr.isValue() || this.leftExpr.canReduce()) &&
            this.rightExpr && (this.rightExpr.isValue() || this.rightExpr.canReduce());
    }

    get leftExpr() {
        return this.holes[0];
    }

    get rightExpr() {
        return this.holes[2];
    }

    reduce() {
        if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
            return new (ExprManager.getClass('number'))(this.leftExpr.value() + this.rightExpr.value());
        }
        else {
            return this;
        }
    }

    performReduction() {
        return this.performSubReduction(this.leftExpr).then((left) => {
            if (!(left instanceof NumberExpr)) {
                return Promise.reject();
            }
            return this.performSubReduction(this.rightExpr).then((right) => {
                if (!(right instanceof NumberExpr)) {
                    return Promise.reject();
                }

                let stage = this.stage;

                let val = super.performReduction();
                stage.update();
                return val;
            });
        });
    }

    onmouseclick() {
        this.performUserReduction();
    }

    toString() {
        return (this.locked ? '/' : '') + '(+ ' + this.leftExpr.toString() + ' ' + this.rightExpr.toString() + ')';
    }
}*/

// Draws the circles for a dice number inside its boundary.


var DiceNumber = function (_mag$Rect) {
    _inherits(DiceNumber, _mag$Rect);

    _createClass(DiceNumber, null, [{
        key: 'drawPositionsFor',
        value: function drawPositionsFor(num) {
            var L = 0.15;
            var T = L;
            var R = 1.0 - L;
            var B = R;
            var M = 0.5;
            var map = {
                0: [],
                1: [{ x: M, y: M }],
                2: [{ x: L, y: T }, { x: R, y: B }],
                3: [{ x: R, y: T }, { x: M, y: M }, { x: L, y: B }],
                4: [{ x: L, y: T }, { x: R, y: T }, { x: R, y: B }, { x: L, y: B }],
                5: [{ x: L, y: T }, { x: R, y: T }, { x: R, y: B }, { x: L, y: B }, { x: M, y: M }],
                6: [{ x: L, y: T }, { x: R, y: T }, { x: R, y: M }, { x: R, y: B }, { x: L, y: B }, { x: L, y: M }]
            };
            if (num in map) return map[num];else {
                console.error('Dice pos array does not exist for number ' + num + '.');
                return [];
            }
        }
    }]);

    function DiceNumber(num) {
        var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6;

        _classCallCheck(this, DiceNumber);

        var _this9 = _possibleConstructorReturn(this, (DiceNumber.__proto__ || Object.getPrototypeOf(DiceNumber)).call(this, 0, 0, 44, 44));

        _this9.number = num;
        _this9.circlePos = DiceNumber.drawPositionsFor(num);
        _this9.radius = radius;
        _this9.color = 'black';
        return _this9;
    }

    _createClass(DiceNumber, [{
        key: 'hits',
        value: function hits(pos, options) {
            return false;
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {

            if (this.circlePos && this.circlePos.length > 0) {

                var rad = this.radius * boundingSize.w / this.size.w;
                var fill = this.color;
                var stroke = this.stroke;
                this.circlePos.forEach(function (relpos) {
                    var drawpos = { x: pos.x + boundingSize.w * relpos.x - rad, y: pos.y + boundingSize.h * relpos.y - rad };
                    drawCircle(ctx, drawpos.x, drawpos.y, rad, fill, stroke);
                });
            }
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.number, this.radius];
        }
    }]);

    return DiceNumber;
}(mag.Rect);
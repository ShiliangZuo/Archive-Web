'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EmptyExpr = function (_Expression) {
    _inherits(EmptyExpr, _Expression);

    function EmptyExpr() {
        _classCallCheck(this, EmptyExpr);

        return _possibleConstructorReturn(this, (EmptyExpr.__proto__ || Object.getPrototypeOf(EmptyExpr)).apply(this, arguments));
    }

    _createClass(EmptyExpr, [{
        key: 'value',
        value: function value() {
            return null;
        }
    }]);

    return EmptyExpr;
}(Expression);

var NullExpr = function (_ImageExpr) {
    _inherits(NullExpr, _ImageExpr);

    function NullExpr(x, y, w, h) {
        _classCallCheck(this, NullExpr);

        return _possibleConstructorReturn(this, (NullExpr.__proto__ || Object.getPrototypeOf(NullExpr)).call(this, x, y, w, h, 'null-circle'));
    }

    _createClass(NullExpr, [{
        key: 'reduce',
        value: function reduce() {
            return null; // hmmmm
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            Animate.poof(this);
            return _get(NullExpr.prototype.__proto__ || Object.getPrototypeOf(NullExpr.prototype), 'performReduction', this).call(this);
        }
    }, {
        key: 'onmousehover',
        value: function onmousehover() {
            this.image = 'null-circle-highlight';
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave() {
            this.image = 'null-circle';
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: 'toString',
        value: function toString() {
            return 'null';
        }
    }, {
        key: 'value',
        value: function value() {
            return null;
        }
    }]);

    return NullExpr;
}(ImageExpr);

var FadedNullExpr = function (_FadedValueExpr) {
    _inherits(FadedNullExpr, _FadedValueExpr);

    function FadedNullExpr() {
        _classCallCheck(this, FadedNullExpr);

        var _this3 = _possibleConstructorReturn(this, (FadedNullExpr.__proto__ || Object.getPrototypeOf(FadedNullExpr)).call(this, 'null'));

        _this3.color = "lightgray";
        _this3.graphicNode.color = 'black';
        _this3.opacity = 0.8;
        return _this3;
    }

    _createClass(FadedNullExpr, [{
        key: 'poof',
        value: function poof() {
            if (!this.stage) return;
            Animate.poof(this);
            this.stage.remove(this);
        }
    }]);

    return FadedNullExpr;
}(FadedValueExpr);
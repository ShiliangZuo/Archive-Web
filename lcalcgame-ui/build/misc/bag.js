'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Bag = function (_mag$Circle) {
    _inherits(Bag, _mag$Circle);

    function Bag(x, y, rad) {
        var includeInner = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        _classCallCheck(this, Bag);

        var _this = _possibleConstructorReturn(this, (Bag.__proto__ || Object.getPrototypeOf(Bag)).call(this, x, y, rad));

        if (includeInner) {
            var outerRad = rad - _this.topSize(rad).h / 2.0;
            var innerRad = outerRad / 1.3;
            var inner = new mag.Circle(0, 0, innerRad);
            inner.pos = { x: outerRad - innerRad, y: rad / 2.2 + (outerRad - innerRad) };
            inner.clipChildren = true;
            inner.clipBackground = 'bag-background';
            _this.addChild(inner);
            _this.inner = inner;
        }

        _this.shadowOffset = 3;
        return _this;
    }

    _createClass(Bag, [{
        key: 'addItem',
        value: function addItem(item) {
            this.addChild(item);
            //this.inner.addChild(item);
        }
    }, {
        key: 'removeItem',
        value: function removeItem(item) {
            this.removeChild(item);
            //this.inner.removeChild(item);
        }
    }, {
        key: 'removeAllItems',
        value: function removeAllItems() {
            var _this2 = this;

            var children = this.children.filter(function (child) {
                return !child.clipChildren;
            });
            children.forEach(function (child) {
                return _this2.removeChild(child);
            }); // ha-ha programming tricks ...
        }
    }, {
        key: 'topSize',
        value: function topSize(rad) {
            return { w: Math.round(rad) * 1.5, h: rad / 2.2 };
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            var rad = boundingSize.w / 2.0;
            var topSize = this.topSize(rad);
            rad -= topSize.h / 2.0;
            drawBag(ctx, pos.x, pos.y + this.shadowOffset, topSize.w, topSize.h, rad, 'black', this.stroke);
            drawBag(ctx, pos.x, pos.y, topSize.w, topSize.h, rad, this.color, this.stroke);
        }
    }, {
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(ctx, pos, boundingSize) {
            var rad = boundingSize.w / 2.0;
            var topSize = this.topSize(rad);
            rad -= topSize.h / 2.0;
            drawBag(ctx, pos.x, pos.y, topSize.w, topSize.h, rad, null, this.stroke);
        }
    }]);

    return Bag;
}(mag.Circle);
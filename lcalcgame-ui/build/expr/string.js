'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The String Class
 */

var StringObjectExpr = function (_ObjectExtensionExpr) {
    _inherits(StringObjectExpr, _ObjectExtensionExpr);

    //baseString should be of type StringValueExpr
    function StringObjectExpr(baseString) {
        var defaultMethodCall = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var defaultMethodArgs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, StringObjectExpr);

        //text.color = "OrangeRed";
        var _this = _possibleConstructorReturn(this, (StringObjectExpr.__proto__ || Object.getPrototypeOf(StringObjectExpr)).call(this, baseString, {
            'length': {
                'isProperty': true,
                'reduce': function reduce(stringExpr) {
                    this.isProperty = true;
                    return new (ExprManager.getClass('number'))(stringExpr.value().length);
                }
            },
            'slice': function slice(stringExpr, numberExpr1, numberExpr2) {
                if (!numberExpr1 || numberExpr1 instanceof MissingExpression || numberExpr1 instanceof LambdaVarExpr || !numberExpr2 || numberExpr2 instanceof MissingExpression || numberExpr2 instanceof LambdaVarExpr) {
                    return stringExpr;
                }
                var newString = stringExpr.value().slice(numberExpr1.number, numberExpr2.number);
                var newStringObj = new StringObjectExpr(new StringValueExpr(newString));
                return newStringObj;
            },
            'charAt': function charAt(stringExpr, numberExpr) {
                if (!numberExpr || numberExpr instanceof MissingExpression || numberExpr instanceof LambdaVarExpr) {
                    return stringExpr;
                } else if (numberExpr.number >= stringExpr.value().length) {
                    return stringExpr;
                } else {
                    var newString = stringExpr.value().charAt(numberExpr.number);
                    var newStringObj = new StringObjectExpr(new StringValueExpr(newString));
                    return newStringObj;
                }
            },
            '[..]': function _(stringExpr, numberExpr) {

                if (!numberExpr || numberExpr instanceof MissingExpression || numberExpr instanceof LambdaVarExpr) {
                    return stringExpr;
                } else if (numberExpr.number >= stringExpr.value().length) {
                    return stringExpr; //TODO: return undefined
                } else {
                    var newString = stringExpr.value()[numberExpr.number];
                    var newStringObj = new StringObjectExpr(new StringValueExpr(newString));
                    return newStringObj;
                }
            }
        }));

        _this.color = "YellowGreen";

        //console.log("baseString:");
        //console.log(baseString);
        //this.string = baseString;
        //this.primitiveName = baseString;

        if (!defaultMethodCall) {} else if (defaultMethodCall in _this.objMethods) {
            _this.setExtension(defaultMethodCall); // TODO: method args
        } else {
            console.error('@ StringObjectExpr: Method call ' + defaultMethodCall + ' not a possible member of the object.');
        }

        _this.defaultMethodCall = defaultMethodCall;
        _this.defaultMethodArgs = defaultMethodArgs;
        _this.baseStringValue = baseString;
        return _this;
    }

    /*
    get graphicNode() { return this.holes[0]; }
    reduceCompletely() { return this; }
    canReduce() { return false; }
    isValue() { return true; }
    */

    _createClass(StringObjectExpr, [{
        key: 'value',
        value: function value() {
            if (this.baseStringValue.canReduce()) return this.baseStringValue.reduceCompletely().value();else return this.baseStringValue.value();
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            var r = _get(StringObjectExpr.prototype.__proto__ || Object.getPrototypeOf(StringObjectExpr.prototype), 'reduce', this).call(this);
            if (r != this && r instanceof StringValueExpr) {
                return new StringObjectExpr(r); // if reduce value is itself an array, make it an Array object that the user can apply methods to.
            }
            return r;
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.holes[0].clone(), this.defaultMethodCall, this.defaultMethodArgs];
        }
    }]);

    return StringObjectExpr;
}(ObjectExtensionExpr);
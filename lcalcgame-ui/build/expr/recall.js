'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TypeBox = function (_mag$Rect) {
    _inherits(TypeBox, _mag$Rect);

    function TypeBox(x, y, w, h, onCarriageReturn, onTextChanged) {
        _classCallCheck(this, TypeBox);

        var _this = _possibleConstructorReturn(this, (TypeBox.__proto__ || Object.getPrototypeOf(TypeBox)).call(this, x, y, w, h));

        _this.color = 'white'; // should be pure white
        _this.shadowOffset = 0;
        _this.padding = { left: 4, right: 4 };

        // Text
        var txt = new TextExpr('');
        txt.fontSize = 22;
        txt.pos = { x: 0, y: h - txt.size.h / 2 };
        _this.addChild(txt);
        _this.textExpr = txt;

        // Blinking cursor
        var percentH = 0.8;
        var cursor = new BlinkingCursor(_this.padding.left, h * (1 - percentH) / 2.0, 8, h * percentH);
        _this.cursor = cursor;
        _this._origWidth = w;

        _this.onCarriageReturn = onCarriageReturn;
        _this.onTextChanged = onTextChanged;
        return _this;
    }

    _createClass(TypeBox, [{
        key: 'isPlaceholder',
        value: function isPlaceholder() {
            return true;
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            //this.focus();
            this.stroke = { color: 'blue', lineWidth: 2 };
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            this.focus();
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            //this.blur();
            this.stroke = null;
        }
    }, {
        key: 'isFocused',
        value: function isFocused() {
            return this.hasChild(this.cursor);
        }
    }, {
        key: 'focus',
        value: function focus() {
            if (this.isFocused()) return;
            this.addChild(this.cursor);
            this.cursor.startBlinking();
            this.stroke = { color: 'cyan', lineWidth: 2 };
            if (this.stage) this.stage.keyEventDelegate = this;
        }
    }, {
        key: 'blur',
        value: function blur() {
            if (!this.isFocused()) return;
            this.cursor.stopBlinking();
            this.removeChild(this.cursor);
            this.stroke = null;
            if (this.stage && this.stage.keyEventDelegate == this) this.stage.keyEventDelegate = null;
        }
    }, {
        key: 'updateCursorPosition',
        value: function updateCursorPosition() {
            this.update();
            this.cursor.pos = { x: this.textExpr.size.w, y: this.cursor.pos.y };
            this.size = { w: Math.max(this._origWidth, this.textExpr.size.w + this.cursor.size.w + this.padding.right), h: this.size.h };
            this.cursor.resetBlinking();
        }
    }, {
        key: 'type',
        value: function type(str) {
            this.text += str;
            Resource.play('key-press-' + Math.floor(Math.random() * 4 + 1));
            this.updateCursorPosition();
            if (this.onTextChanged) this.onTextChanged();
            this.stage.update();
        }
    }, {
        key: 'backspace',
        value: function backspace() {
            var num = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            var txt = this.text;
            this.text = txt.substring(0, txt.length - 1);
            this.updateCursorPosition();
            if (this.onTextChanged) this.onTextChanged();
            this.stage.update();
        }
    }, {
        key: 'carriageReturn',
        value: function carriageReturn() {
            // Solidify block (if possible)
            if (this.onCarriageReturn) this.onCarriageReturn();
            this.blur();
            if (this.stage) this.stage.update();
        }
    }, {
        key: 'text',
        get: function get() {
            return this.textExpr.text;
        },
        set: function set(txt) {
            this.textExpr.text = txt;
        }
    }, {
        key: 'fontSize',
        get: function get() {
            return this.textExpr.fontSize;
        },
        set: function set(fs) {
            this.textExpr.fontSize = fs;
        }
    }]);

    return TypeBox;
}(mag.Rect);

// Summon ES6 expressions out of thin air!!


var SummoningTypeBox = function (_TypeBox) {
    _inherits(SummoningTypeBox, _TypeBox);

    function SummoningTypeBox(x, y, w, h) {
        _classCallCheck(this, SummoningTypeBox);

        var onCommit = function onCommit() {
            var _this3 = this;

            var txt = this.text.trim();
            var expr_desc = null;
            var input_map = {
                '==': '(== _ _)',
                '!=': '(!= _ _)',
                '?:': '(ifelse _b _ _)',
                '(x) => x': '(λx #x)',
                '(x) => x x': '(λx #x #x)',
                '(x) => x x x': '(λx #x #x #x)',
                '(x) =>': '(λx _)',
                'x': '(#_x)',
                'star': 'star',
                'rect': 'rect'
            };

            var block = void 0;
            if (txt in input_map) {
                expr_desc = input_map[txt];
                block = Level.parse(expr_desc)[0];
            } else {
                block = ES6Parser.parse(txt);
                if (!block) return;
            }

            block.update();
            block.pos = this.absolutePos;
            block.anchor = { x: 0, y: 0 };

            var fx = new ShatterExpressionEffect(block);
            fx.run(this.stage, function () {
                _this3.stage.add(block);
            }, function () {});
        };
        return _possibleConstructorReturn(this, (SummoningTypeBox.__proto__ || Object.getPrototypeOf(SummoningTypeBox)).call(this, x, y, w, h, onCommit));
    }

    return SummoningTypeBox;
}(TypeBox);

var BlinkingCursor = function (_mag$Rect2) {
    _inherits(BlinkingCursor, _mag$Rect2);

    function BlinkingCursor(x, y, w, h) {
        _classCallCheck(this, BlinkingCursor);

        var _this4 = _possibleConstructorReturn(this, (BlinkingCursor.__proto__ || Object.getPrototypeOf(BlinkingCursor)).call(this, x, y, w, h));

        _this4.color = 'black';
        _this4.opacity = 1;
        _this4.ignoreEvents = true;
        return _this4;
    }

    _createClass(BlinkingCursor, [{
        key: 'startBlinking',
        value: function startBlinking() {
            var _this5 = this;

            var blink = function blink() {
                _this5.blinkTween = Animate.tween(_this5, { opacity: 0 }, 1000, function (e) {
                    return Math.pow(e, 2);
                }).after(function () {
                    _this5.blinkTween = Animate.tween(_this5, { opacity: 1 }, 400, function (e) {
                        return Math.pow(e, 2);
                    }).after(function () {
                        blink();
                    });
                });
            };
            blink();
        }
    }, {
        key: 'resetBlinking',
        value: function resetBlinking() {
            this.stopBlinking();
            this.opacity = 1;
            this.startBlinking();
        }
    }, {
        key: 'stopBlinking',
        value: function stopBlinking() {
            if (this.blinkTween) {
                this.blinkTween.cancelWithoutFiringCallbacks();
                this.blinkTween = null;
                this.opacity = 1;
            }
        }
    }]);

    return BlinkingCursor;
}(mag.Rect);

/* A text expression that starts as a freeform text box (TypeBox). */


var TypeInTextExpr = function (_TextExpr) {
    _inherits(TypeInTextExpr, _TextExpr);

    _createClass(TypeInTextExpr, [{
        key: 'constructorArgs',
        value: function constructorArgs() {
            return [this.validator, null, 1];
        }
    }, {
        key: 'clone',
        value: function clone() {
            var t = new TypeInTextExpr(this.validator);
            if (this.typeBox) {
                //console.log(t.typeBox);
                t.typeBox.text = this.typeBox.text;
            } else {
                t.text = this.text;
                t.typeBox = null;
            }
            return t;
        }

        // 'validator' is a function taking the text as an argument,
        // and returning true if valid and false if rejected.

    }], [{
        key: 'fromExprCode',


        /* Because there are many possible validators and contexts for typing,
        // and we need to write levels simply using an ES6 parser,
        // here we map predefined codes to special TypeInTextExpr's (+their validators).
        // Codes so far are:
        //      _t_string: Only accepts string values.
        //      _t_nonneg: Only accepts nonnegative integers.
        //      _t_int: Only accepts integers.
        //      _t_equiv: Only accepts comparison operators !=, ==, !==, ===.
        // There's also a special token, the operator >>>, which
        // means _t_equiv.
        */
        value: function fromExprCode(code, afterCommit) {
            code = code.replace('_t_', ''); // remove prepend
            var validators = {
                'any': function any() {
                    return true;
                },
                'string': function string(txt) {
                    return __PARSER.parse(txt) instanceof StringValueExpr;
                },
                'nonneg': function nonneg(txt) {
                    var i = Number.parseInt(txt, 10);
                    return !Number.isNaN(i) && i >= 0;
                },
                'int': function int(txt) {
                    return !Number.isNaN(Number.parseInt(txt, 10));
                },
                'equiv': function equiv(txt) {
                    return ['==', '!=', '===', '!==', 'or', 'and', 'or not', 'and not'].indexOf(txt) > -1;
                },
                'single': function single(txt) {
                    var res = __PARSER.parse(txt);
                    return res && !(res instanceof Sequence);
                },
                'variable': function variable(txt) {
                    var result = __PARSER.parse(txt);
                    return result instanceof VarExpr || result instanceof VtableVarExpr;
                }
            };
            if (code in validators) {
                return new TypeInTextExpr(validators[code], afterCommit);
            } else {
                console.error('@ TypeInTextExpr.fromExprCode: Code ' + code + ' doesn\'t match any known validator.');
                return null;
            }
        }
    }]);

    function TypeInTextExpr(validator, afterCommit) {
        var charLimit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

        _classCallCheck(this, TypeInTextExpr);

        var _this6 = _possibleConstructorReturn(this, (TypeInTextExpr.__proto__ || Object.getPrototypeOf(TypeInTextExpr)).call(this, " "));

        _this6.validator = validator;

        if (!afterCommit) {
            afterCommit = function afterCommit(txt) {
                var expr = __PARSER.parse(txt);
                if (!expr) return;
                var parent = _this6.parent || _this6.stage;
                parent.swap(_this6, expr);
                expr.lockSubexpressions(function (e) {
                    return !(e instanceof LambdaHoleExpr);
                });
                if (!(parent instanceof mag.Stage)) expr.lock();
                expr.update();
            };
        }

        var _thisTextExpr = _this6;
        var onCommit = function onCommit() {
            var txt = this.text.trim(); // this.text is the TypeBox's text string, *not* the TextExpr's!
            if (validator(txt)) {
                _thisTextExpr.commit(txt);
                Resource.play('carriage-return');
                if (afterCommit) afterCommit(txt);
            } else {
                Animate.blink(this, 1000, [1, 0, 0], 2); // blink red
            }
        };
        var onTextChanged = function onTextChanged() {
            if (validator(this.text.trim()) === true) {
                //this.color = 'green';
                this.stroke = { color: '#0f0', lineWidth: 4 };
            } else this.stroke = null;
        };

        var box = new TypeBox(0, 0, 22, _this6.size.h, onCommit, onTextChanged);
        box.fontSize = _this6.fontSize;
        _this6.addChild(box);
        _this6.ignoreEvents = false;
        _this6.typeBox = box;
        return _this6;
    }

    _createClass(TypeInTextExpr, [{
        key: 'reduce',
        value: function reduce() {
            if (this.typeBox) {
                var txt = this.typeBox.text.trim();
                if (this.validator(txt)) {
                    this.typeBox.carriageReturn();
                }
            }
            return this;
        }
    }, {
        key: 'commit',
        value: function commit(renderedText) {
            this.text = renderedText; // this is the underlying text in the TextExpr
            this.removeChild(this.typeBox);
            this.typeBox = null;
            this.update();
            ShapeExpandEffect.run(this, 200, function (e) {
                return Math.pow(e, 1);
            });
            ShapeExpandEffect.run(this, 350, function (e) {
                return Math.pow(e, 0.9);
            });
            ShapeExpandEffect.run(this, 500, function (e) {
                return Math.pow(e, 0.8);
            });
        }
    }, {
        key: 'isCommitted',
        value: function isCommitted() {
            return this.typeBox === null;
        }
    }, {
        key: 'hits',
        value: function hits(pos, options) {
            return this.hitsChild(pos, options);
        }
    }, {
        key: 'focus',
        value: function focus() {
            this.typeBox.focus();this.typeBox.onmouseleave();
        }
    }, {
        key: 'blur',
        value: function blur() {
            this.typeBox.blur();
        }
    }, {
        key: 'isValue',
        value: function isValue() {
            return false;
        }
    }, {
        key: 'isPlaceholder',
        value: function isPlaceholder() {
            return !this.isCommitted();
        }
    }, {
        key: 'animatePlaceholderStatus',
        value: function animatePlaceholderStatus() {
            if (this.typeBox) Animate.blink(this.typeBox, 1000, [1, 0, 0], 2);
        }
    }, {
        key: 'canReduce',
        value: function canReduce() {
            if (this.typeBox) {
                var txt = this.typeBox.text.trim();
                var valid = this.validator(txt);
                if (valid) {
                    this.reduce();
                    return true;
                }
                return false;
            } else return true;
        }
    }, {
        key: 'value',
        value: function value() {
            return undefined;
        }
    }, {
        key: 'size',
        get: function get() {
            if (this.typeBox) {
                return this.typeBox.size;
            } else {
                return _get(TypeInTextExpr.prototype.__proto__ || Object.getPrototypeOf(TypeInTextExpr.prototype), 'size', this);
            }
        }
    }]);

    return TypeInTextExpr;
}(TextExpr);
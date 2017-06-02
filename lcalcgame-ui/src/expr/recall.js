class TypeBox extends mag.Rect {
    constructor(x, y, w, h, onCarriageReturn, onTextChanged) {
        super(x, y, w, h);
        this.color = 'white'; // should be pure white
        this.shadowOffset = 0;
        this.padding = { left:4, right:4 };

        // Text
        let txt = new TextExpr('');
        txt.fontSize = 22;
        txt.pos = { x:0, y:h - txt.size.h/2 };
        this.addChild(txt);
        this.textExpr = txt;

        // Blinking cursor
        let percentH = 0.8;
        let cursor = new BlinkingCursor(this.padding.left, h*(1 - percentH)/2.0, 8, h * percentH);
        this.cursor = cursor;
        this._origWidth = w;

        this.onCarriageReturn = onCarriageReturn;
        this.onTextChanged = onTextChanged;
    }
    get text() {
        return this.textExpr.text;
    }
    set text(txt) {
        this.textExpr.text = txt;
    }
    get fontSize() {
        return this.textExpr.fontSize;
    }
    set fontSize(fs) {
        this.textExpr.fontSize = fs;
    }

    isPlaceholder() {
        return true;
    }

    onmouseenter(pos) {
        //this.focus();
        this.stroke = { color:'blue', lineWidth:2 };
    }
    onmouseclick(pos) {
        this.focus();
    }
    onmouseleave(pos) {
        //this.blur();
        this.stroke = null;
    }
    isFocused() {
        return this.hasChild(this.cursor);
    }
    focus() {
        if (this.isFocused()) return;
        this.addChild(this.cursor);
        this.cursor.startBlinking();
        this.stroke = { color:'cyan', lineWidth:2 };
        if (this.stage) this.stage.keyEventDelegate = this;
    }
    blur() {
        if (!this.isFocused()) return;
        this.cursor.stopBlinking();
        this.removeChild(this.cursor);
        this.stroke = null;
        if (this.stage && this.stage.keyEventDelegate == this)
            this.stage.keyEventDelegate = null;
    }
    updateCursorPosition() {
        this.update();
        this.cursor.pos = { x:this.textExpr.size.w, y:this.cursor.pos.y };
        this.size = { w:Math.max(this._origWidth, this.textExpr.size.w + this.cursor.size.w + this.padding.right), h:this.size.h };
        this.cursor.resetBlinking();
    }

    type(str) {
        this.text += str;
        Resource.play('key-press-' + Math.floor(Math.random() * 4 + 1))
        this.updateCursorPosition();
        if (this.onTextChanged) this.onTextChanged();
        this.stage.update();
    }
    backspace(num=1) {
        let txt = this.text;
        this.text = txt.substring(0, txt.length-1);
        this.updateCursorPosition();
        if (this.onTextChanged) this.onTextChanged();
        this.stage.update();
    }
    carriageReturn() { // Solidify block (if possible)
        if (this.onCarriageReturn)
            this.onCarriageReturn();
        this.blur();
        if (this.stage) this.stage.update();
    }
}

// Summon ES6 expressions out of thin air!!
class SummoningTypeBox extends TypeBox {
    constructor(x, y, w, h) {
        let onCommit = function() {
            let txt = this.text.trim();
            let expr_desc = null;
            let input_map = {
                '==':'(== _ _)',
                '!=':'(!= _ _)',
                '?:':'(ifelse _b _ _)',
                '(x) => x':'(λx #x)',
                '(x) => x x':'(λx #x #x)',
                '(x) => x x x':'(λx #x #x #x)',
                '(x) =>':'(λx _)',
                'x':'(#_x)',
                'star':'star',
                'rect':'rect'
            };

            let block;
            if (txt in input_map) {
                expr_desc = input_map[txt];
                block = Level.parse(expr_desc)[0];
            } else {
                block = ES6Parser.parse(txt);
                if (!block) return;
            }

            block.update();
            block.pos = this.absolutePos;
            block.anchor = { x:0, y:0 };

            let fx = new ShatterExpressionEffect(block);
            fx.run(this.stage, () => {
                this.stage.add(block);
            }, () => {});

        };
        super(x, y, w, h, onCommit);
    }
}

class BlinkingCursor extends mag.Rect {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.color = 'black';
        this.opacity = 1;
        this.ignoreEvents = true;
    }
    startBlinking() {
        let blink = () => {
            this.blinkTween = Animate.tween(this, { opacity:0 }, 1000, (e) => Math.pow(e, 2)).after(() => {
                this.blinkTween = Animate.tween(this, { opacity:1 }, 400, (e) => Math.pow(e, 2)).after(() => {
                    blink();
                });
            });
        };
        blink();
    }
    resetBlinking() {
        this.stopBlinking();
        this.opacity = 1;
        this.startBlinking();
    }
    stopBlinking() {
        if (this.blinkTween) {
            this.blinkTween.cancelWithoutFiringCallbacks();
            this.blinkTween = null;
            this.opacity = 1;
        }
    }
}

/* A text expression that starts as a freeform text box (TypeBox). */
class TypeInTextExpr extends TextExpr {

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
    static fromExprCode(code, afterCommit) {
        code = code.replace('_t_', ''); // remove prepend
        let validators = {
            'any': () => true,
            'string':(txt) => (__PARSER.parse(txt) instanceof StringValueExpr),
            'nonneg':(txt) => {
                let i = Number.parseInt(txt, 10);
                return (!Number.isNaN(i) && i >= 0);
            },
            'int':(txt) => (!Number.isNaN(Number.parseInt(txt, 10))),
            'equiv':(txt) => (['==','!=','===','!==', 'or', 'and', 'or not', 'and not'].indexOf(txt) > -1),
            'single':(txt) => {
                let res = __PARSER.parse(txt);
                return res && !(res instanceof Sequence);
            },
            'variable': (txt) => {
                let result = __PARSER.parse(txt);
                return (result instanceof VarExpr) || (result instanceof VtableVarExpr);
            },
        };
        if (code in validators) {
            return new TypeInTextExpr(validators[code], afterCommit);
        } else {
            console.error('@ TypeInTextExpr.fromExprCode: Code ' + code + ' doesn\'t match any known validator.');
            return null;
        }
    }

    constructorArgs() {
        return [ this.validator, null, 1 ];
    }
    clone() {
        let t = new TypeInTextExpr(this.validator);
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
    constructor(validator, afterCommit, charLimit=1) {
        super(" ");

        this.validator = validator;

        if (!afterCommit) {
            afterCommit = (txt) => {
                let expr = __PARSER.parse(txt);
                if (!expr) return;
                let parent = (this.parent || this.stage);
                parent.swap(this, expr);
                expr.lockSubexpressions((e) => (!(e instanceof LambdaHoleExpr)));
                if (!(parent instanceof mag.Stage))
                    expr.lock();
                expr.update();
            };
        }

        let _thisTextExpr = this;
        let onCommit = function() {
            let txt = this.text.trim(); // this.text is the TypeBox's text string, *not* the TextExpr's!
            if (validator(txt)) {
                _thisTextExpr.commit(txt);
                Resource.play('carriage-return');
                if (afterCommit) afterCommit(txt);
            } else {
                Animate.blink(this, 1000, [1, 0, 0], 2); // blink red
            }
        };
        let onTextChanged = function() {
            if (validator(this.text.trim()) === true) {
                //this.color = 'green';
                this.stroke = { color:'#0f0', lineWidth:4 };
            } else
                this.stroke = null;
        };

        let box = new TypeBox(0, 0, 22, this.size.h, onCommit, onTextChanged);
        box.fontSize = this.fontSize;
        this.addChild(box);
        this.ignoreEvents = false;
        this.typeBox = box;
    }
    get size() {
        if (this.typeBox) {
            return this.typeBox.size;
        } else {
            return super.size;
        }
    }

    reduce() {
        if (this.typeBox) {
            let txt = this.typeBox.text.trim();
            if (this.validator(txt)) {
                this.typeBox.carriageReturn();
            }
        }
        return this;
    }

    commit(renderedText) {
        this.text = renderedText; // this is the underlying text in the TextExpr
        this.removeChild(this.typeBox);
        this.typeBox = null;
        this.update();
        ShapeExpandEffect.run(this, 200, (e) => Math.pow(e, 1));
        ShapeExpandEffect.run(this, 350, (e) => Math.pow(e, 0.9));
        ShapeExpandEffect.run(this, 500, (e) => Math.pow(e, 0.8));
    }
    isCommitted() { return this.typeBox === null; }
    hits(pos, options) {
        return this.hitsChild(pos, options);
    }
    focus() { this.typeBox.focus(); this.typeBox.onmouseleave(); }
    blur() { this.typeBox.blur(); }
    isValue() { return false; }
    isPlaceholder() {
        return !this.isCommitted();
    }
    animatePlaceholderStatus() {
        if (this.typeBox)
            Animate.blink(this.typeBox, 1000, [1,0,0], 2);
    }
    canReduce() {
        if (this.typeBox) {
            let txt = this.typeBox.text.trim();
            let valid = this.validator(txt);
            if (valid) {
                this.reduce();
                return true;
            }
            return false;
        }
        else return true;
    }
    value() { return undefined; }
}

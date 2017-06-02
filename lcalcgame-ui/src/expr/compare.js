// A boolean compare function like ==, !=, >, >=, <=, <.
class CompareExpr extends Expression {
    static operatorMap() {
        return { '==':'is', '!=':'is not', '>':'>', '<':'<' };
    }
    static textForFuncName(fname) {
        var map = CompareExpr.operatorMap();
        if (fname in map) return map[fname];
        else              return fname;
    }
    constructor(b1, b2, compareFuncName='==') {
        var compare_text = new TextExpr(CompareExpr.textForFuncName(compareFuncName));
        compare_text.color = 'black';
        super([b1, compare_text, b2]);
        this.funcName = compareFuncName;
        this.color = "HotPink";
        this.padding = { left:20, inner:10, right:30 };
    }
    get constructorArgs() { return [this.holes[0].clone(), this.holes[2].clone(), this.funcName]; }
    get leftExpr() { return this.holes[0]; }
    get operatorExpr() { return this.holes[1]; }
    get rightExpr() { return this.holes[2]; }
    onmouseclick(pos) {
        console.log('Expressions are equal: ', this.compare());
        this.performUserReduction();
    }

    update() {
        super.update();
        if (this.rightExpr instanceof BooleanPrimitive || this.rightExpr instanceof CompareExpr)
            this.rightExpr.color = '#ff99d1';
        if (this.leftExpr instanceof BooleanPrimitive || this.leftExpr instanceof CompareExpr)
            this.leftExpr.color = '#ff99d1';
    }

    reduce() {
        var cmp = this.compare();
        if (cmp === true)       return new (ExprManager.getClass('true'))();
        else if (cmp === false) return new (ExprManager.getClass('false'))();
        else                    return this;
    }

    canReduce() {
        return this.leftExpr && this.rightExpr && this.operatorExpr.canReduce() &&
            (this.leftExpr.canReduce() || this.leftExpr.isValue()) &&
            (this.rightExpr.canReduce() || this.rightExpr.isValue());
    }

    performReduction(animated=true) {
        if (this.leftExpr && this.rightExpr && !this._reducing && !(this.leftExpr.isValue() && this.rightExpr.isValue())) {
            let animations = [];
            let genSubreduceAnimation = (expr) => {
                let before = expr;
                let prom = this.performSubReduction(expr, true).then(() => {
                    if (expr != before)
                        return Promise.resolve();
                    else
                        return Promise.reject("@ CompareExpr.performReduction: Subexpression did not reduce!");
                });
            };
            if (!this.leftExpr.isValue())
                animations.push(genSubreduceAnimation(this.leftExpr));
            if (!this.rightExpr.isValue())
                animations.push(genSubreduceAnimation(this.rightExpr));
            return Promise.all(animations);
        }
        if (this.reduce() != this) {
            console.log('reducing');
            if (animated) {
                return new Promise((resolve, _reject) => {
                    var shatter = new ShatterExpressionEffect(this);
                    shatter.run(stage, (() => {
                        this.ignoreEvents = false;
                        resolve(super.performReduction());
                    }).bind(this));
                    this.ignoreEvents = true;
                });
            }
            else super.performReduction();
        }
        return Promise.reject("Cannot reduce!");
    }
    compare() {
        if (!this.operatorExpr.canReduce()) return undefined;
        if (this.funcName === '==') {
            if (!this.rightExpr || !this.leftExpr) return undefined;

            var lval = this.leftExpr.value();
            var rval = this.rightExpr.value();

            // Variables that are equal reduce to TRUE, regardless of whether they are bound!!
            if (!lval && !rval && this.leftExpr instanceof LambdaVarExpr && this.rightExpr instanceof LambdaVarExpr)
                return this.leftExpr.name === this.rightExpr.name;

            //console.log('leftexpr', this.leftExpr.constructor.name, this.leftExpr instanceof LambdaVarExpr, lval);
            //console.log('rightexpr', this.rightExpr.constructor.name, rval);

            if (lval === undefined || rval === undefined)
                return undefined;
            else if (Array.isArray(lval) && Array.isArray(rval))
                return setCompare(lval, rval, (e, f) => (e.toString() === f.toString()));
            else
                return lval === rval;
        } else if (this.funcName === '!=') {
            return this.leftExpr.value() !== this.rightExpr.value();
        } else if (this.funcName === 'and' || this.funcName === 'or' || this.funcName === 'and not' || this.funcName === 'or not') {
            if (!this.rightExpr || !this.leftExpr) return undefined;

            var lval = this.leftExpr.value();
            var rval = this.rightExpr.value();

            if (lval === undefined || rval === undefined)
                return undefined;

            //console.log('leftexpr', this.leftExpr.constructor.name, this.leftExpr instanceof LambdaVarExpr, lval);
            //console.log('rightexpr', this.rightExpr.constructor.name, rval);

            if (this.funcName === 'and')
                return (lval === true) && (rval === true);
            else if (this.funcName === 'and not')
                return (lval === true) && !(rval === true);
            else if (this.funcName === 'or')
                return (lval === true) || (rval === true);
            else if (this.funcName === 'or not')
                return (lval === true) || !(rval === true);
            else {
                console.warn('Logical operator "' + this.funcName + '" not implemented.');
                return undefined;
            }
        } else if (this.funcName === '>' || this.funcName === '<') {

            if (!this.rightExpr || !this.leftExpr) return undefined;

            var lval = this.leftExpr.value();
            var rval = this.rightExpr.value();

            if (lval === undefined || rval === undefined)
                return undefined;
            else if (typeof lval !== 'number' || typeof rval !== 'number') {
                console.warn('Operand for ' + this.funcName + ' does not reduce to a number value.', lval, rval);
                return undefined;
            }
            else if (this.funcName === '>')
                return lval > rval;
            else if (this.funcName === '<')
                return lval < rval;
        } else {
            //console.warn('Compare function "' + this.funcName + '" not implemented.');
            return undefined;
        }
    }

    drawInternal(ctx, pos, boundingSize) {
        ctx.fillStyle = 'black';
        setStrokeStyle(ctx, this.stroke);
        if (this.shadowOffset !== 0) {
            hexaRect( ctx,
                      pos.x, pos.y+this.shadowOffset,
                      boundingSize.w, boundingSize.h,
                      true, this.stroke ? true : false,
                      this.stroke ? this.stroke.opacity : null);
        }
        ctx.fillStyle = this.color;
        hexaRect( ctx,
                  pos.x, pos.y,
                  boundingSize.w, boundingSize.h,
                  true, this.stroke ? true : false,
                  this.stroke ? this.stroke.opacity : null);
    }

    detach() {
        super.detach();
        this.color = "HotPink";
    }

    toString() {
        return (this.locked ? '/' : '') + '(' + this.funcName + ' ' + this.leftExpr.toString() + ' ' + this.rightExpr.toString() + ')';
    }
}

/** Faded compare variants. */
class FadedCompareExpr extends CompareExpr {
    constructor(b1, b2, compareFuncName='==') {
        super(b1, b2, compareFuncName);
        this.holes[1].text = compareFuncName;
    }
}

/* Defines the NOT unary operator, '!' */
class UnaryOpExpr extends Expression {
    constructor(b, unaryOpName='not') {
        var compare_text = new TextExpr(unaryOpName);
        compare_text.color = 'black';
        super([compare_text, b]);
        this.funcName = unaryOpName;
        this.color = "HotPink";
        this.padding = { left:20, inner:10, right:30 };
    }
    get constructorArgs() { return [this.rightExpr.clone(), this.funcName]; }
    get operatorExpr() { return this.holes[0]; }
    get rightExpr() { return this.holes[1]; }
    onmouseclick(pos) {
        if (!this._animating) {
            this.performReduction();
        }
    }

    update() {
        super.update();
        if (this.rightExpr instanceof BooleanPrimitive || this.rightExpr instanceof CompareExpr)
            this.rightExpr.color = '#ff99d1';
    }

    reduce() {

        if (!this.rightExpr) return this;

        let rval = this.rightExpr.value();
        if (rval === undefined) return this;

        if (rval === true)       return new (ExprManager.getClass('false'))();
        else if (rval === false) return new (ExprManager.getClass('true'))();
        else {
            console.log('@ UnaryOpExpr.reduce: Non-boolean values cannot be negated at this time.');
            return this;
        }
    }

    canReduce() {
        return this.rightExpr && (this.rightExpr.canReduce() || this.rightExpr.isValue());
    }

    performReduction(animated=true) {

        if (this.rightExpr && !this.rightExpr.isValue() && !this._animating) {
            this._animating = true;
            let before = this.rightExpr;
            return this.performSubReduction(this.rightExpr, true).then(() => {
                this._animating = false;
                if (this.rightExpr != before) {
                    return this.performReduction();
                }
            });
        }

        if (this.reduce() != this) {
            if (animated) {
                return new Promise((resolve, _reject) => {
                    var shatter = new ShatterExpressionEffect(this);
                    shatter.run(stage, (() => {
                        this.ignoreEvents = false;
                        resolve(super.performReduction());
                    }).bind(this));
                    this.ignoreEvents = true;
                });
            }
            else super.performReduction();
        }
        return null;
    }

    drawInternal(ctx, pos, boundingSize) {
        ctx.fillStyle = 'black';
        setStrokeStyle(ctx, this.stroke);
        if (this.shadowOffset !== 0) {
            hexaRect( ctx,
                      pos.x, pos.y+this.shadowOffset,
                      boundingSize.w, boundingSize.h,
                      true, this.stroke ? true : false,
                      this.stroke ? this.stroke.opacity : null);
        }
        ctx.fillStyle = this.color;
        hexaRect( ctx,
                  pos.x, pos.y,
                  boundingSize.w, boundingSize.h,
                  true, this.stroke ? true : false,
                  this.stroke ? this.stroke.opacity : null);
    }

    toString() {
        return (this.locked ? '/' : '') + '(' + this.funcName + ' ' + this.rightExpr.toString() + ')';
    }
}

class MirrorCompareExpr extends CompareExpr {
    constructor(b1, b2, compareFuncName='==') {
        super(b1, b2, compareFuncName);

        this.children = [];
        this.holes = [];
        this.padding = { left:20, inner:0, right:40 };

        this.addArg(b1);

        // Mirror graphic
        var mirror = new MirrorExpr(0, 0, 86, 86);
        mirror.exprInMirror = b2.clone();
        this.addArg(mirror);

        this.addArg(b2);
    }
    get constructorArgs() { return [this.holes[0].clone(), this.holes[2].clone(), this.funcName]; }
    get leftExpr() { return this.holes[0]; }
    get mirror() { return this.holes[1]; }
    get rightExpr() { return this.holes[2]; }
    expressionToMirror() {
        let isMirrorable = (expr) => (!(!expr || expr instanceof LambdaVarExpr || expr instanceof MissingExpression));
        if (isMirrorable(this.leftExpr))
            return this.leftExpr.clone();
        else if (isMirrorable(this.rightExpr))
            return this.rightExpr.clone();
        else
            return null;
    }
    update() {
        super.update();
        if (this.reduce() != this) {
            this.mirror.exprInMirror = new (ExprManager.getClass('true'))().graphicNode;
            this.mirror.broken = !this.compare();
        } else {
            this.mirror.exprInMirror = this.expressionToMirror();
            this.mirror.broken = false;
        }
    }

    // Animation effects
    performReduction() {
        return new Promise((resolve, reject) => {
            if (!this.isReducing && this.reduce() != this) {
                var stage = this.stage;
                var shatter = new MirrorShatterEffect(this.mirror);
                shatter.run(stage, (() => {
                    this.ignoreEvents = false;
                    resolve(super.performReduction(false));
                }).bind(this));
                this.ignoreEvents = true;
                this.isReducing = true;
            }
            else {
                reject();
            }
        });
    }
}

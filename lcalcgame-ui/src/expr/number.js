


// Integers
class NumberExpr extends Expression {
    constructor(num) {
        super([ new DiceNumber(num) ]);
        this.number = num;
        this.color = 'Ivory';
        this.highlightColor = 'OrangeRed';
    }
    get constructorArgs() {
        return [this.number];
    }
    value() {
        return this.number;
    }
    isValue() {
        return true;
    }
    toString() {
        return (this.locked ? '/' : '') + this.number.toString();
    }

    onmouseclick(pos) {
        // We can't really reduce, let's see if our parent wants to
        if (this.parent) {
            this.parent.onmouseclick(pos);
        }
    }
}

class FadedNumberExpr extends NumberExpr {
    constructor(num) {
        super(num);
        this.children = [];
        this.holes = [];
        this.addArg(new TextExpr(num.toString()));
    }
}

class OperatorExpr extends Expression {
    constructor(left, op, right) {
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

    get op() {
        return this.holes[1];
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
        //this.performUserReduction();
        console.log("clicked Operator Expression!!");
        if (!this._animating) {
            this.performReduction();
        }
    }

    toString() {
        return (this.locked ? '/(' : '(') + this.op.toString() + ' ' + this.leftExpr.toString() + ' ' + this.rightExpr.toString() + ')';
    }
}

class AddExpr extends OperatorExpr {
    constructor(left, right) {
        let op = new TextExpr("+");
        super(left, op, right);
    }

    reduce() {
        if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
            return new (ExprManager.getClass('number'))(this.leftExpr.value() + this.rightExpr.value());
        }
        else {
            return this;
        }
    }
}

class SubtractionExpr extends OperatorExpr {
    constructor(left, right) {
        let op = new TextExpr("-");
        super(left, op, right);
    }

    reduce() {
        if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
            return new (ExprManager.getClass('number'))(this.leftExpr.value() - this.rightExpr.value());
        }
        else {
            return this;
        }
    }
}

class MultiplicationExpr extends OperatorExpr {
    constructor(left, right) {
        let op = new TextExpr("*");
        super(left, op, right);
    }

    reduce() {
        if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
            return new (ExprManager.getClass('number'))(this.leftExpr.value() * this.rightExpr.value());
        }
        else {
            return this;
        }
    }
}

class DivisionExpr extends OperatorExpr {
    constructor(left, right) {
        let op = new TextExpr("/");
        super(left, op, right);
    }

    reduce() {
        if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
            console.log("reducing division expression");
            let result = parseInt(this.leftExpr.value()/this.rightExpr.value());
            return new (ExprManager.getClass('number'))(result);
        }
        else {
            console.log("reduce failed!!");
            return this;
        }
    }
}

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
class DiceNumber extends mag.Rect {
    static drawPositionsFor(num) {
        let L = 0.15;
        let T = L;
        let R = 1.0 - L;
        let B = R;
        let M = 0.5;
        let map = {
            0: [],
            1: [ { x: M, y: M} ],
            2: [ { x: L, y: T }, { x: R, y: B } ],
            3: [ { x: R, y: T}, { x: M, y: M}, { x: L, y: B } ],
            4: [ { x: L, y: T}, { x: R, y: T}, { x: R, y: B }, { x: L, y: B } ],
            5: [ { x: L, y: T}, { x: R, y: T}, { x: R, y: B }, { x: L, y: B }, { x: M, y: M } ],
            6: [ { x: L, y: T}, { x: R, y: T}, { x: R, y: M }, { x: R, y: B }, { x: L, y: B }, { x: L, y: M } ]
        };
        if (num in map) return map[num];
        else {
            console.error('Dice pos array does not exist for number ' + num + '.');
            return [];
        }
    }
    constructor(num, radius=6) {
        super(0, 0, 44, 44);
        this.number = num;
        this.circlePos = DiceNumber.drawPositionsFor(num);
        this.radius = radius;
        this.color = 'black';
    }
    get constructorArgs() {
        return [ this.number, this.radius ];
    }
    hits(pos, options) { return false; }
    drawInternal(ctx, pos, boundingSize) {

        if (this.circlePos && this.circlePos.length > 0) {

            let rad = this.radius * boundingSize.w / this.size.w;
            let fill = this.color;
            let stroke = this.stroke;
            this.circlePos.forEach((relpos) => {
                let drawpos = { x: pos.x + boundingSize.w * relpos.x - rad, y: pos.y + boundingSize.h * relpos.y - rad };
                drawCircle(ctx, drawpos.x, drawpos.y, rad, fill, stroke);
            });

        }
    }
}

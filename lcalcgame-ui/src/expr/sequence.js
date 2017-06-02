class Sequence extends Expression {
    constructor(...exprs) {
        super([]);
        this.padding.between = 5;
        exprs.forEach((expr) => {
            if (expr instanceof MissingExpression) {
                this.holes.push(new MissingSequenceExpression());
            }
            else if (expr instanceof Sequence) {
                expr.holes.forEach((x) => this.holes.push(x));
            }
            else {
                this.holes.push(expr);
            }
        });
        this._layout = { direction: "vertical", align: "none" };
        this._animating = false;
    }

    get subexpressions() {
        return this.holes;
    }

    canReduce() {
        for (let expr of this.holes) {
            if (!expr.isComplete()) return false;
        }
        return true;
    }

    update() {
        super.update();

        let width = 75;
        for (let expr of this.holes) {
            width = Math.max(width, expr.size.w);
        }
        for (let expr of this.holes) {
            if (expr instanceof MissingExpression) {
                expr._size = { w: width, h: expr.size.h };
            }
        }
        super.update();
    }

    performReduction() {
        let cleanup = () => {
            this._animating = false;
            while (this.holes.length > 0 && this.holes[0] instanceof MissingExpression) {
                this.holes.shift();
            }
            this.update();

            Animate.blink(this, 1000, [1.0, 0.0, 0.0]);
        };

        this.lockSubexpressions();
        return new Promise((resolve, reject) => {
            let nextStep = () => {
                if (this.holes.length === 0) {
                    Animate.poof(this);
                    (this.parent || this.stage).swap(this, null);
                    resolve(null);
                }
                else {
                    let expr = this.holes[0];
                    let result = expr.performReduction();
                    let delay = (newExpr) => {
                        if (newExpr instanceof Expression && newExpr != expr) {
                            this.holes[0] = newExpr;
                        }
                        else if (newExpr instanceof Expression && newExpr.isValue()) {
                            this.holes.shift();
                        }
                        else if (newExpr == expr) {
                            cleanup();
                            reject();
                            return;
                        }
                        else {
                            this.holes.shift();
                        }

                        // To handle expressions like loops that
                        // expand into sequences, flatten any
                        // subsequences we encounter.
                        let newHoles = [];
                        for (let expr of this.holes) {
                            if (expr instanceof Sequence) {
                                newHoles = newHoles.concat(expr.holes);
                            }
                            else {
                                newHoles.push(expr);
                            }
                        }
                        this.holes = newHoles;

                        this.update();
                        if (newExpr instanceof Expression) newExpr.lock();
                        if (newHoles.length > 0) {
                            after(800).then(() => nextStep());
                        }
                        else {
                            nextStep();
                        }
                    };
                    if (result instanceof Promise) {
                        result.then(delay, () => {
                            // Uh-oh, an error happened
                            cleanup();
                            reject();
                        });
                    }
                    else {
                        delay(result || expr);
                    }
                }
            };
            nextStep();
        });
    }

    onmouseclick() {
        this.performUserReduction();
    }

    drawReductionIndicator(ctx, pos, boundingSize) {
        if (this._reducing) {
            const radius = this.radius*this.absoluteScale.x;
            const rightMargin = 15 * this.scale.x;

            const rad = rightMargin / 3;
            const indicatorX = pos.x + boundingSize.w - rightMargin / 2 - rad;
            const verticalDistance = boundingSize.h - 2 * this.radius;
            const verticalOffset = 0.5 * (1.0 + Math.sin(this._reducingTime / 250)) * verticalDistance;
            drawCircle(ctx, indicatorX, pos.y + radius + verticalOffset, rad, "lightblue", null);
        }
    }

    toString() {
        return `${this.locked ? '/' : ''}(sequence ${this.subexpressions.map((x) => x.toString()).join(" ")})`;
    }
}

class NotchedSequence extends Sequence {
    constructor(...exprs) {
        super(...exprs);
        this.padding.right = 17.5;
        this._reductionIndicatorStart = 0;
    }

    drawInternal(ctx, pos, boundingSize) {
        super.drawInternal(ctx, pos, boundingSize);
        const radius = this.radius*this.absoluteScale.x;
        const rightMargin = 15 * this.scale.x;
        ctx.fillStyle = "#fff";
        roundRect(ctx,
                  pos.x + boundingSize.w - rightMargin, pos.y,
                  rightMargin, boundingSize.h,
                  {
                      tl: 0,
                      bl: 0,
                      tr: radius,
                      br: radius,
                  }, true, false,
                  null);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.holes.length - 1; i++) {
            let expr1 = this.holes[i];
            let expr2 = this.holes[i + 1];
            let expr1y = expr1.absolutePos.y + expr1.anchor.y * expr1.absoluteSize.h;
            let expr2y = expr2.absolutePos.y;
            let tickPos = expr1y + (expr2y - expr1y) / 2;
            ctx.beginPath();
            ctx.moveTo(pos.x + boundingSize.w - 15 * this.scale.x, expr1y);
            ctx.lineTo(pos.x + boundingSize.w, expr1y);
            ctx.stroke();
        }
    }
}

class SemicolonNotchedSequence extends NotchedSequence {
    constructor(...exprs) {
        super(...exprs);
        this.padding.right = 15;
    }

    drawInternal(ctx, pos, boundingSize) {
        super.drawInternal(ctx, pos, boundingSize);
        const radius = this.radius*this.absoluteScale.x;
        const rightMargin = 15 * this.scale.x;

        ctx.fillStyle = "black";
        let fontSize = 35 * this.scale.y * 0.85;
        ctx.font = `${fontSize}px Consolas, monospace`;
        for (let i = 0; i < this.holes.length; i++) {
            let expr1 = this.holes[i];
            let expr1y = expr1.absolutePos.y; // - expr1.anchor.y * expr1.absoluteSize.h;
            expr1y += (expr1.absoluteSize.h - fontSize) / 2;
            ctx.fillText(";", pos.x + boundingSize.w - rightMargin, expr1y);
        }
    }
}

class SemicolonSequence extends Sequence {
    drawInternal(ctx, pos, boundingSize) {
        super.drawInternal(ctx, pos, boundingSize);
        const radius = this.radius*this.absoluteScale.x;
        const rightMargin = 15 * this.scale.x;

        ctx.fillStyle = "black";
        let fontSize = 35 * this.scale.y * 0.85;
        ctx.font = `${fontSize}px Consolas, monospace`;
        for (let i = 0; i < this.holes.length; i++) {
            let expr1 = this.holes[i];
            let expr1y = expr1.absolutePos.y; // - expr1.anchor.y * expr1.absoluteSize.h;
            expr1y += (expr1.absoluteSize.h - fontSize) / 2;
            ctx.fillText(";", pos.x + boundingSize.w - rightMargin, expr1y);
        }
    }

    clone (parent = null) {
        //console.log("called clone() in semicolon sequence");
        let cln = super.clone(parent);
        cln.holes = [];
        cln.children = [];
        //console.log("this.holes");
        //console.log(this.holes);
        //let thisHoles = this.holes.clone();
        this.holes.forEach((hole) => cln.holes.push(hole.clone()));
        return cln;
    }

}

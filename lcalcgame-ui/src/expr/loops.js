const SCALE_FACTOR = 0.33;

class RepeatLoopExpr extends Expression {
    constructor(times, body) {
        super([]);
        if (times instanceof MissingExpression) {
            times = new MissingNumberExpression();
        }
        this.color = "#7777CC";
        this.addArg(times);
        this.addArg(body);
        this.template = null;

        // Offset drawing self for a "stamp" effect
        this._animationOffset = 0;

        this._leverLength = 0.0;
        this._leverAngle = -Math.PI / 2;
    }

    get timesExpr() {
        return this.holes[0];
    }

    set timesExpr(expr) {
        this.holes[0] = expr;
    }

    get bodyExpr() {
        return this.holes[1];
    }

    set bodyExpr(expr) {
        this.holes[1] = expr;
    }

    canReduce() {
        return this.timesExpr && (this.timesExpr.canReduce() || this.timesExpr.isValue()) &&
            this.bodyExpr && this.bodyExpr.isComplete();
    }

    update() {
        super.update();

        // If we're animating and we already have a template, don't
        // reset it by accident
        if (this._animating && this.template) return;

        if (this.timesExpr instanceof NumberExpr) {
            let missing = [];
            for (let i = 0; i < this.timesExpr.number; i++) {
                missing.push(this.bodyExpr.clone());
            }

            this.template = new (ExprManager.getClass('sequence'))(...missing);
            this.template.lockSubexpressions();
            this.template.scale = { x: 0.8, y: 0.8 };
            this.template.parent = this;
            this.template.pos = {
                x: this.bodyExpr.pos.x + 5,
                y: this.size.h - this.template.padding.inner / 2,
            };
            this.template.holes.forEach((expr) => {
                expr.opacity = 0.3;
            });
        }
        else {
            this.template = null;
        }

        if (this.template != null) {
            this.template.update();
        };
    }

    getHoleSizes() {
        let result = super.getHoleSizes();
        if (this.template) {
            // Adjust size if the template is larger than the body
            result[1].w = Math.max(result[1].w, this.template.size.w * this.template.scale.x);
        }
        return result;
    }

    drawInternal(ctx, pos, boundingSize) {
        if (this.template != null && !this.parent) {
            ctx.save();
            this.template.draw(ctx);
            ctx.restore();
        }

        let divotX = this.timesExpr.absolutePos.x + this.timesExpr.absoluteSize.w + (this.bodyExpr.absolutePos.x - (this.timesExpr.absolutePos.x + this.timesExpr.absoluteSize.w)) / 2.0;
        let bracketHeight = boundingSize.h * 0.2;
        let radius = this.radius*this.absoluteScale.x;
        let bracketRadius = bracketHeight;

        let trayLeft = this.bodyExpr.absolutePos.x;
        let trayRight = this.bodyExpr.absolutePos.x + this.bodyExpr.absoluteSize.w;
        if (this.template) {
            trayLeft = this.template.absolutePos.x;
            trayRight = this.template.absolutePos.x + this.template.absoluteSize.w;
        }

        if (!this.parent) {
            let leverCenterX = trayRight;
            let leverCenterY = (pos.y - 10 + pos.y + boundingSize.h + 10) / 2;
            let leverWidth = 5 * this._leverLength;
            let leverLength = 50 * this._leverLength;

            ctx.fillStyle = this.color;
            drawPointsAround(ctx, leverCenterX, leverCenterY, [
                [0, -leverWidth],
                [0, leverWidth],
                [leverLength, leverWidth],
                [leverLength, -leverWidth],
            ], this._leverAngle);
        }

        let offsetLineTo = (offset, x, y) => ctx.lineTo(x, y + offset);
        let offsetQuadraticCurveTo = (offset, cx, cy, x, y) => ctx.quadraticCurveTo(cx, cy + offset, x, y + offset);

        let draw = (offset) => {
            ctx.beginPath();
            ctx.moveTo(pos.x + radius + offset, pos.y + offset);
            offsetLineTo(offset, divotX - bracketRadius, pos.y);
            // "Divot" separating stamp and number
            offsetQuadraticCurveTo(offset, divotX, pos.y,
                                   divotX, pos.y + bracketRadius);
            // "Output tray"
            offsetLineTo(offset, trayLeft, pos.y - 10);
            offsetLineTo(offset, trayLeft, pos.y);
            offsetLineTo(offset, trayRight, pos.y);
            offsetLineTo(offset, trayRight, pos.y - 10);
            if (pos.x + boundingSize.w - trayRight > 20) {
                offsetLineTo(offset, trayRight + 5, pos.y);
                offsetLineTo(offset, pos.x + boundingSize.w - radius, pos.y);
                offsetQuadraticCurveTo(offset, pos.x + boundingSize.w, pos.y,
                                       pos.x + boundingSize.w, pos.y + radius);
            }
            else {
                offsetLineTo(offset, pos.x + boundingSize.w, pos.y + radius);
            }
            // Right side
            offsetLineTo(offset, pos.x + boundingSize.w, pos.y + boundingSize.h - radius);
            // "Input tray"
            if (pos.x + boundingSize.w - trayRight > 20) {
                offsetQuadraticCurveTo(offset, pos.x + boundingSize.w, pos.y + boundingSize.h,
                                       pos.x + boundingSize.w - radius, pos.y + boundingSize.h);
                offsetLineTo(offset, trayRight + 5, pos.y + boundingSize.h);
            }

            offsetLineTo(offset, trayRight, pos.y + boundingSize.h + 10);
            offsetLineTo(offset, trayRight, pos.y + boundingSize.h);
            offsetLineTo(offset, trayLeft, pos.y + boundingSize.h);
            offsetLineTo(offset, trayLeft, pos.y + boundingSize.h + 10);
            offsetLineTo(offset, divotX, pos.y + boundingSize.h - bracketRadius);
            // "Divot" on bottom
            offsetQuadraticCurveTo(offset, divotX, pos.y + boundingSize.h,
                                   divotX - bracketRadius, pos.y + boundingSize.h);
            offsetLineTo(offset, pos.x + radius, pos.y + boundingSize.h);
            // Bottom-left corner
            offsetQuadraticCurveTo(offset, pos.x, pos.y + boundingSize.h,
                                 pos.x, pos.y + boundingSize.h - radius);
            // Left side
            offsetLineTo(offset, pos.x, pos.y + radius);
            // Upper-left corner
            offsetQuadraticCurveTo(offset, pos.x, pos.y,
                                 pos.x + radius, pos.y);
            ctx.closePath();
            if (this.stroke) {
                strokeWithOpacity(ctx, this.stroke.opacity);
            }
            ctx.fill();
        };

        setStrokeStyle(ctx, this.stroke);
        if (this.shadowOffset !== 0) {
            ctx.fillStyle = 'black';
            draw(this.shadowOffset);
        }
        ctx.fillStyle = this.color;
        draw(0);
    }

    performReduction() {
        console.log("called perform reduction in RepeatLoopExpr");
        this._cachedSize = this.size;

        return this.performSubReduction(this.timesExpr).then((num) => {
            if (!(num instanceof NumberExpr) || !this.bodyExpr || this.bodyExpr instanceof MissingExpression) {
                Animate.blink(this.timesExpr, 1000, [1.0, 0.0, 0.0]);
                return Promise.reject("RepeatLoopExpr incomplete!");
            }

            if (num.number <= 0) {
                Animate.poof(this);
                (this.parent || this.stage).swap(this, null);
                return null;
            }

            return new Promise((resolve, reject) => {
                let index = 0;
                let x = this.template.pos.x;
                let y = this.template.pos.y;

                if (this.parent) {
                    index = this.template.subexpressions.length + 1;
                }

                let nextStep = () => {
                    this._leverAngle = -Math.PI / 2;

                    if (index > this.template.subexpressions.length) {
                        this.template.holes.forEach((expr) => {
                            expr.opacity = 1;
                        });
                        resolve(this.template);
                        Animate.poof(this);
                        this.template.parent = null;
                        (this.parent || this.stage).swap(this, this.template);
                        return;
                    }

                    if (index == this.template.subexpressions.length) {
                        y -= this.size.h;
                        Animate.tween(this.template, {
                            pos: {
                                x: x,
                                y: y,
                            },
                        }, 300).after(() => {
                            index++;
                            after(400).then(nextStep);
                        });
                    }
                    else {
                        let current = this.template.subexpressions[index];
                        // If we're stamping a sequence, treat each
                        // group of expressions as a single stamp
                        let numExprs = 1;
                        if (this.bodyExpr instanceof Sequence) {
                            numExprs = this.bodyExpr.subexpressions.length;
                        }

                        for (let i = 0; i < numExprs; i++) {
                            let expr = this.template.subexpressions[index + i];
                            y -= expr.size.h * expr.scale.y;
                        }

                        Animate.tween(this.template, {
                            pos: {
                                x: x,
                                y: y,
                            },
                        }, 300).after(() => {
                            let oldOffset = this.bodyExpr.shadowOffset;

                            Animate.tween(this, {
                                _leverAngle: 0,
                            }, 400);
                            Animate.tween(this.bodyExpr, {
                                shadowOffset: -4,
                                pos: {
                                    x: this.bodyExpr.pos.x,
                                    y: this.bodyExpr.pos.y + 2,
                                },
                            }, 400).after(() => {
                                for (let i = 0; i < numExprs; i++) {
                                    this.template.subexpressions[index + i].opacity = 1.0;
                                }
                                index += numExprs;

                                this.bodyExpr.shadowOffset = oldOffset;
                                this.bodyExpr.pos = {
                                    x: this.bodyExpr.pos.x,
                                    y: this.bodyExpr.pos.y - 2,
                                };
                                this.stage.draw();
                                after(400).then(nextStep);
                            });
                        });
                    }
                };

                Animate.tween(this, {
                    _leverLength: 1.0,
                }, 200).after(nextStep);
            });
        });
    }

    onmouseclick() {
        this.performUserReduction();
    }

    drawReductionIndicator(ctx, pos, boundingSize) {}

    toString() {
        let times = this.timesExpr.toString();
        let body = this.bodyExpr.toString();
        return `${this.locked ? '/' : ''}(repeat ${times} ${body})`;
    }
}

class FadedRepeatLoopExpr extends Expression {
    constructor(times, body) {
        super([new TextExpr("repeat ("), times, new TextExpr(") {"), body, new TextExpr("}")]);
    }

    get timesExpr() {
        return this.holes[1];
    }

    set timesExpr(expr) {
        this.holes[1] = expr;
    }

    get bodyExpr() {
        return this.holes[3];
    }

    set bodyExpr(expr) {
        this.holes[3] = expr;
    }

    get size() {
        let padding = this.padding;
        let sizes = this.getHoleSizes();

        let top = sizes.slice(0, 3);
        let middle = sizes[3];
        let bottom = sizes[4];

        let topWidth = 0;
        let maxTopHeight = 0;
        top.forEach((size) => {
            topWidth += size.w;
            maxTopHeight = Math.max(maxTopHeight, size.h);
        });
        let width = Math.max(topWidth, middle.w + 50, bottom.w) + padding.left + padding.right;
        let height = maxTopHeight + middle.h + bottom.h + 4 * padding.inner;

        return { w:width, h: height };
    }

    update() {
        this.children = [];

        this.holes.forEach((expr) => this.addChild(expr));
        this.holes.forEach((expr) => {
            expr.anchor = { x:0, y:0 };
            expr.scale = { x:0.85, y:0.85 };
            if (expr instanceof TextExpr) {
                expr.scale = { x: 0.6, y: 0.6 };
                expr._baseline = "top";
            }
            expr.update();
        });
        var size = this.size;
        var x = this.padding.left;
        var y = 0;

        let top = this.holes.slice(0, 3);
        let middle = this.holes[3];
        let bottom = this.holes[4];

        let maxTopHeight = 0;
        top.forEach((expr) => {
            maxTopHeight = Math.max(maxTopHeight, expr.size.h);
        });

        top.forEach((expr) => {
            let height = (expr instanceof TextExpr) ? expr.fontSize * expr.scale.y : expr.size.h;
            expr.pos = { x:x, y: this.padding.inner / 2 + (maxTopHeight - height) / 2 };
            x += expr.size.w * expr.scale.x;
        });

        middle.pos = { x: this.padding.left + 50, y: maxTopHeight + this.padding.inner };
        bottom.pos = { x: this.padding.left, y: middle.pos.y + middle.size.h + this.padding.inner };

        this.children = this.holes;
    }

    canReduce() {
        return this.timesExpr && (this.timesExpr.canReduce() || this.timesExpr.isValue()) &&
            this.bodyExpr && this.bodyExpr.isComplete();
    }

    performReduction() {
        console.log("called performReduction() in FadedRepeatLoopExpr");
        if (this.canReduce()) {
            console.log("canReduce() == true");
            return this.performSubReduction(this.timesExpr).then(() => {
                let missing = [];
                console.log("this.timesExpr:");
                console.log(this.timesExpr);
                console.log("this.bodyExpr");
                console.log(this.bodyExpr);
                for (let i = 0; i < this.timesExpr.number; i++) {
                    console.log("calling this.bodyExpr.clone()");
                    //let thisBodyExprClone = this.bodyExpr.clone();
                    missing.push(this.bodyExpr.clone());
                }


                console.log("...missing");
                console.log(...missing);
                console.log("missing");
                console.log(missing);

                let template = new (ExprManager.getClass('sequence'))(...missing);
                template.lockSubexpressions();

                (this.parent || this.stage).swap(this, template);
                template.update();

                console.log("template");
                console.log(template);

                return template;
            });
        }
        else {
            console.log("canReduce() == false");
            return Promise.reject();
        }
    }

    onmouseclick() {
        this.performReduction();
    }

    toString() {
        let times = this.timesExpr.toString();
        let body = this.bodyExpr.toString();
        return `${this.locked ? '/' : ''}(repeat ${times} ${body})`;
    }
}

function drawPointsAround(ctx, centerX, centerY, points, rotation) {
    ctx.beginPath();
    let first = true;
    for (let [x, y] of points) {
        let tx = centerX + x * Math.cos(rotation) - y * Math.sin(rotation);
        let ty = centerY + x * Math.sin(rotation) + y * Math.cos(rotation);
        if (first) {
            ctx.moveTo(tx, ty);
            first = false;
        }
        else {
            ctx.lineTo(tx, ty);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

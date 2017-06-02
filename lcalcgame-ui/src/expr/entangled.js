/**
 * A very special expression not found in programming
 * that acts as test cases for the 'function' computed
 * by the player. Allows for multiple simultaneous, yet separate goals.
 */

class EntangledExpr extends ExpressionPlus {
    constructor(exprs, isShuttered=false) {

        let OverlayClass;
        if (!isShuttered) {
            super(exprs);
            OverlayClass = ExprSelectorOverlay;
        } else {
            super([ exprs[0] ]);
            this.hiddenExprs = exprs.slice();
            OverlayClass = ExprShutterOverlay;
        }
        exprs.forEach((e) => e.lock());

        let overlay = new OverlayClass(0, 0, 56, 56);
        overlay.anchor = { x:0, y:0.5 };
        overlay.ignoreEvents = true;
        this.addChild(overlay);
        this.update();
        this.overlay = overlay;

        let frames = this.getHoleSizes();
        this.overlay.pos = this.holes[0].pos;
        this.overlay.size = frames[0];

        this.isShuttered = isShuttered;
    }
    static pairedAnimate(p1, p2) {
        p1.pair = p2;
        p2.pair = p1;
        p1.animate();
        p2.animate();
    }
    animate() {
        let _this = this;

        if (this.isShuttered) { // Close shutter and swap out inner expression for next in sequence.
            let animateShutter = (idx) => {
                _this.overlay.closeShutter(250).after(() => {
                    _this.removeChild(_this.holes[0]);
                    _this.removeChild(_this.overlay);
                    _this.holes = [ _this.hiddenExprs[idx] ];
                    _this.update();
                    _this.addChild(_this.overlay);
                    _this.overlay.openShutter(250).after(() => {
                        Animate.wait(2000).after(() => {
                            _this.afterWait = () => animateShutter((idx + 1) % _this.hiddenExprs.length);
                            if (_this.pair) {

                                if (_this.pair.waiting) {
                                    _this.waiting = false;
                                    _this.pair.waiting = false;
                                    _this.pair.afterWait();
                                    _this.afterWait();
                                }
                                else _this.waiting = true;
                            }
                            else _this.afterWait();
                        });
                    });
                });
            };
            animateShutter(1);

        } else { // Move selector frame from expression to expression, left to right.
            let animateFrameOverHole = (idx) => {
                let frames = _this.getHoleSizes();
                Animate.tween(_this.overlay, { size:frames[idx], pos:_this.holes[idx].pos }, 500, (e) => Math.pow(e, 2)).after(() => {
                    Animate.wait(2000).after(() => {
                        _this.afterWait = () => animateFrameOverHole((idx + 1) % _this.holes.length);
                        if (_this.pair) {

                            if (_this.pair.waiting) {
                                _this.waiting = false;
                                _this.pair.waiting = false;
                                _this.pair.afterWait();
                                _this.afterWait();
                            }
                            else _this.waiting = true;
                        }
                        else _this.afterWait();
                    });
                });
            };
            animateFrameOverHole(1);
        }
    }
}

class ExprSelectorOverlay extends mag.RoundedRect {
    constructor(x, y, w, h, radius=6) {
        super(x, y, w, h, radius);
        this.stroke = { color:'black', lineWidth:6 };
        this.color = null;
        this.shadowOffset = 0;
    }
}

class ExprShutterOverlay extends ExprSelectorOverlay {
    constructor(x, y, w, h, radius) {
        super(x, y, w, h, radius);

        let shutterLeft = new mag.Rect(0, 0, 1, h);
        shutterLeft.pos = zeroPos();
        shutterLeft.color = 'black';
        this.addChild(shutterLeft);
        this.shutterLeft = shutterLeft;

        let shutterRight = new mag.Rect(0, 0, 1, h);
        shutterRight.anchor = { x:1, y:0 };
        shutterRight.pos = { x:w, y:0 };
        shutterRight.color = 'black';
        this.addChild(shutterRight);
        this.shutterRight = shutterRight;
    }
    get size() { return super.size; }
    set size(sz) {
        super.size = sz;
        if (this.shutterLeft && this.shutterRight) {
            this.shutterLeft.size = { w:this.shutterLeft.size.w, h:sz.h };
            this.shutterRight.size = { w:this.shutterRight.size.w, h:sz.h };
            this.shutterRight.pos = { x:sz.w, y:0 };
        }
    }

    openShutter(dur=500) {
        Animate.tween(this.shutterLeft, { size:{w:0, h:this.shutterLeft.size.h} }, dur);
        return Animate.tween(this.shutterRight, { size:{w:0, h:this.shutterRight.size.h} }, dur);
    }
    closeShutter(dur=500) {
        Animate.tween(this.shutterLeft, { size:{w:this.size.w/2, h:this.shutterLeft.size.h} }, dur, (e) => Math.pow(e, 2));
        return Animate.tween(this.shutterRight, { size:{w:this.size.w/2, h:this.shutterRight.size.h} }, dur, (e) => Math.pow(e, 2));
    }
}

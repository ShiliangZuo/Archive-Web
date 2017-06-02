// Specifies a 'notch' in a drawn rectangle.
// left, right, top, or bottom, and relpos is the relative position on that side from 0 to 1, clockwise.
class Notch {

    constructor(side='left', depth=8, width=16, relpos=0, inner=true) {
        this.side = side;
        this.depth = depth;
        this.width = width;
        this.inner = inner; // inner (concave) or outer (convex) notch?
        if (relpos && relpos <= 1 || relpos >= 0)
            this.relpos = relpos;
        else {
            console.warn('@ new Notch: Relative position outside of unit length.');
            this.relpos = 0;
        }
    }

    // Tells you whether two notches 'fit into' one another.
    isCompatibleWith(otherNotch) {
        return  (!this.connection) && (!otherNotch.connection) && // notch isn't compatible if its already connected...
                (this.inner !== otherNotch.inner) &&
                //(this.width === otherNotch.width && this.depth === otherNotch.depth) && // arguable
                (this.type === otherNotch.type) &&
               ((this.side === 'left' && otherNotch.side === 'right') ||
               (this.side === 'right' && otherNotch.side === 'left') ||
               (this.side === 'top' && otherNotch.side === 'bottom') ||
               (this.side === 'bottom' && otherNotch.side === 'top'));
    }

    // The type of notch, used for determining compatibility.
    // Obviously a 'hexagonal' notch wouldn't fit a 'wedge' notch, for instance.
    get type() { return 'standard'; } // I would go with just 'type',
    get direction() { return (this.side === 'left' || this.side === 'bottom') ? -1 : 1; }

    unpair() {
        if (!this.connection) return;
        this.connection.notch.connection = null; // disconnect pair'd connection
        this.connection = null;
    }

    static pair(notchA, exprA, notchB, exprB) {
        notchA.connection = {
            expr:exprB,
            notch:notchB
        };
        notchB.connection = {
            expr:exprA,
            notch:notchA
        };
    }
    static drawSequence(notches, side, ctx, x, y, len) {
        let seq = notches.filter((n) => n.side === side)
                         .sort((a, b) => a.relpos - b.relpos);
        if (seq.length === 0) return;
        if (side === 'left' || side === 'right')
            seq.forEach((s) => s.drawVert(ctx, x, y, len));
        else
            seq.forEach((s) => s.drawHoriz(ctx, x, y, len));
    }

};

// A triangular 'wedge' shaped notch.
class WedgeNotch extends Notch {
    get type() { return 'wedge'; }
    drawHoriz(ctx, x, y, w, dir) {
        if (!dir) dir = this.direction;
        let relpos = this.relpos;
        let facing = this.inner ? 1 : -1;
        ctx.lineTo(x + dir * (w * relpos - this.width), y);
        ctx.lineTo(x + dir * (w * relpos), y + facing * dir * this.depth);
        ctx.lineTo(x + dir * (w * relpos + this.width), y);
    }
    drawVert(ctx, x, y, h, dir) {
        if (!dir) dir = this.direction;
        let relpos = this.relpos;
        let facing = this.inner ? 1 : -1;
        ctx.lineTo(x, y + dir * (h * relpos - this.width));
        ctx.lineTo(x - facing * dir * this.depth, y + dir * h * relpos);
        ctx.lineTo(x, y + dir * (h * relpos + this.width));
    }
}

class NotchHangerExpr extends Expression {
    constructor(numNotches, spacing=160) {
        super([]);
        this._NOTCH_SPACING = spacing;
        this.radius = 0;
        this.color = '#594764';
        this.numNotches = numNotches;
        this.ignoreEvents = true;
    }
    set size(sz) {
        this._size = {w:sz.h, h:sz.h};
    }
    get size() {
        return {w:this._size.w,h:this._size.h};
    }
    set numNotches(num) {
        this.notches = [];
        this._size = {w:0, h:this._NOTCH_SPACING * num};
        for (let i = 0; i < num; i++) {
            let notch = new WedgeNotch('right', 10, 10, i / num + 1/num/2, false);
            this.notches.push(notch);
        }
    }
    get numNotches() {
        return this.notches.length;
    }
    update() { }
    toString() { return '(notch)'; }
}

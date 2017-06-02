// Wrapper class to make arbitrary nodes into draggable expressions.
class ValueExpr extends Expression {
    canReduce() { return false; }
    isValue() { return true; }
}
class GraphicValueExpr extends ValueExpr {
    constructor(graphic_node) {
        super([graphic_node]);
        this.color = 'gold';
    }

    get color() { return super.color; }
    set color(clr) {
        this.holes[0].color = clr;
    }
    get delegateToInner() {
        return this.ignoreEvents || (!this.parent) || (!(this.parent instanceof Expression));
    }
    get graphicNode() { return this.holes[0]; }
    reduceCompletely() { return this; }
    reduce() { return this; }

    //get size() { return this.holes[0].size; }
    hits(pos, options) {
        if(this.ignoreEvents) return null;
        if(this.holes[0].hits(pos, options)) return this;
        else return null;
    }
    onmouseenter(pos) {
        if (this.delegateToInner) this.holes[0].onmouseenter(pos);
        else super.onmouseenter(pos);
    }
    onmouseleave(pos) {
        if (!this.delegateToInner) super.onmouseleave(pos);
        this.holes[0].onmouseleave(pos);
    }
    drawInternal(ctx, pos, boundingSize) {
        if (!this.delegateToInner) {
            this._color = '#777';
            super.drawInternal(ctx, pos, boundingSize);
        }
    }
    value() { return this.holes[0].value(); }
}
class StarExpr extends GraphicValueExpr {
    constructor(x, y, rad, pts=5) {
        super(new mag.Star(x, y, rad, pts));
    }
    toString() { return (this.locked ? '/' : '') + 'star'; }
}
class CircleExpr extends GraphicValueExpr {
    constructor(x, y, rad) {
        super(new mag.Circle(x, y, rad));
    }
    toString() { return (this.locked ? '/' : '') + 'circle'; }
}
class PipeExpr extends GraphicValueExpr {
    constructor(x, y, w, h) {
        super(new mag.Pipe(x, y, w, h-12));
    }
    toString() { return (this.locked ? '/' : '') + 'pipe'; }
}
class TriangleExpr extends GraphicValueExpr {
    constructor(x, y, w, h) {
        super(new mag.Triangle(x, y, w, h));
    }
    toString() { return (this.locked ? '/' : '') + 'triangle'; }
}
class RectExpr extends GraphicValueExpr {
    constructor(x, y, w, h) {
        super(new mag.Rect(x, y, w, h));
    }
    toString() { return (this.locked ? '/' : '') + 'rect'; }
}
class ImageExpr extends GraphicValueExpr {
    constructor(x, y, w, h, resource_key) {
        super(new mag.ImageRect(x, y, w, h, resource_key));
        this._image = resource_key;
    }
    get image() { return this._image; }
    set image(img) {
        this._image = img;
        this.graphicNode.image = img;
    }
    toString() { return this._image; }
}
class FunnelExpr extends ImageExpr {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'funnel');
        this.graphicNode.anchor = { x:0, y:0.5 };
    }
    update() { }
    get size() {
        return this.graphicNode.size;
    }
    onmouseenter() {
        this.graphicNode.image = 'funnel-selected';
    }
    onmouseleave() {
        this.graphicNode.image = 'funnel';
    }
    drawInternal(ctx, pos, boundingSize) {  }
}
class NullExpr extends ImageExpr {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'null-circle');
    }
    reduce() {
        return null; // hmmmm
    }
    performReduction() {
        Animate.poof(this);
        return super.performReduction();
    }
    onmousehover() {
        this.image = 'null-circle-highlight';
    }
    onmouseleave() {
        this.image = 'null-circle';
    }
    onmouseclick() {
        this.performReduction();
    }
    toString() {
        return 'null';
    }
    value() { return null; }
}
class MirrorExpr extends ImageExpr {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'mirror-icon');
        this.lock();
        this.graphicNode.offset = { x:0, y:-10 };
        this.innerExpr = null;
        this._broken = false;
    }
    get size() {
        let sz = super.size;
        sz.h = 54;
        return sz;
    }
    set exprInMirror(e) {
        this.innerExpr = e;

        if (e) {
            e.scale = { x:1, y:1 };
            e.parent = this.graphicNode;
            e.update();
        }
    }
    set broken(b) {
        this._broken = b;
        if (b) this.graphicNode.image = 'mirror-icon-broken';
        else   this.graphicNode.image = 'mirror-icon';
    }
    get broken() {
        return this._broken;
    }
    get exprInMirror() {
        return this.innerExpr;
    }
    drawInternalAfterChildren(ctx, pos, boundingSize) {
        if (!this.innerExpr) return;

        ctx.save();
        ctx.globalCompositeOperation = "overlay";
        this.innerExpr.parent = this.graphicNode;
        this.innerExpr.pos = { x:this.graphicNode.size.w / 2.0, y:this.graphicNode.size.h / 2.0 };
        this.innerExpr.anchor = { x:0.5, y:0.8 };
        this.innerExpr.draw(ctx);
        ctx.restore();
    }
}

/** Faded variants. */
class FadedValueExpr extends Expression {
    constructor(name, primitiveName=null) {
        let txt = new TextExpr(name);
        super([txt]);
        txt.color = "OrangeRed";
        this.color = "gold";
        this.primitiveName = primitiveName || name;
    }
    get graphicNode() { return this.holes[0]; }
    reduceCompletely() { return this; }
    reduce() { return this; }
    canReduce() { return false; }
    isValue() { return true; }
    toString() {
        return this.primitiveName;
    }
    value() { return (this.locked ? '/' : '') + this.toString(); }
}
class FadedStarExpr extends FadedValueExpr {
    constructor() { super('star'); }
}
class FadedRectExpr extends FadedValueExpr {
    constructor() { super('rect'); }
}
class FadedTriangleExpr extends FadedValueExpr {
    constructor() { super('tri', 'triangle'); }
}
class FadedCircleExpr extends FadedValueExpr {
    constructor() { super('dot', 'circle'); }
}

class StringValueExpr extends Expression {
    constructor(name, primitiveName=null) {
        let text = new TextExpr('"' + name + '"');
        super([text]);
        this.name = name;
        this.primitiveName = primitiveName || name;
        text.color = "OrangeRed";
        this.color = "gold";
    }

    get graphicNode() { return this.holes[0]; }
    reduceCompletely() { return this; }
    reduce() { return this; }
    canReduce() { return false; }
    isValue() { return true; }
    toString() {
        return (this.locked ? '/' : '') + this.primitiveName;
    }
    value() { return this.name; }
}
class StringStarExpr extends StringValueExpr {
    constructor() { super('star'); }
}
class StringRectExpr extends StringValueExpr {
    constructor() { super('rect'); }
}
class StringTriangleExpr extends StringValueExpr {
    constructor() { super('tri', 'triangle'); }
}
class StringCircleExpr extends StringValueExpr {
    constructor() { super('dot', 'circle'); }
}

class StringAddExpr extends Expression {
    constructor(left, right) {
        let op = new TextExpr("+");
        /*if (left instanceof MissingExpression && !(left instanceof MissingNumberExpression))
            left = new MissingNumberExpression();
        if (right instanceof MissingExpression && !(right instanceof MissingNumberExpression))
            right = new MissingNumberExpression();*/
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
            if (!(left instanceof StringValueExpr)) {
                return Promise.reject();
            }
            return this.performSubReduction(this.rightExpr).then((right) => {
                if (!(right instanceof StringValueExpr)) {
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

    reduce() {
        if (this.leftExpr instanceof StringValueExpr && this.rightExpr instanceof StringValueExpr) {
            return new (StringValueExpr)(this.leftExpr.value() + this.rightExpr.value());
        }
        else {
            return this;
        }
    }
}

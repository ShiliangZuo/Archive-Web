// An infinite resource.
// Wraps around an existing expression.
class InfiniteExpression extends GraphicValueExpr {
    constructor(expr) {
        expr.update();
        super(expr.clone());

        // Inifinity symbol.
        let c = new mag.Circle(0, 0, 14);
        let inf = new mag.ImageRect('infinity-symbol');
        c.color = '#0D0';
        c.pos = { x:expr.size.w-7, y:0 };
        c.anchor = { x:0.5, y:0.5 };
        inf.anchor = { x:0.5, y:0.5 };
        inf.pos = { x:c.size.w/2, y:c.size.h/2 };
        c.addChild(inf);
        this.inf = c;
    }
    get constructorArgs() {
        return [this.graphicNode.clone()];
    }
    get color() { return super.color; }
    set color(clr) {
        this._color = clr;
    }

    onmouseenter(pos) {
        super.onmouseenter(pos);
        this.inf.stroke = { color:'orange', lineWidth:2 };
        this.inf.color = 'purple';
    }
    onmousehover(pos) {
        super.onmousehover(pos);
        this.cursorPos = pos;
    }
    onmouseleave(pos) {
        super.onmouseleave(pos);
        this.inf.stroke = null;
        this.inf.color = '#0D0';
    }
    onmousedrag(pos) {

        // On drag, clone the wrapped expression
        // and let the user drag the clone.
        let c = this.graphicNode.clone();
        this.stage.add(c);
        Resource.play('place');
        c.onmouseenter(pos);
        c.onmousedrag(pos);
        //c.pos =  { x:c.size.w, y:0 };
        c.anchor = { x:0.5, y:0.5 };
        c.pos = this.cursorPos;

        this.onmouseleave(pos);

        // This is a special line which tells the stage
        // to act as if the user was holding the new cloned node,
        // not the infinite resource.
        this.stage.heldNode = c;
        this.stage.heldNodeOrigOffset = null;

    }

    drawInternalAfterChildren(ctx, pos, boundingSize) {
        super.drawInternalAfterChildren(ctx, pos, boundingSize);

        ctx.save();
        this.inf.parent = this;
        this.inf.draw(ctx);
        ctx.restore();
    }
    toString() {
        return '(inf ' + this.graphicNode.toString() + ')';
    }
}

// A game within a game...
// Wraps around a Reduct stage.
class ReductStageExpr extends GraphicValueExpr {
    constructor(goal, board, toolbox) {

        // The inputs can be either arrays or expressions, so let's cast them all into arrays:
        if (!Array.isArray(goal)) goal = [goal];
        if (!Array.isArray(board)) board = [board];
        if (!Array.isArray(toolbox)) toolbox = [toolbox];

        // Delay building the stage until after we have a parent...
        super(new Expression());

        this.initialExprs = [ goal, board, toolbox ];
        this.ignoreEvents = false;
    }

    build() {

        // Get the parent's stage:
        var parentStage = this.parent.stage;
        if (!parentStage) {
            console.error('@ ReductStageExpr.build: Parent has no Stage.');
            return;
        }

        // Get the setup exprs:
        if (!this.initialExprs) {
            console.error('@ ReductStageExpr.build: No initial expressions.');
            return;
        }
        var goal = this.initialExprs[0];
        var board = this.initialExprs[1];
        var toolbox = this.initialExprs[2];

        // Create the inner stage:
        var lvl = new Level(board, new Goal(new ExpressionPattern(goal)), toolbox);
        var innerStage = lvl.build(parentStage.canvas);
        var v = new MetaInnerExpression(0, 0, parentStage, innerStage);

        // Repair the pointers:
        this.children[0] = v;
        this.holes[0] = v;
    }

    get delegateToInner() {
        return false;
    }
    get innerStage() {
        return this.children[0];
    }

    onmousedown(pos) {
        if (this.innerStage.expanded)
            this.innerStage.onmousedown(pos);
        else
            super.onmousedown(pos);
    }
    onmousedrag(pos) {
        if (this.innerStage.expanded)
            this.innerStage.onmousedrag(pos);
        else
            super.onmousedrag(pos);
    }
    onmousehover(pos) {
        this.innerStage.onmousehover(pos);
    }

    onmouseclick(pos) {
        if (this.graphicNode.expanded)
            this.graphicNode.shrink();
        else
            this.graphicNode.expand();
    }

    clone() {
        return null;
    }

    hits(pos, options) {
        if(this.ignoreEvents) return null;
        var hitChild = this.hitsChild(pos, options);
        if (hitChild) return hitChild;

        // Hasn't hit any children, so test if the point lies on this node.
        return this.hitsWithin(pos);
    }
}

class MetaInnerExpression extends mag.Rect {
    constructor(x, y, parentStage, levelStage) {

        let canvas = parentStage.canvas;
        let substage = new mag.StageNode(0, 0, levelStage, canvas);
        substage.anchor = { x:0, y:0 };
        substage.canvas = null;
        parentStage.canvas = null;
        parentStage.canvas = canvas;

        substage.clip = { l:0.14, r:0.22, t:0, b:0.11 };
        let sz = levelStage.boundingSize;
        sz.w *= (substage.clip.r - substage.clip.l);
        sz.h *= (substage.clip.b - substage.clip.t);

        substage.pos = { x:0, y:0 };

        super(x, y, sz.w, sz.h);
        this.ignoreEvents = true;

        this.addChild(substage);
        this.substage = substage;
        //this.anchor = { x:0.5, y:0.5 };
    }

    // get size() {
    //     if (false && this.substage) {
    //         let substage = this.substage;
    //         let sz = substage.boundingSize;
    //         sz.w *= (substage.clip.r - substage.clip.l);
    //         sz.h *= (substage.clip.b - substage.clip.t);
    //         return sz;
    //     }
    //     else return super.size;
    // }

    get size() {
        return { w:this._size.w, h:this._size.h };
    }

    set size(sz) {
        if (sz) {
            this._size = { w:sz.w, h:sz.h };
            if (this.parent) this.parent.update();
        }
    }

    onmousedown(pos) {
        this.substage.onmousedown(pos);
    }
    onmousedrag(pos) {
        this.substage.onmousedrag(pos);
    }
    onmousehover(pos) {
        this.substage.onmousehover(pos);
    }

    expand() {
        let _this = this;
        this.expanded = true;
        let sz = { w:this.substage.embeddedStage.boundingSize.w, h:this.substage.embeddedStage.boundingSize.h };
        //let sz2 = { w:sz.w*1.02, h:sz.h*1.02 };
        Animate.tween(this, { size:sz }, 800, (e) => Math.pow(e, 2)).after(() => {
            //Animate.tween(this, { size:sz }, 100);
        });
        Animate.tween(this.substage, { clip:{ l:0, r:1, t:0, b:1 } }, 800, (e) => Math.pow(e, 2)).after(() => {
        });
        //Animate.tween(this.substage, { pos:{x:sz.w/2, y:sz.h/2} }, 1000, (e) => Math.pow(e, 2));
        //this.ignoreEvents = false;
    }
    shrink() {
        this.expanded = false;
        let substage = this.substage;
        let clip = { l:0.14, r:0.22, t:0, b:0.11 };
        let sz = substage.embeddedStage.boundingSize;
        // this.substage.pos = {x:sz.w/2, y:sz.h/2};
        sz.w *= (clip.r - clip.l);
        sz.h *= (clip.b - clip.t);
        //Animate.drawUntil(this.stage, () => (false));
        Animate.tween(this, { size:sz }, 1000, (e) => Math.pow(e, 2));
        Animate.tween(this.substage, { clip:clip }, 1000, (e) => Math.pow(e, 2));
        //Animate.tween(this.substage, { pos:{x:sz.w/2, y:sz.h/2} }, 1000, (e) => Math.pow(e, 2));
    }

    /*drawInternal(ctx, pos, boundingSize) {
        ctx.save();
        ctx.rect(pos.x, pos.y, boundingSize.w, boundingSize.h);
        ctx.clip();
    }
    drawInternalAfterChildren(ctx, pos, boundingSize) {
        ctx.restore();
    }*/
}

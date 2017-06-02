 
 
 

class EmptyExpr extends Expression {
    value() { return null; }
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

class FadedNullExpr extends FadedValueExpr {
    constructor() {
        super('null');
        this.color = "lightgray";
        this.graphicNode.color = 'black';
        this.opacity = 0.8;
    }
    poof() {
        if (!this.stage) return;
        Animate.poof(this);
        this.stage.remove(this);
    }
}

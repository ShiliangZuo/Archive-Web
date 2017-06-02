




class CountExpr extends Expression {
    constructor(collectionExpr) {
        if (typeof collectionExpr === 'undefined') {
            collectionExpr = new MissingExpression();
            collectionExpr.color = 'lightgray';
        }
        let txt = new TextExpr('count');
        super([txt, collectionExpr]);
        this.color = 'DarkTurquoise';
        txt.color = 'white';
    }
    onmouseclick() {
        this.performReduction();
    }
    reduce() {
        console.log(this.holes[1]);
        if (this.holes[1] instanceof MissingExpression) return this;
        else if (this.holes[1] instanceof BagExpr)      return [new (ExprManager.getClass('number'))(this.holes[1].items.length), this.holes[1]];
        else                                            return this;
    }
}

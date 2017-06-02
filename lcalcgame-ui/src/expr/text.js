class TextExpr extends ExpressionPlus {
    constructor(txt, font='Consolas, Monaco, monospace', fontSize=35) {
        super();
        this._text = txt;
        this.font = font;
        this.fontSize = fontSize; // in pixels
        this.color = 'black';
        this.shadow = null;
        this._sizeCache = null;
        this._yMultiplier = 2.2;
        this._xOffset = 0;
        this._sizeOffset = { w:0, h:0 };
        this._baseline = "alphabetic";
        this.stroke = null;
    }
    get text() {
        return this._text;
    }
    set text(txt) {
        this._text = txt;
        this._sizeCache = null; // invalidate size
    }
    get size() {
        var ctx = this.ctx || GLOBAL_DEFAULT_CTX;
        if (!ctx) {
            console.error('Cannot size text: No context.');
            return { w:4+this._sizeOffset.w, h:this.fontSize+this._sizeOffset.h };
        }
        else if (!this.text || this.text.length === 0) {
            return { w:4+this._sizeOffset.w, h:this.fontSize+this._sizeOffset.h };
        }
        else if (this.manualWidth) {
            return { w:this.manualWidth, h:DEFAULT_EXPR_HEIGHT };
        }
        else if (this._sizeCache) {
            // Return a copy because callers may mutate this
            return { w: this._sizeCache.size.w+this._sizeOffset.w, h: this._sizeCache.size.h+this._sizeOffset.h };
        }

        ctx.font = this.contextFont;
        var measure = ctx.measureText(this.text);
        this._sizeCache = {
            size: { w: measure.width, h:DEFAULT_EXPR_HEIGHT },
        };
        return { w:measure.width+this._sizeOffset.w, h:DEFAULT_EXPR_HEIGHT+this._sizeOffset.h };
    }
    get contextFont() {
        return this.fontSize + 'px ' + this.font;
    }
    drawInternal(ctx, pos, boundingSize) {
        var abs_scale = this.absoluteScale;
        ctx.save();
        ctx.font = this.contextFont;
        ctx.scale(abs_scale.x, abs_scale.y);
        ctx.fillStyle = this.color;
        if (this.shadow) {
            ctx.save();
            ctx.shadowColor = this.shadow.color;
            ctx.shadowBlur = this.shadow.blur;
            ctx.shadowOffsetX = this.shadow.x;
            ctx.shadowOffsetY = this.shadow.y;
            ctx.fillText(this.text, (pos.x + this._xOffset) / abs_scale.x, pos.y / abs_scale.y + this._yMultiplier * this.fontSize * this.anchor.y);
            ctx.restore();
        }
        ctx.textBaseline = this._baseline;
        let x = (pos.x + this._xOffset) / abs_scale.x
        let y = pos.y / abs_scale.y + this._yMultiplier * this.fontSize * this.anchor.y;
        if (this.stroke) {
            setStrokeStyle(ctx, this.stroke);
            ctx.strokeText(this.text, x, y);
        }
        ctx.fillText(this.text, x, y);
        ctx.restore();
    }
    hits(pos, options) { return false; } // disable mouse events
    value() { return this.text; }
    canReduce() { return true; }
}

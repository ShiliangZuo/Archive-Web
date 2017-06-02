/**
 * A graphically different expression
 * with a top, middle for an expression, and bottom.
 * Top resizes to subexpression width;
 * bottom resizes to middle expression's width.
 * Looks like the head of a wrench.
 */
const DEFAULT_BOT_CLAMP_HEIGHT = 24;
class ClampExpr extends Expression {

    aggregateSize(sizes, padding=null) {
        if (!padding) padding = { right:0, left:0, inner:0 };
        return { w:sizes.reduce((p, c) => p + c.w + padding.inner, padding.left) + padding.right,
                 h:Math.max(...sizes.map((sz) => sz.h)) + padding.inner };
    }
    getTopSize() {
        return this.aggregateSize(this.getHoleSizes().slice(0, this.breakIndices.top), this.padding);
    }
    getMidSize() {
        return this.aggregateSize(this.getHoleSizes().slice(this.breakIndices.top, this.breakIndices.mid), this.padding);
    }
    getBotSize() {
        if (this.breakIndices.bot > this.breakIndices.mid)
            return this.aggregateSize(this.getHoleSizes().slice(this.breakIndices.top, this.breakIndices.mid), this.padding);
        else {
            let s = this.getMidSize();
            s.h = DEFAULT_BOT_CLAMP_HEIGHT;
            //s.w += DEFAULT_BOT_CLAMP_HEIGHT;
            return s;
        }
    }

    // Sizes to match its children.
    get size() {
        var padding = this.padding;
        var width = 0;
        var height = DEFAULT_EXPR_HEIGHT;

        var topSize = this.getTopSize();
        var midSize = this.getMidSize();
        var botSize = this.getBotSize();

        var sz = { w:Math.max(topSize.w, midSize.w, botSize.w),
                   h:[topSize.h, midSize.h, botSize.h].reduce((a,b) => a + b, 0) };

        this.topRatio = { x:topSize.w/sz.w, y:(topSize.h+padding.inner)/sz.h };
        this.midRatio = { x:(padding.left*2)/sz.w, y:(midSize.h-padding.inner)/sz.h };
        this.botRatio = { x:(botSize.w-padding.left*2)/sz.w, y:botSize.h/sz.h };

        return sz;
    }

    update() {
        var _this = this;
        this.children = [];

        this.holes.forEach((expr) => _this.addChild(expr));
        // In the centering calculation below, we need this expr's
        // size to be stable. So we first set the scale on our
        // children, then compute our size once to lay out the
        // children.
        this.holes.forEach((expr) => {
            expr.anchor = { x:0, y:0.5 };
            expr.scale = { x:0.85, y:0.85 };
            expr.update();
        });
        var size = this.size;
        var padding = this.padding.inner;
        var x = this.padding.left;
        var y = this.getTopSize().h / 2.0 + (this.exprOffsetY ? this.exprOffsetY : 0);
        if (this._layout.direction == "vertical") {
            y = padding;
        }

        this.holes.forEach((expr, i) => { // Update hole expression positions.

            if (i === this.breakIndices.top) {
                x = this.getMidSize().w / 2.0 - expr.size.w / 2.0 * expr.scale.x;
                y += this.getTopSize().h + padding / 2;
            }

            expr.anchor = { x:0, y:0.5 };
            expr.pos = { x:x, y:y };
            expr.scale = { x:0.85, y:0.85 };
            expr.update();

            if (this._layout.direction == "vertical") {
                y += expr.anchor.y * expr.size.h * expr.scale.y;
                var offset = x;

                // Centering
                if (this._layout.align == "horizontal") {
                    var innerWidth = size.w;
                    var scale = expr.scale.x;
                    offset = (innerWidth - scale * expr.size.w) / 2;
                }

                expr.pos = { x:offset, y:y };

                y += (1 - expr.anchor.y) * expr.size.h * expr.scale.y;
                if (this.padding.between) y += this.padding.between;
            }
            else {
                x += expr.size.w * expr.scale.x + padding;
            }
        });

        this.children = this.holes; // for rendering
    }

    drawBaseShape(ctx, pos, boundingSize) {
        clampRect(ctx,
                  pos.x, pos.y,
                  boundingSize.w*this.topRatio.x, boundingSize.h*this.topRatio.y,
                  boundingSize.w*this.midRatio.x, boundingSize.h*this.midRatio.y,
                  boundingSize.w*this.botRatio.x, boundingSize.h*this.botRatio.y,
                  this.radius*this.absoluteScale.x, true, this.stroke ? true : false,
                  this.stroke ? this.stroke.opacity : null,
                  this.notches ? this.notches : null);
    }

}

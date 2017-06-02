

class Bag extends mag.Circle {
    constructor(x, y, rad, includeInner=true) {
        super(x, y, rad);

        if (includeInner) {
            var outerRad = rad - this.topSize(rad).h / 2.0;
            var innerRad = outerRad / 1.3;
            var inner = new mag.Circle(0, 0, innerRad);
            inner.pos = { x:outerRad - innerRad, y:rad/2.2 + (outerRad - innerRad) };
            inner.clipChildren = true;
            inner.clipBackground = 'bag-background';
            this.addChild(inner);
            this.inner = inner;
        }

        this.shadowOffset = 3;
    }
    addItem(item) {
        this.addChild(item);
        //this.inner.addChild(item);
    }
    removeItem(item) {
        this.removeChild(item);
        //this.inner.removeChild(item);
    }
    removeAllItems() {
        let children = this.children.filter((child) => (!child.clipChildren));
        children.forEach((child) => this.removeChild(child)); // ha-ha programming tricks ...
    }
    topSize(rad) {
        return { w:Math.round(rad) * 1.5, h:rad / 2.2 };
    }
    drawInternal(ctx, pos, boundingSize) {
        var rad = boundingSize.w / 2.0;
        var topSize = this.topSize(rad);
        rad -= topSize.h / 2.0;
        drawBag(ctx, pos.x, pos.y + this.shadowOffset, topSize.w, topSize.h, rad, 'black',    this.stroke);
        drawBag(ctx, pos.x, pos.y,                     topSize.w, topSize.h, rad, this.color, this.stroke);
    }
    drawInternalAfterChildren(ctx, pos, boundingSize) {
        var rad = boundingSize.w / 2.0;
        var topSize = this.topSize(rad);
        rad -= topSize.h / 2.0;
        drawBag(ctx, pos.x, pos.y, topSize.w, topSize.h, rad, null, this.stroke);
    }
}

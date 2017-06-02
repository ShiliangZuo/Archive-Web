/** Core drawing class - Node
 *  @module core/node
 */
var mag = (function(_) {

    class Node {
        constructor(x, y) {
            this._pos = { x:x, y:y };
            this.children = [];
            this.parent = null;
            this._stage = null;
            this.ignoreEvents = false;
        }
        get stage() { if(!this._stage && this.parent) return this.parent.stage; else return this._stage; }
        set stage(stg) { this._stage = stg; }
        get rootParent() {
            if (this.parent) return this.parent.rootParent;
            else if (this._stage) return this;
            else return null;
        }
        get pos() { return { x:this._pos.x, y:this._pos.y }; }
        get absolutePos() {
            var pos = this.pos;
            if (this.parent) return addPos(pos, this.parent.absolutePos);
            else             return pos;
        }
        set pos(p) { this._pos = p; }
        hasChild(child) {
            return this.children.indexOf(child) > -1;
        }
        addChild(child) {
            this.children.push(child);
            if (child) {
                child.parent = this;
            }
        }
        addChildAt(idx, child) {
            if (idx < 0 || idx >= this.children.count) {
                console.error('@ Node.addChildAt: Index out of range.');
                return;
            }
            this.children.splice(idx, 0, child);
            child.parent = this;
        }
        removeChild(node) {
            var i = this.children.indexOf(node);
            if (i > -1) {
                this.children[i].stage = null;
                this.children.splice(i, 1);
            }
        }
        addAll(children) {
            children.forEach((child) => this.addChild(child));
        }
        removeAll(children) {
            children.forEach((child) => this.removeChild(child));
        }
        posWithOffset(offset) {
            if (typeof offset === 'undefined') return this.pos;
            else return shiftPos(this.pos, offset);
        }
        update() {
            this.children.forEach((c) => c.update());
        }
        draw(ctx, offset) {
            var pos = this.posWithOffset(offset);
            this.drawInternal(ctx, pos);
            this.children.forEach((child) => child.draw(ctx, pos));
        }
        drawInternal(ctx, pos) { }

        // Events
        hits(pos, options={}) { return null; } // Whether the given position lies 'inside' this node. Returns the node that it hits (could be child).
        hitsChild(pos) { return null; }
        onmousedown(pos) { }
        onmousedrag(pos) { }
        onmouseclick(pos) { }
        onmousehover(pos) { }
        onmouseenter(pos) { }
        onmouseleave(pos) { }
        onmouseup(pos) { }

        // Drag 'n' drop
        ondropenter(node, pos) { }
        ondropped(node, pos) { }
        ondropexit(node, pos) { }

        // Name of class
        value() {
            return this.constructor.name;
        }

        // Generic clone function.
        get constructorArgs() { return null; }
        clone(parent=null) {
            //console.log("called clone in node.js");
            var ins = constructClassInstance(this.constructor, this.constructorArgs);
            //console.warn('Cloning', this.constructor);
            for (const key of Object.keys(this)) {
                let v = this[key];
                if (v && v instanceof Object) {
                    if ('x' in v && 'y' in v) v = { x:v.x, y:v.y };
                    else if ('w' in v && 'h' in v) v = { w:v.w, h:v.h };
                    else if ('color' in v && 'lineWidth' in v) v = { color:v.color, lineWidth:v.lineWidth };
                }
                ins[key] = v;
                //console.warn('Cloning', key, v);
            }
            ins.parent = parent;
            ins.children = ins.children.map((child) => child.clone(this));
            return ins;
        }

        // 'Equality.'
        equals(otherNode) {
            if (!otherNode || !otherNode.constructor) return false;
            else return this.constructor.name === otherNode.constructor.name;
        }
    }

    // Exports
    _.Node = Node;
    return _;
}(mag || {}));

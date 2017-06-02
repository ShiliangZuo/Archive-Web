/** Foundation of all other expressions in Reduct.
 *	@module expression
 */

const EMPTY_EXPR_WIDTH = 50;
const DEFAULT_EXPR_HEIGHT = 50;
const DEFAULT_CORNER_RAD = 20;
const DEFAULT_SUBEXPR_SCALE = 0.85;
var DEFAULT_RENDER_CTX = null;

/** A generic expression. Could be a lambda expression, could be an if statement, could be a for.
    In general, anything that takes in arguments and can reduce to some other value based on those arguments. */
class Expression extends mag.RoundedRect {
    constructor(holes=[]) {
        super(0, 0, EMPTY_EXPR_WIDTH, DEFAULT_EXPR_HEIGHT, DEFAULT_CORNER_RAD);

        this.holes = holes;
        this.padding = { left:10, inner:10, right:10 };
        this._size = { w:EMPTY_EXPR_WIDTH, h:DEFAULT_EXPR_HEIGHT };
        this.environment = null;
        this._layout = { 'direction': 'horizontal', 'align': 'vertical' };
        this.lockedInteraction = false;
        this._subexpScale = DEFAULT_SUBEXPR_SCALE;
        this._reducing = false;

        if (this.holes) {
            var _this = this;
            this.holes.forEach((hole) => {
                _this.addChild(hole);
            });
        }
    }
    equals(otherNode) {
        if (otherNode instanceof Expression && this.holes.length === otherNode.holes.length) {
            if (this.holes.length === 0)
                return this.value === otherNode.value;
            else {
                var b = true;
                for(let i = 0; i < this.holes.length; i++)
                    b &= this.holes[i].value === otherNode[i].value;
                return b;
            }
        }
        return false;
    }
    clone(parent=null) {
        //console.log("parent");
        //console.log(parent);
        var c = super.clone(parent);
        //console.log("c!!!!!");
        //console.log(c);
        var children = c.children;
        var holes = c.holes;
        c.children = [];
        c.holes = [];
        c.stroke = null;
        c.toolbox = null;
        children.forEach((child) => c.addArg(child));
        //c.holes = [];
        //holes.forEach((hole) => c.addHole(hole));
        //console.log("c.holes");
        //console.log(c.holes);
        return c;
    }

    // Makes all inner expressions undraggable, 'binding' them permanently.
    bindSubexpressions() {
        this.holes.forEach((hole) => {
            if (hole instanceof Expression && !(hole instanceof MissingExpression)) {
                if (hole instanceof ValueExpr || hole instanceof BooleanPrimitive)
                    hole.lock();
                hole.bindSubexpressions();
            }
        });
    }

    addHole(hole) {
        this.holes.push(hole);
    }

    addArg(arg) {
        this.holes.push(arg);
        this.addChild(arg);
    }

    removeArg(arg) {
        var idx = this.holes.indexOf(arg);
        if (idx > -1) {
            this.holes.splice(idx, 1); // remove 1 elem @ idx
            this.update();
        } else console.error('@ removeArg: Could not find arg ', arg, ' in expression.');
    }

    swap(arg, anotherArg) {
        if (!arg || anotherArg === undefined) return;
        var i = this.holes.indexOf(arg);
        if (i > -1) {

            if (anotherArg === null) {
                arg.detach();
                this.holes[i]._size = { w:50, h:50 };
                arg.stage.remove(arg);
            } else {

                this.holes.splice(i, 1, anotherArg);

                if (anotherArg) {
                    anotherArg.pos = arg.pos;
                    anotherArg.dragging = false;
                    anotherArg.parent = this;
                    anotherArg.scale = { x:this._subexpScale, y:this._subexpScale};
                    anotherArg.onmouseleave();
                    anotherArg.onmouseup();
                }

                arg.parent = null;
            }
            this.update();
        }
        else console.log('Cannot swap: Argument ', arg, ' not found in parent.');
    }

    get holeCount() {
        return this.holes ? this.holes.length : 0;
    }

    // Sizes to match its children.
    get size() {
        var padding = this.padding;
        var width = 0;
        var height = DEFAULT_EXPR_HEIGHT;
        var sizes = this.getHoleSizes();
        var scale_x = this.scale.x;

        if (this._layout.direction == "vertical") {
            width = EMPTY_EXPR_WIDTH;
            height = 0;
        }

        if (sizes.length === 0) return { w:this._size.w, h:this._size.h };

        sizes.forEach((s) => {
            if (this._layout.direction == "vertical") {
                height += s.h;
                width = Math.max(width, s.w);
            }
            else {
                height = Math.max(height, s.h);
                width += s.w + padding.inner;
            }
        });

        if (this._layout.direction == "vertical" && this.padding.between) {
            height += this.padding.between * (sizes.length - 1);
        }

        if (this._layout.direction == "vertical") {
            height += 2 * padding.inner;
            width += padding.left + padding.right;
        }
        else {
            width += padding.right; // the end
        }

        return { w:width, h: height };
    }

    getHoleSizes() {
        if (!this.holes || this.holes.length === 0) return [];
        var sizes = [];
        this.holes.forEach((expr) => {
            var size = expr ? expr.size : {w:EMPTY_EXPR_WIDTH, h:DEFAULT_EXPR_HEIGHT};
            size.w *= expr.scale.x;
            size.h *= expr.scale.y;
            sizes.push(size);
        });
        return sizes;
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
            expr.scale = { x:_this._subexpScale, y:_this._subexpScale };
            expr.update();
        });
        var size = this.size;
        var padding = this.padding.inner;
        var x = this.padding.left;
        var y = this.size.h / 2.0 + (this.exprOffsetY ? this.exprOffsetY : 0);
        if (this._layout.direction == "vertical") {
            y = padding;
        }

        this.holes.forEach((expr) => { // Update hole expression positions.
            expr.anchor = { x:0, y:0.5 };
            expr.pos = { x:x, y:y };
            expr.scale = { x:_this._subexpScale, y:_this._subexpScale };
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

    // Apply arguments to expression
    apply(args) {
        // ... //
    }

    // Apply a single argument at specified arg index
    applyAtIndex(idx, arg) {
        // ... //
    }

    // Get the containing environment for this expression
    getEnvironment() {
        if (this.environment) return this.environment;

        if (this.parent) return this.parent.getEnvironment();

        if (this.stage) return this.stage.environment;

        return null;
    }

    // Can this expression step to a value?
    canReduce() {
        return false;
    }

    // Is this expression already a value?
    isValue() {
        return false;
    }

    // Is this expression missing any subexpressions?
    isComplete() {
        if (this.isPlaceholder()) return false;
        for (let child of this.holes) {
            if (child instanceof Expression && !child.isComplete()) {
                return false;
            }
        }
        return true;
    }

    // Is this expression a placeholder for something else?
    isPlaceholder() {
        return false;
    }

    // Play an animation to remind the user that this is a placeholder.
    animatePlaceholderStatus() {
        Animate.blink(this);
    }

    // Play an animation to remind the user that this is currently reducing.
    animateReducingStatus() {
        this._reducingTime = 0;
        let twn = new mag.IndefiniteTween((t) => {
            stage.draw();

            this._reducingTime += t;

            if (!this._reducing || !this.stage) twn.cancel();
        });
        twn.run();
    }

    drawInternalAfterChildren(ctx, pos, boundingSize) {
        super.drawInternalAfterChildren(ctx, pos, boundingSize);
        this.drawReductionIndicator(ctx, pos, boundingSize);
    }

    drawReductionIndicator(ctx, pos, boundingSize) {
        if (this._reducing) {
            this.stroke = {
                lineWidth: 3,
                color: "lightblue",
                lineDash: [5, 10],
                lineDashOffset: this._reducingTime,
            };
        }
    }

    // Wrapper for performReduction intended for interactive use
    performUserReduction() {
        if (!this._reducing) {
            if (!this.canReduce()) {
                mag.Stage.getAllNodes([this]).forEach((n) => {
                    if (n instanceof Expression && n.isPlaceholder()) {
                        n.animatePlaceholderStatus();
                    }
                });
                return Promise.reject("Expression: expression cannot reduce");
            }
            console.log('r', this.canReduce);

            this.animateReducingStatus();

            this._reducing = this.performReduction(true);
            this._reducing.then(() => {
                this._reducing = false;
            }, () => {
                this._reducing = false;
            });
        }
        return this._reducing;
    }

    // Reduce this expression to another.
    // * Returns the newly built expression. Leaves this expression unchanged.
    reduce(options=undefined) {
        return this;
    }

    // Try and reduce the given child expression before continuing with our reduction
    performSubReduction(expr, animated=true) {
        return new Promise((resolve, reject) => {
            if (expr.isValue() || !expr.canReduce()) {
                resolve(expr);
                return;
            }
            let result = expr.performReduction(animated);
            if (result instanceof Promise) {
                result.then((result) => {
                    if (this.stage) this.stage.draw();
                    if (result instanceof Expression) result.lock();

                    after(400).then(() => {
                        if (this.stage) this.stage.draw();
                        return resolve(result);
                    });
                });
            }
            else {
                if (this.stage) this.stage.draw();
                let delay = 400;
                if (!result) {
                    result = expr;
                    delay = 0;
                }
                if (result instanceof Expression && !(result instanceof MissingExpression)) result.lock();
                after(400).then(() => {
                    if (this.stage) this.stage.draw();
                    return resolve(result);
                });
            }
        });
    }

    // * Swaps this expression for its reduction (if one exists) in the expression hierarchy.
    performReduction() {
        //console.log("called performReduction");
        var reduced_expr = this.reduce();
        if (reduced_expr !== undefined && reduced_expr != this) { // Only swap if reduction returns something > null.

            console.warn('performReduction with ', this, reduced_expr);

            if (!this.stage) return Promise.reject();

            this.stage.saveState();
            Logger.log('state-save', this.stage.toString());

            // Log the reduction.
            let reduced_expr_str;
            if (reduced_expr === null)
                reduced_expr_str = '()';
            else if (Array.isArray(reduced_expr))
                reduced_expr_str = reduced_expr.reduce((prev,curr) => (prev + curr.toString() + ' '), '').trim();
            else reduced_expr_str = reduced_expr.toString();
            Logger.log('reduction', { 'before':this.toString(), 'after':reduced_expr_str });

            var parent = this.parent ? this.parent : this.stage;
            if (reduced_expr) reduced_expr.ignoreEvents = this.ignoreEvents; // the new expression should inherit whatever this expression was capable of as input
            parent.swap(this, reduced_expr);

            // Check if parent expression is now reducable.
            if (reduced_expr && reduced_expr.parent) {
                var try_reduce = reduced_expr.parent.reduceCompletely();
                if (try_reduce != reduced_expr.parent && try_reduce !== null) {
                    Animate.blink(reduced_expr.parent, 400, [0,1,0], 1);
                }
            }

            if (reduced_expr)
                reduced_expr.update();

            return Promise.resolve(reduced_expr);
        }
        return Promise.resolve(this);
    }
    reduceCompletely() { // Try to reduce this expression and its subexpressions as completely as possible.
        //console.log("called reduce completely");
        let e = this;
        e.update();
        let prev_holes = e.holes;
        let prev_children = e.children;
        if (e.children.length === 0) return e.reduce();
        else {
            e.holes = e.holes.map((hole) => {
                if (hole instanceof Expression)
                    return hole.reduceCompletely();
                else
                    return hole;
            });
            e.update();
            //e.children = [];
            //e.holes.forEach((hole) => e.addChild(hole));
            var red = e.reduce();
            e.children = prev_children;
            e.holes = prev_holes;
            //e.holes.forEach((hole) => e.addChild(hole));
            return red;
        }
    }

    detach() {
        if (this.parent && !(this.parent instanceof PlayPen)) { // TODO: Make this not rely on class PlayPen.
            var ghost_expr;
            if (this.droppedInClass)
                ghost_expr = new this.droppedInClass(this);
            else
                ghost_expr = new MissingExpression(this);

            let stage = this.parent.stage;
            let beforeState = stage.toString();
            let detachedExp = this.toString();
            let parent = this.parent;

            parent.swap(this, ghost_expr);

            this.parent = null;
            stage.add(this);
            stage.bringToFront(this);

            let afterState = stage.toString();
            Logger.log('detached-expr', {'before':beforeState, 'after':afterState, 'item':detachedExp });
            stage.saveState();
            Logger.log('state-save', afterState);

            this.shell = ghost_expr;
        }
        if (this.toolbox) {

            if (this.stage) {
                this.stage.saveState();
                Logger.log('state-save', this.stage.toString());
            }

            this.toolbox.removeExpression(this); // remove this expression from the toolbox
            Logger.log('toolbox-dragout', this.toString());
        }

        if (this.lockedInteraction) {
            this.unlockInteraction();
        }
    }

    lock() {
        this.shadowOffset = 0;
        this.ignoreEvents = true;
        this.locked = true;
    }
    unlock() {
        this.shadowOffset = 2;
        this.ignoreEvents = false;
        this.locked = false;
    }
    lockSubexpressions(filterFunc=null) {
        this.holes.forEach((child) => {
            if (child instanceof Expression) {
                if (!filterFunc || filterFunc(child))
                    child.lock();
                child.lockSubexpressions(filterFunc);
            }
        });
    }
    unlockSubexpressions(filterFunc=null) {
        this.holes.forEach((child) => {
            if (child instanceof Expression) {
                if (!filterFunc || filterFunc(child))
                    child.unlock();
                child.unlockSubexpressions(filterFunc);
            }
        });
    }

    lockInteraction() {
        if (!this.lockedInteraction) {
            this.lockedInteraction = true;
            this._origonmouseclick = this.onmouseclick;
            this.onmouseclick = function(pos) {
                if (this.parent) this.parent.onmouseclick(pos);
            }.bind(this);
            this.holes.forEach((child) => {
                if (child instanceof Expression) {
                    child.lockInteraction();
                }
            });
        }
    }

    unlockInteraction() {
        if (this.lockedInteraction) {
            this.lockedInteraction = false;
            this.onmouseclick = this._origonmouseclick;
            this.holes.forEach((child) => {
                if (child instanceof Expression) {
                    child.unlockInteraction();
                }
            });
        }
    }

    hits(pos, options=undefined) {
        if (this.locked) return this.hitsChild(pos, options);
        else             return super.hits(pos, options);
    }

    onmousedrag(pos) {
        if (this.ignoreEvents) return;

        if (this.parent instanceof PlayPen)
            pos = fromTo(this.parent.absolutePos, pos);

        super.onmousedrag(pos);

        if (this.isSnapped()) {
            const UNSNAP_THRESHOLD = 30;
            if (distBetweenPos(this.pos, pos) >= UNSNAP_THRESHOLD) {
                this.disconnectAllNotches();
                this.onDisconnect();
            } else
                return;
        }

        const rightX = pos.x + this.absoluteSize.w;
        //if (rightX < GLOBAL_DEFAULT_SCREENSIZE.width) { // Clipping to edges
        this.pos = pos;
        //} else this.pos = { x:GLOBAL_DEFAULT_SCREENSIZE.width - this.absoluteSize.w, y:pos.y };

        if (!this.dragging) {
            this.detach();
            this.posBeforeDrag = this.absolutePos;
            this.stage.bringToFront(this);
            this.dragging = true;
        }

        // Fire notch events
        if (!this._prev_notch_objs) this._prev_notch_objs = [];
        let notchEventObjs = this.findCompatibleNotches();
        if (notchEventObjs.length !== 0 || this._prev_notch_objs.length !== 0) { // If some notch has entered our field of view...
            // Determine which notches are hovering:
            notchEventObjs.forEach((o) => { // Prev intersects Curr
                let hovering = this._prev_notch_objs.filter((a) => (a.notch == o.notch));
                hovering.forEach((h) => this.onNotchHover(h.otherNotch, h.otherExpr, h.notch));
            });
            // Determine which notches entered our view:
            let entering = notchEventObjs.filter((n) => { // Curr - Prev
                return this._prev_notch_objs.filter((a) => a.notch == n.notch).length === 0;
            });
            entering.forEach((h) => this.onNotchEnter(h.otherNotch, h.otherExpr, h.notch));
            // Determine which notches left our view:
            let leaving = this._prev_notch_objs.filter((n) => { // Prev - Curr
                return notchEventObjs.filter((a) => a.notch == n.notch).length === 0;
            });
            leaving.forEach((h) => this.onNotchLeave(h.otherNotch, h.otherExpr, h.notch));
            this._prev_notch_objs = notchEventObjs.slice();
        }
    }
    onmouseup(pos) {
        if (this.dragging && this.shell) {

            if(!this.parent) this.scale = { x:1, y:1 };
            this.shell = null;

            Logger.log('detach-commit', this.toString());
        }
        if (this.dragging) {
            if (this.toolbox && !this.toolbox.hits(pos)) {
                this.toolbox = null;

                Logger.log('toolbox-remove', this.toString());

                if (this.stage) {
                    this.stage.saveState();
                    Logger.log('state-save', this.stage.toString());
                }
            }

            // Snap expressions together?
            if (this._prev_notch_objs && this._prev_notch_objs.length > 0) {
                let closest = Array.minimum(this._prev_notch_objs, 'dist');
                this.onSnap(closest.otherNotch, closest.otherExpr, closest.notch);
            }

            Logger.log('moved', {'item':this.toString(), 'prevPos':JSON.stringify(this.posBeforeDrag), 'newPos':JSON.stringify(this.pos)});
        }

        this.dragging = false;
    }

    /*  Special Events */
    /*  Notch and Snapping events */
    isSnapped() {
        return this.notches && this.notches.some((n) => n.connection);
    }
    disconnectAllNotches() {
        if (!this.notches || this.notches.length === 0) return;
        this.notches.forEach((n) => n.unpair());
    }
    getNotchPos(notch) {
        if (!this.notches) {
            console.error('@ Expression.getNotchPos: Notch is not on this expression.', notch);
            return null;
        }
        let side = notch.side;
        let pos = this.upperLeftPos( this.pos, this.size );
        if (side === 'left')
            return { x: pos.x, y: pos.y + this.radius  + (this.size.h - this.radius) * (1 - notch.relpos) * this.scale.y };
        else if (side === 'right')
            return { x: pos.x + this.size.w * this.scale.x, y: pos.y + (this.radius + (this.size.h - this.radius * 2) * notch.relpos)*this.scale.y };
        else if (side === 'top')
            return { x: pos.x + this.radius + (this.size.w - this.radius * 2) * notch.relpos, y: pos.y };
        else if (side === 'bottom')
            return { x: pos.x + this.radius + (this.size.w - this.radius * 2) * (1 - notch.relpos), y: pos.y + this.size.h };
    }
    // Given another expression and one of its notches,
    // determine whether there's a compatible notch on this expression.
    findNearestCompatibleNotch(otherExpr, otherNotch) {
        let notches = this.notches;
        if (!notches || notches.length === 0) {
            return null; // By default, expressions do not have notches.
        } else if (!otherExpr || !otherNotch) {
            console.error('@ Expression.findNearestCompatibleNotch: Passed expression or notch is null.');
            return null;
        } else if (!otherExpr.notches || otherExpr.notches.length === 0) {
            return null;
        }

        // Loop through this expression's notches and
        // check for ones compatible to the passed notch.
        // Store the nearest candidate.
        const MINIMUM_ATTACH_THRESHOLD = 25;
        let otherPos = otherExpr.getNotchPos(otherNotch);
        let candidate = null;
        let prevDist = MINIMUM_ATTACH_THRESHOLD;
        notches.forEach((notch) => {
            if (notch.isCompatibleWith(otherNotch)) {
                let dist = distBetweenPos(this.getNotchPos(notch), otherPos);
                if (dist < prevDist) {
                    candidate = notch;
                    prevDist = dist;
                }
            }
        });

        if (candidate) {
            return {
                notch:candidate,
                dist:prevDist,
                otherNotch:otherNotch,
                otherExpr:otherExpr
            };
        } else {
            return null;
        }
    }
    findCompatibleNotches() {
        let stage = this.stage;
        if (!stage || !this.notches || this.notches.length === 0) return [];

        let notches = this.notches;
        let candidates = [];
        let dups = [];
        let exprs = stage.getRootNodesThatIncludeClass(Expression, [this]);
        exprs.forEach((e) => {
            if (!e.notches || e.notches.length === 0) {
                return;
            } else if(dups.indexOf(e) > -1) {
                console.warn('@ Expression.findCompatibleNotches: Duplicate expression passed.', e);
                return;
            } else {
                let nearest = [];
                e.notches.forEach((eNotch) => {
                    let n = this.findNearestCompatibleNotch(e, eNotch);
                    if (n) nearest.push(n);
                });
                if (nearest.length > 0) {
                    candidates.push(Array.minimum(nearest, 'dist'));
                    dups.push(e);
                }
            }
        });

        return candidates;
    }

    // Triggered after a nearest compatible notch is identified,
    // within some distance threshold.
    onNotchEnter(otherNotch, otherExpr, thisNotch) {
        otherExpr.stroke = { color:'magenta', lineWidth:4 };
    }
    // When a compatible notch has been identified and the user is
    // dragging this expression around within the other's snappable-zone,
    // this event keeps triggering.
    onNotchHover(otherNotch, otherExpr, thisNotch) {
    }
    // Triggered when this expression is dragged away from
    // the nearest compatible notch's snappable-zone.
    onNotchLeave(otherNotch, otherExpr, thisNotch) {
        otherExpr.stroke = null; // TODO: Fix this to use prospectPriorStroke
    }

    // Triggered when the user released the mouse and
    // a nearest compatible notch is available
    // (i.e., onmouseup after onNotchEnter was called and before onNotchLeave)
    onSnap(otherNotch, otherExpr, thisNotch, animated=true) {
        Notch.pair(thisNotch, this, otherNotch, otherExpr);

        this.anchor = { x:0, y:0 };
        let vec = fromTo(this.getNotchPos(thisNotch), otherExpr.getNotchPos(otherNotch));
        this.pos = addPos(this.pos, vec);

        //let notchPos = otherExpr.getNotchPos(otherNotch);
        //let nodeNotchDistY = this.getNotchPos(thisNotch).y - this.pos.y;
        //this.pos = { x:notchPos.x, y:notchPos.y - nodeNotchDistY };
        //this.stroke = null;
        if (animated) {
            Animate.blink(this, 500, [1,0,1], 1);
            Animate.blink(otherExpr, 500, [1,0,1], 1);
        }
    }
    onDisconnect() {

    }

    // The value (if any) this expression represents.
    value() { return undefined; }
    toString() {
        if (this.holes.length === 1) return this.holes[0].toString();
        let s = '(';
        for (let i = 0; i < this.holes.length; i++) {
            if (i > 0) s += ' ';
            s += this.holes[i].toString();
        }
        return s + ')';
    }
}

// A base Expression which does not equate .holes and .children.
// -> TODO: Remove the need for this by merging it with the base class.
class ExpressionPlus extends Expression {
    swap(arg, anotherArg) {
        super.swap(arg, anotherArg);

        // Now remove it from the children as well
        if (arg && anotherArg) {
            let i = this.children.indexOf(arg);
            if (i > -1) {
                // Don't add it again: it was already added when
                // Expression#swap called our #update().
                this.children.splice(i, 1);
                this.update();
            }
        }
    }

    _setHoleScales() {
        this.holes.forEach((expr) => {
            expr.anchor = { x:0, y:0.5 };
            expr.scale = { x:this._subexpScale, y:this._subexpScale };
            expr.update();
        });
    }

    update() {
        var _this = this;

        this.holes.forEach((expr) => {
            if (!_this.hasChild(expr)) _this.addChild(expr)
        });
        // In the centering calculation below, we need this expr's
        // size to be stable. So we first set the scale on our
        // children, then compute our size once to lay out the
        // children.
        this._setHoleScales();
        var size = this.size;

        var padding = this.padding.inner;
        var x = this.padding.left;
        var y = this.size.h / 2.0 + (this.exprOffsetY ? this.exprOffsetY : 0);
        if (this._layout.direction == "vertical") {
            y = padding;
        }

        this.holes.forEach((expr) => { // Update hole expression positions.
            expr.pos = { x:x, y:y };
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
    }

    clone(parent=null) {
        if (this.drawer) {
            let extras = [];
            this.children.forEach((c) => {
                if (this.holes.indexOf(c) === -1)
                    extras.push(c);
            });
            extras.forEach((c) => this.removeChild(c));
            let cln = super.clone(parent);
            extras.forEach((c) => this.addChild(c));
            return cln;
        } else
            return super.clone(parent);
    }
}

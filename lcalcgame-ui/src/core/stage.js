/**
 * A core drawing 'layer'.
 * You can add Nodes to this layer to display them and update them.
 */
var mag = (function(_) {

    // This construct allows us to embed stages within each other,
    // without messing with the internal logic that may be relied on
    // for the stage's children (such as identifying the part node as a Stage)
    class StageNode extends mag.Rect {
        constructor(x, y, stageToEmbed, canvas) {
            stageToEmbed._canvas = canvas; // if we try this normally, it's going to try to delegate the mouse, which we dont want.
            if (canvas) {
                let sz = stageToEmbed.boundingSize;
                super(x, y, sz.w, sz.h);
            } else {
                super(x, y, 0, 0);
            }
            this._embeddedStage = stageToEmbed;
            this._embeddedStage.draw = () => {
                this.draw(this._embeddedStage.ctx);
            };
            this._clip = { l:0, t:0, r:1, b:1 };
        }
        setup(stageToEmbed, canvas) {
            console.log('setup called with ', canvas);
            stageToEmbed._canvas = canvas;
            stageToEmbed.ctx = canvas.getContext('2d');
            let stage_size = this.embeddedStage.boundingSize;
            this._clip = { l:0, t:0, r:this._size.w / stage_size.w, b:this._size.h / stage_size.h };
            this.size = stage_size;
            this._embeddedStage = stageToEmbed;
            this._embeddedStage.draw = () => {
                this.draw(this._embeddedStage.ctx);
            };
        }
        setClipWithSize(sz) {
            let stage_size = this.embeddedStage.boundingSize;
            this._clip = { l:0, t:0, r:sz.w / stage_size.w, b:sz.h / stage_size.h };
        }

        hitsWithin(pos) {
            var boundingSize = this.absoluteSize;
            boundingSize.w *= (this._clip.r - this._clip.l);
            boundingSize.h *= (this._clip.b - this._clip.t);
            var upperLeftPos = this.upperLeftPos(this.absolutePos, boundingSize);
            if (pointInRect(pos, rectFromPosAndSize(upperLeftPos, boundingSize))) return this;
            else return null;
        }

        // Clipping regions of the underlying stage.
        get clip() {
            let c = this._clip;
            return { l:c.l, t:c.t, r:c.r, b:c.b };
        }
        set clip(c) {
            this._clip = { l:c.l, t:c.t, r:c.r, b:c.b };
        }
        get isClipped() {
            return this._clip.l > 0 || this._clip.t > 0 || this._clip.r < 1 || this._clip.b < 1;
        }

        // Access to embedded stage.
        get embeddedStage() {
            return this._embeddedStage;
        }
        set embeddedStage(s) {
            this._embeddedStage = s;
        }

        update() {
            this._embeddedStage.update();
        }

        drawInternal(ctx, pos, boundingSize) {
            if (!this._embeddedStage || !this._embeddedStage.canvas) {
                console.error('nblah');
                return;
            }

            let bz = this._embeddedStage.boundingSize;
            let scaleRatio = { x:boundingSize.w / bz.w, y:boundingSize.h / bz.h };
            this._embeddedStage.ctx = ctx;
            ctx.save();

            ctx.translate(pos.x, pos.y);

            // Clip drawing to only the stage (and possibly a subregion)
            let r = this.clip;
            ctx.translate((r.r - r.l) * boundingSize.w * this.anchor.x - (boundingSize.w * r.l),
                          (r.b - r.t) * boundingSize.h * this.anchor.y - (boundingSize.h * r.t));
            ctx.rect( boundingSize.w * r.l, boundingSize.h * r.t, boundingSize.w * (r.r - r.l), boundingSize.h * (r.b - r.t) );
            ctx.clip();

            ctx.scale(scaleRatio.x, scaleRatio.y);

            this._embeddedStage.drawImpl();
            ctx.restore();
        }

        // Events
        transformCoords(pos) {
            pos = clonePos(pos);
            let sz = this.absoluteSize;
            pos.x -= this.absolutePos.x;
            pos.y -= this.absolutePos.y;
            pos.x -= sz.w * this.anchor.x;
            pos.y -= sz.h * this.anchor.y;
            pos.x /= this.absoluteScale.x;
            pos.y /= this.absoluteScale.y;
            return pos;
        }
        hits(pos, options={}) {
            let h = this.hitsWithin(pos);
            if (h) console.log('hit');
            return h;
        }
        onmousedown(pos) {
            pos = this.transformCoords(pos);
            this._embeddedStage.onmousedown(pos);
        }
        onmousedrag(pos) {
            pos = this.transformCoords(pos);
            this._embeddedStage.onmousedrag(pos);
        }
        onmouseclick(pos) {
            pos = this.transformCoords(pos);
            this._embeddedStage.onmouseclick(pos);
        }
        onmousehover(pos) {
            pos = this.transformCoords(pos);
            this._embeddedStage.onmousehover(pos);
        }
        //onmouseenter(pos) {
        //    this._embeddedStage.onmouseenter(pos);
        //}
        //onmouseleave(pos) {
        //    this._embeddedStage.onmouseleave(pos);
        //}
        onmouseup(pos) {
            pos = this.transformCoords(pos);
            this._embeddedStage.onmouseup(pos);
        }

        onorientationchange() {}
    }

    class Stage {
        constructor(canvas=null) {
            if (canvas) this.canvas = canvas;
            else        this.ctx = null;
            this.nodes = [];
            this.hoverNode = null;
            this._scale = 1;
            this.requested = false;
        }
        get scale() { return this._scale; }
        set scale(s) {
            if (s === 0) return;
            this._scale = s;
        }
        get boundingSize() {
            let r = this._canvas.getBoundingClientRect();
            return { w:r.width / this.scale, h:r.height / this.scale };
        }
        get canvas() { return this._canvas; }
        set canvas(c) {
            if (c) {
                delegateMouse(c, this);
                this.ctx = canvas.getContext('2d');
            } else {
                delegateMouse(this._canvas, null);
                this.ctx = null;
            }
            this._canvas = c;
        }

        // Call this once all nodes are loaded into the stage,
        // for instance at level generation.
        // Extend this to do any final setup.
        finishLoading() { }

        clear() {
            if (this.color) {
                this.ctx.fillStyle = this.color;
                this.ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            else {
                this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        has(node) {
            return node && node.stage == this && this.nodes.indexOf(node) > -1;
        }
        add(node) {
            if (this.has(node)) return;
            node.stage = this;
            if(node.locked) node.unlock();
            this.nodes.push(node);
        }
        addAll(nodes) {
            nodes.forEach((n) => this.add(n));
        }
        remove(node) {
            var i = this.nodes.indexOf(node);
            if (i > -1) {
                this.nodes[i].stage = null;
                this.nodes.splice(i, 1);
            }
        }
        swap(node, anotherNodeOrNodes) {
            var i = this.nodes.indexOf(node);
            if (i > -1) {

                // just delete the node...
                if (anotherNodeOrNodes === null) {
                    this.nodes.splice(i, 1);
                    return;
                }

                this.nodes[i].stage = null;
                var origpos = this.nodes[i].upperLeftPos(this.nodes[i].absolutePos, this.nodes[i].absoluteSize);
                var pos;
                var total_width = 0;
                var rightpos;
                var scale = this.nodes[i].scale;

                var anotherNode = anotherNodeOrNodes;
                if (!Array.isArray(anotherNode)) {
                    anotherNode = [anotherNode];
                    origpos = this.nodes[i].centerPos();
                }

                pos = clonePos(origpos);

                for (let j = 0; j < anotherNode.length; j++) {
                    var an = anotherNode[j];
                    an.unlock();
                    an.pos = pos;
                    an.parent = null;
                    an.stage = this;
                    an.scale = this.nodes[i].scale;
                    if (anotherNode.length === 1)
                        an.anchor = { x:0.5, y:0.5 };
                    an.onmouseleave();
                    pos = addPos({ x:an.size.w + 6, y:0 }, pos);
                    total_width += an.size.w + 6;
                    if (j === 0) this.nodes.splice(i, 1, an);
                    else this.nodes.splice(i+j, 0, an);
                }

                // Can't duplicate horizontally or we'll go off-screen.
                // So, duplicate vertically.
                if (origpos.x + total_width > this.boundingSize.w) {
                    pos = clonePos(origpos);
                    anotherNode.forEach((n) => {
                        let p = n.pos;
                        n.pos = pos;
                        n.anchor = { x:0, y:0.5 };
                        pos = addPos({x:0, y:an.size.h + 6}, pos);
                    });
                }
                if (pos.x > this.boundingSize.w) {
                    let offset = pos.x - this.boundingSize.w;
                    anotherNode.forEach((n) => {
                        let p = n.pos;
                        n.pos = { x:p.x - offset, y:p.y };
                    });
                }
            }
        }
        bringToFront(node) {
            var i = this.nodes.indexOf(node);
            if (i > -1 && i < this.nodes.length-1) {
                var n = this.nodes[i];
                this.nodes.splice(i, 1);
                this.nodes.push(n);
                this.draw();
            }
        }

        /** Update all nodes on the stage. */
        update() {
            this.nodes.forEach((n) => n.update());
        }

        // Recursive functions that grab nodes on this stage with the specified class.
        getRootNodesThatIncludeClass(Class, excludedNodes=[]) {
            let ns = this.getNodesWithClass(Class, excludedNodes);
            let topns = ns.map((n) => n.rootParent);
            return topns.filter((n) => !n.parent && n._stage !== undefined);
        }
        getNodesWithClass(Class, excludedNodes=[], recursive=true, nodes=null) {
            if (!nodes) nodes = this.nodes;
            return mag.Stage.getNodesWithClass(Class, excludedNodes, recursive, nodes);
        }
        static getNodesWithClass(Class, excludedNodes=[], recursive=true, nodes=null) {
            if (!nodes) return null;
            var rt = [];
            nodes.forEach((n) => {
                var excluded = false;
                excludedNodes.forEach((excn) => {excluded |= n == excn || n.ignoreGetClassInstance;});
                if (excluded) return;
                else if (n instanceof Class) rt.push(n);
                if (recursive && n.children.length > 0) {
                    let childs = this.getNodesWithClass(Class, excludedNodes, true, n.children);
                    childs.forEach((c) => rt.push(c));
                }
            });
            return rt;
        }

        static getAllNodes(nodes, excludedNodes=[], recursive=true) {
            let result = [];

            nodes.forEach((n) => {
                if (excludedNodes.indexOf(n) > -1) return;
                else {
                    result.push(n);
                }

                if (recursive && n.children.length > 0) {
                    result = result.concat(Stage.getAllNodes(n.children, excludedNodes, true));
                }
            });

            return result;
        }

        /** Invalidates this stage, so that it won't draw to canvas or receive events. */
        invalidate() {
            this.invalidated = true;
            delegateMouse(this._canvas, null);
        }
        validate() {
            this.invalidated = false;
            delegateMouse(this._canvas, this);
        }

        /** Draw this stage to the canvas. */
        draw() {
            // To avoid redundant draws, when someone calls draw, we
            // instead try to schedule an actual redraw. Another
            // redraw cannot be scheduled until the previous one
            // completes. The scheduling is done using
            // requestAnimationFrame so that the browser has control
            // over the framerate.
            if (!this.requested) {
                this.requested = true;
                window.requestAnimationFrame(() => {
                    this.drawImpl();
                    this.requested = false;
                });
            }
        }

        drawImpl() {
            if (this.invalidated) return; // don't draw invalidated stages.
            this.ctx.save();
            this.ctx.scale(this._scale, this._scale);
            this.clear();
            const len = this.nodes.length;
            for (let i = 0; i < len; i++) {
                this.nodes[i].draw(this.ctx);
            }
            //this.nodes.forEach((n) => n.draw(this.ctx));
            this.ctx.restore();
        }


        // Event handlers.
        getNodeUnder(node, pos) {
            // Exclude nodes that are in the toolbox - we don't want
            // to allow any interaction except dragging them out.
            let is_toolbox = (e) => e && (e.toolbox || (e.parent && is_toolbox(e.parent)));
            var hit_nodes = this.getHitNodesIntersecting(node, {'exclude':[node]});
            var hit = null;
            if (hit_nodes.length > 0) {

                // Sort hit nodes by closeness to center of dragged node:
                const center = node.centerPos();
                hit_nodes.sort((a, b) => {
                    return distBetweenPos(center, a.centerPos()) > distBetweenPos(center, b.centerPos())
                });

                for(let i = hit_nodes.length-1; i > -1; i--) {
                    if (hit_nodes[i] != node && !is_toolbox(hit_nodes[i]))
                        hit = hit_nodes[i];
                }
            }
            return hit;
        }
        onmousedown(pos) { // Mouse clicked down.
            var hit_nodes = this.getHitNodes(pos);
            if (hit_nodes.length > 0) {
                hit_nodes[hit_nodes.length-1].onmousedown(pos); // only send to top-most node??
                this.heldNode = hit_nodes[hit_nodes.length-1];

                if (this.lastHeldNode != this.heldNode)
                    this.lastHeldNode = this.heldNode;
            }
            this.draw();
        }
        onmousedrag(pos) { // Mouse clicked + moving (drag).
            if (this.heldNode) { // Only send this event to the 'mousedown'd node.

                if (this.heldNode instanceof ReductStageExpr) {
                    this.heldNode.onmousedrag(pos);
                    this.draw();
                    return;
                }

                var nodepos = pos;
                if (this.heldNode.absoluteSize) {
                    if (!this.heldNodeOrigOffset)
                        this.heldNodeOrigOffset = fromTo(pos, this.heldNode.absolutePos);
                    nodepos = addPos(pos, this.heldNodeOrigOffset);
                }

                this.heldNode.onmousedrag(nodepos);

                // Check which node lies below the heldNode. If there is one,
                // let it know, and store it for the mouseup event.
                var underNode = this.getNodeUnder(this.heldNode, pos);
                if (this.underNode && this.underNode == underNode) { }
                else if (!this.underNode) {
                    if (underNode) underNode.ondropenter(this.heldNode, pos);
                    this.underNode = underNode;
                } else if (this.underNode != underNode) {
                    if (underNode) underNode.ondropenter(this.heldNode, pos);
                    this.underNode.ondropexit(this.heldNode, pos);
                    this.underNode = underNode;
                }

                this.draw();
            }
        }
        onmousehover(pos) { // Hovering without clicking.
            // .. safest to do nothing here for now .. //
            var hit_nodes = this.getHitNodes(pos);
            var hit = hit_nodes[hit_nodes.length-1];
            if (this.hoverNode) {
                if (hit === this.hoverNode) { // If hovering over this node and not its children...
                    this.hoverNode.onmousehover(pos);
                    //console.log('hovering over ', this.hoverNode.color);
                    this.draw();
                    return;
                }
                else {
                    this.hoverNode.onmouseleave(pos);
                    if (hit) {
                        hit.onmouseenter(pos);
                        this.hoverNode = hit;
                        this.draw();
                        return;
                    } else {
                        this.hoverNode = null;
                        this.draw();
                    }
                }
            }
            if (hit_nodes.length > 0) {
                hit_nodes[hit_nodes.length-1].onmouseenter(pos); // only send to top-most node??
                this.hoverNode = hit_nodes[hit_nodes.length-1];
                this.draw();
            }
        }
        onmouseclick(pos) {
            if (this.heldNode) {
                this.heldNode.onmouseclick(pos);
            }
        }
        onmouseup(pos) { // Mouse button unclicked.
            if (this.heldNode) { // Only send this event to the 'mousedown'd node.

                // Drag 'n' drop droppped event.
                if (this.underNode) {
                    this.underNode.ondropped(this.heldNode, pos);
                    this.underNode = null;
                }

                this.heldNode.onmouseup(pos);
                this.heldNode = null;
                this.heldNodeOrigOffset = null;

                this.update();
                this.draw();
            }
        }
        onkeydown(event) {}
        onkeypress(event) {}
        onkeyup(event) {}
        onorientationchange(event) {}
        getHitNodes(pos, options={}) {
            var hits = [];
            var hitnode = null;
            this.nodes.forEach((n) => {
                hitnode = n.hits(pos, options);
                if (hitnode) hits.push(hitnode);
            });
            return hits;
        }
        getHitNodesIntersecting(node, options={}, startingNodes) {
            if (typeof startingNodes === 'undefined') startingNodes = this.nodes;
            var hits = [];
            let nodeSize = node.absoluteSize;
            let nodeBounds = rectFromPosAndSize(node.upperLeftPos(node.absolutePos, nodeSize), nodeSize);
            var hitnode = null;
            startingNodes.forEach((n) => {
                if (n == node) return;

                // Check whether absolute boundaries intersect:
                let hitNodeSize = n.absoluteSize;
                let hitNodeBounds = rectFromPosAndSize(n.upperLeftPos(n.absolutePos, hitNodeSize), hitNodeSize)
                if (intersects(nodeBounds, hitNodeBounds)) {

                    // Give priority to intersections with child nodes (recursively)
                    let holes = n.holes ? n.holes.filter((e) => (e instanceof Expression)) : [];
                    if (holes.length > 0) {
                        let subintersections = this.getHitNodesIntersecting(node, options, holes);
                        if (subintersections.length > 0) {
                            hits = hits.concat(subintersections);
                            return;
                        }
                    }

                    // Get the intersection rectangle and its center point:
                    const intersection = rectFromIntersection(nodeBounds, hitNodeBounds);
                    const center = { x:intersection.x + intersection.w / 2.0, y:intersection.y + intersection.h / 2.0 };

                    // Use the hit test as if the cursor was at the center of the intersection:
                    // (this allows us to use existing hit test code, which relies on points, not rectangles)
                    hitnode = n.hits(center, options);
                    if (hitnode) {
                        hits.push(hitnode);
                    }
                }
            });
            return hits;
        }

        toString() {
            return "[Stage toString method is undefined]";
        }
    }

    function delegateMouse(canvas, stage) {

        const RIGHT_BTN = 2;
        var mouseIsDown = false;
        var mouseDragged = false;
        var mouseDownTime = 0;
        var missedDragCalls = [];
        const CLICK_DEBOUNCE_TIME = 80; // in ms

        function getMousePos(evt) {
            var rect = canvas.getBoundingClientRect();
            return {
              x: (evt.clientX - rect.left) / stage._scale,
              y: (evt.clientY - rect.top) / stage._scale
            };
        }
        function getTouch(evt, idx=0) {
            if (evt.touches.length > 0)
                return evt.touches[idx];
            else
                return evt.changedTouches[idx];
        }

        if (stage) {

            // MOUSE EVENTS
            var onmousedown = function(pos){

                stage.onmousedown( pos );

                mouseIsDown = true;
                mouseDragged = false;
                mouseDownTime = Date.now();
                missedDragCalls = [];
            };
            var onmouseup = function(pos){

                if (!mouseDragged) stage.onmouseclick( pos );

                stage.onmouseup( pos );

                mouseIsDown = false;
                mouseDragged = false;
            };
            var onmousemove = function(pos){

                if(!mouseIsDown) {
                    stage.onmousehover( pos );
                } else if (mouseDragged || Date.now() - mouseDownTime > CLICK_DEBOUNCE_TIME) { // debounce clicks
                    if (missedDragCalls.length > 0) {
                        missedDragCalls.forEach((call) => call());
                        missedDragCalls = [];
                    }
                    stage.onmousedrag( pos );
                    mouseDragged = true;
                } else {
                    missedDragCalls.push(function() {
                        stage.onmousedrag( pos );
                    });
                }
                return false;
            };
            canvas.onmousedown = (e) => {
                if (e.button === RIGHT_BTN) return false;
                onmousedown( getMousePos(e) );
                return false;
            };
            canvas.onmousemove = (e) => {
                if (e.button === RIGHT_BTN) return false;
                onmousemove( getMousePos(e) );
                return false;
            };
            canvas.onmouseup   = (e) => {
                if (e.button === RIGHT_BTN) return false;
                onmouseup( getMousePos(e) );
                return false;
            };

            // Keyboard events
            var getCBKeyEvent = (e) => { // Cross-browser wrapper for key events.
                let keycode = e.which || e.keyCode;
                let character = String.fromCharCode(keycode || e.charCode);
                return {
                    keyCode:keycode,
                    char:character,
                    shiftKey: e.shiftKey,
                    ctrlKey: e.ctrlKey,
                    altKey: e.altKey,
                    metaKey: e.metaKey
                };
            };
            var onkeydown = (e) => {
                let event = getCBKeyEvent(e);
                stage.onkeydown(event);
                if(e.keyCode == 32 || e.keyCode == 13) {
                    stage.onkeypress(event);
                    e.preventDefault();
                }
            };
            var onkeypress = (e) => {
                let event = getCBKeyEvent(e);
                console.log(event.char);
                stage.onkeypress(event);
            };
            var onkeyup = (e) => {
                let event = getCBKeyEvent(e);
                stage.onkeyup(event);
            };
            // Keep track of listeners so we can unregister them
            window.listeners = window.listeners || {};
            for (let key of Object.keys(window.listeners)) {
                window.removeEventListener(key, window.listeners[key], false);
            }
            window.listeners.keydown = onkeydown;
            window.listeners.keypress = onkeypress;
            window.listeners.keyup = onkeyup;
            window.addEventListener('keydown', onkeydown, false);
            window.addEventListener('keypress', onkeypress, false);
            window.addEventListener('keyup', onkeyup, false);

            // Touch events
            var ontouchstart = function(e) {

                var pos = getMousePos( getTouch(e) );

                stage.onmousehover(pos);
                onmousedown(pos);

                e.preventDefault();
            };
            var ontouchmove = function(e) {

                var pos = getMousePos( getTouch(e) );

                onmousemove(pos);

                e.preventDefault();
            };
            var ontouchend = function(e) {

                var pos = getMousePos( getTouch(e) );

                onmouseup(pos);
                stage.onmousehover( { x:-10000, y:-10000 } );

                e.preventDefault();
            };
            var ontouchcancel = function(e) {
                ontouchend(e);
                e.preventDefault();
            };

            // TOUCH EVENTS (MOBILE)
            if (canvas.listeners) {
                // Remove prior listeners to prevent events from being
                // fired multiple times
                for (let key of Object.keys(canvas.listeners)) {
                    canvas.removeEventListener(key, canvas.listeners[key], false);
                }
            }
            canvas.addEventListener('touchstart', ontouchstart, false);
            canvas.addEventListener('touchmove', ontouchmove, false);
            canvas.addEventListener('touchend', ontouchend, false);
            canvas.addEventListener('touchcancel', ontouchcancel, false);
            canvas.listeners = {
                'touchstart': ontouchstart,
                'touchmove': ontouchmove,
                'touchend': ontouchend,
                'touchcancel': ontouchcancel,
            };

        } else {
            canvas.onmousedown = null;
            canvas.onmouseup = null;
            canvas.onmousemove = null;
            mouseIsDown = false;
            mouseDragged = false;
        }
    }

    // Exports
    _.Stage = Stage;
    _.StageNode = StageNode;
    return _;
}(mag || {}));

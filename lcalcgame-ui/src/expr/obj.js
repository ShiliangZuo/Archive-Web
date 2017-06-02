/**
 * An inner 'play area' to mess around and make programs in.
 * It's a pen because you can't drag expressions _out_!
 */
class PlayPenExpr extends ExpressionPlus {
    constructor(name, numNotches=2) {

        let txt_input = new Expression([ new TextExpr(name ? name : 'obj') ]); // TODO: Make this text input field (or dropdown menu).
        txt_input.color = '#B3E389';
        txt_input.radius = 2;
        txt_input.lock();
        super([txt_input]);

        this.padding = { left:16, top:txt_input.size.h + 4, right:2, bottom:10, inner:8 };

        let pen = new PlayPen(this.padding.left, this.padding.top, 220-this.padding.left*2, 120+100*numNotches-this.padding.top*2);
        this.addChild(pen);
        this.pen = pen;

        this.color = 'YellowGreen';
        this.notches = [new WedgeNotch('left', 10, 10, 0.8, true)]; // notch in left side near top.
        this._origNotchLen = 0.25 * (this.size.h-this.radius*2);

                        //new WedgeNotch('left', 10, 10, 0.2, true),
                        //new WedgeNotch('right', 10, 10, 0.5, false)];  // for testing

        if (!numNotches || numNotches <= 0) numNotches = 2;

        let inner_hanger = new NotchHangerExpr(numNotches);
        inner_hanger.pos = { x:this.padding.left, y:30 };
        inner_hanger.color = this.color;
        this.hanger = inner_hanger;

        pen.addToPen(inner_hanger);

        this.update();
    }

    // 'Define'ing by connecting to notch.
    get nameExpr() { return this.children[0]; }
    get methods() {
        let defined = this.pen.innerStage.getNodesWithClass(DefineExpr).filter((e) => (e.isSnapped()));
        let res = {};
        for (let i = 0; i < defined.length; i++) {
            let e = defined[i];
            let reduce = (obj) => {
                this.lock();
                return e.generateNamedExpr().reduce();
            };
            res[defined[i].name] = reduce; // for now
        }
        return res;
    }
    setMethods(defineExprs) { // Used during parse setup, if there's preset methods to attach.
        if (!defineExprs || defineExprs.length === 0) return;
        // Make sure # of notches in hanger matches is enough to attach the number of predefined methods.
        let addedNotchCount = defineExprs.filter((e) => (e instanceof NotchHangerExpr)).length;
        this.hanger.numNotches = defineExprs.length + addedNotchCount;
        defineExprs = defineExprs.filter((e) => (e instanceof DefineExpr));
        let lastDef = null;
        defineExprs.forEach((e, i) => {
            if (!e) {
                console.warn('@ PlayPenExpr.setMethods: Expression is ', e, ' (Continuing....)');
            } else {
                this.pen.addToPen(e); // Add the DefineExpr to the stage.
                e.onSnap(this.hanger.notches[i], this.hanger, e.notches[0], false); // Artifically snap together, and don't animate.
                e.lock();
                e.lockSubexpressions();
                lastDef = e;
            }
        });
        this.update();
    }
    onSnap(otherNotch, otherExpr, thisNotch) {
        super.onSnap(otherNotch, otherExpr, thisNotch);
        if (this.nameExpr.holes.length === 1) {
            let drag_patch = new DragPatch(0, 0, 42, 52);
            this.nameExpr.addChild(drag_patch);
            this.nameExpr.update();
        }
    }
    onDisconnect() {
        if (this.nameExpr.holes.length > 1) {
            this.nameExpr.removeChild(this.nameExpr.children[1]);
        }
    }
    generateNamedExpr() {
        let funcname = this.nameExpr.children[0].text;
        let txt = this.nameExpr.children[0].clone();
        txt.fontSize = 22;
        txt._yMultiplier = 3.2;
        txt._xOffset = 10;

        // Return named object (expression).
        let obj = new ObjectExtensionExpr(txt, this.methods);
        obj.color = 'YellowGreen';
        return obj;
    }

    get size() {
        return { w:this.pen.size.w + this.padding.left*2, h:this.pen.size.h + this.padding.top + this.padding.bottom };
    }
    set size(sz) {
        //super.size = sz;
        this.pen.size = sz;
    }
    update() {
        super.update();
        this.pen.update();
        this.holes[0].pos = { x:this.holes[0].pos.x, y:this.holes[0].size.h/2.0+2 };
    }
    hitsBottomRightCorner(pos) {
        let a = this.absolutePos;
        let sz = this.size;
        return pos.x > (a.x + sz.w - this.padding.left*2) &&
            pos.y > (a.y + sz.h - this.padding.top*2);
    }
    onmousehover(pos) {
        super.onmousehover(pos);
        if (this.hitsBottomRightCorner(pos)) {
            this.resizing = true;
            this._prev_pos = undefined;
            SET_CURSOR_STYLE(CONST.CURSOR.RESIZE);
        } else {
            SET_CURSOR_STYLE(CONST.CURSOR.DEFAULT);
            this.resizing = false;
        }
    }
    onmousedrag(pos) {
        if (this.resizing) {
            let prev_pos = this._prev_pos || this.pos;
            let len = fromTo(prev_pos, pos);
            this._prev_pos = clonePos(pos);
            this.pen.size = { w:this.pen.size.w + len.x, h:this.pen.size.h+len.y };
            this.notches[0].relpos = 1.0 - this._origNotchLen / this.size.h;
        }
        else {
            super.onmousedrag(pos);

            // if (this._attachNode) {
            //     this._attachNode.detachAttachment(this);
            //     this._attachNode = null;
            // }
            //
            // const ATTACHMENT_THRESHOLD = 20;
            // let notchPos = this.notchPos;
            // let attachmentNodes = this.stage.getRootNodesThatIncludeClass(NewInstanceExpr);
            // attachmentNodes.forEach((node) => {
            //     if (!node.isAttached()) {
            //         let dist = distBetweenPos(notchPos, node.notchPos);
            //         if (dist < ATTACHMENT_THRESHOLD) {
            //             node.stroke = { color:'magenta', lineWidth:4 };
            //             this._attachProspect = node;
            //         } else {
            //             node.stroke = null;
            //             if (this._attachProspect && this._attachProspect == node)
            //                 this._attachProspect = null;
            //         }
            //     }
            // });
        }
    }
    onmouseleave(pos) {
        super.onmouseleave(pos);
        SET_CURSOR_STYLE(CONST.CURSOR.DEFAULT);
        this.resizing = false;
    }
    // onmouseup(pos) {
    //     super.onmouseup(pos);
    //     if (this._attachProspect) { // Snap this function block into the NewInstanceExpr notch:
    //         this._attachProspect.attach(this);
    //         this._attachNode = this._attachProspect;
    //         this._attachProspect = null;
    //     }
    // }
}

class PlayPenStage extends mag.StageNode {
    constructor(x, y, w, h) {
        super(x, y, new ReductStage(null), null);
        this._size = { w:w, h:h };
        this._isCanvasSetup= false;
        this.embeddedStage.color = "gray";
        this.shadowOffset = 0;
    }
    update() {
        if (!this._isCanvasSetup) {
            if (this.stage) {
                this.setup(this.embeddedStage, this.stage.canvas);
                this._isCanvasSetup = true;
            }
        } else {
            super.update();
        }
    }

    // Event bubbling
    ondropenter(node, pos) {
        if (this.parent)
            this.parent.ondropenter(node, pos);
    }
    ondropped(node, pos) {
        if (this.parent)
            this.parent.ondropped(node, pos);
    }
    ondropexit(node, pos) {
        if (this.parent)
            this.parent.ondropexit(node, pos);
    }
    onmouseenter(pos) {
        super.onmouseenter(pos);
        if (this.parent)
            this.parent.onmouseenter(pos);
    }
    onmouseleave(pos) {
        super.onmouseleave(pos);
        if (this.parent)
            this.parent.onmouseleave(pos);
    }
}

class PlayPenRect extends mag.Rect {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.color = '#444';
        this.addChild(new PlayPenStage(0, 0, w/2, h/2));
    }
}

class PlayPen extends mag.RoundedRect {
    constructor(x, y, w, h) {
        super(x, y, w, h, 12);
        this.color = '#444';
        this.shadowOffset = -2;

        let pps = new PlayPenStage(0, 0, 200, 200);
        pps.embeddedStage.color = this.color;
        this.addChild(pps);
        this.pps = pps;
        this.innerStage = pps.embeddedStage;
    }
    get size() {
        return super.size;
    }
    set size(sz) {
        super.size = sz;
        this.pps.setClipWithSize({ w:sz.w, h:sz.h });
    }

    // Basically addChild, but with some extra setup.
    // *Expressions inside the pen cannot be dragged out.*
    addToPen(expr) {

        const SCALE = 0.75;
        expr.scale = { x:SCALE, y:SCALE };
        expr.pos = fromTo(this.absolutePos, expr.absolutePos);

        let stage = this.stage;
        if (!stage) {
            console.warn('@ addToPen: PlayPen not member of a Stage.');
        } else if (!expr.stage || expr.stage != stage) {
            console.warn('@ addToPen: Expression has no stage, a different stage than PlayPen.');
        }
        else stage.remove(expr);

        this.innerStage.add(expr);
    }

    // Since this area is contained,
    // we won't allow child nodes outside of the container bounds to be hit.
    hits(pos, options) {
        if (this.hitsWithin(pos)) {
            return super.hits(pos, options);
        } else
            return false;
    }

    // Clip drawing children to just the inner region.
    drawInternalAfterChildren(ctx, pos, boundingSize) {
        ctx.restore();
        super.drawInternalAfterChildren(ctx, pos, boundingSize);
    }
    drawInternal(ctx, pos, boundingSize) {
        super.drawInternal(ctx, pos, boundingSize);
        ctx.save();
        roundRect(ctx,
                  pos.x, pos.y,
                  boundingSize.w, boundingSize.h,
                  this.radius*this.absoluteScale.x, this.color !== null, false,
                  this.stroke ? this.stroke.opacity : null);
        ctx.clip();
    }

    // Graphics
    toggleHighlight(on=true) {
        if (on) this.stroke = { color:'cyan', lineWidth:4 };
        else    this.stroke = null;
    }

    // Dropping expressions into the area
    ondropenter(node, pos) {
        if (node instanceof Expression && !this.hasChild(node))
            this.toggleHighlight(true);
    }
    ondropped(node, pos) {
        if (node instanceof Expression && !this.hasChild(node)) {
            this.toggleHighlight(false);

            this.addToPen(node);
        }
    }
    ondropexit(node, pos) {
        if (node instanceof Expression && !this.hasChild(node))
            this.toggleHighlight(false);
    }

    // Dragging container
    // onmouseenter(pos) {
    //     super.onmouseenter(pos);
    //     if (this.parent)
    //         this.parent.onmouseenter(pos);
    // }
    // onmousedrag(pos) {
    //     if (this.parent)
    //         this.parent.onmousedrag(pos);
    // }
    // onmouseup(pos) {
    //     if (this.parent)
    //         this.parent.onmouseup(pos);
    // }
}

/**
 * Any expression with dot notation '.' properties to access.
 * Properties can themselves return objects...
 */
class ObjectExtensionExpr extends ExpressionPlus {
    constructor(baseExpr, objMethods) {

        super([baseExpr]);
        this.padding = { left:0, inner:0, right:0 }; // don't pad the base expression

        if (!(baseExpr instanceof MissingExpression))
            baseExpr.lock();
        else
            baseExpr.shadowOffset = -2;

        //this._subexpScale = 1.0; // don't scale subexpressions
        this.radius = 8;
        this.update();

        // objDefinition follows the format:
        // ---------------------------------
        // {
        //   propertyName:
        //      // Acts as a reduce() function.
        //      function (baseExpr, arg1, ..., argN) {
        //          // do stuff with args...
        //          return transformedExpr;
        //      }
        // }

        let onCellSelect = (self, cell) => {
            // 'this' needs to be late-bound, or else cloning an
            // ObjectExtensionExpr means methods will be called on the
            // wrong object

            //self.setExtension(cell.children[0].text.replace('.', '').split('(')[0], cell.children[0]._reduceMethod);

            let methodText;
            let origText = cell.children[0].text;
            if (origText === '[..]') methodText = origText;
            else methodText = origText.replace('.', '').split('(')[0];
            this.setExtension(methodText, cell.children[0]._reduceMethod);
        };

        // Make pullout-drawer:
        let drawer = new PulloutDrawer(this.size.w, this.size.h/2, 8, 32, objMethods, onCellSelect);
        drawer.anchor = { x:0, y:0.32 };
        this.addChild(drawer);
        this.drawer = drawer;
        this.objMethods = objMethods;
        // TBI

    }
    onmousedrag(pos) {
        super.onmousedrag(pos);
        if (this.drawer && this.drawer.isOpen) this.drawer.close();
    }
    clone(parent=null) {
        if (this.drawer) {
            this.removeChild(this.drawer);
            let cln = super.clone(parent);
            this.addChild(this.drawer);
            return cln;
        } else {
            let cln = super.clone(parent);
            cln.holes = [];
            this.holes.forEach((hole) => cln.holes.push(hole));
            return cln;
        }
    }
    get constructorArgs() { return [this.holes[0].clone(), $.extend(true, {}, this.objMethods)]; }
    get methodArgs() {
        if (this.holes.length <= 1) return [];
        else {
            return this.holes.slice(1).filter((x) => (!(x instanceof TextExpr))); // everything not text must be an argument...
        }
    }
    isCompletelySpecified() {
        if (this.holes[0] instanceof MissingExpression) return false;
        let args = this.methodArgs;
        if (args.length === 0) return true;
        else return args.reduce((p, a) => (p && !(a instanceof MissingExpression)), true)
    }
    update() {
        // if (this.holes.length > 0)
        //     this.holes[0].scale = { x:1, y:1 };
        // if (this._argumentExpressions)
        //     this._argumentExpressions.forEach((e) => {e.scale = {x:0.85, y:0.85}; });
        super.update();
        if (this.drawer) {
            this.drawer.pos = { x:this.size.w, y:this.drawer.pos.y };
        }
    }
    onmouseclick() {
        this.performReduction();
    }
    canReduce() {
        //TODO
        return true;
    }
    reduce() {
        console.log('reduce() in ObjectExtensionExpr');
        if (this.holes[0] instanceof MissingExpression) return this;
        if (this.subReduceMethod) {
            let r;
            let args = this.methodArgs;
            //console.log(args);
            // Reduce the args before calling (call-by-value)
            for (let i = 0; i < args.length; i++) {
                let arg = args[i];
                if (arg.canReduce()) {
                    args[i] = arg.reduceCompletely();
                }
                else if (!arg.isValue()) {
                    console.warn("Can't call method; argument cannot reduce");
                    return this;
                }
            }
            let args0 = this.holes[0];
            if (args0.canReduce()) {
                args0 = args0.reduceCompletely();
            }

            //console.log("args0 && this.holes[0] after reducing");
            //console.log(args0);
            //console.log(this.holes[0]);

            if (args.length > 0) // Add arguments to method call.
                r = this.subReduceMethod(args0, ...args);
            else r = this.subReduceMethod(args0); // Method doesn't take arguments.
            if (r == args0) return this;
            else return r;
        } else return this;
    }
    setExtension(methodText, subReduceMethod=null, argExprs=null) {
        if (this.holes[1]) this.holes.splice(1, 1);

        let isProperty = false;

        if (!subReduceMethod) {
            subReduceMethod = this.objMethods[methodText];
        }

        if (typeof subReduceMethod === 'object') {
            isProperty = subReduceMethod["isProperty"];
            subReduceMethod = subReduceMethod["reduce"];
        }

        if (!argExprs) {
            let numArgs = subReduceMethod.length - 1;
            argExprs = [];
            while (numArgs > 0) {
                let me = new MissingExpression();
                me._size = { w:44, h:44 };
                argExprs.push(me);
                numArgs--;
            }
        } else if (!Array.isArray(argExprs))
            argExprs = [ argExprs ];

        // Left text
        //let methodtxt = new TextExpr('.' + methodText + '(');
        let pretext;
        let isIndicesNotation = methodText === '[..]';
        if (isIndicesNotation) pretext = '[';
        else pretext = '.' + methodText + (isProperty ? '' : '(');

        let methodtxt = new TextExpr(pretext);

        methodtxt.fontSize = 25;
        methodtxt._yMultiplier = 2.85;
        if (!(this.holes[0] instanceof MissingExpression)) {
            methodtxt._xOffset = -15;
            methodtxt._sizeOffset = {w:-15, h:0};
            //console.log("WHAT IS THIS?");
            //console.log(this);
            if (this.holes[0] instanceof VtableVarExpr) {
                methodtxt._xOffset = -5;
                methodtxt._sizeOffset = {w : -4, h : 0};
            }
            else if (this instanceof StringObjectExpr) {
                methodtxt._xOffset = -5;
                methodtxt._sizeOffset = {w : -4, h : 0};
            }
        } else this.holes[0].unlock();
        this.subReduceMethod = subReduceMethod;
        this.addArg(methodtxt);

        // Arguments / closing parentheses
        this._argumentExpressions = argExprs.slice();
        if (argExprs && argExprs.length > 0) {

            this.addArg(argExprs[0]);
            for (let i = 1; i < argExprs.length; i++) {
                let comma = new TextExpr(','); // comma to separate arguments
                comma.fontSize = methodtxt.fontSize;
                comma._yMultiplier = methodtxt._yMultiplier;
                this.addArg(comma);
                this.addArg(argExprs[i]);
            }
            //let closingParen = new TextExpr(')'); // comma to separate arguments
            let closingParen = new TextExpr(isIndicesNotation ? ']' : ')'); // comma to separate arguments

            closingParen.fontSize = methodtxt.fontSize;
            closingParen._yMultiplier = methodtxt._yMultiplier;
            this.addArg(closingParen);

        } else if (!isProperty) methodtxt.text += ')'; // just add closing paren.

        this.update();

        // TODO: Add recursive drawers...
        //this.drawer.close(false);

        this.removeChild(this.drawer);
        this.drawer = null;
    }

    _setHoleScales() {
        this.holes.forEach((expr) => {
            if (this._argumentExpressions && this._argumentExpressions.some((e) => (e == expr)))
                expr.scale = { x:0.7225, y:0.7225 };
            else
                expr.scale = { x:this._subexpScale, y:this._subexpScale };
            expr.anchor = { x:0, y:0.5 };
            expr.update();
        });
    }
}

class ArrayObjectExpr extends ObjectExtensionExpr {
    constructor(baseArray, defaultMethodCall=null, defaultMethodArgs=null) {
        super(baseArray,

              { // Reduce methods for the submethods of the object.
                'pop':(arrayExpr) => {
                    if (arrayExpr.items.length === 0) return arrayExpr; // TODO: This should return undefined.
                    let item = arrayExpr.items[arrayExpr.items.length-1].clone();
                    return item;
                },
                'push':(arrayExpr, pushedExpr) => {

                    if (pushedExpr instanceof ArrayObjectExpr)
                        pushedExpr = pushedExpr.holes[0];

                    if (!pushedExpr ||
                        pushedExpr instanceof MissingExpression ||
                        pushedExpr instanceof LambdaVarExpr)
                        return arrayExpr;
                    else {
                        let new_coll = arrayExpr.clone();
                        new_coll.addItem(pushedExpr.clone()); // add item to bag
                        return new_coll; // return new bag with item appended
                    }
                },
                'map':(arrayExpr, lambdaExpr) => {
                    let mapped = arrayExpr.map(lambdaExpr);
                    if (mapped) {
                        mapped.items = mapped.items.map((i) => i.reduceCompletely());
                        return mapped;
                    }
                    else return arrayExpr;
                },
                  'length': {
                            'isProperty': true,
                            'reduce': function (arrayExpr) {
                              this.isProperty = true;
                              return new (ExprManager.getClass('number'))(arrayExpr.items.length);
                          }
                  },
                  '[..]': (arrayExpr, numberExpr) => {
                      if (!numberExpr ||
                          numberExpr instanceof MissingExpression ||
                          numberExpr instanceof LambdaVarExpr) {
                          return arrayExpr;
                      }
                      else if (numberExpr.number >= arrayExpr.items.length) {
                          return arrayExpr; //TODO: return undefined
                      }
                      else {
                          return arrayExpr.items[numberExpr.number].clone();
                      }
                  },
                  'indexOf':(arrayExpr, findExpr) => {
                      if (findExpr instanceof ArrayObjectExpr)
                          findExpr = findExpr.holes[0];

                      if (!findExpr ||
                          findExpr instanceof MissingExpression ||
                          findExpr instanceof LambdaVarExpr)
                          return arrayExpr;
                      else {
                          let index = arrayExpr.items.indexOf(findExpr);
                          alert(index);
                      }
                  }
              });

        if (baseArray instanceof CollectionExpr) baseArray.disableSpill();
        this.color = 'YellowGreen';

        if (!defaultMethodCall) {}
        else if (defaultMethodCall in this.objMethods) {
            this.setExtension(defaultMethodCall, null, defaultMethodArgs); // TODO: method args
        } else {
            console.error('@ ArrayObjectExpr: Method call ' + defaultMethodCall + ' not a possible member of the object.');
        }

        this.defaultMethodCall = defaultMethodCall;
        this.defaultMethodArgs = defaultMethodArgs;
        this.baseArray = baseArray;
    }
    get constructorArgs() { return [this.holes[0].clone(), this.defaultMethodCall, this.defaultMethodArgs]; }
    reduce() {
        let r = super.reduce();
        if (r != this && r instanceof BracketArrayExpr) {
            return new ArrayObjectExpr(r); // if reduce value is itself an array, make it an Array object that the user can apply methods to.
        }
        return r;
    }
}

class DropdownCell extends mag.Rect {
    constructor(x, y, w, h, subexpr, onclick, color, highlightColor) {
        super(x, y, w, h);
        this.shadowOffset = 0;
        this.color = color;
        this.origColor = color;
        this.highlightColor = highlightColor;
        if (subexpr instanceof Expression) {
            if (subexpr instanceof TextExpr) {
                subexpr.pos = { x:w/20, y:h/2+22/4 };
                subexpr.fontSize = 22;
            }
            this.addChild(subexpr);
        }
        this.onclick = onclick;
    }
    onmouseenter(pos) {
        this.color = this.highlightColor;
    }
    onmouseclick(pos) {
        if (this.onclick) this.onclick(this);
    }
    onmouseleave(pos) {
        this.color = this.origColor;
    }
}

class DropdownSelect extends mag.Rect {
    constructor(x, y, cellW, cellH, exprs, onCellClick, lowColor, highColor, highlightColor, startExpanded=true) {
        super(x, y, cellW, startExpanded ? cellH*exprs.length : cellH);
        this.highColor = highColor;
        this.lowColor = lowColor;

        // Create cells + add:
        this.cells = [];
        let cellX = 0;
        let cellY = 0;
        for (let i = 0; i < exprs.length; i++) {
            let cellColor = i % 2 === 0 ? lowColor : highColor;
            let onclick = (cell) => this.clicked(cell);
            let cell = new DropdownCell(cellX, cellY, cellW, cellH, exprs[i], onclick, cellColor, highlightColor);
            this.cells.push(cell);
            if (startExpanded || i === 0) this.addChild(cell);
            cellY += cellH;
        }

        this.onCellClick = onCellClick;
    }

    relayoutCells() {
        let cellX = 0;
        let cellY = 0;
        this.cells.forEach((c, i) => {
            c.origColor = c.color = i % 2 === 0 ? this.lowColor : this.highColor;
            c.pos = { x:cellX, y:cellY };
            cellY += c.size.h;
        });
    }
    resize() {
        const cellsize = this.children[0].size;
        this.size = { w:cellsize.w, h:cellsize.h*this.children.length };
    }

    expand(animated=false) {
        if (this.cells.length <= 1) { }
        else if (animated) {
            const FADE_TIME = 100;
            let waittime = 0;
            this.cells.slice(1).forEach((c, i) => {
                c.opacity = 0;
                Animate.wait(waittime).after(() => {
                    Animate.tween(c, { opacity:1.0 }, FADE_TIME, (e) => {
                        this.stage.draw();
                        return e;
                    }).after(() => {
                        c.opacity = 1.0;
                        this.resize();
                        this.stage.draw();
                    });
                });
                waittime += FADE_TIME;
                this.children[i+1] = c;
            });
        }
        else {
            this.children = this.cells.slice();
            this.relayoutCells();
            this.resize();
            this.stage.draw();
        }
        this._expanded = true;
    }
    close() {
        this.children = this.cells.slice(0, 1);
        this.resize();
        this.relayoutCells();
        this.stage.draw();
        this._expanded = false;
    }

    clicked(cell) {
        const cellIdx = this.cells.indexOf(cell);
        if (cellIdx < 0 || cellIdx >= this.cells.length) {
            console.error('@ DropdownSelect: Cell index out of range.');
            return;
        } else if (!this._expanded) { // closed. do nothing
            this.expand(false);
            return;
        }

        // Move clicked cell to front of array.
        let clickedCell = this.cells.splice(cellIdx, 1)[0];
        this.cells.splice(0, 0, clickedCell);

        // Close select
        this.close();

        // Fire callback
        if (this.onCellClick) this.onCellClick(this.parent.parent, cell);
    }
}

class PulloutDrawerHandle extends mag.ImageRect {
    constructor(x, y, w, h, onclick) {
        super(x, y, w, h, 'pullout-drawer-handle');
        this.onclick = onclick;
    }

    // Events
    onmouseenter(pos) {
        super.onmouseenter(pos);
        SET_CURSOR_STYLE(CONST.CURSOR.HAND); // col-resize is another option
    }
    onmouseclick(pos) {
        if(this.onclick) this.onclick();
    }
    onmouseleave(pos) {
        super.onmouseleave(pos);
        SET_CURSOR_STYLE(CONST.CURSOR.DEFAULT);
    }
}

class PulloutDrawer extends mag.Rect {
    constructor(x, y, w, h, propertyTree, onCellSelect) {
        super(x, y, w, h);
        this.color = null;

        let onclick = () => {
            if (this.isOpen) this.close();
            else             this.open();
        };

        let cellBg = new mag.Rect(0, 0, 0, h);
        cellBg.color = "Green";
        cellBg.ignoreEvents = true;
        this.addChild(cellBg);
        this.cellBg = cellBg;

        let handle = new PulloutDrawerHandle(0, 0, w, h, onclick);
        this.addChild(handle);
        this.handle = handle;

        // Generate TextExpr for each property:
        let txts = [];
        for (var key in propertyTree) {
            if (propertyTree.hasOwnProperty(key)) {
                let str;
                let f = propertyTree[key];
                if (typeof f === 'object' && f.isProperty) {
                    str = '.' + key;
                }
                else if (key === '[..]') {
                    str = key;
                } else if (typeof f === 'function' && f.length > 1) {
                    str = '.' + key + '(..)';
                } else {
                    str = '.' + key + '()';
                }
                let t = new TextExpr(str);
                t.ignoreEvents = true;
                t._reduceMethod = f;
                txts.push( t );
            }
        }
        this.txts = txts;
        this.onCellSelect = onCellSelect;
    }

    // Open the drawer
    open() {
        const DUR = 300;
        const W = 130;
        const cellsize = this.cellBg.size;
        const smoothFunc = (e) => Math.pow(e, 2);
        Animate.tween(this.cellBg, { size:{w:W, h:cellsize.h} }, DUR, smoothFunc);
        Animate.tween(this.handle, { pos:{x:W, y:0} }, DUR, smoothFunc);
        Animate.wait(DUR).after(() => {

            // Open the dropdown box.
            let dropdown = new DropdownSelect( 0, 0, W, cellsize.h, this.txts, this.onCellSelect, "YellowGreen", "MediumSeaGreen", "PaleGreen", false );
            this.addChild(dropdown);
            this.dropdown = dropdown;
            dropdown.expand(true);
        });
        Resource.play('drawer-open');
        this.isOpen = true;
    }

    // Close the drawer
    close(animated=true) {
        this.removeChild(this.dropdown);
        if (animated) {
            const DUR = 200;
            Animate.tween(this.cellBg, { size:{w:0, h:this.cellBg.size.h} }, DUR);
            Animate.tween(this.handle, { pos:{x:0, y:0} }, DUR);
            Resource.play('drawer-close');
        } else {
            this.cellBg.size = { w:0, h:this.cellBg.size.h };
            this.handle.pos = zeroPos();
        }
        this.isOpen = false;
    }

}

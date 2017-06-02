/**
 * Special function expressions inside the game, like map, fold, etc.
 */
class MapFunc extends FuncExpr {
    constructor(oneParamFunc, bag) {
        //let txt = new TextExpr('map');

        let returnBag = new BagExpr(0,0,54,54);
        returnBag.lock();

        super([returnBag, oneParamFunc, bag]);
        this._arrows = [];
        this.exprOffsetY = DEFAULT_EXPR_HEIGHT / 4.0;
        this.heightScalar = 1.5;
        this.animatedReduction = true;
        this.update();

        this.color = "YellowGreen";
    }

    updateArrowPaths() {
        // Arrow from func expr to left bag:
        function topMiddlePoint(expr) {
            return expr.posOnRectAt( CONST.POS.UNITSQUARE.TOP.MID() );
        }
        function leftMiddlePoint(expr) {
            return expr.posOnRectAt( CONST.POS.UNITSQUARE.LEFT.MID() );
        }
        function rightMiddlePoint(expr) {
            return expr.posOnRectAt( CONST.POS.UNITSQUARE.RIGHT.MID() );
        }
        function topMiddleFuncHolePoint(func) {
            if (func.holes.length > 0)
                return func.posOnRectAt( { x:(func.holes[0].pos.x + func.holes[0].size.w) / func.absoluteSize.w, y:0 } );
            else
                return func.posOnRectAt( { x:0.25, y:0 } );
        }

        // Create arrow paths.
        let funcToReturnBagArrowPath = new ArrowPath();
        let topY = this.func.pos.y - this.func.size.h / 2.0 - 12;
        let betweenReturnBagAndFunc = middleOf( rightMiddlePoint(this.returnBag), leftMiddlePoint(this.func) );
        let betweenReturnBagAndFuncTop = { x:betweenReturnBagAndFunc.x, y:topY };
        let returnBagTopMid = topMiddlePoint(this.returnBag);
        let returnBagTopMidTop = { x:returnBagTopMid.x, y:topY };
        funcToReturnBagArrowPath.addPoint( leftMiddlePoint(this.func) );
        funcToReturnBagArrowPath.addPoint( betweenReturnBagAndFunc );
        funcToReturnBagArrowPath.addPoint( betweenReturnBagAndFuncTop );
        funcToReturnBagArrowPath.addPoint( returnBagTopMidTop );
        funcToReturnBagArrowPath.addPoint( returnBagTopMid );
        funcToReturnBagArrowPath.parent = this;
        this.funcToReturnBagArrowPath = funcToReturnBagArrowPath;
        funcToReturnBagArrowPath.color = MapFunc.arrowPathColor();

        let bagToFuncArrowPath = new ArrowPath();
        let leftBag = topMiddlePoint(this.bag);
        let leftBagTop = { x:leftBag.x, y:topY };
        let funcHoleMid = topMiddleFuncHolePoint(this.func);
        let funcHoleMidTop = { x:funcHoleMid.x, y:topY };
        bagToFuncArrowPath.addPoint( leftBag );
        bagToFuncArrowPath.addPoint( leftBagTop );
        bagToFuncArrowPath.addPoint( funcHoleMidTop );
        bagToFuncArrowPath.addPoint( funcHoleMid );
        bagToFuncArrowPath.parent = this;
        this.bagToFuncArrowPath = bagToFuncArrowPath;
        bagToFuncArrowPath.color = MapFunc.arrowPathColor();

        this.arrowPaths = [bagToFuncArrowPath, funcToReturnBagArrowPath];
    }

    get constructorArgs() { return [this.func.clone(), this.bag.clone()]; }
    get returnBag() {
        return this.holes[0];
    }
    get func() {
        return this.holes[1];
    }
    get bag() {
        return this.holes[2];
    }
    set bag(bg) {
        this.holes[2] = bg;
    }
    toString() {
        return '(map ' + this.func.toString() + ' ' + this.bag.toString() + ')';
    }


    reduce() {
        this.update();
        if (!this.bag || !this.func) return this;
        else if (!(this.bag instanceof BagExpr)) {
            console.error('@ MapFunc.reduce: Bag param is not a BagExpr.');
            return this;
        }
        else if (this.func instanceof LambdaExpr && this.func.takesArgument && this.func.fullyDefined) {

            // Accepts at least one argument. Apply func over all items in the bag.
            console.log('@ MapFunc: Mapping', this.func, this.bag);
            return this.bag.map(this.func);

        } else return this;
    }
    reduceCompletely() { // A map's reduce function is the most complete reduction possible.
        return this.reduce();
    }

    performReduction() {
        var reduced_expr = this.reduce();
        if (!this.isAnimating && reduced_expr && reduced_expr != this) {

            let stage = this.stage;
            let func = this.func;
            let bagCopy = this.bag.clone();
            var superReduce = () => {
                this.bag = bagCopy;
                this.update();
                this.bag = super.performReduction();
                stage.draw();
            };

            // Run 'map' animation.
            if (this.bag instanceof BagExpr) {

                // debug
                if (!this.animatedReduction) {
                    superReduce();
                    this.bag.spill(false); // don't log this spill
                    stage.remove(this.bag);
                    return;
                }
                else this.bag.lock();

                var bagAfterMap = this.reduce();
                var popCount = bagAfterMap.items.length / this.bag.items.length; // in case ßthere was replication...ß

                var _this = this;
                var bagToFuncArrowPath;
                var bag = this.bag;
                var mapSize = this.absoluteSize;
                var mapCenterPos = this.centerPos();
                var runNextAnim = (n) => {

                    if (bag.items.length === 0) {

                        // Reached end of bag. Terminate animation.
                        this.isAnimating = false;
                        stage.remove(this);
                        stage.update();
                        stage.draw();

                    } else {

                        // Pop an item off the bag.
                        let item = bag.popItem();
                        var itemsAfterMap = [];
                        for ( let i = 0; i < popCount; i++ )
                            itemsAfterMap.push( bagAfterMap.popItem() ); // TODO: Replicators...

                        func.holes[0].open();

                        // Add it to the stage, making it smaller
                        // so that it can 'follow' the path of the arrow from bag into function.
                        stage.add(item);
                        stage.update();
                        bagToFuncArrowPath = _this.bagToFuncArrowPath;

                        item.scale = { x:0.5, y:0.5 };
                        item.parent = null;

                        let preview_item = item.clone();
                        preview_item.parent = null;

                        this.isAnimating = true;

                        var dropItem = () => {

                            // Preview
                            func.holes[0].ondropenter(preview_item);

                            // Remove item (preview) from the stage when it reaches end of arrow path (enters 'function' hole).
                            stage.remove(item);
                            stage.update();

                            mapCenterPos = _this.centerPos();

                            let preview_duration = func.isConstantFunction ? 100 : 1000;

                            Animate.wait(preview_duration).after(function () {

                                func.holes[0].ondropexit();

                                // Spill individial items onto stage as they are created.
                                for (let i = 0; i < itemsAfterMap.length; i++) {

                                    let itemAfterMap = itemsAfterMap[i];
                                    let pos = func.body.absolutePos;

                                    itemAfterMap.pos = pos;
                                    itemAfterMap.scale = { x:1.0, y:1.0 };
                                    itemAfterMap.parent = null;
                                    stage.add(itemAfterMap);

                                    let theta = Math.random() * Math.PI * 2;
                                    //let radX = mapSize.w / 2.0;
                                    //let radY = mapSize.h / 2.0 * 2.0;
                                    let radX = bag.size.h * 1.5;
                                    let radY = radX;
                                    let sz = itemAfterMap.absoluteSize;
                                    let center = addPos(pos, { x:-sz.w, y:0 } );

                                    let targetPos = addPos(center, { x:radX * Math.cos(theta),
                                                                     y:radY * Math.sin(theta) } );
                                    //                                 y:radY + radY * Math.abs(Math.sin(theta)) / 2.0 } );

                                    targetPos = clipToRect(targetPos, itemAfterMap.absoluteSize, { x:25, y:0 },
                                                             {w:GLOBAL_DEFAULT_SCREENSIZE.width-25,
                                                              h:GLOBAL_DEFAULT_SCREENSIZE.height - stage.toolbox.size.h});

                                    Animate.tween(itemAfterMap, { 'pos':targetPos }, 500, (elapsed) => Math.pow(elapsed, 0.5));
                                }
                                stage.draw();

                                runNextAnim( n + 1 );

                            });
                        };

                        if (bagToFuncArrowPath)
                            Animate.followPath(item, bagToFuncArrowPath, 800).after(dropItem);
                        else dropItem();
                    }
                };

                runNextAnim(0);

            } else if (this.bag instanceof Expression) {

                let expr = this.bag.clone();
                this.stage.add(expr);
                expr.parent = null;
                Animate.followPath(expr, this.bagToFuncArrowPath);

            } else {
                console.error('@ MapFunc.performReduction: this.bag is not a valid expression.');
                return this;
            }

        }
    }

    // Sizes to match its children.
    get size() {
        let sz = super.size;
        sz.h = DEFAULT_EXPR_HEIGHT * this.heightScalar;
        return sz;
    }
}

class SimpleMapFunc extends MapFunc {
    constructor(oneParamFunc, bag) {
        super(oneParamFunc, bag);

        this.holes = [];
        this.addArg(bag);
        this.addArg(oneParamFunc);
        this.update();

        this.color = "YellowGreen";
    }
    updateArrowPaths() {

        if (!this.bag || !this.func) return;

        // Arrow from func expr to left bag:
        function topMiddlePoint(expr) {
            return expr.posOnRectAt( CONST.POS.UNITSQUARE.TOP.MID() );
        }
        function leftMiddlePoint(expr) {
            return expr.posOnRectAt( CONST.POS.UNITSQUARE.LEFT.MID() );
        }
        function rightMiddlePoint(expr) {
            return expr.posOnRectAt( CONST.POS.UNITSQUARE.RIGHT.MID() );
        }
        function topMiddleFuncHolePoint(func) {
            if (func.holes.length > 0)
                return func.posOnRectAt( { x:(func.holes[0].pos.x + func.holes[0].size.w) / func.absoluteSize.w, y:0 } );
            else
                return func.posOnRectAt( { x:0.25, y:0 } );
        }

        // Create arrow paths.
        let bagToFuncArrowPath = new ArrowPath();
        let topY = this.func.pos.y - this.func.size.h / 2.0 - 12;
        let leftBag = topMiddlePoint(this.bag);
        let leftBagTop = { x:leftBag.x, y:topY };
        let funcHoleMid = topMiddleFuncHolePoint(this.func);
        let funcHoleMidTop = { x:funcHoleMid.x, y:topY };
        bagToFuncArrowPath.addPoint( leftBag );
        bagToFuncArrowPath.addPoint( leftBagTop );
        bagToFuncArrowPath.addPoint( funcHoleMidTop );
        bagToFuncArrowPath.addPoint( funcHoleMid );
        bagToFuncArrowPath.parent = this;
        bagToFuncArrowPath.color = MapFunc.arrowPathColor();
        this.bagToFuncArrowPath = bagToFuncArrowPath;

        this.arrowPaths = [ bagToFuncArrowPath ];
    }
    get returnBag() { return null; }
    get func() {
        return this.holes[1];
    }
    get bag() {
        return this.holes[0];
    }
    set bag(bg) {
        this.holes[0] = bg;
    }
}




class FadedSimpleMapFunc extends SimpleMapFunc {
    constructor(oneParamFunc, bag) {
        super(oneParamFunc, bag);

        let txt_color = 'black';
        let txt = new TextExpr('.map(');
        txt.color = txt_color;
        let txt2 = new TextExpr(')');
        txt2.color = txt_color;

        this.holes = [];
        this.addArg(bag);
        this.addArg(txt);
        this.addArg(oneParamFunc);
        this.addArg(txt2);
        this.arrowPaths = [];
        //this.heightScalar = 1.0;
        //this.exprOffsetY = 0;
        //this.animatedReduction = false;
        this.update();

        this.color = "YellowGreen";
    }
    get returnBag() { return null; }
    get func() {
        return this.holes[2];
    }
    get bag() {
        return this.holes[0];
    }
    set bag(bg) {
        this.holes[0] = bg;
    }
}

// Full-faded map function.
class FadedMapFunc extends FadedSimpleMapFunc {
    constructor(oneParamFunc, bag) {
        super(oneParamFunc, bag);

        // Remove animations + arrow
        this.heightScalar = 1.0;
        this.exprOffsetY = 0;
        this.animatedReduction = false;
    }
    updateArrowPaths() { } // remove arrow
}

// Fully-concrete map function.
class FunnelMapFunc extends MapFunc {
    constructor(oneParamFunc, bag) {
        super(oneParamFunc, bag);
        this.children = [];
        this.holes = [];
        //this.animatedReduction = false;

        // Expression it fits over.
        oneParamFunc.unlock();
        this.addArg(oneParamFunc);

        // Funnel graphic.
        var funnel = new FunnelExpr(0, 0, 198/2, 281/2);
        this.funnel = funnel;
        this.addArg(funnel);

        // Bag.
        //bag.unlock();
        this.addArg(bag);
    }
    update() {
        if (this.func && this.funnel) {
            this.func.pos = { x:this.funnel.size.w * 38 / 200, y:this.funnel.size.h / 2.0 - this.func.size.h / 1.3 };
            this.func.update();
            if (this.func.holes.length > 0)
                this.func.holes[0].open();
            else {
                if (!this.funcDraw) this.funcDraw = this.func.draw;
                this.func.draw = () => {};
            }
        }
        if (this.bag && this.funnel) {
            if (this.bag instanceof MissingExpression) this.bag.shadowOffset = -4;
            this.bag.pos = { x:this.funnel.size.w / 2.0 + 3, y:-this.funnel.size.h * (280/2 - 50) / 280};
            this.bag.anchor = { x:0.5, y:0.5 };
            this.bag.update();
        }
        this.children = [];
        this.holes.forEach((h) => {
            this.addChild(h);
        });
    }
    onmouseenter(pos) {
        this.funnel.onmouseenter(pos);
        this.func.onmouseenter(pos);
    }
    onmouseleave(pos) {
        this.funnel.onmouseleave(pos);
        this.func.onmouseleave(pos);
    }
    updateArrowPaths() { }
    drawInternal(ctx, pos, boundingSize) { }
    hits(pos, options) {
        var b = this.bag.hits(pos, options);
        if (b) return b;
        var e = this.func.hits(pos, options);
        if (e) return (e != this.func && e != this.func.holes[0]) ? e : this;
        var h = this.funnel.hits(pos, options);
        if (h) return this;
        else   return null;
    }
    get returnBag() { return null; }
    get func() {
        return this.holes[0];
    }
    set func(f) {
        f.anchor = { x:0, y:0 };
        this.holes[0] = f;
    }
    get bag() {
        return this.holes[2];
    }
    set bag(bg) {
        this.holes[2] = bg;
    }
}


class ReduceFunc extends FuncExpr {

    constructor(twoParamFunc, iterable, initializer) {

        console.log('constructing ReduceFunc with ', twoParamFunc, iterable, initializer);
        super([iterable, initializer, twoParamFunc]);
        this.exprOffsetY = DEFAULT_EXPR_HEIGHT / 8.0;
        this.update();

        this.color = "YellowGreen";
    }
    get constructorArgs() { return [ this.func.clone(), this.iterable.clone(), this.initializer.clone() ]; }

    // Accessors
    get initializer()  { return this.holes[1]; }
    get iterable()     { return this.holes[0]; }
    get func()         { return this.holes[2]; }
    set initializer(e) { this.holes[1] = e; }
    set iterable(e)    { this.holes[0] = e; }
    set func(e)        { this.holes[2] = e; }

    // Reduce algorithm.
    // * Modifies the iterable and init properties to reflect a step in the algorithm.
    // * Returns TRUE if valid and iterable was empty, false if not.
    step() {

        if (this.initializer instanceof MissingExpression || this.iterable instanceof MissingExpression)
            return false;
        else if (this.initializer.reduceCompletely() != this.initializer) {
            Animate.blink(this.initializer, 400, [0,1,0]);
            return false;
        }
        else if (this.iterable.items.length === 0)
            return true;

        let iter = this.iterable.clone();
        let item = iter.popItem();
        let init = this.initializer.clone();
        let func = this.func.clone();
        let partial = func.clone().applyExpr(init); // first apply the initializer, we'll get back a 1-param func.
        let reduced = partial.clone().applyExpr(item); // now apply the item from the collection.

        let _this = this;
        let stage = this.stage;
        let initToFuncArrowPath = this.initToFuncArrowPath;
        let bagToFuncArrowPath = this.bagToFuncArrowPath;
        let oldInit = this.initializer;
        oldInit.detach();
        stage.remove(oldInit);

        let previewItem = item.clone();
        let previewInit = init.clone();
        previewItem.scale = { x:0.5, y:0.5 };
        previewItem.anchor = { x:0.5, y:0.5 };
        previewItem.parent = null;
        previewInit.scale = { x:0.5, y:0.5 };
        previewInit.anchor = { x:0.5, y:0.5 };
        previewInit.parent = null;
        stage.add(previewInit);

        Animate.followPath(previewInit, initToFuncArrowPath, 1000).after(() => {
            stage.remove(previewInit);

            // Update bag graphic, showing removed item.
            _this.iterable = iter;
            //_this.func = partial.clone();
            //partial.parent = _this;
            stage.add(previewItem);
            _this.update();

            Animate.followPath(previewItem, bagToFuncArrowPath, 1000).after(() => {
                stage.remove(previewItem);

                _this.initializer = reduced;
                _this.func = func;
                reduced.parent = _this;
                iter.parent = _this;
                reduced.unlock();

                _this.update();
                stage.draw();
            });

        });

        return false;
        //return new ReduceFunc( this.func.clone(), iter, reduced );
    }
    reduce() {
        if (this.step()) return this.initializer;
        else             return this;
    }
    reduceCompletely() {
        return this;
    }

    updateArrowPaths() {

        // Arrow from func expr to left bag:
        let _this = this;
        function topMiddlePoint(expr) {
            return expr.posOnRectAt( CONST.POS.UNITSQUARE.TOP.MID() );
        }
        function bottomMiddlePoint(expr) {
            return expr.posOnRectAt( CONST.POS.UNITSQUARE.BOTTOM.MID() );
        }
        function leftMiddlePoint(expr) {
            return expr.posOnRectAt( CONST.POS.UNITSQUARE.LEFT.MID() );
        }
        function rightMiddlePoint(expr) {
            return expr.posOnRectAt( CONST.POS.UNITSQUARE.RIGHT.MID() );
        }
        function topMiddleFuncHolePoint(func) {
            if (func.holes.length > 0)
                return { x:func.holes[0].pos.x + func.holes[0].absoluteSize.w / 2.0 + func.pos.x, y:func.pos.y - func.size.h / 2.0 };
            else
                return func.posOnRectAt( { x:0.25, y:0 } );
        }
        function topMiddle2ndFuncHolePoint(func) {
            if (func.holes.length > 1 && func.holes[1].holes.length > 0)
                return { x:func.holes[1].holes[0].pos.x + func.pos.x + func.holes[1].pos.x, y:func.pos.y - func.size.h / 2.0 };
            else
                return func.posOnRectAt( { x:0.25, y:0 } );
        }

        // Create arrow paths.
        let bagToFuncArrowPath = new ArrowPath();
        let topY = this.func.pos.y - this.func.size.h / 2.0 - 12;
        let firstTopY = topY - this.func.size.h / 4.0;
        let leftBag = topMiddlePoint(this.iterable);
        let leftBagTop = { x:leftBag.x, y:firstTopY };
        let funcHoleMid = topMiddleFuncHolePoint(this.func);
        let funcHole2ndMid = topMiddle2ndFuncHolePoint(this.func);
        let funcHoleMidFirstTop = { x:funcHoleMid.x, y:firstTopY };
        bagToFuncArrowPath.addPoint( leftBag );
        bagToFuncArrowPath.addPoint( leftBagTop );
        bagToFuncArrowPath.addPoint( { x:funcHole2ndMid.x, y:funcHoleMidFirstTop.y } );
        bagToFuncArrowPath.addPoint( { x:funcHole2ndMid.x, y:funcHoleMid.y } );
        bagToFuncArrowPath.parent = this;
        bagToFuncArrowPath.color = ReduceFunc.arrowPathColor();
        this.bagToFuncArrowPath = bagToFuncArrowPath;

        let initToFuncArrowPath = new ArrowPath();
        let initMid = topMiddlePoint(this.initializer);
        let initMidTop = { x:initMid.x, y:topY };
        let funcHoleMidTop = { x:funcHoleMid.x, y:topY };
        initToFuncArrowPath.addPoint( initMid );
        initToFuncArrowPath.addPoint( initMidTop );
        initToFuncArrowPath.addPoint( funcHoleMidTop );
        initToFuncArrowPath.addPoint( funcHoleMid );
        initToFuncArrowPath.color = ReduceFunc.arrowPathColor();
        initToFuncArrowPath.parent = this;
        this.initToFuncArrowPath = initToFuncArrowPath;

        let funcToInitArrowPath = new ArrowPath();
        let funcBotMid = bottomMiddlePoint(this.func);
        let botY = funcBotMid.y + this.func.size.h / 2.0 - 8;
        let funcBotBelow = { x:funcBotMid.x, y:botY };
        let initBotMid = bottomMiddlePoint(this.initializer);
        let initBotMidBelow = { x:initBotMid.x, y:botY };
        funcToInitArrowPath.addPoint( funcBotMid );
        funcToInitArrowPath.addPoint( funcBotBelow );
        funcToInitArrowPath.addPoint( initBotMidBelow );
        funcToInitArrowPath.addPoint( initBotMid );
        funcToInitArrowPath.color = ReduceFunc.arrowPathColor();

        this.arrowPaths = [ bagToFuncArrowPath, initToFuncArrowPath, funcToInitArrowPath ];
    }

    // Sizes to match its children.
    get size() {
        let sz = super.size;
        sz.h = DEFAULT_EXPR_HEIGHT * 2.3;
        return sz;
    }

    toString() {
        return '(reduce ' + this.func.toString() + ' ' + this.iterable.toString() + ' ' +
                          ( this.initializer ? this.initializer.toString() : '()' ) + ')';
    }
}

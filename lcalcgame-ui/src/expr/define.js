// Notch attachment node.
class NewInstanceExpr extends FadedValueExpr {
    constructor() {
        super('+');
        this.notches = [ new WedgeNotch('right', 10, 10, 0.5, false) ];
        this.padding.right = 20;
        //this.shadowOffset = 6;
        this.radius = 3;
        this.attachNode = null;
    }
    // get notchPos() {
    //     let upperLeftPos = this.upperLeftPos(this.absolutePos, this.absoluteSize);
    //     return { x:upperLeftPos.x + this.size.w, y:upperLeftPos.y + this.size.h * this.notch.relpos };
    // }
    isAttached() {
        return this.attachNode ? true : false;
    }
    attach(nodeWithNotch) {
        if (!nodeWithNotch.notchPos) {
            console.error('@ NewInstanceExpr.attach: Prospective attachment has no notchPos property.');
            return;
        }
        this.attachNode = nodeWithNotch;
        let notchPos = this.notchPos;
        let nodeNotchDistY = nodeWithNotch.notchPos.y - nodeWithNotch.pos.y;
        nodeWithNotch.pos = { x:notchPos.x, y:notchPos.y - nodeNotchDistY };
        this.stroke = null;
        Animate.blink(this, 500, [1,0,1], 1);
        Animate.blink(nodeWithNotch, 500, [1,0,1], 1);
    }
    detachAttachment(node) {
        if (node != this.attachNode) {
            console.error('@ NewInstanceExpr.detach: Trying to detach node which isn\'t attached to this expression.');
            return;
        }
        this.attachNode = null;
    }
}

// Acts as a named wrapper for a def'd expression.
class NamedExpr extends Expression {
    constructor(name, refDefineExpr, args) {
        let txt_name = new TextExpr(name);
        txt_name.color = 'black';
        let exprs = [ txt_name ];
        for ( let i = 0; i < args.length; i++ )
            exprs.push( args[i].clone() );
        super(exprs);
        this.color = 'OrangeRed';
        this.name = name;
        console.log("args");
        console.log(args);
        this._args = args.map((a) => a.clone());
        this._wrapped_ref = refDefineExpr;
        this.scale = refDefineExpr.scale;
    }
    get expr() { return this._wrapped_ref.expr.clone(); }
    get args() { return this.holes.slice(1).map((a) => a.clone()); }
    get constructorArgs() {
        return [ this.name, this.expr.clone(), this.args ];
    }

    onmouseclick() {
        console.log(this);
        this.performReduction();
    }
    reduce() {
        let expr = this.expr;
        if (!expr || expr instanceof MissingExpression)
            return this;
        else {

            let incomplete_exprs = mag.Stage.getNodesWithClass(MissingExpression, [], true, [expr]).filter((e) => (!(e instanceof LambdaHoleExpr)));
            if (incomplete_exprs.length > 0) {
                console.log(incomplete_exprs);
                incomplete_exprs.forEach((e) => Animate.blink(e, 1000, [1,0,0], 2));
                return this;
            }

            // This should 'reduce' by applying the arguments to the wrapped expression.
            // First, let's check that we HAVE arguments...
            var isValidArgument = (a) => a && (a instanceof Expression) && !(a instanceof MissingExpression);
            var validateAll = (arr, testfunc) => arr.reduce((prev, x) => prev && testfunc(x), true);
            let args = this.args;
            if (args.length === 0 || validateAll(args, isValidArgument)) { // true if all args valid

                // All the arguments check out. Now we need to apply them.
                let expr = this.expr;
                console.log(expr);

                if (args.length > 0)
                    expr = args.reduce((lambdaExpr, arg) => lambdaExpr.applyExpr(arg), expr); // Chains application to inner lambda expressions.

                Resource.play('define-convert');

                // Disable editing the DefineExpr after its been used once.
                this._wrapped_ref.lockSubexpressions((e) => (!(e instanceof DragPatch)));
                this._wrapped_ref.lock();

                return expr.clone(); // to be safe we'll clone it.
            }
        }

        return this;
    }

    // Whoa... meta.
    toString() {
        let s = '(' + name; // e.g. '(length'
        let args = this.args;
        for ( let i = 0; i < args.length; i++ )
            s += ' ' + args[i].toString();
        s += ')';
        return s;
    }
}

class DragPatch extends ImageExpr {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'drag-patch');
        this.padding = {left:0, right:0, inner:0};
    }
    get delegateToInner() { return true; }
    draw(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        super.draw(ctx);
        ctx.restore();
    }
    onmouseenter(pos) {
        super.onmouseenter(pos);
        this.parent.stroke = { color:'white', lineWidth:2 };
        SET_CURSOR_STYLE(CONST.CURSOR.GRAB);
    }
    onmousedown(pos) {
        super.onmousedown(pos);
        SET_CURSOR_STYLE(CONST.CURSOR.GRABBING);
    }
    onmouseup(pos) {
        super.onmouseup(pos);
        SET_CURSOR_STYLE(CONST.CURSOR.GRAB);
    }
    onmousedrag(pos) {

        SET_CURSOR_STYLE(CONST.CURSOR.GRABBING);

        //let stage = this.stage;
        let replacement = this.parent.parent.generateNamedExpr(); // DefineExpr -> NamedExpr, or PlayPenExpr -> ObjectExtensionExpr
        let ghosted_name = this.parent.clone();
        ghosted_name.scale = this.parent.absoluteScale;
        ghosted_name.pos = this.parent.absolutePos;
        ghosted_name.onmouseenter();
        ghosted_name.shadowOffset = 0;
        ghosted_name.opacity = 0.5;
        ghosted_name.onmouseup = function (pos){
            this.opacity = 1.0;
            this.shadowOffset = 0;
            SET_CURSOR_STYLE(CONST.CURSOR.DEFAULT);

            replacement.pos = this.upperLeftPos(this.absolutePos, this.absoluteSize);
            let fx = new ShatterExpressionEffect(this);
            fx.run(stage, () => {
                stage.remove(this);
                stage.add(replacement);
                replacement.update();
            }, () => {});
        };
        stage.add(ghosted_name);

        // This is a special line which tells the stage
        // to act as if the user was holding the new cloned node,
        // not the infinite resource.
        stage.heldNode = ghosted_name;
        stage.heldNodeOrigOffset = null;
    }
    onmouseleave(pos) {
        super.onmouseleave(pos);
        this.parent.stroke = null;
        SET_CURSOR_STYLE(CONST.CURSOR.DEFAULT);
    }
}

// Analogous to 'define' in Scheme.
class DefineExpr extends ClampExpr {
    constructor(expr, name=null) {
        //let txt_define = new TextExpr('define');
        //txt_define.color = 'black';
        let txt_input = new Expression([ new TextExpr(name ? name : 'foo') ]); // TODO: Make this text input field (or dropdown menu).
        txt_input.color = 'Salmon';
        txt_input.radius = 2;
        txt_input.lock();
        super([txt_input, expr]);
        this.breakIndices = { top:1, mid:2, bot:2 }; // for ClampExpr
        this.color = 'OrangeRed';
        this.expr.shadowOffset = -2;
        if (name) this.funcname = name;

        this.notches = [ new WedgeNotch('left', 10, 10, 0.8, true) ];

        //this.stage.functions[this.funcname] = this;
    }
    onSnap(otherNotch, otherExpr, thisNotch) {
        DefineExpr.functions[this.funcname] = this;
        this.stage.functions[this.funcname] = this;
        super.onSnap(otherNotch, otherExpr, thisNotch);
        if (this.children[0].holes.length === 1) {
            let drag_patch = new DragPatch(0, 0, 42, 52);
            this.children[0].addChild(drag_patch);
            this.children[0].update();
        }
    }
    onDisconnect() {
        if (this.children[0].holes.length > 1) {
            this.children[0].removeChild(this.children[0].children[1]);
        }
    }
    get name() { return this.funcname; }
    get expr() {
        console.log("Called get expr() in DEFINEEXPR ...!!!!");
        //console.trace();
        console.log(this.children[1]);
        return this.children[1];
    }
    get constructorArgs() { return [ this.expr.clone() ]; }
    generateNamedExpr() {

        let funcname = this.funcname;
        let args = [];
        let numargs = 0;

        if (this.expr instanceof LambdaExpr)
            numargs = this.expr.numOfNestedLambdas();
        console.log(numargs);
        for (let i = 0; i < numargs; i++)
            args.push( new MissingExpression() );

        // Return named function (expression).
        //return new NamedExpr(funcname, this, args);

        return new NamedFuncExpr(funcname, ...args);
    }
    // get notchPos() {
    //     return { x: this.pos.x, y: this.pos.y + this.radius + (this.size.h - this.radius * 2) * (1 - this.notch.relpos) };
    // }
    // onmousedrag(pos) {
    //     super.onmousedrag(pos);
    //
    //     if (this._attachNode) {
    //         this._attachNode.detachAttachment(this);
    //         this._attachNode = null;
    //     }
    //
    //     const ATTACHMENT_THRESHOLD = 20;
    //     let notchPos = this.notchPos;
    //     let attachmentNodes = this.stage.getRootNodesThatIncludeClass(NewInstanceExpr);
    //     attachmentNodes.forEach((node) => {
    //         if (!node.isAttached()) {
    //             let dist = distBetweenPos(notchPos, node.notchPos);
    //             if (dist < ATTACHMENT_THRESHOLD) {
    //                 node.stroke = { color:'magenta', lineWidth:4 };
    //                 this._attachProspect = node;
    //             } else {
    //                 node.stroke = null;
    //                 if (this._attachProspect && this._attachProspect == node)
    //                     this._attachProspect = null;
    //             }
    //         }
    //     });
    // }
    // onmouseup(pos) {
    //     super.onmouseup(pos);
    //     if (this._attachProspect) { // Snap this function block into the NewInstanceExpr notch:
    //         this._attachProspect.attach(this);
    //         this._attachNode = this._attachProspect;
    //         this._attachProspect = null;
    //     }
    // }
    onmouseclick() {
        console.log(this);
        return; // disable for now;

        if (this.funcname) {
            this.performReduction();
        }
        else {
            // For now, prompt the user for a function name:
            let funcname = window.prompt("What do you want to call it?", "foo");
            if (funcname) {
                this.funcname = funcname.trim();
                // Check that name has no spaces etc...
                if (funcname.indexOf(/\s+/g) === -1) {
                    this.performReduction();
                }
                else {
                    window.alert("Name can't have spaces. Try again with something simpler."); // cancel
                }
            }
        }
    }
    reduceCompletely() { return this; }
    reduce() {

        return this; // can't reduce a DefineExpr.

        if (!this.expr ||
            this.expr instanceof MissingExpression)
            return this;
        else {

            if (this.funcname) {
                let funcname = this.funcname;
                let args = [];
                let numargs = 0;
                if (this.expr instanceof LambdaExpr)
                    numargs = this.expr.numOfNestedLambdas();
                for (let i = 0; i < numargs; i++)
                    args.push( new MissingExpression() );

                // Return named function (expression).
                let inf = new InfiniteExpression( new NamedExpr(funcname, this.expr.clone(), args) );
                inf.pos = addPos(this.expr.absolutePos, {x:inf.size.w/2.0, y:0});
                inf.anchor = { x:0, y:0.5 };
                //inf.pos = { x:this.stage.boundingSize.w, y:this.stage.toolbox.leftEdgePos.y };
                this.stage.add(inf);
                inf.update();
                this.stage.update();
                this.stage.toolbox.addExpression(inf);

                Resource.play('define');

                return inf;
            }

            return this; // cancel
        }
    }
    toString() { return '(define ' + this.expr.toString() + ' `' + this.funcname + ')'; }
}

DefineExpr.functions = {};

/**
 * The String Class
 */

class StringObjectExpr extends ObjectExtensionExpr {

    //baseString should be of type StringValueExpr
    constructor(baseString, defaultMethodCall=null, defaultMethodArgs=null) {
        super(baseString, {
            'length': {
                'isProperty': true,
                'reduce': function (stringExpr) {
                    this.isProperty = true;
                    return new (ExprManager.getClass('number'))(stringExpr.value().length);
                }
            },
            'slice': (stringExpr, numberExpr1, numberExpr2) => {
                if (!numberExpr1 ||
                    numberExpr1 instanceof MissingExpression ||
                    numberExpr1 instanceof LambdaVarExpr ||
                    !numberExpr2 ||
                    numberExpr2 instanceof MissingExpression ||
                    numberExpr2 instanceof LambdaVarExpr) {
                    return stringExpr;
                }
                let newString = stringExpr.value().slice(numberExpr1.number, numberExpr2.number);
                let newStringObj = new StringObjectExpr(new StringValueExpr(newString));
                return newStringObj;
            },
            'charAt': (stringExpr, numberExpr) => {
                if (!numberExpr ||
                    numberExpr instanceof MissingExpression ||
                    numberExpr instanceof LambdaVarExpr) {
                    return stringExpr;
                }
                else if (numberExpr.number >= stringExpr.value().length) {
                    return stringExpr;
                }
                else {
                    let newString = stringExpr.value().charAt(numberExpr.number);
                    let newStringObj = new StringObjectExpr(new StringValueExpr(newString));
                    return newStringObj;
                }
            },
            '[..]': (stringExpr, numberExpr) => {

                if (!numberExpr ||
                    numberExpr instanceof MissingExpression ||
                    numberExpr instanceof LambdaVarExpr) {
                    return stringExpr;
                }
                else if (numberExpr.number >= stringExpr.value().length) {
                    return stringExpr; //TODO: return undefined
                }
                else {
                    let newString = stringExpr.value()[numberExpr.number];
                    let newStringObj = new StringObjectExpr(new StringValueExpr(newString));
                    return newStringObj;
                }
            },
        });
        //text.color = "OrangeRed";
        this.color = "YellowGreen";

        //console.log("baseString:");
        //console.log(baseString);
        //this.string = baseString;
        //this.primitiveName = baseString;

        if (!defaultMethodCall) {}
        else if (defaultMethodCall in this.objMethods) {
            this.setExtension(defaultMethodCall); // TODO: method args
        } else {
            console.error('@ StringObjectExpr: Method call ' + defaultMethodCall + ' not a possible member of the object.');
        }

        this.defaultMethodCall = defaultMethodCall;
        this.defaultMethodArgs = defaultMethodArgs;
        this.baseStringValue = baseString;
    }

    /*
    get graphicNode() { return this.holes[0]; }
    reduceCompletely() { return this; }
    canReduce() { return false; }
    isValue() { return true; }
    */

    value() {
        if (this.baseStringValue.canReduce())
            return this.baseStringValue.reduceCompletely().value();
        else
            return this.baseStringValue.value();
    }

    get constructorArgs() {
        return [this.holes[0].clone(), this.defaultMethodCall, this.defaultMethodArgs];
    }

    reduce() {
        let r = super.reduce();
        if (r != this && r instanceof StringValueExpr) {
            return new StringObjectExpr(r); // if reduce value is itself an array, make it an Array object that the user can apply methods to.
        }
        return r;
    }
}

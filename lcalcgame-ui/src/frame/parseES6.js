/**
 *  A parser converting a set of ES6 programs
 *  into a Reduct expression set.
 *
 *  Takes programs as a string,
 *  where each program is separated by a | (if multiple).
 */

class ES6Parser {

    static lockFilter(n) {
        if (n.__remain_unlocked) {
            n.__remain_unlocked = undefined;
            return false;
        } else return true;
    }
    static makePrimitive(prim) {
        const primitiveArgs = {
            'triangle':[0,0,44,44],
            'rect':[0,0,44,44],
            'star':[0,0,25,5],
            'circle':[0,0,22],
            'diamond':[0,0,44,44]
        };
        return new (ExprManager.getClass(prim))(...primitiveArgs[prim]);
    }

    static parse(program) {
        if (!esprima) {
            console.error('Cannot parse ES6 program: Esprima.js not found. \
            See http://esprima.readthedocs.io/en/latest/getting-started.html \
            for adding Esprima to your page.');
            return null;
        }

        if (program.trim().length === 0)
            return null;
        // * if we reach here, we can assume single program...

        // Parse into AST using Esprima.js.
        let AST;
        try {
            AST = esprima.parse(program);
        } catch (e) {
            return null;
        }

        // If program has only one statement (;-separated code)
        // just parse and return that Expression.
        // Otherwise, parse all the statements into Expressions separately and
        // return a Sequence Expression (representing a multi-line program).
        let statements = AST.body;
        if (statements.length === 1) {
            let expr = this.parseNode(statements[0]);
            expr.lockSubexpressions(this.lockFilter);
            expr.unlock();
            return expr;
        } else {
            let exprs = statements.map((n) => this.parseNode(n));
            let seq = new (ExprManager.getClass('sequence'))(...exprs);
            seq.lockSubexpressions(this.lockFilter);
            return seq;
        }
    }

    // Parse an AST node into Reduct expressions.
    static parseNode(ASTNode) {

        // To see all available types:
        // http://esprima.readthedocs.io/en/latest/syntax-tree-format.html
        const typeSwitcher = {

            /* A base-level token like 'x' */
            'Identifier': (node) => {

                // Check if node is a Reduct reserved identifier (MissingExpression)
                if (node.name === '_' || node.name === '_b' || node.name === '__' || node.name === '_n') {
                    let missing = new (ExprManager.getClass(node.name))();
                    missing.__remain_unlocked = true;
                    return missing;
                }
                else if (node.name.substring(0, 2) === '_t')
                    return TypeInTextExpr.fromExprCode(node.name);
                else if (node.name === '_notch')
                    return new (ExprManager.getClass('notch'))(1);
                else if (ExprManager.isPrimitive(node.name)) // If this is the name of a Reduct primitive (like 'star')...
                    return this.makePrimitive(node.name);

                // Otherwise, treat this as a variable name...
                return new (ExprManager.getClass('var'))(node.name);
            },

            /* A primitive that's part of the language. Has 'value':
                boolean | number | string | RegExp | null
               and a corresponding 'raw' version, which is just the value-as-a-string.
            */
            'Literal': (node) => {
                if (node.value instanceof RegExp) {
                    console.error('Regular expressions are currently undefined.');
                    return null;
                } else if (typeof node.value === 'string' || node.value instanceof String) {
                    if (ExprManager.isPrimitive(node.value)) { // If this is the name of a Reduct primitive (like 'star')...
                        return this.makePrimitive(node.value);
                    }
                    else { // Otherwise this stands for a "string" value.
                        return new StringValueExpr(node.value);
                    }
                } else if (Number.isNumber(node.value)) {
                    return new (ExprManager.getClass('number'))(node.value);
                } else if (node.value === null) {
                    return new NullExpr(0,0,64,64);
                } else { // Booleans should be left.
                    return new (ExprManager.getClass(node.raw))();
                }
            },

            /* e.g. [2, true, x] */
            'ArrayExpression': (node) => {
                let arr = new (ExprManager.getClass('array'))(0,0,54,54,[]);
                node.elements.forEach((e) => arr.addItem(this.parseNode(e)));
                return arr;
            },

            /* A single statement like (x == x); or (x) => x; */
            'ExpressionStatement': (node) => {
                return this.parseNode(node.expression);
            },

            /* A function call of the form f(x) */
            'CallExpression': (node) => {
                if (node.callee.type === 'Identifier' && node.callee.name === '$') {
                    if (node.arguments.length === 0 || node.arguments.length > 1) {
                        console.error('Malformed unlock expression $ with ' + node.arguments.length + ' arguments.');
                        return null;
                    } else {
                        let unlocked_expr = this.parseNode(node.arguments[0]);
                        unlocked_expr.unlock();
                        unlocked_expr.__remain_unlocked = true; // When all inner expressions are locked in parse(), this won't be.
                        return unlocked_expr;
                    }
                } else if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'map') {
                    console.log(node.callee);
                    return new (ExprManager.getClass('arrayobj'))(this.parseNode(node.callee.object), 'map', this.parseNode(node.arguments[0]));
                    //return new (ExprManager.getClass('map'))(this.parseNode(node.arguments[0]), this.parseNode(node.callee.object));
                } else {
                    console.error('Call expressions outside of the special $() unlock syntax are currently undefined.');
                    return null;
                }
            },

            /* Anonymous functions of the form (x) => x */
            'ArrowFunctionExpression': (node) => {
                if (node.params.length === 1 && node.params[0].type === 'Identifier') {
                    // Return new Lambda expression (anonymous function) at current stage of concreteness.
                    let lambda = new (ExprManager.getClass('lambda_abstraction'))([ new (ExprManager.getClass('hole'))(node.params[0].name) ]);
                    if (node.body.type === 'Identifier' && node.body.name === 'xx') {
                        lambda.addArg(this.parseNode( {type:'Identifier',name:'x'} ));
                        lambda.addArg(this.parseNode( {type:'Identifier',name:'x'} ));
                    }
                    else if (node.body.type === 'Identifier' && node.body.name === 'xxx') {
                        lambda.addArg(this.parseNode( {type:'Identifier',name:'x'} ));
                        lambda.addArg(this.parseNode( {type:'Identifier',name:'x'} ));
                        lambda.addArg(this.parseNode( {type:'Identifier',name:'x'} ));
                    }
                    else {
                        let body = this.parseNode(node.body);
                        lambda.addArg(body);
                    }
                    lambda.hole.__remain_unlocked = true;
                    return lambda;
                } else {
                    console.warn('Lambda expessions with more than one input are currently undefined.');
                    return null;
                }
            },

            'AssignmentExpression': (node) => {
                let result = new (ExprManager.getClass('assign'))(this.parseNode(node.left), this.parseNode(node.right));
                mag.Stage.getNodesWithClass(MissingExpression, [], true, [result]).forEach((n) => {
                    n.__remain_unlocked = true;
                });
                return result;
            },

            /*  BinaryExpression includes the operators:
                'instanceof' | 'in' | '+' | '-' | '*' | '/' | '%' | '**' | '|' | '^' |
                '&' | '==' | '!=' | '===' | '!==' | '<' | '>' | '<=' | '<<' | '>>' | '>>>'
            */
            'BinaryExpression': (node) => {
                if (node.operator === '>>>') { // Special typing-operators expression:
                    let comp = new (ExprManager.getClass('=='))(this.parseNode(node.left), this.parseNode(node.right), '>>>');
                    comp.holes[1] = TypeInTextExpr.fromExprCode('_t_equiv', (finalText) => {
                        comp.funcName = finalText;
                    }); // give it a nonexistent funcName
                    return comp;
                }
                else if (ExprManager.hasClass(node.operator)) {
                    let BinaryExprClass = ExprManager.getClass(node.operator);
                    if (node.operator in CompareExpr.operatorMap())
                        return new BinaryExprClass(this.parseNode(node.left), this.parseNode(node.right), node.operator);
                    else
                        return new BinaryExprClass(this.parseNode(node.left), this.parseNode(node.right));
                }
            },

            /*  LogicalExpression includes && and || */
            'LogicalExpression': (node) => {
                const map = { '&&':'and', '||':'or' };
                const op = map[node.operator];
                return new (ExprManager.getClass(op))(this.parseNode(node.left), this.parseNode(node.right), op);
            },

            'UnaryExpression': (node) => {
                if (node.operator === '!') {
                    return new (ExprManager.getClass('not'))(this.parseNode(node.argument), 'not');
                } else {
                    console.warn('Unknown unary expression ' + node.operator + ' not supported at this time.');
                    return null;
                }
            },

            /*  Ternary expression ?:  */
            'ConditionalExpression': (node) => {
                return new (ExprManager.getClass('ifelse'))(this.parseNode(node.test), this.parseNode(node.consequent), this.parseNode(node.alternate));
            },

            /* A JS ES6 Class.
               In Reduct, an Object container.
               * TODO: Methods with the name _ should define unfilled 'notches' on the side of the object. *
            */
            'ClassDeclaration': (node) => {
                let obj = new PlayPenExpr(node.id.name);
                let funcs = node.body.body.map((e) => this.parseNode(e));
                obj.setMethods(funcs);
                // TODO: Predefined methods, notches, floating exprs, etc.
                return obj;
            },
            'MethodDefinition': (node) => { // This wraps a FunctionExpression for classes:
                if (node.key.name === '_notch') // extra notches inside objects
                    return this.parseNode(node.key);
                node.value.id = node.key.name; // So that the FunctionExpression node parser knows the name of the function...
                return this.parseNode(node.value);
            },
            'FunctionExpression': (node) => {
                return new DefineExpr(this.parseNode(node.body), node.id ? node.id : '???');
            },
            'FunctionDeclaration': (node) => {
                return new DefineExpr(this.parseNode(node.body), node.id ? node.id.name : '???');
            },
            'BlockStatement': (node) => {
                if (node.body.length === 1 && node.body[0].type === 'ReturnStatement') {
                    return this.parseNode(node.body[0].argument);
                } else {
                    console.error('Block expressions longer than a single return are not yet supported.');
                    return null;
                }
            }
        }

        // Apply!
        if (ASTNode.type in typeSwitcher)
            return typeSwitcher[ASTNode.type](ASTNode);
        else {
            console.error('@ ES6Parser.parseNode: No converter specified for AST Node of type ' + ASTNode.type);
            return null;
        }
    }
}

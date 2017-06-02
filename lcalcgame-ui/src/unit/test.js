var UnitTest = (function() {
    var pub = {};

    // Entry point for unit testing.
    pub.run = function(stage) {
        pub.testStringBijection();
        pub.testLambdas(stage);
    };

    function assert(desc, bool) {
        if (bool === true) console.log('%cPASSED ' + desc, 'background: #EEE; color: #33cc33');
        else if (bool === false) console.log('%cFAILED ' + desc, 'background: #EEE; color: #ee3333');
        else console.error('@ assert: Condition test result is not boolean value.');
    }
    function clean(str) {
        return str.replace('diamond', 'rect').replace('/#x', '#x');
    }
    function compare(e1, e2) {
        if (e1 === e2) return true;
        e1 = clean( stripParen(e1) );
        e2 = clean( stripParen(e2) );
        return e1 === e2;
    }

    function getAllReductSchemeLevelStrings() {
        // Get all level descriptions, separate into individual expressions for each category,
        // and then flatten into a single array.
        let splitExprs = (s) => ((s) ? Level.splitParen(s) : []);
        let schemeChapters = Resource.chaptersWithLanguage('reduct-scheme');
        let levels = flatten(
                            schemeChapters.map(
                                (chap) => Resource.levelsForChapter(chap.name)[0]
                            )
                     );
        let all_exprs = flatten(
                                levels.map(
                                    (lvl) => flatten( [splitExprs(lvl.board), splitExprs(lvl.goal), splitExprs(lvl.toolbox)] )
                                )
                        );
        return new Set(all_exprs);
    }
    function getAllJavaScriptLevelStrings() {
        // Get all level descriptions, separate into individual expressions for each category,
        // and then flatten into a single array.
        let arrayify = (arr) => (Array.isArray(arr) ? arr : [arr]);
        let schemeChapters = Resource.chaptersWithLanguage('JavaScript');
        let levels = flatten(schemeChapters.map((chap) => Resource.levelsForChapter(chap.name)));
        let all_exprs = flatten(
                                levels.map(
                                    (lvl) => flatten( [arrayify(lvl.board), arrayify(lvl.goal), arrayify(lvl.toolbox)] )
                                )
                        );
        return new Set(all_exprs);
    }

    // Tests whether parsed expressions convert neatly back to strings
    pub.testStringBijection = function() {
        let descs = {
            'reduct-scheme': getAllReductSchemeLevelStrings(), // easiest way to check robustness of conversion is just to use the existing level descriptions...
            'JavaScript':getAllJavaScriptLevelStrings()
        };
        let toStringMethodMap = {
            'reduct-scheme': 'toString',
            'JavaScript': 'toES6String'
        };
        let passed = [];
        for (var language in descs) {
            let toStringMethodName = toStringMethodMap[language];
            descs[language].forEach((desc) => {
                let expr = Level.parse('('+desc+')', language);
                let pass = compare(expr[toStringMethodName](), desc);
                passed.push([toStringMethodName + ' conversion for ' + desc, pass, expr[toStringMethodName]()]);
            });
        }

        // TODO: Make this much better!
        if (passed.every((p) => p[1] === true)) { // Success!
            assert('ALL string bijection tests! :)', true);
        } else {
            console.warn('@ String bijection test: ');
            passed.filter((e) => e[1] === false).forEach((e) => {
                assert(e[0], e[1]);
                if (!passed) console.log('   > ' + e[2]);
            });
        }
    };

    // Test anonymous functions:
    pub.testLambdas = function(stage) {

        ExprManager.setDefaultFadeLevel(100);

        // TODO: Test identity and star.
        // Tested expression, Sequence of input expressions, Event on test expr applying input expr, expected output
        // '(lambda.x #x)', ['star', 'rect', 'triangle'], 'ondropped', ['star', 'rect', 'triangle']
        let descs = getAllReductSchemeLevelStrings();
        descs.forEach((desc) => {
            let lambda = Level.parse('(λx #x)')[0];
            let expr = Level.parse(desc)[0];
            stage.add(lambda);
            stage.add(expr);
            let res = lambda.applyExpr(expr);
            if (res instanceof ApplyExpr)
                res = res.performApply();
            let passed = (res && (res instanceof Expression) && compare(res.toString(), desc));
            assert('identity for ' + desc, passed);
            if (!passed) console.log('   > ' + res.toString());
            if (res)
                stage.remove(res);
        });
    };

    return pub;
})();

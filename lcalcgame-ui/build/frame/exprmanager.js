'use strict';

var ExprManager = function () {
    var pub = {};

    var _FADE_MAP = {
        'if': [LockIfStatement, InlineLockIfStatement, IfStatement],
        'ifelse': [IfElseStatement],
        'triangle': [TriangleExpr], //, FadedTriangleExpr, StringTriangleExpr],
        'rect': [RectExpr], //, FadedRectExpr, StringRectExpr],
        'star': [StarExpr], //, FadedStarExpr, StringStarExpr],
        'circle': [CircleExpr], //, FadedCircleExpr, StringCircleExpr],
        'diamond': [RectExpr], //, FadedRectExpr, StringRectExpr],
        '_': [MissingExpression],
        '__': [MissingBagExpression, MissingBracketExpression],
        '_b': [MissingKeyExpression, MissingBooleanExpression],
        '_t': [TypeInTextExpr],
        '_n': [MissingNumberExpression],
        'true': [KeyTrueExpr, TrueExpr],
        'false': [KeyFalseExpr, FalseExpr],
        'number': [NumberExpr, FadedNumberExpr],
        'cmp': [MirrorCompareExpr, FadedCompareExpr],
        '==': [MirrorCompareExpr, FadedCompareExpr],
        '+': [AddExpr],
        '-': [SubtractionExpr],
        '*': [MultiplicationExpr],
        '--': [DivisionExpr],
        '++': [StringAddExpr],
        '!=': [MirrorCompareExpr, FadedCompareExpr],
        'and': [CompareExpr],
        'or': [CompareExpr],
        '>': [CompareExpr],
        '<': [CompareExpr],
        'not': [UnaryOpExpr],
        'bag': [BagExpr, BracketArrayExpr],
        'array': [BracketArrayExpr],
        'count': [CountExpr],
        'map': [SimpleMapFunc, FadedMapFunc],
        'reduce': [ReduceFunc],
        'put': [PutExpr],
        'pop': [PopExpr],
        'define': [DefineExpr],
        'var': [LambdaVarExpr, HalfFadedLambdaVarExpr, FadedLambdaVarExpr, FadedLambdaVarExpr],
        'reference': [JumpingChestVarExpr, ChestVarExpr, LabeledChestVarExpr, LabeledVarExpr, VtableVarExpr],
        'reference_display': [DisplayChest, LabeledDisplayChest, SpreadsheetDisplay],
        'environment_display': [EnvironmentDisplay, SpreadsheetEnvironmentDisplay],
        'hole': [LambdaHoleExpr, HalfFadedLambdaHoleExpr, FadedLambdaHoleExpr, FadedES6LambdaHoleExpr, DelayedFadedES6LambdaHoleExpr],
        'lambda': [LambdaHoleExpr, HalfFadedLambdaHoleExpr, FadedES6LambdaHoleExpr, DelayedFadedES6LambdaHoleExpr],
        'lambda_abstraction': [LambdaExpr, EnvironmentLambdaExpr],
        'assign': [JumpingAssignExpr, AssignExpr, EqualsAssignExpr],
        'sequence': [NotchedSequence, SemicolonNotchedSequence, SemicolonSequence],
        'repeat': [RepeatLoopExpr, FadedRepeatLoopExpr],
        'choice': [ChoiceExpr],
        'snappable': [Snappable, FadedSnappable], //, NotchSnappable],
        'level': [ReductStageExpr],
        'arrayobj': [ArrayObjectExpr],
        'stringobj': [StringObjectExpr],
        'infinite': [InfiniteExpression],
        'notch': [NotchHangerExpr],
        'namedfunc': [NamedFuncExpr]
    };
    var fade_levels = {};
    var DEFAULT_FADE_LEVEL = 0;

    pub.setFadeLevelMap = function (lvls) {
        fade_levels = lvls;
    };

    // var DEFAULT_FADE_PROGRESSION = {
    //     'var'   : [[19, 30], 30, 42], // should be 9 (along with 'hole' below)
    //     'reference': [79, 80, 96],
    //     'reference_display': [80, 96],
    //     'environment_display': [96],
    //     //'lambda_abstraction': [98],
    //     'lambda_abstraction': [1000000],
    //     'assign': [79, 96],
    //     'hole'  : [[19, 30], 30, 42],
    //     'if'    : [26, 45],
    //     '_b'    : [34],
    //     '=='    : [1], //[24],
    //     'true'  : [1], //[46],
    //     'false' : [1], //[46],
    //     'bag'   : [51],
    //     '__'    : [51],
    //     'primitives' : [66, 72],
    //     'map'   : [61],
    //     'repeat': [147],
    //     'sequence': [118, 145],
    //     'snappable': [145],
    //     'number': [129],
    // };
    // primitives.forEach((p) => {
    //     DEFAULT_FADE_PROGRESSION[p] = DEFAULT_FADE_PROGRESSION.primitives;
    // });
    // DEFAULT_FADE_PROGRESSION.primitives = undefined;
    var primitives = ['triangle', 'rect', 'star', 'circle', 'diamond'];
    pub.isPrimitive = function (str) {
        return primitives.indexOf(str) > -1;
    };

    // Classes that should not show the 'sparkle' when they are faded.
    var FADE_EXCEPTIONS = [JumpingChestVarExpr, JumpingAssignExpr, EnvironmentDisplay];

    pub.isExcludedFromFadingAnimation = function (expr) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = FADE_EXCEPTIONS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var klass = _step.value;

                if (expr instanceof klass) return true;
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return false;
    };

    pub.fadeBordersAt = function (lvl) {
        if (DEFAULT_FADE_LEVEL >= 4) return [];

        var prog = fade_levels;
        var borders = [];
        for (var t in prog) {
            if (t === 'primitives') continue;

            var fade_lvl_obj = prog[t];
            for (var i = 0; i < fade_lvl_obj.length; i++) {
                if (fade_lvl_obj[i].level_idx === lvl) borders.push([t, pub.getFadeLevel(t, lvl - 1), pub.getFadeLevel(t, lvl), true]);
            }
        }
        return borders.map(function (b) {
            return { 'unfadedClass': _FADE_MAP[b[0]][b[1]],
                'fadedClass': _FADE_MAP[b[0]][b[2]],
                'key': b[0] };
        });
    };
    pub.fadesAtBorder = true;

    pub.hasClass = function (ename) {
        return ename in _FADE_MAP;
    };
    pub.getClass = function (ename) {
        if (ename in _FADE_MAP) {
            return _FADE_MAP[ename][pub.getFadeLevel(ename)];
        } else {
            console.error('Expression type ' + ename + ' is not in the fade map.');
            return undefined;
        }
    };
    pub.getFadeLevel = function (ename, lvl) {
        if (typeof lvl === 'undefined') lvl = level_idx;

        //let is_primitive = primitives.indexOf(ename) > -1;

        if ((ename === 'var' || ename === 'hole') && 'lambda' in fade_levels) {
            var max = pub.getNumOfFadeLevels(ename) - 1;
            var fl = pub.getFadeLevel('lambda');
            if (fl > max) return max;else return fl;
        } else if (ename in fade_levels) {

            var lvl_map = fade_levels[ename];
            var cur_level = 0;
            for (var i = 0; i < lvl_map.length; i++) {
                var o = lvl_map[i];
                if (ExprManager.fadesAtBorder === false && o.level_idx < lvl) {
                    cur_level = o.fade_level;
                } else if (ExprManager.fadesAtBorder === true && o.level_idx <= lvl) {
                    cur_level = o.fade_level;
                }
            }
            if (DEFAULT_FADE_LEVEL > cur_level) return pub.getDefaultFadeLevel(ename);else return cur_level;
        } else return pub.getDefaultFadeLevel(ename);
    };
    pub.getDefaultFadeLevel = function (ename) {
        if (DEFAULT_FADE_LEVEL >= pub.getNumOfFadeLevels(ename)) return pub.getNumOfFadeLevels(ename) - 1;else return DEFAULT_FADE_LEVEL;
    };
    pub.getNumOfFadeLevels = function (ename) {
        if (!ename) return;else if (!(ename in _FADE_MAP)) {
            console.error('Expression type ' + ename + ' is not in the fade map.');
            return;
        }
        return _FADE_MAP[ename].length;
    };
    pub.setFadeLevel = function (ename, index) {
        if (!ename) return;else if (!(ename in _FADE_MAP)) {
            console.error('Expression type ' + ename + ' is not in the fade map.');
            return;
        } else if (pub.getNumOfFadeLevels(ename) >= index) {
            console.warn('Expression type ' + ename + ' has only ' + pub.getNumOfFadeLevels(ename) + ' fade levels. (' + index + 'exceeds)');
            index = pub.getNumOfFadeLevels(ename) - 1; // Set to max fade.
        }
        fade_levels[ename] = index;
    };
    pub.setDefaultFadeLevel = function (index) {
        if (index >= 0) DEFAULT_FADE_LEVEL = index;
    };
    pub.clearFadeLevels = function () {
        fade_levels = {};
    };

    return pub;
}();
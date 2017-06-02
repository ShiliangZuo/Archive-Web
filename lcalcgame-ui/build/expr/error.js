"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ErrorExpr = function (_TextExpr) {
    _inherits(ErrorExpr, _TextExpr);

    function ErrorExpr() {
        _classCallCheck(this, ErrorExpr);

        var _this = _possibleConstructorReturn(this, (ErrorExpr.__proto__ || Object.getPrototypeOf(ErrorExpr)).call(this, "ERROR!"));

        _this.color = "red";
        return _this;
    }

    return ErrorExpr;
}(TextExpr);

var ErrorEffect = function () {
    function ErrorEffect() {
        _classCallCheck(this, ErrorEffect);
    }

    _createClass(ErrorEffect, null, [{
        key: "spawnAt",
        value: function spawnAt(node) {
            ErrorEffect.run(node.stage, node.centerPos());
        }
    }, {
        key: "run",
        value: function run(stage, centerPos) {
            var SPAWN_RATE = 1.0;
            var genRandvec = function genRandvec(dist) {
                return rescalePos({ x: Math.random() - 0.5, y: Math.random() - 0.5 }, dist);
            };
            var loop = function loop() {
                var RAD = 30;
                var randvec = genRandvec(RAD);
                var error = new ErrorExpr();
                error.anchor = { x: 0.5, y: 0.5 };
                error.pos = centerPos;
                error.opacity = 1.0;
                error.stroke = { color: 'white', lineWidth: 4 };
                stage.add(error);
                Animate.tween(error, { opacity: 0, pos: addPos(randvec, error.pos) }, 200, function (e) {
                    if (e < 0.9) // Add a 'shaky' effect
                        error.pos = addPos(error.pos, genRandvec(10 * (1 - e)));
                    return Math.pow(e, 0.5);
                }).after(function () {
                    stage.remove(error);
                    loop();
                });
            };
            loop();
            loop();
            loop();
            loop();
            loop();
        }
    }]);

    return ErrorEffect;
}();
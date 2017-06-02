'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UI_PADDING = __IS_MOBILE ? 2.5 : 10;

/** A subclass of Stage that assumes Nodes are Expressions
    and allows for saving state. */

var ReductStage = function (_mag$Stage) {
    _inherits(ReductStage, _mag$Stage);

    function ReductStage() {
        var canvas = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        _classCallCheck(this, ReductStage);

        var _this = _possibleConstructorReturn(this, (ReductStage.__proto__ || Object.getPrototypeOf(ReductStage)).call(this, canvas));

        _this.stateStack = [];
        _this.environment = new Environment();
        _this.functions = {};
        _this.md = new MobileDetect(window.navigator.userAgent);
        _this.onorientationchange();
        return _this;
    }

    _createClass(ReductStage, [{
        key: 'buildUI',
        value: function buildUI(showEnvironment, envDisplayWidth) {
            var _this2 = this;

            var TOOLBOX_HEIGHT = this.toolboxHeight;

            var canvas_screen = this.boundingSize;

            var btn_back = new mag.Button(canvas_screen.w - 64 * 4 - UI_PADDING, UI_PADDING, 64, 64, { default: 'btn-back-default', hover: 'btn-back-hover', down: 'btn-back-down' }, function () {
                //returnToMenu();
                prev(); // go back to previous level; see index.html.
            });

            var btn_menu = new mag.Button(canvas_screen.w - 64 * 3 - UI_PADDING, UI_PADDING, 64, 64, { default: 'btn-menu-default', hover: 'btn-menu-hover', down: 'btn-menu-down' }, function () {
                returnToMenu();
            });

            var btn_reset = new mag.Button(btn_back.pos.x + btn_back.size.w, UI_PADDING, 64, 64, { default: 'btn-reset-default', hover: 'btn-reset-hover', down: 'btn-reset-down' }, function () {
                initBoard(); // reset board state; see index.html.
            });

            var btn_next = new mag.Button(btn_reset.pos.x + btn_reset.size.w, UI_PADDING, 64, 64, { default: 'btn-next-default', hover: 'btn-next-hover', down: 'btn-next-down' }, function () {
                next(); // go back to previous level; see index.html.
            });

            var buttonsVisible = false;
            var background = new mag.Rect(0, 0, 0, 0);
            background.color = "white";
            background.ignoreEvents = true;

            var showButtons = function showButtons() {
                if (__IS_MOBILE) {
                    // Make sure hamburger button is visible
                    _this2.remove(btn_hamburger);
                    _this2.add(background);
                    _this2.add(btn_hamburger);
                }

                if (__SHOW_DEV_INFO) {
                    _this2.add(btn_back);
                    _this2.add(btn_next);
                }

                _this2.add(btn_reset);
                _this2.add(btn_menu);
            };
            var hideButtons = function hideButtons() {
                _this2.remove(background);
                _this2.remove(btn_back);
                _this2.remove(btn_next);
                _this2.remove(btn_reset);
                _this2.remove(btn_menu);
            };

            this.buttonBackground = background;

            var btn_hamburger = new mag.Button(btn_next.pos.x + btn_next.size.w, UI_PADDING, 64, 64, { default: 'btn-hamburger-default', hover: 'btn-hamburger-hover', down: 'btn-hamburger-down' }, function () {
                if (buttonsVisible) {
                    hideButtons();
                } else {
                    showButtons();
                }

                buttonsVisible = !buttonsVisible;
            });

            if (__IS_MOBILE) {
                this.add(btn_hamburger);
            } else {
                if (__SHOW_DEV_INFO) {
                    this.add(btn_back);
                    this.add(btn_next);
                } else {
                    btn_menu.pos = btn_reset.pos;
                    btn_reset.pos = btn_next.pos;
                }
                this.add(btn_menu);
                this.add(btn_reset);
            }

            // Toolbox
            var toolbox = new Toolbox(0, canvas_screen.h - TOOLBOX_HEIGHT, canvas_screen.w, TOOLBOX_HEIGHT);
            this.add(toolbox);
            this.toolbox = toolbox;

            // Environment
            var yOffset = btn_reset.absoluteSize.h + btn_reset.absolutePos.y + 20;
            var env = new (ExprManager.getClass('environment_display'))(canvas_screen.w - envDisplayWidth, yOffset, envDisplayWidth, canvas_screen.h - TOOLBOX_HEIGHT - yOffset);
            if (showEnvironment) {
                this.add(env);
            }
            this.environmentDisplay = env;

            this.uiNodes = [btn_back, btn_menu, btn_reset, btn_next, btn_hamburger, toolbox, env];

            this.layoutUI();
        }
    }, {
        key: 'layoutUI',
        value: function layoutUI() {
            // layoutUI is called through onorientationchange in the
            // constructor, before we have any UI nodes
            if (!this.uiNodes) return;

            var canvas_screen = this.boundingSize;

            var btn_back = this.uiNodes[0];
            var btn_menu = this.uiNodes[1];
            var btn_reset = this.uiNodes[2];
            var btn_next = this.uiNodes[3];
            var btn_hamburger = this.uiNodes[4];

            var NUM_BUTTONS = (__IS_MOBILE ? 3 : 2) + (__SHOW_DEV_INFO ? 2 : 0);

            for (var i = 0; i < NUM_BUTTONS; i++) {
                this.uiNodes[i].pos = {
                    x: canvas_screen.w - 64 * (NUM_BUTTONS - i) - UI_PADDING,
                    y: this.uiNodes[i].pos.y
                };
            }

            this.buttonBackground.size = {
                w: this.boundingSize.w,
                h: btn_back.size.h + 2 * UI_PADDING
            };

            this.toolbox.pos = {
                x: 0,
                y: canvas_screen.h - this.toolboxHeight
            };
            this.toolbox.size = {
                w: canvas_screen.w,
                h: this.toolboxHeight
            };

            var yOffset = btn_reset.absoluteSize.h + btn_reset.absolutePos.y + 20;
            this.environmentDisplay._pos = {
                x: canvas_screen.w - this.environmentDisplay.size.w,
                y: yOffset
            };
            this.environmentDisplay._size = {
                w: this.environmentDisplay.size.w,
                h: canvas_screen.h - this.toolboxHeight - yOffset
            };
        }
    }, {
        key: 'finishLoading',
        value: function finishLoading() {
            var innerStages = this.getNodesWithClass(ReductStageExpr);
            innerStages.forEach(function (stg) {
                stg.build();
            });
            var textboxes = this.getNodesWithClass(TypeInTextExpr);
            if (textboxes.length > 0) {
                // If one text box is on the screen, focus it!
                textboxes[0].focus();
            }
            this.update();
        }

        // Save state of game board and push onto undo stack.

    }, {
        key: 'saveState',
        value: function saveState() {
            if (!this.expressionNodes) return;
            // TODO: DML save and restore the environment as well.
            var board = this.expressionNodes().map(function (n) {
                return n.clone();
            });
            board = board.filter(function (n) {
                return !(n instanceof ExpressionEffect);
            });
            var toolbox = this.toolboxNodes().map(function (n) {
                return n.clone();
            });
            this.stateStack.push({ 'board': board, 'toolbox': toolbox });
        }

        // Restore previous state of game board.

    }, {
        key: 'restoreState',
        value: function restoreState() {
            var _this3 = this;

            if (!this.expressionNodes) return;
            if (this.stateStack.length > 0) {
                //this.nodes = this.stateStack.pop();

                this.expressionNodes().forEach(function (n) {
                    return _this3.remove(n);
                });
                this.toolboxNodes().forEach(function (n) {
                    return _this3.remove(n);
                });
                var restored_state = this.stateStack.pop();
                restored_state.board.forEach(function (n) {
                    return _this3.add(n);
                });
                restored_state.toolbox.forEach(function (n) {
                    n.toolbox = _this3.toolbox;
                    _this3.add(n);
                });

                this.update();
                this.draw();

                Logger.log('state-restore', this.toString());
            }
        }
    }, {
        key: 'dumpState',
        value: function dumpState() {
            if (this.stateStack.length > 0) {
                this.stateStack.pop();
            }
        }

        // Checks for level completion.

    }, {
        key: 'update',
        value: function update() {
            var _this4 = this;

            _get(ReductStage.prototype.__proto__ || Object.getPrototypeOf(ReductStage.prototype), 'update', this).call(this);

            if (this.isCompleted) {
                var level_complete = this.isCompleted();

                if (level_complete) {

                    // DEBUG TEST FLYTO ANIMATION.
                    if (!this.ranCompletionAnim) {

                        Logger.log('victory', { 'final_state': this.toString(), 'num_of_moves': undefined });

                        var you_win = function you_win() {

                            //if (level_idx < 1) {
                            var cmp = new mag.ImageRect(GLOBAL_DEFAULT_SCREENSIZE.w / 2, GLOBAL_DEFAULT_SCREENSIZE.h / 2, 740 / 2, 146 / 2, 'victory');
                            cmp.anchor = { x: 0.5, y: 0.5 };
                            _this4.add(cmp);
                            _this4.draw();

                            Resource.play('victory');
                            Animate.wait(1080).after(function () {
                                next();
                            });
                            //} else { // Skip victory jingle on every level after first.
                            //    next();
                            //}
                        };

                        var pairs = level_complete;
                        var num_exploded = 0;
                        var playedSplosionAudio = false;

                        pairs.forEach(function (pair, idx) {
                            var node = pair[0];
                            var goalNode = pair[1];
                            node.ignoreEvents = true;

                            Resource.play('matching-goal');

                            var blinkCount = level_idx === 0 ? 2 : 1;
                            Animate.blink([node, goalNode], 2500 / 2.0 * blinkCount, [0, 1, 1], blinkCount).after(function () {
                                //Resource.play('shootwee');

                                _this4.playerWon = true;

                                //Animate.flyToTarget(node, goalNode.absolutePos, 2500.0, { x:200, y:300 }, () => {
                                SplosionEffect.run(node);
                                SplosionEffect.run(goalNode);

                                if (!playedSplosionAudio) {
                                    // Play sFx.
                                    Resource.play('splosion');
                                    playedSplosionAudio = true;
                                }

                                goalNode.parent.removeChild(goalNode);
                                num_exploded++;
                                if (num_exploded === pairs.length) {
                                    Animate.wait(500).after(you_win);
                                }
                                //});
                            });
                        });

                        this.ranCompletionAnim = true;
                    }
                }
            }
        }

        // getExprsWithCompatibleNotch(notch, excludedExprs=[], recursive=true) {
        //     let exprs = this.expressionNodes();
        //     let compatible_exprs = [];
        //     exprs.filter((e) => {
        //         if (e.notches && e.notches.length > 0 && e.notches.some((n) => n.isCompatibleWith(notch))) {
        //             compatible_exprs.push(e);
        //         }
        //     });
        //     return compatible_exprs;
        // }

    }, {
        key: 'onmousedown',
        value: function onmousedown(pos) {
            _get(ReductStage.prototype.__proto__ || Object.getPrototypeOf(ReductStage.prototype), 'onmousedown', this).call(this, pos);
            if (this.heldNode && this.keyEventDelegate && this.heldNode != this.keyEventDelegate) {
                this.keyEventDelegate.blur();
                this.keyEventDelegate = null;
            }
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {

            // Let player click to continue.
            if (!__IS_MOBILE && this.playerWon) {
                Logger.log('clicked-to-continue', '');
                next();
            }

            _get(ReductStage.prototype.__proto__ || Object.getPrototypeOf(ReductStage.prototype), 'onmouseclick', this).call(this, pos);
        }
    }, {
        key: 'onkeydown',
        value: function onkeydown(event) {
            if (this.keyEventDelegate) {
                var key = event.keyCode;
                if (key === 8) {
                    // BACKSPACE
                    this.keyEventDelegate.backspace();
                }
            }
        }
    }, {
        key: 'onkeypress',
        value: function onkeypress(event) {
            if (this.keyEventDelegate) {
                if (event.keyCode === 13) {
                    this.keyEventDelegate.carriageReturn();
                } else {
                    var character = event.char;
                    this.keyEventDelegate.type(character);
                }
            }
        }
    }, {
        key: 'toString',
        value: function toString() {
            if (!this.expressionNodes) return "[stage]";

            var stringify = function stringify(nodes) {
                return nodes.reduce(function (prev, curr) {
                    var s = curr.toString();
                    if (s === '()') return prev; // Skip empty expressions.
                    else return prev + curr.toString() + ' ';
                }, '').trim();
            };

            var board = this.expressionNodes();
            var toolbox = this.toolboxNodes();
            var exp = {
                'board': stringify(board),
                'toolbox': stringify(toolbox)
            };

            return JSON.stringify(exp);
        }
    }, {
        key: 'onorientationchange',
        value: function onorientationchange() {
            if (__IS_MOBILE) {
                if (this.md.phone()) {
                    this.scale = 1.0;
                } else if (this.md.tablet()) {
                    this.scale = 1.2;
                } else if (this.md.mobile()) {
                    this.scale = 2.0;
                } else {
                    this.scale = 1.0;
                }
            }
            this.layoutUI();

            if (this.expressionNodes) {
                var bs = this.boundingSize;
                if (this.environmentDisplay) bs.w -= this.environmentDisplay.size.w;
                if (this.toolbox) bs.h -= this.toolbox.size.h;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.expressionNodes()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var node = _step.value;

                        // Check if node offstage or obscured
                        var p = node.pos;
                        var s = node.size;
                        if (p.x > bs.w) {
                            p.x = bs.w - s.w;
                        }
                        if (p.y > bs.h) {
                            p.y = bs.h - s.h;
                        }
                        node.pos = p;
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
            }
        }
    }, {
        key: 'toolboxHeight',
        get: function get() {
            return __IS_MOBILE && this.md.phone() ? 70 : 90;
        }
    }]);

    return ReductStage;
}(mag.Stage);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** Core drawing class - Node
 *  @module core/node
 */
var mag = function (_) {
    var Node = function () {
        function Node(x, y) {
            _classCallCheck(this, Node);

            this._pos = { x: x, y: y };
            this.children = [];
            this.parent = null;
            this._stage = null;
            this.ignoreEvents = false;
        }

        _createClass(Node, [{
            key: 'hasChild',
            value: function hasChild(child) {
                return this.children.indexOf(child) > -1;
            }
        }, {
            key: 'addChild',
            value: function addChild(child) {
                this.children.push(child);
                if (child) {
                    child.parent = this;
                }
            }
        }, {
            key: 'addChildAt',
            value: function addChildAt(idx, child) {
                if (idx < 0 || idx >= this.children.count) {
                    console.error('@ Node.addChildAt: Index out of range.');
                    return;
                }
                this.children.splice(idx, 0, child);
                child.parent = this;
            }
        }, {
            key: 'removeChild',
            value: function removeChild(node) {
                var i = this.children.indexOf(node);
                if (i > -1) {
                    this.children[i].stage = null;
                    this.children.splice(i, 1);
                }
            }
        }, {
            key: 'addAll',
            value: function addAll(children) {
                var _this = this;

                children.forEach(function (child) {
                    return _this.addChild(child);
                });
            }
        }, {
            key: 'removeAll',
            value: function removeAll(children) {
                var _this2 = this;

                children.forEach(function (child) {
                    return _this2.removeChild(child);
                });
            }
        }, {
            key: 'posWithOffset',
            value: function posWithOffset(offset) {
                if (typeof offset === 'undefined') return this.pos;else return shiftPos(this.pos, offset);
            }
        }, {
            key: 'update',
            value: function update() {
                this.children.forEach(function (c) {
                    return c.update();
                });
            }
        }, {
            key: 'draw',
            value: function draw(ctx, offset) {
                var pos = this.posWithOffset(offset);
                this.drawInternal(ctx, pos);
                this.children.forEach(function (child) {
                    return child.draw(ctx, pos);
                });
            }
        }, {
            key: 'drawInternal',
            value: function drawInternal(ctx, pos) {}

            // Events

        }, {
            key: 'hits',
            value: function hits(pos) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                return null;
            } // Whether the given position lies 'inside' this node. Returns the node that it hits (could be child).

        }, {
            key: 'hitsChild',
            value: function hitsChild(pos) {
                return null;
            }
        }, {
            key: 'onmousedown',
            value: function onmousedown(pos) {}
        }, {
            key: 'onmousedrag',
            value: function onmousedrag(pos) {}
        }, {
            key: 'onmouseclick',
            value: function onmouseclick(pos) {}
        }, {
            key: 'onmousehover',
            value: function onmousehover(pos) {}
        }, {
            key: 'onmouseenter',
            value: function onmouseenter(pos) {}
        }, {
            key: 'onmouseleave',
            value: function onmouseleave(pos) {}
        }, {
            key: 'onmouseup',
            value: function onmouseup(pos) {}

            // Drag 'n' drop

        }, {
            key: 'ondropenter',
            value: function ondropenter(node, pos) {}
        }, {
            key: 'ondropped',
            value: function ondropped(node, pos) {}
        }, {
            key: 'ondropexit',
            value: function ondropexit(node, pos) {}

            // Name of class

        }, {
            key: 'value',
            value: function value() {
                return this.constructor.name;
            }

            // Generic clone function.

        }, {
            key: 'clone',
            value: function clone() {
                var _this3 = this;

                var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

                //console.log("called clone in node.js");
                var ins = constructClassInstance(this.constructor, this.constructorArgs);
                //console.warn('Cloning', this.constructor);
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = Object.keys(this)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var key = _step.value;

                        var v = this[key];
                        if (v && v instanceof Object) {
                            if ('x' in v && 'y' in v) v = { x: v.x, y: v.y };else if ('w' in v && 'h' in v) v = { w: v.w, h: v.h };else if ('color' in v && 'lineWidth' in v) v = { color: v.color, lineWidth: v.lineWidth };
                        }
                        ins[key] = v;
                        //console.warn('Cloning', key, v);
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

                ins.parent = parent;
                ins.children = ins.children.map(function (child) {
                    return child.clone(_this3);
                });
                return ins;
            }

            // 'Equality.'

        }, {
            key: 'equals',
            value: function equals(otherNode) {
                if (!otherNode || !otherNode.constructor) return false;else return this.constructor.name === otherNode.constructor.name;
            }
        }, {
            key: 'stage',
            get: function get() {
                if (!this._stage && this.parent) return this.parent.stage;else return this._stage;
            },
            set: function set(stg) {
                this._stage = stg;
            }
        }, {
            key: 'rootParent',
            get: function get() {
                if (this.parent) return this.parent.rootParent;else if (this._stage) return this;else return null;
            }
        }, {
            key: 'pos',
            get: function get() {
                return { x: this._pos.x, y: this._pos.y };
            },
            set: function set(p) {
                this._pos = p;
            }
        }, {
            key: 'absolutePos',
            get: function get() {
                var pos = this.pos;
                if (this.parent) return addPos(pos, this.parent.absolutePos);else return pos;
            }
        }, {
            key: 'constructorArgs',
            get: function get() {
                return null;
            }
        }]);

        return Node;
    }();

    // Exports


    _.Node = Node;
    return _;
}(mag || {});
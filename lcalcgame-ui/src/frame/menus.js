class MenuButton extends mag.RoundedRect {
    constructor(x, y, w, h, text, onclick, color='gold', textColor='orange', shadowColor='orange', onDownShadowColor='red') {
        super(x, y, w, h, 10);

        let t = new TextExpr(text, 'Futura');
        t.color = textColor;
        t.anchor = { x:0.5, y:0.5 };
        t.pos = { x:w/2, y:h/2 };
        this.text = t;
        this.addChild(t);

        this.origShadowOffset = 14;
        this.shadowOffset = 14;
        this.hoverIndent = -4;
        this.downIndent = 4;
        this.shadowColor = shadowColor;
        this.onDownColor = shadowColor;
        this.onDownShadowColor = onDownShadowColor;
        this.onUpShadowColor = shadowColor;
        this.onUpColor = color;
        this.textColor = textColor;
        this.color = color;

        this.clickFunc = onclick;

        this.pos = { x:x, y:y };
    }

    get pos() { return { x:this._pos.x, y:this._pos.y }; }
    set pos(p) {
        super.pos = p;
        this._origpos = { x:p.x, y:p.y };
    }

    runButtonClickEffect() {

        var rr = new mag.RoundedRect( this.absolutePos.x, this.absolutePos.y,
                                      this.absoluteSize.w, this.absoluteSize.h, this.radius );
        rr.color = null;
        rr.shadowOffset = 0;
        rr.anchor = this.anchor;
        rr.ignoreEvents = true;
        rr.stroke = { color:'white', lineWidth:4, opacity:1.0 };
        this.stage.add(rr);

        Animate.chain((elapsed) => {
            let c = colorTween(elapsed, [1, 215/255.0, 0], [1, 1, 1]);
            let sc = colorTween(elapsed, [1, 0, 0], [0.8, 0.8, 0.8]);
            this.color = c;
            this.text.color = c;
            this.shadowColor = sc;
            this.stage.draw();
        }, 200, null,
        (elapsed) => {
            //elapsed = elapsed * elapsed;
            rr.scale = { x:1+elapsed, y:1+elapsed };
            rr.stroke.opacity = 1-elapsed;
            this.stage.draw();
        }, 160, () => {
            this.stage.remove(rr);
            this.onmouseleave();
            this.stage.draw();
            if (this.clickFunc) {
                this.clickFunc();
            }
        });
    }

    onmouseenter(pos) {
        this.color = this.onDownColor;
        this.shadowColor = this.onDownShadowColor;
        this.shadowOffset = this.origShadowOffset - this.hoverIndent;
        this.text.color = 'white';
        this._pos.y += this.hoverIndent;
    }
    onmouseleave(pos) {
        this.color = this.onUpColor;
        this.shadowColor = this.onUpShadowColor;
        this.text.color = this.textColor;
        this._pos.y = this._origpos.y;
        this.shadowOffset = this.origShadowOffset;
    }
    onmousedrag(pos) {
        let hits = this.hits(pos);
        if (!hits && this.color !== this.onUpColor) {
            this.onmouseleave(pos);
        } else if (this.color === this.onUpColor && hits) {
            this.onmouseenter(pos);
            this.onmousedown(pos);
        }
    }
    onmousedown(pos) {
        this._prevy = this._pos.y;
        this._pos.y += this.shadowOffset - this.downIndent;
        this.shadowOffset = this.downIndent;
        //this.color = this.onUpColor;
        Resource.play('fatbtn-click');
    }
    onmouseup(pos) {
        if (!this.hits(pos)) return;
        this._pos.y = this._origpos.y;
        this.shadowOffset = this.origShadowOffset;
        this.runButtonClickEffect();
        Animate.wait(50).after(() => Resource.play('fatbtn-beep'));
    }
}

class MenuStar extends mag.ImageRect {
    constructor() {
        super('mainmenu-star' + Math.floor(Math.random() * 14 + 1));
    }
    twinkle(dur=350) {
        const blinkDur = dur + Math.random() * 100;
        let _this = this;
        let blink = () => {
            if (_this.cancelBlink) return;
            Animate.tween(_this, { opacity:0.4 }, blinkDur, (e) => Math.pow(e, 2)).after(() => {
                if (_this.cancelBlink) return;
                Animate.tween(_this, { opacity:1 }, blinkDur, (e) => Math.pow(e, 2)).after(blink);
            });
        };
        blink();
    }

    drawInternal(ctx, pos, boundingSize) {
        if (this.parent && Number.isNumber(this.parent.opacity)) {
            ctx.globalAlpha = this.parent.opacity * (this.opacity || 1.0);
        }
        super.drawInternal(ctx, pos, boundingSize);
    }
}

class MainMenu extends mag.Stage {

    constructor(canvas=null, onClickPlay=null, onClickSettings=null) {
        super(canvas);

        let bg = new mag.Rect(0, 0, GLOBAL_DEFAULT_SCREENSIZE.width, GLOBAL_DEFAULT_SCREENSIZE.height);
        bg.color = '#594764';
        bg.pos = zeroPos();
        bg.ignoreEvents = true;
        this.add(bg);
        this.bg = bg;

        this.showStars();
        this.showStarboy(onClickPlay);
        this.showTitle();
        //this.showPlayButton(onClickPlay);
        //this.showSettingsButton(onClickSettings);
    }

    showStars() {
        const NUM_STARS = 70;
        const STARBOY_RECT = {x:GLOBAL_DEFAULT_SCREENSIZE.width / 2.0-298/1.8/2, y:GLOBAL_DEFAULT_SCREENSIZE.height / 2.1-385/1.8/2, w:298/1.8, h:385/1.8};
        let genRandomPt = () => {
            return randomPointInRect( {x:0, y:0, w:GLOBAL_DEFAULT_SCREENSIZE.width, h:GLOBAL_DEFAULT_SCREENSIZE.height} );
        };
        let stars = [];
        let n = NUM_STARS;
        while(n-- > 0) {

            // Create an instance of a star illustration.
            let star = new MenuStar();
            //star.anchor = { x:0.5, y:0.5 };

            // Find a random position that doesn't intersect other previously created stars.
            let p = genRandomPt();

            // Limit how many times we try (mobile optimization)
            let tries = 0;

            for (let i = 0; i < stars.length; i++) {
                let s = stars[i];
                let prect = {x:p.x, y:p.y, w:star.size.w, h:star.size.h};
                let srect = {x:s._pos.x, y:s._pos.y, w:s.size.w, h:s.size.h};
                tries++;
                if ((intersects(STARBOY_RECT, prect) ||
                     intersects(prect, srect)) && tries < 100) {
                    p = genRandomPt();
                    i = 0;
                }
            }

            // Set star properties
            star.pos = p;
            star.opacity = 0.4;
            const scale = Math.random() * 0.3 + 0.3;
            star.scale = { x:scale, y:scale };
            this.add(star);
            stars.push(star);

            // Twinkling effect
            Animate.wait(1000 * Math.random()).after(() => star.twinkle());

            // "Zoom"
            let screenCenter = {x:GLOBAL_DEFAULT_SCREENSIZE.width/2.0, y:GLOBAL_DEFAULT_SCREENSIZE.height/2.0};
            let fromCenter = fromTo( screenCenter, star.pos);
            let offscreenDest = addPos(screenCenter, rescalePos( fromCenter, screenCenter.x * 1.6));
            let comebackDest = addPos(screenCenter, rescalePos( fromCenter, 120));
            let zoom = () => {
                Animate.tween(star, { pos:offscreenDest, scale:{x:0.6,y:0.6} }, 3000 * distBetweenPos(star.pos, screenCenter) / distBetweenPos(offscreenDest, screenCenter),
                (e) => Math.pow(e, 0.8)).after(() => {
                    star.pos = comebackDest;
                    star.scale = { x:scale, y:scale };
                    star.opacity = 0;
                    zoom();
                });
            };
            star.zoomAnimation = () => {

                zoom();
                //Animate.wait(distBetweenPos(p, screenCenter) / distBetweenPos(offscreenDest, screenCenter) * 1000).after(zoom);
            };

        }
        this.stars = stars;
    }

    zoom() {
        this.stars.forEach((star) => {
            star.zoomAnimation();
        });
    }

    showStarboy(onclick) {
        let bg = this.bg;
        let _this = this;
        let starboy = new mag.Button(0, 0, 298/1.8, 385/1.8,
                                    {default:'mainmenu-starboy', hover:'mainmenu-starboy-glow', down:'mainmenu-starboy-glow'},
                                    () => {
                                        if (_this.title) _this.remove(_this.title);
                                        Resource.play('mainmenu-enter');
                                        starboy.cancelFloat = true;
                                        starboy.ignoreEvents = true;
                                        Animate.tween(starboy, { scale:{x:0.0, y:0.0} }, 2500, (e) => Math.pow(e, 2));
                                        Animate.wait(2000).after(() => {
                                            Animate.run((e) => {
                                                bg.color = colorTween(e, [89/255.0, 71/255.0, 100/255.0], [0, 0, 0]);
                                                _this.stars.forEach((s) => {
                                                    s.opacity = 1 - e;
                                                    s.cancelBlink = true;
                                                });
                                                _this.draw();
                                            }, 700).after(() => {
                                                _this.stars.forEach((s) => {
                                                    _this.remove(s);
                                                });
                                                _this.stars = [];
                                                _this.remove(starboy);
                                                _this.starboy = null;
                                                _this.draw();
                                                onclick();
                                            });
                                        });
                                        this.zoom();
                                    });
        starboy.anchor = { x:0.5, y:0.5 };
        starboy.pos = { x:GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y:GLOBAL_DEFAULT_SCREENSIZE.height / 2.1 };
        this.add(starboy);

        let y = starboy._pos.y;
        let float = 0;
        var twn = new mag.IndefiniteTween((delta) => {
            float += delta / 600;
            starboy.pos = { x:starboy.pos.x, y:y+Math.cos(float)*14 };
            if (starboy.cancelFloat) twn.cancel();
        });
        twn.run();

        this.starboy = starboy;
    }

    showTitle() {
        let title = new TextExpr('R   E   D   U   C   T', 'Consolas', 30);
        title.color = 'white';
        title.anchor = { x:0.5, y:0.5 };
        title.pos = { x:GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y:GLOBAL_DEFAULT_SCREENSIZE.height / 1.2 };
        this.add(title);
        this.title = title;
    }

    showPlayButton(onClickPlay) {
        let b = new MenuButton(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0,
                               GLOBAL_DEFAULT_SCREENSIZE.height / 2.0 + 80,
                               140, 100,
                               'Play', onClickPlay);
        b.anchor = { x:0.5, y:0.5 };
        this.add(b);
    }

    showSettingsButton(onClickSettings) {
        let b = new MenuButton(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0,
                               GLOBAL_DEFAULT_SCREENSIZE.height / 2.0 + 80 + 120,
                               140, 60,
                               'Settings',
                               onClickSettings,
                               'Purple', 'lightgray', 'Indigo', 'Purple');
        b.anchor = { x:0.5, y:0.5 };
        this.add(b);
    }

    onorientationchange() {
        this.starboy.pos = { x:GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y:GLOBAL_DEFAULT_SCREENSIZE.height / 2.1 };
        this.title.pos = { x:GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y:GLOBAL_DEFAULT_SCREENSIZE.height / 1.2 };
        this.bg.size = {
            w: GLOBAL_DEFAULT_SCREENSIZE.width, h: GLOBAL_DEFAULT_SCREENSIZE.height
        };
    }
}

class DraggableRect extends mag.Rect {
    constrainX() { this.cX = true; }
    constrainY() { this.cY = true; }
    snapEvery(step, offset) { this.snapStep = step; this.snapOffset = offset; }
    onmousedrag(pos) {
        if (this.cX) pos.x = this.pos.x;
        if (this.cY) pos.y = this.pos.y;
        this.pos = pos;
    }
    onmouseup(pos) {
        if (!this.snapStep) {
            super.onmouseup(pos);
            return;
        }

        let targetPos = { x:Math.round(this.pos.x / this.snapStep) * this.snapStep + this.snapOffset, y:this.pos.y };
        Animate.tween(this, { pos:targetPos }, 200, (elapsed) => Math.pow(elapsed, 0.5));
    }
}

class LevelCell extends MenuButton {
    lock() {
        this.text.text = '🔒';
        this.color = '#666';
        this.shadowColor = 'gray';
        this.pos = { x:this.pos.x, y:this.pos.y+this.shadowOffset-8 };
        this.shadowOffset = 8;
        this.ignoreEvents = true;
    }
}
class LevelSelectGrid extends mag.Rect {
    constructor(chapterName, onLevelSelect) {
        super(0, 0, 0, 0);
        this.color = null;
        this.showGrid(chapterName, onLevelSelect);
    }

    hide(dur) {
        let len = this.children.length;
        this.children.forEach((c, i) => {
            c.opacity = 1;
            Animate.tween(c, { scale: {x:0, y:0}, opacity:0 }, (len - i - 1) * 30).after(() => {
                this.removeChild(c);
            });
        });
        return Animate.wait((len - 1) * 30);
    }

    gridSizeForLevelCount(n) {
        if (n <= 8) return 124;
        else if (n <= 14) return 100;
        else return 84;
    }

    showGrid(chapterName, onselect) {

        // Layout measurement
        const levels = Resource.levelsForChapter(chapterName);
        const NUM_CELLS = levels[0].length; // total number of cells to fit on the grid
        const CELL_SIZE = this.gridSizeForLevelCount(NUM_CELLS); // width and height of each cell square, in pixels
        const SCREEN_WIDTH = GLOBAL_DEFAULT_SCREENSIZE.width; // the width of the screen to work with
        const PADDING = 20; // padding between cells
        const TOP_MARGIN = 20;
        const GRID_MARGIN = 80; // margin bounding grid on top, left, and right sides
        const NUM_COLS = Math.trunc((SCREEN_WIDTH - GRID_MARGIN*2) / (CELL_SIZE + PADDING)); // number of cells that fit horizontally on the screen
        const NUM_ROWS = Math.trunc(NUM_CELLS / NUM_COLS + 1); // number of rows
        const GRID_LEFTPAD = (SCREEN_WIDTH - ((CELL_SIZE + PADDING) * NUM_COLS + GRID_MARGIN*2)) / 2.0;

        console.log(levels);
        console.log(SCREEN_WIDTH - GRID_MARGIN*2, CELL_SIZE + PADDING, NUM_CELLS, NUM_COLS, NUM_ROWS);

        const genClickCallback = (level_idx) => {
            return () => onselect(levels[0][level_idx], levels[1] + level_idx);
        };

        const leftmost = GRID_LEFTPAD + GRID_MARGIN;
        let x = leftmost;
        let y = TOP_MARGIN;

        for (let r = 0; r < NUM_ROWS; r++) {

            let i = r * NUM_COLS;

            for (let c = 0; c < NUM_COLS; c++) {

                // Create a level cell and add it to the grid.
                let cell = new LevelCell(x + CELL_SIZE / 2.0, y + CELL_SIZE / 2.0, CELL_SIZE, CELL_SIZE, i.toString(), genClickCallback(i),
                                         r === 0 ? 'LightGreen' : 'Gold', 'white', r === 0 ? 'Green' : 'Teal', r === 0 ? 'DarkGreen' : 'DarkMagenta');
                cell.onDownColor = r === 0 ? 'YellowGreen' : 'Orange' ;
                cell.anchor = { x:0.5, y:0.5 };
                //if (i > 5) cell.lock();
                this.addChild(cell);

                // Animate cell into position.
                cell.scale = { x:0.0, y:0 };
                Animate.wait(i * 50).after(() => {
                    Animate.tween(cell, { scale: { x:1, y:1 } }, 300, (elapsed) => Math.pow(elapsed, 0.5));
                });

                // Increment x-position.
                x += CELL_SIZE + PADDING;

                // The level index, calculated from the row and column indices.
                i++;
                if (i >= NUM_CELLS) break;
            }

            if (i >= NUM_CELLS) break;

            // Increment y-position and set x-position left.
            y += CELL_SIZE + PADDING;
            x = leftmost;
        }
    }
}

class LevelSpot extends mag.Circle {
    constructor(x, y, r, onclick) {
        super(x, y, r);
        this.color = 'gray';
        this.enabled = false;
        this.shadowOffset = 0;
        this.highlightColor = 'lime';
        this.disabledColor = 'gray';
        this.enabledColor = 'white';
        this.stroke = { color:'black', lineWidth:2 };
        this.onclick = onclick;
        this.flashing = false;

        let glow = new mag.ImageRect(0, 0, r*2.5, r*2.5, 'level-spot-glow');
        glow.anchor = { x:0.5, y:0.5 };
        glow.pos = { x:r, y:r };
        glow.ignoreEvents = true;
        this.glow = glow;
        this.glow.parent = this;
    }

    cancelFlash() {
        this.flashing = false;
        this.cancelBlink = true;
        this.color = 'white';
    }

    flash() {
        this.enabledColor = 'cyan';
        this.color = 'cyan';

        if (this.flashing) return;

        this.flashing = true;
        this.cancelBlink = false;
        const dur = 800;
        this.glow.opacity = 1.0;
        let _this = this;
        let sound = 0;
        let blink = () => {
            if (_this.cancelBlink) {
                this.flashing = false;
                return;
            }

            if (sound == 0 && !this.ignoreEvents && (this.stage && !this.stage.invalidated)) {
                Resource.play('levelspot-scan');
            }
            sound = (sound + 1) % 4;

            Animate.tween(this.glow, { opacity:0.1 }, dur, (e) => Math.pow(e, 2)).after(() => {
                if (_this.cancelBlink) {
                    this.flashing = false;
                    return;
                }
                Animate.tween(this.glow, { opacity:0.6 }, dur, (e) => Math.pow(e, 0.5)).after(blink);
            });
        };
        blink();
    }

    enable() {
        this.color = 'white';
        this.enabled = true;
        this.enabledColor = 'white';
    }
    disable() {
        this.color = 'gray';
        this.enabled = false;
    }
    onmouseenter(pos) {
        if (!this.enabled) return;
        this.stroke = { color:'yellow', lineWidth:this.stroke.lineWidth };
        this.color = this.highlightColor;
    }
    onmouseleave(pos) {
        if (!this.enabled) return;
        this.stroke = { color:'black', lineWidth:this.stroke.lineWidth };
        this.color = this.enabledColor;
    }
    onmouseclick(pos) {
        if (this.enabled && this.onclick) {
            this.onclick();
        }
    }

    drawInternal(ctx, pos, boundingSize) {
        if (!this.ignoreEvents && (this.flashing || this.color === this.highlightColor)) {
            ctx.save();
            if (this.glow.opacity) {
                if (this.color === this.highlightColor) {
                    ctx.globalAlpha = Math.max(this.glow.opacity, 0.3) + 0.4;
                }
                else {
                    ctx.globalAlpha = this.glow.opacity;
                }
            }
            let glowPos = {
                x: pos.x - 0.6 * boundingSize.w,
                y: pos.y - 0.6 * boundingSize.h,
            };
            let glowSize = {
                w: 2.2 * boundingSize.w,
                h: 2.2 * boundingSize.h,
            };
            this.glow.drawInternal(ctx, glowPos, glowSize);
            ctx.restore();
        }
        super.drawInternal(ctx, pos, boundingSize);
    }
}

class PlanetCard extends mag.ImageRect {
    constructor(x, y, r, name, planet_image, onclick) {
        super(x, y, r*2, r*2, planet_image+'-locked');

        this.radius = r;
        this.name = name;
        this.onclick = onclick;

        // Backing Glow on Mouseover
        let glow = new mag.ImageRect(0, 0, r*2.5, r*2.5, 'planet-glow');
        glow.anchor = { x:0.5, y:0.5 };
        glow.pos = { x:r, y:r };
        glow.ignoreEvents = true;
        this.glow = glow;

        // Enable backing glow for newly accessible planet
        this.highlighted = false;

        // Text
        const capitalize = (string) => (string.charAt(0).toUpperCase() + string.slice(1));
        let t = new TextExpr(capitalize(name), 'Futura', 14);
        t.color = 'white';
        t.anchor = { x:0.5, y:0.5 };
        t.pos = { x:r, y: 2*r + 15 };
        this.text = t;
        //this.addChild(t);

        // Level path
        let path = new ArrowPath();
        path.stroke.color = 'white';
        path.stroke.lineDash = [5*this.radius/120];
        path.stroke.lineWidth = r / 120;
        path.drawArrowHead = false;
        path.ignoreEvents = true;
        this.path = path;
        this.addChild(path);

        this.pts = [];
        this.unitpos = (pos) => {
            pos = clonePos(pos);
            pos.x -= this.absolutePos.x;
            pos.y -= this.absolutePos.y;
            pos.x /= this.absoluteSize.w / 2;
            pos.y /= this.absoluteSize.h / 2;
            return pos;
        };
    }

    get landingPoint() {
        let a = this.absolutePos;
        return {x:a.x, y:a.y - this.absoluteSize.h / 3};
    }

    get relativeLandingPoint() {
        let a = this.pos;
        return {x:a.x, y:a.y - this.size.h / 3};
    }

    get localLandingPoint() {
        return {x:this.size.w/2.0, y:this.size.h/2.0 / 3};
    }

    showText() {
        if (this.children.indexOf(this.text) === -1)
            this.addChild(this.text);
    }
    hideText() {
        if (this.children.indexOf(this.text) > -1)
            this.removeChild(this.text);
    }

    showShip(worldShip) {
        // Create ship graphic
        let ship = new mag.RotatableImageRect(0, 0, 82, 70, 'ship-large');
        ship.anchor = worldShip.anchor;
        ship.scale = worldShip.absoluteScale;
        ship.rotation = -Math.PI/2.0;
        //ship.scale = { x:0.5*r/120, y:0.5*r/120 };
        ship.pos = this.localLandingPoint;
        ship.ignoreEvents = true;
        this.ship = ship;
        this.addChild(ship);
    }
    hideShip() {
        if (this.ship) {
            this.removeChild(this.ship);
            this.ship = null;
        }
    }

    highlight() {
        this.highlighted = true;
        this.glow.opacity = 0.5;
    }

    removeHighlight() {
        this.highlighted = false;
        this.glow.opacity = 0;
    }

    onmouseclick() {
        if (this.onclick)
            this.onclick();
        this.selected = false;
    }
    onmouseenter() {
        this.selected = true;
        this.glow.opacity = this.highlighted ? 0.5 : 0.0;
        Animate.tween(this.glow, { opacity:1.0 }, 100).after(() => {
            this.glow.opacity = 1;
        });
    }
    onmouseleave(pos) {
        if (distBetweenPos(pos, this.pos) > this.absoluteSize.h / 4.0) {
            this.selected = false;
            if (this.highlighted) {
                this.highlight(); // Reset glow
            }
        }
    }

    drawInternal(ctx, pos, boundingSize) {
        if (this.parent && Number.isNumber(this.parent.opacity)) {
            ctx.globalAlpha = this.parent.opacity * (this.opacity || 1.0);
        }
        if (this.highlighted || (this.selected && this.scale.x < 1.1)) {
            this.glow.parent = this;
            this.glow.draw(ctx);
        }
        super.drawInternal(ctx, pos, boundingSize);
    }

    // Uncomment for drawing curves directly on planets (DEBUG).
    onmousedown(pos) {
        pos = this.unitpos(pos);
        this.pts = [ pos ];
        console.warn(pos);
    }
    onmousedrag(pos) {
        pos = this.unitpos(pos);
        if (this.pts.length > 0) {
             pos.y *= -1;
             pos.x *= -1;
             let relpos = fromTo(pos, this.pts[0]);
             this.pts.push(relpos);
        }
    }
    onmouseup(pos) {
        console.log(this.pts.reduce((prev, cur) => prev + '{"x":' + (cur.x) + ', "y":' + (cur.y) + '},\n', ''));
        if(this.pts.length>2)
            this.setCurve(this.pts);
        this.pts = [];
        this.stage.draw();
    }

    activate() {
        this.image = this.image.replace('-locked', '');
        this.showText();
        this.active = true;
    }

    deactivate() {
        this.active = false;
        this.hideText();
        this.removeChild(this.path);
    }

    activateSpots() {
        if (!this.spots) return;

        this.addChild(this.path);

        // Make all spots invisible.
        this.spots.forEach((spot) => {
            spot.opacity = 0;
            spot.ignoreEvents = true;
            this.addChild(spot);
        });

        // Animate-in how much of the path is drawn.
        const dur = 2000;
        this.path.percentDrawn = 0;
        Animate.tween(this.path, { percentDrawn:1.0 }, dur);
        Animate.run((e) => {
            this.spots.forEach((spot) => {
                if (spot.relPosAlongPath <= this.path.percentDrawn) {
                    if (spot.opacity === 0) Resource.play('levelspot-activate');
                    spot.opacity = 1.0;
                }
            });
        }, dur).after(() => {
            this.spots.forEach((spot) => {
                if (spot.opacity === 0) Resource.play('levelspot-activate');
                spot.opacity = 1.0;
                spot.ignoreEvents = false;
            });
            this.path.percentDrawn = 1;
            this.spots[0].enable();
            this.spots[0].flash();
            Resource.play('fatbtn-beep');
        });
    }

    deactivateSpots() {
        this.removeChild(this.path);

        this.spots.forEach((spot) => {
            spot.opacity = 0;
            spot.ignoreEvents = true;
        });
    }

    updateLevelSpots() {
        if (!this.spots) return;
        this.spots.forEach((spot, i) => {
            spot.opacity = 1.0;
            // Flash the spot if it's the level after one we've
            // completed (level_idx isn't reliable for this when
            // there's multiple branches), or if it's the first spot
            // on the planet

            spot.cancelFlash();
            spot.disable();
            if (completedLevels[spot.levelId]) {
                spot.enable();
            }
            // We have not completed the first level of this planet,
            // but presumably this planet is enabled, so enable the
            // first level
            else if (i === 0) {
                spot.enable();
                spot.flash();
            }
            else if (!completedLevels[spot.levelId] && completedLevels[spot.levelId - 1]) {
                spot.enable();
                spot.flash();
            }
        });
    }

    setCurve(pts) {
        this.path.points = pts.map((p) => ({ x:p.x*this.radius+this.radius, y:p.y*this.radius+this.radius }));
    }

    setLevels(levels, onLevelSelect) {
        this.startLevelIdx = levels[1];
        this.endLevelIdx = levels[1] + levels[0].length - 1;
        const NUM_LVLS = levels[0].length; // total number of cells to fit on the grid
        const genClickCallback = (level_idx) => {
            return () => {
                Resource.play('fatbtn-beep');
                let spot = this.spots[level_idx];
                let pos = spot.absolutePos;
                let r = spot.absoluteSize.w / 2;
                // The scale changes between the menu and stage
                let posPercent = { x: pos.x / this.stage.boundingSize.w,
                                   y: pos.y / this.stage.boundingSize.h };
                let mask = new Mask(posPercent.x, posPercent.y, 20 * r);
                this.stage.add(mask);
                Animate.tween(mask, {
                    opacity: 1.0,
                    radius: 0.1,
                    ringControl: 100,
                }, 500).after(() => {
                    this.stage.remove(mask);
                    onLevelSelect(levels[0][level_idx], levels[1] + level_idx);
                    window.stage.add(mask);
                    Animate.tween(mask, {
                        radius: Math.max(window.stage.boundingSize.w, window.stage.boundingSize.h),
                        ringControl: 150,
                    }, 400).after(() => {
                        window.stage.remove(mask);
                    });
                });
            };
        };

        let md = new MobileDetect(window.navigator.userAgent);

        // Level spots
        this.spots = [];
        for (let i = 1; i <= NUM_LVLS; i++) {
            let spotpos = this.path.posAlongPath((i-1) / (NUM_LVLS-1));
            let r = 8 * this.radius / 120;
            if (__IS_MOBILE && md.phone()) {
                r = 10 * this.radius / 120;
            }
            let spot = new LevelSpot( spotpos.x, spotpos.y, r, genClickCallback(i-1) );
            spot.anchor = { x:0.5, y:0.5 };
            spot.relPosAlongPath = i / NUM_LVLS;
            spot.levelId = levels[1] + i-1;
            spot.stroke.lineWidth = Math.max(this.radius / 120 * 2, 1.5);
            spot.ignoreEvents = true;
            this.spots.push(spot);

            if (this.active) this.addChild(spot);
        }

        this.updateLevelSpots();
    }
}

class ChapterSelectShip extends mag.RotatableImageRect {
    constructor() {
        super(0, 0, 82, 70, 'ship-large');
        this.pointing = { x:1, y:0 };
        this.velocity = { x:0, y:0 };

        this.planet = null;

        const trailWidth = 140;
        let trail = new RainbowTrail(0, 0, trailWidth, 30);
        trail.pos = { x:-trailWidth+20, y:20 };
        //trail.anchor = { x:1, y:0 };
        this.trail = trail;
        this.addChild(trail);
    }

    // Fly to another planet. (entire sequence)
    flyToPlanet(stage, startPlanet, endPlanet) {
        // Hide the local ships and make the world ship
        // the only ship visible.
        this.pos = startPlanet.relativeLandingPoint;
        startPlanet.hideShip();
        endPlanet.hideShip();

        stage.planetParent.ignoreEvents = true;

        const startScale = this.scale.x;
        const endScale = endPlanet.radius / 120 / 2;
        let dest = endPlanet.relativeLandingPoint;
        let aboveOrbitDest = addPos(endPlanet.landingPoint, { x:0, y: -75 });
        let relativeAboveOrbitDest = addPos(dest, { x:0, y: -75 });
        let pointing = fromTo(this.pos, aboveOrbitDest);
        let pointAngle = Math.atan2(pointing.y, pointing.x);
        this.trail.opacity = 0;
        let _this = this;
        this.rotation = -Math.PI / 2.0; // make the ship face upright

        let start = startPlanet.relativeLandingPoint;
        let end = endPlanet.relativeLandingPoint;
        let control1 = {
            x: start.x + 10,
            y: start.y - 200,
        };
        let control2 = {
            x: end.x - 10,
            y: end.y + 200,
        };
        end.y -= 30;

        const travelDist = distBetweenPos(this.pos, dest);
        const duration = travelDist / 100 * 1000;

        let promisify = (x) => {
            return new Promise((resolve, reject) => {
                x.after(resolve);
            });
        };

        let stars = [];
        let starParent = new mag.Rect(0, 0, 0, 0);
        starParent.opacity = 0;
        stage.add(starParent);

        for (let i = 0; i < 120; i++) {
            let star = new MenuStar();
            star.pos = randomPointInRect({ x: 0, y: 0, w: stage.boundingSize.w, h: stage.boundingSize.h });
            let scale = Math.random() * 0.2 + 0.1;
            star.scale = { x: scale, y: scale };
            starParent.addChild(star);
            stars.push(star);
        }

        // The initial launch
        let launch = promisify(Animate.tween(this, {
            pos: addPos(this.pos, { x: 0, y: -100 }),
        }, 1000));
        let del = 0;
        let launchTrail = promisify(Animate.run((e) => {
            this.trail.opacity = Math.min(0.4, Math.pow(e, 0.05));
            this.trail.time += (e - del) * 4000;
            del = e;
        }, 1250));

        return launch.then(() => {
            let p = this.absolutePos;
            stage.planetParent.removeChild(this);
            stage.add(this);
            this.pos = p;
            this.parent = null;

            this.image = 'ship-large-starboy';

            let rotate = promisify(Animate.tween(this, {
                rotation: 0,
            }, 600));

            // Zoom in on Starchild
            let zoomShip = promisify(Animate.tween(this, {
                scale: { x: 5, y: 5 },
                pos: {
                    x: (stage.boundingSize.w / 2 - 2.5 * this.size.w),
                    y: (stage.boundingSize.h / 2 - 2.5*this.size.h),
                },
            }, 600));

            stage.starParent.opacity = 1.0;
            let fadeOutStars = promisify(Animate.tween(stage.starParent, {
                opacity: 0,
            }, 400));

            let fadeInStars = promisify(Animate.tween(starParent, {
                opacity: 0.7,
            }, 400));

            stage.planetParent.opacity = 1.0;
            let zoom = promisify(Animate.tween(stage.planetParent, {
                opacity: 0,
            }, 600));

            return Promise.all([zoomShip, zoom, launchTrail, fadeOutStars, fadeInStars]);
        }).then(() => {
            // Prepare for ignition
            this.trail.time = 0;
            return promisify(Animate.tween(this.trail, {
                opacity: 0,
                time: 500,
            }, 300)).then(() => promisify(Animate.tween(this.trail, {
                opacity: 1.0,
                time: 2500,
            }, 200)));
        }).then(() => {
            // Enter warp space!
            let mask = new Mask(0, 0, 0.01, "#FFFFFF");
            this.stage.add(mask);

            let flash = after(200)
                .then(() => promisify(Animate.tween(mask, {
                    opacity: 1.0,
                }, 100)))
                .then(() => promisify(Animate.tween(mask, {
                    opacity: 0.0,
                }, 100)))
                .then(() => this.stage.remove(mask));

            let jumpForward = promisify(Animate.tween(this, {
                pos: addPos(this.pos, { x: 300, y: 0 }),
            }, 300));

            return jumpForward;
        }).then(() => {
            // Cruising along
            let jumpBack = promisify(Animate.tween(this, {
                pos: addPos(this.pos, { x: -300, y: 0 }),
            }, 1000));

            const origSize = stars[0].size;
            let sizer = stars[0].size;
            stars.forEach((s) => s.size = sizer);
            let starStretch = promisify(Animate.tween(sizer, {
                w: 450,
                h: 6,
            }, 600));

            const flyingDuration = 6000;
            const deceleration = 0.75;

            let t0 = 0;
            let flying = promisify(Animate.run((t1) => {
                this.trail.time += 8000 * (t1 - t0);

                let dx = 15000 * (t1 - t0);
                if (t1 > deceleration) dx *= (-4 * t1 + 4);
                stars.forEach((s) => {
                    s.pos = addPos(s.pos, { x: -dx, y: 0 });
                    if (s.pos.x < 0) {
                        s.pos = { x: stage.boundingSize.w * (0.9 + Math.random() / 5), y: s.pos.y };
                    }
                });

                t0 = t1;
            }, flyingDuration));

            let slowing = after(flyingDuration - 500).then(() => {
                return promisify(Animate.tween(sizer, origSize, 500));
            });

            return Promise.all([flying, slowing]);
        }).then(() => {
            // Come out of warp space
            let turnOffEngine = promisify(Animate.tween(this.trail, {
                opacity: 0,
            }, 400));

            // Zoom back out
            let zoomShip = promisify(Animate.tween(this, {
                scale: { x: endScale, y: endScale },
                pos: aboveOrbitDest,
            }, 600));

            let fadeInStars = promisify(Animate.tween(stage.starParent, {
                opacity: 1.0,
            }, 400));

            let fadeOutStars = promisify(Animate.tween(starParent, {
                opacity: 0,
            }, 400));

            let rotate = after(400).then(() => {
                return promisify(Animate.tween(this, {
                    rotation: -Math.PI / 2,
                }, 600));
            });

            let zoom = promisify(Animate.tween(stage.planetParent, {
                opacity: 1,
            }, 600));

            return Promise.all([turnOffEngine, rotate, zoomShip, zoom, fadeOutStars, fadeInStars]);
        }).then(() => {
            this.image = 'ship-large';
            stage.remove(this);
            stage.planetParent.addChild(this);
            this.pos = relativeAboveOrbitDest;
            let land = promisify(Animate.tween(this, {
                pos: dest,
            }, 1000));
            return land;
        }).then(() => {
            stage.planetParent.ignoreEvents = false;
            endPlanet.showShip(this);
            stage.remove(starParent);
        });
    }

    attachToPlanet(planet) {
        this.pos = planet.landingPoint;
        this.planet = planet;
        planet.showShip(this);
    }

    // Launch the ship into the air.
    launch() {
        this.planet = null;
        return new Promise((resolve, reject) => {
            this.moveTo(addPos(this.pos, { x:0, y:-20 }), 1000).then(resolve);
        });
    }

    // Rotate to angle.
    rotateTo(angle, dur=1000, smoothFunc=(e)=>e) {
        return new Promise((resolve, reject) => {
            Animate.tween(this, { rotation:angle }, dur, smoothFunc).after(resolve);
        });
    }

    // Move to pos (without changing rotation).
    moveTo(dest, dur=1000, smoothFunc=(e)=>e) {
        return new Promise((resolve, reject) => {
            Animate.tween(this, { pos:clonePos(dest) }, dur, smoothFunc).after(() => {
                resolve();
            });
        });
    }

    // Execute landing sequence.
    land(dest) {
        this.trail.opacity = 0;
        return this.rotateTo(-Math.PI/2.0, 500).then(() => {
            return this.moveTo(dest, 1000);
        });
    }

    thrust(force, delta) {
        const MAX_VEL = 1;
        let deltaForce = scalarMultiply(force, delta);
        let step = dotProduct(deltaForce, this.pointing);
        this.pointing = normalize(addPos(this.pointing, deltaForce));
        this.velocity = addPos(this.velocity, scalarMultiply(this.pointing, step));
        if(lengthOfPos(this.velocity) > MAX_VEL) this.velocity = rescalePos(this.velocity, MAX_VEL);
        this.pos = addPos(this.velocity, this.pos);
        this.rotation = Math.atan2(this.pointing.y, this.pointing.x);
        this.trail.time += delta*400;
    }

    flyTo(dest, onReachingDest) {
        const FORCE = 10;
        const travelDist = distBetweenPos(this.pos, dest);
        const pointing = fromTo(this.pos, dest);
        const DUR = travelDist / 100 * 1000; // 1 sec per 100 units.
        this.rotation = Math.atan2(pointing.y, pointing.x);

        let del = 0;
        Animate.run((e) => {
            this.trail.opacity = Math.pow(e, 0.5);
            this.trail.time += (e - del) * 8000;
            del = e;
        }, DUR);
        this.moveTo(dest, DUR).then(onReachingDest);
        return DUR;

        // let twn = new mag.IndefiniteTween((delta) => {
        //     this.thrust( rescalePos( fromTo(this.pos, dest), distBetweenPos(this.pos, dest) / totalDist), delta / 1000.0 * 10);
        //
        //     let distleft = distBetweenPos(this.pos, dest);
        //     this.trail.opacity = Math.pow(distleft / totalDist, 0.5);
        //
        //     if (distleft <= 10) {
        //         if (onReachingDest) onReachingDest();
        //         twn.cancel();
        //     }
        //     //this.stage.draw();
        // });
        // twn.run();
    }


    drawInternal(ctx, pos, boundingSize) {
        // Need to save pos for later because it gets changed in the middle??
        this._savedPos = pos;
    }
    drawInternalAfterChildren(ctx, pos, boundingSize) {
        pos = this._savedPos;
        super.drawInternal(ctx, pos, boundingSize);
    }
}

class ChapterSelectMenu extends mag.Stage {
    // flyToChapIdx should be an array of
    // {
    //     chapterIdx: chapter_idx,
    //     startIdx: idx_of_starting_level,
    // }
    constructor(canvas, onLevelSelect, flyToChapIdx) {
        super(canvas);
        this.md = new MobileDetect(window.navigator.userAgent);
        this.onLevelSelect = onLevelSelect;

        this.btn_back = new mag.Button(10, 10, 50, 50, { default: 'btn-back-default', hover: 'btn-back-hover', down: 'btn-back-down' }, () => {
            this.activePlanet = null;
            this.remove(this.btn_back);
            this.setPlanetsToDefaultPos(500);
            Resource.play('goback');
        });
        this.btn_back.opacity = 0.7;

        this.planets = [];
        this.stars = [];
        this.activePlanet = null;
        this.starParent = new mag.Rect(0, 0, 0, 0);
        this.add(this.starParent);

        this.showStarField();

        this.onorientationchange();

        this.showChapters().then(() => {
            this.updateParallax();

            this.offset = { x:0, y:0 };
            let lastActivePlanet = this.lastActivePlanet;

            this.setCameraX(lastActivePlanet.pos.x - 3 * lastActivePlanet.radius);

            let ship = new ChapterSelectShip();
            const shipScale = lastActivePlanet.radius / 120 / 2;
            ship.scale = { x:shipScale, y:shipScale };

            if (flyToChapIdx && flyToChapIdx.length > 0) {
                ship.attachToPlanet(lastActivePlanet);

                let minNewPlanetX = 1000000;
                for (let chap of flyToChapIdx) {
                    let newChapIdx = chap.chapterIdx;
                    let newPlanet = this.planets[newChapIdx];
                    newPlanet.highlight();
                    newPlanet.activate();
                    newPlanet.deactivateSpots();
                    let oldOnClick = newPlanet.onclick;
                    minNewPlanetX = Math.min(minNewPlanetX, newPlanet.pos.x);

                    newPlanet.onclick = () => {
                        newPlanet.onclick = oldOnClick;
                        newPlanet.removeHighlight();
                        this.remove(ship);
                        this.planetParent.addChild(ship);
                        let startPlanet = lastActivePlanet;
                        ship.flyToPlanet(this, startPlanet, newPlanet).then(() => {
                            return new Promise((resolve, reject) => {
                                Animate.wait(600).after(() => {
                                    this.planetParent.removeChild(ship);
                                    resolve();
                                });
                            });
                        }).then(oldOnClick)
                            .then(() => {
                                newPlanet.activateSpots();
                                // Get level_idx from the chapter
                                // itself, instead of assuming
                                // linearity
                                level_idx = chap.startIdx;
                                saveProgress();
                            });
                    };
                }

                if (minNewPlanetX + this.planetParent.pos.x > 0.8 * this.boundingSize.w) {
                    this.setCameraX(minNewPlanetX - 0.8 * this.boundingSize.w);
                }
            }
            else {
                ship.attachToPlanet(lastActivePlanet);
            }
        });
    }

    get lastActivePlanet() {
        let lastActivePlanet;
        for (let planet of this.planets) {
            if (planet.active && level_idx >= planet.startLevelIdx && level_idx <= planet.endLevelIdx) {
                lastActivePlanet = planet;
                break;
            }
        }
        if (!lastActivePlanet) {
            for (let planet of this.planets) {
                if (planet.active) {
                    lastActivePlanet = planet;
                }
            }
        }
        return lastActivePlanet;
    }

    reset() {
        this.panningEnabled = true;
        this.starParent.children = [];
        this.showStarField();
        let lastActivePlanet = this.lastActivePlanet;
        if (!lastActivePlanet) return;
        this.remove(this.btn_back);
        this.setPlanetsToDefaultPos(0).then(() => {
            this.setCameraX(lastActivePlanet.pos.x - 3 * lastActivePlanet.radius);

            if (this.activePlanet) {
                this.activatePlanet(this.activePlanet, 0);
            }
        });
    }

    setCameraX(x) {
        x = Math.max(x, 0);
        x = Math.min(x, this.maxPlanetX - this.boundingSize.w);
        this.planetParent.pos = {
            x: -x,
            y: this.planetParent.pos.y,
        };
        this.updateParallax();
    }

    updateParallax() {
        if (this.maxPlanetX) {
            let cameraX = -Math.min(0, this.planetParent.pos.x);
            let x = Math.min(1.0, (cameraX / (1 + this.maxPlanetX - this.boundingSize.w)))
                * 0.5 * this.boundingSize.w;
            x = Math.max(x, 0);
            this.starParent.pos = {
                x: -x,
                y: this.starParent.pos.y,
            };
        }
    }

    onmousedown(pos) {
        super.onmousedown(pos);
        this._dragStart = pos;
    }

    onmousedrag(pos) {
        if (this.panningEnabled) {
            let dx = pos.x - this._dragStart.x;
            this.setCameraX(-(this.planetParent.pos.x + dx));
        }
        this._dragStart = pos;
        // TODO: we should use window.onmouseup as well to cancel dragging
    }

    onmouseup(pos) {
        super.onmouseup(pos);
        this._dragStart = null;
    }

    onorientationchange() {
        if (__IS_MOBILE) {
            if (this.md.phone()) {
                this.scale = 1.0;
            }
            else if (this.md.tablet()) {
                this.scale = 1.2;
            }
            else if (this.md.mobile()) {
                this.scale = 2.0;
            }
            else {
                this.scale = 1.0;
            }
        }
        // TODO: preserve scroll
        this.reset();
    }

    updateLevelSpots() {
        if (this.planets) {
            this.planets.forEach((p) => p.updateLevelSpots());
        }
    }

    drawImpl() {
        if (this.invalidated) return; // don't draw invalidated stages.
        this.ctx.save();
        this.ctx.scale(this._scale, this._scale);
        this.clear();
        const len = this.nodes.length;
        for (let i = 0; i < len; i++) {
            this.nodes[i].draw(this.ctx);
        }
        //this.nodes.forEach((n) => n.draw(this.ctx));
        this.ctx.restore();
    }

    showStarField() {
        const NUM_STARS = 120;
        let genRandomPt = () => randomPointInRect( {x:0, y:0, w: 1.5*this.boundingSize.w, h: this.boundingSize.h} );

        let starParent = this.starParent;

        let stars = this.stars;
        let n = NUM_STARS;
        while(n-- > 0) {

            // Create an instance of a star illustration.
            let star = new MenuStar();
            //star.anchor = { x:0.5, y:0.5 };

            // Find a random position that doesn't intersect other previously created stars.
            let p = genRandomPt();

            // Set star properties
            star.pos = p;
            star.opacity = 0.4;
            const scale = Math.random() * 0.3 + 0.1;
            star.scale = { x:scale, y:scale };
            starParent.addChild(star);
            stars.push(star);

            // Twinkling effect
            Animate.wait(1000 * Math.random()).after(() => star.twinkle(1000));
        }
    }

    setPlanetsToDefaultPos(dur) {
        let stage = this;
        this.panningEnabled = true;

        return Resource.getChapterGraph().then((chapters) => {
            let maxPlanetX = this.boundingSize.w;
            const POS_MAP = layoutPlanets(chapters.transitions, this.boundingSize);
            stage.planets.forEach((p, i) => {
                maxPlanetX = Math.max(maxPlanetX, POS_MAP[i].x + p.radius);
                p.ignoreEvents = false;
                if (p.spots) p.spots.forEach((s) => { s.ignoreEvents = true; });
                if (p.expandFunc) p.onclick = p.expandFunc;
                if (!stage.planetParent.hasChild(p)) stage.planetParent.addChild(p);
                if (p.active) p.showText();
                let rad = POS_MAP[i].r;
                Animate.tween(p, { pos: {x:POS_MAP[i].x, y:POS_MAP[i].y}, scale:{x:1,y:1}, opacity:1.0 }, dur).after(() => {
                    if (p.active) p.showText();
                });
            });
            this.maxPlanetX = maxPlanetX;
        });
    }

    clear() {
        this.ctx.save();
        this.ctx.fillStyle = '#594764';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.restore();
    }

    activatePlanet(planet, durationMultiplier=1.0) {
        let stage = this;

        this.activePlanet = planet;
        this.panningEnabled = false;

        let expand = (planet) => {
            planet.ignoreEvents = false;
            // Make sure the saving of the onclick is idempotent in
            // case we reactivate the same planet (e.g. after an
            // orientation change)
            if (planet.onclick) planet.expandFunc = planet.onclick;
            planet.onclick = null;
            planet.hideText();
            let r = Math.min(this.boundingSize.w / 2.2, this.boundingSize.h / 2.2);
            let center = {
                x: this.boundingSize.w / 2.0,
                y: this.boundingSize.h / 2.0
            };
            // Account for camera
            center = addPos(center, {
                x: -this.planetParent.pos.x,
                y: -this.planetParent.pos.y,
            });
            stage.bringToFront(planet);

            let scale = r / planet.radius;
            Animate.tween(planet, { scale:{x:scale, y:scale}, pos: center }, durationMultiplier*1000, (elapsed) => {
                return Math.pow(elapsed, 3);
            }).after(() => {
                if (planet.spots) planet.spots.forEach((s) => { s.ignoreEvents = false; });
            });
        };
        let hide = (planet) => {
            planet.opacity = 1.0;
            planet.hideText();
            if (planet.spots) planet.spots.forEach((s) => { s.ignoreEvents = true; });
            Animate.tween(planet, { scale:{x:1, y:1}, opacity:0 }, durationMultiplier*500).after(() => {
                stage.planetParent.removeChild(planet);
            });
        };

        for (let k = 0; k < this.planets.length; k++) {
            this.planets[k].ignoreEvents = true;
            if (this.planets[k] === planet) {
                expand(this.planets[k]);
            }
            else {
                hide(this.planets[k]);
            }
        }

        if (durationMultiplier > 0) {
            Resource.play('zoomin');
        }
        Animate.wait(durationMultiplier*500).after(() => {
            this.add(this.btn_back);
        });

        return new Promise((resolve, reject) => {
            Animate.wait(durationMultiplier*1000).after(resolve);
        });
    }

    showChapters() {
        // Expand and disappear animations.
        let stage = this;

        // Each chapter is a 'Planet' in Starboy's Universe:
        return Resource.getChapterGraph().then((chapters) => {
            let planets = [];
            const POS_MAP = layoutPlanets(chapters.transitions, this.boundingSize);

            let planetParent = new mag.Rect(0, 0, 0, 0);

            chapters.chapters.forEach((chap, i) => {
                let pos = i < POS_MAP.length ? POS_MAP[i] : { x:0, y:0, r:10 };
                let planet = new PlanetCard(pos.x, pos.y, pos.r, chap.name, chap.resources ? chap.resources.planet : 'planet-bagbag');

                planet.color = 'white';
                if (i === 1) planet.path.stroke.color = 'gray';
                planet.anchor = { x:0.5, y:0.5 };
                planet.shadowOffset = 0;
                planet.onclick = () => {
                    this.activatePlanet(planet);
                };

                if (chap.resources) {
                    const levels = Resource.levelsForChapter(chap.name);

                    // Set path curve on planet.
                    planet.setCurve(chap.resources.curve);

                    // Activate planet if applicable
                    if (Resource.isChapterUnlocked(i)) {
                        planet.activate();
                    }
                    else {
                        planet.deactivate();
                    }

                    // Set levels along curve.
                    planet.setLevels(levels, this.onLevelSelect);
                }

                planetParent.addChild(planet);
                planets.push(planet);
            });
            this.add(planetParent);
            this.planetParent = planetParent;

            let transitionMap = {};
            chapters.chapters.forEach((chap, i) => {
                transitionMap[chap.key] = i;
            });

            this.planets = planets;
            this.setPlanetsToDefaultPos();
        });
    }
}

function cubicBezierPoint(start, end, control1, control2, t) {
    let x = Math.pow(1-t, 3)*start.x + 3*Math.pow(1-t, 2)*t*control1.x
        + 3*(1-t)*t*t*control2.x + t*t*t*end.x;
    let y = Math.pow(1-t, 3)*start.y + 3*Math.pow(1-t, 2)*t*control1.y
        + 3*(1-t)*t*t*control2.y + t*t*t*end.y;
    return { x: x, y: y };
}

function cubicBezier(start, end, control1, control2, samples) {
    let points = [];
    for (let i = 0; i < samples + 1; i++) {
        let t = i / samples;
        points.push(cubicBezierPoint(start, end, control1, control2, t));
    }

    return points;
}

function layoutPlanets(adjacencyList, boundingSize) {
    const MAX_GROUP_SIZE = 4;

    // From src/util.js
    let seed = 42;
    let seededRandom = function(max, min) {
        max = max || 1;
        min = min || 0;

        seed = (seed * 9301 + 49297) % 233280;
        var rnd = seed / 233280;

        return min + rnd * (max - min);
    };

    // Perform a topological sort of the planets to get a layout
    let sorted = topologicalSort(adjacencyList);
    let groups = [[]];
    for (let group of sorted) {
        if (group.length === 1) {
            groups[groups.length - 1] = groups[groups.length - 1].concat(group);
        }
        else {
            groups.push(group);
            groups.push([]);
        }
    }
    if (groups[groups.length - 1].length === 0) groups.pop();

    let positions = [];

    let startX = 20;
    let startY = 20;
    let subgroups = [];
    for (let group of groups) {
        if (group.length > MAX_GROUP_SIZE) {
            let numSubgroups = Math.ceil(group.length / MAX_GROUP_SIZE);
            let subgroupSize = Math.round(group.length / numSubgroups);
            let subgroup = [];
            while (group.length > 0) {
                subgroup.push(group.shift());
                if (subgroup.length == subgroupSize) {
                    subgroups.push(subgroup);
                    subgroup = [];
                }
            }
            if (subgroup.length > 0) {
                subgroups.push(subgroup);
            }
        }
        else {
            subgroups = [group];
        }

        for (let subgroup of subgroups) {
            let boundingArea = {
                x: startX,
                y: startY,
                w: subgroup.length > 2 ? boundingSize.w : (0.75 * boundingSize.w),
                h: boundingSize.h - 40,
            };

            let sublayout = layoutGroup(subgroup, boundingArea, seededRandom);
            positions = positions.concat(sublayout);

            let maxOffset = 0;
            for (let cell of sublayout) {
                maxOffset = Math.max(maxOffset, cell.x + cell.r - boundingArea.x);
            }
            startX += maxOffset;
        }
    }

    return positions;
}

function layoutGroup(group, boundingArea, seededRandom) {
    // Divide the available space into a grid
    let gridCells = [];
    let aspectRatio = boundingArea.w / boundingArea.h;
    let yCells = Math.sqrt(group.length / aspectRatio);
    let xCells = aspectRatio * yCells;

    if (Math.floor(yCells) * Math.floor(xCells) >= group.length) {
        yCells = Math.floor(yCells);
        xCells = Math.floor(xCells);
    }
    else if (Math.ceil(yCells) * Math.floor(xCells) >= group.length) {
        yCells = Math.ceil(yCells);
        xCells = Math.floor(xCells);
    }
    else if (Math.floor(yCells) * Math.ceil(xCells) >= group.length) {
        yCells = Math.floor(yCells);
        xCells = Math.ceil(xCells);
    }
    else {
        yCells = Math.ceil(yCells);
        xCells = Math.ceil(xCells);
    }

    if (group.length == 3) {
        xCells = 2;
        yCells = 2;
    }

    if (xCells > 1 && yCells > 1 && Math.abs(xCells - yCells) == 1) {
        let min = Math.min(xCells, yCells);
        let max = Math.max(xCells, yCells);
        yCells = min;
        xCells = max;
    }

    let cellWidth = (boundingArea.w - 20) / xCells;
    let cellHeight = (boundingArea.h - 20) / yCells;
    let firstCellMultiplier = 1.0;
    let xCellMultiplier = 1.0, yCellMultiplier = 1.0;
    if (xCells > 1 && yCells > 1) {
        // Make the first cell slightly larger
        // firstCellMultiplier = 1.1;
        // xCellMultiplier = (xCells - firstCellMultiplier) / (xCells - 1);
        // yCellMultiplier = (yCells - firstCellMultiplier) / (yCells - 1);
    }

    let y = boundingArea.y;
    for (let row = 0; row < yCells; row++) {
        let x = boundingArea.x;
        let height = cellHeight * (row == 0 ? firstCellMultiplier : yCellMultiplier);

        let newCells = [];
        for (let col = 0; col < xCells; col++) {
            let width = cellWidth * (col == 0 ? firstCellMultiplier : xCellMultiplier);
            let r = seededRandom(0.6, 1.0) * Math.min(width, height) / 2;
            let xfudge = 1.2 * (width - 2 * r) / 2.0;
            let yfudge = (height - 2 * r) / 2.0;
            let xf = (col == 0 && row == 0) ? 0 : seededRandom(-xfudge, xfudge);
            let yf = (col == 0 && row == 0) ? 0 : seededRandom(-1.2*yfudge, 0.7 * yfudge);
            let cell = {
                x: x + (width / 2) + xf,
                y: y + (height / 2) + yf,
                w: width,
                h: height,
                r: r
            };
            newCells.push(cell);
            x += width;
        }

        gridCells = gridCells.concat(newCells);

        y += height;
    }

    // Extra cells to use
    if (gridCells.length > group.length) {
        let extraCells = gridCells.splice(group.length);
        // Merge last cell with cell next to it
        if (yCells > 1) {
            let lastCell = extraCells.pop();
            let cellAboveIndex = xCells * yCells - 2;
            let cellAbove = gridCells[cellAboveIndex];
            // Sometimes, the cell above us is part of extraCells and no longer usable
            if (cellAbove) {
                gridCells[cellAboveIndex] = lastCell;
                lastCell.x = 0.5 * lastCell.x + 0.5 * cellAbove.x;
                lastCell.y = 0.7 * lastCell.y + 0.3 * cellAbove.y;
            }
        }
    }

    return gridCells;
}

function topologicalSort(adjacencyList) {
    // Get all nodes without dependencies. Add them to the result
    // list, sorting all nodes at each stage. Remove them from the
    // dependencies of other nodes, and repeat. Continue until there
    // are no remaining nodes without dependencies.
    let result = [];

    let dependencies = {};
    for (let src of Object.keys(adjacencyList)) {
        dependencies[src] = {};
    }

    for (let src of Object.keys(adjacencyList)) {
        let dsts = adjacencyList[src];
        for (let dst of dsts) {
            dependencies[dst][src] = true;
        }
    }

    while (true) {
        let found = [];
        for (let dst of Object.keys(dependencies)) {
            let deps = dependencies[dst];
            if (Object.keys(deps).length === 0) {
                found.push(dst);
            }
        }

        if (found.length === 0) break;

        for (let dst of found) {
            for (let key of Object.keys(dependencies)) {
                let deps = dependencies[key];
                delete deps[dst];
            }
            delete dependencies[dst];
        }

        // Sort the list to give us a deterministic order
        found.sort();
        result.push(found);
    }

    return result;
}

class Mask extends mag.Rect {
    constructor(cx, cy, r, color="#594764") {
        super(0, 0, 0, 0);
        // cx, cy are in % of context width/height
        this.cx = cx;
        this.cy = cy;
        this.radius = r;
        this.opacity = 0.0;
        this.ringControl = 0;
        this.color = color;
    }

    drawInternal(ctx, pos, boundingSize) {
        // Do everything in absolute coordinates to avoid any
        // weirdness with stage scale changing
        ctx.scale(1.0, 1.0);
        let w = ctx.canvas.clientWidth;
        let h = ctx.canvas.clientHeight;
        let cx = this.cx * w;
        let cy = this.cy * h;

        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(cx, cy, this.radius, 0, 2 * Math.PI);
        ctx.rect(w, 0, -w, h);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        let numRings = Math.min(Math.ceil(this.ringControl / 10), 4);

        setStrokeStyle(ctx, {
            lineWidth: 2,
            color: 'cyan',
        });
        for (let i = 0; i < numRings; i++) {
            let k = (this.ringControl - i * 20);
            ctx.beginPath();
            ctx.arc(cx, cy, 30 * Math.exp(k / 50), 0, 2 * Math.PI);
            ctx.globalAlpha = Math.max(0.2, 1 - k / 50);
            ctx.stroke();
        }
    }
}








// -- OLD --
// class LevelCell extends MenuButton {
    // constructor(x, y, w, h, name, icon, onclick) {
    //     super(x, y, w, h, name.toString(), onclick);
    //
    //     this.shadowOffset = 10;
    //
    //     // Visual icon
    //     if (icon) {
    //         let img = new mag.ImageRect(0, 0, w, h, icon);
    //         img.ignoreEvents = true;
    //         this.addChild(img);
    //     } else { // Default to text displaying level index.
    //         let txt = new TextExpr(name.toString(), 'Futura');
    //         txt.color = 'white';
    //         txt.anchor = { x:0.5, y:0.5 };
    //         txt.pos = { x: w / 2.0, y: w / 2.0 };
    //         this.addChild(txt);
    //     }
    //
    //     this.name = name;
    //     this.onclick = onclick;
    // }
    // onmouseclick(pos) {
    //     if (this.onclick)
    //         this.onclick();
    // }
// }
// class ChapterCard extends mag.Rect {
//     constructor(x, y, w, h, name, desc, icon, onclick) {
//
//         const TXTPAD = 50;
//         super(x, y, w, h);
//
//         // Visual icon
//         let img = new mag.ImageRect(0, 0, w, h - TXTPAD, icon);
//         img.ignoreEvents = true;
//         this.addChild(img);
//
//         // Chapter name
//         let txt = new TextExpr(name, 'Futura');
//         txt.color = 'white';
//         txt.pos = { x:img.pos.x+img.size.w/2.0,
//                     y:img.pos.y+img.size.h+txt.fontSize };
//         txt.anchor = { x:0.5, y:0 };
//         this.addChild(txt);
//
//         this.name = name;
//         this.onclick = onclick;
//     }
//
//     onmouseclick(pos) {
//         if (this.onclick)
//             this.onclick(this.name);
//     }
// }
//
// class ChapterSelectMenu extends mag.Stage {
//     constructor(canvas, onChapterSelect) {
//         super(canvas);
//         this.showChapters(onChapterSelect);
//     }
//
//     showChapters(onselect) {
//
//         let W = 200; let P = 40; let X = 0;
//         let onChapterSelect = onselect;
//         console.log(onChapterSelect);
//         let container = new DraggableRect(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0 - W / 2.0, 100, 1000, 300);
//         container.constrainY();
//         container.color = 'lightgray';
//         container.shadowOffset = 0;
//         container.snapEvery(W + P, W / 2.0 - P);
//         this.add(container);
//
//         Resource.getChapters().then((chapters) => {
//             container.size = { w:(W + P) * chapters.length, h:300 };
//             chapters.forEach((chap) => {
//
//                 let c = new ChapterCard(X, 0, W, 300, chap.name, chap.description, null, onChapterSelect);
//                 //c.ignoreEvents = true;
//                 c.color = 'HotPink';
//                 c.onmousedrag = (pos) => {
//                     pos.x -= c.pos.x;
//                     container.onmousedrag(pos);
//                 };
//                 c.onmouseup = (pos) => {
//                     pos.x -= c.pos.x;
//                     container.onmouseup(
//                         pos);
//                 };
//                 container.addChild(c);
//
//                 X += W + P;
//
//             });
//         });
//     }
// }

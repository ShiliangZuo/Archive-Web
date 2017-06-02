class ErrorExpr extends TextExpr {
    constructor() {
        super("ERROR!");
        this.color = "red";
    }
}

class ErrorEffect {
    static spawnAt(node) {
        ErrorEffect.run(node.stage, node.centerPos());
    }
    static run(stage, centerPos) {
        const SPAWN_RATE = 1.0;
        const genRandvec = (dist) => rescalePos( { x:Math.random() - 0.5, y:Math.random()-0.5 }, dist );
        let loop = () => {
            const RAD = 30;
            const randvec = genRandvec(RAD);
            let error = new ErrorExpr();
            error.anchor = { x:0.5, y:0.5 };
            error.pos = centerPos;
            error.opacity = 1.0;
            error.stroke = { color:'white', lineWidth:4 };
            stage.add(error);
            Animate.tween(error, { opacity:0, pos:addPos(randvec, error.pos) }, 200, (e) => {
                if (e < 0.9) // Add a 'shaky' effect
                    error.pos = addPos(error.pos, genRandvec(10*(1 - e)));
                return Math.pow(e, 0.5);
            }).after(() => {
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
}

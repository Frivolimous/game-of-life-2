const gameConfig = {
    framerate: 20,
    canvasWidth: 100,
    canvasHeight: 100,
}

const red = 0;
const green = 1;
const blue = 2;
const alpha = 3;

const units = {
    [red]: 1,
    [green]: 6,
    [blue]: 255,
    [alpha]: 1
}

const ruleConfigs = {
    BlueLife: [
        [[["here", blue, "=", 1], ["surround", blue, ">", 3]], [[blue, "=", 0]]],
        [[["here", blue, "=", 1], ["surround", blue, "<", 2]], [[blue, "=", 0]]],
        [[["here", blue, "=", 0], ["surround", blue, "=", 3]], [[blue, "=", 1]]],
    ],

    Blue: [
        [[["here", blue, "=", 1], ["surround", blue, ">", 3]], [[blue, "=", 0]]],
        [[["here", blue, "=", 1], ["surround", blue, "<", 2]], [[blue, "=", 0]]],
        [[["here", blue, "=", 0], ["surround", blue, "=", 3], ["here", green, ">=", 2]], [[blue, "=", 1], [green, "-", 2], [green, "+", 0.1, red]]],
        [[["here", blue, "=", 0], ["surround", blue, "=", 2], ["here", green, ">=", 5]], [[blue, "=", 1], [green, "-", 5], [green, "+", 0.5, red]]],
        [[["here", blue, "=", 0], ["surround", blue, "=", 2], ["here", red, ">", 100]], [[blue, "=", 1], [red, "-", 20]]],
    ],

    Green: [
        [[["here", green, ">=", 5], ["surrounding", green, ">", 3, green]], [[green, "=", 0]]],
        [[["here", green, ">", 0], ["surround", green, ">", 7, green]], [[green, "+", 1]]],
        [[["here", green, "=", 0], ["surround", green, ">", 0]], [[green, "=", 1]]]
    ],

    Red: [
        [[["here", red, "<", 255], ["here", blue, "=", 1]], [[red, "+", 5]]],
        [[["here", red, ">", 50]], [[red, "-", 2]]],
        [[["here", red, "<=", 50], ["surround", red, "<", 280]], [[red, "-", 1]]],
    ],
}

// Views
var fpsCounter = document.getElementById('fps');
var gameView;
var ticker = new JMTicker(gameConfig.framerate);
var desiredfps = document.getElementById('desired-fps');
var scaleContainer = document.getElementById('scales');
var ruleContainer = document.getElementById('rules');
desiredfps.value = gameConfig.framerate;

function setupScales() {
    for (var i = 0; i < 3; i++) {
        addInputButton(i);
    }
}

function addInputButton(i) {
    let input = document.createElement('input');
    input.value = units[i];
    input.type = 'number';
    input.addEventListener('input', () => units[i] = input.value);
    scaleContainer.appendChild(input);
}

function addRuleInputs(rule) {
    let div = document.createElement('div');
}

function setRule(rule) {

}
function init() {
    isMobile = testMobile();

    // initialize singletons
    gameView = new GameView(document.getElementById('main-canvas'));
    mouseDown = false;
    gameView.canvas.onPointerDown = e => {
        mouseDown = true;
        addPixel(Math.floor(e.x), Math.floor(e.y));
    };

    gameView.canvas.onPointerMove = e => {
        if (mouseDown) {
            addPixel(Math.floor(e.x), Math.floor(e.y));
        }
    };

    gameView.canvas.onPointerUp = e => {
        mouseDown = false;
    };

    ticker.onTick = onTick;
    ticker.start();

    document.getElementById('pause-button').addEventListener('click', ticker.togglePause);
    document.getElementById('reset-button').addEventListener('click', () => gameView.reset());
    desiredfps.addEventListener('input', () => ticker.updateFramerate(desiredfps.value));
    // setupScales();
}

function addPixel(x, y) {
    gameView.imageData.data[(x + y * gameConfig.canvasWidth) * 4 + 2] = 255;
}

function onTick() {
    fpsCounter.innerHTML = ticker.framerate.toFixed(0);
    
    gameView.drawFrame();
}

function testMobile() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

class GameView {
    canvas;
    vfx = [];
    imageData;
    width;
    height;

    constructor(canvasElement) {
        this.width = gameConfig.canvasWidth;
        this.height = gameConfig.canvasHeight;
        this.canvas = new CanvasRender(this.width, this.height, canvasElement);
        this.reset();
    }

    reset() {
        this.imageData = this.makeData();
        this.randomWorldSimple();
        this.drawFrame();
    }

    drawFrame() {
        this.tickDynamic();
        this.canvas.Graphic.putImageData(this.imageData, 0, 0);
    }

    randomizeImageData() {
        for (var i = 0; i < this.imageData.data.length; i++) {
            if (i % 4 === 3) {
                this.imageData.data[i] = 255;
            } else {
                this.imageData.data[i] = Math.random() * 255;
            }
        }
    }

    randomLife() {
        for (var i = 0; i < this.imageData.data.length; i++) {
            if (i % 4 === 3) {
                this.imageData.data[i] = 255;
            } else  if (i % 4 === 2) {
                this.imageData.data[i] = Math.random() < 0.5 ? 255 : 0;
            }
        }
    }
    
    randomWorld() {
        for (var i = 0; i < this.imageData.data.length; i++) {
            if (i % 4 === 3) {
                this.imageData.data[i] = 255;
            } else if (i % 4 === 2) {
                this.imageData.data[i] = Math.random() < 0.5 ? 255 : 0;
            } else if (i % 4 === 1) {
                this.imageData.data[i] = 50 + Math.random() * 100;
            }
        }
    }
    
    randomWorldSimple() {
        for (var i = 0; i < this.imageData.data.length; i++) {
            if (i % 4 === 3) {
                this.imageData.data[i] = 255;
            } else if (i % 4 === blue) {
                this.imageData.data[i] = Math.random() < 0.5 ? units[blue] : 0;
            } else if (i % 4 === green) {
                this.imageData.data[i] = Math.random() < 0.5 ? units[green] : 0;
            }
        }
    }

    tickWar() {
        var newImage = this.makeData();
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var surrounding = this.getSurrounding(x, y);
                var here = this.getPixelAt(x, y);

                if (surrounding[0] > surrounding[1] + surrounding[2]) {
                    here[0] = 255;
                    here[1] = 0;
                    here[2] = 0;
                } else if (surrounding[1] > surrounding[0] + surrounding[2]) {
                    here[0] = 0;
                    here[1] = 255;
                    here[2] = 0;
                } else if (surrounding[2] > surrounding[1] + surrounding[0]) {
                    here[0] = 0;
                    here[1] = 0;
                    here[2] = 255;
                }

                this.setPixelAt(x, y, here, newImage);
            }
        }

        this.imageData = newImage;
    }

    tickLife() {
        var newImage = this.makeData();
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var surrounding = this.getSurrounding(x, y);
                var here = this.getPixelAt(x, y);
                for (var i = 0; i < 3; i++) {
                    if (here[i] === 255) {
                        if (surrounding[i] < 2 || surrounding[i] > 3) {
                            here[i] = 0;
                        }
                    } else {
                        if (surrounding[i] === 3) {
                            here[i] = 255;
                        }
                    }
                }
                this.setPixelAt(x, y, here, newImage);
            }
        }

        this.imageData = newImage;
    }

    tickDynamic() {
        var newImage = this.makeData();
        // console.log('a');
        for (var x = 0; x < this.width; x++) {
            main: for (var y = 0; y < this.height; y++) {
                var surrounding = this.getArea(x, y);
                var here = this.getPixelAt(x, y);

                this.ruleCheck(ruleConfigs.Green, here, surrounding);
                this.ruleCheck(ruleConfigs.Blue, here, surrounding);
                this.ruleCheck(ruleConfigs.Red, here, surrounding);

                this.setPixelAt(x, y, here, newImage);
            }
        }
        this.imageData = newImage;
    }

    ruleCheck(rules, here, surrounding) {
        ruleCheck: for (var rule of rules) {
            var conditions = rule[0];
            var outcome = rule[1];

            for (var con of conditions) {
                var obj = con[0] === "here" ? here : surrounding;
                switch(con[2]) {
                    case '=': if (obj[con[1]] !== con[3] * (con[4] ? here[con[4]] : units[con[1]])) continue ruleCheck; break;
                    case '<': if (obj[con[1]] >= con[3] * (con[4] ? here[con[4]] : units[con[1]])) continue ruleCheck; break;
                    case '>': if (obj[con[1]] <= con[3] * (con[4] ? here[con[4]] : units[con[1]])) continue ruleCheck; break;
                    case '<=': if (obj[con[1]] > con[3] * (con[4] ? here[con[4]] : units[con[1]])) continue ruleCheck; break;
                    case '>=': if (obj[con[1]] < con[3] * (con[4] ? here[con[4]] : units[con[1]])) continue ruleCheck; break;
                }
            }

            for (var out of outcome) {
                switch(out[1]) {
                    case '=': here[out[0]] = out[2] * (out[3] ? here[out[3]] : units[out[0]]); break;
                    case '+': here[out[0]] += out[2] * (out[3] ? here[out[3]] : units[out[0]]); break;
                    case '-': here[out[0]] -= out[2] * (out[3] ? here[out[3]] : units[out[0]]); break;
                }
            }

            return;
        }
    }

    tickWorld() {
        var newImage = this.makeData();
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var surrounding = this.getArea(x, y);
                var here = this.getPixelAt(x, y);

                // green forest
                if (here[green] > 150) {
                    here[green] = 0;
                } else {
                    if (here[green] >= 100) {
                        here[green] -= 50 * Math.random();
                    } else {
                        here[green] += surrounding[green] * Math.random();
                    }
                }

                //blue life
                if (here[blue] === 255) {
                    if (surrounding[blue] < 2) {
                        here[blue] = 0;
                    } else if (surrounding[blue] > 4) {
                        here[blue] = 0;
                    } else if (surrounding[blue] === 4) {
                        if (here[green] + here[red] < 50) {
                            here[blue] = 0;
                        } else {
                            if (here[green] > 25) {
                                here[green] -= 25;
                            } else {
                                here[red] -= 25;
                            }
                        }
                    }
                } else {
                    if (surrounding[blue] === 3 && here[green] >= 50) {
                        here[blue] = 255;
                        here[green] -= 50;
                    } else if (surrounding[blue] === 2 && here[green] >= 100) {
                        here[blue] = 255;
                        here[green] -= 50;
                    }
                }

                //red buildings
                here[red] = here[red] * 0.92 + surrounding[blue] * 2 + surrounding[red];
                
                this.setPixelAt(x, y, here, newImage);
            }
        }

        this.imageData = newImage;
    }

    tickWorldSimple() {
        var newImage = this.makeData();
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var surrounding = this.getArea(x, y);
                var here = this.getPixelAt(x, y);

                // forest
                //1 = 0.2 up to 3 * 8 * 0.2 = 4.8
                if (here[green] >= 5 * units[green]) {
                    if (surrounding[green] > here[green] * 3) {
                        here[green] = 0;
                    }
                } else if (here[green] > 0) {
                    if (surrounding[green] > here[green] * 7) {
                        here[green] += units[green];
                    }
                } else if (here[green] === 0) {
                    if (surrounding[green] > 0) {
                        here[green] = units[green];
                    }
                }

                // life
                if (here[blue] === 255) {
                    if (surrounding[blue] > 3 * 255) {
                            here[blue] = 0;
                    } else if (surrounding[blue] < 2 * 255) {
                        here[blue] = 0;
                    }
                } else {
                    if (surrounding[blue] === 3 * 255 && here[green] > units[green]) {
                        here[blue] = 255;
                        here[green] -= Math.max(0, units[green] - here[red] / 10);
                    } else if (surrounding[blue] === 2 * 255 && here[green] >= 5 * units[green]) {
                        here[blue] = 255;
                        here[green] -= 5 * Math.max(0, units[green] - here[red] / 10);
                    } else if (surrounding[blue] === 2 * 255 && here[red] > 100) {
                        here[blue] = 255;
                        here[red] -= 20;
                    }
                }

                // building
                if (here[blue] > 0 && here[red] < 255) {
                    here[red] += 5;
                }

                if (here[red] > 50) {
                    here[red] -= 1;
                } else if (surrounding[red] < 250) {
                    here[red] -= 1;
                }

                this.setPixelAt(x, y, here, newImage);
            }
        }
        this.imageData = newImage;
    }

    getArea(x, y) {
        var m = [0, 0, 0, 0];

        for (var x2 = x - 1; x2 <= x + 1; x2++) {
            for (var y2 = y - 1; y2 <= y + 1; y2++) {
                if (x2 > 0 && y2 > 0 && x2 < this.width && y2 < this.height && (x2 !== x || y2 !== y)) {
                    var here = this.getPixelAt(x2, y2);
                    m[0] += here[0];
                    m[1] += here[1];
                    m[2] += here[2];
                    m[3] += here[3];
                }
            }
        }

        return m;
    }

    getSurrounding(x, y) {
        var m = [0, 0, 0, 0];

        for (var x2 = x - 1; x2 <= x + 1; x2++) {
            for (var y2 = y - 1; y2 <= y + 1; y2++) {
                if (x2 > 0 && y2 > 0 && x2 < this.width && y2 < this.height && (x2 !== x || y2 !== y)) {
                    var here = this.getPixelAt(x2, y2);
                    m[0] += here[0] > 0 ? 1 : 0;
                    m[1] += here[1] > 0 ? 1 : 0;
                    m[2] += here[2] > 0 ? 1 : 0;
                    m[3] += here[3] > 0 ? 1 : 0;
                }
            }
        }

        return m;
    }

    gather() {
        var adjust = 5;
        var newImage = this.makeData();
        
        for (var x = 1; x < this.width; x++) {
            for (var y = 1; y < this.height; y++) {
                var thisPixel = this.getPixelAt(x, y);
                var leftPixel = this.getPixelAt(x - 1, y);
                var upPixel = this.getPixelAt(x, y - 1);
                var diagonalPixel = this.getPixelAt(x - 1, y - 1);

                for (var i = 0; i < 2; i++) {
                    if (thisPixel[i] < leftPixel[i]) {
                        var amt = Math.min(adjust, 255 - thisPixel[i], leftPixel[i]);
                        thisPixel[i] += amt;
                        leftPixel[i] -= amt;
                    } else {
                        var amt = Math.min(adjust, 255 - leftPixel[i], thisPixel[i]);
                        thisPixel[i] -= amt;
                        leftPixel[i] += amt;
                    }
                    if (thisPixel[i] < upPixel[i]) {
                        var amt = Math.min(adjust, 255 - thisPixel[i], upPixel[i]);
                        thisPixel[i] += amt;
                        upPixel[i] -= amt;
                    } else {
                        var amt = Math.min(adjust, 255 - upPixel[i], thisPixel[i]);
                        thisPixel[i] -= amt;
                        upPixel[i] += amt;
                    }
                    if (thisPixel[i] < diagonalPixel[i]) {
                        var amt = Math.min(adjust, 255 - thisPixel[i], diagonalPixel[i]);
                        thisPixel[i] += amt;
                        diagonalPixel[i] -= amt;
                    } else {
                        var amt = Math.min(adjust, 255 - diagonalPixel[i], thisPixel[i]);
                        thisPixel[i] -= amt;
                        diagonalPixel[i] += amt;
                    }
                }
                this.setPixelAt(x, y, thisPixel, newImage);
                this.setPixelAt(x - 1, y, leftPixel, newImage);
                this.setPixelAt(x, y - 1, upPixel, newImage);
                this.setPixelAt(x - 1, y - 1, diagonalPixel, newImage);
            }
        }

        this.imageData = newImage;
    }

    getPixelAt(x, y) {
        return [
            this.imageData.data[(x + y * this.width) * 4 + 0],
            this.imageData.data[(x + y * this.width) * 4 + 1],
            this.imageData.data[(x + y * this.width) * 4 + 2],
            this.imageData.data[(x + y * this.width) * 4 + 3],
        ];
    }

    setPixelAt(x, y, data, image = null) {
        image = image || this.imageData;
        image.data[(x + y * this.width) * 4 + 0] = data[0];
        image.data[(x + y * this.width) * 4 + 1] = data[1];
        image.data[(x + y * this.width) * 4 + 2] = data[2];
        image.data[(x + y * this.width) * 4 + 3] = data[3];
    }

    makeData() {
        return this.canvas.Graphic.createImageData(this.width, this.height);
    }
}

init();

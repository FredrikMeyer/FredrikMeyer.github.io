let figSize = 15;
let rectWidth = 30;
let rectHeight = 40;

function setup() {
    createCanvas(700, 700);
    background(0);
}

let angle = 0.;

function draw() {
    background(0);
    push()
    translate(0.5*(width-rectWidth*figSize), 0.5*(height-rectHeight*figSize));
    drawRectangleOfFigures(figSize, rectWidth, rectHeight);
    
    push();
    translate(rectWidth*figSize/2, rectHeight*figSize/2);
    rotate(angle);
    translate(-rectWidth*figSize/2, -rectHeight*figSize/2);
    drawRectangleOfFigures(figSize, rectWidth, rectHeight);
    pop();
    
    pop();

    angle = angle + 0.02;
}


function drawRectangleOfFigures(figSize, rectWidth, rectHeight) {
    for (var i = 0; i < rectWidth; i++) {
        for (var j = 0; j < rectHeight; j++) {
            push();
            translate(figSize*i, figSize*j);
            drawCircle(figSize);
            pop();
        }
    }
}


// Use this to recreate https://twitter.com/Rainmaker1973/status/1005711343549284352
function drawTriangle(tWidth) {
    let tHeight = Math.sqrt(3)/2 * tWidth;

    fill(255);
    beginShape();
    vertex(tWidth/2, 0);
    vertex(tWidth, tHeight);
    vertex(0, tHeight);
    endShape();
}

function drawCircle(diameter) {
    fill(255);
    ellipse(diameter/2, diameter/2, diameter/2, diameter/2);
}

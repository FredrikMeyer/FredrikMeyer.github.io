function setup() {
    createCanvas(700, 700);
    background(0);
}

let t = 0;

function draw() {
    background(0);
    
    X = width/2;
    Y = width/2;
//    ellipse(X,Y, 3 , 3);
    r = 300;

    diff = 20*(Math.sin(t)+1);
    
    for (var i = 0; i < 5; i = i + 2) {
        x = X + r*Math.sin(2*PI*i/6.);
        y = Y + r * Math.cos(2*PI*i/6.);
        ellipse(x, y, 10, 10);
        stroke(255)
        
        line(X,Y+diff, x, y);
        ellipse(X,Y+diff, 10, 10);
    }
    for (var i = -1; i < 4; i = i + 2) {
        x = X + r*Math.sin(2*PI*i/6.);
        y = Y + r * Math.cos(2*PI*i/6.);
        ellipse(x, y, 10, 10);
        stroke(255);

        //        line(x,y, xn, yn);
        line(X,Y-diff, x, y);
        ellipse(X,Y-diff, 10, 10);
        
    }

    for (var i = 1; i < 6; i = i + 2) {
        x = X + r*Math.sin(2*PI*i/6.);
        xn = X + r*Math.sin(2*PI*(i+1)/6.);
        y = Y + r * Math.cos(2*PI*i/6.);
        yn = Y + r * Math.cos(2*PI*(i+1)/6.);

        line(x,y, xn, yn);
    }
    for (var i = 0; i < 6; i = i + 2) {
        x = X + r*Math.sin(2*PI*i/6.);
        xn = X + r*Math.sin(2*PI*(i+1)/6.);
        y = Y + r * Math.cos(2*PI*i/6.);
        yn = Y + r * Math.cos(2*PI*(i+1)/6.);

        line(x,y, xn, yn);        
    }
    t += 0.05;
//    noLoop();
}

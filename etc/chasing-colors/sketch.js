let movers = [];
let movingPoint;

function setup() {
    createCanvas(1000, 1000);
    randomPoint = createVector(random(width), random(height));
    
    for (var i = 0; i < 200; i++) {
        movers.push(new Mover());
    }
    background(0);
}

let t = 0;
let counter = 0;
function draw() {
    movingPoint = createVector(width/2 + Math.sin(3*t)*1000, height/2 + Math.cos(t)*1000);
    
    movers.map(m => m.step());
    movers.map(m => m.render());

    t += 0.01;
    counter += 1;
    if (counter > 1000) {
        noLoop();
    }
}

class Mover {
    constructor() {
        let phi = random(0, 2*PI);             
        //        this.location = createVector(random(width), random(height));
        let r = width*2;
        this.location = createVector(width/2 + Math.sin(phi) * r, height/2 + Math.cos(phi)*r);
        this.velocity = createVector(0,0);
        //this.acceleration = createVector(0,0);
        this.topSpeed = 10;
        this.color = createVector(random(0,255), random(0,255), random(0, 255));
    }

    render() {
        stroke(0, 100);
        fill(this.color.x, this.color.y, this.color.z, 150);
        ellipse(this.location.x, this.location.y, 20, 20);
    }

    step() {
        let mouse = movingPoint;

        let direction = p5.Vector.sub(mouse, this.location);
        direction.normalize();
        direction.mult(0.5);

        this.acceleration = direction;

        this.velocity.add(this.acceleration);
        this.velocity.limit(this.topSpeed);
        this.location.add(this.velocity);

    }
}

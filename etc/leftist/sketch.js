let input;

let TREE = {
    value: 4,
    s : 1,
    leftChild: {
        value: 5,
        s: 0,
        leftChild: {
            s: 0,
            value: 6
        }
    },
    rightChild: {
        s: 0,
        value: 7
    }
};

function setup() {
    createCanvas(700, 700);
    background(255);
    stroke(0);
    textSize(20);
    textAlign(CENTER, CENTER);
    textStyle(NORMAL);

    input = createInput("");
    input.position(0, 0);

    button = createButton("Submit");
    button.position(input.x + input.width, 0);
    button.mousePressed(submitValue);
}

function submitValue() {
    const asString = input.value();
    if (asString.includes(",")) {       
        
        const numbers = asString
              .split(",")
              .map(Number);

        TREE = {
            s: 0,
            value: numbers[0]
        };

        numbers
            .slice(1)
            .forEach(n => addNode(n));
    } else {
        let value = Number(input.value());

        addNode(value);
    }
    
    redraw();
}

function addNode(val) {
    TREE = merge(TREE, {
        s: 0,
        value: val
    });
}

function draw() {
    background(255);
    drawNode(TREE);
    noLoop();
}

function merge(node1, node2) {
    if (node1 == null) {
        return node2;
    }

    if (node2 == null) {
        return node1;
    }

    if (node1.value > node2.value) {
        let temp = node1;
        node1 = node2;
        node2 = temp;
    }

    node1.rightChild = merge(node1.rightChild, node2);

    if (node1.leftChild == null) {
        node1.leftChild = node1.rightChild;
        node1.rightChild = null;
    } else {
        if (node1.leftChild.s < node1.rightChild.s) {
            let temp = node1.leftChild;
            node1.leftChild = node1.rightChild;
            node1.rightChild = temp;
        }

        node1.s = node1.rightChild.s + 1;
    }

    return node1;
}

function drawNode(tree, level=1) {
    node(width/2, 50, tree.value);
    const translation = 175./level;
    if (tree.leftChild) {
        line(350-10*Math.sqrt(2), 50+10*Math.sqrt(2), 350 - translation, 100);
        push();
        translate(-translation, 50);
        drawNode(tree.leftChild, level+1);
        pop();
    }
    if (tree.rightChild) {
        line(350+10*Math.sqrt(2), 50+10*Math.sqrt(2), 350 + translation, 100);
        push();
        translate(translation, 50);
        drawNode(tree.rightChild, level+1);
        pop();        
    }
}


function node(x, y, t) {
    ellipse(x, y, 40, 40);
    text(t, x, y);
}


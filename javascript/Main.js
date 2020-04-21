const canvas = document.getElementById("canvas");
canvas.width = 1200;
canvas.height = 600;
const ctx = canvas.getContext("2d");
let balls = [];
let walls = [];
let holes = [];
let numberOfBalls = 4;
let mouse = new Point(0,0);
let mouseDown = false;
let maxShotSpeed = 10;
let ballRadius = 14;
let holeRadius = 26; //22
let player1 = "Player 1";
let player2 = "Player 2";
let currplayer = player1;
let charge = 0;
let ballsAreMoving = false;

holes.push(new Ball(30, 28, holeRadius, 0, 0, null));
holes.push(new Ball(1170, 28, holeRadius, 0, 0, null));
holes.push(new Ball(600, 14, holeRadius, 0, 0, null));

holes.push(new Ball(30, 572, holeRadius, 0, 0, null));
holes.push(new Ball(1170, 572, holeRadius, 0, 0, null));
holes.push(new Ball(600, 586, holeRadius, 0, 0, null));

let ballID = 0;
initBalls();
let stick = new Stick(balls[0].x, balls[0].y, 0, 642, 40);
stick.loadImg("img/stick8.png");

let bounceSound = new Audio('sounds/bounce2.wav');
walls.push(new Wall(12, 12, 12, canvas.height-12, 20));
walls.push(new Wall(12, canvas.height-12, canvas.width/2-23, canvas.height-12, 20));
walls.push(new Wall(canvas.width/2+23, canvas.height-12, canvas.width-12, canvas.height-12, 20));
walls.push(new Wall(canvas.width-12, canvas.height-12, canvas.width-12, 12, 20));
walls.push(new Wall(canvas.width-12, 12, canvas.width/2+23, 12, 20));
walls.push(new Wall(canvas.width/2-23, 12, 12, 12, 20));

mainLoop();
function mainLoop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls = balls.filter((p) => p.active);
    for(let i=0; i<balls.length; i++){
        balls[i].id = i;
    }
    if(mouseDown){
        charge+=0.1;
        if(charge>maxShotSpeed)
            charge = maxShotSpeed;
        stick.distanceFromCenter = charge*10+balls[0].r+10;
        console.log("charging...");
    }
    else if(!ballsAreMoving && charge > 0){
        balls[0].vx = (mouse.x - balls[0].x)/distanceBetweenPoints(balls[0].x, balls[0].y, mouse.x, mouse.y)*charge;
        balls[0].vy = (mouse.y - balls[0].y)/distanceBetweenPoints(balls[0].x, balls[0].y, mouse.x, mouse.y)*charge;
        charge = 0;
        console.log("released!");
        stick.distanceFromCenter = balls[0].r+10;
    }
    else{
        charge = 0;
    }


    balls.forEach((ball) => {
        if(Math.abs(ball.vx) >= 1 || (Math.abs(ball.vy) >= 1)){
            ball.vx *= 0.998;
            ball.vy *= 0.998;
        }
        else{
            ball.vx *= 0.99;
            ball.vy *= 0.99;
        }
        if(Math.abs(ball.vx) < 0.008 || (Math.abs(ball.vy) < 0.008)){
            ball.vx = 0;
            ball.vy = 0;
        }
        ball.x += ball.vx;
        ball.y += ball.vy;
        //Collision med žogami
        for(let i=0; i<balls.length; i++){
            if(ball.id == i)
                break;
            let distance = ball.distanceFromPoint(balls[i].x, balls[i].y);
            //collision med dvema krogoma
            if(distance <= ball.r+balls[i].r){
                let overlap = (distance - ball.r - balls[i].r);
                
                ball.x -= overlap * (ball.x - balls[i].x)/distance; //razstavimo dejanski razmak krogov v x in y koordinato -
                ball.y -= overlap * (ball.y - balls[i].y)/distance; //npr. če bo x=0.2 bo y=0.8, skupaj bo vedno 1. Potem pomnožimo z
                                                                    //razdaljo, za katero hočemo premakniti ball
                distance = ball.distanceFromPoint(balls[i].x, balls[i].y);
                balls[i].x += overlap * (ball.x - balls[i].x)/distance; 
                balls[i].y += overlap * (ball.y - balls[i].y)/distance;
                
                ball.elasticCollision(balls[i], true);
            }
        }
        //collision med zidovi in žogami
        walls.forEach((wall) => {
            let wallVec = new Point(wall.endx-wall.startx, wall.endy-wall.starty) //vektor med začetkom in koncem zidova
            let ballVec = new Point(ball.x-wall.startx, ball.y-wall.starty); //vektor med krogom in začetkom kroga

            //t je najbližja točka, ki se jo dotika krog, izražena v številu med 0 in 1 (to uporabimo potem za scalat vektor wallVec)
            let length = wallVec.x*wallVec.x + wallVec.y*wallVec.y;
            let t = Math.max(0, Math.min(length, (wallVec.x*ballVec.x)+(wallVec.y*ballVec.y)))/length; 
            
            let closestPoint = new Point(wall.startx + t*wallVec.x, wall.starty + t*wallVec.y);
            let distance = distanceBetweenPoints(ball.x, ball.y, closestPoint.x, closestPoint.y);
            
            if(distance <= ball.r+wall.r){
                //ustarimo navidezno žogo, ki bo odbil žogo proč od zida 
                let tempBall = new Ball(closestPoint.x, closestPoint.y, wall.r, -ball.vx, -ball.vy, null);
                tempBall.mass = ball.mass;
                let overlap = (distance-ball.r-tempBall.r);
                ball.x -= overlap*(ball.x-tempBall.x)/distance;
                ball.y -= overlap*(ball.y-tempBall.y)/distance;

                ball.elasticCollision(tempBall, false);
            }
        });

        for(let i=0; i<holes.length; i++){
            let distance = ball.distanceFromPoint(holes[i].x, holes[i].y);
            //collision med dvema krogoma
            if(distance <= ball.r+holes[i].r){
                ball.active = false;
            }
        }
    });
    for(let i=0; i<walls.length; i++){
        //walls[i].draw("white", "white");
    }
    ballsAreMoving = false;
    balls.forEach((ball) => {
        ball.drawImg();
        //If all the balls are still, end the round
        if(ball.vx != 0 || ball.vy != 0)
            ballsAreMoving = true;
        //line to shoot the balls
        if(ball.selected){
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.moveTo(ball.x, ball.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
    });
    if(!ballsAreMoving){
        stick.x = balls[0].x;
        stick.y = balls[0].y;
        stick.angle = getAngle(balls[0], mouse);
        stick.drawImg();
    }
    requestAnimationFrame(mainLoop);
}

window.addEventListener("keydown", (event) => {
    key = event.keyCode;
});
window.addEventListener("keyup", (event) => {
    key = event.keyCode;
});
window.addEventListener("mousemove", (event) => {
    mouse.x = event.x-canvas.getBoundingClientRect().left;
    mouse.y = event.y-canvas.getBoundingClientRect().top;
});
window.addEventListener("mousedown", (event) => {
    mouse.x = event.x-canvas.getBoundingClientRect().left;
    mouse.y = event.y-canvas.getBoundingClientRect().top;
    mouseDown = true;
});
window.addEventListener("mouseup", (event) => {
    mouseDown = false;
    //balls[0].vx = (mouse.x - balls[0].x)/distanceBetweenPoints(balls[0].x, balls[0].y, mouse.x, mouse.y)*shootSpeed;
    //balls[0].vy = (mouse.y - balls[0].y)/distanceBetweenPoints(balls[0].x, balls[0].y, mouse.x, mouse.y)*shootSpeed;
});

function initBalls(){
    balls.push(new Ball(200, canvas.height/2, ballRadius, 0, 0, ballID));
    balls[balls.length-1].type = "whiteball"; ballID++;
    balls[balls.length-1].loadImg("img/ball_16.png");
    balls.push(new Ball(canvas.width-300, canvas.height/2, ballRadius, 0, 0, ballID));
    balls[balls.length-1].type = "blackball"; ballID++;
    balls[balls.length-1].loadImg("img/ball_8.png");

    //1. vrstica c trikotniku žog
    balls.push(new Ball(canvas.width-300-2*28, canvas.height/2, ballRadius, 0, 0, ballID)); ballID++;
    balls[balls.length-1].loadImg("img/ball_1.png");
    //2. vrstica
    balls.push(new Ball(canvas.width-300-28, canvas.height/2+ballRadius+4, ballRadius, 0, 0, ballID)); ballID++;
    balls[balls.length-1].loadImg("img/ball_9.png");
    balls.push(new Ball(canvas.width-300-28, canvas.height/2-ballRadius-4, ballRadius, 0, 0, ballID)); ballID++;
    balls[balls.length-1].loadImg("img/ball_2.png");
    //3. vrstica (kjer je črna)
    balls.push(new Ball(canvas.width-300, canvas.height/2-ballRadius*2-8, ballRadius, 0, 0, ballID)); ballID++;
    balls[balls.length-1].loadImg("img/ball_10.png");
    balls.push(new Ball(canvas.width-300, canvas.height/2+ballRadius*2+8, ballRadius, 0, 0, ballID)); ballID++;
    balls[balls.length-1].loadImg("img/ball_3.png");
    //4.vrstica
    balls.push(new Ball(canvas.width-300+28, canvas.height/2+ballRadius+4, ballRadius, 0, 0, ballID)); ballID++;
    balls[balls.length-1].loadImg("img/ball_11.png");
    balls.push(new Ball(canvas.width-300+28, canvas.height/2-ballRadius-4, ballRadius, 0, 0, ballID)); ballID++;
    balls[balls.length-1].loadImg("img/ball_7.png");
    balls.push(new Ball(canvas.width-300+28, canvas.height/2+ballRadius*3+8, ballRadius, 0, 0, ballID)); ballID++;
    balls[balls.length-1].loadImg("img/ball_13.png");
    balls.push(new Ball(canvas.width-300+28, canvas.height/2-ballRadius*3-8, ballRadius, 0, 0, ballID)); ballID++;
    balls[balls.length-1].loadImg("img/ball_4.png");
    //5.vrstica
    balls.push(new Ball(canvas.width-300+2*28, canvas.height/2, ballRadius, 0, 0, ballID)); ballID++;
    balls[balls.length-1].loadImg("img/ball_5.png");
    balls.push(new Ball(canvas.width-300+2*28, canvas.height/2+ballRadius*2+4, ballRadius, 0, 0, ballID)); ballID++;
    balls[balls.length-1].loadImg("img/ball_13.png");
    balls.push(new Ball(canvas.width-300+2*28, canvas.height/2-ballRadius*2-4, ballRadius, 0, 0, ballID)); ballID++;
    balls[balls.length-1].loadImg("img/ball_15.png");
    balls.push(new Ball(canvas.width-300+2*28, canvas.height/2+ballRadius*4+8, ballRadius, 0, 0, ballID)); ballID++;
    balls[balls.length-1].loadImg("img/ball_12.png");
    balls.push(new Ball(canvas.width-300+2*28, canvas.height/2-ballRadius*4-8, ballRadius, 0, 0, ballID)); ballID++;
    balls[balls.length-1].loadImg("img/ball_6.png");
}

function distanceBetweenPoints(x1, y1, x2, y2){
    return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}
//Gets an angle between a vector and y-axis
function getAngle(p1, p2){
    //Vector between points
    let pointVectorx = p2.x-p1.x;
    let pointVectory = p2.y-p1.y;
    //Vector in y-axis
    let axisVectorx = p2.x - p1.x;
    let axisVectory = 0;

    let dotProduct = pointVectorx*axisVectorx + pointVectory*axisVectory;
    let lengthProduct = distanceBetweenPoints(p2.x, p2.y, p1.x, p1.y) * (p2.x-p1.x);
    if(p2.y < p1.y){
        if(lengthProduct == 0)
            return 3*Math.PI/2;
        return -Math.acos(dotProduct/lengthProduct);
    }
    if(lengthProduct == 0)
        return Math.PI/2;
    return Math.acos(dotProduct/lengthProduct);
}

const canvas = document.getElementById("canvas");
canvas.width = 1200;
canvas.height = 800;
const ctx = canvas.getContext("2d");
let balls = [];
let walls = [];
let numberOfBalls = 4;
let mouse = new Point(0,0);
let mouseDown = false;
let paddle = new Paddle(canvas.width/2-100, 750, canvas.width/2+100, 750, 20, 5);
balls.push(new Ball(canvas.width/2, 695, 30, 0, 0, 0));
let id = 1;
/*for(let i=0; i<numberOfBalls; i++){
    let x = Math.trunc(Math.random()*canvas.width);
    let y = Math.trunc(Math.random()*canvas.height);
    let r = Math.trunc(Math.random()*30+5);
    balls.push(new Ball(x,y,r,0,0,id));
    id++;
}*/
for(let i=0; i<numberOfBalls; i++){
    let x = i*420+180;
    let y = 120;
    let r = 50;
    balls.push(new Ball(x,y,r,0,0,id));
    id++;
}
//walls.push(new Wall(400, 200, 600, 200, 30));
walls.push(paddle.wall);
walls.push(new Wall(-20, -20, -20, canvas.height+20, 20));
walls.push(new Wall(-20, canvas.height+20, canvas.width+20, canvas.height+20, 20));
walls.push(new Wall(canvas.width+20, canvas.height+20, canvas.width+20, -20, 20));
walls.push(new Wall(canvas.width+20, -20, -20, -20, 20));
mainLoop();
function mainLoop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /*//Drag walls
    walls.forEach((wall) => {
        if(wall.startSelected){
            wall.startx = mouse.x;
            wall.starty = mouse.y;
        }
        if(wall.endSelected){
            wall.endx = mouse.x;
            wall.endy = mouse.y;
        }
    })*/

    if(paddle.right){
        paddle.startx +=paddle.speed;
        paddle.endx += paddle.speed;
    }
    if(paddle.left){
        paddle.startx -=paddle.speed;
        paddle.endx -= paddle.speed;
    }
    paddle.update();

    balls.forEach((ball) => {
        //ball.vx *= 0.995; //friction
        //ball.vy *= 0.995;
        //ball.vy += 0.01; //gravity
        
        ball.x += ball.vx;
        ball.y += ball.vy;
        
        //Collision
        for(let i=0; i<balls.length; i++){
            if(ball.id == i)
                break;
            let distance = ball.distanceFromPoint(balls[i].x, balls[i].y);
            //collision med dvema krogoma
            if(distance <= ball.r+balls[i].r){
                let overlap = 0.5*(distance - ball.r - balls[i].r);
                ball.x -= overlap * (ball.x - balls[i].x)/distance; //razstavimo dejanski razmak krogov v x in y koordinato -
                ball.y -= overlap * (ball.y - balls[i].y)/distance; //npr. če bo x=0.2 bo y=0.8, skupaj bo vedno 1. Potem pomnožimo z
                                                                    //razdaljo, za katero hočemo premakniti ball
                distance = ball.distanceFromPoint(balls[i].x, balls[i].y);
                balls[i].x += overlap * (ball.x - balls[i].x)/distance; 
                balls[i].y += overlap * (ball.y - balls[i].y)/distance;
                
                ball.dynamicCollision(balls[i], true);
            }
        }
        //collision med zidovi in krogi
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

                ball.dynamicCollision(tempBall, false);
            }
        });
    });
    for(let i=0; i<walls.length; i++){
        walls[i].draw("white", "white");
    }
    for(let i=0; i<balls.length; i++){
        balls[i].draw("blue");
        //line to shoot the balls
        if(balls[i].selected){
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.moveTo(balls[i].x, balls[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
    }
    requestAnimationFrame(mainLoop);
}

window.addEventListener("keydown", (event) => {
    key = event.keyCode;
    if(key == 68 || key == 39)
        paddle.right = true;
    if(key == 65 || key == 37)
        paddle.left = true;
});
window.addEventListener("keyup", (event) => {
    key = event.keyCode;
    if(key == 68 || key == 39)
        paddle.right = false;
    if(key == 65 || key == 37)
        paddle.left = false;
});
window.addEventListener("mousemove", (event) => {
    mouse.x = event.x-canvas.getBoundingClientRect().left;
    mouse.y = event.y-canvas.getBoundingClientRect().top;
});
window.addEventListener("mousedown", (event) => {
    mouse.x = event.x-canvas.getBoundingClientRect().left;
    mouse.y = event.y-canvas.getBoundingClientRect().top;
    mouseDown = true;
    balls.forEach((ball) => {
        if(ball.distanceFromPoint(mouse.x, mouse.y) < ball.r)
            ball.selected = true;
    });
    walls.forEach((wall) => {
        if(distanceBetweenPoints(mouse.x, mouse.y, wall.startx, wall.starty) <= wall.r)
            wall.startSelected = true;
        if(distanceBetweenPoints(mouse.x, mouse.y, wall.endx, wall.endy) <= wall.r)
            wall.endSelected = true;
    });
});
window.addEventListener("mouseup", (event) => {
    mouseDown = false;
    balls.forEach((ball) => {
        if(ball.selected){
            ball.vx = (ball.x - mouse.x)/50;
            ball.vy = (ball.y - mouse.y)/50;
        }
        ball.selected = false;
    });
    walls.forEach((wall) => {
        wall.startSelected = false;
        wall.endSelected = false;
    });
});

function distanceBetweenPoints(x1, y1, x2, y2){
    return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}

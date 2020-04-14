const canvas = document.getElementById("canvas");
canvas.width = 1200;
canvas.height = 800;
const ctx = canvas.getContext("2d");
let paddle = new Paddle(450,canvas.height-64,256,48,6);
let balls = [];
let walls = [];
let numberOfBalls = 2;
let mouse = new Point(0,0);
let mouseDown = false;
balls.push(new Ball(400, 150, 60, 0, 0, 0));
balls.push(new Ball(800, 300, 20, 0, 0, 1));
balls.push(new Ball(200, 500, 80, 0, 0, 2));
balls.push(new Ball(120, 700, 30, 0, 0, 3));
balls.push(new Ball(130, 400, 40, 0, 0, 4));
balls.push(new Ball(530, 300, 45, 0, 0, 5));
balls.push(new Ball(780, 200, 55, 0, 0, 6));
balls.push(new Ball(820, 600, 70, 0, 0, 7));

walls.push(new Wall(200, 650, 400, 500, 30));
mainLoop();
function mainLoop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Drag walls
    walls.forEach((wall) => {
        if(wall.startSelected){
            wall.startx = mouse.x;
            wall.starty = mouse.y;
        }
        if(wall.endSelected){
            wall.endx = mouse.x;
            wall.endy = mouse.y;
        }
    });

    balls.forEach((ball) => {
        //Drag balls
        if(ball.selected){
            ctx.beginPath();
            ctx.strokeStyle = "blue";
            ctx.moveTo(ball.x, ball.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
        ball.x += ball.vx;
        ball.y += ball.vy;

        if(ball.x<=ball.r || ball.x>=canvas.width-ball.r)
            ball.vx = -ball.vx;
        if(ball.y<=ball.r || ball.y>=canvas.height-ball.r)
            ball.vy = -ball.vy;
        
        
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


                distance = ball.distanceFromPoint(balls[i].x, balls[i].y);
                let xnormal = (ball.x - balls[i].x)/ball.distanceFromPoint(balls[i].x, balls[i].y); //vektor normale - ta gleda proti središču collided kroga
                let ynormal = (ball.y - balls[i].y)/ball.distanceFromPoint(balls[i].x, balls[i].y);
                
                let xtangent = -ynormal;
                let ytangent = xnormal;

                let skalarTang1 = xtangent*ball.vx + ytangent*ball.vy; //skalarni produkt tangente in hitrosti žoge
                let skalarTang2 = xtangent*balls[i].vx + ytangent*balls[i].vy;
                let skalarNorm1 = xnormal*ball.vx + ynormal*ball.vy; //skalarni produkt normale in hitrosti žoge
                let skalarNorm2 = xnormal*balls[i].vx + ynormal*balls[i].vy;

                //računanje momentuma - enačbe pridobljene iz wikipedije: https://en.wikipedia.org/wiki/Elastic_collision
                let v1 = (ball.mass - balls[i].mass)/(ball.mass + balls[i].mass)*skalarNorm1
                +(2*balls[i].mass)/(ball.mass + balls[i].mass)*skalarNorm2;
                let v2 = (2*ball.mass)/(ball.mass+balls[i].mass)*skalarNorm1
                +(balls[i].mass-ball.mass)/(ball.mass+balls[i].mass)*skalarNorm2;

                ball.vx = skalarTang1 * xtangent + xnormal * v1; //naša hitrost je skalarni produkt novih vektorjev
                ball.vy = skalarTang1 * ytangent + ynormal * v1;
                balls[i].vx = skalarTang2 * xtangent + xnormal * v2;
                balls[i].vy = skalarTang2 * ytangent + ynormal * v2;

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
                
            }
        });
    });
    //paddle.drawImg("img/paddle.png");
    //paddle.draw("black");
    for(let i=0; i<balls.length; i++){
        //balls[i].draw("#fdad30");
        balls[i].draw("blue");
    }
    for(let i=0; i<walls.length; i++){
        walls[i].draw("black", "black");
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
canvas.addEventListener("mousemove", (event) => {
    mouse.x = event.x-canvas.getBoundingClientRect().left;
    mouse.y = event.y-canvas.getBoundingClientRect().top;
});
canvas.addEventListener("mousedown", (event) => {
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
canvas.addEventListener("mouseup", (event) => {
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

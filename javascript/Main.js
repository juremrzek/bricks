const canvas = document.getElementById("canvas");
canvas.width = 1200;
canvas.height = 800;
const ctx = canvas.getContext("2d");
const friction = 0.002; //from 0 to 1 - 
let paddle = new Paddle(450,canvas.height-64,256,48,6);
let balls = [];
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
mainLoop();
function mainLoop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach((ball) => {
        if(mouseDown){
            if(ball.selected){
                ctx.beginPath();
                ctx.strokeStyle = "blue";
                ctx.moveTo(ball.x, ball.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
        ball.x += ball.vx;
        ball.y += ball.vy;

        if(ball.x<=ball.r || ball.x>=canvas.width-ball.r)
            ball.vx = -ball.vx;
        if(ball.y<=ball.r || ball.y>=canvas.height-ball.r)
            ball.vy = -ball.vy;
        
        /* */
        for(let i=0; i<balls.length; i++){
            if(ball.id == i)
                break;
            if(ball.distanceFromPoint(balls[i].x, balls[i].y) <= ball.r+balls[i].r){ //check collision between two balls
                let overlap = 0.5*(ball.distanceFromPoint(balls[i].x, balls[i].y) - ball.r - balls[i].r);
                ball.x -= overlap * (ball.x - balls[i].x)/ball.distanceFromPoint(balls[i].x, balls[i].y); //razstavimo dejanski razmak krogov v x in y koordinato -
                ball.y -= overlap * (ball.y - balls[i].y)/ball.distanceFromPoint(balls[i].x, balls[i].y); //če bo x=0.2 bo y=0.8, skupaj bo vedno 1. Potem pomnožimo z
                balls[i].x += overlap * (ball.x - balls[i].x)/ball.distanceFromPoint(balls[i].x, balls[i].y); //razdaljo, za katero hočemo premakniti ball
                balls[i].y += overlap * (ball.y - balls[i].y)/ball.distanceFromPoint(balls[i].x, balls[i].y);

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

                ball.vx = skalarTang1 * xtangent + xnormal * v1; //naša hitrost je skalarni produkt med novima vektorjema
                ball.vy = skalarTang1 * ytangent + ynormal * v1;
                balls[i].vx = skalarTang2 * xtangent + xnormal * v2;
                balls[i].vy = skalarTang2 * ytangent + ynormal * v2;
            }
        }
    });
    //paddle.drawImg("img/paddle.png");
    //paddle.draw("black");
    for(let i=0; i<balls.length; i++){
        //balls[i].draw("#fdad30");
        balls[i].draw("blue");
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
});

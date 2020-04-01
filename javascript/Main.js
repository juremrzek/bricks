const canvas = document.getElementById("canvas");
canvas.width = 1200;
canvas.height = 800;
const ctx = canvas.getContext("2d");
let paddle = new Paddle(450,canvas.height-64,256,48,6);
let ball = new Ball(400, 150, 20, 4, 4);
mainLoop();
function mainLoop(){
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ball.x += ball.xspeed;
    ball.y += ball.yspeed;
    if(ball.x<ball.r || ball.x>canvas.width-ball.r)
        ball.xspeed = -ball.xspeed;
    if(ball.y<ball.r || ball.y>canvas.height-ball.r)
        ball.yspeed = -ball.yspeed;
    if(ball.distanceFrom(paddle.x, paddle.y, paddle.width, paddle.height) < ball.r){
        if(ball.x<paddle.x-paddle.width/2){
            ball.xspeed = -ball.xspeed;
            ball.x-=ball.r;
        } 
        else if(ball.x>paddle.x+paddle.width/2){
            ball.xspeed = -ball.xspeed;
            ball.x+=ball.r;
        }
        else
            ball.yspeed = -ball.yspeed;
    }
    if(paddle.right && paddle.x-paddle.width/2 > 0 && paddle.x+paddle.width/2 < canvas.width)
        paddle.x += paddle.speed;
    if(paddle.left && paddle.x-paddle.width/2 > 0 && paddle.x+paddle.width/2 < canvas.width)
        paddle.x -= paddle.speed;
    if(paddle.x-paddle.width/2 <= 0)
        paddle.x+=2;
    if(paddle.x+paddle.width/2 >= canvas.width)
        paddle.x-=2;
    paddle.drawImg("img/paddle.png");
    //paddle.draw("black");
    ball.draw("#fdad30");
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
class Paddle{
    constructor(x, y, width, height, speed){
        this.x = x+width/2;
        this.y = y+height/2;
        this.width = width;
        this.height = height;
        this.left = false;
        this.right = false;
        this.speed = speed;
    }
    drawImg(src){
        let paddleImg = new Image();
        paddleImg.src = src;
        paddleImg.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(paddleImg, this.x-this.width/2, this.y-this.height/2, this.width, this.height);
        }
    }
    draw(color){
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.rect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
        ctx.fill();
    }
}
class Ball{
    constructor(x, y, radius, vx, vy, id){
        this.x = x;
        this.y = y;
        this.r = radius;
        this.vx = vx;
        this.vy = vy;
        this.id = id;
        this.selected = false;
        this.mass = radius*10;
    }
    draw(color){
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();
    }
    distanceFromRectangle(x, y, width, height){ //distance from ball and a rectangle
        let dx = Math.max(Math.abs(this.x - x) - width / 2, 0);
        let dy = Math.max(Math.abs(this.y - y) - height / 2, 0);
        return Math.sqrt(dx * dx + dy * dy);
    }
    distanceFromPoint(x,y){
        //console.log(x+ " lčmao "+this.x);
        return Math.sqrt((this.x-x)*(this.x-x) + (this.y-y)*(this.y-y));
    }
}
class Point{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}
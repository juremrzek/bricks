class Paddle{
    constructor(startx, starty, endx, endy, radius, speed){
        this.startx = startx;
        this.starty = starty;
        this.endx = endx;
        this.endy = endy;
        this.r = radius;
        this.wall = new Wall(startx, starty, endx, endy, radius);
        this.speed = speed;
        this.left = false;
        this.right = false;
    }
    update(){
        if(this.startx <= this.r){
            let overlap = -this.startx+this.r;
            this.startx += overlap;
            this.endx += overlap;
        }
        if(this.endx >= canvas.width-this.r){
            let overlap = this.endx-canvas.width+this.r;
            this.startx -= overlap;
            this.endx -= overlap;
        }
        this.wall.startx = this.startx;
        this.wall.starty = this.starty;
        this.wall.endx = this.endx;
        this.wall.endy = this.endy;
    }
    draw(color1, color2){
        this.wall.draw(color1, color2);
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
        this.mass = radius*1000;
        this.type;
        this.active = true; //if the ball is still in game, status = "active"
        this.img = new Image();

    }
    draw(color){
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
    }
    drawImg(){
        //this.img.onload = ()=> {
            ctx.drawImage(this.img, this.x-this.r, this.y-this.r, this.r*2, this.r*2);
        //}
    }
    loadImg(imgsrc){
        this.imgsrc = imgsrc;
        this.img.src = this.imgsrc;
        this.img.onload = ()=> {
            ctx.drawImage(this.img, this.x-this.r, this.y-this.r, this.r*2, this.r*2);
        }
    }
    /*distanceFromRectangle(x, y, width, height){ //distance from ball and a rectangle
        let dx = Math.max(Math.abs(this.x - x) - width / 2, 0);
        let dy = Math.max(Math.abs(this.y - y) - height / 2, 0);
        return Math.sqrt(dx * dx + dy * dy);
    }*/
    distanceFromPoint(x,y){
        return Math.sqrt((this.x-x)*(this.x-x) + (this.y-y)*(this.y-y));
    }
    elasticCollision(ball, moveOtherBall){
        let xnormal = (this.x - ball.x)/this.distanceFromPoint(ball.x, ball.y); //vektor normale - ta gleda proti središču collided kroga
        let ynormal = (this.y - ball.y)/this.distanceFromPoint(ball.x, ball.y);
        let xtangent = -ynormal;
        let ytangent = xnormal;

        let skalarTang1 = xtangent*this.vx + ytangent*this.vy; //skalarni produkt tangente in hitrosti žoge
        let skalarTang2 = xtangent*ball.vx + ytangent*ball.vy;
        let skalarNorm1 = xnormal*this.vx + ynormal*this.vy; //skalarni produkt normale in hitrosti žoge
        let skalarNorm2 = xnormal*ball.vx + ynormal*ball.vy;

        //elastic collision - enačbe pridobljene iz wikipedije: https://en.wikipedia.org/wiki/Elastic_collision
        let v1 = (this.mass - ball.mass)/(this.mass + ball.mass)*skalarNorm1
        +(2*ball.mass)/(this.mass + ball.mass)*skalarNorm2;
        let v2 = (2*this.mass)/(this.mass+ball.mass)*skalarNorm1
        +(ball.mass-this.mass)/(this.mass+ball.mass)*skalarNorm2;

        //inelastic collision - https://en.wikipedia.org/wiki/Inelastic_collision
        //let v1 = (0.8*(ball.mass*(skalarNorm2-skalarNorm1)+this.mass*skalarNorm1+ball.mass*skalarNorm2))/(this.mass+ball.mass-1);
        //let v2 = (0.8*(this.mass*(skalarNorm1-skalarNorm2)+this.mass*skalarNorm1+ball.mass*skalarNorm2))/(this.mass+ball.mass-1);

        this.vx = skalarTang1 * xtangent + xnormal * v1; //naša hitrost je skalarni produkt novih vektorjev
        this.vy = skalarTang1 * ytangent + ynormal * v1;

        if(moveOtherBall){
            ball.vx = skalarTang2 * xtangent + xnormal * v2;
            ball.vy = skalarTang2 * ytangent + ynormal * v2;
        }
        bounceSound.load();
        bounceSound.play();
        //console.log("play");
    }
}
class Point{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}
class Wall{
    constructor(startx, starty, endx, endy, radius){
        this.startx = startx;
        this.starty = starty;
        this.endx = endx;
        this.endy = endy;
        this.r = radius;
        this.startSelected = false;
        this.endSelected = false;
        this.length = Math.sqrt((this.startx-this.endx)*(this.startx-this.endx) + (this.starty-this.endy)*(this.starty-this.endy));
    }
    draw(fillColor, strokeColor){
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(this.startx, this.starty, this.r, 0, 2 * Math.PI);
        ctx.arc(this.endx, this.endy, this.r, 0, 2 * Math.PI);
        ctx.fill();

        this.length = Math.sqrt((this.startx-this.endx)*(this.startx-this.endx) + (this.starty-this.endy)*(this.starty-this.endy));
        let xvector = (this.startx - this.endx)/this.length;
        let yvector = (this.starty - this.endy)/this.length;
        let xnormal = -yvector;
        let ynormal = xvector;

        ctx.strokeStyle = strokeColor;
        let p1 = new Point(this.startx+xnormal*this.r, this.starty+ynormal*this.r);
        let p2 = new Point(this.endx+xnormal*this.r, this.endy+ynormal*this.r);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        p1 = new Point(this.startx-xnormal*this.r, this.starty-ynormal*this.r);
        p2 = new Point(this.endx-xnormal*this.r, this.endy-ynormal*this.r);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }
}
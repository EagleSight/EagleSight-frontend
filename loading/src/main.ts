
var canvas = document.createElement("canvas");
var ctx = canvas.getContext('2d');

window.onload = (e) => {

    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight  * window.devicePixelRatio;

    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'

    document.body.appendChild(canvas);
    document.body.style.backgroundImage = "url('/dist/sky.jpg')";
    document.body.style.backgroundSize = "cover";

    ctx.strokeStyle = 'skyblue';
    ctx.lineWidth = 10;
    ctx.shadowBlur=20;
    ctx.shadowColor="white";

    spin();

}

var angle = 0;
const delta = Math.PI / 30;
var cover = 0
const radius = 100;


function spin() {

    window.requestAnimationFrame(spin);
    
    const x = canvas.width / 2, y = canvas.height / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.moveTo(
        x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius
    );

    ctx.beginPath();
    
    cover = (Math.cos(angle/2) - 1) * 2.5 - 0.1

    ctx.arc(
        x,
        y, 
        radius, 
        angle, 
        angle + cover
    );


    angle += delta;
    
    ctx.stroke();
}
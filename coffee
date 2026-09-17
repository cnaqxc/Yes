(function(){
"use strict";

if(window.__verity)return;
window.__verity=1;

var d=document;
var playing=[];
var speed=1;
var loop=false;
var hidden=false;
var minimized=false;
var maximized=false;
var cleanupFns=[];
var timers=[];
var box=null;

var normalW="min(720px,94vw)";
var normalH="auto";

var sounds=[
["🎧 yarayara phonk","https://audio.jukehost.co.uk/01a0a0d9-78af-72ce-92ba-13361ceba355.mp3"],
["🔥 TikiPhonk","https://audio.jukehost.co.uk/01a0a0d5-920d-737f-b67e-c8c7d3d75c84.mp3"],
["🎵 Miguel Phonk","https://audio.jukehost.co.uk/01a0a030-063b-7284-90f7-32ccf2f2070b.mp3"],
["😄 Verity Song","https://audio.jukehost.co.uk/01a0a0de-4cb2-7107-b1cc-001e1b8e694f.mp3"],
["💬 Discord Ping","https://creatorset-public.s3.us-east-1.amazonaws.com/public-audio/Discord+Ping+(Sound+Effect).mp3"],
["🎵 Woodlawn Phonk","https://audio.jukehost.co.uk/01a0a2c7-6c31-7134-8a08-29c59ce85520.mp3"],
["🎵 Mr Bays Funk","https://audio.jukehost.co.uk/01a0a2ce-7dfa-733c-bbe7-0828fa488195.mp3"]
];


/* =========================
   ROOT
========================= */

var overlay=d.createElement("div");

overlay.id="verity-root";

overlay.style.cssText=
"position:fixed;inset:0;z-index:2147483640;"+
"font-family:Arial,sans-serif;pointer-events:none;color:#fff;";

d.body.appendChild(overlay);


/* =========================
   TIMER
========================= */

function later(fn,ms){

var t=setTimeout(function(){

timers=timers.filter(function(x){
return x!==t;
});

fn();

},ms);

timers.push(t);
}


/* =========================
   STARTUP ANIMATION
========================= */

var star=d.createElement("div");

star.style.cssText=
"position:absolute;left:50%;top:50%;"+
"width:88px;height:88px;"+
"transform:translate(-50%,-50%) scale(.05);"+
"background:#000;border-radius:50%;"+
"opacity:1;"+
"transition:all .7s cubic-bezier(.2,.8,.2,1);"+
"box-shadow:0 0 48px #000;";

overlay.appendChild(star);

later(function(){

if(!star.parentNode)return;

star.style.transform=
"translate(-50%,-50%) scale(1)";

},100);

later(function(){

if(!star.parentNode)return;

star.style.borderRadius="0";

star.style.clipPath=
"polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 94%,"+
"50% 72%,21% 94%,32% 57%,2% 35%,39% 35%)";

star.style.transform=
"translate(-50%,-50%) scale(1.2) rotate(180deg)";

},800);

later(function(){

if(!star.parentNode)return;

star.style.transform=
"translate(-50%,-50%) scale(1.65) rotate(540deg)";

star.style.opacity="0";

},1450);

later(function(){

if(!overlay.parentNode)return;

if(star.parentNode)
star.remove();

overlay.style.pointerEvents="auto";

launcher();

},2050);


/* =========================
   DRAGGING
   ONLY HANDLE DRAGS
========================= */

function makeDraggable(element,handle){

if(!element||!handle)return;

var dragging=false;
var sx=0;
var sy=0;
var ox=0;
var oy=0;

handle.style.cursor="grab";
handle.style.touchAction="none";

function down(e){

var p=e.touches?e.touches[0]:e;

dragging=true;

handle.style.cursor="grabbing";

var r=element.getBoundingClientRect();

sx=p.clientX;
sy=p.clientY;
ox=r.left;
oy=r.top;

e.preventDefault();
e.stopPropagation();
}

function move(e){

if(!dragging)return;

var p=e.touches?e.touches[0]:e;

var nx=ox+(p.clientX-sx);
var ny=oy+(p.clientY-sy);

nx=Math.max(
5,
Math.min(
window.innerWidth-element.offsetWidth-5,
nx
)
);

ny=Math.max(
5,
Math.min(
window.innerHeight-element.offsetHeight-5,
ny
)
);

element.style.left=nx+"px";
element.style.top=ny+"px";
element.style.transform="none";

e.preventDefault();
}

function up(){

dragging=false;
handle.style.cursor="grab";
}

handle.addEventListener("mousedown",down);
d.addEventListener("mousemove",move);
d.addEventListener("mouseup",up);

handle.addEventListener(
"touchstart",
down,
{passive:false}
);

d.addEventListener(
"touchmove",
move,
{passive:false}
);

d.addEventListener(
"touchend",
up
);

cleanupFns.push(function(){

handle.removeEventListener("mousedown",down);
d.removeEventListener("mousemove",move);
d.removeEventListener("mouseup",up);

handle.removeEventListener(
"touchstart",
down
);

d.removeEventListener(
"touchmove",
move
);

d.removeEventListener(
"touchend",
up
);

});
}


/* =========================
   WINDOW CONTROLS
========================= */

function maximize(){

if(!box)return;

if(maximized){

maximized=false;

box.style.left="50%";
box.style.top="50%";
box.style.width=normalW;
box.style.height="auto";
box.style.transform="translate(-50%,-50%)";

}else{

maximized=true;

minimized=false;

box.style.left="50%";
box.style.top="50%";
box.style.width="92vw";
box.style.height="88vh";
box.style.transform="translate(-50%,-50%)";
}
}

function minimize(){

if(!box)return;

minimized=!minimized;

var content=box.querySelector("#verity-content");

if(content){

content.style.display=
minimized?"none":"block";
}

box.style.height=
minimized?"58px":"";

if(minimized){

maximized=false;

box.style.width="330px";

}else{

box.style.width=
maximized?"92vw":normalW;
}
}


/* =========================
   WINDOW HEADER
========================= */

function windowControls(){

return(
'<button id="minimize" title="Minimize" style="'+
"position:absolute;right:88px;top:13px;"+
"width:30px;height:30px;border:1px solid #333;"+
"border-radius:8px;background:#171717;color:#aaa;"+
"font-size:16px;cursor:pointer;z-index:5"+
'">−</button>'+

'<button id="maximize" title="Maximize" style="'+
"position:absolute;right:52px;top:13px;"+
"width:30px;height:30px;border:1px solid #333;"+
"border-radius:8px;background:#171717;color:#aaa;"+
"font-size:14px;cursor:pointer;z-index:5"+
'">□</button>'+

'<button id="close2" title="Close" style="'+
"position:absolute;right:13px;top:13px;"+
"width:30px;height:30px;border:1px solid #333;"+
"border-radius:8px;background:#171717;color:#aaa;"+
"font-size:17px;cursor:pointer;z-index:5"+
'">×</button>'
);
}


/* =========================
   LAUNCHER
========================= */

function launcher(){

if(box){

box.style.display="block";
return;
}

box=d.createElement("div");

box.style.cssText=
"position:absolute;left:50%;top:50%;"+
"transform:translate(-50%,-50%) scale(.8);"+
"width:"+normalW+";"+
"background:rgba(7,7,7,.98);"+
"color:#fff;border:1px solid #303030;"+
"border-radius:20px;padding:20px 15px 15px;"+
"box-shadow:0 20px 90px rgba(0,0,0,.95);"+
"opacity:0;transition:.3s ease;"+
"backdrop-filter:blur(18px);"+
"overflow:hidden;";

overlay.appendChild(box);

launcherView();

later(function(){

if(!box)return;

box.style.opacity="1";

box.style.transform=
"translate(-50%,-50%) scale(1)";

},30);
}


/* =========================
   LAUNCHER VIEW
========================= */

function launcherView(){

cleanupGame();

if(!box)return;

minimized=false;
maximized=false;

box.style.width=normalW;
box.style.height="auto";

box.innerHTML=
'<div id="dragbar" style="'+
"position:absolute;left:50%;top:7px;"+
"transform:translateX(-50%);"+
"width:105px;height:6px;"+
"background:#5a5a5a;border-radius:20px;"+
"cursor:grab;touch-action:none;z-index:10"+
'"></div>'+

windowControls()+

'<div id="verity-content">'+

'<div style="'+
"font-size:22px;font-weight:800;"+
"padding:10px 125px 10px 5px;"+
"letter-spacing:-.5px;user-select:none"+
'">✦ VERITY</div>'+

'<div style="'+
"font-size:11px;color:#666;"+
"margin:-5px 0 13px 5px"+
'">Clean. Simple. Yours.</div>'+

'<div id="options" style="'+
"display:flex;gap:9px;width:100%;"+
"flex-wrap:wrap"+
'"></div>'+

'</div>';

makeDraggable(
box,
box.querySelector("#dragbar")
);

setupControls();

var o=box.querySelector("#options");

function add(icon,title,sub,fn){

var b=d.createElement("button");

b.style.cssText=
"flex:1 1 145px;min-width:125px;"+
"padding:15px 8px;background:#141414;"+
"color:#eee;border:1px solid #303030;"+
"border-radius:13px;cursor:pointer;"+
"font-weight:700;font-size:13px;"+
"transition:.15s;";

b.innerHTML=
'<div style="font-size:23px;margin-bottom:6px">'+
icon+
"</div>"+
"<div>"+title+"</div>"+
'<div style="font-size:10px;color:#777;margin-top:4px">'+
sub+
"</div>";

b.onmouseenter=function(){

b.style.background="#222";
b.style.transform="translateY(-2px)";
};

b.onmouseleave=function(){

b.style.background="#141414";
b.style.transform="none";
};

b.onclick=fn;

o.appendChild(b);
}

add("🎵","Soundboard","Sounds",soundboard);
add("🎮","Games","Play",games);
add("🌐","More Games","Henry",embeddedGames);
add("⚙️","Settings","Customize",settings);
}


/* =========================
   CONTROLS
========================= */

function setupControls(){

var mn=box.querySelector("#minimize");
var mx=box.querySelector("#maximize");
var cl=box.querySelector("#close2");

if(mn)mn.onclick=minimize;
if(mx)mx.onclick=maximize;
if(cl)cl.onclick=close;
}


/* =========================
   CLEAR
========================= */

function clear(){

cleanupGame();

if(!box)return;

while(box.firstChild)
box.removeChild(box.firstChild);
}


/* =========================
   PAGE HEADER
========================= */

function header(title){

box.innerHTML=
'<div id="dragbar" style="'+
"position:absolute;left:50%;top:7px;"+
"transform:translateX(-50%);"+
"width:105px;height:6px;"+
"background:#5a5a5a;border-radius:20px;"+
"cursor:grab;touch-action:none;z-index:10"+
'"></div>'+

'<button id="back" style="'+
"position:absolute;left:13px;top:13px;"+
"width:32px;height:30px;border:1px solid #333;"+
"border-radius:8px;background:#171717;"+
"color:#ddd;font-size:20px;cursor:pointer;z-index:5"+
'">‹</button>'+

windowControls()+

'<div id="verity-content">'+

'<div style="'+
"font-size:19px;font-weight:800;"+
"text-align:center;padding:8px 145px 12px;"+
"user-select:none"+
'">'+
title+
"</div>"+

"</div>";

makeDraggable(
box,
box.querySelector("#dragbar")
);

setupControls();

box.querySelector("#back").onclick=launcherView;
}


/* =========================
   SOUND STOP
========================= */

function stopAll(){

playing.forEach(function(a){

try{
a.pause();
a.currentTime=0;
}catch(e){}

});

playing=[];
}


/* =========================
   SOUNDBOARD
========================= */

function soundboard(){

clear();
header("🎵 Soundboard");

var content=box.querySelector("#verity-content");

var controls=d.createElement("div");

controls.style.cssText=
"display:flex;gap:6px;margin-bottom:8px;"+
"flex-wrap:wrap;";

controls.innerHTML=
'<button class="sp" data-s="1">1x</button>'+
'<button class="sp" data-s="2">2x</button>'+
'<button class="sp" data-s="3">3x</button>'+
'<button id="loop">Loop Off</button>'+
'<button id="stop">Stop</button>';

content.appendChild(controls);

Array.from(controls.children).forEach(function(x){

x.style.cssText=
"flex:1;min-width:55px;padding:9px;"+
"background:#151515;color:#ddd;"+
"border:1px solid #333;border-radius:9px;"+
"font-weight:700;cursor:pointer;";
});

controls.querySelector('[data-s="1"]').style.background="#333";

controls.querySelectorAll(".sp").forEach(function(x){

x.onclick=function(){

speed=Number(x.dataset.s);

controls.querySelectorAll(".sp").forEach(function(y){
y.style.background="#151515";
});

x.style.background="#333";

playing.forEach(function(a){

try{
a.playbackRate=speed;
}catch(e){}
});
};
});

controls.querySelector("#loop").onclick=function(){

loop=!loop;

this.textContent=
loop?"Loop On":"Loop Off";

playing.forEach(function(a){

try{
a.loop=loop;
}catch(e){}
});
};

controls.querySelector("#stop").onclick=stopAll;

var list=d.createElement("div");

list.style.cssText=
"max-height:410px;overflow-y:auto;padding:0 2px;";

content.appendChild(list);

sounds.forEach(function(s){

var b=d.createElement("button");

b.style.cssText=
"width:100%;padding:14px;margin:4px 0;"+
"background:#141414;color:#eee;"+
"border:1px solid #2c2c2c;border-radius:11px;"+
"display:flex;justify-content:space-between;"+
"align-items:center;font-size:14px;"+
"font-weight:600;cursor:pointer;transition:.15s;";

b.innerHTML=
"<span>"+s[0]+"</span><span>▶</span>";

b.onmouseenter=function(){
b.style.background="#202020";
};

b.onmouseleave=function(){
b.style.background="#141414";
};

b.onclick=function(){

var a=new Audio(s[1]);

a.preload="auto";
a.playbackRate=speed;
a.loop=loop;

playing.push(a);

a.play().catch(function(){

alert(
"Tap the sound again. The browser blocked audio playback."
);

});

a.onended=function(){

playing=playing.filter(function(x){
return x!==a;
});
};
};

list.appendChild(b);
});
}


/* =========================
   GAME CLEANUP
========================= */

function cleanupGame(){

var f=window.__verityGameCleanup;

if(f){

try{
f();
}catch(e){}

window.__verityGameCleanup=null;
}
}


/* =========================
   GAMES MENU
========================= */

function games(){

clear();
header("🎮 Games");

var content=box.querySelector("#verity-content");

var grid=d.createElement("div");

grid.style.cssText=
"display:grid;grid-template-columns:1fr 1fr;"+
"gap:9px;max-height:430px;"+
"overflow-y:auto;padding:2px;";

[
["🐦","Flappy Bird",flappy],
["⭕","Tic-Tac-Toe",tictactoe],
["🐍","Snake",snake],
["🔴","Connect Four",connect],
["🏓","Pong",pong],
["🔢","2048",game2048]
].forEach(function(g){

var b=d.createElement("button");

b.style.cssText=
"padding:17px 8px;background:#141414;"+
"color:#eee;border:1px solid #303030;"+
"border-radius:13px;cursor:pointer;"+
"font-weight:700;font-size:13px;transition:.15s;";

b.innerHTML=
'<div style="font-size:26px">'+g[0]+"</div>"+
'<div style="margin-top:7px">'+g[1]+"</div>";

b.onmouseenter=function(){

b.style.background="#222";
b.style.transform="translateY(-2px)";
};

b.onmouseleave=function(){

b.style.background="#141414";
b.style.transform="none";
};

b.onclick=g[2];

grid.appendChild(b);
});

content.appendChild(grid);
}


/* =========================
   FLAPPY
========================= */

function flappy(){

clear();
header("🐦 Flappy Bird");

var content=box.querySelector("#verity-content");

var c=d.createElement("canvas");

c.width=400;
c.height=330;

c.style.cssText=
"width:100%;max-width:400px;"+
"background:#111;border-radius:12px;"+
"display:block;margin:auto;touch-action:none;";

content.appendChild(c);

var ctx=c.getContext("2d");

var x=80;
var y=150;
var v=0;
var score=0;
var over=false;
var pipes=[];
var raf;

for(var i=0;i<3;i++){

pipes.push({
x:450+i*170,
gap:130+Math.random()*70
});
}

function flap(){

if(over){

flappy();
return;
}

v=-6;
}

function key(e){

if(
e.code==="Space"||
e.key==="ArrowUp"
){

e.preventDefault();
flap();
}
}

d.addEventListener("keydown",key);

c.onclick=flap;

c.addEventListener(
"touchstart",
function(e){

e.preventDefault();
flap();

},
{passive:false}
);

function draw(){

ctx.clearRect(0,0,c.width,c.height);

ctx.fillStyle="#111";
ctx.fillRect(0,0,c.width,c.height);

ctx.fillStyle="#fff";

ctx.beginPath();

ctx.arc(
x,
y,
10,
0,
Math.PI*2
);

ctx.fill();

pipes.forEach(function(p){

ctx.fillStyle="#444";

ctx.fillRect(
p.x,
0,
35,
p.gap
);

ctx.fillRect(
p.x,
p.gap+85,
35,
c.height
);
});

ctx.fillStyle="#fff";
ctx.font="bold 20px Arial";
ctx.fillText(score,15,28);

if(over){

ctx.textAlign="center";

ctx.font="bold 25px Arial";
ctx.fillText(
"Game Over",
200,
150
);

ctx.font="14px Arial";
ctx.fillText(
"Tap to restart",
200,
180
);

ctx.textAlign="left";
}
}

function tick(){

if(!box.contains(c))
return;

if(!over){

v+=.32;
y+=v;

pipes.forEach(function(p){

p.x-=2.5;

if(p.x<-40){

p.x=500;
p.gap=100+Math.random()*110;
score++;
}

if(
x+10>p.x&&
x-10<p.x+35&&
(
y-10<p.gap||
y+10>p.gap+85
)
){

over=true;
}
});

if(y<0||y>c.height)
over=true;
}

draw();

raf=requestAnimationFrame(tick);
}

window.__verityGameCleanup=function(){

cancelAnimationFrame(raf);
d.removeEventListener("keydown",key);
};

tick();
}


/* =========================
   TIC TAC TOE
========================= */

function tictactoe(){

clear();
header("⭕ Tic-Tac-Toe");

var content=box.querySelector("#verity-content");

var board=[
"",
"",
"",
"",
"",
"",
"",
"",
""
];

var done=false;

var wrap=d.createElement("div");

wrap.style.cssText=
"display:grid;grid-template-columns:repeat(3,80px);"+
"justify-content:center;gap:6px;";

content.appendChild(wrap);

function win(p){

return[
[0,1,2],
[3,4,5],
[6,7,8],
[0,3,6],
[1,4,7],
[2,5,8],
[0,4,8],
[2,4,6]
].some(function(a){

return a.every(function(i){
return board[i]===p;
});

});
}

function render(){

wrap.innerHTML="";

board.forEach(function(v,i){

var b=d.createElement("button");

b.style.cssText=
"width:80px;height:80px;"+
"background:#141414;color:#fff;"+
"border:1px solid #333;border-radius:10px;"+
"font-size:30px;font-weight:800;cursor:pointer;";

b.textContent=v;

b.onclick=function(){
move(i);
};

wrap.appendChild(b);
});
}

function move(i){

if(done||board[i])return;

board[i]="X";

render();

if(win("X")||board.every(Boolean)){

done=true;

setTimeout(function(){

alert(
win("X")?
"You win!":
"Draw!"
);

},50);

return;
}

setTimeout(bot,250);
}

function bot(){

if(done)return;

var empty=board.map(function(v,i){

return v?null:i;

}).filter(function(x){

return x!==null;

});

if(!empty.length)return;

var i;

var winMove=empty.find(function(n){

board[n]="O";

var w=win("O");

board[n]="";

return w;
});

if(winMove!==undefined){

i=winMove;

}else{

var block=empty.find(function(n){

board[n]="X";

var w=win("X");

board[n]="";

return w;
});

if(block!==undefined)
i=block;

else if(board[4]==="")
i=4;

else
i=empty[
Math.floor(
Math.random()*empty.length
)
];
}

board[i]="O";

render();

if(win("O")||board.every(Boolean)){

done=true;

setTimeout(function(){

alert(
win("O")?
"Bot wins!":
"Draw!"
);

},50);
}
}

render();
}


/* =========================
   CONNECT FOUR
========================= */

function connect(){

clear();
header("🔴 Connect Four");

var content=box.querySelector("#verity-content");

var B=Array(42).fill("");
var done=false;

var wrap=d.createElement("div");

wrap.style.cssText=
"display:grid;grid-template-columns:repeat(7,34px);"+
"gap:4px;justify-content:center;";

content.appendChild(wrap);

function render(){

wrap.innerHTML="";

B.forEach(function(v,i){

var b=d.createElement("button");

var bg=
v==="X"?"#777":
v==="O"?"#eee":
"#171717";

b.style.cssText=
"width:34px;height:34px;"+
"border-radius:50%;border:1px solid #333;"+
"background:"+bg+";cursor:pointer;";

b.onclick=function(){

move(i%7);

};

wrap.appendChild(b);
});
}

function check(p){

for(var r=0;r<6;r++)
for(var c=0;c<7;c++){

var i=r*7+c;

if(
c<4&&
B[i]===p&&
B[i+1]===p&&
B[i+2]===p&&
B[i+3]===p
)
return true;

if(
r<3&&
B[i]===p&&
B[i+7]===p&&
B[i+14]===p&&
B[i+21]===p
)
return true;

if(
r<3&&
c<4&&
B[i]===p&&
B[i+8]===p&&
B[i+16]===p&&
B[i+24]===p
)
return true;

if(
r>2&&
c<4&&
B[i]===p&&
B[i-6]===p&&
B[i-12]===p&&
B[i-18]===p
)
return true;
}

return false;
}

function drop(c,p){

for(var r=5;r>=0;r--){

if(!B[r*7+c]){

B[r*7+c]=p;

return true;
}
}

return false;
}

function move(c){

if(done||!drop(c,"X"))
return;

render();

if(check("X")){

done=true;

setTimeout(function(){
alert("You win!");
},50);

return;
}

setTimeout(function(){

if(done)return;

var cols=[
0,1,2,3,4,5,6
].filter(function(c){

return !B[c];

});

if(!cols.length)return;

var chosen=
cols[
Math.floor(
Math.random()*cols.length
)
];

drop(chosen,"O");

render();

if(check("O")){

done=true;

setTimeout(function(){
alert("Bot wins!");
},50);
}

},250);
}

render();
}


/* =========================
   SNAKE
========================= */

function snake(){

clear();
header("🐍 Snake");

var content=box.querySelector("#verity-content");

var c=d.createElement("canvas");

c.width=300;
c.height=300;

c.style.cssText=
"width:300px;max-width:100%;"+
"background:#111;border-radius:12px;"+
"display:block;margin:auto;touch-action:none;";

content.appendChild(c);

var ctx=c.getContext("2d");

var s=[
{x:10,y:10}
];

var dir={
x:1,
y:0
};

var food={
x:15,
y:15
};

var dead=false;
var timer;

function key(e){

if(
e.key==="ArrowUp"&&
dir.y!==1
)
dir={x:0,y:-1};

if(
e.key==="ArrowDown"&&
dir.y!==-1
)
dir={x:0,y:1};

if(
e.key==="ArrowLeft"&&
dir.x!==1
)
dir={x:-1,y:0};

if(
e.key==="ArrowRight"&&
dir.x!==-1
)
dir={x:1,y:0};
}

d.addEventListener("keydown",key);

function setDir(x,y){

if(x===0&&dir.y===-y)return;
if(y===0&&dir.x===-x)return;

dir={
x:x,
y:y
};
}

var startX=0;
var startY=0;

c.addEventListener(
"touchstart",
function(e){

var p=e.touches[0];

startX=p.clientX;
startY=p.clientY;

},
{passive:true}
);

c.addEventListener(
"touchend",
function(e){

var p=e.changedTouches[0];

var dx=p.clientX-startX;
var dy=p.clientY-startY;

if(
Math.abs(dx)<20&&
Math.abs(dy)<20
)
return;

if(Math.abs(dx)>Math.abs(dy))
setDir(dx>0?1:-1,0);

else
setDir(0,dy>0?1:-1);

},
{passive:true}
);

function tick(){

if(!box.contains(c))
return;

if(dead){

d.removeEventListener(
"keydown",
key
);

return;
}

var h={
x:s[0].x+dir.x,
y:s[0].y+dir.y
};

if(
h.x<0||
h.y<0||
h.x>=30||
h.y>=30||
s.some(function(p){
return p.x===h.x&&p.y===h.y;
})
){

dead=true;

ctx.fillStyle="#fff";
ctx.font="bold 24px Arial";
ctx.textAlign="center";

ctx.fillText(
"Game Over",
150,
150
);

ctx.textAlign="left";

return;
}

s.unshift(h);

if(
h.x===food.x&&
h.y===food.y
){

do{

food={
x:Math.floor(Math.random()*30),
y:Math.floor(Math.random()*30)
};

}while(
s.some(function(p){
return p.x===food.x&&p.y===food.y;
})
);

}else{

s.pop();
}

ctx.clearRect(
0,
0,
300,
300
);

ctx.fillStyle="#fff";

s.forEach(function(p){

ctx.fillRect(
p.x*10,
p.y*10,
9,
9
);

});

ctx.fillRect(
food.x*10,
food.y*10,
9,
9
);

timer=setTimeout(tick,90);
}

window.__verityGameCleanup=function(){

clearTimeout(timer);

d.removeEventListener(
"keydown",
key
);
};

tick();
}


/* =========================
   PONG
========================= */

function pong(){

clear();
header("🏓 Pong");

var content=box.querySelector("#verity-content");

var c=d.createElement("canvas");

c.width=400;
c.height=250;

c.style.cssText=
"width:100%;background:#111;"+
"border-radius:12px;display:block;"+
"margin:auto;touch-action:none;";

content.appendChild(c);

var ctx=c.getContext("2d");

var x=200;
var y=125;
var dx=3;
var dy=2;
var py=100;
var score=0;
var raf;

function control(clientY){

var r=c.getBoundingClientRect();

py=
(clientY-r.top)*
(250/r.height)-25;

py=Math.max(
0,
Math.min(200,py)
);
}

c.onmousemove=function(e){

control(e.clientY);

};

c.addEventListener(
"touchmove",
function(e){

e.preventDefault();

control(
e.touches[0].clientY
);

},
{passive:false}
);

function loop2(){

if(!box.contains(c))
return;

y+=dy;
x+=dx;

if(y<5||y>245)
dy*=-1;

if(
x<25&&
y>py&&
y<py+50
)
dx=Math.abs(dx);

if(x>380){

dx=-Math.abs(dx);
score++;
}

if(x<0){

x=200;
y=125;
score=0;
}

py+=(y-(py+25))*.08;

ctx.clearRect(
0,
0,
400,
250
);

ctx.fillStyle="#fff";

ctx.fillRect(
10,
py,
10,
50
);

ctx.fillRect(
380,
y-25,
10,
50
);

ctx.beginPath();

ctx.arc(
x,
y,
6,
0,
Math.PI*2
);

ctx.fill();

ctx.font="18px Arial";

ctx.fillText(
score,
195,
25
);

raf=requestAnimationFrame(loop2);
}

window.__verityGameCleanup=function(){

cancelAnimationFrame(raf);
};

loop2();
}


/* =========================
   2048
========================= */

function game2048(){

clear();
header("🔢 2048");

var content=box.querySelector("#verity-content");

var a=Array(16).fill(0);
var dead=false;

function add(){

var empty=a.map(function(v,i){

return v?null:i;

}).filter(function(x){

return x!==null;

});

if(empty.length){

a[
empty[
Math.floor(
Math.random()*empty.length
)
]
]=Math.random()<.9?2:4;
}
}

add();
add();

var g=d.createElement("div");

g.style.cssText=
"display:grid;grid-template-columns:repeat(4,60px);"+
"gap:5px;justify-content:center;";

content.appendChild(g);

function render(){

g.innerHTML="";

a.forEach(function(v){

var x=d.createElement("div");

x.style.cssText=
"width:60px;height:60px;background:#191919;"+
"border:1px solid #333;border-radius:8px;"+
"display:flex;align-items:center;"+
"justify-content:center;font-size:18px;"+
"font-weight:800;";

x.textContent=v||"";

g.appendChild(x);
});
}

function slide(row){

var vals=row.filter(Boolean);

for(
var i=0;
i<vals.length-1;
i++
){

if(vals[i]===vals[i+1]){

vals[i]*=2;

vals.splice(
i+1,
1
);
}
}

while(vals.length<4)
vals.push(0);

return vals;
}

function move(e){

if(dead)return;

var k=e.key;

if(
![
"ArrowLeft",
"ArrowRight",
"ArrowUp",
"ArrowDown"
].includes(k)
)
return;

e.preventDefault();

var old=a.join(",");

if(
k==="ArrowLeft"||
k==="ArrowRight"
){

for(
var r=0;
r<4;
r++
){

var row=
a.slice(
r*4,
r*4+4
);

if(k==="ArrowRight")
row.reverse();

row=slide(row);

if(k==="ArrowRight")
row.reverse();

for(
var c=0;
c<4;
c++
)
a[r*4+c]=row[c];
}

}else{

for(
var c=0;
c<4;
c++
){

var col=[
a[c],
a[4+c],
a[8+c],
a[12+c]
];

if(k==="ArrowDown")
col.reverse();

col=slide(col);

if(k==="ArrowDown")
col.reverse();

for(
var r=0;
r<4;
r++
)
a[r*4+c]=col[r];
}
}

if(a.join(",")!==old)
add();

render();

if(!canMove()){

dead=true;

setTimeout(function(){

alert("Game Over");

},50);
}
}

function canMove(){

for(
var i=0;
i<16;
i++
){

if(!a[i])
return true;

var c=i%4;
var r=Math.floor(i/4);

if(
c<3&&
a[i]===a[i+1]
)
return true;

if(
r<3&&
a[i]===a[i+4]
)
return true;
}

return false;
}

d.addEventListener(
"keydown",
move
);

window.__verityGameCleanup=function(){

d.removeEventListener(
"keydown",
move
);
};

render();
}


/* =========================
   SETTINGS
========================= */

function settings(){

clear();
header("⚙️ Settings");

var content=box.querySelector("#verity-content");

var wrap=d.createElement("div");

wrap.style.cssText=
"display:flex;flex-direction:column;gap:8px;";

content.appendChild(wrap);

function item(
icon,
title,
sub,
fn
){

var b=d.createElement("button");

b.style.cssText=
"width:100%;padding:15px;background:#141414;"+
"color:#eee;border:1px solid #303030;"+
"border-radius:12px;text-align:left;"+
"cursor:pointer;transition:.15s;";

b.innerHTML=
'<span style="font-size:20px">'+
icon+
"</span>"+
'<span style="margin-left:10px;font-weight:800">'+
title+
"</span>"+
'<div style="font-size:11px;color:#777;'+
"margin:5px 0 0 34px\">"+
sub+
"</div>";

b.onmouseenter=function(){
b.style.background="#222";
};

b.onmouseleave=function(){
b.style.background="#141414";
};

b.onclick=fn;

wrap.appendChild(b);
}

item(
"⌨️",
"Keybinds",
"Hide/show Verity",
keybinds
);

item(
"ⓘ",
"About",
"Information",
about
);
}


/* =========================
   KEYBINDS
========================= */

function getKey(){

try{

return localStorage.getItem(
"verityKey"
)||"Escape";

}catch(e){

return"Escape";
}
}

function saveKey(k){

try{

localStorage.setItem(
"verityKey",
k
);

}catch(e){}
}

function keybinds(){

clear();
header("⌨️ Keybinds");

var content=
box.querySelector("#verity-content");

var current=getKey();

var info=d.createElement("div");

info.style.cssText=
"background:#141414;border:1px solid #303030;"+
"border-radius:12px;padding:16px;color:#bbb;"+
"font-size:13px;line-height:1.5;";

info.innerHTML=
"<b style='color:#fff'>Hide / Show Verity</b>"+
"<br><br>Current key: "+
"<span id='key' style='color:#fff;font-weight:800'>"+
formatKey(current)+
"</span>"+
"<br><br>When hidden, Verity disappears and all sounds stop."+
"<br><br>Press the button below, then press any key.";

content.appendChild(info);

var capture=d.createElement("button");

capture.textContent="Change Key";

capture.style.cssText=
"width:100%;margin-top:8px;padding:13px;"+
"background:#151515;color:#fff;border:1px solid #333;"+
"border-radius:10px;font-weight:800;cursor:pointer;";

content.appendChild(capture);

var reset=d.createElement("button");

reset.textContent="Reset to Escape";

reset.style.cssText=
"width:100%;margin-top:8px;padding:11px;"+
"background:#101010;color:#aaa;border:1px solid #292929;"+
"border-radius:10px;font-weight:700;cursor:pointer;";

content.appendChild(reset);

capture.onclick=function(){

capture.textContent="Press a key...";

function listen(e){

e.preventDefault();
e.stopPropagation();

current=
e.key===" "?
"Space":
e.key;

saveKey(current);

info.querySelector("#key").textContent=
formatKey(current);

capture.textContent="Change Key";

d.removeEventListener(
"keydown",
listen,
true
);
}

d.addEventListener(
"keydown",
listen,
true
);
};

reset.onclick=function(){

current="Escape";

saveKey(current);

info.querySelector("#key").textContent=
"Escape";
};
}

function formatKey(k){

if(k===" ")
return"Space";

if(k==="Escape")
return"Escape";

if(k.length===1)
return k.toUpperCase();

return k;
}


/* =========================
   GLOBAL HIDE/SHOW
========================= */

function toggleVerity(){

hidden=!hidden;

if(hidden){

stopAll();

cleanupGame();

if(box)
box.style.display="none";

var modals=
d.querySelectorAll(
".verity-modal"
);

modals.forEach(function(x){

x.style.display="none";

});

}else{

if(box)
box.style.display="block";

var modals2=
d.querySelectorAll(
".verity-modal"
);

modals2.forEach(function(x){

x.style.display="block";

});
}
}

function globalKey(e){

var wanted=getKey();

if(e.key===wanted){

e.preventDefault();
e.stopPropagation();

toggleVerity();
}
}

d.addEventListener(
"keydown",
globalKey,
true
);

cleanupFns.push(function(){

d.removeEventListener(
"keydown",
globalKey,
true
);
});


/* =========================
   ABOUT
========================= */

function about(){

clear();
header("ⓘ About");

var content=
box.querySelector("#verity-content");

var a=d.createElement("div");

a.style.cssText=
"background:#141414;border:1px solid #303030;"+
"border-radius:12px;padding:20px;color:#ddd;"+
"font-size:14px;line-height:1.7;text-align:center;";

a.innerHTML=
'<div style="font-size:28px;margin-bottom:12px">✦</div>'+
"<b>Creator: Henry</b>"+
"<br><br>"+
"The creator is not responsible for your actions.";

content.appendChild(a);
}


/* =========================
   MORE GAMES
========================= */

function embeddedGames(){

var modal=d.createElement("div");

modal.className="verity-modal";

modal.style.cssText=
"position:fixed;left:50%;top:50%;"+
"transform:translate(-50%,-50%);"+
"width:58vw;height:74vh;"+
"min-width:310px;min-height:420px;"+
"background:#000;border:1px solid #333;"+
"border-radius:18px;overflow:hidden;"+
"z-index:2147483646;"+
"box-shadow:0 20px 80px #000;";

var bar=d.createElement("div");

bar.style.cssText=
"position:absolute;left:0;right:0;top:0;"+
"height:48px;z-index:4;"+
"background:rgba(10,10,10,.94);"+
"border-bottom:1px solid #292929;"+
"cursor:grab;touch-action:none;";

bar.innerHTML=
'<span style="'+
"position:absolute;left:16px;top:14px;"+
"font-weight:800;font-size:14px;"+
"user-select:none"+
'">🌐 More Games</span>';

var closeBtn=d.createElement("button");

closeBtn.textContent="×";

closeBtn.style.cssText=
"position:absolute;right:9px;top:8px;z-index:5;"+
"width:34px;height:34px;background:#111;"+
"color:#fff;border:1px solid #444;"+
"border-radius:9px;font-size:20px;cursor:pointer;";

closeBtn.onclick=function(){

modal.remove();

};

var frame=d.createElement("iframe");

frame.style.cssText=
"position:absolute;top:48px;left:0;"+
"width:100%;height:calc(100% - 48px);"+
"border:0;background:#000;";

frame.srcdoc=`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Games</title>
<style>
*{box-sizing:border-box}
body{
margin:0;
background:#000;
color:#fff;
font-family:Arial,sans-serif;
min-height:100vh
}
.sidebar{
position:fixed;
left:14px;
top:14px;
bottom:14px;
width:76px;
background:#111;
border:1px solid #292929;
border-radius:20px;
padding:12px 9px;
display:flex;
flex-direction:column;
gap:9px;
overflow-y:auto;
box-shadow:0 10px 40px #000;
z-index:1000
}
.sidebar-btn{
background:#1b1b1b;
color:#ddd;
border:1px solid #303030;
border-radius:14px;
min-height:48px;
padding:8px 4px;
font-size:14px;
font-weight:700;
cursor:pointer
}
.main-content{
margin-left:108px;
padding:38px 28px 60px;
max-width:1150px
}
.hero{
text-align:center;
padding:18px 10px 28px
}
h1{
font-size:42px;
margin:0 0 7px;
font-weight:800
}
.byline{
color:#888;
font-size:15px;
margin-bottom:20px
}
#searchInput{
width:min(620px,100%);
padding:14px 18px;
background:#111;
color:#fff;
border:1px solid #303030;
border-radius:16px;
outline:none;
font-size:15px
}
#lolbutton{
margin-top:12px;
padding:9px 14px;
background:#181818;
color:#aaa;
border:1px solid #303030;
border-radius:12px;
cursor:pointer
}
.letter-section{
margin:0 auto 30px;
max-width:900px;
padding:0 4px
}
.letter-header{
font-size:23px;
margin:0 0 12px;
padding:0 0 9px;
border-bottom:1px solid #282828
}
.buttons-container{
display:flex;
flex-direction:column;
gap:9px;
align-items:center
}
input[type="button"]{
width:100%;
max-width:700px;
padding:14px 18px;
background:#111;
color:#eee;
border:1px solid #292929;
border-radius:14px;
font-size:14px;
font-weight:600;
text-align:left;
cursor:pointer
}
</style>
</head>
<body>

<div class="sidebar" id="sidebar"></div>

<div class="main-content">

<section class="hero">

<h1>Games</h1>

<div class="byline">By Henry</div>

<input
type="text"
placeholder="Search games..."
id="searchInput"
>

<br>

<button id="lolbutton">
Click to load if it isn't loading
</button>

</section>

<div id="sections-container"></div>

</div>

<script src="https://cdn.jsdelivr.net/gh/bubbls/ugs-singlefile@main/searchbut.js"><\/script>
<script src="https://cdn.jsdelivr.net/gh/bubbls/ugs-singlefile@main/games.js"><\/script>

</body>
</html>`;

modal.appendChild(frame);
modal.appendChild(bar);
modal.appendChild(closeBtn);

d.body.appendChild(modal);

makeDraggable(
modal,
bar
);
}


/* =========================
   CLOSE
========================= */

function close(){

stopAll();

cleanupGame();

timers.forEach(function(t){

clearTimeout(t);

});

timers=[];

cleanupFns.forEach(function(fn){

try{
fn();
}catch(e){}

});

cleanupFns=[];

var modals=
d.querySelectorAll(
".verity-modal"
);

modals.forEach(function(x){

x.remove();

});

if(overlay)
overlay.remove();

window.__verity=0;
window.__verityGameCleanup=null;
}

})();

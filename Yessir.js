(function(){
if(window.__verity)return;
var pw=prompt("Enter password:");
if(pw!=="67"){alert("Incorrect password");return}
window.__verity=1;

var d=document,playing=[],speed=1,loop=false;

var sounds=[
["🎧 yarayara phonk","https://audio.jukehost.co.uk/01a0a0d9-78af-72ce-92ba-13361ceba355.mp3"],
["🔥 TikiPhonk","https://audio.jukehost.co.uk/01a0a0d5-920d-737f-b67e-c8c7d3d75c84.mp3"],
["🎵 Miguel Phonk","https://audio.jukehost.co.uk/01a0a030-063b-7284-90f7-32ccf2f2070b.mp3"],
["😄 Verity Song","https://audio.jukehost.co.uk/01a0a0de-4cb2-7107-b1cc-001e1b8e694f.mp3"],
["💬 Discord Ping","https://creatorset-public.s3.us-east-1.amazonaws.com/public-audio/Discord+Ping+(Sound+Effect).mp3"],
["🎵 Woodlawn Phonk","https://audio.jukehost.co.uk/01a0a2c7-6c31-7134-8a08-29c59ce85520.mp3"],
["🎵 Mr Bays Funk","https://audio.jukehost.co.uk/01a0a2ce-7dfa-733c-bbe7-0828fa488195.mp3"]
];

var overlay=d.createElement("div");
overlay.style.cssText=
"position:fixed;inset:0;z-index:999999999;font-family:Arial,sans-serif;"+
"pointer-events:none;";
d.body.appendChild(overlay);

/* STARTUP */
var star=d.createElement("div");
star.style.cssText=
"position:absolute;left:50%;top:50%;width:70px;height:70px;"+
"transform:translate(-50%,-50%) scale(.1);background:#000;"+
"border-radius:50%;opacity:1;transition:all .7s cubic-bezier(.2,.8,.2,1);"+
"box-shadow:0 0 35px #000;";
overlay.appendChild(star);

setTimeout(function(){
star.style.transform="translate(-50%,-50%) scale(1)";
},100);

setTimeout(function(){
star.style.borderRadius="0";
star.style.clipPath="polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 94%,50% 72%,21% 94%,32% 57%,2% 35%,39% 35%)";
star.style.transform="translate(-50%,-50%) scale(1.15) rotate(180deg)";
},800);

setTimeout(function(){
star.style.transform="translate(-50%,-50%) scale(1.5) rotate(540deg)";
star.style.opacity="0";
},1450);

setTimeout(function(){
star.remove();
overlay.style.pointerEvents="auto";
launcher();
},2050);

function launcher(){

var box=d.createElement("div");
box.style.cssText=
"position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.8);"+
"width:min(650px,92vw);background:rgba(8,8,8,.97);color:#fff;"+
"border:1px solid #303030;border-radius:18px;padding:13px;"+
"box-shadow:0 20px 70px rgba(0,0,0,.85);opacity:0;"+
"transition:.35s ease;backdrop-filter:blur(14px);";

box.innerHTML=
'<button id="vx" style="position:absolute;right:10px;top:8px;width:32px;height:32px;border:1px solid #333;border-radius:9px;background:#171717;color:#aaa;font-size:17px;cursor:pointer">×</button>'+
'<div style="font-size:20px;font-weight:800;padding:4px 42px 12px 5px;letter-spacing:-.5px">✦ VERITY</div>'+
'<div id="options" style="display:flex;gap:8px;width:100%"></div>';

overlay.appendChild(box);

var options=box.querySelector("#options");

function option(icon,title,sub,fn){
var b=d.createElement("button");
b.style.cssText=
"flex:1;min-width:0;padding:13px 8px;background:#141414;color:#eee;"+
"border:1px solid #303030;border-radius:12px;cursor:pointer;"+
"font-weight:700;font-size:13px;transition:.18s;";
b.innerHTML='<div style="font-size:21px;margin-bottom:5px">'+icon+'</div>'+
'<div>'+title+'</div>'+
'<div style="font-size:10px;color:#777;margin-top:3px;font-weight:500">'+sub+'</div>';
b.onmouseenter=function(){b.style.background="#222";b.style.transform="translateY(-2px)"};
b.onmouseleave=function(){b.style.background="#141414";b.style.transform="none"};
b.onclick=fn;
options.appendChild(b);
}

option("🎵","Soundboard","Sounds",soundboard);
option("🎮","Games","Play",games);
option("🌐","More Games","Henry",embeddedGames);
option("✦","Coming Soon","Soon",function(){alert("More features coming soon.")});

box.querySelector("#vx").onclick=close;

setTimeout(function(){
box.style.opacity="1";
box.style.transform="translate(-50%,-50%) scale(1)";
},30);

function close(){
stopAll();
overlay.remove();
window.__verity=0;
}

function clear(){
while(box.firstChild)box.removeChild(box.firstChild);
}

function header(title,back){
box.innerHTML=
'<button id="back" style="position:absolute;left:11px;top:10px;width:34px;height:32px;border:1px solid #333;border-radius:9px;background:#171717;color:#ddd;font-size:17px;cursor:pointer">‹</button>'+
'<button id="close2" style="position:absolute;right:10px;top:10px;width:34px;height:32px;border:1px solid #333;border-radius:9px;background:#171717;color:#aaa;font-size:17px;cursor:pointer">×</button>'+
'<div style="font-size:19px;font-weight:800;text-align:center;padding:5px 45px 12px">'+title+'</div>';
box.querySelector("#back").onclick=launcherView;
box.querySelector("#close2").onclick=close;
}

function launcherView(){
clear();
box.innerHTML=
'<button id="vx" style="position:absolute;right:10px;top:8px;width:32px;height:32px;border:1px solid #333;border-radius:9px;background:#171717;color:#aaa;font-size:17px;cursor:pointer">×</button>'+
'<div style="font-size:20px;font-weight:800;padding:4px 42px 12px 5px">✦ VERITY</div>'+
'<div id="options" style="display:flex;gap:8px;width:100%"></div>';
var o=box.querySelector("#options");
function add(i,t,s,f){
var b=d.createElement("button");
b.style.cssText="flex:1;padding:13px 7px;background:#141414;color:#eee;border:1px solid #303030;border-radius:12px;cursor:pointer;font-weight:700;font-size:13px";
b.innerHTML='<div style="font-size:21px;margin-bottom:5px">'+i+'</div><div>'+t+'</div><div style="font-size:10px;color:#777;margin-top:3px">'+s+'</div>';
b.onclick=f;o.appendChild(b);
}
add("🎵","Soundboard","Sounds",soundboard);
add("🎮","Games","Play",games);
add("🌐","More Games","Henry",embeddedGames);
add("✦","Coming Soon","Soon",function(){alert("More features coming soon.")});
box.querySelector("#vx").onclick=close;
}

function soundboard(){
clear();
header("🎵 Soundboard");
var content=d.createElement("div");
content.style.cssText="max-height:430px;overflow-y:auto;padding:0 2px";
box.appendChild(content);

var controls=d.createElement("div");
controls.style.cssText="display:flex;gap:6px;margin-bottom:8px";
controls.innerHTML=
'<button class="sp" data-s="1">1x</button>'+
'<button class="sp" data-s="2">2x</button>'+
'<button class="sp" data-s="3">3x</button>'+
'<button id="loop">Loop Off</button>'+
'<button id="stop">Stop</button>';

box.appendChild(controls);

Array.from(controls.children).forEach(function(x){
x.style.cssText="flex:1;padding:9px;background:#151515;color:#ddd;border:1px solid #333;border-radius:9px;font-weight:700;cursor:pointer";
});

controls.querySelectorAll(".sp").forEach(function(x){
x.onclick=function(){
speed=Number(x.dataset.s);
controls.querySelectorAll(".sp").forEach(function(y){y.style.background="#151515"});
x.style.background="#333";
};
});

controls.querySelector("#loop").onclick=function(){
loop=!loop;
this.textContent=loop?"Loop On":"Loop Off";
};

controls.querySelector("#stop").onclick=stopAll;

sounds.forEach(function(s){
var b=d.createElement("button");
b.style.cssText=
"width:100%;padding:13px;margin:4px 0;background:#141414;color:#eee;"+
"border:1px solid #2c2c2c;border-radius:11px;display:flex;"+
"justify-content:space-between;align-items:center;font-size:14px;font-weight:600;cursor:pointer";
b.innerHTML="<span>"+s[0]+"</span><span>▶</span>";
b.onclick=function(){
var a=new Audio(s[1]);
a.playbackRate=speed;
a.loop=loop;
playing.push(a);
a.play().catch(function(){alert("Tap again. Browser blocked audio.")});
a.onended=function(){playing=playing.filter(function(x){return x!==a})};
};
content.appendChild(b);
});
}

function stopAll(){
playing.forEach(function(a){
try{a.pause();a.currentTime=0}catch(e){}
});
playing=[];
}

/* BUILT-IN GAMES */
function games(){
clear();
header("🎮 Games");

var grid=d.createElement("div");
grid.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:430px;overflow-y:auto;padding:2px";

[
["🐦","Flappy Bird",flappy],
["⭕","Tic-Tac-Toe","tictactoe"],
["🐍","Snake",snake],
["🔴","Connect Four","connect"],
["🏓","Pong","pong"],
["🔢","2048","game2048"]
].forEach(function(g){
var b=d.createElement("button");
b.style.cssText="padding:16px 8px;background:#141414;color:#eee;border:1px solid #303030;border-radius:12px;cursor:pointer;font-weight:700;font-size:13px";
b.innerHTML='<div style="font-size:25px">'+g[0]+'</div><div style="margin-top:6px">'+g[1]+'</div>';
b.onclick=function(){
if(typeof g[2]==="function")g[2]();
else if(g[2]==="tictactoe")tictactoe();
else if(g[2]==="connect")connect();
else if(g[2]==="pong")pong();
else game2048();
};
grid.appendChild(b);
});

box.appendChild(grid);
}

/* FLAPPY */
function flappy(){
clear();header("🐦 Flappy Bird");
var c=d.createElement("canvas");
c.width=400;c.height=330;
c.style.cssText="width:100%;max-width:400px;background:#111;border-radius:12px;display:block;margin:auto;touch-action:none";
box.appendChild(c);
var x=80,y=150,v=0,score=0,over=false,pipes=[];
var ctx=c.getContext("2d");

function flap(){if(over){flappy();return}v=-6}
c.onclick=flap;
c.ontouchstart=function(e){e.preventDefault();flap()};
d.onkeydown=function(e){if(e.code==="Space")flap()};

for(var i=0;i<3;i++)pipes.push({x:450+i*170,gap:130+Math.random()*70});

function draw(){
ctx.clearRect(0,0,c.width,c.height);
ctx.fillStyle="#111";ctx.fillRect(0,0,c.width,c.height);
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,10,0,7);ctx.fill();
pipes.forEach(function(p){
ctx.fillStyle="#444";
ctx.fillRect(p.x,0,35,p.gap);
ctx.fillRect(p.x,p.gap+85,35,c.height);
});
ctx.fillStyle="#fff";ctx.font="bold 20px Arial";ctx.fillText(score,15,28);
if(over){
ctx.textAlign="center";ctx.font="bold 25px Arial";ctx.fillText("Game Over",200,150);
ctx.font="14px Arial";ctx.fillText("Tap to restart",200,180);ctx.textAlign="left";
}
}
function tick(){
if(!over){
v+=.32;y+=v;
pipes.forEach(function(p){
p.x-=2.5;
if(p.x<-40){p.x=500;p.gap=100+Math.random()*110;score++}
if(x+10>p.x&&x-10<p.x+35&&(y-10<p.gap||y+10>p.gap+85))over=true;
});
if(y<0||y>c.height)over=true;
}
draw();requestAnimationFrame(tick);
}
tick();
}

/* TIC TAC TOE */
function tictactoe(){
clear();header("⭕ Tic-Tac-Toe");
var board=["","","","","","","","",""],turn="X",done=false;
var wrap=d.createElement("div");
wrap.style.cssText="display:grid;grid-template-columns:repeat(3,80px);justify-content:center;gap:6px";
box.appendChild(wrap);
function render(){
wrap.innerHTML="";
board.forEach(function(v,i){
var b=d.createElement("button");
b.style.cssText="width:80px;height:80px;background:#141414;color:#fff;border:1px solid #333;border-radius:10px;font-size:30px;font-weight:800";
b.textContent=v;b.onclick=function(){move(i)};wrap.appendChild(b);
});
}
function win(p){
return [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
.some(function(a){return a.every(function(i){return board[i]===p})});
}
function move(i){
if(done||board[i])return;
board[i]="X";turn="O";render();
if(win("X")||board.every(Boolean)){done=true;setTimeout(function(){alert(win("X")?"You win!":"Draw!");},50);return}
setTimeout(bot,250);
}
function bot(){
var empty=board.map(function(v,i){return v?null:i}).filter(function(x){return x!==null});
if(!empty.length)return;
var i=empty[Math.floor(Math.random()*empty.length)];
board[i]="O";
if(win("O")||board.every(Boolean)){done=true}
else turn="X";
render();
if(done)setTimeout(function(){alert(win("O")?"Bot wins!":"Draw!");},50);
}
render();
}

/* CONNECT FOUR */
function connect(){
clear();header("🔴 Connect Four");
var B=Array.from({length:42},function(){return ""}),done=false;
var wrap=d.createElement("div");
wrap.style.cssText="display:grid;grid-template-columns:repeat(7,34px);gap:4px;justify-content:center";
box.appendChild(wrap);

function render(){
wrap.innerHTML="";
B.forEach(function(v,i){
var b=d.createElement("button");
b.style.cssText="width:34px;height:34px;border-radius:50%;border:1px solid #333;background:"+(v==="X"?"#777":v==="O"?"#eee":"#171717")+";cursor:pointer";
b.onclick=function(){move(i%7)};wrap.appendChild(b);
});
}
function check(p){
for(var r=0;r<6;r++)for(var c=0;c<7;c++){
var i=r*7+c;
if(c<4&&B[i]===p&&B[i+1]===p&&B[i+2]===p&&B[i+3]===p)return true;
if(r<3&&B[i]===p&&B[i+7]===p&&B[i+14]===p&&B[i+21]===p)return true;
if(r<3&&c<4&&B[i]===p&&B[i+8]===p&&B[i+16]===p&&B[i+24]===p)return true;
if(r>2&&c<4&&B[i]===p&&B[i-6]===p&&B[i-12]===p&&B[i-18]===p)return true;
}
return false;
}
function drop(c,p){
for(var r=5;r>=0;r--)if(!B[r*7+c]){B[r*7+c]=p;return true}
return false;
}
function move(c){
if(done||!drop(c,"X"))return;
render();
if(check("X")){done=true;setTimeout(function(){alert("You win!");},50);return}
setTimeout(function(){
var cols=[0,1,2,3,4,5,6].filter(function(c){return !B[c]});
if(cols.length)drop(cols[Math.floor(Math.random()*cols.length)],"O");
render();
if(check("O")){done=true;setTimeout(function(){alert("Bot wins!");},50)}
},250);
}
render();
}

/* SNAKE */
function snake(){
clear();header("🐍 Snake");
var c=d.createElement("canvas");c.width=300;c.height=300;
c.style.cssText="width:300px;max-width:100%;background:#111;border-radius:12px;display:block;margin:auto";
box.appendChild(c);
var ctx=c.getContext("2d"),s=[{x:10,y:10}],dir={x:1,y:0},food={x:15,y:15},dead=false;
function key(e){
if(e.key==="ArrowUp"&&dir.y!==1)dir={x:0,y:-1};
if(e.key==="ArrowDown"&&dir.y!==-1)dir={x:0,y:1};
if(e.key==="ArrowLeft"&&dir.x!==1)dir={x:-1,y:0};
if(e.key==="ArrowRight"&&dir.x!==-1)dir={x:1,y:0};
}
d.onkeydown=key;
function tick(){
if(dead)return;
var h={x:s[0].x+dir.x,y:s[0].y+dir.y};
if(h.x<0||h.y<0||h.x>=30||h.y>=30||s.some(function(p){return p.x===h.x&&p.y===h.y})){dead=true;alert("Game Over");return}
s.unshift(h);
if(h.x===food.x&&h.y===food.y)food={x:Math.floor(Math.random()*30),y:Math.floor(Math.random()*30)};
else s.pop();
ctx.clearRect(0,0,300,300);
ctx.fillStyle="#fff";s.forEach(function(p){ctx.fillRect(p.x*10,p.y*10,9,9)});
ctx.fillRect(food.x*10,food.y*10,9,9);
setTimeout(tick,90);
}
tick();
}

/* PONG */
function pong(){
clear();header("🏓 Pong");
var c=d.createElement("canvas");c.width=400;c.height=250;
c.style.cssText="width:100%;background:#111;border-radius:12px;display:block;margin:auto";
box.appendChild(c);
var x=200,y=125,dx=3,dy=2,py=100,score=0;
var ctx=c.getContext("2d");
function loop2(){
y+=dy;x+=dx;
if(y<5||y>245)dy*=-1;
if(x<20&&y>py&&y<py+50)dx=Math.abs(dx);
if(x>380){dx=-Math.abs(dx);score++}
if(x<0){x=200;y=125;score=0}
py+=(y-(py+25))*.08;
ctx.clearRect(0,0,400,250);
ctx.fillStyle="#fff";ctx.fillRect(10,py,10,50);ctx.fillRect(380,y-25,10,50);
ctx.beginPath();ctx.arc(x,y,6,0,7);ctx.fill();
ctx.font="18px Arial";ctx.fillText(score,195,25);
requestAnimationFrame(loop2);
}
c.onmousemove=function(e){var r=c.getBoundingClientRect();py=(e.clientY-r.top)*(250/r.height)-25};
loop2();
}

/* 2048 */
function game2048(){
clear();header("🔢 2048");
var a=Array(16).fill(0);
function add(){var e=a.map(function(v,i){return v?null:i}).filter(function(x){return x!==null});if(e.length)a[e[Math.floor(Math.random()*e.length)]]=2}
add();add();
var g=d.createElement("div");
g.style.cssText="display:grid;grid-template-columns:repeat(4,60px);gap:5px;justify-content:center";
box.appendChild(g);
function render(){
g.innerHTML="";
a.forEach(function(v){
var x=d.createElement("div");
x.style.cssText="width:60px;height:60px;background:#191919;border:1px solid #333;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800";
x.textContent=v||"";g.appendChild(x);
});
}
function move(e){
var k=e.key;
if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(k))return;
var old=a.join(",");
for(var r=0;r<4;r++){
var row=a.slice(r*4,r*4+4);
if(k==="ArrowRight"||k==="ArrowDown")row.reverse();
var vals=row.filter(Boolean);
for(var i=0;i<vals.length-1;i++)if(vals[i]===vals[i+1]){vals[i]*=2;vals.splice(i+1,1)}
while(vals.length<4)vals.push(0);
if(k==="ArrowRight"||k==="ArrowDown")vals.reverse();
for(i=0;i<4;i++)if(k==="ArrowLeft"||k==="ArrowRight")a[r*4+i]=vals[i];else a[i*4+r]=vals[i];
}
if(a.join(",")!==old)add();
render();
}
d.onkeydown=move;render();
}

/* EMBEDDED PAGE */
function embeddedGames(){
var modal=d.createElement("div");
modal.style.cssText=
"position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);"+
"width:52vw;height:72vh;min-width:310px;min-height:420px;"+
"background:#000;border:1px solid #333;border-radius:18px;"+
"overflow:hidden;z-index:1000000000;box-shadow:0 20px 80px #000";

var close=d.createElement("button");
close.textContent="×";
close.style.cssText=
"position:absolute;right:9px;top:8px;z-index:5;width:34px;height:34px;"+
"background:#111;color:#fff;border:1px solid #444;border-radius:9px;font-size:20px;cursor:pointer";
close.onclick=function(){modal.remove()};

var frame=d.createElement("iframe");
frame.style.cssText="width:100%;height:100%;border:0;background:#000";
frame.srcdoc=`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Games</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#000;color:#fff;font-family:Arial,sans-serif;min-height:100vh}
.sidebar{position:fixed;left:14px;top:14px;bottom:14px;width:76px;background:#111;border:1px solid #292929;border-radius:20px;padding:12px 9px;display:flex;flex-direction:column;gap:9px;overflow-y:auto;box-shadow:0 10px 40px #000;z-index:1000}
.sidebar-btn{background:#1b1b1b;color:#ddd;border:1px solid #303030;border-radius:14px;min-height:48px;padding:8px 4px;font-size:14px;font-weight:700;cursor:pointer}
.main-content{margin-left:108px;padding:38px 28px 60px;max-width:1150px}
.hero{text-align:center;padding:18px 10px 28px}
h1{font-size:42px;margin:0 0 7px;font-weight:800}
.byline{color:#888;font-size:15px;margin-bottom:20px}
#searchInput{width:min(620px,100%);padding:14px 18px;background:#111;color:#fff;border:1px solid #303030;border-radius:16px;outline:none;font-size:15px}
#lolbutton{margin-top:12px;padding:9px 14px;background:#181818;color:#aaa;border:1px solid #303030;border-radius:12px;cursor:pointer}
.letter-section{margin:0 auto 30px;max-width:900px;padding:0 4px}
.letter-header{font-size:23px;margin:0 0 12px;padding:0 0 9px;border-bottom:1px solid #282828}
.buttons-container{display:flex;flex-direction:column;gap:9px;align-items:center}
input[type="button"]{width:100%;max-width:700px;padding:14px 18px;background:#111;color:#eee;border:1px solid #292929;border-radius:14px;font-size:14px;font-weight:600;text-align:left;cursor:pointer}
</style>
</head>
<body>
<div class="sidebar" id="sidebar"></div>
<div class="main-content">
<section class="hero">
<h1>Games</h1>
<div class="byline">By Henry</div>
<input type="text" placeholder="Search games..." id="searchInput">
<br>
<button id="lolbutton">Click to load if it isn't loading</button>
</section>
<div id="sections-container"></div>
</div>
<script src="https://cdn.jsdelivr.net/gh/bubbls/ugs-singlefile@main/searchbut.js"></script>
<script src="https://cdn.jsdelivr.net/gh/bubbls/ugs-singlefile@main/games.js"></script>
</body>
</html>`;

modal.appendChild(frame);
modal.appendChild(close);
d.body.appendChild(modal);
}

}
})();

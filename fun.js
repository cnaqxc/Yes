(function(){
"use strict";

if(window.__oval){
    try{
        if(window.__ovalToggle) window.__ovalToggle();
    }catch(e){}
    return;
}

window.__oval=true;

var d=document;
var root=d.createElement("div");
var box=null;
var playing=[];
var timers=[];
var cleanups=[];
var gameCleanup=null;

var hidden=false;
var minimized=false;
var maximized=false;
var editMode=false;

var rate=1;
var loopState=false;

var BACKGROUND_URL="https://user17929.na.imgto.link/public/20260916/img=1580.avif";
var HOTKEY_STORAGE="oval-hotkey-v3";

var sounds=[
    ["🎧","yarayara phonk","https://audio.jukehost.co.uk/01a0a0d9-78af-72ce-92ba-13361ceba355.mp3"],
    ["🔥","TikiPhonk","https://audio.jukehost.co.uk/01a0a0d5-920d-737f-b67e-c8c7d3d75c84.mp3"],
    ["🎵","Miguel Phonk","https://audio.jukehost.co.uk/01a0a030-063b-7284-90f7-32ccf2f2070b.mp3"],
    ["😄","Verity Song","https://audio.jukehost.co.uk/01a0a0de-4cb2-7107-b1cc-001e1b8e694f.mp3"],
    ["💬","Discord Ping","https://creatorset-public.s3.us-east-1.amazonaws.com/public-audio/Discord+Ping+(Sound+Effect).mp3"],
    ["🎵","Woodlawn Phonk","https://audio.jukehost.co.uk/01a0a2c7-6c31-7134-8a08-29c59ce85520.mp3"],
    ["🎵","Mr Bays Funk","https://audio.jukehost.co.uk/01a0a2ce-7dfa-733c-bbe7-0828fa488195.mp3"]
];

/* =========================================
   ROOT
========================================= */

root.id="oval-root";

root.style.cssText=
"position:fixed;"+
"inset:0;"+
"z-index:2147483640;"+
"pointer-events:none;"+
"font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Arial,sans-serif;"+
"color:#fff;"+
"overflow:hidden;"+
"background-image:"+
"linear-gradient(rgba(4,7,15,.28),rgba(4,7,15,.52)),url('"+BACKGROUND_URL+"');"+
"background-size:cover;"+
"background-position:center;"+
"background-repeat:no-repeat;";

d.body.appendChild(root);


/* =========================================
   GLOBAL CSS
========================================= */

var style=d.createElement("style");

style.textContent=
"#oval-root,*{box-sizing:border-box}"+
"#oval-root button,#oval-root input{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Arial,sans-serif}"+
"#oval-root button{-webkit-tap-highlight-color:transparent}"+
"#oval-root button:active{transform:scale(.975)!important}"+
"#oval-root::-webkit-scrollbar{width:7px}"+
"#oval-root::-webkit-scrollbar-thumb{background:rgba(255,255,255,.16);border-radius:999px}"+
"@keyframes ovalStars{from{transform:translate3d(0,0,0)}to{transform:translate3d(-42px,25px,0)}}"+
"@keyframes ovalShine{0%{transform:translateX(-120%);opacity:0}20%{opacity:.5}50%{opacity:.08}100%{transform:translateX(120%);opacity:0}}"+
"@keyframes ovalPulse{0%,100%{transform:scale(1);opacity:.65}50%{transform:scale(1.08);opacity:1}}";

d.head.appendChild(style);


/* =========================================
   HELPERS
========================================= */

function later(fn,ms){
    var t=setTimeout(function(){
        timers=timers.filter(function(x){return x!==t});
        fn();
    },ms);
    timers.push(t);
}

function clearTimers(){
    timers.forEach(function(t){
        try{clearTimeout(t)}catch(e){}
    });
    timers=[];
}

function cleanupView(){
    cleanups.splice(0).forEach(function(fn){
        try{fn()}catch(e){}
    });
}

function stopGame(){
    if(gameCleanup){
        try{gameCleanup()}catch(e){}
        gameCleanup=null;
    }
}

function stopAll(){
    playing.forEach(function(a){
        try{
            a.pause();
            a.currentTime=0;
        }catch(e){}
    });
    playing=[];
}

function esc(v){
    return String(v).replace(/[&<>"']/g,function(c){
        return {
            "&":"&amp;",
            "<":"&lt;",
            ">":"&gt;",
            '"':"&quot;",
            "'":"&#39;"
        }[c];
    });
}

function css(el,text){
    el.style.cssText=text;
}

function makeButton(label,fn,extra){
    var b=d.createElement("button");
    b.innerHTML=label;

    css(b,
        "appearance:none;"+
        "border:1px solid rgba(255,255,255,.14);"+
        "background:linear-gradient(180deg,rgba(255,255,255,.15),rgba(255,255,255,.06));"+
        "color:#fff;"+
        "border-radius:13px;"+
        "padding:11px 14px;"+
        "font:600 13px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"+
        "cursor:pointer;"+
        "box-shadow:inset 0 1px rgba(255,255,255,.1),0 8px 22px rgba(0,0,0,.2);"+
        "transition:transform .16s ease,background .16s ease,border-color .16s ease;"+
        (extra||"")
    );

    b.onclick=function(e){
        e.stopPropagation();
        fn(e);
    };

    b.onmouseenter=function(){
        b.style.transform="translateY(-1px)";
        b.style.background="linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,.09))";
        b.style.borderColor="rgba(255,255,255,.25)";
    };

    b.onmouseleave=function(){
        b.style.transform="";
        b.style.background="linear-gradient(180deg,rgba(255,255,255,.15),rgba(255,255,255,.06))";
        b.style.borderColor="rgba(255,255,255,.14)";
    };

    return b;
}

function makePanel(){
    var p=d.createElement("div");

    css(p,
        "background:linear-gradient(145deg,rgba(29,34,52,.62),rgba(7,10,18,.68));"+
        "border:1px solid rgba(255,255,255,.15);"+
        "border-radius:22px;"+
        "box-shadow:inset 0 1px rgba(255,255,255,.12),0 20px 60px rgba(0,0,0,.3);"+
        "backdrop-filter:blur(26px) saturate(150%);"+
        "-webkit-backdrop-filter:blur(26px) saturate(150%);"
    );

    return p;
}

function softBeep(freq){
    try{
        var C=window.AudioContext||window.webkitAudioContext;
        if(!C)return;

        var ctx=new C();
        var osc=ctx.createOscillator();
        var gain=ctx.createGain();

        osc.type="sine";
        osc.frequency.value=freq||420;

        gain.gain.setValueAtTime(.0001,ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.018,ctx.currentTime+.008);
        gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.07);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime+.08);

        setTimeout(function(){
            try{ctx.close()}catch(e){}
        },150);
    }catch(e){}
}


/* =========================================
   DRAG SYSTEM
========================================= */

function makeDraggable(element,handle){

    if(!element||!handle)return;

    handle.style.cursor="grab";
    handle.style.touchAction="none";
    handle.style.userSelect="none";

    var active=false;
    var pointerId=null;
    var sx=0;
    var sy=0;
    var ox=0;
    var oy=0;

    function down(e){

        if(e.button!==undefined&&e.button!==0)return;

        if(
            e.target&&
            e.target.closest&&
            e.target.closest("button,input,textarea,select,a")
        ){
            return;
        }

        var r=element.getBoundingClientRect();

        active=true;
        pointerId=e.pointerId;

        sx=e.clientX;
        sy=e.clientY;

        ox=r.left;
        oy=r.top;

        handle.style.cursor="grabbing";

        try{
            handle.setPointerCapture(pointerId);
        }catch(err){}

        e.preventDefault();
    }

    function move(e){

        if(!active||e.pointerId!==pointerId)return;

        var nx=ox+(e.clientX-sx);
        var ny=oy+(e.clientY-sy);

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
        element.style.right="auto";
        element.style.bottom="auto";
        element.style.transform="none";

        e.preventDefault();
    }

    function up(e){

        if(pointerId!==null&&e.pointerId!==pointerId)return;

        active=false;
        pointerId=null;

        handle.style.cursor="grab";
    }

    handle.addEventListener("pointerdown",down);
    d.addEventListener("pointermove",move,{passive:false});
    d.addEventListener("pointerup",up);
    d.addEventListener("pointercancel",up);

    cleanups.push(function(){
        handle.removeEventListener("pointerdown",down);
        d.removeEventListener("pointermove",move);
        d.removeEventListener("pointerup",up);
        d.removeEventListener("pointercancel",up);
    });
}


/* =========================================
   WINDOW CONTROLS
========================================= */

function minimize(){

    if(!box)return;

    minimized=!minimized;

    var content=box.querySelector("#oval-content");

    if(content){
        content.style.display=minimized?"none":"block";
    }

    if(minimized){
        maximized=false;
        box.style.width="360px";
        box.style.height="62px";
        box.style.borderRadius="20px";
    }else{
        box.style.width=maximized?"94vw":"min(780px,92vw)";
        box.style.height=maximized?"86vh":"min(585px,76vh)";
        box.style.borderRadius=maximized?"25px":"30px";
    }
}

function maximize(){

    if(!box)return;

    maximized=!maximized;
    minimized=false;

    var content=box.querySelector("#oval-content");

    if(content){
        content.style.display="block";
    }

    if(maximized){
        box.style.left="50%";
        box.style.top="50%";
        box.style.width="94vw";
        box.style.height="86vh";
        box.style.transform="translate(-50%,-50%)";
        box.style.borderRadius="25px";
    }else{
        box.style.left="50%";
        box.style.top="50%";
        box.style.width="min(780px,92vw)";
        box.style.height="min(585px,76vh)";
        box.style.transform="translate(-50%,-50%)";
        box.style.borderRadius="30px";
    }
}

function close(){
    stopAll();
    stopGame();

    if(box){

        box.style.opacity="0";
        box.style.transform="translate(-50%,-50%) scale(.94)";

        later(function(){

            if(box){
                box.remove();
                box=null;
            }

        },220);
    }
}

function windowControls(){

    var wrap=d.createElement("div");

    css(
        wrap,
        "display:flex;"+
        "gap:6px;"+
        "align-items:center;"+
        "margin-left:auto;"
    );

    var mn=makeButton(
        "−",
        minimize,
        "width:39px;height:32px;padding:0;border-radius:10px;font-size:18px;"
    );

    var mx=makeButton(
        maximized?"⧉":"□",
        maximize,
        "width:39px;height:32px;padding:0;border-radius:10px;font-size:12px;"
    );

    var cl=makeButton(
        "×",
        close,
        "width:39px;height:32px;padding:0;border-radius:10px;font-size:18px;"
    );

    wrap.appendChild(mn);
    wrap.appendChild(mx);
    wrap.appendChild(cl);

    return wrap;
}


/* =========================================
   WINDOW
========================================= */

function createWindow(title,subtitle,backFn){

    stopGame();
    cleanupView();

    if(box){
        box.remove();
        box=null;
    }

    box=makePanel();

    css(
        box,
        "position:absolute;"+
        "left:50%;"+
        "top:50%;"+
        "transform:translate(-50%,-50%) scale(.94);"+
        "width:min(780px,92vw);"+
        "height:min(585px,76vh);"+
        "min-height:420px;"+
        "overflow:hidden;"+
        "opacity:0;"+
        "pointer-events:auto;"+
        "border-radius:30px;"+
        "transition:opacity .28s ease,transform .4s cubic-bezier(.16,.85,.18,1),width .3s ease,height .3s ease;"+
        "outline:1px solid rgba(255,255,255,.035);"
    );

    var glow=d.createElement("div");

    css(
        glow,
        "position:absolute;"+
        "inset:-35%;"+
        "pointer-events:none;"+
        "background:"+
        "radial-gradient(circle at 84% 8%,rgba(255,200,90,.14),transparent 24%),"+
        "radial-gradient(circle at 8% 92%,rgba(120,165,255,.1),transparent 26%);"+
        "filter:blur(18px);"
    );

    box.appendChild(glow);

    var bar=d.createElement("div");

    css(
        bar,
        "position:relative;"+
        "z-index:5;"+
        "height:62px;"+
        "display:flex;"+
        "align-items:center;"+
        "padding:0 13px 0 16px;"+
        "background:linear-gradient(180deg,rgba(255,255,255,.1),rgba(255,255,255,.025));"+
        "border-bottom:1px solid rgba(255,255,255,.1);"+
        "touch-action:none;"+
        "user-select:none;"
    );

    var grip=d.createElement("div");

    css(
        grip,
        "position:absolute;"+
        "left:50%;"+
        "top:8px;"+
        "transform:translateX(-50%);"+
        "width:76px;"+
        "height:5px;"+
        "border-radius:999px;"+
        "background:linear-gradient(90deg,rgba(255,255,255,.15),rgba(255,255,255,.48),rgba(255,255,255,.15));"+
        "box-shadow:0 0 10px rgba(255,255,255,.06);"
    );

    bar.appendChild(grip);

    if(backFn){

        var back=makeButton(
            "‹",
            backFn,
            "width:41px;height:34px;padding:0;font-size:23px;border-radius:11px;margin-right:11px;"
        );

        bar.appendChild(back);
    }

    var titleBox=d.createElement("div");

    titleBox.innerHTML=
        "<div style='font-weight:780;font-size:15px;letter-spacing:-.02em'>"+
        esc(title)+
        "</div>"+
        "<div style='font-size:9px;color:rgba(255,255,255,.42);margin-top:3px;letter-spacing:.12em;text-transform:uppercase'>"+
        esc(subtitle||"")+
        "</div>";

    bar.appendChild(titleBox);
    bar.appendChild(windowControls());

    box.appendChild(bar);

    var content=d.createElement("div");

    content.id="oval-content";

    css(
        content,
        "position:relative;"+
        "z-index:2;"+
        "height:calc(100% - 62px);"+
        "overflow:auto;"+
        "padding:22px;"+
        "scrollbar-width:thin;"
    );

    box.appendChild(content);

    root.appendChild(box);

    makeDraggable(box,bar);

    later(function(){

        if(!box)return;

        box.style.opacity="1";

        box.style.transform=
            maximized?
            "translate(-50%,-50%)":
            "translate(-50%,-50%) scale(1)";

    },20);

    return content;
}


/* =========================================
   HOME
========================================= */

function goHome(){
    home();
}

function makeCard(icon,title,sub,fn){

    var b=makeButton(
        "<div style='font-size:27px;margin-bottom:11px;filter:drop-shadow(0 5px 10px rgba(0,0,0,.28))'>"+
        icon+
        "</div>"+
        "<div style='font-size:14px;font-weight:850;letter-spacing:-.01em'>"+
        esc(title)+
        "</div>"+
        "<div style='font-size:10px;color:rgba(255,255,255,.47);margin-top:6px;font-weight:500'>"+
        esc(sub)+
        "</div>",
        fn,
        "text-align:left;min-height:115px;flex:1 1 185px;padding:18px;position:relative;overflow:hidden;background:linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.03));"
    );

    return b;
}

function home(){

    var content=createWindow(
        "Oval",
        "moonlight command center"
    );

    var hero=d.createElement("div");

    css(
        hero,
        "position:relative;"+
        "overflow:hidden;"+
        "padding:21px 22px;"+
        "margin-bottom:15px;"+
        "border-radius:25px;"+
        "border:1px solid rgba(255,255,255,.16);"+
        "background:"+
        "radial-gradient(circle at 87% 18%,rgba(255,204,100,.19),transparent 26%),"+
        "radial-gradient(circle at 5% 100%,rgba(123,164,255,.1),transparent 28%),"+
        "linear-gradient(135deg,rgba(255,255,255,.105),rgba(255,255,255,.025));"+
        "box-shadow:inset 0 1px rgba(255,255,255,.13),0 13px 35px rgba(0,0,0,.18);"
    );

    hero.innerHTML=
        "<div style='font-size:10px;color:rgba(255,255,255,.4);letter-spacing:.17em;text-transform:uppercase;font-weight:800'>"+
        "Moonlight Command Center"+
        "</div>"+
        "<div style='font-size:31px;font-weight:900;letter-spacing:-.055em;margin-top:7px'>Oval</div>"+
        "<div style='font-size:11px;color:rgba(255,255,255,.53);margin-top:6px;max-width:70%;line-height:1.55'>"+
        "Sounds, games and browser tools wrapped inside a small glass interface."+
        "</div>"+
        "<div style='display:flex;align-items:center;gap:7px;margin-top:15px;font-size:9px;color:rgba(255,255,255,.4);letter-spacing:.1em'>"+
        "<i style='width:6px;height:6px;border-radius:50%;background:#a7efb7;box-shadow:0 0 12px #a7efb7'></i>"+
        "READY"+
        "<span style='opacity:.5'>•</span>"+
        "OVAL EDITION"+
        "</div>"+
        "<div style='position:absolute;right:28px;top:23px;width:70px;height:70px;border-radius:50%;background:radial-gradient(circle at 34% 29%,#fff7cd,#ffc653 45%,#ec7b25);box-shadow:0 0 35px rgba(255,186,68,.27)'></div>";

    content.appendChild(hero);

    var grid=d.createElement("div");

    css(
        grid,
        "display:grid;"+
        "grid-template-columns:repeat(2,minmax(0,1fr));"+
        "gap:11px;"
    );

    grid.appendChild(
        makeCard(
            "🎵",
            "Soundboard",
            "7 original sounds",
            soundboard
        )
    );

    grid.appendChild(
        makeCard(
            "✦",
            "Games",
            "Six mini games",
            games
        )
    );

    grid.appendChild(
        makeCard(
            "☄",
            "More Games",
            "Expanded arcade",
            moreGames
        )
    );

    grid.appendChild(
        makeCard(
            "⌘",
            "Tools",
            "Browser utilities",
            tools
        )
    );

    grid.appendChild(
        makeCard(
            "⚙",
            "Settings",
            "Hotkeys & preferences",
            settings
        )
    );

    content.appendChild(grid);

    var footer=d.createElement("div");

    footer.textContent=
        "☾   •   ✦   •   ☀   •   Oval";

    css(
        footer,
        "text-align:center;"+
        "font-size:9px;"+
        "color:rgba(255,255,255,.24);"+
        "letter-spacing:.18em;"+
        "margin-top:17px;"
    );

    content.appendChild(footer);
}


/* =========================================
   SOUNDBOARD
========================================= */

function soundboard(){

    var content=createWindow(
        "Soundboard",
        "original Oval audio",
        goHome
    );

    var controls=d.createElement("div");

    css(
        controls,
        "display:flex;"+
        "gap:7px;"+
        "flex-wrap:wrap;"+
        "margin-bottom:12px;"
    );

    var stop=makeButton(
        "■ Stop All",
        stopAll
    );

    var loopBtn=makeButton(
        "↻ Loop: OFF",
        function(){

            loopState=!loopState;

            loopBtn.innerHTML=
                "↻ Loop: "+
                (loopState?"ON":"OFF");

            playing.forEach(function(a){

                try{
                    a.loop=loopState;
                }catch(e){}
            });
        }
    );

    var rateBtn=makeButton(
        "1×",
        function(){

            if(rate===1)rate=1.25;
            else if(rate===1.25)rate=1.5;
            else if(rate===1.5)rate=.75;
            else rate=1;

            rateBtn.innerHTML=rate+"×";

            playing.forEach(function(a){

                try{
                    a.playbackRate=rate;
                }catch(e){}
            });
        }
    );

    controls.appendChild(stop);
    controls.appendChild(loopBtn);
    controls.appendChild(rateBtn);

    content.appendChild(controls);

    var list=d.createElement("div");

    css(
        list,
        "display:grid;"+
        "grid-template-columns:repeat(2,minmax(0,1fr));"+
        "gap:9px;"
    );

    sounds.forEach(function(s,i){

        var card=makeCard(
            s[0],
            s[1],
            "Play sound "+(i+1),
            function(){

                var a=new Audio(s[2]);

                a.preload="auto";
                a.playbackRate=rate;
                a.loop=loopState;

                playing.push(a);

                a.onended=function(){

                    playing=playing.filter(function(x){
                        return x!==a;
                    });
                };

                a.play().catch(function(){

                    playing=playing.filter(function(x){
                        return x!==a;
                    });
                });

                softBeep(390);
            }
        );

        list.appendChild(card);
    });

    content.appendChild(list);
}


/* =========================================
   GAMES MENU
========================================= */

function games(){

    var content=createWindow(
        "Games",
        "mini arcade",
        goHome
    );

    var grid=d.createElement("div");

    css(
        grid,
        "display:grid;"+
        "grid-template-columns:repeat(2,minmax(0,1fr));"+
        "gap:10px;"
    );

    grid.appendChild(
        makeCard("🐦","Flappy Bird","Tap / Space",flappy)
    );

    grid.appendChild(
        makeCard("⭕","Tic-Tac-Toe","You vs bot",ticTacToe)
    );

    grid.appendChild(
        makeCard("🐍","Snake","Arrow keys / WASD",snake)
    );

    grid.appendChild(
        makeCard("🔴","Connect Four","You vs bot",connectFour)
    );

    grid.appendChild(
        makeCard("🏓","Pong","Mouse / touch",pong)
    );

    grid.appendChild(
        makeCard("🔢","2048","Arrow keys / WASD",game2048)
    );

    content.appendChild(grid);
}


/* =========================================
   GAME WINDOW
========================================= */

function gameWindow(title,sub,markup,setup){

    var content=createWindow(
        title,
        sub,
        games
    );

    var area=d.createElement("div");

    css(
        area,
        "height:100%;"+
        "display:flex;"+
        "flex-direction:column;"+
        "align-items:center;"+
        "justify-content:center;"
    );

    area.innerHTML=markup;

    content.appendChild(area);

    if(setup)setup(area);

    return area;
}


/* =========================================
   FLAPPY BIRD
========================================= */

function flappy(){

    gameWindow(
        "Flappy Bird",
        "tap to fly",
        "<canvas width='560' height='360' style='width:min(100%,560px);height:auto;border-radius:20px;background:#080d19;border:1px solid rgba(255,255,255,.14);box-shadow:0 22px 55px rgba(0,0,0,.3);touch-action:none'></canvas>"+
        "<div style='font-size:10px;color:rgba(255,255,255,.45);margin-top:9px'>Space / click / tap</div>",
        function(area){

            var cv=area.querySelector("canvas");
            var ctx=cv.getContext("2d");

            var birdX=90;
            var birdY=180;
            var velocity=0;
            var score=0;
            var dead=false;
            var pipeX=570;
            var gapY=150;
            var raf;

            function jump(){

                if(dead){

                    birdY=180;
                    velocity=0;
                    score=0;
                    pipeX=570;
                    gapY=150;
                    dead=false;
                    return;
                }

                velocity=-7;
            }

            function key(e){

                if(
                    e.code==="Space"||
                    e.code==="ArrowUp"
                ){

                    e.preventDefault();
                    jump();
                }
            }

            d.addEventListener("keydown",key,true);

            cv.addEventListener(
                "pointerdown",
                function(){
                    jump();
                }
            );

            function draw(){

                ctx.clearRect(0,0,560,360);

                var bg=ctx.createLinearGradient(0,0,0,360);

                bg.addColorStop(0,"#121d37");
                bg.addColorStop(1,"#060914");

                ctx.fillStyle=bg;
                ctx.fillRect(0,0,560,360);

                ctx.fillStyle="rgba(255,216,132,.92)";
                ctx.beginPath();
                ctx.arc(475,62,28,0,Math.PI*2);
                ctx.fill();

                ctx.fillStyle="#e8efff";

                ctx.beginPath();
                ctx.arc(birdX,birdY,13,0,Math.PI*2);
                ctx.fill();

                ctx.fillStyle="#7e8fae";

                ctx.fillRect(
                    pipeX,
                    0,
                    46,
                    gapY-68
                );

                ctx.fillRect(
                    pipeX,
                    gapY+68,
                    46,
                    360
                );

                ctx.fillStyle="#fff";
                ctx.font="800 22px system-ui";
                ctx.fillText(score,18,31);

                if(dead){

                    ctx.fillStyle="rgba(0,0,0,.46)";
                    ctx.fillRect(0,0,560,360);

                    ctx.fillStyle="#fff";
                    ctx.textAlign="center";

                    ctx.font="800 26px system-ui";
                    ctx.fillText(
                        "Game Over",
                        280,
                        172
                    );

                    ctx.font="12px system-ui";
                    ctx.fillText(
                        "Tap to restart",
                        280,
                        194
                    );

                    ctx.textAlign="left";
                }
            }

            function tick(){

                if(!box||!box.contains(cv))
                    return;

                if(!dead){

                    velocity+=.33;
                    birdY+=velocity;

                    pipeX-=2.8;

                    if(pipeX<-60){

                        pipeX=570;
                        gapY=110+Math.random()*100;

                        score++;
                    }

                    if(
                        birdX+13>pipeX&&
                        birdX-13<pipeX+46&&
                        (
                            birdY-13<gapY-68||
                            birdY+13>gapY+68
                        )
                    ){
                        dead=true;
                    }

                    if(
                        birdY<0||
                        birdY>360
                    ){
                        dead=true;
                    }
                }

                draw();

                raf=requestAnimationFrame(tick);
            }

            gameCleanup=function(){

                cancelAnimationFrame(raf);

                d.removeEventListener(
                    "keydown",
                    key,
                    true
                );
            };

            tick();
        }
    );
}


/* =========================================
   TIC TAC TOE
========================================= */

function ticTacToe(){

    gameWindow(
        "Tic-Tac-Toe",
        "you vs bot",
        "<div id='ttt-grid' style='display:grid;grid-template-columns:repeat(3,90px);gap:8px'></div>"+
        "<div id='ttt-status' style='margin-top:14px;font-size:11px;color:rgba(255,255,255,.5)'>Your turn</div>",
        function(area){

            var grid=area.querySelector("#ttt-grid");
            var status=area.querySelector("#ttt-status");

            var board=Array(9).fill("");
            var finished=false;

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

            function empty(){

                return board
                    .map(function(v,i){
                        return v?null:i;
                    })
                    .filter(function(v){
                        return v!==null;
                    });
            }

            function render(){

                grid.innerHTML="";

                board.forEach(function(v,i){

                    var b=makeButton(
                        v||"·",
                        function(){

                            if(finished||board[i])
                                return;

                            board[i]="X";

                            render();

                            if(win("X")){

                                finished=true;
                                status.textContent="You win.";
                                return;
                            }

                            if(!empty().length){

                                finished=true;
                                status.textContent="Draw.";
                                return;
                            }

                            status.textContent="Bot thinking…";

                            later(bot,260);
                        },
                        "width:90px;height:90px;padding:0;font-size:29px;font-weight:900;"
                    );

                    grid.appendChild(b);
                });
            }

            function bot(){

                if(finished)return;

                var free=empty();

                if(!free.length)return;

                var pick=free[
                    Math.floor(
                        Math.random()*free.length
                    )
                ];

                /* Try to win. */

                for(var i=0;i<free.length;i++){

                    board[free[i]]="O";

                    if(win("O")){

                        pick=free[i];
                        board[free[i]]="";
                        break;
                    }

                    board[free[i]]="";
                }

                /* Try to block. */

                if(
                    board[pick]===""&&
                    !win("O")
                ){

                    for(var j=0;j<free.length;j++){

                        board[free[j]]="X";

                        if(win("X")){

                            pick=free[j];
                            board[free[j]]="";
                            break;
                        }

                        board[free[j]]="";
                    }
                }

                board[pick]="O";

                render();

                if(win("O")){

                    finished=true;
                    status.textContent="Bot wins.";
                    return;
                }

                if(!empty().length){

                    finished=true;
                    status.textContent="Draw.";
                    return;
                }

                status.textContent="Your turn";
            }

            render();
        }
    );
}


/* =========================================
   SNAKE
========================================= */

function snake(){

    gameWindow(
        "Snake",
        "arrow keys / WASD",
        "<canvas width='400' height='400' style='width:min(100%,400px);height:auto;border-radius:20px;background:#070b14;border:1px solid rgba(255,255,255,.14);touch-action:none'></canvas>"+
        "<div style='font-size:10px;color:rgba(255,255,255,.45);margin-top:8px'>Arrow keys / WASD</div>",
        function(area){

            var cv=area.querySelector("canvas");
            var ctx=cv.getContext("2d");

            var snakeBody=[
                [10,10],
                [9,10],
                [8,10]
            ];

            var dir=[1,0];
            var next=[1,0];

            var food=[
                15,
                15
            ];

            var dead=false;
            var timer;

            function key(e){

                var k=e.key.toLowerCase();

                var n=null;

                if(k==="arrowup"||k==="w")
                    n=[0,-1];

                if(k==="arrowdown"||k==="s")
                    n=[0,1];

                if(k==="arrowleft"||k==="a")
                    n=[-1,0];

                if(k==="arrowright"||k==="d")
                    n=[1,0];

                if(
                    n&&
                    !(
                        n[0]===-dir[0]&&
                        n[1]===-dir[1]
                    )
                ){
                    next=n;
                }
            }

            d.addEventListener(
                "keydown",
                key
            );

            function draw(){

                ctx.fillStyle="#0a0d15";
                ctx.fillRect(0,0,400,400);

                ctx.fillStyle="#ffbd55";

                ctx.fillRect(
                    food[0]*20+4,
                    food[1]*20+4,
                    12,
                    12
                );

                ctx.fillStyle="#dce5f7";

                snakeBody.forEach(function(p){

                    ctx.fillRect(
                        p[0]*20+3,
                        p[1]*20+3,
                        14,
                        14
                    );
                });

                if(dead){

                    ctx.fillStyle="rgba(0,0,0,.46)";
                    ctx.fillRect(
                        0,
                        0,
                        400,
                        400
                    );

                    ctx.fillStyle="#fff";
                    ctx.textAlign="center";
                    ctx.font="800 24px system-ui";

                    ctx.fillText(
                        "Game Over",
                        200,
                        190
                    );

                    ctx.font="12px system-ui";

                    ctx.fillText(
                        "Open Snake again to restart",
                        200,
                        213
                    );

                    ctx.textAlign="left";
                }
            }

            function tick(){

                if(!box||!box.contains(cv))
                    return;

                if(dead){

                    draw();
                    return;
                }

                if(
                    next[0]!==-dir[0]||
                    next[1]!==-dir[1]
                ){
                    dir=next;
                }

                var head=[
                    snakeBody[0][0]+dir[0],
                    snakeBody[0][1]+dir[1]
                ];

                var hitWall=
                    head[0]<0||
                    head[0]>=20||
                    head[1]<0||
                    head[1]>=20;

                var hitSelf=snakeBody.some(
                    function(p){
                        return(
                            p[0]===head[0]&&
                            p[1]===head[1]
                        );
                    }
                );

                if(hitWall||hitSelf){

                    dead=true;
                    draw();
                    return;
                }

                snakeBody.unshift(head);

                if(
                    head[0]===food[0]&&
                    head[1]===food[1]
                ){

                    do{

                        food=[
                            Math.floor(
                                Math.random()*20
                            ),
                            Math.floor(
                                Math.random()*20
                            )
                        ];

                    }while(
                        snakeBody.some(function(p){
                            return(
                                p[0]===food[0]&&
                                p[1]===food[1]
                            );
                        })
                    );

                }else{

                    snakeBody.pop();
                }

                draw();

                timer=setTimeout(
                    tick,
                    100
                );
            }

            gameCleanup=function(){

                clearTimeout(timer);
                d.removeEventListener(
                    "keydown",
                    key
                );
            };

            tick();
        }
    );
}


/* =========================================
   CONNECT FOUR
========================================= */

function connectFour(){

    gameWindow(
        "Connect Four",
        "you vs bot",
        "<div id='c4-board' style='display:grid;grid-template-columns:repeat(7,44px);gap:5px;padding:12px;border-radius:19px;background:rgba(34,46,76,.5);border:1px solid rgba(255,255,255,.1)'></div>"+
        "<div id='c4-status' style='font-size:11px;color:rgba(255,255,255,.5);margin-top:11px'>Your turn</div>",
        function(area){

            var boardEl=area.querySelector("#c4-board");
            var status=area.querySelector("#c4-status");

            var board=Array(42).fill("");
            var done=false;

            function win(p){

                for(
                    var r=0;
                    r<6;
                    r++
                ){

                    for(
                        var c=0;
                        c<7;
                        c++
                    ){

                        var i=r*7+c;

                        if(
                            c<4&&
                            board[i]===p&&
                            board[i+1]===p&&
                            board[i+2]===p&&
                            board[i+3]===p
                        )return true;

                        if(
                            r<3&&
                            board[i]===p&&
                            board[i+7]===p&&
                            board[i+14]===p&&
                            board[i+21]===p
                        )return true;
                    }
                }

                return false;
            }

            function drop(col,p){

                for(
                    var r=5;
                    r>=0;
                    r--
                ){

                    var i=r*7+col;

                    if(!board[i]){

                        board[i]=p;

                        return true;
                    }
                }

                return false;
            }

            function render(){

                boardEl.innerHTML="";

                board.forEach(function(v,i){

                    var b=makeButton(
                        v==="X"?"●":
                        v==="O"?"○":
                        "",
                        function(){

                            if(done)return;

                            var col=i%7;

                            if(!drop(col,"X"))
                                return;

                            render();

                            if(win("X")){

                                done=true;
                                status.textContent="You win.";
                                return;
                            }

                            status.textContent=
                                "Bot thinking…";

                            later(bot,280);
                        },
                        "width:44px;height:44px;padding:0;border-radius:50%;font-size:25px;"
                    );

                    boardEl.appendChild(b);
                });
            }

            function bot(){

                if(done)return;

                var cols=[
                    0,1,2,3,4,5,6
                ].filter(function(c){
                    return !board[c];
                });

                if(!cols.length){

                    done=true;
                    status.textContent="Draw.";
                    return;
                }

                var choice=
                    cols[
                        Math.floor(
                            Math.random()*cols.length
                        )
                    ];

                drop(choice,"O");
                render();

                if(win("O")){

                    done=true;
                    status.textContent=
                        "Bot wins.";

                    return;
                }

                status.textContent=
                    "Your turn";
            }

            render();
        }
    );
}


/* =========================================
   PONG
========================================= */

function pong(){

    gameWindow(
        "Pong",
        "mouse / touch",
        "<canvas width='560' height='320' style='width:min(100%,560px);height:auto;border-radius:20px;background:#060a12;border:1px solid rgba(255,255,255,.14);touch-action:none'></canvas>",
        function(area){

            var cv=area.querySelector("canvas");
            var ctx=cv.getContext("2d");

            var paddle=135;
            var x=280;
            var y=160;
            var vx=3.1;
            var vy=2.2;
            var raf;

            function movePaddle(clientY){

                var r=cv.getBoundingClientRect();

                paddle=
                    (clientY-r.top)*
                    (320/r.height)-
                    27;

                paddle=Math.max(
                    0,
                    Math.min(
                        266,
                        paddle
                    )
                );
            }

            cv.addEventListener(
                "pointermove",
                function(e){
                    movePaddle(e.clientY);
                }
            );

            function tick(){

                if(!box||!box.contains(cv))
                    return;

                x+=vx;
                y+=vy;

                if(y<7||y>313)
                    vy*=-1;

                if(
                    x<32&&
                    y>paddle&&
                    y<paddle+54
                ){
                    vx=Math.abs(vx);
                }

                if(x>528){

                    vx=-Math.abs(vx);
                }

                if(x<0){

                    x=280;
                    y=160;
                    vx=3.1;
                    vy=2.2;
                }

                ctx.clearRect(
                    0,
                    0,
                    560,
                    320
                );

                ctx.fillStyle="#dfe8f9";

                ctx.fillRect(
                    14,
                    paddle,
                    10,
                    54
                );

                ctx.fillRect(
                    536,
                    y-27,
                    10,
                    54
                );

                ctx.beginPath();

                ctx.arc(
                    x,
                    y,
                    7,
                    0,
                    Math.PI*2
                );

                ctx.fill();

                ctx.fillStyle=
                    "rgba(255,255,255,.07)";

                ctx.fillRect(
                    279,
                    0,
                    2,
                    320
                );

                raf=requestAnimationFrame(
                    tick
                );
            }

            gameCleanup=function(){
                cancelAnimationFrame(raf);
            };

            tick();
        }
    );
}


/* =========================================
   2048
========================================= */

function game2048(){

    gameWindow(
        "2048",
        "arrow keys / WASD",
        "<div id='g2048' style='display:grid;grid-template-columns:repeat(4,70px);gap:7px'></div>"+
        "<div id='g2048score' style='font-size:11px;color:rgba(255,255,255,.48);margin-top:10px'>Score: 0</div>",
        function(area){

            var grid=area.querySelector(
                "#g2048"
            );

            var scoreEl=area.querySelector(
                "#g2048score"
            );

            var board=Array(16).fill(0);

            var score=0;

            board[0]=2;
            board[5]=2;

            function addTile(){

                var empty=board.map(
                    function(v,i){
                        return v?null:i;
                    }
                ).filter(
                    function(v){
                        return v!==null;
                    }
                );

                if(!empty.length)return;

                board[
                    empty[
                        Math.floor(
                            Math.random()*empty.length
                        )
                    ]
                ]=
                    Math.random()<.9?
                    2:
                    4;
            }

            function slide(row){

                var values=row.filter(
                    function(v){
                        return !!v;
                    }
                );

                for(
                    var i=0;
                    i<values.length-1;
                    i++
                ){

                    if(
                        values[i]===
                        values[i+1]
                    ){

                        values[i]*=2;
                        score+=values[i];

                        values.splice(
                            i+1,
                            1
                        );
                    }
                }

                while(values.length<4)
                    values.push(0);

                return values;
            }

            function render(){

                grid.innerHTML="";

                board.forEach(
                    function(v){

                        var cell=
                            d.createElement("div");

                        css(
                            cell,
                            "width:70px;"+
                            "height:70px;"+
                            "border-radius:15px;"+
                            "display:grid;"+
                            "place-items:center;"+
                            "border:1px solid rgba(255,255,255,.1);"+
                            "background:"+
                            (
                                v?
                                "rgba(255,192,87,.35)":
                                "rgba(255,255,255,.055)"
                            )+
                            ";"+
                            "font-size:21px;"+
                            "font-weight:900;"
                        );

                        cell.textContent=
                            v||"";

                        grid.appendChild(
                            cell
                        );
                    }
                );

                scoreEl.textContent=
                    "Score: "+score;
            }

            function move(e){

                var key=
                    e.key.toLowerCase();

                if(
                    ![
                        "arrowleft",
                        "arrowright",
                        "arrowup",
                        "arrowdown",
                        "a","d","w","s"
                    ].includes(key)
                ){
                    return;
                }

                e.preventDefault();

                var horizontal=
                    key==="arrowleft"||
                    key==="arrowright"||
                    key==="a"||
                    key==="d";

                var reverse=
                    key==="arrowright"||
                    key==="arrowdown"||
                    key==="d"||
                    key==="s";

                var old=
                    board.join(",");

                if(horizontal){

                    for(
                        var r=0;
                        r<4;
                        r++
                    ){

                        var row=
                            board.slice(
                                r*4,
                                r*4+4
                            );

                        if(reverse)
                            row.reverse();

                        row=slide(row);

                        if(reverse)
                            row.reverse();

                        for(
                            var c=0;
                            c<4;
                            c++
                        ){
                            board[
                                r*4+c
                            ]=row[c];
                        }
                    }

                }else{

                    for(
                        var c=0;
                        c<4;
                        c++
                    ){

                        var col=[
                            board[c],
                            board[4+c],
                            board[8+c],
                            board[12+c]
                        ];

                        if(reverse)
                            col.reverse();

                        col=slide(col);

                        if(reverse)
                            col.reverse();

                        for(
                            var r=0;
                            r<4;
                            r++
                        ){
                            board[
                                r*4+c
                            ]=col[r];
                        }
                    }
                }

                if(
                    board.join(",")!==
                    old
                ){
                    addTile();
                }

                render();
            }

            d.addEventListener(
                "keydown",
                move
            );

            gameCleanup=function(){

                d.removeEventListener(
                    "keydown",
                    move
                );
            };

            render();
        }
    );
}
/* =========================================
   MORE GAMES
========================================= */

function moreGames(){

    var content=createWindow(
        "More Games",
        "oval arcade",
        goHome
    );

    var intro=makePanel();

    css(
        intro,
        "padding:20px;"+
        "margin-bottom:12px;"+
        "position:relative;"+
        "overflow:hidden;"
    );

    intro.innerHTML=
        "<div style='font-size:29px'>☾ ✦ ☀</div>"+
        "<div style='font-size:20px;font-weight:850;margin-top:8px'>Oval Arcade</div>"+
        "<div style='font-size:10px;color:rgba(255,255,255,.46);margin-top:5px'>Extra small games built into the interface.</div>";

    content.appendChild(intro);

    var grid=d.createElement("div");

    css(
        grid,
        "display:grid;"+
        "grid-template-columns:repeat(2,minmax(0,1fr));"+
        "gap:10px;"
    );

    grid.appendChild(
        makeCard(
            "⚡",
            "Reaction",
            "Test your timing",
            reactionGame
        )
    );

    grid.appendChild(
        makeCard(
            "🧠",
            "Memory",
            "Match the pairs",
            memoryGame
        )
    );

    grid.appendChild(
        makeCard(
            "💣",
            "Mines",
            "Avoid the mine",
            minesGame
        )
    );

    grid.appendChild(
        makeCard(
            "🎯",
            "Aim",
            "Hit the target",
            aimGame
        )
    );

    content.appendChild(grid);
}


/* =========================================
   REACTION GAME
========================================= */

function reactionGame(){

    var content=createWindow(
        "Reaction",
        "timing test",
        moreGames
    );

    var panel=makePanel();

    css(
        panel,
        "height:100%;"+
        "display:grid;"+
        "place-items:center;"+
        "padding:22px;"
    );

    var area=d.createElement("button");

    area.textContent="Tap to start";

    css(
        area,
        "width:min(340px,90%);"+
        "height:160px;"+
        "border-radius:30px;"+
        "border:1px solid rgba(255,255,255,.16);"+
        "background:linear-gradient(145deg,#151b2b,#0d111b);"+
        "color:#fff;"+
        "font-size:22px;"+
        "font-weight:850;"+
        "cursor:pointer;"+
        "box-shadow:0 22px 60px rgba(0,0,0,.35);"
    );

    panel.appendChild(area);
    content.appendChild(panel);

    var waiting=false;
    var ready=false;
    var startTime=0;

    area.onclick=function(){

        if(ready){

            var time=
                Math.round(
                    performance.now()-startTime
                );

            area.textContent=
                time+" ms";

            ready=false;

            later(function(){
                area.textContent=
                    "Tap to start";
                area.style.background=
                    "linear-gradient(145deg,#151b2b,#0d111b)";
            },1000);

            return;
        }

        if(waiting)return;

        waiting=true;

        area.textContent=
            "Wait for the signal…";

        area.style.background=
            "linear-gradient(145deg,#151b2b,#0d111b)";

        later(function(){

            waiting=false;
            ready=true;
            startTime=performance.now();

            area.textContent=
                "CLICK!";

            area.style.background=
                "linear-gradient(145deg,#ffd46a,#db7626)";

        },700+Math.random()*2200);
    };
}


/* =========================================
   MEMORY
========================================= */

function memoryGame(){

    var content=createWindow(
        "Memory",
        "match pairs",
        moreGames
    );

    var values=[
        "☀","☾","✦","★",
        "☀","☾","✦","★"
    ].sort(function(){
        return Math.random()-.5;
    });

    var grid=d.createElement("div");

    css(
        grid,
        "display:grid;"+
        "grid-template-columns:repeat(4,70px);"+
        "gap:8px;"+
        "justify-content:center;"
    );

    content.appendChild(grid);

    var opened=[];
    var complete=0;

    values.forEach(
        function(value,index){

            var cardBtn=makeButton(
                "?",
                function(){

                    if(
                        opened.some(
                            function(x){
                                return x.index===index;
                            }
                        )
                    )return;

                    if(opened.length>=2)
                        return;

                    cardBtn.textContent=
                        value;

                    opened.push({
                        index:index,
                        value:value,
                        button:cardBtn
                    });

                    if(opened.length===2){

                        if(
                            opened[0].value===
                            opened[1].value
                        ){

                            complete+=2;
                            opened=[];

                            if(complete===8){

                                later(
                                    function(){
                                        alert(
                                            "Memory complete!"
                                        );
                                    },
                                    100
                                );
                            }

                        }else{

                            var pair=
                                opened.slice();

                            opened=[];

                            later(
                                function(){

                                    pair.forEach(
                                        function(x){
                                            x.button.textContent="?";
                                        }
                                    );

                                },
                                550
                            );
                        }
                    }
                },
                "width:70px;height:70px;padding:0;font-size:24px;"
            );

            grid.appendChild(cardBtn);
        }
    );
}


/* =========================================
   MINES
========================================= */

function minesGame(){

    var content=createWindow(
        "Mines",
        "avoid the mine",
        moreGames
    );

    var grid=d.createElement("div");

    css(
        grid,
        "display:grid;"+
        "grid-template-columns:repeat(5,55px);"+
        "gap:7px;"+
        "justify-content:center;"
    );

    content.appendChild(grid);

    var mine=
        Math.floor(
            Math.random()*25
        );

    var finished=false;

    for(
        var i=0;
        i<25;
        i++
    ){

        (function(index){

            var b=makeButton(
                "·",
                function(){

                    if(finished)return;

                    if(index===mine){

                        finished=true;

                        b.textContent="💥";

                        alert("Mine!");

                    }else{

                        b.textContent="✦";
                        b.style.opacity=".6";
                    }
                },
                "width:55px;height:55px;padding:0;font-size:20px;"
            );

            grid.appendChild(b);

        })(i);
    }
}


/* =========================================
   AIM
========================================= */

function aimGame(){

    var content=createWindow(
        "Aim",
        "hit the target",
        moreGames
    );

    var area=makePanel();

    css(
        area,
        "position:relative;"+
        "height:100%;"+
        "min-height:330px;"+
        "overflow:hidden;"
    );

    content.appendChild(area);

    var target=d.createElement("button");

    css(
        target,
        "position:absolute;"+
        "width:56px;"+
        "height:56px;"+
        "border-radius:50%;"+
        "border:1px solid rgba(255,255,255,.45);"+
        "background:radial-gradient(circle,#fff3c4 0 12%,#ffb048 13% 50%,#a6532b 51%);"+
        "box-shadow:0 0 30px rgba(255,180,70,.35);"+
        "cursor:pointer;"
    );

    area.appendChild(target);

    var score=0;

    function place(){

        var maxX=
            Math.max(
                8,
                area.clientWidth-68
            );

        var maxY=
            Math.max(
                8,
                area.clientHeight-68
            );

        target.style.left=
            Math.random()*maxX+
            "px";

        target.style.top=
            Math.random()*maxY+
            "px";
    }

    target.onclick=function(){

        score++;

        target.title=
            "Score: "+score;

        softBeep(520);

        place();
    };

    later(
        place,
        20
    );
}


/* =========================================
   TOOLS
========================================= */

function tools(){

    var content=createWindow(
        "Tools",
        "browser utilities",
        goHome
    );

    var grid=d.createElement("div");

    css(
        grid,
        "display:grid;"+
        "grid-template-columns:repeat(2,minmax(0,1fr));"+
        "gap:10px;"
    );

    grid.appendChild(
        makeCard(
            "🌐",
            "Website Name Disguiser",
            "Change title + favicon",
            disguiser
        )
    );

    grid.appendChild(
        makeCard(
            "✎",
            "Edit Page",
            "Toggle visual editing",
            editPage
        )
    );

    grid.appendChild(
        makeCard(
            "⌗",
            "Calculator",
            "Quick browser calculator",
            calculator
        )
    );

    content.appendChild(grid);

    var status=d.createElement("div");

    css(
        status,
        "margin-top:12px;"+
        "padding:13px 15px;"+
        "border-radius:16px;"+
        "background:rgba(255,255,255,.05);"+
        "border:1px solid rgba(255,255,255,.09);"+
        "font-size:11px;"+
        "color:rgba(255,255,255,.52);"
    );

    status.id="edit-status";

    status.textContent=
        "Edit Page: "+
        (editMode?"ON":"OFF");

    content.appendChild(status);
}


/* =========================================
   WEBSITE NAME DISGUISER
========================================= */

function disguiser(){

    var name=prompt(
        "Website name:",
        d.title||"Website"
    );

    if(name===null)
        return;

    d.title=name;

    var icon=prompt(
        "Favicon URL (optional):",
        ""
    );

    if(icon){

        var link=
            d.querySelector(
                'link[rel~="icon"]'
            )||
            d.createElement("link");

        link.rel="icon";
        link.href=icon;

        d.head.appendChild(link);
    }

    softBeep(520);
}


/* =========================================
   EDIT PAGE
========================================= */

function editPage(){

    editMode=!editMode;

    if(editMode){

        d.querySelectorAll(
            "body *"
        ).forEach(
            function(el){

                if(
                    root.contains(el)
                )return;

                el.contentEditable=true;
            }
        );

    }else{

        d.querySelectorAll(
            '[contenteditable="true"]'
        ).forEach(
            function(el){

                if(
                    root.contains(el)
                )return;

                el.contentEditable=false;
            }
        );
    }

    var status=
        d.getElementById(
            "edit-status"
        );

    if(status){

        status.textContent=
            "Edit Page: "+
            (editMode?"ON":"OFF");
    }

    softBeep(
        editMode?520:280
    );
}


/* =========================================
   CALCULATOR
========================================= */

function calculator(){

    var content=createWindow(
        "Calculator",
        "quick math",
        tools
    );

    var wrap=d.createElement("div");

    css(
        wrap,
        "max-width:370px;"+
        "margin:auto;"
    );

    var display=d.createElement("input");

    display.inputMode="decimal";
    display.placeholder="0";

    css(
        display,
        "width:100%;"+
        "padding:18px;"+
        "margin-bottom:10px;"+
        "border-radius:18px;"+
        "border:1px solid rgba(255,255,255,.14);"+
        "background:rgba(0,0,0,.23);"+
        "color:#fff;"+
        "font-size:25px;"+
        "font-weight:700;"+
        "text-align:right;"+
        "outline:none;"
    );

    wrap.appendChild(display);

    var grid=d.createElement("div");

    css(
        grid,
        "display:grid;"+
        "grid-template-columns:repeat(4,1fr);"+
        "gap:7px;"
    );

    [
        "7","8","9","÷",
        "4","5","6","×",
        "1","2","3","−",
        "0",".","C","+",
        "(" ,")","=","⌫"
    ].forEach(
        function(key){

            var b=makeButton(
                key,
                function(){

                    if(key==="C"){

                        display.value="";
                        return;
                    }

                    if(key==="⌫"){

                        display.value=
                            display.value.slice(
                                0,
                                -1
                            );

                        return;
                    }

                    if(key==="="){

                        try{

                            var expression=
                                display.value
                                .replace(/÷/g,"/")
                                .replace(/×/g,"*")
                                .replace(/−/g,"-");

                            if(
                                !/^[0-9+\-*/().\s]+$/
                                    .test(expression)
                            ){
                                throw new Error();
                            }

                            display.value=
                                Function(
                                    "return "+
                                    expression
                                )();

                        }catch(e){

                            display.value=
                                "Error";
                        }

                        return;
                    }

                    display.value+=key;
                },
                "padding:15px 5px;font-size:15px;"
            );

            grid.appendChild(b);
        }
    );

    wrap.appendChild(grid);
    content.appendChild(wrap);
}


/* =========================================
   KEYBINDS
========================================= */

function loadHotkey(){

    try{

        return JSON.parse(
            localStorage.getItem(
                HOTKEY_STORAGE
            )
        )||{
            code:"Escape",
            ctrl:false,
            alt:false,
            shift:false,
            meta:false
        };

    }catch(e){

        return{
            code:"Escape",
            ctrl:false,
            alt:false,
            shift:false,
            meta:false
        };
    }
}

function saveHotkey(data){

    try{

        localStorage.setItem(
            HOTKEY_STORAGE,
            JSON.stringify(data)
        );

        return true;

    }catch(e){

        return false;
    }
}

function keyName(code){

    var names={
        Escape:"Esc",
        Space:"Space",
        Enter:"Enter",
        Tab:"Tab",
        Backspace:"Backspace",
        Delete:"Delete",
        ArrowUp:"↑",
        ArrowDown:"↓",
        ArrowLeft:"←",
        ArrowRight:"→",
        ControlLeft:"Ctrl",
        ControlRight:"Ctrl",
        ShiftLeft:"Shift",
        ShiftRight:"Shift",
        AltLeft:"Alt",
        AltRight:"Alt",
        MetaLeft:"Cmd",
        MetaRight:"Cmd"
    };

    if(names[code])
        return names[code];

    if(/^Key[A-Z]$/.test(code))
        return code.slice(3);

    if(/^Digit[0-9]$/.test(code))
        return code.slice(5);

    return code||"Unknown";
}

function formatHotkey(data){

    var parts=[];

    if(data.ctrl)
        parts.push("Ctrl");

    if(data.alt)
        parts.push("Alt");

    if(data.shift)
        parts.push("Shift");

    if(data.meta)
        parts.push("Cmd");

    parts.push(
        keyName(data.code)
    );

    return parts.join(" + ");
}

function hideShow(){

    hidden=!hidden;

    if(hidden){

        stopAll();
        stopGame();

        root.style.display="none";

    }else{

        root.style.display="block";

        if(!box){
            home();
        }
    }
}

window.__ovalToggle=hideShow;

d.addEventListener(
    "keydown",
    function(e){

        var hotkey=loadHotkey();

        if(
            e.code===hotkey.code&&
            e.ctrlKey===!!hotkey.ctrl&&
            e.altKey===!!hotkey.alt&&
            e.shiftKey===!!hotkey.shift&&
            e.metaKey===!!hotkey.meta
        ){

            e.preventDefault();
            e.stopPropagation();

            hideShow();
        }

    },
    true
);


/* =========================================
   SETTINGS
========================================= */

function settings(){

    var content=createWindow(
        "Settings",
        "controls & preferences",
        goHome
    );

    var hotkeyPanel=makePanel();

    css(
        hotkeyPanel,
        "padding:19px;"+
        "margin-bottom:12px;"
    );

    hotkeyPanel.innerHTML=
        "<div style='font-size:14px;font-weight:800'>"+
        "⌨ Global Hotkey"+
        "</div>"+
        "<div style='font-size:10px;color:rgba(255,255,255,.47);margin-top:6px;line-height:1.55'>"+
        "Choose the shortcut that hides or restores Oval. The active sounds stop immediately when Oval is hidden."+
        "</div>";

    var row=d.createElement("div");

    css(
        row,
        "display:flex;"+
        "gap:8px;"+
        "align-items:center;"+
        "flex-wrap:wrap;"+
        "margin-top:15px;"
    );

    var current=loadHotkey();

    var label=d.createElement("div");

    label.textContent=
        formatHotkey(current);

    css(
        label,
        "padding:10px 13px;"+
        "min-width:100px;"+
        "text-align:center;"+
        "border-radius:12px;"+
        "background:rgba(255,255,255,.07);"+
        "border:1px solid rgba(255,255,255,.1);"+
        "font:700 11px ui-monospace,monospace;"
    );

    var change=makeButton(
        "⌨ Change",
        function(){

            label.textContent=
                "Press a key…";

            function listen(e){

                if(
                    [
                        "ControlLeft",
                        "ControlRight",
                        "AltLeft",
                        "AltRight",
                        "ShiftLeft",
                        "ShiftRight",
                        "MetaLeft",
                        "MetaRight"
                    ].includes(e.code)
                ){
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                current={
                    code:e.code,
                    ctrl:e.ctrlKey,
                    alt:e.altKey,
                    shift:e.shiftKey,
                    meta:e.metaKey
                };

                saveHotkey(current);

                label.textContent=
                    formatHotkey(
                        current
                    );

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
        }
    );

    var reset=makeButton(
        "Reset",
        function(){

            current={
                code:"Escape",
                ctrl:false,
                alt:false,
                shift:false,
                meta:false
            };

            saveHotkey(current);

            label.textContent=
                formatHotkey(current);
        }
    );

    row.appendChild(label);
    row.appendChild(change);
    row.appendChild(reset);

    hotkeyPanel.appendChild(row);
    content.appendChild(hotkeyPanel);

    var about=makePanel();

    css(
        about,
        "padding:19px;"
    );

    about.innerHTML=
        "<div style='font-size:14px;font-weight:800'>"+
        "☀ About Oval"+
        "</div>"+
        "<div style='font-size:11px;color:rgba(255,255,255,.48);line-height:1.7;margin-top:9px'>"+
        "<b style='color:#fff'>Creator: Henry</b>"+
        "<br><br>"+
        "The creator is not responsible for your actions."+
        "<br><br>"+
        "Moon • Stars • Sun"+
        "</div>";

    content.appendChild(about);
}


/* =========================================
   STARTUP ANIMATION
========================================= */

function startup(done){

    var scene=d.createElement("div");

    css(
        scene,
        "position:absolute;"+
        "inset:0;"+
        "display:grid;"+
        "place-items:center;"+
        "background:radial-gradient(circle at 50% 45%,rgba(34,47,83,.24),rgba(0,0,0,.8));"+
        "opacity:1;"+
        "transition:opacity .72s cubic-bezier(.2,.8,.2,1);"+
        "overflow:hidden;"+
        "pointer-events:auto;"
    );

    root.appendChild(scene);

    var stars=d.createElement("div");

    css(
        stars,
        "position:absolute;"+
        "inset:-40px;"+
        "opacity:.92;"+
        "background-image:"+
        "radial-gradient(circle,rgba(255,255,255,.82) 0 1px,transparent 1.5px),"+
        "radial-gradient(circle,rgba(255,214,139,.48) 0 1px,transparent 1.5px),"+
        "radial-gradient(circle,rgba(190,211,255,.42) 0 1px,transparent 1.5px);"+
        "background-size:71px 89px,127px 151px,181px 197px;"+
        "background-position:13px 21px,57px 31px,91px 7px;"+
        "animation:ovalStars 13s linear infinite;"
    );

    scene.appendChild(stars);

    var halo=d.createElement("div");

    css(
        halo,
        "position:absolute;"+
        "left:50%;"+
        "top:45%;"+
        "width:190px;"+
        "height:190px;"+
        "border-radius:50%;"+
        "transform:translate(-50%,-50%) scale(.12);"+
        "opacity:0;"+
        "background:radial-gradient(circle,rgba(255,193,76,.22),rgba(255,193,76,0) 69%);"+
        "filter:blur(2px);"+
        "transition:transform 1s cubic-bezier(.16,.9,.18,1),opacity .8s ease;"
    );

    scene.appendChild(halo);

    var moon=d.createElement("div");

    css(
        moon,
        "width:82px;"+
        "height:82px;"+
        "border-radius:50%;"+
        "position:absolute;"+
        "left:50%;"+
        "top:45%;"+
        "transform:translate(-50%,-50%) scale(.16);"+
        "background:radial-gradient(circle at 34% 29%,#eef2f8,#b6c0d1 56%,#69758a);"+
        "box-shadow:0 0 0 1px rgba(255,255,255,.2),0 0 45px rgba(176,197,232,.23);"+
        "transition:transform 1.05s cubic-bezier(.16,.9,.18,1),opacity .6s ease,background .75s ease,box-shadow .8s ease;"
    );

    scene.appendChild(moon);

    var craters=d.createElement("div");

    craters.innerHTML=
        "<i style='position:absolute;left:16px;top:17px;width:18px;height:18px;border-radius:50%;background:rgba(46,57,75,.2);box-shadow:25px 14px 0 2px rgba(46,57,75,.13),8px 41px 0 1px rgba(46,57,75,.14),44px 5px 0 1px rgba(46,57,75,.1)'></i>";

    css(
        craters,
        "position:absolute;"+
        "inset:0;"+
        "transition:opacity .35s ease;"
    );

    moon.appendChild(craters);

    var circleRing=d.createElement("div");

    css(
        circleRing,
        "position:absolute;"+
        "left:50%;"+
        "top:45%;"+
        "width:112px;"+
        "height:112px;"+
        "border-radius:50%;"+
        "transform:translate(-50%,-50%) scale(.5);"+
        "opacity:0;"+
        "border:1px solid rgba(255,255,255,.2);"+
        "box-shadow:0 0 40px rgba(255,255,255,.08),inset 0 0 30px rgba(255,255,255,.04);"+
        "transition:transform .8s cubic-bezier(.2,.8,.2,1),opacity .45s ease;"
    );

    scene.appendChild(circleRing);

    var flare=d.createElement("div");

    css(
        flare,
        "position:absolute;"+
        "left:50%;"+
        "top:45%;"+
        "width:4px;"+
        "height:4px;"+
        "border-radius:50%;"+
        "background:#fff;"+
        "transform:translate(-50%,-50%) scale(.1);"+
        "opacity:0;"+
        "box-shadow:0 0 70px 35px rgba(255,194,79,.48);"+
        "transition:transform .85s cubic-bezier(.18,.8,.16,1),opacity .45s ease;"
    );

    scene.appendChild(flare);

    var name=d.createElement("div");

    name.textContent="Oval";

    css(
        name,
        "position:absolute;"+
        "left:50%;"+
        "top:calc(45% + 71px);"+
        "transform:translate(-50%,14px);"+
        "font-size:21px;"+
        "font-weight:650;"+
        "letter-spacing:.34em;"+
        "padding-left:.34em;"+
        "opacity:0;"+
        "filter:blur(8px);"+
        "transition:opacity .65s ease,transform .75s cubic-bezier(.2,.8,.2,1),filter .75s ease;"+
        "text-shadow:0 3px 24px rgba(255,255,255,.2);"
    );

    scene.appendChild(name);

    later(function(){

        moon.style.transform=
            "translate(-50%,-50%) scale(1)";

    },90);

    later(function(){

        craters.style.opacity="0";

        moon.style.background=
            "radial-gradient(circle,#edf2f8,#aeb8c9)";

        moon.style.boxShadow=
            "0 0 0 1px rgba(255,255,255,.2),0 0 40px rgba(190,210,242,.22)";

        circleRing.style.opacity="1";

        circleRing.style.transform=
            "translate(-50%,-50%) scale(1)";

    },900);

    later(function(){

        moon.style.background=
            "radial-gradient(circle at 34% 28%,#fffbe0 0%,#ffe07b 38%,#ffad3e 67%,#df6827 100%)";

        moon.style.boxShadow=
            "0 0 0 1px rgba(255,234,174,.7),0 0 54px rgba(255,188,65,.62),0 0 120px rgba(255,151,35,.2)";

        halo.style.opacity="1";

        halo.style.transform=
            "translate(-50%,-50%) scale(1)";

        flare.style.opacity="1";

        flare.style.transform=
            "translate(-50%,-50%) scale(8)";

        circleRing.style.opacity="0";

        moon.style.transform=
            "translate(-50%,-50%) scale(1.08)";

    },1500);

    later(function(){

        name.style.opacity="1";
        name.style.transform=
            "translate(-50%,0)";
        name.style.filter=
            "blur(0)";

    },2020);

    later(function(){

        name.style.opacity="0";

        name.style.transform=
            "translate(-50%,-10px)";

        name.style.filter=
            "blur(5px)";

        moon.style.transform=
            "translate(-50%,-50%) scale(.82)";

        moon.style.opacity="0";

        halo.style.transform=
            "translate(-50%,-50%) scale(1.35)";

        halo.style.opacity="0";

        flare.style.transform=
            "translate(-50%,-50%) scale(15)";

        flare.style.opacity="0";

        stars.style.opacity=".2";

        scene.style.opacity="0";

    },2900);

    later(function(){

        scene.remove();

        done();

    },3700);
}


/* =========================================
   BOOT
========================================= */

function start(){

    root.style.pointerEvents="auto";

    startup(function(){

        home();

    });
}

if(
    d.readyState===
    "loading"
){

    d.addEventListener(
        "DOMContentLoaded",
        start,
        {once:true}
    );

}else{

    start();
}

})();
/* =========================================
   OPTIONAL EXTRA POLISH / RESPONSIVE
========================================= */

(function(){

    var extra=d.createElement("style");

    extra.textContent=
        "#oval-root .oval-card-shine{"+
            "position:absolute;"+
            "inset:0;"+
            "pointer-events:none;"+
            "overflow:hidden;"+
        "}"+
        "#oval-root .oval-card-shine:after{"+
            "content:'';"+
            "position:absolute;"+
            "top:-20%;"+
            "left:-40%;"+
            "width:35%;"+
            "height:140%;"+
            "transform:rotate(14deg);"+
            "background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);"+
            "animation:ovalShine 8s ease-in-out infinite;"+
        "}"+
        "@media(max-width:700px){"+
            "#oval-root .oval-window{"+
                "width:94vw!important;"+
                "height:78vh!important;"+
                "min-height:400px!important;"+
                "border-radius:24px!important;"+
            "}"+
            "#oval-root #oval-content{"+
                "padding:16px!important;"+
            "}"+
        "}"+
        "@media(max-width:500px){"+
            "#oval-root .oval-window{"+
                "width:96vw!important;"+
                "height:82vh!important;"+
            "}"+
        "}";

    d.head.appendChild(extra);

})();


/* =========================================
   SAFE EDIT MODE PATCH
========================================= */

(function(){

    var observer=null;

    window.__ovalSetEditMode=function(on){

        editMode=!!on;

        if(observer){
            try{
                observer.disconnect();
            }catch(e){}
            observer=null;
        }

        if(!editMode){

            d.querySelectorAll(
                "[contenteditable='true']"
            ).forEach(
                function(el){

                    if(root.contains(el))
                        return;

                    el.contentEditable="false";
                }
            );

            return;
        }

        d.querySelectorAll(
            "body *"
        ).forEach(
            function(el){

                if(
                    root.contains(el)
                ){
                    return;
                }

                if(
                    el.tagName!=="SCRIPT"&&
                    el.tagName!=="STYLE"&&
                    el.tagName!=="INPUT"&&
                    el.tagName!=="TEXTAREA"
                ){
                    el.contentEditable="true";
                }
            }
        );

        observer=new MutationObserver(
            function(){

                if(!editMode)
                    return;

                d.querySelectorAll(
                    "body *"
                ).forEach(
                    function(el){

                        if(
                            root.contains(el)
                        ){
                            return;
                        }

                        if(
                            el.tagName!=="SCRIPT"&&
                            el.tagName!=="STYLE"&&
                            el.tagName!=="INPUT"&&
                            el.tagName!=="TEXTAREA"
                        ){
                            el.contentEditable="true";
                        }
                    }
                );
            }
        );

        observer.observe(
            d.body,
            {
                childList:true,
                subtree:true
            }
        );
    };

})();


/* =========================================
   PATCH TOOL TO USE SAFE EDIT MODE
========================================= */

(function(){

    var oldTools=tools;

    tools=function(){

        var content=createWindow(
            "Tools",
            "browser utilities",
            goHome
        );

        var grid=d.createElement("div");

        css(
            grid,
            "display:grid;"+
            "grid-template-columns:repeat(2,minmax(0,1fr));"+
            "gap:10px;"
        );

        grid.appendChild(
            makeCard(
                "🌐",
                "Website Name Disguiser",
                "Change title + favicon",
                disguiser
            )
        );

        grid.appendChild(
            makeCard(
                "✎",
                "Edit Page",
                "Toggle visual editing",
                function(){

                    editMode=!editMode;

                    window.__ovalSetEditMode(
                        editMode
                    );

                    var status=
                        d.getElementById(
                            "edit-status"
                        );

                    if(status){

                        status.textContent=
                            "Edit Page: "+
                            (editMode?"ON":"OFF");
                    }

                    softBeep(
                        editMode?
                        520:
                        280
                    );
                }
            )
        );

        grid.appendChild(
            makeCard(
                "⌗",
                "Calculator",
                "Quick browser calculator",
                calculator
            )
        );

        content.appendChild(grid);

        var status=d.createElement("div");

        status.id="edit-status";

        css(
            status,
            "margin-top:12px;"+
            "padding:13px 15px;"+
            "border-radius:16px;"+
            "background:rgba(255,255,255,.05);"+
            "border:1px solid rgba(255,255,255,.09);"+
            "font-size:11px;"+
            "color:rgba(255,255,255,.52);"
        );

        status.textContent=
            "Edit Page: "+
            (editMode?"ON":"OFF");

        content.appendChild(status);
    };

})();


/* =========================================
   VISUAL STATUS / HOTKEY INDICATOR
========================================= */

(function(){

    var oldHome=home;

    home=function(){

        oldHome();

        if(!box)return;

        var content=
            box.querySelector(
                "#oval-content"
            );

        if(!content)return;

        var info=d.createElement("div");

        css(
            info,
            "display:flex;"+
            "align-items:center;"+
            "justify-content:space-between;"+
            "gap:10px;"+
            "margin-top:11px;"+
            "padding:11px 13px;"+
            "border-radius:15px;"+
            "background:rgba(255,255,255,.04);"+
            "border:1px solid rgba(255,255,255,.08);"+
            "font-size:10px;"+
            "color:rgba(255,255,255,.43);"
        );

        var hot=loadHotkey();

        info.innerHTML=
            "<span>Hide / Show</span>"+
            "<span style='font-weight:800;color:#fff'>"+
            esc(formatHotkey(hot))+
            "</span>";

        content.appendChild(info);
    };

})();

})();
/* =========================================
   FINAL HOTKEY / CLEANUP SAFETY
========================================= */

(function(){

    /* Re-register the hotkey listener after all patches. */
    var previous=window.__ovalHotkeyListener;

    if(previous){
        try{
            d.removeEventListener(
                "keydown",
                previous,
                true
            );
        }catch(e){}
    }

    function hotkeyListener(e){

        var hotkey;

        try{

            hotkey=
                JSON.parse(
                    localStorage.getItem(
                        HOTKEY_STORAGE
                    )
                )||{
                    code:"Escape",
                    ctrl:false,
                    alt:false,
                    shift:false,
                    meta:false
                };

        }catch(err){

            hotkey={
                code:"Escape",
                ctrl:false,
                alt:false,
                shift:false,
                meta:false
            };
        }

        if(
            e.code===hotkey.code&&
            e.ctrlKey===!!hotkey.ctrl&&
            e.altKey===!!hotkey.alt&&
            e.shiftKey===!!hotkey.shift&&
            e.metaKey===!!hotkey.meta
        ){

            /*
             * Don't let the global hotkey trigger
             * while the key recorder is actively listening.
             */
            if(
                e.target&&
                e.target.closest&&
                e.target.closest("input,textarea")
            ){
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            hideShow();
        }
    }

    window.__ovalHotkeyListener=
        hotkeyListener;

    d.addEventListener(
        "keydown",
        hotkeyListener,
        true
    );

})();


/* =========================================
   FIXED TOOLS EDIT MODE ENTRY
========================================= */

(function(){

    window.__ovalOpenTools=function(){

        if(typeof tools==="function"){
            tools();
        }
    };

})();


/* =========================================
   FINAL EXPORTS
========================================= */

window.__ovalStopAll=function(){
    stopAll();
};

window.__ovalClose=function(){
    close();
};

window.__ovalOpen=function(){
    if(hidden){
        hideShow();
        return;
    }

    if(!box){
        home();
    }
};

})();

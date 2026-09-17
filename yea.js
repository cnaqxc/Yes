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
var hotkeyRecording=false;

var rate=1;
var loopState=false;

var BACKGROUND_URL="https://user17929.na.imgto.link/public/2026091/img-1580.avif";
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
"overflow:visible;"+
"background:transparent;";

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

        try{
            handle.setPointerCapture(pointerId);
        }catch(e){}

        handle.style.cursor="grabbing";

        e.preventDefault();
        e.stopPropagation();
    }

    function move(e){

        if(!active)return;

        var nx=ox+(e.clientX-sx);
        var ny=oy+(e.clientY-sy);

        var maxX=Math.max(8,window.innerWidth-element.offsetWidth-8);
        var maxY=Math.max(8,window.innerHeight-element.offsetHeight-8);

        nx=Math.max(8,Math.min(maxX,nx));
        ny=Math.max(8,Math.min(maxY,ny));

        element.style.left=nx+"px";
        element.style.top=ny+"px";
        element.style.right="auto";
        element.style.bottom="auto";
        element.style.transform="none";

        e.preventDefault();
        e.stopPropagation();
    }

    function up(e){

        if(!active)return;

        active=false;
        pointerId=null;

        handle.style.cursor="grab";

        try{
            handle.releasePointerCapture(e.pointerId);
        }catch(err){}

        e.preventDefault();
        e.stopPropagation();
    }

    handle.addEventListener("pointerdown",down);
    handle.addEventListener("pointermove",move);
    handle.addEventListener("pointerup",up);
    handle.addEventListener("pointercancel",up);

    cleanups.push(function(){
        handle.removeEventListener("pointerdown",down);
        handle.removeEventListener("pointermove",move);
        handle.removeEventListener("pointerup",up);
        handle.removeEventListener("pointercancel",up);
    });
}


/* =========================================
   WINDOW
========================================= */

function createWindow(title,subtitle,back){

    cleanupView();
    stopGame();

    var content=d.createElement("div");

    box=d.createElement("div");
    box.id="oval-window";

    css(box,
        "position:fixed;"+
        "left:50%;"+
        "top:50%;"+
        "width:"+normalW+";"+
        "height:auto;"+
        "max-height:88vh;"+
        "transform:translate(-50%,-50%);"+
        "display:flex;"+
        "flex-direction:column;"+
        "overflow:hidden;"+
        "border-radius:30px;"+
        "border:1px solid rgba(255,255,255,.18);"+
        "outline:1px solid rgba(255,255,255,.035);"+
        "background-image:linear-gradient(rgba(4,7,15,.22),rgba(4,7,15,.42)),url('"+BACKGROUND_URL+"');"+
        "background-size:cover;"+
        "background-position:center;"+
        "background-repeat:no-repeat;"+
        "box-shadow:0 35px 100px rgba(0,0,0,.65),inset 0 1px rgba(255,255,255,.16);"+
        "backdrop-filter:blur(25px) saturate(145%);"+
        "-webkit-backdrop-filter:blur(25px) saturate(145%);"+
        "pointer-events:auto;"+
        "isolation:isolate;"+
        "transition:width .28s ease,height .28s ease,max-height .28s ease,border-radius .28s ease;"
    );

    var glow=d.createElement("div");

    css(glow,
        "position:absolute;"+
        "inset:-40%;"+
        "pointer-events:none;"+
        "background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.13),transparent 32%);"+
        "animation:ovalPulse 7s ease-in-out infinite;"+
        "z-index:-1;"
    );

    box.appendChild(glow);


    /* HEADER */

    var header=d.createElement("div");

    css(header,
        "position:relative;"+
        "flex:0 0 64px;"+
        "display:flex;"+
        "align-items:center;"+
        "padding:0 14px 0 18px;"+
        "border-bottom:1px solid rgba(255,255,255,.12);"+
        "background:rgba(7,10,18,.42);"+
        "backdrop-filter:blur(30px);"+
        "-webkit-backdrop-filter:blur(30px);"+
        "touch-action:none;"+
        "z-index:20;"
    );

    var dragArea=d.createElement("div");

    css(dragArea,
        "position:absolute;"+
        "left:0;"+
        "top:0;"+
        "right:145px;"+
        "height:100%;"+
        "cursor:grab;"+
        "z-index:0;"
    );

    header.appendChild(dragArea);


    var titleWrap=d.createElement("div");

    css(titleWrap,
        "position:relative;"+
        "z-index:2;"+
        "pointer-events:none;"+
        "min-width:0;"+
        "padding-right:8px;"
    );

    var titleEl=d.createElement("div");

    titleEl.textContent=title||"Oval";

    css(titleEl,
        "font-size:16px;"+
        "font-weight:800;"+
        "letter-spacing:-.2px;"+
        "white-space:nowrap;"+
        "overflow:hidden;"+
        "text-overflow:ellipsis;"
    );

    titleWrap.appendChild(titleEl);

    if(subtitle){

        var sub=d.createElement("div");

        sub.textContent=subtitle;

        css(sub,
            "font-size:10px;"+
            "color:rgba(255,255,255,.48);"+
            "margin-top:2px;"+
            "white-space:nowrap;"
        );

        titleWrap.appendChild(sub);
    }

    header.appendChild(titleWrap);


    var controls=d.createElement("div");

    css(controls,
        "margin-left:auto;"+
        "position:relative;"+
        "z-index:5;"+
        "display:flex;"+
        "align-items:center;"+
        "gap:7px;"
    );


    var minBtn=makeButton(
        "−",
        function(){
            toggleMinimize();
        },
        "width:34px;height:34px;padding:0;border-radius:10px;font-size:19px;"
    );

    var maxBtn=makeButton(
        "□",
        function(){
            toggleMaximize();
        },
        "width:34px;height:34px;padding:0;border-radius:10px;font-size:15px;"
    );

    var closeBtn=makeButton(
        "×",
        function(){
            hideOval();
        },
        "width:34px;height:34px;padding:0;border-radius:10px;font-size:21px;"
    );

    controls.appendChild(minBtn);
    controls.appendChild(maxBtn);
    controls.appendChild(closeBtn);

    header.appendChild(controls);

    box.appendChild(header);


    /* CONTENT */

    css(content,
        "position:relative;"+
        "flex:1 1 auto;"+
        "min-height:0;"+
        "overflow:auto;"+
        "padding:18px;"+
        "scrollbar-width:thin;"
    );

    box.appendChild(content);

    root.appendChild(box);

    makeDraggable(box,dragArea);

    return content;
}


/* =========================================
   MINIMIZE / MAXIMIZE
========================================= */

function toggleMinimize(){

    if(!box)return;

    minimized=!minimized;

    if(minimized){

        box.style.height="64px";
        box.style.maxHeight="64px";
        box.style.width="min(430px,92vw)";
        box.style.borderRadius="22px";

        var body=box.children[2];

        if(body)body.style.display="none";

    }else{

        box.style.height="";
        box.style.maxHeight="88vh";
        box.style.width=normalW;
        box.style.borderRadius="30px";

        var body2=box.children[2];

        if(body2)body2.style.display="";

    }
}


function toggleMaximize(){

    if(!box)return;

    maximized=!maximized;

    minimized=false;

    var body=box.children[2];

    if(body)body.style.display="";

    if(maximized){

        box.style.left="10px";
        box.style.top="10px";
        box.style.transform="none";
        box.style.width="calc(100vw - 20px)";
        box.style.height="calc(100vh - 20px)";
        box.style.maxHeight="calc(100vh - 20px)";
        box.style.borderRadius="24px";

    }else{

        box.style.left="50%";
        box.style.top="50%";
        box.style.transform="translate(-50%,-50%)";
        box.style.width=normalW;
        box.style.height="";
        box.style.maxHeight="88vh";
        box.style.borderRadius="30px";
    }
}


/* =========================================
   HIDE / SHOW
========================================= */

function hideOval(){

    hidden=true;

    stopAll();
    stopGame();
    clearTimers();

    if(box){
        box.style.display="none";
    }
}

function showOval(){

    hidden=false;

    if(box){
        box.style.display="";
    }
}

function toggleOval(){

    if(hidden)showOval();
    else hideOval();
}

window.__ovalToggle=toggleOval;


/* =========================================
   CARD
========================================= */

function makeCard(icon,title,desc,fn){

    var card=d.createElement("button");

    card.type="button";

    css(card,
        "position:relative;"+
        "width:100%;"+
        "min-height:108px;"+
        "padding:18px;"+
        "display:flex;"+
        "align-items:center;"+
        "gap:14px;"+
        "text-align:left;"+
        "color:#fff;"+
        "background:linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.045));"+
        "border:1px solid rgba(255,255,255,.13);"+
        "border-radius:21px;"+
        "cursor:pointer;"+
        "overflow:hidden;"+
        "transition:transform .18s ease,border-color .18s ease,background .18s ease;"+
        "box-shadow:inset 0 1px rgba(255,255,255,.08),0 12px 35px rgba(0,0,0,.18);"
    );

    card.innerHTML=
        "<div style='"+
        "width:48px;height:48px;"+
        "border-radius:16px;"+
        "display:grid;place-items:center;"+
        "flex:0 0 auto;"+
        "font-size:24px;"+
        "background:rgba(255,255,255,.08);"+
        "border:1px solid rgba(255,255,255,.1);"+
        "'>"+icon+"</div>"+
        "<div style='min-width:0'>"+
        "<div style='font-size:15px;font-weight:800'>"+esc(title)+"</div>"+
        "<div style='font-size:11px;color:rgba(255,255,255,.46);margin-top:4px'>"+esc(desc)+"</div>"+
        "</div>"+
        "<div style='margin-left:auto;color:rgba(255,255,255,.38);font-size:18px'>›</div>";

    card.onclick=function(e){
        e.stopPropagation();
        softBeep(460);
        fn();
    };

    card.onmouseenter=function(){
        card.style.transform="translateY(-2px)";
        card.style.borderColor="rgba(255,255,255,.24)";
        card.style.background="linear-gradient(145deg,rgba(255,255,255,.15),rgba(255,255,255,.065))";
    };

    card.onmouseleave=function(){
        card.style.transform="";
        card.style.borderColor="rgba(255,255,255,.13)";
        card.style.background="linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.045))";
    };

    return card;
}
/* =========================================
   HOME
========================================= */

function goHome(){

    var content=createWindow(
        "Oval",
        "Control Center",
        null
    );

    var hero=makePanel();

    css(
        hero,
        "padding:24px;"+
        "margin-bottom:14px;"+
        "position:relative;"+
        "overflow:hidden;"
    );

    hero.innerHTML=
        "<div style='font-size:32px;letter-spacing:4px'>☾ ✦ ☀</div>"+
        "<div style='font-size:25px;font-weight:850;margin-top:8px'>Oval</div>"+
        "<div style='font-size:11px;color:rgba(255,255,255,.48);margin-top:5px'>Your browser control center.</div>";

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
            "Play sounds",
            soundboard
        )
    );

    grid.appendChild(
        makeCard(
            "🎮",
            "Games",
            "Play",
            games
        )
    );

    grid.appendChild(
        makeCard(
            "🌐",
            "More Games",
            "Expanded arcade",
            embeddedGames
        )
    );

    grid.appendChild(
        makeCard(
            "⚙️",
            "Settings",
            "Customize",
            settings
        )
    );

    grid.appendChild(
        makeCard(
            "🛠️",
            "Tools",
            "Browser tools",
            tools
        )
    );

    content.appendChild(grid);
}


/* =========================================
   SOUNDBOARD
========================================= */

function soundboard(){

    var content=createWindow(
        "Soundboard",
        "Sounds",
        goHome
    );

    var top=makePanel();

    css(
        top,
        "padding:16px;"+
        "margin-bottom:12px;"+
        "display:flex;"+
        "gap:8px;"+
        "flex-wrap:wrap;"
    );

    var stop=makeButton(
        "■ Stop All",
        function(){
            stopAll();
        }
    );

    var loopBtn=makeButton(
        "Loop: "+(loopState?"ON":"OFF"),
        function(){
            loopState=!loopState;
            loopBtn.textContent="Loop: "+(loopState?"ON":"OFF");
        }
    );

    var speedBtn=makeButton(
        "Speed: "+rate+"×",
        function(){

            if(rate===1)rate=1.25;
            else if(rate===1.25)rate=1.5;
            else if(rate===1.5)rate=.75;
            else rate=1;

            speedBtn.textContent="Speed: "+rate+"×";

            playing.forEach(function(a){
                try{a.playbackRate=rate}catch(e){}
            });
        }
    );

    top.appendChild(stop);
    top.appendChild(loopBtn);
    top.appendChild(speedBtn);

    content.appendChild(top);


    sounds.forEach(function(s){

        var card=makePanel();

        css(
            card,
            "padding:14px;"+
            "margin-bottom:9px;"+
            "display:flex;"+
            "align-items:center;"+
            "gap:12px;"
        );

        var name=d.createElement("div");

        name.innerHTML=
            "<div style='font-size:14px;font-weight:800'>"+
            esc(s[0])+" "+esc(s[1])+
            "</div>";

        css(
            name,
            "flex:1;min-width:0;"
        );

        var play=makeButton(
            "▶ Play",
            function(){

                var audio=new Audio(s[2]);

                audio.playbackRate=rate;
                audio.loop=loopState;

                playing.push(audio);

                audio.onended=function(){
                    playing=playing.filter(function(x){
                        return x!==audio;
                    });
                };

                audio.play().catch(function(){});
            }
        );

        card.appendChild(name);
        card.appendChild(play);

        content.appendChild(card);
    });
}


/* =========================================
   ORIGINAL GAMES
========================================= */

function games(){

    var content=createWindow(
        "Games",
        "Play",
        goHome
    );

    var panel=makePanel();

    css(
        panel,
        "padding:22px;"
    );

    panel.innerHTML=
        "<div style='font-size:25px;font-weight:850'>🎮 Games</div>"+
        "<div style='font-size:11px;color:rgba(255,255,255,.46);margin-top:6px'>Original Oval games.</div>";

    content.appendChild(panel);

    var grid=d.createElement("div");

    css(
        grid,
        "display:grid;"+
        "grid-template-columns:repeat(2,minmax(0,1fr));"+
        "gap:10px;"+
        "margin-top:12px;"
    );

    grid.appendChild(
        makeCard(
            "🏓",
            "Pong",
            "Classic arcade",
            pongGame
        )
    );

    grid.appendChild(
        makeCard(
            "🟩",
            "Snake",
            "Grow and survive",
            snakeGame
        )
    );

    content.appendChild(grid);
}


/* =========================================
   PONG
========================================= */

function pongGame(){

    var content=createWindow(
        "Pong",
        "Games",
        games
    );

    var panel=makePanel();

    css(
        panel,
        "padding:12px;"
    );

    var canvas=d.createElement("canvas");

    canvas.width=620;
    canvas.height=380;

    css(
        canvas,
        "display:block;"+
        "width:100%;"+
        "height:auto;"+
        "max-height:60vh;"+
        "background:rgba(0,0,0,.35);"+
        "border:1px solid rgba(255,255,255,.13);"+
        "border-radius:18px;"
    );

    panel.appendChild(canvas);
    content.appendChild(panel);

    var ctx=canvas.getContext("2d");

    var px=18;
    var py=150;

    var ex=584;
    var ey=150;

    var bx=310;
    var by=190;

    var vx=4;
    var vy=3;

    var score=0;
    var enemy=0;

    var keys={};

    function keydown(e){
        keys[e.key]=true;
    }

    function keyup(e){
        keys[e.key]=false;
    }

    window.addEventListener("keydown",keydown);
    window.addEventListener("keyup",keyup);

    gameCleanup=function(){

        window.removeEventListener("keydown",keydown);
        window.removeEventListener("keyup",keyup);

        if(anim)cancelAnimationFrame(anim);
    };

    function draw(){

        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.strokeStyle="rgba(255,255,255,.12)";
        ctx.setLineDash([8,10]);
        ctx.beginPath();
        ctx.moveTo(310,0);
        ctx.lineTo(310,380);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle="#fff";

        ctx.fillRect(px,py,12,80);
        ctx.fillRect(ex,ey,12,80);

        ctx.beginPath();
        ctx.arc(bx,by,8,0,Math.PI*2);
        ctx.fill();

        ctx.font="bold 22px Arial";
        ctx.fillText(score,275,34);
        ctx.fillText(enemy,335,34);
    }

    var anim;

    function update(){

        if(keys.ArrowUp||keys.w)py-=6;
        if(keys.ArrowDown||keys.s)py+=6;

        py=Math.max(0,Math.min(300,py));

        if(by<ey+40)ey-=4;
        if(by>ey+40)ey+=4;

        ey=Math.max(0,Math.min(300,ey));

        bx+=vx;
        by+=vy;

        if(by<8||by>372)vy*=-1;

        if(
            bx<px+12&&
            by>py&&
            by<py+80
        ){
            vx=Math.abs(vx);
            softBeep(520);
        }

        if(
            bx>ex-8&&
            by>ey&&
            by<ey+80
        ){
            vx=-Math.abs(vx);
            softBeep(620);
        }

        if(bx<0){
            enemy++;
            bx=310;
            by=190;
            vx=4;
        }

        if(bx>620){
            score++;
            bx=310;
            by=190;
            vx=-4;
        }

        draw();

        anim=requestAnimationFrame(update);
    }

    update();
}


/* =========================================
   SNAKE
========================================= */

function snakeGame(){

    var content=createWindow(
        "Snake",
        "Games",
        games
    );

    var panel=makePanel();

    css(
        panel,
        "padding:12px;"
    );

    var canvas=d.createElement("canvas");

    canvas.width=500;
    canvas.height=500;

    css(
        canvas,
        "display:block;"+
        "width:100%;"+
        "max-width:500px;"+
        "margin:auto;"+
        "background:rgba(0,0,0,.35);"+
        "border:1px solid rgba(255,255,255,.13);"+
        "border-radius:18px;"
    );

    panel.appendChild(canvas);
    content.appendChild(panel);

    var ctx=canvas.getContext("2d");

    var size=20;

    var snake=[
        {x:10,y:10},
        {x:9,y:10},
        {x:8,y:10}
    ];

    var dir={x:1,y:0};

    var food={
        x:15,
        y:15
    };

    var alive=true;

    function randomFood(){

        food={
            x:Math.floor(Math.random()*25),
            y:Math.floor(Math.random()*25)
        };
    }

    function key(e){

        if(e.key==="ArrowUp"&&dir.y===0)
            dir={x:0,y:-1};

        if(e.key==="ArrowDown"&&dir.y===0)
            dir={x:0,y:1};

        if(e.key==="ArrowLeft"&&dir.x===0)
            dir={x:-1,y:0};

        if(e.key==="ArrowRight"&&dir.x===0)
            dir={x:1,y:0};
    }

    window.addEventListener("keydown",key);

    gameCleanup=function(){
        window.removeEventListener("keydown",key);
        if(interval)clearInterval(interval);
    };

    function draw(){

        ctx.clearRect(0,0,500,500);

        ctx.fillStyle="#fff";

        snake.forEach(function(p){
            ctx.fillRect(
                p.x*size,
                p.y*size,
                size-2,
                size-2
            );
        });

        ctx.fillRect(
            food.x*size,
            food.y*size,
            size-2,
            size-2
        );
    }

    function tick(){

        if(!alive)return;

        var head={
            x:snake[0].x+dir.x,
            y:snake[0].y+dir.y
        };

        if(
            head.x<0||
            head.y<0||
            head.x>=25||
            head.y>=25
        ){
            alive=false;
            return;
        }

        for(var i=0;i<snake.length;i++){

            if(
                snake[i].x===head.x&&
                snake[i].y===head.y
            ){
                alive=false;
                return;
            }
        }

        snake.unshift(head);

        if(
            head.x===food.x&&
            head.y===food.y
        ){
            randomFood();
            softBeep(600);
        }else{
            snake.pop();
        }

        draw();
    }

    draw();

    var interval=setInterval(tick,120);
}


/* =========================================
   MORE GAMES
========================================= */

function embeddedGames(){

    var modal=d.createElement("div");

    modal.className="oval-modal";

    modal.style.cssText=
        "position:fixed;"+
        "left:50%;"+
        "top:50%;"+
        "transform:translate(-50%,-50%);"+
        "width:58vw;"+
        "height:74vh;"+
        "min-width:310px;"+
        "min-height:420px;"+
        "background:#000;"+
        "border:1px solid #333;"+
        "border-radius:18px;"+
        "overflow:hidden;"+
        "z-index:2147483646;"+
        "box-shadow:0 20px 80px #000;";

    var bar=d.createElement("div");

    bar.style.cssText=
        "position:absolute;"+
        "left:0;"+
        "right:0;"+
        "top:0;"+
        "height:48px;"+
        "z-index:4;"+
        "background:rgba(10,10,10,.94);"+
        "border-bottom:1px solid #292929;"+
        "cursor:grab;"+
        "touch-action:none;";

    bar.innerHTML=
        '<span style="'+
        "position:absolute;"+
        "left:16px;"+
        "top:14px;"+
        "font-weight:800;"+
        "font-size:14px;"+
        "user-select:none"+
        '">🌐 More Games</span>';

    var closeBtn=d.createElement("button");

    closeBtn.textContent="×";

    closeBtn.style.cssText=
        "position:absolute;"+
        "right:9px;"+
        "top:8px;"+
        "z-index:5;"+
        "width:34px;"+
        "height:34px;"+
        "background:#111;"+
        "color:#fff;"+
        "border:1px solid #444;"+
        "border-radius:9px;"+
        "font-size:20px;"+
        "cursor:pointer;";

    closeBtn.onclick=function(){

        modal.remove();

    };

    var frame=d.createElement("iframe");

    frame.style.cssText=
        "position:absolute;"+
        "top:48px;"+
        "left:0;"+
        "width:100%;"+
        "height:calc(100% - 48px);"+
        "border:0;"+
        "background:#000;";

    frame.setAttribute(
        "allow",
        "autoplay; fullscreen; gamepad"
    );

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

    makeDraggable(modal,bar);
}

function moreGames(){
    embeddedGames();
}
/* =========================================
   SETTINGS
========================================= */

function normalizeHotkey(h){

    if(!h)return null;

    return {
        key:h.key||"",
        code:h.code||"",
        ctrl:!!h.ctrl,
        alt:!!h.alt,
        shift:!!h.shift,
        meta:!!h.meta
    };
}


function loadHotkey(){

    var value=null;

    try{
        value=localStorage.getItem(HOTKEY_STORAGE);

        if(value){
            value=JSON.parse(value);
            return normalizeHotkey(value);
        }
    }catch(e){}

    try{

        var match=document.cookie.match(
            new RegExp(
                "(?:^|; )"+
                HOTKEY_STORAGE.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+
                "=([^;]*)"
            )
        );

        if(match&&match[1]){

            value=JSON.parse(
                decodeURIComponent(match[1])
            );

            return normalizeHotkey(value);
        }

    }catch(e){}

    return null;
}


function saveHotkey(h){

    h=normalizeHotkey(h);

    if(!h)return false;

    var serialized="";

    try{

        serialized=JSON.stringify(h);

        localStorage.setItem(
            HOTKEY_STORAGE,
            serialized
        );

        var verify=localStorage.getItem(
            HOTKEY_STORAGE
        );

        if(verify!==serialized){
            throw new Error("Storage verification failed");
        }

        return true;

    }catch(e){

        try{

            document.cookie=
                HOTKEY_STORAGE+
                "="+
                encodeURIComponent(serialized)+
                ";path=/;max-age=31536000;SameSite=Lax";

            var loaded=loadHotkey();

            return !!loaded;

        }catch(err){

            return false;
        }
    }
}


/* =========================================
   SETTINGS PAGE
========================================= */

function settings(){

    var content=createWindow(
        "Settings",
        "Customize",
        goHome
    );

    var panel=makePanel();

    css(
        panel,
        "padding:20px;"
    );

    panel.innerHTML=
        "<div style='font-size:23px;font-weight:850'>⚙️ Settings</div>"+
        "<div style='font-size:11px;color:rgba(255,255,255,.46);margin-top:5px'>Customize Oval.</div>";

    content.appendChild(panel);


    var keyPanel=makePanel();

    css(
        keyPanel,
        "padding:18px;"+
        "margin-top:12px;"
    );

    var current=loadHotkey();

    keyPanel.innerHTML=
        "<div style='font-size:15px;font-weight:800'>⌨️ Keybind</div>"+
        "<div style='font-size:11px;color:rgba(255,255,255,.45);margin-top:5px'>"+
        "Press the keybind to hide or show the entire Oval interface and stop sounds while hidden."+
        "</div>";

    var keyText=d.createElement("div");

    css(
        keyText,
        "margin-top:13px;"+
        "padding:12px;"+
        "border:1px solid rgba(255,255,255,.1);"+
        "border-radius:13px;"+
        "background:rgba(0,0,0,.18);"+
        "font-size:12px;"+
        "color:rgba(255,255,255,.7);"
    );

    keyText.textContent=
        current&&current.key
        ?"Current: "+formatHotkey(current)
        :"Current: Not set";

    keyPanel.appendChild(keyText);


    var recordBtn=makeButton(
        "Set Keybind",
        function(){

            if(hotkeyRecording)return;

            hotkeyRecording=true;

            recordBtn.textContent="Press a key...";

            var listener=function(e){

                if(
                    e.key==="Escape"&&
                    !e.ctrlKey&&
                    !e.altKey&&
                    !e.shiftKey&&
                    !e.metaKey
                ){

                    e.preventDefault();

                    window.removeEventListener(
                        "keydown",
                        listener,
                        true
                    );

                    hotkeyRecording=false;

                    var old=loadHotkey();

                    recordBtn.textContent="Set Keybind";

                    keyText.textContent=
                        old&&old.key
                        ?"Current: "+formatHotkey(old)
                        :"Current: Not set";

                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                var h={
                    key:e.key,
                    code:e.code,
                    ctrl:e.ctrlKey,
                    alt:e.altKey,
                    shift:e.shiftKey,
                    meta:e.metaKey
                };

                var ok=saveHotkey(h);

                window.removeEventListener(
                    "keydown",
                    listener,
                    true
                );

                hotkeyRecording=false;

                if(ok){

                    var saved=loadHotkey();

                    keyText.textContent=
                        saved&&saved.key
                        ?"Current: "+formatHotkey(saved)
                        :"Current: Not set";

                    recordBtn.textContent="Saved ✓";

                    later(function(){
                        recordBtn.textContent="Set Keybind";
                    },900);

                }else{

                    recordBtn.textContent="Save failed";

                    later(function(){
                        recordBtn.textContent="Set Keybind";
                    },1200);
                }
            };

            window.addEventListener(
                "keydown",
                listener,
                true
            );
        }
    );

    keyPanel.appendChild(recordBtn);

    content.appendChild(keyPanel);


    var about=makePanel();

    css(
        about,
        "padding:18px;"+
        "margin-top:12px;"
    );

    about.innerHTML=
        "<div style='font-size:15px;font-weight:800'>ⓘ About</div>"+
        "<div style='font-size:12px;line-height:1.7;color:rgba(255,255,255,.62);margin-top:9px'>"+
        "Creator: Henry<br>"+
        "The creator is not responsible for your actions."+
        "</div>";

    content.appendChild(about);
}


function formatHotkey(h){

    if(!h)return "";

    var parts=[];

    if(h.ctrl)parts.push("Ctrl");
    if(h.alt)parts.push("Alt");
    if(h.shift)parts.push("Shift");
    if(h.meta)parts.push("Meta");

    var key=h.key||h.code||"";

    if(key===" ")key="Space";

    parts.push(key);

    return parts.join(" + ");
}


/* =========================================
   TOOLS
========================================= */

function tools(){

    var content=createWindow(
        "Tools",
        "Browser tools",
        goHome
    );

    var grid=d.createElement("div");

    css(
        grid,
        "display:grid;"+
        "grid-template-columns:repeat(2,minmax(0,1fr));"+
        "gap:11px;"
    );

    grid.appendChild(
        makeCard(
            "🎭",
            "Website Name Disguiser",
            "Change title and favicon",
            websiteDisguiser
        )
    );

    grid.appendChild(
        makeCard(
            "✏️",
            "Edit Page",
            "Toggle page editing",
            editPage
        )
    );

    grid.appendChild(
        makeCard(
            "🧮",
            "Calculator",
            "Quick calculations",
            calculator
        )
    );

    content.appendChild(grid);
}


/* =========================================
   WEBSITE NAME DISGUISER
========================================= */

function websiteDisguiser(){

    var content=createWindow(
        "Website Name Disguiser",
        "Tools",
        tools
    );

    var panel=makePanel();

    css(
        panel,
        "padding:18px;"
    );

    panel.innerHTML=
        "<div style='font-size:15px;font-weight:800'>Website Name</div>";

    var titleInput=d.createElement("input");

    titleInput.type="text";
    titleInput.value=document.title;

    css(
        titleInput,
        "width:100%;"+
        "margin-top:10px;"+
        "padding:12px;"+
        "border-radius:13px;"+
        "border:1px solid rgba(255,255,255,.13);"+
        "background:rgba(0,0,0,.25);"+
        "color:#fff;"+
        "outline:none;"
    );

    panel.appendChild(titleInput);


    var faviconInput=d.createElement("input");

    faviconInput.type="text";
    faviconInput.placeholder="Favicon URL";

    css(
        faviconInput,
        "width:100%;"+
        "margin-top:9px;"+
        "padding:12px;"+
        "border-radius:13px;"+
        "border:1px solid rgba(255,255,255,.13);"+
        "background:rgba(0,0,0,.25);"+
        "color:#fff;"+
        "outline:none;"
    );

    panel.appendChild(faviconInput);


    var apply=makeButton(
        "Apply",
        function(){

            document.title=titleInput.value||document.title;

            if(faviconInput.value){

                var link=document.querySelector(
                    "link[rel~='icon']"
                );

                if(!link){

                    link=document.createElement("link");
                    link.rel="icon";
                    document.head.appendChild(link);
                }

                link.href=faviconInput.value;
            }
        },
        "margin-top:11px;"
    );

    panel.appendChild(apply);

    content.appendChild(panel);
}


/* =========================================
   EDIT PAGE
========================================= */

function editPage(){

    editMode=!editMode;

    document.designMode=
        editMode
        ?"on"
        :"off";

    if(box){

        var status=d.createElement("div");

        status.textContent=
            "Edit Page: "+
            (editMode?"ON":"OFF");

        css(
            status,
            "position:absolute;"+
            "right:18px;"+
            "bottom:18px;"+
            "z-index:100;"+
            "padding:9px 12px;"+
            "border-radius:12px;"+
            "background:rgba(0,0,0,.7);"+
            "border:1px solid rgba(255,255,255,.15);"+
            "font-size:11px;"+
            "pointer-events:none;"
        );

        box.appendChild(status);

        later(function(){

            if(status.parentNode)
                status.remove();

        },1300);
    }
}


/* =========================================
   CALCULATOR
========================================= */

function calculator(){

    var content=createWindow(
        "Calculator",
        "Tools",
        tools
    );

    var panel=makePanel();

    css(
        panel,
        "padding:18px;"
    );

    var display=d.createElement("input");

    display.type="text";
    display.readOnly=true;

    css(
        display,
        "width:100%;"+
        "padding:15px;"+
        "border-radius:15px;"+
        "border:1px solid rgba(255,255,255,.13);"+
        "background:rgba(0,0,0,.3);"+
        "color:#fff;"+
        "font-size:20px;"+
        "text-align:right;"+
        "outline:none;"
    );

    panel.appendChild(display);


    var keys=[
        "7","8","9","/",
        "4","5","6","*",
        "1","2","3","-",
        "0",".","=","+",
        "C"
    ];

    var grid=d.createElement("div");

    css(
        grid,
        "display:grid;"+
        "grid-template-columns:repeat(4,1fr);"+
        "gap:8px;"+
        "margin-top:10px;"
    );

    keys.forEach(function(k){

        var b=makeButton(
            k,
            function(){

                if(k==="C"){

                    display.value="";
                    return;
                }

                if(k==="="){

                    try{

                        display.value=String(
                            Function(
                                "return ("+
                                display.value+
                                ")"
                            )()
                        );

                    }catch(e){

                        display.value="Error";
                    }

                    return;
                }

                display.value+=k;
            },
            "min-height:44px;padding:0;"
        );

        grid.appendChild(b);
    });

    panel.appendChild(grid);

    content.appendChild(panel);
}


/* =========================================
   INITIALIZE
========================================= */

goHome();


/* =========================================
   RESPONSIVE
========================================= */

function responsive(){

    if(!box)return;
    if(maximized)return;

    if(window.innerWidth<520){

        box.style.width="calc(100vw - 18px)";
        box.style.maxHeight="90vh";

    }else{

        box.style.width=normalW;
        box.style.maxHeight="88vh";
    }
}

window.addEventListener("resize",responsive);

cleanups.push(function(){
    window.removeEventListener("resize",responsive);
});

responsive();


/* =========================================
   FINAL HOTKEY
========================================= */

function matchesHotkey(e,h){

    if(!h)return false;

    if(!!e.ctrlKey!==!!h.ctrl)return false;
    if(!!e.altKey!==!!h.alt)return false;
    if(!!e.shiftKey!==!!h.shift)return false;
    if(!!e.metaKey!==!!h.meta)return false;

    if(h.code&&e.code===h.code)return true;

    return h.key&&
        String(e.key).toLowerCase()===
        String(h.key).toLowerCase();
}

function finalHotkeyHandler(e){

    if(hotkeyRecording)return;

    var hotkey=loadHotkey();

    if(!hotkey)return;

    if(matchesHotkey(e,hotkey)){

        e.preventDefault();
        e.stopPropagation();

        toggleOval();
    }
}

window.addEventListener(
    "keydown",
    finalHotkeyHandler,
    true
);

cleanups.push(function(){

    window.removeEventListener(
        "keydown",
        finalHotkeyHandler,
        true
    );
});

})();
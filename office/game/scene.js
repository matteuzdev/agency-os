import {AGENTS,TILE_W,TILE_H,GRID_W,GRID_H,isoTop,tileCenter,worldToGrid,keyOf,inside} from "./config.js";
import {drawWorld,drawAgentDesk,createAvatar} from "./render.js";

export class OfficeScene extends Phaser.Scene{
  constructor(){super("office");}

  create(){
    window.__agencyOfficeScene=this;
    this.blocked=new Set(AGENTS.map(a=>keyOf(a.gx,a.gy)));
    this.agentObjects=new Map();
    this.walking=false;
    this.playerGrid={gx:12,gy:6};
    this.selectedMarker=this.add.graphics().setDepth(5);

    drawWorld(this);
    this.createAgents();
    this.createPlayer();
    this.createInput();

    this.cameras.main.setBounds(0,0,1600,930);
    this.cameras.main.startFollow(this.player,true,.08,.08);
    this.cameras.main.setDeadzone(220,160);

    const orion=AGENTS.find(a=>a.name==="Orion");
    this.setSelectedAgent(orion);
    this.updateInteraction();

    this.time.addEvent({delay:2600,loop:true,callback:()=>this.animateOfficeLife()});
    window.dispatchEvent(new CustomEvent("agency:log",{detail:{agent:"SYSTEM",action:"GAME_BOOT",detail:"Living Office isométrico iniciado."}}));
  }

  createAgents(){
    for(const agent of AGENTS){
      const {p,depth}=drawAgentDesk(this,agent);
      const obj=createAvatar(this,agent,p.x,p.y-5,false).setDepth(depth+5);
      obj.setInteractive(new Phaser.Geom.Rectangle(-28,-48,56,72),Phaser.Geom.Rectangle.Contains);
      obj.on("pointerdown",pointer=>{
        if(pointer.event?.stopPropagation)pointer.event.stopPropagation();
        this.walkToAgent(agent);
      });
      this.agentObjects.set(agent.name,obj);
      if(agent.status==="working"){
        this.tweens.add({targets:obj,y:obj.y-2,duration:850+Math.random()*450,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
      }
    }
  }

  createPlayer(){
    const p=tileCenter(this.playerGrid.gx,this.playerGrid.gy);
    this.player=createAvatar(this,{status:"working"},p.x,p.y-5,true);
    this.player.setDepth((this.playerGrid.gx+this.playerGrid.gy)*100+80);
  }

  createInput(){
    this.input.on("pointerdown",(pointer,objects)=>{
      if(objects?.length)return;
      const world=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
      const target=worldToGrid(world.x,world.y);
      if(inside(target.gx,target.gy))this.walkTo(target.gx,target.gy);
    });

    [["W",-1,-1],["UP",-1,-1],["S",1,1],["DOWN",1,1],["A",-1,1],["LEFT",-1,1],["D",1,-1],["RIGHT",1,-1]].forEach(([key,dx,dy])=>{
      this.input.keyboard.on("keydown-"+key,()=>{
        if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;
        this.step(dx,dy);
      });
    });

    this.input.keyboard.on("keydown-E",()=>{
      if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;
      const near=this.nearestAgent();
      if(near)this.openAgent(near);
    });
  }

  step(dx,dy){
    if(this.walking)return;
    const nx=this.playerGrid.gx+dx,ny=this.playerGrid.gy+dy;
    if(!inside(nx,ny)||this.blocked.has(keyOf(nx,ny)))return;
    this.walkPath([{gx:nx,gy:ny}]);
  }

  walkTo(gx,gy,onDone=null){
    if(this.blocked.has(keyOf(gx,gy))){
      const free=this.closestFreeNeighbor(gx,gy);
      if(!free)return;
      gx=free.gx;gy=free.gy;
    }
    const path=this.findPath(this.playerGrid.gx,this.playerGrid.gy,gx,gy);
    if(path.length)this.walkPath(path,onDone);
  }

  walkToAgent(agent){
    const target=this.closestFreeNeighbor(agent.gx,agent.gy,this.playerGrid);
    if(!target){this.openAgent(agent);return;}
    this.walkTo(target.gx,target.gy,()=>this.openAgent(agent));
  }

  closestFreeNeighbor(gx,gy,from=this.playerGrid){
    const options=[
      {gx:gx-1,gy},{gx:gx+1,gy},{gx,gy:gy-1},{gx,gy:gy+1},
      {gx:gx-1,gy:gy-1},{gx:gx+1,gy:gy+1},{gx:gx-1,gy:gy+1},{gx:gx+1,gy:gy-1}
    ].filter(p=>inside(p.gx,p.gy)&&!this.blocked.has(keyOf(p.gx,p.gy)));
    options.sort((a,b)=>Math.hypot(a.gx-from.gx,a.gy-from.gy)-Math.hypot(b.gx-from.gx,b.gy-from.gy));
    return options[0]||null;
  }

  findPath(sx,sy,tx,ty){
    const open=[{gx:sx,gy:sy,g:0,f:0}],came=new Map(),best=new Map([[keyOf(sx,sy),0]]);
    const dirs=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.4],[-1,-1,1.4],[1,-1,1.4],[-1,1,1.4]];
    while(open.length){
      open.sort((a,b)=>a.f-b.f);
      const cur=open.shift();
      if(cur.gx===tx&&cur.gy===ty){
        const path=[];let k=keyOf(tx,ty);
        while(k!==keyOf(sx,sy)){
          const [x,y]=k.split(",").map(Number);
          path.unshift({gx:x,gy:y});k=came.get(k);if(!k)break;
        }
        return path;
      }
      for(const [dx,dy,cost] of dirs){
        const nx=cur.gx+dx,ny=cur.gy+dy;
        if(!inside(nx,ny)||this.blocked.has(keyOf(nx,ny)))continue;
        if(dx&&dy&&this.blocked.has(keyOf(cur.gx+dx,cur.gy))&&this.blocked.has(keyOf(cur.gx,cur.gy+dy)))continue;
        const ng=cur.g+cost,nk=keyOf(nx,ny);
        if(ng>=(best.get(nk)??Infinity))continue;
        best.set(nk,ng);came.set(nk,keyOf(cur.gx,cur.gy));
        open.push({gx:nx,gy:ny,g:ng,f:ng+Math.hypot(tx-nx,ty-ny)});
      }
    }
    return[];
  }

  walkPath(path,onDone=null){
    if(!path.length){onDone?.();return;}
    this.walking=true;
    const queue=[...path];
    const next=()=>{
      const step=queue.shift();
      if(!step){
        this.walking=false;this.updateInteraction();onDone?.();return;
      }
      const p=tileCenter(step.gx,step.gy);
      this.tweens.add({
        targets:this.player,x:p.x,y:p.y-5,duration:140,ease:"Linear",
        onUpdate:()=>this.player.setDepth((step.gx+step.gy)*100+80),
        onComplete:()=>{this.playerGrid=step;this.updateInteraction();next();}
      });
    };
    next();
  }

  nearestAgent(){
    let best=null,dist=Infinity;
    for(const agent of AGENTS){
      const d=Math.max(Math.abs(agent.gx-this.playerGrid.gx),Math.abs(agent.gy-this.playerGrid.gy));
      if(d<=2&&d<dist){best=agent;dist=d;}
    }
    return best;
  }

  updateInteraction(){
    const near=this.nearestAgent();
    const box=document.querySelector("#interaction");
    const text=document.querySelector("#interactionText");
    const mobile=document.querySelector("#talkMobile");
    box.style.display=near?"block":"none";
    text.textContent=near?"Falar com "+near.name:"Falar";
    mobile.style.display=near?"block":"none";
  }

  openAgent(agent){
    window.dispatchEvent(new CustomEvent("agency:open-agent",{detail:agent}));
    this.showSpeech(agent,"Oi, Hianto. O que vamos fazer?");
  }

  setSelectedAgent(agent){
    if(!agent)return;
    this.selectedMarker.clear();
    const p=isoTop(agent.gx,agent.gy);
    this.selectedMarker.lineStyle(3,0xffd66b,1);
    this.selectedMarker.beginPath();this.selectedMarker.moveTo(p.x,p.y);this.selectedMarker.lineTo(p.x+TILE_W/2,p.y+TILE_H/2);this.selectedMarker.lineTo(p.x,p.y+TILE_H);this.selectedMarker.lineTo(p.x-TILE_W/2,p.y+TILE_H/2);this.selectedMarker.closePath();this.selectedMarker.strokePath();
    this.selectedMarker.setDepth((agent.gx+agent.gy)*100+2);
  }

  showSpeech(agent,text){
    const obj=this.agentObjects.get(agent.name);
    if(!obj)return;
    const excerpt=String(text||"").replace(/\s+/g," ").slice(0,92);
    const bubble=this.add.text(obj.x,obj.y-78,excerpt,{fontFamily:"Arial",fontSize:"11px",color:"#132033",backgroundColor:"#f4f8ffff",padding:{x:7,y:5},wordWrap:{width:180}}).setOrigin(.5,1).setDepth(12000);
    this.tweens.add({targets:bubble,alpha:0,delay:3800,duration:700,onComplete:()=>bubble.destroy()});
  }

  showHandoff(from,to,reason){
    const a=this.agentObjects.get(from.name),b=this.agentObjects.get(to.name);
    if(!a||!b)return;
    const g=this.add.graphics().setDepth(11500);
    g.lineStyle(4,0xb88cff,.95);g.beginPath();g.moveTo(a.x,a.y-28);g.lineTo(b.x,b.y-28);g.strokePath();
    const label=this.add.text((a.x+b.x)/2,(a.y+b.y)/2-35,"HANDOFF → "+to.name,{fontFamily:"Arial",fontSize:"12px",fontStyle:"bold",color:"#fff",backgroundColor:"#3b265dcc",padding:{x:7,y:4}}).setOrigin(.5).setDepth(11600);
    this.tweens.add({targets:[g,label],alpha:0,delay:2200,duration:800,onComplete:()=>{g.destroy();label.destroy();}});
    this.showSpeech(from,"Passando para "+to.name+": "+reason);
  }

  animateOfficeLife(){
    const workers=AGENTS.filter(a=>a.status==="working");
    const agent=Phaser.Utils.Array.GetRandom(workers),obj=this.agentObjects.get(agent?.name);
    if(!obj)return;
    const badge=this.add.text(obj.x,obj.y-50,"⋯",{fontFamily:"Arial",fontSize:"18px",color:"#8fe2ae"}).setOrigin(.5).setDepth(11000);
    this.tweens.add({targets:badge,y:badge.y-8,alpha:0,duration:900,onComplete:()=>badge.destroy()});
  }
}

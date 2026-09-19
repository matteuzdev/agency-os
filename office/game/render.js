import {TILE_W,TILE_H,GRID_W,GRID_H,ZONES,zoneFor,isoTop,tileCenter} from "./config.js";

const rgb=(hex,delta=0)=>{
  const r=Math.max(0,Math.min(255,((hex>>16)&255)+delta));
  const g=Math.max(0,Math.min(255,((hex>>8)&255)+delta));
  const b=Math.max(0,Math.min(255,(hex&255)+delta));
  return (r<<16)|(g<<8)|b;
};
const hashColor=name=>{
  let h=0;for(const ch of name)h=((h<<5)-h)+ch.charCodeAt(0);
  const palette=[0x4f8edc,0x8a63d2,0x3e9d78,0xd07b55,0xd0a34b,0x5f78c9,0xb85f7c,0x4d9ca7];
  return palette[Math.abs(h)%palette.length];
};

export function drawIsoBlock(scene,x,y,w,h,top,left,right,depth){
  const g=scene.add.graphics().setDepth(depth),half=w/2,topY=y-h;
  g.fillStyle(top,1);g.lineStyle(1,rgb(top,24),.75);
  g.beginPath();g.moveTo(x,topY);g.lineTo(x+half,topY+w/4);g.lineTo(x,topY+w/2);g.lineTo(x-half,topY+w/4);g.closePath();g.fillPath();g.strokePath();
  g.fillStyle(left,1);g.beginPath();g.moveTo(x-half,topY+w/4);g.lineTo(x,topY+w/2);g.lineTo(x,y+w/4);g.lineTo(x-half,y);g.closePath();g.fillPath();
  g.fillStyle(right,1);g.beginPath();g.moveTo(x+half,topY+w/4);g.lineTo(x,topY+w/2);g.lineTo(x,y+w/4);g.lineTo(x+half,y);g.closePath();g.fillPath();
  return g;
}

function wallTile(scene,gx,gy,side,zone,door=false){
  if(door)return;
  const p=isoTop(gx,gy),h=42,g=scene.add.graphics().setDepth(5);
  if(side==="top"){
    g.fillStyle(0x8999aa,1);g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+TILE_W/2,p.y+TILE_H/2);g.lineTo(p.x+TILE_W/2,p.y+TILE_H/2-h);g.lineTo(p.x,p.y-h);g.closePath();g.fillPath();
    g.lineStyle(2,0xaebcca,.8);g.strokePath();
  }else{
    g.fillStyle(0x657487,1);g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-TILE_W/2,p.y+TILE_H/2);g.lineTo(p.x-TILE_W/2,p.y+TILE_H/2-h);g.lineTo(p.x,p.y-h);g.closePath();g.fillPath();
    g.lineStyle(2,0x8391a2,.7);g.strokePath();
  }
  const base=scene.add.graphics().setDepth(6);base.lineStyle(3,zone.color,1);base.beginPath();
  if(side==="top"){base.moveTo(p.x,p.y);base.lineTo(p.x+TILE_W/2,p.y+TILE_H/2);}
  else{base.moveTo(p.x,p.y);base.lineTo(p.x-TILE_W/2,p.y+TILE_H/2);}
  base.strokePath();
}

function drawZoneWalls(scene,z){
  const doorX=z.x+Math.floor(z.w/2),doorY=z.y+Math.floor(z.h/2);
  for(let x=z.x;x<z.x+z.w;x++)wallTile(scene,x,z.y,"top",z,x===doorX);
  for(let y=z.y;y<z.y+z.h;y++)wallTile(scene,z.x,y,"left",z,y===doorY);
}

function floorTile(scene,gx,gy,zone){
  const p=isoTop(gx,gy),g=scene.add.graphics().setDepth(0);
  let color=zone?zone.color:(((gx+gy)%2)?0x1d2a3b:0x202f42);
  if(zone&&((gx+gy)%2))color=rgb(color,6);
  g.fillStyle(color,1);g.lineStyle(1,rgb(color,18),.5);
  g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+TILE_W/2,p.y+TILE_H/2);g.lineTo(p.x,p.y+TILE_H);g.lineTo(p.x-TILE_W/2,p.y+TILE_H/2);g.closePath();g.fillPath();g.strokePath();
}

function plant(scene,gx,gy){
  const p=tileCenter(gx,gy),d=(gx+gy)*100+20;
  drawIsoBlock(scene,p.x,p.y+10,26,16,0x9a7048,0x68482f,0x513823,d);
  const stem=scene.add.rectangle(p.x,p.y-15,5,30,0x315d3d).setDepth(d+4);
  for(const [dx,dy] of [[-10,-21],[10,-22],[-8,-31],[8,-33],[0,-38]])scene.add.ellipse(p.x+dx,p.y+dy,18,10,0x4f9b62).setDepth(d+5);
  return stem;
}
function chair(scene,gx,gy,offsetX=0,offsetY=0){
  const p=tileCenter(gx,gy),d=(gx+gy)*100+30;
  drawIsoBlock(scene,p.x+offsetX,p.y+offsetY+12,30,13,0x3e526b,0x28384d,0x202f42,d);
  scene.add.rectangle(p.x+offsetX,p.y+offsetY-4,24,22,0x4b6380).setAngle(-1).setDepth(d+1);
}
function sofa(scene,gx,gy,color=0x536c88){
  const p=tileCenter(gx,gy),d=(gx+gy)*100+25;
  drawIsoBlock(scene,p.x,p.y+15,70,20,rgb(color,12),rgb(color,-22),rgb(color,-36),d);
  scene.add.rectangle(p.x,p.y-8,58,25,color).setDepth(d+3);
  scene.add.rectangle(p.x-28,p.y+3,10,24,rgb(color,-8)).setDepth(d+4);
  scene.add.rectangle(p.x+28,p.y+3,10,24,rgb(color,-8)).setDepth(d+4);
}
function whiteboard(scene,gx,gy,title="IDEIAS"){
  const p=tileCenter(gx,gy),d=(gx+gy)*100+40;
  scene.add.rectangle(p.x,p.y-38,72,42,0xe7edf2).setStrokeStyle(3,0x5f6d7d).setDepth(d);
  scene.add.text(p.x,p.y-42,title,{fontFamily:"monospace",fontSize:"9px",fontStyle:"bold",color:"#26394f"}).setOrigin(.5).setDepth(d+1);
  scene.add.line(p.x,p.y-28,-22,0,20,0,0x62a76f).setLineWidth(3).setDepth(d+1);
}
function serverRack(scene,gx,gy){
  const p=tileCenter(gx,gy),d=(gx+gy)*100+35;
  drawIsoBlock(scene,p.x,p.y+8,42,58,0x424c59,0x252c36,0x1d242c,d);
  for(let i=0;i<4;i++){
    scene.add.rectangle(p.x+5,p.y-39+i*11,24,7,0x111821).setDepth(d+3);
    scene.add.circle(p.x+13,p.y-39+i*11,2,i%2?0x59df7e:0x66aaff).setDepth(d+4);
  }
}
function coffeeMachine(scene,gx,gy){
  const p=tileCenter(gx,gy),d=(gx+gy)*100+30;
  drawIsoBlock(scene,p.x,p.y+8,34,28,0x545a66,0x343944,0x292e38,d);
  scene.add.rectangle(p.x,p.y-18,20,20,0x202633).setDepth(d+2);
  scene.add.circle(p.x,p.y-16,3,0xe5a74e).setDepth(d+3);
  const steam=scene.add.text(p.x,p.y-42,"♨",{fontSize:"16px",color:"#dbe7f6"}).setOrigin(.5).setDepth(d+4);
  scene.tweens.add({targets:steam,y:steam.y-8,alpha:.15,duration:1300,yoyo:true,repeat:-1});
}
function bookshelf(scene,gx,gy){
  const p=tileCenter(gx,gy),d=(gx+gy)*100+30;
  drawIsoBlock(scene,p.x,p.y+5,42,55,0x765238,0x513724,0x3e2a1c,d);
  const colors=[0xc15b59,0x4d83c1,0xd1a145,0x5d9a70];
  for(let row=0;row<3;row++)for(let col=0;col<4;col++)scene.add.rectangle(p.x-12+col*8,p.y-39+row*12,5,10,colors[(row+col)%colors.length]).setDepth(d+3);
}
function meetingTable(scene,gx,gy){
  const p=tileCenter(gx,gy),d=(gx+gy)*100+25;
  drawIsoBlock(scene,p.x,p.y+12,95,18,0x8a6543,0x5d412b,0x493321,d);
  for(const ox of [-52,52]){scene.add.rectangle(p.x+ox,p.y+4,18,18,0x40536b).setDepth(d+2);}
}
function rug(scene,gx,gy,color=0x8c5261){
  const p=isoTop(gx,gy),g=scene.add.graphics().setDepth(1);
  g.fillStyle(color,.85);g.beginPath();g.moveTo(p.x,p.y+2);g.lineTo(p.x+TILE_W,p.y+TILE_H+2);g.lineTo(p.x,p.y+TILE_H*2+2);g.lineTo(p.x-TILE_W,p.y+TILE_H+2);g.closePath();g.fillPath();
}
function zoneLabel(scene,z){
  const p=tileCenter(z.x+Math.floor(z.w/2),z.y);
  scene.add.text(p.x,p.y-80,z.name,{fontFamily:"monospace",fontSize:"12px",fontStyle:"bold",color:"#f1f6ff",backgroundColor:"#0b1220d9",padding:{x:7,y:4}}).setOrigin(.5).setDepth(9500);
}

export function drawWorld(scene){
  for(let gx=0;gx<GRID_W;gx++)for(let gy=0;gy<GRID_H;gy++)floorTile(scene,gx,gy,zoneFor(gx,gy));
  ZONES.forEach(z=>{drawZoneWalls(scene,z);zoneLabel(scene,z);});

  rug(scene,11,5,0x78485e);
  sofa(scene,10,6,0x5a6f8b);sofa(scene,13,5,0x755a83);coffeeMachine(scene,12,6);plant(scene,9,6);plant(scene,15,6);

  whiteboard(scene,7,4,"STRATEGY");bookshelf(scene,1,5);plant(scene,7,5);
  sofa(scene,22,5,0x76547f);plant(scene,16,5);whiteboard(scene,22,3,"CONTENT");
  whiteboard(scene,7,10,"GROWTH");plant(scene,1,11);
  bookshelf(scene,9,11);plant(scene,14,11);
  meetingTable(scene,20,11);plant(scene,22,11);
  whiteboard(scene,7,16,"AUTOMATION");coffeeMachine(scene,1,16);
  bookshelf(scene,9,16);whiteboard(scene,14,16,"QA");
  serverRack(scene,16,16);serverRack(scene,23,16);plant(scene,16,13);
}

export function createAvatar(scene,agent,x,y,isPlayer=false){
  const c=scene.add.container(x,y),shirt=isPlayer?0x4d8df5:hashColor(agent.name||"agent");
  const shadow=scene.add.ellipse(0,18,34,11,0x000000,.24);
  const shoe1=scene.add.rectangle(-7,13,7,5,0x1d2530),shoe2=scene.add.rectangle(7,13,7,5,0x1d2530);
  const legs=scene.add.rectangle(0,5,18,20,isPlayer?0x315e9b:0x33465d);
  const body=scene.add.rectangle(0,-8,25,25,shirt);
  const arm1=scene.add.rectangle(-15,-7,6,20,rgb(shirt,-18)),arm2=scene.add.rectangle(15,-7,6,20,rgb(shirt,-18));
  const head=scene.add.rectangle(0,-30,19,19,0xe6b794);
  const ears=[scene.add.rectangle(-11,-30,3,7,0xd99f7c),scene.add.rectangle(11,-30,3,7,0xd99f7c)];
  const hair=scene.add.rectangle(0,-39,20,7,isPlayer?0x2b211b:0x3b2b24);
  const eye1=scene.add.rectangle(-4,-31,2,2,0x101010),eye2=scene.add.rectangle(4,-31,2,2,0x101010);
  const mouth=scene.add.rectangle(0,-25,5,1,0x9b5c50);
  const label=scene.add.text(0,-60,isPlayer?"HIANTO":agent.name,{fontFamily:"monospace",fontSize:isPlayer?"11px":"10px",fontStyle:"bold",color:"#fff",backgroundColor:isPlayer?"#1e5faacc":"#0a111dcc",padding:{x:4,y:2}}).setOrigin(.5);
  c.add([shadow,shoe1,shoe2,legs,body,arm1,arm2,head,...ears,hair,eye1,eye2,mouth,label]);
  if(!isPlayer){
    const status=scene.add.circle(14,-44,4,agent.status==="working"?0x58dd8b:agent.status==="blocked"?0xff6f76:0xf1c85f,1);
    c.add(status);
  }
  c.setScale(1.08);
  return c;
}

export function drawAgentDesk(scene,agent){
  const p=tileCenter(agent.gx,agent.gy),depth=(agent.gx+agent.gy)*100+40;
  chair(scene,agent.gx,agent.gy,0,25);
  drawIsoBlock(scene,p.x,p.y+18,54,20,0x815b3d,0x5a3c28,0x422e20,depth-3);
  scene.add.rectangle(p.x,p.y-7,26,15,0x111c2b).setStrokeStyle(2,0x65a8e8).setDepth(depth+2);
  scene.add.rectangle(p.x,p.y+4,18,4,0x4c5663).setDepth(depth+2);
  scene.add.rectangle(p.x-17,p.y+2,7,10,0xe5e9ee).setDepth(depth+3);
  return {p,depth};
}

import {TILE_W,TILE_H,GRID_W,GRID_H,ZONES,zoneFor,isoTop,tileCenter} from "./config.js";

export function drawIsoBlock(scene,x,y,w,h,top,left,right,depth){
  const g=scene.add.graphics().setDepth(depth),half=w/2,topY=y-h;
  g.fillStyle(top,1);
  g.beginPath();g.moveTo(x,topY);g.lineTo(x+half,topY+w/4);g.lineTo(x,topY+w/2);g.lineTo(x-half,topY+w/4);g.closePath();g.fillPath();
  g.fillStyle(left,1);
  g.beginPath();g.moveTo(x-half,topY+w/4);g.lineTo(x,topY+w/2);g.lineTo(x,y+w/4);g.lineTo(x-half,y);g.closePath();g.fillPath();
  g.fillStyle(right,1);
  g.beginPath();g.moveTo(x+half,topY+w/4);g.lineTo(x,topY+w/2);g.lineTo(x,y+w/4);g.lineTo(x+half,y);g.closePath();g.fillPath();
  return g;
}

function drawZoneWalls(scene,zone){
  const g=scene.add.graphics().setDepth(2),wallH=24;
  for(let x=zone.x;x<zone.x+zone.w;x++){
    if(x===zone.x+Math.floor(zone.w/2))continue;
    const p=isoTop(x,zone.y);
    g.fillStyle(0x7b8aa1,1);
    g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+TILE_W/2,p.y+TILE_H/2);g.lineTo(p.x+TILE_W/2,p.y+TILE_H/2-wallH);g.lineTo(p.x,p.y-wallH);g.closePath();g.fillPath();
    g.lineStyle(1,0xa5b5ca,.7);g.strokePath();
  }
  for(let y=zone.y;y<zone.y+zone.h;y++){
    if(y===zone.y+Math.floor(zone.h/2))continue;
    const p=isoTop(zone.x,y);
    g.fillStyle(0x59687c,1);
    g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-TILE_W/2,p.y+TILE_H/2);g.lineTo(p.x-TILE_W/2,p.y+TILE_H/2-wallH);g.lineTo(p.x,p.y-wallH);g.closePath();g.fillPath();
    g.lineStyle(1,0x91a0b5,.55);g.strokePath();
  }
}

export function drawWorld(scene){
  const floor=scene.add.graphics().setDepth(0);
  for(let gx=0;gx<GRID_W;gx++){
    for(let gy=0;gy<GRID_H;gy++){
      const p=isoTop(gx,gy),zone=zoneFor(gx,gy),base=zone?zone.color:((gx+gy)%2?0x1d2a3b:0x202f42);
      floor.fillStyle(base,1);floor.lineStyle(1,0x344960,.72);
      floor.beginPath();floor.moveTo(p.x,p.y);floor.lineTo(p.x+TILE_W/2,p.y+TILE_H/2);floor.lineTo(p.x,p.y+TILE_H);floor.lineTo(p.x-TILE_W/2,p.y+TILE_H/2);floor.closePath();floor.fillPath();floor.strokePath();
    }
  }
  for(const zone of ZONES){
    drawZoneWalls(scene,zone);
    const p=tileCenter(zone.x+Math.floor(zone.w/2),zone.y);
    scene.add.text(p.x,p.y-64,zone.name,{fontFamily:"Arial",fontSize:"14px",fontStyle:"bold",color:"#d9e7ff",backgroundColor:"#0c1321cc",padding:{x:8,y:4}}).setOrigin(.5).setDepth(9500).setAlpha(.9);
  }
  const lounge=tileCenter(8,6);
  drawIsoBlock(scene,lounge.x,lounge.y,50,22,0x765438,0x513620,0x3e2b1c,4500);
  scene.add.text(lounge.x,lounge.y-32,"☕",{fontFamily:"Arial",fontSize:"18px"}).setOrigin(.5).setDepth(4600);
}

export function createAvatar(scene,agent,x,y,isPlayer=false){
  const c=scene.add.container(x,y);
  const shadow=scene.add.ellipse(0,18,30,10,0x000000,.28);
  const legs=scene.add.rectangle(0,7,18,22,isPlayer?0x2e68b6:0x3d536f);
  const body=scene.add.rectangle(0,-8,24,26,isPlayer?0x4a8cf7:(agent.status==="blocked"?0xa04b55:agent.status==="working"?0x397e60:0x7a6537));
  const head=scene.add.rectangle(0,-29,18,18,0xe3b291);
  const hair=scene.add.rectangle(0,-37,19,6,isPlayer?0x2b211b:0x3a2b23);
  const eye1=scene.add.rectangle(-4,-30,2,2,0x111111);
  const eye2=scene.add.rectangle(4,-30,2,2,0x111111);
  const label=scene.add.text(0,-58,isPlayer?"HIANTO":agent.name,{fontFamily:"Arial",fontSize:isPlayer?"12px":"11px",fontStyle:"bold",color:"#f5f8ff",backgroundColor:isPlayer?"#1f5caacc":"#0b1220cc",padding:{x:4,y:2}}).setOrigin(.5);
  c.add([shadow,legs,body,head,hair,eye1,eye2,label]);
  if(!isPlayer)c.add(scene.add.circle(14,-43,4,agent.status==="working"?0x5fe08f:agent.status==="blocked"?0xff7070:0xf1c761,1));
  return c;
}

export function drawAgentDesk(scene,agent){
  const p=tileCenter(agent.gx,agent.gy),depth=(agent.gx+agent.gy)*100+40;
  drawIsoBlock(scene,p.x,p.y+18,48,20,0x7a5739,0x573b25,0x412d1e,depth-3);
  const screen=scene.add.rectangle(p.x,p.y-3,22,12,0x102034).setStrokeStyle(1,0x65a8e8).setDepth(depth+2);
  return {p,depth,screen};
}

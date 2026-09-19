import {OfficeScene} from "./scene.js";
import {bindUI} from "./ui.js";

bindUI();

if(typeof Phaser==="undefined"){
  document.querySelector("#gameStage").innerHTML='<div style="padding:80px;color:#fff">Phaser não carregou. Recarregue a página.</div>';
}else{
  new Phaser.Game({
    type:Phaser.AUTO,
    parent:"gameStage",
    backgroundColor:"#0c111b",
    scale:{mode:Phaser.Scale.RESIZE,width:"100%",height:"100%"},
    render:{pixelArt:true,antialias:false},
    scene:[OfficeScene]
  });
}

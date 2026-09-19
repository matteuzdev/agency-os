import {OfficeScene} from "./scene.js";
import {bindUI} from "./ui.js";

function bootGame(){
  const stage=document.querySelector("#gameStage");
  if(!stage)return;

  if(typeof Phaser==="undefined"){
    stage.innerHTML='<div style="padding:90px 24px;color:#fff;font:14px system-ui">Falha ao carregar a engine do Office. Recarregue a página.</div>';
    return;
  }

  try{
    window.__agencyGame=new Phaser.Game({
      type:Phaser.AUTO,
      parent:"gameStage",
      backgroundColor:"#0c111b",
      scale:{mode:Phaser.Scale.RESIZE,width:"100%",height:"100%"},
      render:{pixelArt:true,antialias:false},
      scene:[OfficeScene]
    });
  }catch(error){
    console.error("Agency OS game boot failed",error);
    stage.innerHTML='<div style="padding:90px 24px;color:#fff;font:14px system-ui">O Office não conseguiu iniciar: '+String(error?.message||error)+'</div>';
  }
}

// O jogo nunca deve depender do painel/chat para existir.
bootGame();

try{
  bindUI();
}catch(error){
  console.error("Agency OS UI boot failed; game remains available",error);
  const stage=document.querySelector("#gameStage");
  if(stage){
    const warning=document.createElement("div");
    warning.style.cssText="position:absolute;left:16px;bottom:70px;z-index:99;background:#401d22;color:#ffd7d7;border:1px solid #8f4650;border-radius:8px;padding:8px 10px;font:11px system-ui";
    warning.textContent="Painel auxiliar com erro; escritório continua ativo.";
    stage.parentElement?.appendChild(warning);
  }
}

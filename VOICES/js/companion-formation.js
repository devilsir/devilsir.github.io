/* Registered module: companion-formation */
(function(init){if(window.VoicesModules)window.VoicesModules.define('companion-formation',init);else init();})(function(){
  'use strict';
  const V=window.V,M=V.AncestralMask;
  const positions={
    pix:[[104,-61]],
    companion:[[-154,83],[-131,112],[-108,144],[-52,210],[0,202],[-105,-125],[0,-170]],
    animal:[[105,74],[116,49],[80,107],[53,128],[120,18],[0,136],[105,-145]]
  };
  const offset=(p,[x,y])=>({x:p.x+x,y:p.y+y});
  V.FollowerPositions={
    point(kind,p){return offset(p,positions[kind][0]);},
    ground(kind,p,map,radius){
      for(const row of positions[kind]){
        const point=offset(p,row),{x,y}=point;
        if(x>=radius&&y>=radius&&x<=map.width*48-radius&&y<=map.height*48-radius&&!V.Living.blocked(map,x,y,radius))return point;
      }
      return null;
    }
  };

  // PIX now occupies its own position, so the mask can keep its original orbit.
  M.point=function(player=V.Player.data,map=V.World.current){
    const track=this.track(player,map);
    if(!track)return null;
    const time=V.Engine.time||0,reduced=V.settings.reducedMotion,actor=this.variant(player);
    const angle=reduced?0:time*.76+actor*.75,cos=Math.cos(angle),sin=Math.sin(angle);
    const pose=this.pose(player,track,time,cos);
    const x=V.clamp((reduced?player.x:track.x)+cos*49,27,map.width*48-27);
    const y=V.clamp((reduced?player.y:track.y)-(reduced?42:30)+sin*63+(reduced?0:Math.sin(time*2.1)*2)-pose.lift,28,map.height*48-32);
    return {x,y,groundY:y+31,back:!reduced&&sin<0,size:54,angle,variant:actor,...pose};
  };
});

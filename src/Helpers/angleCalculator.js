/* --------------------------------
USED TO CACULATE SPAWN COORDINATES
R = RADIAN OF GROUNDCYLINDER
ROTX = GROUNDCYLINDER ROTATION X 
----------------------------------*/

export function spawnPosition(r, rotX){
    rotX = rotX % 6.28319;
    var a = -rotX + Math.PI;

    var coords = {x: 0, z: 0};
    if(a>=0 && a<= Math.PI){
        coords.z = r * Math.sin(a);
    }else{
        coords.z = r * Math.sin(a-Math.PI) * -1;
    }

    if(a>Math.PI/2 && a<= 2*Math.PI/3){
        coords.x = r * Math.cos(a);
    }else{
        coords.x = r * Math.cos(a-Math.PI) * -1;
    }
    
    return coords;
}
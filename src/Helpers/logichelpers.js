export function laneToPos(lane){
    if(lane<=1){
        return 1;
    }
    else if (lane>=3){
        return -1;
    }
    else{
        return 0;
    }
}

export function DarkenColor(color, lightness) {
  
    return (Math.max(0, Math.min(((color & 0xFF0000) / 0x10000) - lightness, 0xFF)) * 0x10000) +
        (Math.max(0, Math.min(((color & 0x00FF00) / 0x100) - lightness, 0xFF)) * 0x100) +
        (Math.max(0, Math.min(((color & 0x0000FF)) - lightness, 0xFF)));
  
};
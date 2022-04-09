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

// switch (lane){
        //     case 1:
        //         return 1;
        //     case 2:
        //         return 0;
        //     case 3:
        //         return -1;
        // } 
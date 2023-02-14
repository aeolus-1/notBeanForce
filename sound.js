/*
====Sounds====
gun,
(shoot)grenade,
explosion,
hit,
hitGround,
teleport,
death,
jump,
*/

class SoundController {
    static playerSound(soundName) {
        var link = {
            /*"shoot":[
                "shoot1",
                "shoot2",
                "shoot3",
            ]*/
        }[soundName]||["yya"]
        var link = link[randInt(0,link.length-1)],
            audio = new Audio("sfx/"+link);
        audio.play();    
    }
}
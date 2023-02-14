/*
====Sounds====
gun,
(shoot)grenade,
explosion,
hit,
hitGround,
teleport,
*/

class SoundController {
    static playerSound(soundName) {
        var link = {
            /*"shoot":[
                "shoot1",
                "shoot2",
                "shoot3",
            ]*/
            jump: ["jump.wav"],
            gun: ["laserShoot.wav"],
            explosion: ["explosion.wav"]
        }[soundName]
        var link = link[randInt(0,link.length-1)],
            audio = new Audio("sfx/"+link);
        audio.play();    
    }
}
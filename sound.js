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
    static playerSound(soundName, magnitude=1) {
        var link = {
            /*"shoot":[
                "shoot1",
                "shoot2",
                "shoot3",
            ]*/
            jump: ["jump.wav"],
            gun: ["laserShoot.wav", "laserShoot (1).wav", "laserShoot (2).wav", "laserShoot (3).wav", "laserShoot (4).wav", "laserShoot (5).wav", "laserShoot (6).wav"],
            explosion: ["explosion.wav"],
            hit: ["hit (1).wav","hit (2).wav","hit (3).wav",],
            hitGround: ["hitGround.wav"],
            death: ["death.mp3"],
        }[soundName]
        if (link != undefined) {
            var link = link[randInt(0,link.length-1)],
                audio = new Audio("sfx/"+link);

                audio.volume = magnitude
            audio.play();  
        }  
    }
}
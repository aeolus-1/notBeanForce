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
<<<<<<< HEAD
        }[soundName]||["yya"]
=======
            jump: ["jump.wav"],
            gun: ["laserShoot.wav", "laserShoot (1).wav", "laserShoot (2).wav", "laserShoot (3).wav", "laserShoot (4).wav", "laserShoot (5).wav", "laserShoot (6).wav"],
            explosion: ["explosion.wav"]
        }[soundName]
>>>>>>> e0e0bfcbcecc058c5953d727fa8796841afe784d
        var link = link[randInt(0,link.length-1)],
            audio = new Audio("sfx/"+link);
        audio.play();    
    }
}
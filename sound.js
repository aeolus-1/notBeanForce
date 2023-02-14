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
    constructor() {
        this.sounds = {
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
            teleport: ["teleport.wav"],
            join: ["join.mp3"],
        },
        this.audios = {}
        var soundIds = Object.keys(this.sounds)
        for (let i = 0; i < soundIds.length; i++) {
            const array = this.sounds[soundIds[i]]
            this.audios[soundIds[i]] = []
            for (let j = 0; j < array.length; j++) {
                const ref = array[j];
                var queue = {
                    pointer:1,
                    audios:[]
                }
                for (let l = 0; l < 10; l++) {
                    queue.audios.push(new Audio("sfx/"+ref))
                }
                this.audios[soundIds[i]].push(queue)
            }
            
        }
        
    }
    playSound(queue, volume) {
        var audio = queue.audios[queue.pointer]
        audio.volume = volume
        audio.play()
        queue.pointer = stopOverflow(queue.pointer+1, queue.audios.length-1)
        return audio
    }
    playerSound(soundName, volume=1) {
        var link = this.audios[soundName]
        if (link != undefined) {
            var link = link[randInt(0,link.length-1)]

            return this.playSound(link, volume)
            
        }  
        return {stop:function(){}}
    }
    emitSoundFromPosition(name, pos1, pos2, volume=1) {
        
        var dst = getDst(pos1, pos2),
            maxDst = 3000,
            localVolume = 1-clamp(dst/maxDst, 0, 1)
        this.playerSound(name, localVolume*volume)
    }
}

var soundController = new SoundController()
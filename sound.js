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

            /*
            jump: ["jump.wav"],
            gun: ["laserShoot.wav", "laserShoot (1).wav", "laserShoot (2).wav", "laserShoot (3).wav", "laserShoot (4).wav", "laserShoot (5).wav", "laserShoot (6).wav"],
            explosion: ["explosion.wav"],
            hit: ["hit (1).wav","hit (2).wav","hit (3).wav",],
            hitGround: ["hitGround.wav"],
            death: ["death.mp3"],
            teleport: ["teleport.wav"],
            join: ["join.mp3"],

            */
            jump: ["jump1.wav","jump2.wav","jump3.wav","jump4.wav","jump5.wav",],
            gun: ["shoot1.wav","shoot2.wav","shoot3.wav","shoot4.wav","shoot5.wav","shoot6.wav","shoot7.wav","shoot8.wav","shoot9.wav",],
            explosion: ["explosion1.wav","explosion2.wav","explosion3.wav","explosion4.wav",],
            hit: ["hurt1.wav","hurt2.wav","hurt3.wav","hurt4.wav",],
            bounce: ["bounce1.wav","bounce2.wav","bounce3.wav","bounce4.wav","bounce5.wav","bounce6.wav",],
            hitGround: ["hitGround1.wav","hitGround2.wav","hitGround3.wav","hitGround4.wav","hitGround5.wav",],
            death: ["death1.wav","death2.wav",],
            teleport: ["teleport.wav"],
            join: ["./../join.mp3"],
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
                    audios:[],
                    name:ref,
                }
                for (let l = 0; l < 10; l++) {
                    queue.audios.push(new Audio("sfx/voiceEffects/"+ref))
                }
                this.audios[soundIds[i]].push(queue)
            }
            
        }
        
    }
    playSound(queue, volume) {
        var audio = queue.audios[queue.pointer]
        audio.volume = volume
        audio.play()
        
        console.log(queue.name, audio.volume)
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
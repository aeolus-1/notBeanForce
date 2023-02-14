class SoundController {
    static playerSound(soundName) {
        var link = {
            /*"shoot":[
                "shoot1",
                "shoot2",
                "shoot3",
            ]*/
        }[soundName]
        var link = link[randInt(0,link.length-1)],
            audio = new Audio("sfx"+link);
        audio.play();    
    }
}
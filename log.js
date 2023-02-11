var log = []
function renderLog() {
    /*ctx.translate(camera.x-(render.canvas.width*0.75), camera.y-(render.canvas.height*0.75))
    //ctx.fillRect(0,0, 100, 100)
    for (let i = 0; i < log.length; i++) {
        const msg = log[i];
        var fontSize = 40
        ctx.font = `${fontSize}px Comic Sans MS`
        TextParser.renderJSONText(ctx, v(10, (render.canvas.height*1.5)-(i*fontSize)-20), msg.text)
        //ctx.fillText(msg.text, 10, (render.canvas.height*1.5)-(i*fontSize)-20)
    }*/
    var logDiv = document.getElementById("logDiv")
    logDiv.innerHTML = ""
    for (let i = 0; i < log.length; i++) {
        const msg = log[i];
        
        msg.text.replace("<script>", "<immadick>")
        msg.text.replace("</script>", "</immadick>")
        logDiv.appendChild(createElementFromHTML(`<div class="textblock">${msg.text}</div>`))
        //ctx.fillText(msg.text, 10, (render.canvas.height*1.5)-(i*fontSize)-20)
    }
    if (resetScrollTimeout == null) {
        document.getElementById("logDiv").scroll(0, 100000000)
    }
}

function pushMsg(text) {
    
    if (host) {
        log.push({
              text:text,
          })
    } else {
        logEvents.push({
            text:text
        })
    }
}
var resetScrollTimeout = null

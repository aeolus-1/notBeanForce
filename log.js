var log = []
function renderLog(ctx) {
    ctx.translate(camera.x-(render.canvas.width*0.75), camera.y-(render.canvas.height*0.75))
    //ctx.fillRect(0,0, 100, 100)
    for (let i = 0; i < log.length; i++) {
        const msg = log[i];
        var fontSize = 40
        ctx.font = `${fontSize}px Comic Sans MS`
        ctx.fillText(msg.text, 10, (render.canvas.height*1.5)-(i*fontSize)-20)
    }
}

function pushMsg(text) {
    log.push({
        text:text,
    })
}
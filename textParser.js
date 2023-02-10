class TextParser {
    static renderJSONText(ctx, pos, jsonText) {
        var currentX = 0
        function renderSection(text) {
            var textWidth = ctx.measureText(text).width
            ctx.fillText(text, pos.x+currentX, pos.y)
            currentX+=textWidth
        }
        var textOb = JSON.parse(jsonText)
        console.log(textOb, jsonText)

        for (let i = 0; i < textOb.length; i++) {
            var text = textOb[i];
            text = {
                color:"#000",


                ...text,
            }
            ctx.fillStyle = text.color
            renderSection(text.text)
        }
    }
}
function runSightClip(pos, player) {
    let debug = false
    var ctx = render.context
    var vertices = player.body.vertices
    function circle(pos) {
        ctx.beginPath()
        ctx.arc(pos.x,pos.y, 10, 0, Math.PI*2)
        ctx.fill()
        ctx.closePath()
    }
    function line(pos1, pos2) {
        ctx.beginPath()
        ctx.moveTo(pos1.x,pos1.y)
        ctx.lineTo(pos2.x,pos2.y)
        ctx.stroke()
        ctx.closePath()
    }
    function rotateVerts(verts, angle) {
        var newVerts = []
        for (let i = 0; i < verts.length; i++) {
            const vert = verts[i];
            newVerts.push(
                rotate(pos.x,pos.y,vert.x,vert.y,angle)
            )
        }
        return newVerts
    }
    function minMaxVerts(verts) {
        var ret = {
            min:{
                x:Infinity,
                y:Infinity,
            },
            max:{
                x:-Infinity,
                y:-Infinity,
            }
            
        }
        for (let i = 0; i < verts.length; i++) {
            const vert = verts[i];
            if (vert.y<ret.min.y) {
                ret.min = {...vert}
            }
            if (vert.y>ret.max.y) {
                ret.max = {...vert}
            }
        }
        return ret
    }
    var angle = -getAngle(pos, player.body.position)+90

    var rotatedVertices = rotateVerts(vertices, angle),
        points = minMaxVerts(rotatedVertices)

    points = {
        min:rotate(pos.x,pos.y,points.min.x,points.min.y,-angle),
        max:rotate(pos.x,pos.y,points.max.x,points.max.y,-angle),
    }
    


    function testLine(pos1,pos2) {
        var ray = Matter.Query.ray(
            engine.world.bodies.filter(a=>{return !a.platform}),
            pos1,pos2,0
        )
        return ray.length<=0
    }
    if (debug) {
        circle(points.min)
        circle(points.max)
        render.context.strokeStyle = (testLine(pos, points.min))?"#f00":"#0f0"
        line(pos,points.min)
        render.context.strokeStyle = (testLine(pos, points.max))?"#f00":"#0f0"
        line(pos,points.max)
    }

    return !(testLine(pos, points.min)||testLine(pos, points.max))
}
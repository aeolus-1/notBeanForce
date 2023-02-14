class Teleporter {
    constructor(pos1, pos2) {
        this.pos1 = pos1
        this.pos2 = pos2

        let options = {
            collisionFilter:{
                cannotCollideWith:[0],
            },
            isStatic:true,
        }
        this.body1 = Matter.Bodies.circle(pos1.x,pos1.y,50,{...options,
            render:{fillStyle:"#ff5d00"},
            collisionFilter:{group:56730},
            portal:true,
        })
        this.body2 = Matter.Bodies.circle(pos2.x,pos2.y,50,{...options,
            render:{fillStyle:"#0065ff"},
            collisionFilter:{group:56730},
            portal:true,
        })
        this.body1.endPoint = this.body2
        this.body2.endPoint = this.body1

        this.body1.portal = true
        this.body2.portal = true

        Matter.Body.scale(this.body1, 1, 0.65)
        Matter.Body.scale(this.body2, 1, 0.65)

        this.portalTicker = {}


        Matter.Composite.add(engine.world, this.body1)
        Matter.Composite.add(engine.world, this.body2)
    }
    update() {
        var keys = Object.keys(this.portalTicker)
        for (let i = 0; i < keys.length; i++) {
            this.portalTicker[keys[i]] -= 1
            
        }
        this.updateParticles()
        this.testColl = (body) => {
            var coll = Matter.Query.collides(body, [...playersComp.bodies,...bulletsComp.bodies,...grenadeComp.bodies])
            for (let i = 0; i < coll.length; i++) {
                const collision = coll[i];
                this.portalTicker[collision.bodyB.id] = this.portalTicker[collision.bodyB.id]||0
                if (this.portalTicker[collision.bodyB.id] < 0) {
                    this.drawParticleLine({...body.position}, {...body.endPoint.position}, body.render.fillStyle,body.endPoint.render.fillStyle)

                    var relativePosition = v(
                        body.position.x-collision.bodyB.position.x,
                        body.position.y-collision.bodyB.position.y,

                    )

                    Matter.Body.setPosition(collision.bodyB, v(
                        body.endPoint.position.x-relativePosition.x,
                        body.endPoint.position.y+relativePosition.y,
                        )
                    )
                    soundController.playerSound("teleport")
                    this.portalTicker[collision.bodyB.id] = 80
                }
            }

            return coll
        }
        var body1Collisions = this.testColl(this.body1),
            body2Collisions = this.testColl(this.body2)

    }
    drawParticleLine(pointA, pointB, fillStyleA,fillStyleB) {
        var length = getDst(pointA,pointB),
            steps = length*0.2
        for (let i = 0; i < 1; i+=1/steps) {
            var newPoint = lerpV(pointA,pointB,i+(Math.random()*0.05)),
                rangeDiff = 8,
                direction = (-getAngle(pointA, pointB)-90+randInt(-rangeDiff,rangeDiff))/(180/Math.PI),//+((Math.random()*4)-2),
                    velocity = v(
                        Math.cos(direction)*3,//*Math.random(),
                        Math.sin(direction)*3//*Math.random(),
                    )
                
            particleController.spawnParticle(newPoint,{velocity:velocity,noCollisions:true,ignoreGravity:true,render:{fillStyle:pSBC(i,fillStyleA,fillStyleB)}})
        }
    }
    updateParticles() {
        particleController.createSquareExplosion(
            this.body1.position,
            {
                amount:2,
                halfLife:1
            },
            {ignoreGravity:true,render:{fillStyle:"#ff5d00"}}
        )
        particleController.createSquareExplosion(
            this.body2.position,
            {
                amount:2,
                halfLife:1
            },
            {ignoreGravity:true,render:{fillStyle:"#0065ff"}}
        )
    }
    
}
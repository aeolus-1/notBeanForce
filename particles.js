class ParticleController {
    constructor(engine, options={}) {
        this.engine = engine
        this.options = {
            ...options,
        }
        this.particles = new Array()
        this.particlesComp = Matter.Composite.create()
        Matter.Composite.add(engine.world, this.particlesComp)
    }
    runParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            var part = this.particles[i];
            part.halfLife -= this.engine.timing.lastElapsed
             
            if (part.halfLife <= 0 || part.rad <= 0) {
                Matter.Composite.remove(this.particlesComp, part)
                this.particles.splice(i, 1)
            }

            if (part.type == "display") {
                part.rad = clamp(part.rad-(1*part.decayRate), 0, Infinity)
            }
                
        }
    }
    spawnParticle(pos,options={}) {
        var playerGroups = []
        for (let i = 0; i < this.engine.players.length; i++) {
            const player = this.engine.players[i];
            playerGroups.push(player.body.collisionFilter.group)
        }
        options={
            
            velocity:v(),
            scale:1,
            halfLife:50,
            noCollisions:false,
            ...options,
        }
        options.halfLife *= (randInt(80,120)/100)

        var partBody = Matter.Bodies.fromVertices(pos.x,pos.y,
            [
                v(0, 0.8660254038),
                v(-0.5,0),
                v(0.5,0)
            ],
            {...options,
                collisionFilter:{none:options.noCollisions,cannotCollideWith:[...playerGroups,56730]},
                restitution:1,
            }
        )
            var scale = randInt(70,150)/10
        Matter.Body.scale(partBody, options.scale*scale,options.scale*scale)

        partBody.particle = true
        partBody.halfLife = options.halfLife
        Matter.Body.setVelocity(partBody,options.velocity)
        
        //partBody.type="physics"
        this.particles.push(partBody)
        Matter.Body.setAngle(partBody, Math.random()*2*Math.PI)
        Matter.Composite.add(this.particlesComp, partBody)
    }

    createSquareExplosion(pos,explosionOptions={},particleOptions={}) {
        var options={
            amount:20,
            xMax:1,
            xMin:-1,
            yMax:1,
            yMin:-1,
            ...explosionOptions,
        }
            
        for (let i = 0; i < options.amount; i++) {
            let velocity = v(
                (randInt(options.xMin*1000,options.xMax*1000)/1000)*3,
                (randInt(options.yMin*1000,options.yMax*1000)/1000)*3,
            )
            this.spawnParticle(pos, {...particleOptions,velocity:velocity})
        }

        
    }

    spawnDisplayParticle(pos, options) {
        options={
            
            velocity:v(),
            rad:15,
            decayRate:3,
            color:"#f50",
            ...options,
        }
        options.halfLife *= (randInt(80,120)/100)

        var partBody = {
            pos:{...pos},
            decayRate:options.decayRate,
            velocity:options.velocity,
            color:options.color,
            rad:options.rad,
        }

        partBody.type="display"
        this.particles.push(partBody)
        
    }

    renderParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            const part = this.particles[i];
            if (part.type == "display") {
                var ctx = render.context
                ctx.save()
                ctx.beginPath()

                ctx.arc(part.pos.x,part.pos.y, part.rad, 0, Math.PI*2)
                ctx.globalAlpha = 0.4
                ctx.fillStyle = part.color
                ctx.fill()
                ctx.closePath()
                ctx.restore()
            }
        }
    }
    
}
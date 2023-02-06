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
            if (part.halfLife <= 0) {
                Matter.Composite.remove(this.particlesComp, part)
                this.particles.splice(i, 1)
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
                collisionFilter:{cannotCollideWith:[...playerGroups]},
                restitution:1,
            }
        )

        Matter.Body.scale(partBody, options.scale*10,options.scale*10)

        partBody.particle = true
        partBody.halfLife = options.halfLife
        Matter.Body.setVelocity(partBody,options.velocity)

        this.particles.push(partBody)
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
    
}
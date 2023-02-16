var playersComp = Matter.Composite.create()
Matter.Composite.add(engine.world, playersComp)

class PlayerController {
    constructor(engine, owner=this, options={}) {
        this.engine = engine
        this.owner = owner
        options = {
            body:{
                scale:15,
                density:0.01,
                friction:0.01
            },

            jumps:2,
            jumpHeight:1,
            speed:1,
            keys:{},
            preKeys:{},
            id:Math.floor(Math.random()*10e+10),

            username:"unnamed",

            

            ...options,
        }
        this.options = options
        this.afkTicker = (new Date()).getTime()

        this.username = options.username

        this.keys = this.options.keys
        this.preKeys = this.options.preKeys

        var scale = options.body.scale,
            verts = (()=>{
            var verts = []
                
    
            var points = 10
            for (let i = 0; i < points+1; i++) {
                
                var offsets = v(Math.cos((Math.PI/points)*-i)*scale, Math.sin((Math.PI/points)*i)*scale)
                    newPoint = v(0+offsets.x, -(scale*2)-offsets.y)
    
                verts.push(newPoint)
            }
            //verts = [...verts, v(1*scale,-2*scale),v(1*scale,2*scale)]
    
            var points = 10
            for (let i = 0; i < points+1; i++) {
                
                var offsets = v(Math.cos((Math.PI/points)*i)*scale, Math.sin((Math.PI/points)*i)*scale),
                    newPoint = v(0-offsets.x, (scale*2)+offsets.y)
    
    
                verts.push(newPoint)
            }
    
            return verts//[...verts, v(-1*scale,2*scale)]
        })()
        var point = {...spawnPoints[randInt(0,spawnPoints.length-1)]}

        this.body = Matter.Bodies.fromVertices(point.x+randInt(-10,10),point.y, verts, {
            id:options.id,
            density:options.body.density,
            frictionAir:0.026,
            friction:0.5,
            frictionStatic:1,
            controller:this,

            
        })

        Matter.Composite.add(playersComp,this.body)
        
        this.alive = true
        this.displayRespawnMessage = false
        this.engine.players = this.engine.players||[]
        this.engine.players.push(this)

        this.direction = 0

        this.visible = true
        this.targetOpacity = 1
        this.currentOpacity = 1

        this.shootTicker = 0
    
        this.jumpTicker = 0
        this.jumps = options.jumps
    
        this.checkingForCollisionsFor = undefined
        this.endCollisionCheck = ()=>{}
    
        this.preVelY = this.body.velocity.y
    
        this.droppingPlatform = 0
        this.falling = 0
        this.preOnground = false

        this.stabilsing = true
        this.bleeding = false

        this.isDucking = false
        this.ducking = false
        this.preDucking = false

        this.hasGrenade = 1

        this.shield = 2500

        this.stats = {
            health:1,
            kills:0,
        }

    }
    update(keys=this.keys, prekeys=this.preKeys){
        this.jumpTicker += timeDelta/16
        this.droppingPlatform -= timeDelta/16
        this.falling += timeDelta/16
        this.shield -= timeDelta
        this.shootTicker -= timeDelta*customOptions.shootingSpeed
        this.updateControls(keys, prekeys)

        
        

        if (this.ducking && !this.preDucking && !this.isDucking) {
            this.duck()
        }
        if (this.preDucking && !this.ducking && this.isDucking) {
            this.unDuck()
        }
        this.preDucking = this.ducking

        if (this.bleeding) {
            particleController.spawnParticle(v(
                this.body.position.x+((randInt(-100,100)/100)*20),
                this.body.position.y+(Math.abs(this.body.bounds.min.y-this.body.bounds.max.y)*0.35)+((randInt(-100,100)/100)*20)
            ), {
                render:{fillStyle:"#f00"},
                halfLife:(Math.random()>0.85&&this.stats.health>0)?1000:30
            })
        }

        
        if (this.stabilsing) {
            Matter.Body.setAngle(this.body, 0)
            Matter.Body.setAngularVelocity(this.body, 0)
            Matter.Common.set(this.body, "anglePrev", 0)
            Matter.Common.set(this.body, "angularSpeed", 0)
        }
        //Matter.Common.set(this.body, "angle", 0)
        //Matter.Common.set(this.body, "angularVelocity", lerp(this.body.angularVelocity,0,0.5))
        
        this.currentOpacity = clamp(this.currentOpacity-(Math.sign(this.currentOpacity-this.targetOpacity)*0.12),0,1)
        this.body.render.opacity = 1
        if (this.shield>0) {
            var interval = 100
            this.body.render.opacity *= (((new Date()).getTime()%interval*2)>interval)?1:0.5
        } 
        this.body.render.opacity *= this.currentOpacity



        var groundCollide = this.selfCollisionCheck()
        //if (groundCollide.length>0)log(groundCollide[0].collisionFilter.group)
        //log(groundCollide, this.checkingForCollisionsFor)
        if (((groundCollide.length>0 && this.checkingForCollisionsFor != undefined))?(groundCollide[0].id != this.checkingForCollisionsFor.id):false || groundCollide.length<=0) {
            this.endCollisionCheck()
            this.checkingForCollisionsFor = undefined
            this.endCollisionCheck = ()=>{}
            
        }

        if (this.body.velocity.y<-0.05&&this.preVelY>=-0.05) {
            this.body.collisionFilter.cannotCollideWith.push(45678903)

            
        }
        if (this.body.velocity.y>0.05&&this.preVelY<=0.05&&this.droppingPlatform<0) {
            for (let i = 0; i < this.body.collisionFilter.cannotCollideWith.length; i++) {
                const group = this.body.collisionFilter.cannotCollideWith[i];
                if (group == 45678903) {
                    delete this.body.collisionFilter.cannotCollideWith[i];
                }
            }
            var i = this.body.collisionFilter.cannotCollideWith.indexOf(45678903)
            if (i>=0) this.body.collisionFilter.cannotCollideWith.splice(i,1)

        }
        this.preVelY = this.body.velocity.y

        
        

    }
    groundCollisionCheck(){
        var height = (Math.abs(this.body.bounds.min.y-this.body.bounds.max.y))
        var collisions = Matter.Query.collides(Matter.Bodies.rectangle(
            this.body.position.x,
            this.body.position.y+((height*0.5)),
            8,
            0.1,
            
        ), engine.world.bodies).filter(a=>{return a.bodyB.id!=this.body.id&&!a.bodyA.particle})

        var re = []
        for (let i = 0; i < collisions.length; i++) {
            const coll = collisions[i];
            re.push(coll.bodyA)
        }
        return re
    }
    selfCollisionCheck(){
        
        var collisions = Matter.Query.collides(this.body, engine.world.bodies).filter(a=>{return a.bodyA.id!=this.body.id&&!a.bodyA.particle})

        var re = []
        for (let i = 0; i < collisions.length; i++) {
            const coll = collisions[i];
            re.push(coll.bodyA)
        }
        return re
    }
    updateControls(keys,preKeys){
    
            //log(Matter.Composite.allBodies(engine.world))
            var playerCollisions = Matter.Query.collides(player.body, Matter.Composite.allBodies(engine.world).filter((a)=>{return a.id != this.body.id})),
                onground = false
                playerCollisions.forEach(col => {
                    //log(Math.abs(angleDifference(getAngle(v(), col.normal)-180, 0)))
                    if (!col.bodyA.particle) {
                        if (Math.abs(angleDifference(getAngle(v(), col.normal)-180, 0))<45) onground = true
                    }
                });
                var groundCollide = this.groundCollisionCheck()

            
            
    
                //log(onground)
                if (onground && !this.preOnground && groundCollide[0]!=undefined) {
                    if (
                        this.body.velocity.y*100>1.9&&
                        this.body.velocity.y*100<5&&
                        ((groundCollide[0].platform)?!keys.s:true)&&
                        this.falling>3
                        ) {
                        particleController.createSquareExplosion(
                            v(
                                this.body.position.x,
                                this.body.position.y+(this.options.body.scale*2.5)
                            ),
                            {
                                amount:10,
                                yMin:-0.3,
                                yMax:-0.1,
                                xMax:2,
                                xMin:-2,
                                
                            },
                            {
                                halfLife:10,
                                render:{
                                    fillStyle:"rgb(239,211,72)"
                                }
                            }
                        )
                    }
                }
                if (onground) {
                    this.jumps = 2
                    if (this.falling > 10) {
                        this.emitSound("hitGround", clamp(this.falling/100, 0, 1))
                    }
                    this.falling = 0
                    
                }
                
                this.preOnground = onground
            if (!(document.activeElement === document.getElementById("logDivInput"))) {
            if (((keys.w && !preKeys.w)||(keys.arrowup && !preKeys.arrowup)) && this.jumps > 0) {
                this.jumps -= 1
                this.jumpTicker = 0
                Matter.Body.setPosition(this.body, v(this.body.position.x, this.body.position.y-5))
                Matter.Body.setVelocity(this.body, v(this.body.velocity.x, -2*this.options.jumpHeight))
                this.emitSound("jump")
            }
            if (!onground && (keys.w || keys.arrowup) && this.jumpTicker < 10 && this.body.velocity.y < 0) {
                Matter.Body.setVelocity(this.body, v(this.body.velocity.x, -15*this.options.jumpHeight))
            }
    
    
            if (groundCollide.length>0 && (keys.s || keys.arrowdown) && this.checkingForCollisionsFor == undefined) {
                var floor = groundCollide[0]
                if (floor.platform) {
                    this.checkingForCollisionsFor = floor
                    this.body.collisionFilter.cannotCollideWith.push(floor.collisionFilter.group)
                    Matter.Body.translate(this.body, v(0,2))
                    this.droppingPlatform = 5
    
                    this.endCollisionCheck = ()=>{
                        var i = this.body.collisionFilter.cannotCollideWith.indexOf(floor.collisionFilter.group)
                        if (i>=0) this.body.collisionFilter.cannotCollideWith.splice(i,1)
                    }
                }
            }
    
    
            var speed = ((onground)?3.5:0.4)*this.options.speed*1.6,
                baseVel = onground?(this.body.velocity.x*0.75):this.body.velocity.x

            var runP = (direction) => {
                if (Math.random()>0.85 && onground) particleController.createSquareExplosion(
                    v(
                        this.body.position.x,
                        this.body.position.y+(this.options.body.scale*2.5)
                    ),
                    {
                        amount:1,
                        yMin:-2,
                        yMax:-1,
                        xMax:1*direction,
                        xMin:0.5*direction,
                        
                    },
                    {
                        halfLife:5,
                        render:{
                            fillStyle:"rgb(239,211,72)"
                        }
                    }
                )
            }
            if (keys.a || keys.arrowleft) {
                Matter.Body.setVelocity(this.body, v((baseVel)-speed, this.body.velocity.y))
                this.direction = -1
                runP(1)
                
            }
            if (keys.d || keys.arrowright) {
                Matter.Body.setVelocity(this.body, v((baseVel)+speed, this.body.velocity.y))
                this.direction = 1
                runP(-1)
            }

            if (keys["shift"] && !preKeys["shift"] && this.alive) this.ducking = true
            if (!keys["shift"] && preKeys["shift"] && this.alive) this.ducking = false
                
            
            if (keys[" "] && this.shootTicker <= 0 && this.alive) {
                this.emitSound("gun")
                this.shootTicker = 200
                var dir = this.direction,
                                pos = v(
                    this.body.position.x+(dir*23),
                    this.body.position.y
                )
                addBullet(
                    v(
                        pos.x,
                        pos.y-8,
                    )
                    ,dir,this)

                    particleController.createSquareExplosion(
                        pos,
                        {
                            amount:5,
                            yMin:-0.8,
                            yMax:0.8,
                            xMax:2*dir,
                            xMin:1*dir,
                            
                        },
                        {
                            halfLife:15,
                            ignoreGravity:true,
                            render:{
                                fillStyle:"#000"
                            }
                        }
                    )
            }
            if (keys["c"] && !preKeys["c"] && (this.hasGrenade>=1||this.body.id!=player.body.id) && customOptions.grenades && this.alive) {
                this.emitSound("grenade")
                this.hasGrenade = 0
                var dir = this.direction
                addGrenade(v(this.body.position.x+(dir*40)+20,this.body.position.y), dir, this)
            }
        }
            
            
        
        
    }


    duck(){
        Matter.Common.set(this.body, "friction", 0.0015)
        this.isDucking = true
        var oldAngle = this.body.angle
        Matter.Body.setAngle(this.body, 0)
        Matter.Body.scale(this.body, 1,0.5,v(
            this.body.position.x,
            this.body.position.y+(this.options.body.scale*2.5)
        ))
        Matter.Body.setAngle(this.body, oldAngle)
    }
    unDuck() {
        Matter.Common.set(this.body, "friction", 0.03)
        this.isDucking = false
        var oldAngle = this.body.angle
        Matter.Body.setAngle(this.body, 0)
        Matter.Body.scale(this.body, 1,2,v(
            this.body.position.x,
            this.body.position.y+(this.options.body.scale*0)
        ))
        Matter.Body.setAngle(this.body, oldAngle)    
    }


    kill(part=false, shootBy=this) {
        if (this.alive) {
            if (this.body.id == player.body.id) setTimeout(() => {
                player.displayRespawnMessage = true

            }, 1500);
            if (customOptions.permadeath) {
                window.close()
            }
            this.emitSound("death")
            if (customOptions.permadeath) window.close()
            this.stabilsing = false
            this.options.speed = 0
            this.options.jumpHeight = 0
            this.alive = false
            if (player.body.id == this.body.id) {
                
                pushMsg(`<span style="color:red"><b>${shootBy.username}</b></span> killed <span style="color:red"><b>${this.username}</b></span>`)
            }
            if (part) {
                particleController.createSquareExplosion(
                    this.body.position,
                    {
                        amount:40,
                        yMin:-3,
                        yMax:3,
                        xMax:3,
                        xMin:-3,
                        
                    },
                    {
                        halfLife:40,
                        render:{
                            fillStyle:"rgb(255,40,0)"
                        }
                    }
                )
                
            }
        }
    }
    damage(amount, player) {
        this.stats.health -= (amount/customOptions.health)*(this.shield>0?0:1)
        if (this.stats.health <= 0) {
            this.kill(true, player)
        }
        particleController.createSquareExplosion(
            v(
                this.body.position.x,
                this.body.position.y+(this.options.body.scale*2.5)
            ),
            {
                amount:100*amount,
                yMin:-0.3,
                yMax:-0.1,
                xMax:2,
                xMin:-2,
                
            },
            {
                halfLife:10,
                render:{
                    fillStyle:"rgb(170,0,0)"
                }
            }
        )
    }

    shoot() {

    }


    emitSound(name) {
        soundController.emitSoundFromPosition(name, this.owner.body.position, this.body.position)
    }
}






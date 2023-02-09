var playersComp = Matter.Composite.create()
Matter.Composite.add(engine.world, playersComp)

class PlayerController {
    constructor(engine, options={}) {
        this.engine = engine
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

            

            ...options,
        }
        this.options = options

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
        console.log(point)

        this.body = Matter.Bodies.fromVertices(point.x+randInt(-10,10),point.y, verts, {
            id:options.id,
            density:options.body.density,
            frictionAir:0.01,
            controller:this,

            
        })

        Matter.Composite.add(playersComp,this.body)
        
        this.alive = true
        this.engine.players = this.engine.players||[]
        this.engine.players.push(this)
    
        this.jumpTicker = 0
        this.jumps = options.jumps
    
        this.checkingForCollisionsFor = undefined
        this.endCollisionCheck = ()=>{}
    
        this.preVelY = this.body.velocity.y
    
        this.droppingPlatform = 0
        this.falling = 0
        this.preOnground = false

        this.stabilsing = true
    }
    update(keys=this.keys, prekeys=this.preKeys){
        this.jumpTicker += this.engine.timing.lastElapsed
        this.droppingPlatform -= this.engine.timing.lastElapsed
        this.falling += this.engine.timing.lastElapsed
        this.updateControls(keys, prekeys)
        if (this.body.position.y > 2500) {
            this.kill()
            respawn()
        }

        
        if (this.stabilsing) {
            Matter.Body.setAngle(this.body, 0)
            Matter.Body.setAngularVelocity(this.body, 0)
            Matter.Common.set(this.body, "anglePrev", 0)
            Matter.Common.set(this.body, "angularSpeed", 0)
        }
        //Matter.Common.set(this.body, "angle", 0)
        //Matter.Common.set(this.body, "angularVelocity", lerp(this.body.angularVelocity,0,0.5))
        


        var groundCollide = this.selfCollisionCheck()
        //if (groundCollide.length>0)console.log(groundCollide[0].collisionFilter.group)
        //console.log(groundCollide, this.checkingForCollisionsFor)
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
    
            //console.log(Matter.Composite.allBodies(engine.world))
            var playerCollisions = Matter.Query.collides(player.body, Matter.Composite.allBodies(engine.world).filter((a)=>{return a.id != this.body.id})),
                onground = false
                playerCollisions.forEach(col => {
                    //console.log(Math.abs(angleDifference(getAngle(v(), col.normal)-180, 0)))
                    if (!col.bodyA.particle) {
                        if (Math.abs(angleDifference(getAngle(v(), col.normal)-180, 0))<45) onground = true
                    }
                });
                var groundCollide = this.groundCollisionCheck()

            
            
    
                //console.log(onground)
                if (onground && !this.preOnground) {
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
                    this.falling = 0

                    
                }
                
                this.preOnground = onground
            if (keys.w && !preKeys.w && this.jumps > 0) {
                this.jumps -= 1
                this.jumpTicker = 0
                Matter.Body.setVelocity(this.body, v(this.body.velocity.x, -8*this.options.jumpHeight))
            }
            if (!onground && keys.w && this.jumpTicker < 20 && this.body.velocity.y < 0) {
                Matter.Body.setVelocity(this.body, v(this.body.velocity.x, -8*this.options.jumpHeight))
            }
    
    
            if (groundCollide.length>0 && keys.s && this.checkingForCollisionsFor == undefined) {
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
    
    
            var speed = ((onground)?3.5:0.6)*this.options.speed,
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
            if (keys.a) {
                Matter.Body.setVelocity(this.body, v((baseVel)-speed, this.body.velocity.y))
                runP(1)
                
            }
            if (keys.d) {
                Matter.Body.setVelocity(this.body, v((baseVel)+speed, this.body.velocity.y))
                runP(-1)
            }

            if (keys["shift"] && !preKeys["shift"]) this.duck()
            if (!keys["shift"] && preKeys["shift"]) this.unDuck()
                
            
            if (keys[" "] && !preKeys[" "]) {
                var pos = v(
                    this.body.position.x+(Math.sign(this.body.velocity.x)*100),
                    this.body.position.y
                ),
                dir = Math.sign(this.body.velocity.x)
                addBullet(
                    pos
                    ,Math.sign(this.body.velocity.x),this)

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
                            halfLife:2.5,
                            ignoreGravity:true,
                            render:{
                                fillStyle:"#000"
                            }
                        }
                    )
            }
            
            
        
        
    }


    duck(){
        var oldAngle = this.body.angle
        Matter.Body.setAngle(this.body, 0)
        Matter.Body.scale(this.body, 1,0.5,v(
            this.body.position.x,
            this.body.position.y+(this.options.body.scale*2.5)
        ))
        Matter.Body.setAngle(this.body, oldAngle)
    }
    unDuck() {
        var oldAngle = this.body.angle
        Matter.Body.setAngle(this.body, 0)
        Matter.Body.scale(this.body, 1,2,v(
            this.body.position.x,
            this.body.position.y+(this.options.body.scale*0)
        ))
        Matter.Body.setAngle(this.body, oldAngle)    }


    kill(part=false) {
        this.stabilsing = false
        this.options.speed = 0
        this.options.jumpHeight = 0
        this.alive = false
        if (part) {
            particleController.createSquareExplosion(
                this.body.position,
                {
                    amount:20,
                    yMin:-3,
                    yMax:3,
                    xMax:3,
                    xMin:-3,
                    
                },
                {
                    halfLife:20,
                    render:{
                        fillStyle:"rgb(119,106,35)"
                    }
                }
            )
            
        }
    }

    shoot() {

    }
}
var bullets = new Array(),
    bulletsComp = Matter.Composite.create()

Matter.Composite.add(engine.world, bulletsComp)
function runBullets() {
    for (let i = 0; i < bullets.length; i++) {
        const bul = bullets[i];

        var hits = Matter.Query.collides(bul, [...engine.world.bodies,...playersComp.bodies])//.filter(a=>{return a.bodyB.id!=bul.id})
        if (hits.length>0) {
            if (!hits[0].bodyA.portal) {
                Matter.Composite.remove(bulletsComp, bul)
                bullets.splice(i, 1)
                

                if (hits[0].bodyB.id == player.body.id) {
                    player.kill()
                } else {
                    particleController.createSquareExplosion(
                        bul.position,
                        {
                            amount:4,
                            yMin:-3,
                            yMax:3,
                            xMax:3,
                            xMin:-3,
                            
                        },
                        {
                            halfLife:15,
                            render:{
                                fillStyle:"#000"
                            }
                        }
                    )
                }
            }
            //

        }
        
        
    }
}
function addBullet(pos, dir, player) {
    var bullet = Matter.Bodies.circle(pos.x, pos.y, 8,{
        render:{
            fillStyle:"#000"
        },
        friction:0,
        frictionAir:0,
        frictionStatic:0,

        density:1,

        restitution:1,
    })
    bullet.ignoreGravity = true
    bullet.collisionFilter.group = 67894
    bullet.collisionFilter.cannotCollideWith.push(56730)
    //bullet.collisionFilter.cannotCollideWith.push(56730)
    
    Matter.Body.setVelocity(bullet, v(
        (dir*20)+(player.body.velocity.x*0.05),
        (player.body.velocity.y*0.05)
    ))
    bullets.push(bullet)
    Matter.Composite.add(bulletsComp, bullet)
}






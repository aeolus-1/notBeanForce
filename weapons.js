var bullets = new Array(),
    bulletsComp = Matter.Composite.create()

Matter.Composite.add(engine.world, bulletsComp)
function runBullets() {
    
    for (let i = 0; i < bullets.length; i++) {
        const bul = bullets[i];
        var polarVelocity = {
            a:(-getAngle(v(), bul.velocity)-90)*(Math.PI/180),
            d:getDst(v(), bul.velocity)
        }
        Matter.Body.setVelocity(bul, v(
            Math.cos(polarVelocity.a)*20,
            Math.sin(polarVelocity.a)*20
        ))
        var hits = Matter.Query.collides(bul, [...engine.world.bodies,...playersComp.bodies])//.filter(a=>{return a.bodyB.id!=bul.id})
        if (hits.length>0) {
            bul.bounces += 1
            if (!hits[0].bodyA.portal) {
                
                

                if (hits[0].bodyB.id == player.body.id) {
                    player.damage(0.20001, bul.owner)
                    Matter.Composite.remove(bulletsComp, bul)
                    bullets.splice(i, 1)
                    hits[0].bodyA.owner.stats.killCount += 1
                } else {
                    if (bul.bounces > (customOptions.bouncingbullets)?10:0) {
                        Matter.Composite.remove(bulletsComp, bul)
                        bullets.splice(i, 1)
                    }
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

        bounces:0,
    })
    bullet.ignoreGravity = true
    bullet.collisionFilter.group = 67894
    bullet.collisionFilter.cannotCollideWith.push(56730)
    bullet.owner = player
    //bullet.collisionFilter.cannotCollideWith.push(56730)
    
    Matter.Body.setVelocity(bullet, v(
        (dir*20)+(player.body.velocity.x*0.05),
        (player.body.velocity.y*0.05)
    ))
    bullets.push(bullet)
    Matter.Composite.add(bulletsComp, bullet)
}


var grenades = new Array(),
grenadeComp = Matter.Composite.create()

Matter.Composite.add(engine.world, grenadeComp)
function runGrenades() {
    
    for (let i = 0; i < grenades.length; i++) {
        const gren = grenades[i];

        particleController.spawnDisplayParticle(gren.position)

        if (((new Date()).getTime()-gren.creationTime) > 1500) {
            explodeGrenade(gren)
            Matter.Composite.remove(grenadeComp, gren)
            grenades.splice(i, 1)
        }
        
        var hits = Matter.Query.collides(gren, [...engine.world.bodies,...playersComp.bodies])//.filter(a=>{return a.bodyB.id!=bul.id})
        if (hits.length>0) {
            gren.bounces += 1
            if (!hits[0].bodyA.portal) {
                
                

                if (hits[0].bodyB.controller!=undefined||hits[0].bodyA.controller!=undefined) {
                    //player.damage(0.20001, gren.owner)
                    explodeGrenade(gren)
                    Matter.Composite.remove(grenadeComp, gren)
                    grenades.splice(i, 1)
                    hits[0].bodyA.owner.stats.killCount += 1
                } else {
                    if (gren.bounces > Infinity) {
                        Matter.Composite.remove(grenadeComp, gren)
                        grenades.splice(i, 1)
                    }
                    particleController.createSquareExplosion(
                        gren.position,
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
                                fillStyle:"#f00"
                            }
                        }
                    )
                }
            }
            

        }
        
        
    }
}
function addGrenade(pos, dir, player) {
    var grenade = Matter.Bodies.circle(pos.x, pos.y, 16,{
        render:{
            fillStyle:"#999"
        },
        friction:0,
        frictionAir:0,
        frictionStatic:0,

        density:1,

        restitution:0.7,

        bounces:0,
    })
    grenade.collisionFilter.group = 67894
    grenade.collisionFilter.cannotCollideWith.push(56730)
    grenade.owner = player

    grenade.creationTime = (new Date()).getTime()
    
    Matter.Body.setVelocity(grenade, v(
        (dir*20)+(player.body.velocity.x*0.05),
        (player.body.velocity.y*0.05)-10
    ))
    grenades.push(grenade)
    Matter.Composite.add(grenadeComp, grenade)
}
function explodeGrenade(gren) {
    particleController.spawnDisplayParticle(gren.position, {
        rad:300,
        decayRate:15,
    })
    particleController.createSquareExplosion(
        gren.position,
        {
            amount:120,
            yMin:-15,
            yMax:15,
            xMax:15,
            xMin:-15,
            
        },
        {
            halfLife:20,
            render:{
                fillStyle:"rgb(255,40,0)"
            }
        }
    )
    for (let i = 0; i < [player, ...enemeyPlayers].length; i++) {
        const pl = [player, ...enemeyPlayers][i];
        var dst = getDst(pl.body.position, gren.position),
            size = 300
        if (dst < size) {
            var hitMag = clamp(1-clamp(dst/size,0,1),0,1)
            pl.damage(0.6*hitMag)
            var hitAngle = (-getAngle(pl.body.position, gren.position)+90)*(Math.PI/180),
                mag = clamp(2.5*hitMag, 0, 5)
            Matter.Body.applyForce(pl.body, v(0,0), v(
                Math.cos(hitAngle)*mag,
                Math.sin(hitAngle)*mag,
            ))
        }
    }
    for (let i = 0; i < 60; i++) {
        
        setTimeout(() => {
            var angle = randInt(0, 360),
            mag = randInt(40, 300)
        var pos = v(
            gren.position.x+(Math.cos(angle)*mag),
            gren.position.y+(Math.sin(angle)*mag),
        )
            particleController.spawnDisplayParticle(pos, {
                rad:80+randInt(-50,50),
                decayRate:8+(randInt(-10,10)/10),
                color:pSBC(randInt(1, 100)/100, "#ff4b3b","#f08e1f")
            })
        }, randInt(0, 50));
        
    }
        
    
}
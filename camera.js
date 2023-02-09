var camera = v(),
  cameraBounds = {
    min: v(0, 0),
    max: v(4076, 2200),
  };

Matter.Events.on(render, "beforeRender", function () {
  let center = v(-render.canvas.width / 4, -render.canvas.height / 4),
    scale = 3;

  var dims = v(render.canvas.width, render.canvas.height);

  var clampedCameraBounds = { ...cameraBounds };
  if (
    Math.abs(clampedCameraBounds.min.x - clampedCameraBounds.max.x) < dims.x
  ) {
    var diff = Math.abs(
      Math.abs(clampedCameraBounds.min.x - clampedCameraBounds.max.x) - dims.x
    );
    clampedCameraBounds.min.x -= diff / 2;
    clampedCameraBounds.min.x += diff / 2;
  }

  //clampedCameraBounds.min.x += dims.x/2
  //clampedCameraBounds.max.x -= dims.x/2

  targetPos = v(
    clamp(
      player.body.position.x,
      clampedCameraBounds.min.x + (render.canvas.width / 4) * scale,
      clampedCameraBounds.max.x - (render.canvas.width / 4) * scale
    ),
    clamp(
      player.body.position.y,
      clampedCameraBounds.min.y + (render.canvas.height / 4) * scale,
      clampedCameraBounds.max.y - (render.canvas.height / 4) * scale
    )
  );

  let xDiff = targetPos.x - camera.x,
    yDiff = targetPos.y - camera.y;

  camera.x += xDiff * 0.05;
  camera.y += yDiff * 0.05;
  //camera = {...targetPos}
  camera = v(
    clamp(
      camera.x,
      clampedCameraBounds.min.x + (render.canvas.width / 4) * scale,
      clampedCameraBounds.max.x - (render.canvas.width / 4) * scale
    ),
    clamp(
      camera.y,
      clampedCameraBounds.min.y + (render.canvas.height / 4) * scale,
      clampedCameraBounds.max.y - (render.canvas.height / 4) * scale
    )
  );

  // Follow Hero at X-axis
  render.bounds.min.x = center.x * scale + camera.x;
  render.bounds.max.x =
    center.x * scale + camera.x + (initalRenderBounds.max.x * scale) / 2;

  // Follow Hero at Y-axis
  render.bounds.min.y = center.y * scale + camera.y;
  render.bounds.max.y =
    center.y * scale + camera.y + (initalRenderBounds.max.y * scale) / 2;
  Matter.Render.startViewTransform(render);
});

Matter.Events.on(render, "afterRender", function () {
  var ctx = render.context,
    width = 100;

  

  function renderHealthBar(pos, t) {
    //t = (((new Date()).getTime())/1000)%1
    //console.log(t)

    t = clamp(t, 0, 1)

    var size = 25
    
    ctx.beginPath()
    ctx.moveTo(pos.x-size,pos.y)
    ctx.arc(pos.x, pos.y, size, Math.PI, 0)
    ctx.strokeStyle = "#f00"
    ctx.lineWidth = 7
    ctx.stroke()
    ctx.closePath()
    ctx.beginPath()
    ctx.moveTo(pos.x-size,pos.y)
    ctx.arc(pos.x, pos.y, size, Math.PI, Math.PI+(Math.PI*t))
    ctx.strokeStyle = "#0f0"
    ctx.lineWidth = 7
    ctx.stroke()
    ctx.closePath()
    
  }

  var img = document.getElementById("gun");
  var height = (img.height / img.width) * width,
    direction = Math.sign(player.body.velocity.x);
  ctx.save();
  ctx.translate(player.body.position.x, player.body.position.y + height / 2);
  ctx.scale(1 * direction, 1);
  ctx.translate(
    -player.body.position.x,
    -(player.body.position.y + height / 2)
  );
  ctx.drawImage(
    img,
    player.body.position.x,
    player.body.position.y,
    width,
    height
  );

  

  ctx.restore();
  renderHealthBar(v(
    player.body.position.x,
    player.body.position.y-40
  ), player.stats.health)
    for (let i = 0; i < enemeyPlayers.length; i++) {
      const enPlayer = enemeyPlayers[i];
      direction = Math.sign(enPlayer.body.velocity.x);

    ctx.save();
    ctx.translate(enPlayer.body.position.x,enPlayer.body.position.y)
    ctx.scale(direction, 1)
    ctx.translate(-enPlayer.body.position.x,-enPlayer.body.position.y)

    
    ctx.drawImage(
      img,
      enPlayer.body.position.x,
      enPlayer.body.position.y,
      width,
      height
    );

    ctx.restore();
    }

    renderLog(ctx)
  


  //render.context.fillRect(player.body.position.x, player.body.position.y, 100,100)
});

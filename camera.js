var camera = v(),
  cameraBounds = [
    {
      min: v(0, 0),
      max: v(4076, 2200),
    },
    {
      min: v(0, -300),
      max: v(3000, 1500),
    },
    {
      min: v(-100, -500),
      max: v(4800, 2900),
    },
  ][levelSelection - 1];

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

  particleController.renderParticles();

  function renderHealthBar(pos, t) {
    //t = (((new Date()).getTime())/1000)%1
    //log(t)

    t = clamp(t, 0, 1);

    var size = 25;

    ctx.beginPath();
    ctx.moveTo(pos.x - size, pos.y);
    ctx.arc(pos.x, pos.y, size, Math.PI, 0);
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(pos.x - size, pos.y);
    ctx.arc(pos.x, pos.y, size, Math.PI, Math.PI + Math.PI * t);
    ctx.strokeStyle = "#0f0";
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.closePath();

    if (player.hasGrenade && customOptions.grenades) {
      var pos = v(player.body.position.x + 35, player.body.position.y - 60),
        rad = 8;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.arc(pos.x, pos.y, rad, 0, Math.PI * 2 * player.hasGrenade);
      ctx.lineTo(pos.x, pos.y);

      ctx.fillStyle = "#f00";
      ctx.fill();
      ctx.closePath();
    }
  }

  var img = document.getElementById("gun");
  var height = (img.height / img.width) * width,
    direction = player.direction
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
    player.body.position.y-13.5,
    width,
    height
  );

  ctx.restore();
  if (player.displayRespawnMessage) {
    var text = "Press [Enter] to Respawn",
      width = ctx.measureText(text).width;
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.fillStyle = "#000";
    ctx.fillText(text, -(width / 2), 0); //player.body.position.x-(width/2),player.body.position.y-150)
    ctx.restore();
  }
  var fontSize = 30;
  ctx.font = `${fontSize}px Comic Sans MS`;
  var width = ctx.measureText(player.username).width / 2;

  ctx.fillStyle = "#000";
  ctx.fillText(
    player.username,
    player.body.position.x - width,
    player.body.position.y - 100
  );
  renderHealthBar(
    v(player.body.position.x, player.body.position.y - 40),
    player.stats.health
  );
  for (let i = 0; i < enemeyPlayers.length; i++) {
    const enPlayer = enemeyPlayers[i];
    ctx.save()
    ctx.globalAlpha = enPlayer.body.render.opacity
    direction = enPlayer.direction

    ctx.save();
    ctx.translate(enPlayer.body.position.x, enPlayer.body.position.y);
    ctx.scale(direction, 1);
    ctx.translate(-enPlayer.body.position.x, -enPlayer.body.position.y);

    ctx.drawImage(
      img,
      enPlayer.body.position.x,
      enPlayer.body.position.y-50,
      width,
      height
    );
    ctx.restore();
    var fontSize = 30;
    ctx.font = `${fontSize}px Comic Sans MS`;
    var width = ctx.measureText(enPlayer.username).width / 2;

    ctx.fillStyle = "#000";
    ctx.fillText(
      enPlayer.username,
      enPlayer.body.position.x - width,
      enPlayer.body.position.y - 13.5
    );
    
    ctx.restore()
  }

  renderLog(ctx);

  //render.context.fillRect(player.body.position.x, player.body.position.y, 100,100)
});

var clientHandHoldHost,
    joinId = Math.floor(Math.random()*10e3)
if (host) {
    document.getElementById("joinId").textContent = joinId
    let id = joinId
    clientHandHoldHost = new Peer(id, {
        debug: 2,
        
      });

      clientHandHoldHost.on("open", function (id) {
        console.log("opened", id)
      })
      clientHandHoldHost.on("connection", function (conn) {
        console.log("connected", id)
        conn.send("remaining id")
        var createNewPort = addClientPort()
        this.interSend = setInterval(() => {
            if (createNewPort.lastPeerId != null) {
                conn.send(`${createNewPort.lastPeerId}`)
            }
        }, 500);
        console.log("sent id")
        conn.on("close", ()=>{
            console.log("closed")
        })
      })
      

    

}
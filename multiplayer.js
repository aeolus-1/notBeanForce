var status = location.href.split("?")[1],
  host = status.includes("host"),
  joining = status.includes("join") ? status.split("=")[1] : false,
  online = false;

class Connection {
  constructor(joining=undefined) {
    this.lastPeerId = null;
    this.peer = null; // Own peer object
    this.peerId = null;
    this.conn = null;

    this.online = false;
    console.log(joining)
    this.joining = joining
  }
  initialize(id) {
    // Create own peer object with connection to shared PeerJS server
    this.peer = new Peer(id, {
      debug: 2,
      
    });

    this.peer.connection = this;

    this.peer.on("open", function (id) {
      console.log(this);
      // Workaround for peer.reconnect deleting previous id
      if (this.id === null) {
        console.log("Received null id from peer open");
        this.id = this.connection.lastPeerId;
      } else {
        this.connection.lastPeerId = this.id;
      }

      console.log("ID: ", this.id);
      if (host && this.connection.hostId==undefined) document.getElementById("idDiv").innerHTML += `<br><a target="_blank" href="https://aeolus-1.github.io/earlySSBGameIDK/gane.html?join=${this.id}">${this.id}</a>`

      console.log("Awaiting connection...");
      console.log(this.joining)
      if (this.connection.joining) {
        this.connection.join(this.connection.hostId);
      } else {
        if (this.connection.isBuffer) {
          console.log("send reply buffer")
          clientConnection.conn.send("buffer "+this.id)
        }
      }
    });
    this.peer.on("connection", function (c) {
      console.log('connected')
      // Allow only a single connection
      this.connection.online = true;

      if (this.connection.conn && this.connection.conn.open) {
        c.on("open", function () {
          c.send("Already connected to another client");
          setTimeout(function () {
            c.close();
          }, 500);
        });
        return;

        
      }

      
      

      this.connection.conn = c;
      this.connection.conn.connection = this.connection;
      if (host) {
        console.log(this.id)
        document.getElementById("idDiv").innerHTML = document.getElementById("idDiv").innerHTML.replace(this.id+"</a>",this.id+"</a> - Connected")
      }

      console.log("Connected to: " + this.connection.conn.peer);

      this.connection.ready();
    });
    this.peer.on("disconnected", function () {
      console.log("Connection lost. Please reconnect");
      this.connection.online = false;
      // Workaround for peer.reconnect deleting previous id
      this.id = this.connection.lastPeerId;
      this._lastServerId = this.connection.lastPeerId;
      this.reconnect();
    });
    this.peer.on("close", function () {
      this.connection.conn = null;
      this.connection.online = false;
      console.log("Connection destroyed");
    });
    this.peer.on("error", function (err) {
      console.log(err);
      alert("" + err);
    });
  }
  ready() {
    this.conn.on("data", function (data) {
      this.connection.receiveMultiplayerData(data);
    });
    this.conn.on("close", function () {
      this.conn = null;
    });
  }
}
class ClientConnection extends Connection {
  constructor(id, buffer=false) {
    super(id);
    this.hostId = id;
    this.addBuffer = buffer
  }

  init() {
    this.initialize(null);
  }

  buffer() {
    this.hostConnection = new HostConnection(true)
    this.hostConnection.isBuffer = true
    this.hostConnection.init()
  }

  join(id) {
    

    // Create connection to destination peer specified in the input field
    this.conn = this.peer.connect(id, {
      reliable: true,
    });
    this.conn.connection = this
    //this.conn.connection = this;

    this.conn.on("open", function () {
      console.log("Connected to: " + this.peer);
      
      
      
      if (this.connection.addBuffer) {
        this.connection.buffer()
      } else {
        console.log("connection by buffer")
        this.send("yay")
      }
      
      //this.online = true;
      /*this.conn.on("data", function (data) {
        this.connection.receiveMultiplayerData(data);
      });*/

    });

    
    
  }

  getClientData() {
    return JSON.stringify({
      position: player.body.position,
      velocity: player.body.velocity,
      keys: keys,
      alive: player.alive,
    });
  }

  getMultiplayerData() {
    return JSON.stringify({
      position: player.body.position,
      velocity: player.body.velocity,
      keys: keys,
      alive: player.alive,
      id: player.body.id,
      stabilsing: player.stabilsing,
      ducking:player.isDucking,
      bleeding:player.bleeding,
    });
  }

  updateHost() {
    this.conn.send(this.getMultiplayerData());
  }

  receiveMultiplayerData(data) {
    console.log(data);
    /*
        data = JSON.parse(data)
        */
  }
}
class HostConnection extends Connection {
  constructor(buffer=false) {
    super();
    this.isBuffer = buffer
  }
  init(id = `${Math.floor(Math.random() * 10e4)}`) {
    this.initialize(id);
  }

  buffer(id) {
    this.clientConnection = new ClientConnection(id, false)
    this.clientConnection.init()
    console.log("initing")
  }

  receiveMultiplayerData(data) {
    if (data.split(" ")[0] == "buffer") {
      this.buffer(data.split(" ")[1])
    } if (data.split(" ")[0].includes("eval") && joining) {
      console.log(data, data.split(" ")[1])
      

      eval(data.split(" ")[1].replace("\"",""))
    } else receiveMultiplayerData(JSON.parse(data))
    
  }
  

  sendClientDataBack() {
    this.clientConnection.conn.send("{}")
  }
}

function receiveMultiplayerData(data) {
  function runsinglePlayer(data) {
    var ids = [];

    function findId(id) {
      ids = []
      for (let i = 0; i < enemeyPlayers.length; i++) {
        const en = enemeyPlayers[i];
        ids.push(en.body.id);
      }
      return ids.indexOf(id);

    }
    
    var idIndex = findId(data.id)
    if (idIndex < 0) {
      createClientEnemey(data.id);
    }
    var idIndex = findId(data.id)
    if (idIndex >= 0) {
      var enemeyPlayer = Matter.Composite.get(engine.world,ids[idIndex],"body")
      Matter.Body.setPosition(enemeyPlayer, data.position);
      Matter.Body.setVelocity(enemeyPlayer, data.velocity);
      enemeyPlayer.controller.alive = data.alive;
      enemeyPlayer.controller.preKeys = enemeyPlayer.controller.keys
      enemeyPlayer.controller.keys = data.keys
      enemeyPlayer.controller.stabilsing = data.stabilsing||true
      enemeyPlayer.controller.ducking = data.ducking
      console.log(data.ducking)
      enemeyPlayer.controller.bleeding = data.bleeding||false

      if (!data.alive) enemeyPlayer.controller.kill(false);
    }
  }
  if (data.length==undefined) {
    runsinglePlayer(data)
  } else {
    for (let i = 0; i < data.length; i++) {
      const player2 = data[i];
      if (player2.id != player.body.id) runsinglePlayer(player2)
    }
  }
  
}

function createClientEnemey(id) {
  var en = new PlayerController(engine, {
    id:id,
    body: {
      scale: 15,
      density: 0.01,
    },

    speed: 0.6,
  });
  enemeyPlayers.push(en)
  return en
}

function broadcastData(data) {
  for (let i = 0; i < hostConnections.length; i++) {
    const hostConn = hostConnections[i];
    console.log()
    if (hostConn.clientConnection) if (hostConn.clientConnection.conn) hostConn.clientConnection.conn.send(JSON.stringify(data));
  }
}
function updateClients() {
  broadcastData(getMultiplayerData());
}

function getMultiplayerData() {
  var data = [],
      playersArray = [...enemeyPlayers,player]
  for (let i = 0; i < playersArray.length; i++) {
    const player = playersArray[i];
    data.push(
      {
        position: player.body.position,
        velocity: player.body.velocity,
        keys: player.keys,
        alive: player.alive,
        id: player.body.id,
        ducking:player.isDucking,
        stabilsing:player.stabilsing,
      }
    )
  }
  return data
}

function addClientPort() {
  var newConn = new HostConnection();
  hostConnections.push(newConn);
  newConn.init();
}
var enemeyPlayers = new Array(),
  enemeyPlayerComp = Matter.Composite.create();

Matter.Composite.add(engine.world, enemeyPlayerComp);



var hostConnections = [],
  clientConnection = undefined;
document.body.onload = () => {
  setTimeout(() => {
    if (host) {
      player.name = "host"
    } else if (joining) {
      clientConnection = new ClientConnection(joining, true);
      clientConnection.init()
    }
  }, 1000);
    document.getElementById("addClientBut").onclick = addClientPort
    if (!host) {
      document.getElementById("addClientBut").style.display = "none"
    }
};



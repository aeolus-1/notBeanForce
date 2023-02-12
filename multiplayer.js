
var status = location.href.split("?")[1],
  host = urlInfo.host||false,
  joining = urlInfo.join||false//status.includes("join") ? status.split("=")[1] : false,
  online = false,

  username = decodeURI(urlInfo.userName||"unnamed")
  //if (username != undefined) {username = username.split("=")[1]} else {username = prompt("Username?")}


  var logEvents = []

  



class Connection {
  constructor(joining=undefined) {
    this.lastPeerId = null;
    this.peer = null; // Own peer object
    this.peerId = null;
    this.conn = null;

    this.online = false;
    dummylog(joining)
    this.joining = joining
  }
  initialize(id) {
    // Create own peer object with connection to shared PeerJS server
    this.peer = new Peer(id, {
      debug: 2,
      
    });

    this.peer.connection = this;

    this.peer.on("open", function (id) {
      dummylog(this);
      // Workaround for peer.reconnect deleting previous id
      if (this.id === null) {
        dummylog("Received null id from peer open");
        this.id = this.connection.lastPeerId;
      } else {
        this.connection.lastPeerId = this.id;
      }

      dummylog("ID: ", this.id);
      if (host && this.connection.hostId==undefined) document.getElementById("idDiv").innerHTML += `
      <div class="clientPort" id="clientPort-${this.id}">
      <b id="c${this.id}">${this.id}</b> - <a href="#" onclick="(function(){
        navigator.clipboard.writeText('https://aeolus-1.github.io/notBeanForce?join=${this.id}');
        return false;
    })();return false;">[Copy Link]</a> (Good for one person only)<br>
      <span>Waiting ...</span>
      </div><br>
      `
      setNewClient(false)
      dummylog("Awaiting connection...");
      if (this.connection.joining) {
        this.connection.join(this.connection.hostId);
      } else {
        if (this.connection.isBuffer) {
          dummylog("send reply buffer")
          clientConnection.conn.send("buffer "+this.id)
        }
      }
    });
    this.peer.on("connection", function (c) {
      dummylog('connected')
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
      dummylog(this.connection instanceof HostConnection, host)
      if (host) {
        dummylog(this.id)
        setPortDivContent(this.id, "Connecting")
        //document.getElementById("idDiv").innerHTML = document.getElementById("idDiv").innerHTML.replace(this.id+"</a>",this.id+`</a> - Connected <span id="connectNameSpan${this.id}>(unkown)</span>`)
      }

      dummylog("Connected to: " + this.connection.conn.peer);

      this.connection.ready();
    });
    this.peer.on("disconnected", function () {
      dummylog("Connection lost. Please reconnect");
      this.connection.online = false;
      // Workaround for peer.reconnect deleting previous id
      this.id = this.connection.lastPeerId;
      this._lastServerId = this.connection.lastPeerId;
      this.reconnect();
    });
    this.peer.on("close", function () {
      this.connection.conn = null;
      this.connection.online = false;
      dummylog("Connection destroyed");
    });
    this.peer.on("error", function (err) {
      dummylog(err);
      alert("" + err);
    });
  }
  ready() {
    this.conn.on("data", function (data) {
      this.connection.receiveMultiplayerData(data, this.connection.lastPeerId);
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
      dummylog("Connected to: " + this.peer);
      
      
      
      
      if (this.connection.addBuffer) {
        this.connection.buffer()
      } else {
        dummylog("connection by buffer")
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
      player:{
        position: player.body.position,
        velocity: player.body.velocity,
        keys: keys,
        alive: player.alive,
        id: player.body.id,
        stabilsing: player.stabilsing,
        ducking:player.isDucking,
        bleeding:player.bleeding,
        username:player.username,
      },
      logEvents:logEvents
    });
    logEvents = []
  }

  getMultiplayerData() {
    return JSON.stringify({
      player:{
        position: player.body.position,
        velocity: player.body.velocity,
        keys: keys,
        alive: player.alive,
        id: player.body.id,
        stabilsing: player.stabilsing,
        ducking:player.isDucking,
        bleeding:player.bleeding,
        username:player.username,
      },
      logEvents:logEvents
    });
    logEvents = []
  }

  updateHost() {
    this.conn.send(this.getMultiplayerData());
  }

  
}
class HostConnection extends Connection {
  constructor(buffer=false) {
    super();
    this.isBuffer = buffer
  }
  init(id = `${levelSelection}${Math.floor(Math.random() * 10e4)}`) {
    this.initialize(id);
  }

  buffer(id) {
    this.clientConnection = new ClientConnection(id, false)
    this.clientConnection.init()
    dummylog("initing")
  }

  receiveMultiplayerData(data, id) {
    if (data.split(" ")[0] == "buffer") {
      this.buffer(data.split(" ")[1])
    } if (data.split(" ")[0].includes("eval") && joining) {
      dummylog(data, data.split(" ")[1])
      

      //eval(data.split(" ")[1].replace("\"",""))
    } else receiveMultiplayerData(JSON.parse(data), id)
    
  }
  

  sendClientDataBack() {
    this.clientConnection.conn.send("{}")
  }
}

function receiveMultiplayerData(data, id) {

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
      createClientEnemey(data.id, id);
      if (host) pushMsg(`<span style="color:#1b2469;"><b>${data.username}</b> has probably joined the game</span>`)
    }
    var idIndex = findId(data.id)
    if (idIndex >= 0) {
      var enemeyPlayer = Matter.Composite.get(engine.world,ids[idIndex],"body")

      enemeyPlayer.controller.afkTicker = (new Date()).getTime()

      Matter.Body.setPosition(enemeyPlayer, data.position);
      Matter.Body.setVelocity(enemeyPlayer, data.velocity);
      enemeyPlayer.controller.alive = data.alive;
      enemeyPlayer.controller.preKeys = enemeyPlayer.controller.keys
      enemeyPlayer.controller.keys = data.keys
      enemeyPlayer.controller.stabilsing = data.stabilsing
      enemeyPlayer.controller.ducking = data.ducking
      enemeyPlayer.controller.bleeding = data.bleeding

      enemeyPlayer.controller.username = data.username
      

      if (!data.alive) enemeyPlayer.controller.kill(false);
    }
  }
  if (data.players==undefined) {
    runEvents(data.logEvents)
    runsinglePlayer(data.player)
    setPortDivContent(id, `Connected - ${data.player.username}`)
  } else {
    if (data.customOptions!=undefined) runOptions(data.customOptions)
    log = data.log
    data = data.players

    for (let i = 0; i < data.length; i++) {
      const player2 = data[i];
      if (player2.id != player.body.id) runsinglePlayer(player2)
    }
  }
  
}

function createClientEnemey(id, portId) {
  var en = new PlayerController(engine, {
    id:id,
    body: {
      scale: 15,
      density: 0.01,
    },

    speed: 0.6,
  });
  enemeyPlayers.push(en)
  en.portId = portId
  return en
}

function broadcastData(data) {
  for (let i = 0; i < hostConnections.length; i++) {
    const hostConn = hostConnections[i];
    dummylog()
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
        bleeding:player.bleeding,
        username:player.username,
      }
    )
  }
  return {
    players:data,
    log:log,
    customOptions:customOptions
  }
}

function addClientPort() {
  var newConn = new HostConnection();
  hostConnections.push(newConn);
  newConn.init();
  setNewClient(true)
}
var enemeyPlayers = new Array(),
  enemeyPlayerComp = Matter.Composite.create();

Matter.Composite.add(engine.world, enemeyPlayerComp);



var hostConnections = [],
  clientConnection = undefined;
document.body.onload = () => {
  setNewClient(true)
  if (host) document.getElementById("hostOptionsDiv").style.display = ""

  document.getElementById("logDiv").onscroll = ()=>{
    if (resetScrollTimeout != null) clearTimeout(resetScrollTimeout)
    resetScrollTimeout = setTimeout(() => {
        document.getElementById("logDiv").scroll(0, 100000000)
        resetScrollTimeout = null
    }, 3500);

}
  setTimeout(() => {
    if (host) {
      player.name = "host"
      setNewClient(false)
      pushMsg("Host server ready")

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


function runEvents(events) {
  log = [...log, ...events]
}

function setPortDivContent(id, content) {
  document.getElementById(`clientPort-${id}`).children[3].textContent = content
}
function setNewClient(disabled) {
  document.getElementById("addClientBut").disabled = disabled
}

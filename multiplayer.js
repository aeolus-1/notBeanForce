var status = location.href.split("?")[1],
  host = status.includes("host"),
  joining = status.includes("join") ? status.split("=")[1] : false,
  online = false;

class Connection {
  constructor() {
    this.lastPeerId = null;
    this.peer = null; // Own peer object
    this.peerId = null;
    this.conn = null;

    this.online = false;
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
      document.getElementById("idDiv").textContent = this.id;
      console.log("Awaiting connection...");
      if (joining) {
        this.connection.join(this.connection.hostId);
      }
    });
    this.peer.on("connection", function (c) {
      // Allow only a single connection
      online = true;

      document.getElementById("idDiv").textContent = "connected";
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
      console.log("Connected to: " + this.connection.conn.peer);

      this.connection.ready();
    });
    this.peer.on("disconnected", function () {
      console.log("Connection lost. Please reconnect");
      online = false;
      // Workaround for peer.reconnect deleting previous id
      this.id = this.connection.lastPeerId;
      this._lastServerId = this.connection.lastPeerId;
      this.reconnect();
    });
    this.peer.on("close", function () {
      this.connection.conn = null;
      console.log("Connection destroyed");
    });
    this.peer.on("error", function (err) {
      console.log(err);
      alert("" + err);
    });
  }
  ready() {
    this.conn.on("data", function (data) {
      console.log(this);
      this.connection.receiveMultiplayerData(data);
    });
    this.conn.on("close", function () {
      this.conn = null;
    });
  }
}
class ClientConnection extends Connection {
  constructor(id) {
    super();
    this.hostId = id;
  }

  init() {
    this.initialize(null);
  }

  join(id) {
    console.log(this);
    // Close old connection
    if (this.conn) {
      this.conn.close();
    }

    // Create connection to destination peer specified in the input field
    this.conn = this.peer.connect(id, {
      reliable: true,
    });
    this.conn.connection = this;

    this.conn.on("open", function () {
      console.log("Connected to: " + this.peer);
      setInterval(() => {
        clientConnection.updateHost();
      }, 50);
      this.online = true;
    });
    // Handle incoming data (messages only since this is the signal sender)
    this.conn.on("data", function (data) {
      //console.log("data", data);
      this.connection.receiveMultiplayerData(data);
    });
    this.conn.on("close", function () {
      this.connection.online = false;
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
  constructor() {
    super();
  }
  init(id = `${Math.floor(Math.random() * 10e4)}`) {
    this.initialize(id);
  }

  getMultiplayerData() {
    return JSON.stringify({
      position: player.body.position,
      velocity: player.body.velocity,
      keys: keys,
      alive: player.alive,
    });
  }

  receiveMultiplayerData(data) {
    console.log(data)
    data = JSON.parse(data);
    var ids = [];

    function findId(id) {
      ids = []
      for (let i = 0; i < enemeyPlayers.length; i++) {
        const en = enemeyPlayers[i];
        ids.push(en.body.id);
      }
      console.log(ids.indexOf(id))
      return ids.indexOf(id);

    }
    
    var idIndex = findId(data.id)
    if (idIndex < 0) {
      this.createClientEnemey(data.id);
    }
    var idIndex = findId(data.id)
    if (idIndex >= 0) {
      var enemeyPlayer = Matter.Composite.get(engine.world,ids[idIndex],"body")
      console.log(enemeyPlayer)
      Matter.Body.setPosition(enemeyPlayer, data.position);
      Matter.Body.setVelocity(enemeyPlayer, data.velocity);
      enemeyPlayer.controller.alive = data.alive;
      enemeyPlayer.controller.preKeys = enemeyPlayer.controller.keys
      enemeyPlayer.controller.keys = data.keys

      if (!data.alive) enemeyPlayer.controller.kill(false);
    }
  }

  createClientEnemey(id) {
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
}

function broadcastData(data) {
  for (let i = 0; i < hostConnections.length; i++) {
    const hostConn = hostConnections[i];
    hostConn.conn.send(data);
  }
}
function updateClients() {
  broadcastData(getMultiplayerData());
}

function addClientPort() {
  var newConn = new HostConnection();
  hostConnections.push(newConn);
  newConn.init();
}
var enemeyPlayers = new Array(),
  enemeyPlayerComp = Matter.Composite.create();

Matter.Composite.add(engine.world, enemeyPlayerComp);

function updateRecivedEnemy(enemey) {
  if (false) {
    enemeyPlayer = new PlayerController(engine, {
      body: {
        scale: 15,
        density: 0.01,
      },

      speed: 0.6,
    });

    window.enemeyKeys = {};
  }
}

var hostConnections = [],
  clientConnection = undefined;
document.body.onload = () => {
  setTimeout(() => {
    if (host) {
    } else if (joining) {
      clientConnection = new ClientConnection(joining);
    }
  }, 1000);
};

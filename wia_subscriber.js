// Create an instance of Wia
// Replace 'd_sk_abcdef' with your device secret key
let jsonData = require('./../pi_assignment_settings/settings.json'); 
const wia = require('wia')(jsonData.wia); //jsonData.wia contains the required code

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: 'root',
  password: "123456",
  database: "intruderalarm",
  port: '3306'
});

// Subscribe to all events for a device
// Replace 'dev_abc123' with your device ID


wia.events.subscribe({
  device: 'dev_STZnJ6QW'
}, function(event) {
  console.log(event.id + ": " + event.name + ": " + event.data + " " + " " + event.timestamp);
  console.log(event);
  //console.log(`INSERT INTO Enviro (timeEnviro, ${event.name}) VALUES ('${event.timestamp}', '${event.data}');`)
  const eventName = event.name;
  var sql = `INSERT INTO ${event.name} (id, time${event.name}, ${event.name}) VALUES ('${event.id}','${event.timestamp}', '${event.data}');`;
  addToDb(sql);
  /*if ((eventName == "temperature") || (eventName == "pressure") || (eventName == "humidity"))
 {
       var sql = `INSERT INTO Enviro${event.name} (id, timeEnviro, ${event.name}) VALUES ('${event.id}','${event.timestamp}', '${event.data}');`; 
  addToDb(sql);
    
  }
else if(eventName == "alarmset"){
var sql = `INSERT INTO ${event.name} (id, time${event.name}, ${event.name}) VALUES ('${event.id}','${event.timestamp}', '${event.data}');`;
addToDb(sql);
}
else if(eventName == "door_contact_1"){
  var sql = `INSERT INTO ${event.name} (id, time${event.name}, ${event.name}) VALUES ('${event.id}','${event.timestamp}', '${event.data}');`;
  addToDb(sql);
  }
else if(eventName == "door_contact_2"){
  var sql = `INSERT INTO ${event.name} (id, time${event.name}, ${event.name}) VALUES ('${event.id}','${event.timestamp}', '${event.data}');`;
  addToDb(sql);
  }
else if(eventName == "tamper_door_1"){
  var sql = `INSERT INTO ${event.name} (id, time${event.name}, ${event.name}) VALUES ('${event.id}','${event.timestamp}', '${event.data}');`;
  addToDb(sql);
  }
else if(eventName == "tamper_door_2"){
  var sql = `INSERT INTO ${event.name} (id, time${event.name}, ${event.name}) VALUES ('${event.id}','${event.timestamp}', '${event.data}');`;
  addToDb(sql);
  }
  else if(eventName == "pir"){
    var sql = `INSERT INTO ${event.name} (id, time${event.name}, ${event.name}) VALUES ('${event.id}','${event.timestamp}', '${event.data}');`;
    addToDb(sql);
    }
  else if(eventName == "alarm"){
    var sql = `INSERT INTO ${event.name} (id, time${event.name}, ${event.name}) VALUES ('${event.id}','${event.timestamp}', '${event.data}');`;=
    addToDb(sql);
    }
  else if(eventName == "video_event"){
    var sql = `INSERT INTO ${event.name} (id, time${event.name}, ${event.name}) VALUES ('${event.id}','${event.timestamp}', '${event.data}');`;
    console.log(sql);
    addToDb(sql);
    }
  else if(eventName == "intruder_image"){
    var sql = `INSERT INTO ${event.name} (id, time${event.name}, ${event.name}) VALUES ('${event.id}','${event.timestamp}', '${event.data}');`;
    console.log(sql);
    addToDb(sql);
  }
*/
});

function addToDb(sql){
con.query(sql, function (err, result) {
  if (err) throw err;
  console.log("1 record inserted");
  });

}
// Connect to the MQTT API
wia.stream.connect();



con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
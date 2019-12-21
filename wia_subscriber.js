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
  console.log(`INSERT INTO Enviro (timeEnviro, ${event.name}) VALUES ('${event.timestamp}', '${event.data}');`)
  const eventName = event.name;
  if ((eventName == "temperature") || (eventName == "pressure") || (eventName == "humidity"))
  {
  var sql = `INSERT INTO Enviro${event.name} (id, timeEnviro, ${event.name}) VALUES ('${event.id}','${event.timestamp}', '${event.data}');`;
  
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
    });
  };


});

// Connect to the MQTT API
wia.stream.connect();



con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
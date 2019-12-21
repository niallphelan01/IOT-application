//final alarm installation coding

//declarations

const gpio = require('onoff').Gpio; //GPIO NPM repository
const bme280 = require('bme280'); //BME280 sensor 

//import the wia blynk and bluetooth from a json file only once at opening of the application
let jsonData = require('./../pi_assignment_settings/settings.json'); 

//GPIO initialisations
var pir = new gpio(12, 'in', 'both'); //pir sensor
var drContact1 = new gpio(17, 'in', 'both'); 
var drContact2 = new gpio(23, 'in', 'both');
var relay = new gpio(18, 'high'); //use GPIO pin 18 as output
var tamper= new gpio(22,'in', 'both');
var tamper2= new gpio(24,'in', 'both');

//Wia initialisation
const wia = require('wia')(jsonData.wia); //jsonData.wia contains the required code

//blynk initilisation
var Blynk = require("blynk-library");
var AUTH = jsonData.Blynk; //jsonData.Blynk contains the required authorisation code
var blynk = new Blynk.Blynk(AUTH);

//initialisation of blynk pins
var v0 = new blynk.VirtualPin(0); //temperature
var v1 = new blynk.VirtualPin(1); //main button to turn on the Alarm
var v2 = new blynk.VirtualPin(2); //alarm status
var v3 = new blynk.VirtualPin(3); //video url (to be added)

//Blynk connection
blynk.on('connect', function() {
    console.log("Blynk ready.");
    blynk.syncAll();
  });


setInterval(interval_sensor, 60000); // time interval (ms) to retrive the bme280 sensor information and send to Wia/Blynk

//the funtion for sending the information retrieved from the bme280 sensors
function interval_sensor() 
{ 
    bme280.open().then(async sensor => 
        {
           console.log(await sensor.read());
           var reading = await sensor.read(); 
       
        publish_enviro(reading); //call the publishing of the bme Sensors to Wia and Blynk
        
        await sensor.close();
        })
        .catch(console.log);
}

const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
      }

function publish_enviro(reading) //function to publish the bmesensor results
     {
        v0.on('read',function()
        { 
           v0.write(reading.temperature)
        });
        wia.events.publish(
        {
           name: 'temperature',
            data: reading.temperature
        });
        wia.events.publish(
        {
            name: 'humidity',
            data: reading.humidity
         });
        wia.events.publish(
        {             
            name: 'pressure',
            data: reading.pressure
        });
     }
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

//starting of the Alarm using a virtual button from Blynk
v1.on('write', function(param) 
{
      if (param[0]==1)
      {
          console.log('Alarm Arming');
          sleep(5000).then(() => 
          {
          //Give the user 5 seconds to exit the shed etc 
              wia.events.publish(
                  {
                      name: 'alarmset',
                      data: 'Set'
                  });
              console.log('Alarm Set');
          //Door Contact 1
          drContact1.watch(function (err, value) 
          { //Watch for hardware interrupts on pushButt$
             if (err) { //if an error
                 console.error('There was an error', err); //output error message to console
                 return;
             }  // buzzer.writeSync(value); //turn Buzzer on or off depending on the button state (0 $
          
          if (value == 1)
                 valueDrContact1 = 'closed'
          else {
                 valueDrContact1 = 'open'
                 relay.writeSync(value); //turn Relay on when this condition is met but it can only be turned off by the virtual button
          }
          console.log("Door sensor 1:" , valueDrContact1)  
          wia.events.publish({
               name: 'door_contact_1',
               data: valueDrContact1 
          });
          getAlarmStatus(); //get the alarm status by checking the state of the relay on/off
  });
  
  //tamper 1 
  tamper.watch(function (err, value) { //Watch for hardware interrupts on pushButt$
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
    return;
    }
    relay.writeSync(value); //turn Relay on or off depending on the button state (0 or$
    // buzzer.writeSync(value); //turn Buzzer on or off depending on the button state (0 $
    // console.log("Door sensor 1:" , drContact1.readSync())
     if (value == 1)
          valueDrTamper1 = 'normal'
     else {
          valueDrTamper1 = 'tamper'
          relay.writeSync(value); //turn Relay on when this condition is met but it can only be turned off by the virtual button
     }
    console.log("Door contact 1:" , valueDrTamper1)  
  wia.events.publish({
    name: 'tamper_door_1',
    data: valueDrTamper1 
    });
    getAlarmStatus(); //get the alarm status by checking the state of the relay on/off and publish
  });
  
  //tamper 2
  tamper2.watch(function (err, value) { //Watch for hardware interrupts on pushButt$
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
    return;
    }
    relay.writeSync(value); //turn Relay on or off depending on the button state (0 or$
    // buzzer.writeSync(value); //turn Buzzer on or off depending on the button state (0 $
    // console.log("Door sensor 1:" , drContact1.readSync())
     if (value == 1)
          valueDrTamper2 = 'normal'
     else
     {
          valueDrTamper2 = 'tamper'
          relay.writeSync(value); //turn Relay on when this condition is met but it can only be turned off by the virtual button
     }
    console.log("Door contact 2:" , valueDrTamper2)  
  wia.events.publish({
    name: 'tamper_door_2',
    data: valueDrTamper2 
    });
    getAlarmStatus();//get the alarm status by checking the state of the relay on/off and publish
  });
  
  //Door Contact 2
  drContact2.watch(function (err, value) { //Watch for hardware interrupts on pushButt$
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
    return;
    }
    relay.writeSync(value); //turn Relay on or off depending on the button state (0 or$
    // buzzer.writeSync(value); //turn Buzzer on or off depending on the button state (0 $
    //console.log("Door sensor 2:" , drContact2.readSync())
     if (value == 1)
          valueDrContact2 = 'closed'
     else
     {
          valueDrContact2 = 'open'
          relay.writeSync(value); //turn Relay on when this condition is met but it can only be turned off by the virtual button
     }
    console.log("Door sensor 2:" , valueDrContact2)
    wia.events.publish({
    name: 'door_contact_2',
    data: valueDrContact2
    });
    getAlarmStatus();//get the alarm status by checking the state of the relay on/off and publish
  });
  
  //Pir sensor (motion)
  pir.watch(function (err, value) { //Watch for hardware interrupts on pushButt$
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
    return;
    }
    //relay.writeSync(value); //turn Relay on or off depending on the button state (0 or$
    // buzzer.writeSync(value); //turn Buzzer on or off depending on the button state (0 $
    // console.log("Door sensor 1:" , drContact1.readSync())
     if (value == 1)
          pirValue = 'normal'
     else
         {
          pirValue = 'motion'
          relay.writeSync(value); //turn Relay on when this condition is met but it can only be turned off by the virtual button
         }
          console.log("Pir:" , pirValue)  
    wia.events.publish({
    name: 'pir',
    data: pirValue
    });
    getAlarmStatus();//get the alarm status by checking the state of the relay on/off and publish
  });
  
    }
  )}
    else{
    console.log('Alarm Off');
    //report the status of the alarm
    wia.events.publish({
      name: 'alarmset',
      data: 'Unset'
      });
    //stop watching for a change of state on the contacts and tampers
    pir.unwatch(); // unwatch the tamper
    tamper.unwatch(); //tamper 1 unwatch
    tamper2.unwatch(); //tamper 2 unwatch
    drContact1.unwatch(); //unwatch the door 2 contact
    drContact2.unwatch(); //unwatch the door 2 contact
    relay.writeSync(1); //turn the relay off 
    alarmStatus = 'reset' //reset of the alarm status
    v2.write(0); //display alarm status to blynk
    wia.events.publish({
    name: 'alarm',
    data: alarmStatus
    });
  }
  });

  function getAlarmStatus(){
    relaystatus = relay.readSync();
    if (relaystatus == 0){
          alarmStatus = 'alarm'
          v2.write(255);} //display alarm status to blynk
    else
          {  
          alarmStatus = 'normal';
          v2.write(0);} //display alarm status to blynk
    wia.events.publish({
    name: 'alarm',
    data: alarmStatus
    });
  }
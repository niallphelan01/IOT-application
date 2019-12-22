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
var v3 = new blynk.WidgetLCD(3); //alarm setting status Set/Unset

//Blynk connection
blynk.on('connect', function() {
    console.log("Blynk ready.");
    blynk.syncAll();
  });
v3.clear() //Clear the LCD

//pi camera initial settings
const PiCamera = require('pi-camera');
//https://www.npmjs.com/package/pi-camera

//code for S3

var s3 = require('s3');
const accessKeyIdJson = jsonData.accessKeyId;
const secretAccessKeyJson = jsonData.secretAccessKey;

var client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: accessKeyIdJson,
    secretAccessKey: secretAccessKeyJson,
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  },
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
          v3.print(0,0,"Alarm Arming");//prints the alarm set status to the blynk app
          sleep(5000).then(() => 
          {
          //Give the user 5 seconds to exit the shed etc 
              wia.events.publish(
                  {
                      name: 'alarmset',
                      data: 'Set'
                  });
              console.log('Alarm Set');
              v3.print(0,0,'Alarm set     ');//prints the alarm set status to the blynk app
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
          setAlarmStatus(); //get the alarm status by checking the state of the relay on/off
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
    setAlarmStatus(); //get the alarm status by checking the state of the relay on/off and publish
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
    setAlarmStatus();//get the alarm status by checking the state of the relay on/off and publish
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
    setAlarmStatus();//get the alarm status by checking the state of the relay on/off and publish
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
          relaystatus = relay.readSync();
          if (relaystatus == 1) {  //double check to see if the relay has already been  set as we dont want continual videos for motion
              relay.writeSync(value); //turn Relay on when this condition is met but it can only be turned off by the virtual button
             setAlarmStatus();//get the alarm status by checking the state of the relay on/off and publish
           }
         }
          console.log("Pir:" , pirValue)  
    wia.events.publish({
    name: 'pir',
    data: pirValue
    });
    
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
    v3.print(0,0,"Alarm unset   ");//prints the alarm set status to the blynk app
    v2.write(0); //display alarm status to blynk
    wia.events.publish({
    name: 'alarm',
    data: alarmStatus
    });
  }
  });

  function setAlarmStatus(){
    relaystatus = relay.readSync();
    if (relaystatus == 0){
          alarmStatus = 'alarm'
          v2.write(255);
          takePhoto(); 
          checkForDevices();
           
}
 //display alarm status to blynk
    
    
    else
          {  
          alarmStatus = 'normal';
          v2.write(0);} //display alarm status to blynk
    wia.events.publish({
    name: 'alarm',
    data: alarmStatus
    });
  }

  function takePhoto(){

    let current_datetime = new Date();
    var formatted_date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear() + "-" + current_datetime.getDate() + "__" + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()
    
      const myCameraPhoto = new PiCamera({
        mode: 'photo',
        output: `${ __dirname }/${formatted_date}.jpg`,
        width: 640,
        height: 480,
        nopreview: true,
      });
       
        myCameraPhoto.snap()
        .then((result) => {
            // Your picture was captured
           console.log("photo captured")
           console.log(`And would be sent to https://iotbucketniallphelan.s3-eu-west-1.amazonaws.com/${formatted_date}.jpg`)
           var params = {
            localFile: `${ __dirname }/${formatted_date}.jpg`,
           
            s3Params: {
              Bucket: "iotbucketniallphelan",
              Key: `${formatted_date}.jpg`,
              ACL:'public-read'
              // other options supported by putObject, except Body and ContentLength.
              // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
            },
          };
          var uploader = client.uploadFile(params);
          //var uploader = client.uploadFile(params);
          uploader.on('error', function(err) {
            console.error("unable to upload:", err.stack);
          });
          uploader.on('progress', function() {
            console.log("progress", uploader.progressMd5Amount,
                      uploader.progressAmount, uploader.progressTotal);
          });
          uploader.on('end', function() {
            console.log("done uploading");
          });
          takevideo();
          wia.events.publish({
            name: 'intruder_image',
            data: `https://iotbucketniallphelan.s3-eu-west-1.amazonaws.com/${formatted_date}.jpg`
            })
           })
           
          .catch((error) => {
             // Handle your error
          });
    
}
function takevideo(){
    let current_datetime = new Date();
    var formatted_date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear() + "-" + current_datetime.getDate() + "__" + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()
    const myCamera = new PiCamera({
        mode: 'video',
        output: `${ __dirname }/${formatted_date}.h264`,
        width: 1920,
        height: 1080,
        timeout: 3000, // Record for 5 seconds
        nopreview: true,
      });
     myCamera.record()
       .then((result) => {
          
       // Your video was captured
       console.log("video captured")
       console.log(`And would be sent to https://iotbucketniallphelan.s3-eu-west-1.amazonaws.com/${formatted_date}.H264`)
       var params = {
        localFile: `${ __dirname }/${formatted_date}.h264`,
       
        s3Params: {
          Bucket: "iotbucketniallphelan",
          Key: `${formatted_date}.H264`,
          ACL:'public-read'
          // other options supported by putObject, except Body and ContentLength.
          // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
        },
      };
      var uploader = client.uploadFile(params);
      //var uploader = client.uploadFile(params);
      uploader.on('error', function(err) {
        console.error("unable to upload:", err.stack);
      });
      uploader.on('progress', function() {
        console.log("progress", uploader.progressMd5Amount,
                  uploader.progressAmount, uploader.progressTotal);
      });
      uploader.on('end', function() {
        console.log("done uploading");
      });
      wia.events.publish({
        name: 'video',
        data: `https://iotbucketniallphelan.s3-eu-west-1.amazonaws.com/${formatted_date}.H264`
        })
       })
       .catch((error) => {
       // Handle your error
       });
}

function checkForDevices(){ //this will list the devices at home at the time of the alarm https://www.npmjs.com/package/local-network-scanner
    const scanner = require('local-network-scanner');
scanner.scan({arguments: ["-l"]}, devices => {
    console.log(devices);
    wia.events.publish({
        name: 'listofdevicesathome',
        data: devices
        });
});

}
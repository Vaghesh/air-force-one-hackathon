
//Set up our GPIO input for pin 5 on the Arduino breakout board
var mraa = require('mraa');
var groveSensor = require('jsupm_grove');
var exec = require('sync-exec');
var Client = require("ibmiotf");

var motionSensor = new mraa.Gpio(5);
var button = new groveSensor.GroveButton(6);
var mylcd = new (require("jsupm_i2clcd").Jhd1313m1)(6, 0x3E, 0x62);
motionSensor.dir(mraa.DIR_IN);
writeLCD("Not Monitoring", 0,0,255);


var monitoring = false;
var intervalId;

//Set up our node mailer
var nodemailer = require("nodemailer");
// For Google account, you need to turn on less secure option from your account.
var smtpTransport = nodemailer.createTransport({
  service: "Gmail",
	auth: {
		user: "airforceonehackathon@gmail.com",
		pass: "xxxxxxxx"
	}
});
var config = {
    "org" : "quickstart",
    "id" : "xxxxxxxxxx",
    "type" : "iotsensor"
};

var deviceClient = new Client.IotfDevice(config);
deviceClient.connect();


function writeLCD(lcdtext,r,g,b){
  mylcd.clear();
  mylcd.setColor(r,g,b);
  mylcd.write(lcdtext);
}



//Here is our sensing function:

function monitoringActivity(){

	//Read our sensor
	var motionSensorTriggered = motionSensor.read();
	//Do stuff if our sensor is read HIGH
	if(motionSensorTriggered){
		deviceClient.publish("status","json",'{"d" : { "pir" : 1}}');
		exec("wget -O /home/root/image.jpg http://localhost:9000/?action=snapshot", 5000);
		//Send our email message
		smtpTransport.sendMail({
			from: "Air Force One Hackathon <airforceonehackathon@gmail.com>",
			to: "Your Name <xxxxxx@gmail.com>",
			subject: "Possible Intruder Alert",
      			attachments:[{   // file on disk as an attachment
            			filename: 'image.jpg',
            			path: '/home/root/image.jpg' // stream this file
        		}],
			text: "Hey! Something activated your motion sensor!"
		}, function(error, response){ //Send a report of the message to the console
			if(error){
				console.log(error);
			}else{
				console.log("Email Sent");
			}
			smtpTransport.close();
		});
	}
	else{
		deviceClient.publish("status","json",'{"d" : { "pir" : 0}}');
	}
	return;
}



//Start sensing!

function periodicActivity()
{
  if (monitoring === false && button.value()){
    console.log("Monitoring");
    writeLCD("Monitoring",255,0,0);
    monitoring = true;
    intervalId = setInterval(monitoringActivity,10000);
  }
  else if (monitoring === true && button.value()) {
    console.log("Not Monitoring");
    writeLCD("Not Monitoring",0,0,255);
	clearInterval(intervalId);
    monitoring = false;
  }
}

console.log("Press button to Monitor your cube");
setInterval(periodicActivity,1000);

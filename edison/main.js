
// Required Packages
var mraa = require('mraa');
var groveSensor = require('jsupm_grove');
var exec = require('sync-exec');
var Client = require("ibmiotf");
var nodemailer = require("nodemailer");



// Initialization of GPIO Pins, Variables and Configurations for Email and Cloud Connectivity
var PIRSensor = new mraa.Gpio(5);
PIRSensor.dir(mraa.DIR_IN);
var touchSensor = new mraa.Gpio(4);
touchSensor.dir(mraa.DIR_IN);
var button = new groveSensor.GroveButton(6);
var mylcd = new (require("jsupm_i2clcd").Jhd1313m1)(6, 0x3E, 0x62);
var monitoring = false;
var intervalId;

var smtpTransport = nodemailer.createTransport({	// Email Configuration
  service: "Gmail",
	auth: {
		user: "airforceonehackathon@gmail.com",
		pass: "xxxxxxxx"
	}
});
var config = {					// Cloud Connectivity Configuration
    "org" : "quickstart",
    "id" : "xxxxxxxxxx",
    "type" : "iotsensor"
};

var deviceClient = new Client.IotfDevice(config);	// Cloud Connectivity Iniitialization
deviceClient.connect();




// Function to write at LCD. Pass parameter LCD text and Red, Green, Blue Colors
function writeLCD(lcdtext,r,g,b){
  mylcd.clear();
  mylcd.setColor(r,g,b);
  mylcd.write(lcdtext);
}

function sendToCloud(value){
	deviceClient.publish("status","json",'{"d" : { "pir" : '+ value +'}}');
} 



// Function to Send Email 
function sendEmail()
{
	exec("wget -O /home/root/image.jpg http://localhost:9000/?action=snapshot", 5000);
	smtpTransport.sendMail({
		from: "Air Force One Hackathon <airforceonehackathon@gmail.com>",
		to: "Air Force One Hackathon <airforceonehackathon@gmail.com>",
		subject: "Possible Intruder Alert - <<Your Name>>",
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



// Function  to start Monitoring your cube
function monitoringActivity(){
	var triggered = PIRSensor.read()
	if(triggered){
		sendToCloud(1);
		sendEmail();
	}
	else{
		sendToCloud(0);
	}
	return;
}

// Loop to check the button value every second. 
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


writeLCD("Ready",0,255,0);
console.log("Press button to Monitor your cube");
setInterval(periodicActivity,1000);


//Set up our GPIO input for pin 5 on the Arduino breakout board
var mraa = require('mraa');
var groveSensor = require('jsupm_grove');
var exec = require('sync-exec');

var motionSensor = new mraa.Gpio(5);
var button = new groveSensor.GroveButton(6);
var mylcd = new (require("jsupm_i2clcd").Jhd1313m1)(6, 0x3E, 0x62);
motionSensor.dir(mraa.DIR_IN);
writeLCD("Not Monitoring", 0,0,255);


var monitoring = false;

//Set up our node mailer
var nodemailer = require("nodemailer");
// For Google account, you need to turn on less secure option from your account.
var smtpTransport = nodemailer.createTransport({
  service: "Gmail",
	auth: {
		user: "xxx@xxx.com",
		pass: "xxxxxxxx"
	}
});


function writeLCD(lcdtext,r,g,b){
  mylcd.clear();
  mylcd.setColor(r,g,b);
  mylcd.write(lcdtext);
}



//Here is our sensing function:

function monitoringActivity(){

	//Read our sensor
	var motionSensorTriggered = motionSensor.read();
  console.log ("Monitoring")
	//Do stuff if our sensor is read HIGH
	if(motionSensorTriggered){
		exec("wget -O /home/root/image.jpg http://webcam.local:9000/?action=snapshot", 5000);
		//Send our email message
		smtpTransport.sendMail({
			from: "Vaghesh Patel <vagheshp@gmail.com>",
			to: "Vaghesh Patel <vagheshp@gmail.com>",
			subject: "Possible Intruder Alert",
      			attachments:[{   // file on disk as an attachment
            			filename: '123.jpg',
            			path: '/home/root/123.jpg' // stream this file
        		}],
			text: "Hey! Something activated your motion sensor!"
		}, function(error, response){ //Send a report of the message to the console
			if(error){
				console.log(error);
			}else{
				console.log("Message sent: " + response.message);
			}
			smtpTransport.close();
		});


    //We don't want 5 million emails, so we want to wait a few seconds
  //(in this case, 30 seconds) before sending another email. The timeout
  //is in milliseconds.  So, for 1 minute, you would use 60000.
    setTimeout(monitoringActivity, 30000);

 	}else{
 		//Our motion sensor wasn't triggered, so we don't need to wait as long.
 		// 1/10 of a second seems about right and allows our Edison to do other
 		// things in the background.
 		setTimeout(monitoringActivity, 100);

    if (monitoring == false){return;}

	}
}



//Start sensing!

function periodicActivity()
{
  if (monitoring == false && button.value()){
    console.log("Monitoring")
    writeLCD("Monitoring",255,0,0)
    monitoring = true;
    monitoringActivity();
  }
  else if (monitoring == true && button.value()) {
    console.log("Not Monitoring")
    writeLCD("Not Monitoring",0,0,255)
    monitoring = false;
  }
}

console.log("Press button to Monitor your cube")
setInterval(periodicActivity,1000);

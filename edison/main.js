
//Set up our GPIO input for pin 5 on the Arduino breakout board
var mraa = require('mraa');
var groveSensor = require('jsupm_grove');
var execSync = require('exec-sync');

var motionSensor = new mraa.Gpio(5);
var button = new groveSensor.GroveButton(6);
var mylcd = new (require("jsupm_i2clcd").Jhd1313m1)(6, 0x3E, 0x62);
motionSensor.dir(mraa.DIR_IN);
mylcd.setColor(0,0,0);

var armed = false;


//Set up our node mailer
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport({
  service: "Gmail",
	auth: {
		user: "vagheshp@gmail.com",
		pass: "xxxxxx"
	}
});


function writeLCD(lcdtext,r,g,b){
  mylcd.clear();
  mylcd.setColor(r,g,b);
  mylcd.write(lcdtext);

}



//Here is our sensing function:

function armedActivity()
{
	//Read our sensor
	var motionSensorTriggered = motionSensor.read();
  console.log("Waiting for Motion Senor")

	//Do stuff if our sensor is read HIGH
	if(motionSensorTriggered){
    execSync("wget -O /home/root/123.jpeg http://webcam.local:9000/?action=snapshot &");
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
        writeLCD("Message Sent",255,255,255)
				console.log("Message sent: " + response.message);
			}
			smtpTransport.close();
		});

		//We don't want 5 million emails, so we want to wait a few seconds
		//(in this case, 30 seconds) before sending another email. The timeout
		//is in milliseconds.  So, for 1 minute, you would use 60000.
		setTimeout(armedActivity, 60000);

	}else{
		//Our motion sensor wasn't triggered, so we don't need to wait as long.
		// 1/10 of a second seems about right and allows our Edison to do other
		// things in the background.
		setTimeout(armedActivity, 100);
	}
}



//Start sensing!
//armedActivity();

function monitoring()
{
  if (armed == false && button.value()){
    console.log("Armed")
    writeLCD("Armed",255,0,0)
    armed = true;
    armedActivity();
  }
  else if (armed == true && button.value()) {
    console.log("Disarmed")
    writeLCD("Disarmed",0,0,255)
    armed = false;
  }
}

setInterval(monitoring,1000);

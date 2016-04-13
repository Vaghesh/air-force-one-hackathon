
//Set up our GPIO input for pin 5 on the Arduino breakout board
var mraa = require('mraa');
var motionSensor = new mraa.Gpio(5);
motionSensor.dir(mraa.DIR_IN);
var mylcd = new (require("jsupm_i2clcd").Jhd1313m1)(6, 0x3E, 0x62);


//Set up our node mailer
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport({
  service: "Gmail",
	auth: {
		user: "vagheshp@gmail.com",
		pass: "nisargdesai"
	}
});


mylcd.setColor(0,0,0);




//Start sensing!
periodicActivity();

function writeLCD(lcdtext,r,g,b){
  mylcd.clear();
  mylcd.setColor(r,g,b);
  mylcd.write(lcdtext);

}

//Here is our sensing function:

function periodicActivity()
{
	//Read our sensor
	var motionSensorTriggered = motionSensor.read();
  console.log("Waiting for Motion Senor")
  writeLCD("Waiting for motion sensor",128,127,124)

	//Do stuff if our sensor is read HIGH
	if(motionSensorTriggered){

		//Send our email message
		smtpTransport.sendMail({
			from: "Vaghesh Patel <vagheshp@gmail.com>",
			to: "Vaghesh Patel <vagheshp@gmail.com>",
			subject: "Possible Intruder Alert",
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
		setTimeout(periodicActivity, 60000);

	}else{
		//Our motion sensor wasn't triggered, so we don't need to wait as long.
		// 1/10 of a second seems about right and allows our Edison to do other
		// things in the background.
		setTimeout(periodicActivity, 100);
	}
}

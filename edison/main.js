
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
var smtpTransport = nodemailer.createTransport({
  service: "Gmail",
	auth: {
		user: "vagheshp@gmail.com",
		pass: "nisargdesai"
	}
});


function writeLCD(lcdtext,r,g,b){
  mylcd.clear();
  mylcd.setColor(r,g,b);
  mylcd.write(lcdtext);
}



//Here is our sensing function:

function monitoring(){

	//Read our sensor
	var motionSensorTriggered = motionSensor.read();

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
        			writeLCD("Message Sent",255,255,255)
				console.log("Message sent: " + response.message);
			}
			smtpTransport.close();
		});

	}
}



//Start sensing!
//armedActivity();

function periodicActivity()
{
  if (monitoring == false && button.value()){
    console.log("Monitoring")
    writeLCD("Monitoring",255,0,0)
    armed = true;
    setTimeout(armedActivity(),10000);
  }
  else if (monitoring == true && button.value()) {
    console.log("Not Monitoring")
    writeLCD("Not Monitoring",0,0,255)
    armed = false;
  }
}

console.log("Press button to Monitor your cube")
setInterval(periodicActivity,1000);

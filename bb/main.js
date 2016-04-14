
var exec = require('sync-exec');
var b = require('bonescript');
var nodemailer = require("nodemailer");



b.pinMode('P9_22', b.INPUT);
b.pinMode('P9_26', b.INPUT);
var monitoring = false;
var intervalId;

// For Google account, you need to turn on less secure option from your account.
var smtpTransport = nodemailer.createTransport({
  service: "Gmail",
	auth: {
		user: "xxxxx@gmail.com",
		pass: "xxxxxx"
	}
});




//Here is our sensing function:

function monitoringActivity(){
	//Read our sensor
	var motionSensorTriggered = b.digitalRead('P9_26');
	//Do stuff if our sensor is read HIGH
	if(motionSensorTriggered){
		exec("wget -O /root/image.jpg http://localhost:9000/?action=snapshot", 5000);
		//Send our email message
		smtpTransport.sendMail({
			from: "Vaghesh Patel <vagheshp@gmail.com>",
			to: "Vaghesh Patel <vagheshp@gmail.com>",
			subject: "Possible Intruder Alert",
      			attachments:[{   // file on disk as an attachment
            			filename: 'image.jpg',
            			path: '/root/image.jpg' 
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
 	}
 	return;
}



//Start sensing!

function periodicActivity()
{
	

    var buttonValue =  b.digitalRead('P9_22');
  	if (monitoring == false && buttonValue){
    	console.log("Monitoring")
    	monitoring = true;
    	intervalId = setInterval(monitoringActivity,10000);
  }
  else if (monitoring == true && buttonValue) {
    	console.log("Not Monitoring")
  		clearInterval(intervalId);
    	monitoring = false;
  }
}

console.log("Press button to Monitor your cube")
setInterval(periodicActivity,1000);

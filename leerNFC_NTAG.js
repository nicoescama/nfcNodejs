"use strict";
const mfrc522 = require("./../index");
const Gpio = require('onoff').Gpio; 
var rl = require('readline');
var mysql = require('mysql');
var ledControlCorriendo = false;


let val = [];


//# Init WiringPi with SPI Channel 0
mfrc522.initWiringPi(0);

//# This loop keeps checking for chips. If one is near it will get the UID and authenticate
console.log("Starting reading");
console.log("Press Ctrl-C to stop.");

setInterval(function(){

    //# reset card
    mfrc522.reset();
    //# Scan for cards
    let response = mfrc522.findCard();
    if (!response.status) {
        return;
    }
    //console.log("Card detected");

    //# Get the UID of the card
    response = mfrc522.getUid();
    if (!response.status) {
        console.log("UID Scan Error");
        return;
    }
    //# If we have the UID, continue
    const uid = response.data;
    //console.log("Card read UID: %s %s %s %s", uid[0].toString(16), uid[1].toString(16), uid[2].toString(16), uid[3].toString(16));

    //# Select the scanned card
    const memoryCapacity = mfrc522.selectCard(uid);
    //console.log("Card Memory Capacity: " + memoryCapacity);
	let valor="";
	let numL="";
	let numString ="";
    //# dump fifo buffer
    for (let i = 0; i < 45; i++) {
		valor=mfrc522.getDataForBlock(i);
		if(i==13){
            numL = valor;
		}
    }
    
    numString = numL[0].toString();
    numString =numString.concat(numL[1]);
    numString =numString.concat(numL[2]);
    numString =numString.concat(numL[3]);
    numString =numString.concat(numL[4]);
    numString =numString.concat(numL[5]);
    numString =numString.concat(numL[6]);
    numString =numString.concat(numL[7]);
    numString =numString.concat(numL[8]);
    numString =numString.concat(numL[9]);
    numString =numString.concat(numL[10]);
    numString =numString.concat(numL[11]);
    numString =numString.concat(numL[12]);
    numString =numString.concat(numL[13]);
    numString =numString.concat(numL[14]);
    numString =numString.concat(numL[15]);
    //console.log(numString); 
    
    //44414A474E455352 en hexa 68,65,74,71,78,69,83,82 en dec
    
    if(numL[0] == 68 && numL[1] == 65 && numL[2] == 74 && numL[3] == 71 && numL[4] == 78 && 
    numL[5] == 69 && numL[6] == 83 && numL[7] == 82){
		//console.log(numL);	
		var con = mysql.createConnection({
           host: "127.0.0.1",
           user: "root",
           password: "raspberry",
           database: "control"
         });
         let yaEsta=false;
         con.connect(function(err) {
           if (err) throw err;
           con.query("SELECT EPC FROM blacklist WHERE  EPC=(?)",[numString], function (err, result, fields){
			  if(err) throw err;
			  if(result.length>0) yaEsta=true;
              if(!yaEsta){
			   con.query("INSERT INTO blacklist (EPC) VALUES (?)",[numString],function(err,result){
				if(err) throw err;
				});
			    con.query("INSERT INTO entradas (EPC) VALUES (?)",[numString],function(err,result){
				if(err) throw err;
				});
				console.log("registrado");
				if(!ledControlCorriendo) ledControl();
				}
			  else{
				console.log("ya estaba registrado");
				if(!ledControlCorriendo) ledControl();
			  }
		   });
         });
	     }
	else{
		console.log("no se ha registrado");
	}
}, 300);

function ledControl() {
			ledControlCorriendo = true;
            console.log("LED encendido");
			const led = new Gpio(17, 'out');    // Export GPIO17 as an output
            led.writeSync(1); // 1 = on, 0 = off :)
              
            setTimeout(function () {
                led.writeSync(0);  // Turn LED off
                console.log("LED apagado");
                led.unexport();    // Unexport GPIO and free resources
                ledControlCorriendo = false;
            }, 3000);
		  }

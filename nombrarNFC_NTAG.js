"use strict";
const mfrc522 = require("./../index");

var rl = require('readline');


let val = [];


//# Init WiringPi with SPI Channel 0
mfrc522.initWiringPi(0);

//# This loop keeps checking for chips. If one is near it will get the UID and authenticate
console.log("First write the new name");
console.log("then, please put a tag in the antenna inductive zone!");
console.log("Press Ctrl-C to stop.");

var i = rl.createInterface(process.stdin, process.stdout, null);
i.question("Enter 8 numbers hexa", function(answer) {
  let nuevo = answer;
   val = nuevo.split(','); 
  // These two lines together allow the program to terminate. Without
  // them, it would run forever.
  i.close();
  process.stdin.destroy();
});

//console.log("despyes");



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
    //# dump fifo buffer
    for (let i = 0; i < 45; i++) {
		valor="Block: "+i+" Data: "+mfrc522.getDataForBlock(i);
		//console.log(valor);
		if(i==13){
            console.log(valor);
		}
    }
    // Clave 44 41 4A 47 4E 45 53 52
    //console.log(val+" val")
    let bits1=[0x44,0x41,0x4A,0x47,0,0,0,0,0,0,0,0,0,0,0,0];
    let bits2=[0x4E,0x45,0x53,0x52,0,0,0,0,0,0,0,0,0,0,0,0];
    let bits3=[val[0],val[1],val[2],val[3],0,0,0,0,0,0,0,0,0,0,0,0];
    let bits4=[val[4],val[5],val[6],val[7],0,0,0,0,0,0,0,0,0,0,0,0];
    mfrc522.writeDataToBlock(16,bits4);
    mfrc522.writeDataToBlock(15,bits3);
    mfrc522.writeDataToBlock(14,bits2);
    mfrc522.writeDataToBlock(13,bits1);

	for (let i = 0; i < 45; i++) {
		valor="Block: "+i+" Data: "+mfrc522.getDataForBlock(i);
		//console.log(valor);
		if(i==13){
            console.log(valor);
            process.kill(process.pid);
		}
    }

}, 500);

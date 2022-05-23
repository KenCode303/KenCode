const ampq = require("amqplib");
const express = require("express");
const app = express();
app.use(express.json());


// global variables for connection and channel
var conn;
var channel;
const queue = "tracking_group4";


// rabbitmq connection parameters

const rabbitSettings = {
   
  
  //hostname: "ec2-54-226-62F-4.compute-1.amazonaws.com", 
  hostname: " ec2-54-226-225-239.compute-1.amazonaws.com",
 
  
  
  
  port: 5672,
  username: "gpsreceiver",//guest 
  password: "gpsreceiver",//guest 
  protocol: "amqp",
 
  vhost: "/",
  authMechanism: ["PLAIN", "AMQPLAIN", "EXTERNAL"],
};

async function connect() {

  try {
    conn = await ampq.connect(rabbitSettings);
    console.log("Connection Created...");

    channel = await conn.createChannel();
    console.log("Channel Created");
    const res = await channel.assertQueue(queue);
    console.log("Queue Created..");

  } catch (err) {
    console.error(`Error -> ${err}`);
    return false;
  }
}

async function sendGPSDataToQueue(gpsData){
  try {
    // check first to see if channel and connection are existing
    if (!(conn && channel)){
      await connect();
    }

    const messageToQueueRes = await channel.sendToQueue(queue, Buffer.from(JSON.stringify(gpsData)));
    console.log(`Message sent to queue ${queue}`);
    console.log(messageToQueueRes)

    // close channel and connection after the data is
    if (channel && messageToQueueRes){
        return true;
    } else {
        return false;
    }

  } catch (err) {
    console.error(`Error -> ${err}`);
    return false;
  }
}

app.get("/", (req, res) => res.send("Welcome to GPS G2"));
app.post("/api/gpsdata", async function (req, res) {
  const gpsData = {
    id: req.body.id,
    time: req.body.time,
    lat: req.body.lat,
    lon: req.body.lon,
  };
  console.log(gpsData);
  

  // push the data unto the queue of the rabbitmq server
  // connection to rabbbitmq + production into the queue
  const queueRes = await sendGPSDataToQueue(gpsData);

  if (queueRes) {
    res.send({"Message": "Request Successful!" , "data" : gpsData});
  } else {
    res.send({ "Message": "Request Failed! Try Again!" });
  }

});

app.listen(3000, () => {
  console.log("My REST API running on port 3000");
});

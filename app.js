var createError = require('http-errors');
var express = require('express');
const request=require('request')
const body_parser=require('body-parser')
const axios = require('axios')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


const token = "EAAIYr2ZBJEW8BANdD5gZAITTUHzcNarmTSJ2uaTBcrY7cv8U38dEuGt2UAgHLYLgT21eRjTMrFcYAKy6V9scZBfqo6yVl4iZAujLzZA5E6IFtHdGxhlrpnkKZAV4xB2IgDXzj4Ld3TdCRnj4Q4Qw7rM1ZBT6daYueCWHq4Bk5qMiG28mZAf4Rh4zk2FP2Ut8zNbaLzGdsluIEAZDZD";


var app = express();
app = express().use(body_parser.json())
// app.listen(5000,()=>console.log('app started.........'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);

app.post('/',async(req, res) => {
    // Parse the request body from the POST
    let body = req.body;
  
    // Check the Incoming webhook message
    console.log(JSON.stringify(req.body, null, 2));
  
    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
    if (req.body.object) {
      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0] &&
        req.body.entry[0].changes[0].value.messages &&
        req.body.entry[0].changes[0].value.messages[0]
      ) {
        let phone_number_id =req.body.entry[0].changes[0].value.metadata.phone_number_id;
        let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
        let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
  
        // let profile = 
        let profile = req.body.entry[0].changes[0].value.contacts[0].profile.name
        console.log(profile,'check profile..........')
      if(msg_body.toLowerCase()=="hello" || msg_body.toLowerCase()=="hi"){
        resMessage=`Hello ${profile}, How Can I Help You`
      }else if(msg_body.toLowerCase()=="how are you"){
        resMessage="I'm Fine"
      }else if(msg_body.toLowerCase()=="your contact"){
        resMessage="Here Is My Contact Number 7731053649"
      }
      console.log(resMessage,'check res message.........')
      let response = await   axios({
          method: "POST", // Required, HTTP method, a string, e.g. POST, GET
          url:
            "https://graph.facebook.com/v12.0/" +
            phone_number_id +
            "/messages?access_token=" +
            token,
          data: {
            messaging_product: "whatsapp",
            to: from,
            text: { body: "Ack: " + resMessage },
          },
          headers: { "Content-Type": "application/json" },
        })
      }
      res.sendStatus(200);
    } else {
      // Return a '404 Not Found' if event is not from a WhatsApp API
      res.sendStatus(404);
    }
  })




app.get('/',(req,res)=>{
    const verify_token = "whatsappToken";
  console.log("api is working..........")
    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];
  
    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && token === verify_token) {
        // Respond with 200 OK and challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }else{
        res.send('no mode   available here...')
    }
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

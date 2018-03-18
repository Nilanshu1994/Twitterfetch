var mysql = require('mysql'),
    crypt = require('./models/crypt.js')



var con = mysql.createPool({
          host: "localhost",
          user: "nilu",
          password: "12345",
          database: "twitter"
          });


// Add twitter Key and token in this object
var client = {
 	consumer_key: '',
    consumer_secret: '',
    access_token: '',
    access_token_secret: ''
 };

 var encclient = {
 	encconsumer_key: crypt.encrypt(client.consumer_key),
    encconsumer_secret: crypt.encrypt(client.consumer_secret),
    encaccess_token: crypt.encrypt(client.access_token),
    encaccess_token_secret: crypt.encrypt(client.access_token_secret)
 }


con.getConnection(function(err,connection){
 	var sql = `insert into tokens(consumer_key,consumer_secret,access_token,access_token_secret)
 	values("${encclient.encconsumer_key}","${encclient.encconsumer_secret}","${encclient.encaccess_token}","${encclient.encaccess_token_secret}")`;
     connection.query(sql, function (err, result) {
     if (err) console.log(err);
     else {
 	       console.log("done");
         process.exit();
          }
     }); 
     connection.release();
     }); 



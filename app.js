var express = require("express"),
    app     = express(),
    bodyparser = require("body-parser"),
    ejs = require("ejs"),
    fs = require('fs'),
    crypt = require('./models/crypt.js'),
    twit  = require("twit"),
    mysql = require('mysql'),
    expresssession = require("express-session"),
    socket = require('socket.io')


app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));  
app.use(bodyparser.urlencoded({extended: true}));
app.use(expresssession({
  secret: "world is not enough",
  resave: false,
  saveUninitialized: false
}))

var con = mysql.createPool({
          host: "localhost",
          user: "nilu",
          password: "12345",
          database: "twitter"
          });

function checkSignIn(req, res,next){
   if(req.session.user){
      next();     //If session exists, proceed to page
   } else {
      res.redirect("/")
   }
}

var client = {
 	consumer_key: '',
    consumer_secret: '',
    access_token: '',
    access_token_secret: '',
    timeout_ms: 60*1000,
 };

var twitterfunc = () =>{
 var twitter = new twit(client);
 var stream = twitter.stream("statuses/filter",{track: "technology"});
 	stream.on('tweet',(file) =>{
        io.emit('tweets',file.text);
 	});

 	stream.on('error', function(error) {
    console.log("error");
    });
}

con.getConnection(function(err,connection){
 	var sql = "select * from tokens";
     connection.query(sql, function (err, result) {
     if (err) console.log(err);
     else {
 	       client.consumer_key = crypt.decrypt(result[0].consumer_key);
           client.consumer_secret = crypt.decrypt(result[0].consumer_secret);
           client.access_token = crypt.decrypt(result[0].access_token);
           client.access_token_secret = crypt.decrypt(result[0].access_token_secret)
           twitterfunc();
          }
     }); 
     connection.release();
     }); 



// Initialize server
var server = app.listen(3000,()=>{
   console.log("The Server Has Started!");
}); 

//-----------------------------------------------------------------------
//           Socket.io
//-----------------------------------------------------------------------

var io =socket(server);
io.on('connection',(socket)=>{
	console.log("socket connected");
	socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});




//------------------------------------------------------------------------------
//                   Api's
//------------------------------------------------------------------------------

app.get("/", function(req,res){
 	res.render("login");
 });

 app.post("/login", function(req,res){
 	var enctext = crypt.encrypt(req.body.password);
 	con.getConnection(function(err,connection){
 	var sql = `select * from user where userid="${req.body.userid}"`;
     connection.query(sql, function (err, result) {
     if (err) console.log(err);
     else {
     	  if(result[0].password == enctext){
     	  	req.session.user = {
     	  		user : result[0].userid,
                password : result[0].password
     	  	};
     	  	res.redirect("/home");
     	  }
     	  else{
     	  	res.redirect("/");
     	  }    
    }
     }); 
     connection.release();
     }); 
 });

 app.post("/signup", function(req,res){
 	var enctext = crypt.encrypt(req.body.pass);
 	con.getConnection(function(err,connection){
 	var sql = `insert into user(userid,password)values("${req.body.user}","${enctext}")`;
     connection.query(sql, function (err, result) {
     if (err) console.log(err);
     else {
     	  	req.session.user = {
     	  		user : req.body.user,
                password : enctext
     	  	};
     	  	res.redirect("/home");
     	  }
     }); 
     connection.release();
     }); 
 });

 app.get("/home", checkSignIn, function(req,res){
 	res.render("index");
 });

app.get('/favicon.ico', function(req, res) {
    res.sendStatus(204);
});

 	

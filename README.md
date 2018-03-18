This is a web app to fetch realtime data from twitter

Database setup :
 1. Create two tables user and tokens
 2. Add fields userid and password in user table
 3. Add twitter consumer an tokens fields required from twitter in tokens table

 Node Setup :

 1. clone the repository
 2. run npm install command to install all dependencies
 3. open clientdata.js file and add keys and tokeng from twitter
 4. first time to encrypt and store twitter tokens and key in database run node clientdata.js
 5. now run node app.js and server will start
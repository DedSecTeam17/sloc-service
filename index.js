const restify = require('restify');
const express = require('express');
require('dotenv').config()

const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const server = restify.createServer();
server.use(restify.plugins.bodyParser());




//application routes
const map_route = require('./routes/main');


app.use('/api', map_route)
// Handle production
// Static folder
app.use(express.static(__dirname + '/dist/'));

// Handle SPA
app.get(/.*/, (req, res) => res.sendFile(__dirname + '/dist/index.html'));

//listen to server event
app.listen(process.env.PORT || 5000, () => {
    console.log("server start at port 5000");


});


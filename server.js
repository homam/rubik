<<<<<<< HEAD
﻿/// <reference path="views/public/scripts/libs/_.js" />

var express = require('express');
if(typeof (_) == "undefined")
    var _ = require('./views/public/scripts/libs/_.js');

var port = process.env.PORT || parseInt(process.argv.pop());

var app = express.createServer();

app.configure(function () {
    app.use(express.bodyParser());
    app.use(app.router);
=======
var express = require('express');
var gameRep = require('./game.js');

var port = 80;//parseInt(process.argv.pop());

var app = express.createServer();
gameRep.configure(require('socket.io').listen(app));//port + 1, "127.0.0.1"));


app.configure(function () {
    app.use(express.bodyParser());
    app.use(app.router);
>>>>>>> f1e0c7900c93faed3e456df3b446238219f6f181
    app.use('/public', express.static(__dirname + '/views/public'));
});

app.set('view engine', 'html');
app.register('.html', require('jqtpl').express);

<<<<<<< HEAD
app.get('/', function (req, res) {
    res.render('index', {
        layout: false,
        release: "1" == req.query.release,
        isMobile: (function () {
            var mobileUAs = ['iphone', 'android', 'blackberry'];
            var ua = req.headers['user-agent'];
            if (!!ua) {
                ua = ua.toLowerCase();
                return _.any(mobileUAs, function (m) { return  ua.indexOf(m) > -1; });
            }
            return false;
        })()
=======
app.get('/', function(req, res) {
    res.render('canvas', {
        layout:false
>>>>>>> f1e0c7900c93faed3e456df3b446238219f6f181
    });
});
app.get('/homam', function (req, res) {
    res.end('hhahah!');
});


// how to read a file: fs.readFile('socket.client.js', 'utf-8', function (a, d) { res.end(d); })

app.listen(port);;


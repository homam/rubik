/// <reference path="views/public/scripts/libs/_.js" />

var express = require('express');
if(typeof (_) == "undefined")
    var _ = require('./views/public/scripts/libs/_.js');

var port = process.env.PORT || parseInt(process.argv.pop());

var app = express()

app.configure(function () {
    app.use(express.bodyParser());
    app.use(app.router);
    app.use('/public', express.static(__dirname + '/views/public'));
});

app.set('view engine', 'html');
app.register('.html', require('jqtpl').express);

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
    });
});
app.get('/homam', function (req, res) {
    res.end('hhahah!');
});


// how to read a file: fs.readFile('socket.client.js', 'utf-8', function (a, d) { res.end(d); })

app.listen(port);


var express = require('express');
var bodyParser = require('body-parser');
var winston = require('winston'); // for transports.Console
var path = require('path');
var fs = require('fs');
var app = module.exports = express();

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Add CORS headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Create a new winston logger instance with two tranports: Console, and File
var filename = path.join(__dirname, new Date().toISOString() + '.json');
var loggers = {};
var loggerForUser = function(uid) {
    if (!(uid in loggers)) {
        loggers[uid] = new (winston.Logger)({
          transports: [
            //new (winston.transports.Console)(),
            new (winston.transports.File)({ filename: path.join(__dirname, 'userlogs', uid + '.json'), json:true })
          ]
        });
        console.log('Created logfile for user ' + uid + '.');
    }
    return loggers[uid];
};

// Let's make our express `Router` first.
var router = express.Router();
router.get('/error', function(req, res, next) {
  // here we cause an error in the pipeline so we see express-winston in action.
  return next(new Error("This is an error and it should be logged to the console"));
});

router.get('/', function(req, res, next) {
  res.write('This is a normal request, it should be logged to the console too');
  res.end();
});

router.post('/', function(req, res) {
  res.write('RECEIVED');

  if (req.body.length > 1 && req.body[1].user_id) {
      var user = req.body[1].user_id;
      var logger = loggerForUser(user);
      logger.info(req.body);
  }

  res.end();
});

// Now we can tell the app to use our routing code:
app.use(router);

app.listen(3333, function(){
  console.log("mindata logger listening on port %d in %s mode", this.address().port, app.settings.env);
});

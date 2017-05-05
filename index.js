/**
 * @author swamy Kurakula
 */
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.engine('html', require('hogan-express'));
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use('/scim/v2', require('./controllers'));

var server = app.listen(3000, function() {
  console.log('App running on url at http://localhost:3000');
});

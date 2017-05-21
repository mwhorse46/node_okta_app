/**
 * @author swamy Kurakula
 */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const auth = require('./auth');
const path = require('path');
const session = require('express-session');

app.use(bodyParser.json({
    type: 'application/scim+json'
}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: "saml text okta app",
    resave: true,
    saveUninitialized: true
}));
app.use(auth.initialize());
app.use(auth.session());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.engine('html', require('hogan-express'));
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

/*app.get('/', function(req, res) {
    res.status(200).json({
        'ack': 'success',
        'message': 'This is home page..!'
    });
});*/

app.use('/scim/v2', require('./controllers'));

//Get Methods
app.get('/', auth.protected, function(req, res) {
    res.sendFile(`${__dirname}/index.html`);
});

app.get('/home', auth.protected, function(req, res) {
    res.sendFile(`${__dirname}/index.html`);
});

//auth.authenticate check if you are logged in
app.get('/login', auth.authenticate('saml', {
    failureRedirect: '/',
    failureFlash: true
}), function(req, res) {
    res.redirect('/');
});

//POST Methods, redirect to home successful login
app.post('/login', auth.authenticate('saml', {
    failureRedirect: '/',
    failureFlash: true
}), function(req, res) {
    res.redirect('/home');
});

//code for importing static files
app.use(express.static(path.join(__dirname, 'public')));

function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
};

const port = normalizePort(process.env.PORT || '8080');

const server = app.listen(port, function() {
    console.log(`App running on url at http://localhost:${port}`);
});

/*var options = {
    swaggerDefinition: {
        info: {
            title: 'SCIM 2.0 Server API',
            version: '1.0.0',
        },
    },
    apis: ['./controllers/index.js']
};

var swaggerJSDoc = require('swagger-jsdoc');
var swaggerSpec = swaggerJSDoc(options);
console.log(swaggerSpec);

app.get('/api-docs.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(swaggerSpec, null, 2));
}); */

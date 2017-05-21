const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const config = require('./config.json')[process.env.NODE_ENV || 'custom'];

//users array to hold
const users = [];

function findByEmail(email, fn) {
    for (let i = 0, len = users.length; i < len; i++) {
        const user = users[i];
        if (user.nameID === email) return fn(null, user);
    }
    return fn(null, null);
}

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
    done(null, user.nameID);
});

passport.deserializeUser(function(id, done) {
    findByEmail(id, function(err, user) {
        done(err, user);
    });
});


passport.use(new SamlStrategy({
        issuer: config.auth.issuer,
        path: '/login/callback',
        entryPoint: config.auth.entryPoint,
        cert: config.auth.cert
    },
    function(profile, done) {
        if (!profile.nameID) {
            return done(new Error("No email found"), null);
        }
        process.nextTick(function() {
            findByEmail(profile.nameID, function(err, user) {
                if (err) {
                    console.log('Error');
                    return done(err);
                }
                if (!user) {
                    users.push(profile);
                    return done(null, profile);
                }
                console.log('Ending Method for profiling');
                return done(null, user);
            })
        });
    }
));

passport.protected = function protected(req, res, next) {
    console.log('Login Profile' + req.isAuthenticated());
    if (req.isAuthenticated()) {
        return next();
    }
    console.log('login please' + req.isAuthenticated());
    res.redirect('/login');
};

exports = module.exports = passport;

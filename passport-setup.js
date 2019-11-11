var LocalStrategy = require('passport-local').Strategy;

//User-Modell laden
var User = require('../models/user.js');

module.exports = function(passport) {

    passport.serializeUser(function(user, callback) {
        callback(null, user.id);
    });

    passport.deserializeUser(function(id, callback) {
        User.findOne({
            '_id': id
        }, function(err, user) {
            callback(err, user);
        });
    });

    //Unterscheidung zwischen Anmeldung und Login
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, callback) {
            process.nextTick(function() {
                User.findOne({
                    'credentials.email': email
                }, function(err, user) {
                    if (err) return callback(err);

                    if (user) {
                        return callback(null, null, {
                            'error': 'This email was already registered.',
                            'email': req.body.email
                        });
                    } else {
                        var newUser = new User();
                        //Legt die lokalen Anmeldeinformationen des Benutzers fest.
                        newUser.credentials.email = email;
                        newUser.credentials.password = newUser.generateHash(password);

                        newUser.data.name = req.body.name;
                        newUser.data.age = req.body.age;
                        newUser.data.room_number = req.body.room_number;

                        newUser.save(function(err) {
                            if (err) throw err;
                            return callback(null, newUser, {
                                'success': 'Your signup was successful. Please login now to complete your registration.',
                            });
                        });
                    }
                });
            });
        }));

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, callback) {
            User.findOne({
                'credentials.email': email
            }, function(err, user) {
                if (err) return callback(err);

                //Checkt ob User vorhanden ist
                if (!user) {
                    return callback(null, null, {
                        'error': 'This email is not registered.',
                        'email': req.body.email
                    });
                }
                //Checkt ob Passwort übereinstimmt
                if (!user.validPassword(password)) {
                    return callback(null, null, {
                        'error': 'The email and password combination did not match.',
                        'email': req.body.email
                    });
                }

                //Cookie existiert nur während User
                if (!req.body.remember) {
                    req.session.cookie.maxAge = 1 * 60 * 60 * 1000;
                } else {
                    req.session.cookie.maxAge = 4 * 7 * 24 * 60 * 60 * 1000; //Remember me verfällt nach 4 Wochen wenn User sich nicht mehr einloggt
                }

                return callback(null, user, {
                    'success': 'Your login was successful.',
                });
            });
        }));
};

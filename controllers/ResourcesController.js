/**
 * ResourcesController
 * @author Swamy Kurakula
 *
 */

const appDir = require('path').dirname(require.main.filename);
const uuidV1 = require('uuid/v1');

/**
 * API to create user
 *
 * @method createUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var createUser = function(req, res) {
    var reqBody = {
            'userName': '',
            'active': false,
            'name': {
                'givenName': '',
                'middleName': '',
                'familyName': ''
            }
        },
        self = {};

    ['userName', 'active'].forEach(a => {
        self[a] = req.body[a]
    });
    ['familyName', 'givenName', 'middleName'].forEach(a => {
        self[a] = req.body['name'][a]
    });

    self.id = uuidV1();

    var response = {
        'schemas': ['urn:ietf:params:scim:schemas:core:2.0:User'],
        'id': self.id,
        'userName': self.userName,
        'name': {
            'familyName': self.familyName,
            'givenName': self.givenName,
            'middleName': self.middleName,
        },
        'active': self.active,
        'meta': {
            'resourceType': 'User',
            'location': `https://${req.hostname}:3000/scim/v2/Users/${self.id}`
        }
    };

    res.status(201).json(response);
};

/**
 * API to get list of Users
 *
 * @method getUsers.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var getUsers = function(req, res) {

};

/**
 * API to get user details by user_id
 *
 * @method getUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var getUser = function(req, res) {

};

/**
 * API to update user
 *
 * @method updateUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var updateUser = function(req, res) {

};

/**
 * API to deprovision or deactivate user
 *
 * @method deprovisionUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var deprovisionUser = function(req, res) {

};

/**
 *
 *  Exporting ResourcesController module
 *
 */
module.exports = {
    "createUser": createUser,
    "getUsers": getUsers,
    "getUser": getUser,
    "updateUser": updateUser,
    "deprovisionUser": deprovisionUser
}

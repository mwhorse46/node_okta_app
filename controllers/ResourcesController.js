/**
 * ResourcesController
 * @author Swamy Kurakula
 *
 */

var appDir = require('path').dirname(require.main.filename);

/**
 * API to create user
 *
 * @method createUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var createUser = function(req, res) {
  
};

/**
 *
 *  Exporting ResourcesController module
 *
 */
module.exports = {
    "createUser": createUser
}

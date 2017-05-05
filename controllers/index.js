/**
 * @author swamy kurakula
 */

var express = require('express'),
    router = express.Router()
    ResourcesController = require('./ResourcesController');

/**
 * @swagger
 * /scim/v2/Users:
 *   post:
 *     description: Create User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         description: Username to use for login.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: createUser
 */
router.post('/Users', ResourcesController.createUser);

module.exports = router;

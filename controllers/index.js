/**
 * @author swamy kurakula
 */

const express = require('express');
const router = express.Router();
const ResourcesController = require('./ResourcesController');


router.get('/', function(req, res) {
    res.send('SCIM');
});
/**
 * @swagger
 * /scim/v2/Users:
 *   post:
 *     description: Create User
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: createUser
 */
router.post('/Users', ResourcesController.createUser);

/**
 * @swagger
 * /scim/v2/Users:
 *   get:
 *     description: retrieve users
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: getUsers
 */
router.get('/Users', ResourcesController.getUsers);

/**
 * @swagger
 * /scim/v2/Users/{user_id}:
 *   get:
 *     description: fetching of users by user id
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: fetching user details by id
 */
router.get('/Users/:user_id', ResourcesController.getUser);

/**
 * @swagger
 * /scim/v2/Users/{user_id}:
 *   put:
 *     description: updating user by user id
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: updating user by user id
 */
router.put('/Users/:user_id', ResourcesController.updateUser);

/**
 * @swagger
 * /scim/v2/Users/{user_id}:
 *   patch:
 *     description: Deprovisioning users by user_id
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: Deprovisioning users by user_id
 */
router.patch('/Users/:user_id', ResourcesController.deprovisionUser);


/**
 * @swagger
 * /scim/v2/Groups:
 *   post:
 *     description: Creates a new Group with given attributes
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description:
 */
router.post('/Groups', ResourcesController.createGroup);

/**
 * @swagger
 * /scim/v2/Groups:
 *   get:
 *     description: Retrieve Groups
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description:
 */
router.get('/Groups', ResourcesController.getGroups);

/**
 * @swagger
 * /scim/v2/Groups/{group_id}:
 *   get:
 *     description: Retrieve a new Group
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description:
 */
router.get('/Groups/:group_id', ResourcesController.getGroup);

/**
 * @swagger
 * /scim/v2/Groups/{group_id}:
 *   put:
 *     description: Update Group membership
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description:
 */
router.put('/Groups/:group_id', ResourcesController.updateGroup);

/**
 * @swagger
 * /scim/v2/Groups/{group_id}:
 *   delete:
 *     description: Delete a Group
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: group_id
 *         description:
 *         in: path
 *         required: true
 *          type: string
 *     responses:
 *       204:
 *         description:
 *       404:
 *         description: Group {group_id} Not Found
 *       400:
 *         description:
 */
router.delete('/Groups/:group_id', ResourcesController.deleteGroup);

module.exports = router;

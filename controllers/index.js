/**
 * @author swamy kurakula
 */

var express = require('express'),
    router = express.Router()
    ResourcesController = require('./ResourcesController');


router.get('/', function(req, res){
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
 *  Creates a new Group with given attributes
 */
 router.post('/Groups',  ResourcesController.createGroup);

 /**
  *  Retrieve Groups
  */
 router.get('/Groups',  ResourcesController.getGroups);

 /**
  *  Retrieve a new Group
  */
 router.get('/Groups/:group_id',  ResourcesController.getGroup);

 /**
  *  Update Group membership
  */
 router.put('/Groups/:group_id',  ResourcesController.updateGroup);

 /**
  *  Delete a Group
  */
 router.delete('/Groups/:group_id',  ResourcesController.deleteGroup);

module.exports = router;

/**
 * ResourcesController
 * @author Swamy Kurakula
 *
 */

const appDir = require('path').dirname(require.main.filename);
const fileUtil = require(`${appDir}/utils/fileUtil`);
const uuidV1 = require('uuid/v1');
const url = require('url');
const user = require(`${appDir}/models/User`);
const ulist = require(`${appDir}/models/UserListResponse`);
const group = require(`${appDir}/models/Group`);
const glist = require(`${appDir}/models/GroupListResponse`);
const error = require(`${appDir}/models/SCIMError`);
const has = Object.prototype.hasOwnProperty;

/**
 * API to create user
 *
 * @method createUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
let createUser = function(req, res) {
    const self = {};
    const reqBody = req.body;

    ['userName', 'active', 'displayName', 'emails', 'name'].forEach(a => {
        if (a == 'name' && reqBody[a]) {
            ['familyName', 'givenName', 'middleName'].forEach(na => {
                self[na] = reqBody[a][na];
            });
        } else {
            self[a] = reqBody[a];
        }
    });

    self.userId = uuidV1();
    self.req_url = req.url;

    const response = user.GetSCIMUserResource(self);

    fileUtil.readFile(function(data) {
        let userFound = false;
        for (let i = 0; i < data.users.length; i++) {
            const eu = data.users[i];
            if (eu.userName == response.userName) {
                userFound = true;
                break;
            }
        }
        if (!userFound) {
            data.users.push(response);
            fileUtil.writeFile(data, function(err) {
                if (err) {
                    const scim_error = error.SCIMError(err, "400");
                    return res.status(400).json(scim_error);
                }
                res.status(201).json(response);
            });
        } else {
            const scim_error = error.SCIMError("Conflict - Resource Already Exists", "409");
            res.status(409).json(scim_error);
        }
    });
};

/**
 * API to get list of Users
 *
 * @method getUsers.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
let getUsers = function(req, res) {
    const startIndex = req.query["startIndex"] || 0;
    let count = req.query["count"] || 0;
    const filter = req.query["filter"] || '';
    let queryAtrribute = "";
    let queryValue = "";

    if (filter) {
        queryAtrribute = String(filter.split("eq")[0]).trim();
        queryValue = (String(filter.split("eq")[1]).trim()).replace(/["]+/g, '');
    }

    fileUtil.readFile(function(data) {
        if (!data.users) data.users = [];

        let rows = [];
        if (queryAtrribute && queryValue) {
            for (let i = 0; i < data.users.length; i++) {
                const user = data.users[i];
                if (user[queryAtrribute] == queryValue) rows.push(user);

                if (!rows.length && user[queryAtrribute] && (user[queryAtrribute]).toUpperCase() == queryValue.toUpperCase()) {
                    const scim_error = error.SCIMError("Username is case sensitive", "400");
                    return res.status(400).json(scim_error);
                }
            }
        } else {
            rows = [...data.users];
        }

        // If requested no. of users is less than all users
        if (rows.length < count) {
            count = rows.length
        }

        const scimResource = ulist.GetSCIMList(rows, startIndex, count, req.url);
        res.status(200).json(scimResource);
    });

    /*
      if (req.query.attributes) {
          var customizedUsers = [];
          for (var i = 0; i < data.users.length; i++) {
              const cu = {};
              cu.id = data.users[i].id;
              cu[req.query.attributes] = data.users[i][req.query.attributes];
              customizedUsers.push(cu);
          }
          rv["Resources"] = customizedUsers;
      }*/

};

/**
 * API to get user details by user_id
 *
 * @method getUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
let getUser = function(req, res) {
    let userId = req.params.user_id;

    fileUtil.readFile(function(data) {
        let foundIndex = -1;

        for (let i = 0; i < data.users.length; i++) {
            if (data.users[i].id == userId) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex !== -1) {
            /*const scimUserResource = user.GetSCIMUserResource({userId, active: u.active, userName: u.userName,
                givenName: u.givenName, middleName: u.middleName, familyName: u.familyName, location: u.meta.location}); */
            res.status(200).json(data.users[foundIndex]);
        } else {
            const scim_error = error.SCIMError("User Not Found", "404");
            res.status(404).json(scim_error);
        }
    });
};

/**
 * API to update user
 *
 * @method updateUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
let updateUser = function(req, res) {
    let userId = req.params.user_id;
    let reqBody = req.body;

    fileUtil.readFile(function(data) {
        let foundIndex = -1;

        for (var i = 0; i < data.users.length; i++) {
            if (data.users[i].id === userId) {
                Object.keys(reqBody).forEach(k => {
                    foundIndex = i;
                    data.users[i][k] = reqBody[k];
                });
                break;
            }
        }

        if (foundIndex !== -1) {
            fileUtil.writeFile(data, function(err) {
                if (err) {
                    const scim_error = error.SCIMError(String(err), "400");
                    return res.status(400).json(scim_error);
                }
                res.status(200).json(data.users[foundIndex]);
            });
        } else {
            const scim_error = error.SCIMError("User Not Found", "404");
            res.status(404).json(scim_error);
        }
    });
};

/**
 * API to deprovision or deactivate user
 *
 * @method deprovisionUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
let deprovisionUser = function(req, res) {
    let patchResource = req.body;
    let attributes = ['schemas', 'Operations'];
    let schema_patchop = 'urn:ietf:params:scim:api:messages:2.0:PatchOp';

    for (let i = 0; i < attributes.length; i++) {
        if (!has.call(patchResource, attributes[i])) {
            const scim_error = error.SCIMError(`Payload must contain '${attributes[i]}' attribute.`, "400");
            return res.status(400).json(scim_error);
        }
    }

    for (let i = 0; i < (patchResource['schemas']).length; i++) {
        if (patchResource['schemas'][i] != schema_patchop) {
            const scim_error = error.SCIMError("The 'schemas' type in this request is not supported.", "501");
            return res.status(501).json(scim_error);
        }
    }

    fileUtil.readFile(function(data) {
        var foundIndex = -1;
        for (let i = 0; i < data.users.length; i++) {
            if (data.users[i]['id'] == req.params.user_id) {
                foundIndex = i;
                break;
            }
        }

        for (let i = 0; i < (patchResource['Operations']).length; i++) {
            const operation = patchResource['Operations'][i];
            if (has.call(operation, 'op') && operation['op'] != 'replace')
                continue;

            Object.keys(operation['value']).forEach(k => {
                data.users[foundIndex][k] = operation['value'][k];
            });
        }

        fileUtil.writeFile(data, function(err) {
            res.status(200).json(data.users[foundIndex]);
        });
    });
};


/**
 *  Groups
 */

let createGroup = function(req, res) {
    let self = {};
    let reqBody = req.body;

    ['members', 'displayName'].forEach(a => {
        self[a] = reqBody[a];
    });

    self.groupId = uuidV1();
    self.req_url = req.url;

    var response = group.GetSCIMGroupResource(self);

    fileUtil.readFile(function(data) {
        if (!data.groups) data.groups = [];

        let groupFound = false;
        for (let i = 0; i < data.groups.length; i++) {
            const eu = data.groups[i];
            if (eu.displayName == response.displayName) {
                groupFound = true;
                break;
            }
        }
        if (!groupFound) {
            data.groups.push(response);
            fileUtil.writeFile(data, function(err) {
                if (err) {
                    const scim_error = error.SCIMError(err, "400");
                    return res.status(400).json(scim_error);
                }
                res.status(201).json(response);
            });
        } else {
            const scim_error = error.SCIMError("Conflict - Resource Already Exists", "409");
            res.status(409).json(scim_error);
        }
    });

};

let getGroup = function(req, res) {
    let groupId = req.params.group_id;
    let startIndex = req.query["startIndex"] || 0;
    let count = req.query["count"] || 0;

    fileUtil.readFile(function(data) {
        if (!data.groups) data.groups = [];
        let groupIndex = -1;

        for (let i = 0; i < data.groups.length; i++) {
            if (data.groups[i].id === groupId) {
                groupIndex = i;
                break;
            }
        }

        if (groupIndex !== -1) {
            /*groupIndex = data.groups[u];
            const scimGroupResource = group.GetSCIMGroupResource({groupId, members, displayName, req.url}); */
            res.status(200).json(data.groups[groupIndex]);
        } else {
            const scim_error = error.SCIMError("Group Not Found", "404");
            res.status(404).json(scim_error);
        }
    });
}

let getGroups = function(req, res) {
    let startIndex = req.query["startIndex"] || 0;
    let count = req.query["count"] || 0;
    let req_url = (url.parse(req.url, true)).pathname;

    fileUtil.readFile(function(data) {
        if (!data.groups) data.groups = [];

        if (data.groups.length < count) count = rows.length;
        var scimResource = glist.GetSCIMList(data.groups, startIndex, count, req_url);
        res.status(200).json(scimResource);
    });

}

let updateGroup = function(req, res) {
    let groupId = req.params.group_id;
    let reqBody = req.body;

    fileUtil.readFile(function(data) {
        if (!data.groups) data.groups = [];
        let groupIndex = -1;

        for (let i = 0; i < data.groups.length; i++) {
            if (data.groups[i].id === groupId) {
                groupIndex = i;
                data.groups[i]["displayName"] = reqBody["displayName"];
                data.groups[i]["members"] = reqBody["members"];
                break;
            }
        }

        if (groupIndex !== -1) {
            /*groupIndex = data.groups[u];
            const scimGroupResource = group.GetSCIMGroupResource({groupId, members, displayName, req.url}); */
            fileUtil.writeFile(data, function(err) {
                if (err) {
                    const scim_error = error.SCIMError(err, "400");
                    return res.status(400).json(scim_error);
                }
                res.status(200).json(data.groups[groupIndex]);
            });
        } else {
            const scim_error = error.SCIMError("Group Not Found", "404");
            res.status(404).json(scim_error);
        }
    });
}

let deleteGroup = function(req, res) {
    let groupId = req.params.group_id;

    fileUtil.readFile(function(data) {
        if (!data.groups) data.groups = [];
        let groupFound = false;

        for (let i = 0; i < data.groups.length; i++) {
            if (data.groups[i].id === groupId) {
                groupFound = true;
                data.groups.splice(i, 1);
                break;
            }
        }

        if (groupFound) {
            fileUtil.writeFile(data, function(err) {
                if (err) {
                    const scim_error = error.SCIMError(err, "400");
                    return res.status(400).json(scim_error);
                }
                res.status(204).end();
            });
        } else {
            const scim_error = error.SCIMError(`Group ${groupId} Not Found`, "404");
            res.status(404).json(scim_error);
        }
    });
}


let getSchemas = function(req, res) {
    let startIndex = req.query["startIndex"] || 0;
    let count = req.query["count"] || 0;

    const scim_error = error.SCIMError("Not Implemented", "501");
    return res.status(501).json(scim_error);
}

let getServiceProviderCfg = function(req, res) {
    const scim_error = error.SCIMError("Not Implemented", "501");
    return res.status(501).json(scim_error);
}

/**
 *
 *  Exporting ResourcesController module
 *
 */
module.exports = {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deprovisionUser,
    createGroup,
    getGroup,
    updateGroup,
    deleteGroup,
    getGroups,
    getSchemas,
    getServiceProviderCfg
};

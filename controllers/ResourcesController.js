/**
 * ResourcesController
 * @author Swamy Kurakula
 *
 */

const appDir = require('path').dirname(require.main.filename);
const fileUtil = require(`${appDir}/utils/fileUtil`);
const uuidV1 = require('uuid/v1');
const url = require('url');

function GetSCIMUserResource(userResource) {

    let scim_user = {
        "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
        "id": null,
        "userName": null,
        "name": {
            "givenName": null,
            "middleName": null,
            "familyName": null,
        },
        "active": false,
        "emails": [],
        "displayName": null,
        "meta": {
            "resourceType": "User",
            "location": null,
        }
    };

    scim_user["meta"]["location"] = userResource.req_url;
    scim_user["id"] = userResource.userId;
    scim_user["active"] = userResource.active;
    scim_user["userName"] = userResource.userName;
    scim_user["displayName"] = userResource.displayName;
    scim_user["name"]["givenName"] = userResource.givenName;
    scim_user["name"]["middleName"] = userResource.middleName;
    scim_user["name"]["familyName"] = userResource.familyName;
    scim_user["emails"] = userResource.emails;

    return scim_user;

}

function SCIMError(errorMessage, statusCode) {
    var scim_error = {
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:Error"],
        "detail": null,
        "status": null
    }

    scim_error["detail"] = errorMessage;
    scim_error["status"] = statusCode;

    return scim_error;
}

/**
 * API to create user
 *
 * @method createUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var createUser = function(req, res) {
    //console.log('req.get(Content-Type)');
    //console.log(req.get('Content-Type'));
    //console.log('req.body');
    //console.log(req.body);
    let url_parts = url.parse(req.url, true);
    let req_url = url_parts.pathname;
    let self = {};
    let reqBody = JSON.parse(JSON.stringify(req.body));

    ['userName', 'active', 'displayName', 'emails'].forEach(a => {
        self[a] = reqBody[a];
    });

    ['familyName', 'givenName', 'middleName'].forEach(a => {
        self[a] = reqBody['name'][a];
    });

    self.userId = uuidV1();
    self.req_url = req_url;

    var response = GetSCIMUserResource(self);

    fileUtil.readFile('default.json', function(data) {
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
            fileUtil.writeFile('' /* filename optional (default.json will be considered as file name)*/ , data, function(err) {
                if (err) {
                    const scim_error = SCIMError(err, "400");
                    return res.staus(400).json(scim_error);
                }
                res.status(201).json(response);
            });
        } else {
            const scim_error = SCIMError("Conflict - Resource Already Exists", "409");
            res.status(409).json(scim_error);
        }
    });
};

function GetSCIMList(rows, startIndex, count, req_url) {
    const scim_resource = {
        "Resources": [],
        "itemsPerPage": 0,
        "schemas": [
            "urn:ietf:params:scim:api:messages:2.0:ListResponse"
        ],
        "startIndex": 0,
        "totalResults": 0
    }

    const resources = [];
    let location = ""
    if (startIndex) {
        for (let i = (startIndex - 1); i < count; i++) {
            location = req_url + "/" + rows[i]["id"];
            let userResource = GetSCIMUserResource({
                "userId": rows[i]["id"],
                "active": rows[i]["active"],
                "userName": rows[i]["userName"],
                "displayName": rows[i]["displayName"],
                "givenName": rows[i]["name"]["givenName"],
                "middleName": rows[i]["name"]["middleName"],
                "familyName": rows[i]["name"]["familyName"],
                "emails": rows[i]["emails"],
                "req_url": location
            });
            resources.push(userResource);
            location = "";
        }
    }

    scim_resource["Resources"] = resources;
    scim_resource["startIndex"] = startIndex;
    scim_resource["itemsPerPage"] = count;
    scim_resource["totalResults"] = count;

    return scim_resource;
}

/**
 * API to get list of Users
 *
 * @method getUsers.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var getUsers = function(req, res) {
    let url_parts = url.parse(req.url, true);
    let query = req.query;
    let startIndex = query["startIndex"] || 0;
    let count = query["count"] || 0;
    let filter = query["filter"];
    let req_url = url_parts.pathname;
    let queryAtrribute = "";
    let queryValue = "";

    if (filter != undefined) {
        queryAtrribute = String(filter.split("eq")[0]).trim();
        queryValue = String(filter.split("eq")[1]).trim();
    }

    fileUtil.readFile('default.json', function(data) {
        if (data && data.users.length) {
            let rows = [];
            for (let i = 0; i < data.users.length; i++) {
                let user = data.users[i];
                if (queryAtrribute && queryValue) {
                    if (user[queryAtrribute] == queryValue)
                        rows.push(rows);
                } else {
                    rows = data.users;
                    break;
                }
            }
            // If requested no. of users is less than all users
            if (rows.length < count) {
                count = rows.length
            }

            var scimResource = GetSCIMList(rows, startIndex, count, req_url);
            res.status(200).json(scimResource);

        } else {
            let scim_error = SCIMError("User Not Found", "404");
            res.status(404).json(scim_error);
        }

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

    });
};

/**
 * API to get user details by user_id
 *
 * @method getUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var getUser = function(req, res) {
    let url_parts = url.parse(req.url, true);
    let query = req.query;
    let userId = req.params.user_id;
    let startIndex = query["startIndex"];
    let count = query["count"];
    let req_url = req.url;

    fileUtil.readFile('default.json', function(data) {
        let u = -1;

        for (let i = 0; i < data.users.length; i++) {
            if (data.users[i].id === userId) {
                u = i;
                break;
            }
        }

        if (u !== -1) {
            u = data.users[u];
            /*const scimUserResource = GetSCIMUserResource({userId, active: u.active, userName: u.userName,
                givenName: u.givenName, middleName: u.middleName, familyName: u.familyName, req_url}); */
            res.status(200).json(u);
        } else {
            const scim_error = SCIMError("User Not Found", "404");
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
var updateUser = function(req, res) {
    let userId = req.params.user_id;
    let url_parts = url.parse(req.url, true);
    let req_url = url_parts.pathname;
    let requestBody = JSON.parse(JSON.stringify(req.body));

    fileUtil.readFile('default.json', function(data) {
        let foundIndex = -1;

        for (var i = 0; i < data.users.length; i++) {
            if (data.users[i].id === userId) {
                Object.keys(data.users[i]).forEach(k => {
                    foundIndex = i;
                    data.users[i][k] = req.body[k];
                });
                break;
            }
        }

        fileUtil.writeFile('' /* filename optional (default.json will be considered as file name)*/ , data, function(err) {
            res.status(200).json(data.users[foundIndex]);
        });
    });
};

/**
 * API to deprovision or deactivate user
 *
 * @method deprovisionUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var deprovisionUser = function(req, res) {
    let patchResource = req.body;
    let attributes = ['schemas', 'Operations'];
    let schema_patchop = 'urn:ietf:params:scim:api:messages:2.0:PatchOp';

    for (let i = 0; i < attributes.length; i++) {
        if (!patchResource.hasOwnProperty(attributes[i]))
            return res.status(400).send(`Payload must contain '${attributes[i]}' attribute.`);
    }

    let schemaFound = false,
        schemas = patchResource['schemas'];
    for (let i = 0; i < schemas.length; i++) {
        if (schemas[i] == schema_patchop) {
            schemaFound = true;
            break;
        }
    }

    if (!schemaFound)
        return res.status(501).send("The 'schemas' type in this request is not supported.");

    fileUtil.readFile('default.json', function(data) {
        var foundIndex = -1;
        for (let i = 0; i < data.users.length; i++) {
            if (data.users[i]['id'] == req.params.user_id) {
                foundIndex = i;
                break;
            }
        }

        for (let i = 0; i < (patchResource['Operations']).length; i++) {
            const operation = patchResource['Operations'][i];
            if (operation.hasOwnProperty('op') && operation['op'] != 'replace')
                continue;

            Object.keys(operation['value']).forEach(k => {
                data.users[foundIndex][k] = operation['value'][k];
            });
        }

        fileUtil.writeFile('' /* filename optional (default.json will be considered as file name)*/ , data, function(err) {
            res.status(200).json(data.users[foundIndex]);
        });
    });
};


/**
 *  Groups
 */

function GetSCIMGroupResource(groupResource) {

    let scim_group = {
        "schemas": ["urn:ietf:params:scim:schemas:core:2.0:Group"],
        "id": null,
        "displayName": null,
        "members": [],
        "meta": {
            "resourceType": "Group",
            "location": null,
        }
    };

    scim_group["meta"]["location"] = groupResource.req_url;
    scim_group["id"] = groupResource.groupId;
    scim_group["displayName"] = groupResource.displayName;
    scim_group["members"] = groupResource.members;

    return scim_group;

}

var createGroup = function(req, res) {
    console.log('Group req.get(Content-Type)');
    console.log(req.get('Content-Type'));
    console.log('Group req.body');
    console.log(req.body);
    let url_parts = url.parse(req.url, true);
    let req_url = url_parts.pathname;
    let self = {};
    let reqBody = JSON.parse(JSON.stringify(req.body));

    ['members', 'displayName'].forEach(a => {
        self[a] = reqBody[a];
    });

    self.groupId = uuidV1();
    self.req_url = req_url;

    var response = GetSCIMGroupResource(self);

    fileUtil.readFile('default.json', function(data) {
        if (!data.groups) {
            data.groups = [];
        }
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
            fileUtil.writeFile('' /* filename optional (default.json will be considered as file name)*/ , data, function(err) {
                if (err) {
                    const scim_error = SCIMError(err, "400");
                    return res.staus(400).json(scim_error);
                }
                res.status(201).json(response);
            });
        } else {
            const scim_error = SCIMError("Conflict - Resource Already Exists", "409");
            res.status(409).json(scim_error);
        }
    });

};

var getGroup = function(req, res) {
    console.log(getGroup);
    let groupId = req.params.group_id;
    let query = req.query;
    let url_parts = url.parse(req.url, true);
    let startIndex = query["startIndex"];
    let count = query["count"];
    let req_url = req.url;

    console.log(`req_url   ${req_url}`);
    console.log(`url_parts   ${url_parts}`);
    console.log(`groupId   ${groupId}`);
    console.log(`query   ${JSON.stringify(query, null, 2)}`);

    fileUtil.readFile('default.json', function(data) {
        if(!data.groups) data.groups = [];
        let groupIndex = -1;

        console.log(data.groups.length);
        for (let i = 0; i < data.groups.length; i++) {
            if (data.groups[i].id === groupId) {
                groupIndex = i;
                break;
            }
        }

        if (groupIndex !== -1) {
            /*groupIndex = data.groups[u];
            const scimGroupResource = GetSCIMGroupResource({groupId, members, displayName, req_url}); */
            res.status(200).json(data.groups[groupIndex]);
        } else {
            const scim_error = SCIMError("Group Not Found", "404");
            res.status(404).json(scim_error);
        }
    });
}

var getGroups = function(req, res) {
    let url_parts = url.parse(req.url, true);
    let req_url = url_parts.pathname;

    let scim_error = SCIMError("Not implented", "400");
    res.status(400).json(scim_error);
}

var updateGroup = function(req, res) {
    console.log('updateGroup');
    console.log('req.body');
    console.log(req.body);
    let groupId = req.params.group_id;
    let url_parts = url.parse(req.url, true);
    let req_url = url_parts.pathname;
    let reqBody = JSON.parse(JSON.stringify(req.body));

    console.log(`req_url   ${req_url}`);
    console.log(`url_parts   ${JSON.stringify(url_parts, null, 2)}`);
    console.log(`groupId   ${groupId}`);

    fileUtil.readFile('default.json', function(data) {
        if(!data.groups) data.groups = [];
        let groupIndex = -1;

        console.log(data.groups.length);
        for (let i = 0; i < data.groups.length; i++) {
            if (data.groups[i].id === groupId) {
                groupIndex = i;
                data.groups[i]["members"] = reqBody["members"];
                break;
            }
        }

        if (groupIndex !== -1) {
            /*groupIndex = data.groups[u];
            const scimGroupResource = GetSCIMGroupResource({groupId, members, displayName, req_url}); */
            fileUtil.writeFile('' /* filename optional (default.json will be considered as file name)*/ , data, function(err) {
                if (err) {
                    const scim_error = SCIMError(err, "400");
                    return res.staus(400).json(scim_error);
                }
                res.status(200).json(data.groups[groupIndex]);
            });
        } else {
            const scim_error = SCIMError("Group Not Found", "404");
            res.status(404).json(scim_error);
        }
    });
}

var deleteGroup = function(req, res) {
    let groupId = req.params.group_id;
    let url_parts = url.parse(req.url, true);
    let req_url = url_parts.pathname;

    let scim_error = SCIMError("Not implented", "400");
    res.status(400).json(scim_error);
}

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
    "deprovisionUser": deprovisionUser,
    "createGroup": createGroup,
    "getGroup": getGroup,
    "updateGroup": updateGroup,
    "deleteGroup": deleteGroup,
    "getGroups": getGroups
}

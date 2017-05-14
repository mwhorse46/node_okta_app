const user = require('./User');

exports.GetSCIMList = function(rows, startIndex, count, req_url) {
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
    let location = "";
    if (startIndex) {
        for (let i = (startIndex - 1); i < count; i++) {
            location = req_url + "/" + rows[i]["id"];
            let userResource = user.GetSCIMUserResource({
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

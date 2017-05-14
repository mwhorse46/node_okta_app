const group = require('./Group');

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
            let groupResource = group.GetSCIMGroupResource({
                "groupId": rows[i]["id"],
                "displayName": rows[i]["displayName"],
                "members": rows[i]["memebers"],
                "req_url": location
            });
            resources.push(groupResource);
            location = "";
        }
    }

    scim_resource["Resources"] = resources;
    scim_resource["startIndex"] = startIndex;
    scim_resource["itemsPerPage"] = count;
    scim_resource["totalResults"] = count;

    return scim_resource;
}

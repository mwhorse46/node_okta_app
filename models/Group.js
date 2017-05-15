exports.GetSCIMGroupResource = function({
    groupId,
    displayName,
    members,
    req_url
}) {
    const scim_group = {
        "schemas": ["urn:ietf:params:scim:schemas:core:2.0:Group"],
        "id": null,
        "displayName": null,
        "members": [],
        "meta": {
            "resourceType": "Group",
            "location": null,
        }
    };

    scim_group["id"] = groupId;
    scim_group["displayName"] = displayName;
    scim_group["members"] = members;
    scim_group["meta"]["location"] = req_url;

    return scim_group;
}

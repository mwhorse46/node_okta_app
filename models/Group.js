exports.GetSCIMGroupResource = function(groupResource) {
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

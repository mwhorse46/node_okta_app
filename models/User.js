exports.GetSCIMUserResource = function(userResource) {
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

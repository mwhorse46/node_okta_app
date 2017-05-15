exports.GetSCIMUserResource = function({
    userId,
    displayName,
    active,
    userName,
    givenName,
    middleName,
    familyName,
    emails,
    req_url
}) {
    const scim_user = {
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

    scim_user["meta"]["location"] = req_url;
    scim_user["id"] = userId;
    scim_user["active"] = active;
    scim_user["userName"] = userName;
    scim_user["displayName"] = displayName;
    scim_user["name"]["givenName"] = givenName;
    scim_user["name"]["middleName"] = middleName;
    scim_user["name"]["familyName"] = familyName;
    scim_user["emails"] = emails;

    return scim_user;

}

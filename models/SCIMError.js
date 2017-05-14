exports.SCIMError = function(errorMessage, statusCode) {
    let scim_error = {
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:Error"],
        "detail": null,
        "status": null
    }

    scim_error["detail"] = errorMessage;
    scim_error["status"] = statusCode;

    return scim_error;
}

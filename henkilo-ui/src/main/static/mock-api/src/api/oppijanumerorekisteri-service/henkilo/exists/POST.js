const json = require("connect-api-mocker/helpers/json");

module.exports = function (request, response) {
    if (request.body.hetu === "110902E9074") {
        response.status(200).send({
            oid: "1.2.246.562.24.35261657306"
        });
    } else if (request.body.hetu === "010108A9239") {
        response.status(409).send({
            timestamp: new Date().getTime(),
            status: 409,
            error: "Conflict",
            path: request.path,
        }); 
    } else {
        response.status(404).send({
            timestamp: new Date().getTime(),
            status: 404,
            error: "Not Found",
            path: request.path,
        });
    }
};
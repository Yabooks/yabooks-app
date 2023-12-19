const axios = require("axios"), SqlString = require("sqlstring");

class YabooksApp
{
    constructor(baseUrl, appDetails, userSessionId = null)
    {
        this.baseUrl = baseUrl;
        this.appDetails = appDetails;
        this.userSessionId = userSessionId;
    }

    oauth() // oauth(res) --> oauth(req)
    {
        // TODO
    }

    asUser(userSessionId)
    {
        return new YabooksApp(this.baseUrl, this.appDetails, userSessionId);
    }

    async get(url)
    {
        // TODO
    }

    // TODO post patch update delete

    async sql(documentId, sql, params)
    {
        let query = SqlString.format(sql, params);
        return await this.post(`/api/v1/documents/${documentId}/sqlite`, query);
    }
}

module.exports = { YabooksApp };

const axios = require("axios"), SqlString = require("sqlstring");

class YabooksApp
{
    constructor(baseUrl, appDetails, appSessionToken = null, userSessionToken = null)
    {
        this.baseUrl = baseUrl;
        this.appDetails = appDetails;
        this.appSessionToken = appSessionToken;
        this.userSessionToken = userSessionToken;
    }

    getAppId()
    {
        return this.appDetails._id;
    }

    oauth() // oauth(res) --> oauth(req)
    {
        // TODO
    }

    asUser(userSessionToken)
    {
        return new YabooksApp(this.baseUrl, this.appDetails, this.appSessionToken, userSessionToken);
    }

    async coreRequest(httpMethod, url, data, config = {})
    {
        // skip "data" argument if a body-less http method is used
        if([ "GET", "get", "DELETE", "delete" ].includes(httpMethod))
        {
            config = data || {};
            data = undefined;
        }

        // prepend base url to core if provided url is not absolute
        if(url.indexOf("http") !== 0)
            url = this.baseUrl + url;

        // authenticate request
        if(!config.headers) config.headers = {};
        config.headers.authorization = `Bearer ${this.appSessionToken}`;
        config.headers.cookie = `user_token=${this.userSessionToken}`;

        // send http request to core and return response
        return await axios({ method: httpMethod, url, data, ...config });
    }

    async get(url, config)
    {
        return await this.coreRequest("GET", url, config);
    }

    async post(url, data, config)
    {
        return await this.coreRequest("POST", url, data, config);
    }

    async patch(url, data, config)
    {
        return await this.coreRequest("PATCH", url, data, config);
    }

    async delete(url, data, config)
    {
        return await this.coreRequest("DELETE", url, data, config);
    }

    async sql(documentId, sql, params)
    {
        let query = SqlString.format(sql, params);
        return await this.post(`/api/v1/documents/${documentId}/sqlite`, query);
    }
}

module.exports = { YabooksApp };

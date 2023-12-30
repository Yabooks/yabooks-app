const axios = require("axios"), SqlString = require("sqlstring-sqlite");

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
        if(this.userSessionToken) config.headers.cookie = `user_token=${this.userSessionToken}`;

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

    async put(url, data, config)
    {
        return await this.coreRequest("PUT", url, data, config);
    }

    async delete(url, data, config)
    {
        return await this.coreRequest("DELETE", url, data, config);
    }

    async sql(documentId, sql, params)
    {
        // document id is optional and defaults to "app-config"
        if([ "object", "undefined" ].includes(typeof sql))
        {
            params = sql;
            sql = documentId;
            documentId = "app-config";
        }

        // input validation
        if(typeof sql !== "string")
            throw new Error("provided SQL query is not a string");

        // escape SQL statement and forward to core via http request
        let query = SqlString.format(sql, params), isSelect = query.toLowerCase().includes("select");
        query = await this.post(`/api/v1/documents/${documentId}/sqlite?results=${isSelect}`, query, { headers: { "content-type": "application/sql" } });
        return query.data;
    }
}

module.exports = { YabooksApp };

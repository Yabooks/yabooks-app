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

    async app(appId) // provides a possibility to access other apps
    {
        let req = await this.get(`/api/v1/apps/${appId}`);
        let appBaseUrl = req.data.api;
        let appDetails = req.data;
        let appAccessToken = req.data.apiToken;
        return new YabooksApp(appBaseUrl, appDetails, appAccessToken);
    }

    async verifyAppToken(token) // verify if a request from another app is authenticated
    {
        try
        {
            if(token.headers?.authorization) // extract token from a express request
                token = token.headers.authorization.substring("Bearer ".length);

            let payload = await this.get(`/api/v1/apps/${this.getAppId()}/verify-token/${token}`); // FIXME might use bundle id instead
            return payload.data.aud || true;
        }
        catch(x)
        {
            return false;
        }
    }

    async oauth(re, redirect_uri = this?.appDetails?.redirect_uris?.[0], state = "") // oauth(res) --> oauth(req) --> user session token
    {
        if(re.redirect) // treat `re` as express response
        {
            re.redirect(`${this.baseUrl}/oauth/auth?response_type=code&state=` + encodeURIComponent(state) +
                "&client_id=" + encodeURIComponent(this.getAppId()) +
                "&redirect_uri=" + encodeURIComponent(redirect_uri));
        }

        else if(re.query.code) // treat `re` as express request that is received via the callback url
            try
            {
                let data = await this.post("/oauth/token", { code: re.query.code, client_secret: this.appDetails.secret });
                return { token: data.data.token, state: re.query.state };
            }
            catch(x)
            {
                let msg = x?.response?.data?.error || x?.message || x;
                throw new Error("could not finalize oauth flow: " + msg, { cause: x });
            }

        else throw new Error(`express request or response expected, but ${re} provided`);
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

const axios = require("axios"), { YabooksApp } = require("./app.js");

module.exports = (
{
    getLicenseKey()
    {
        return process.env.YABOOKS_APP_LICENSE_KEY;
    },

    async registerApp(appDetails, // { bundle_id: "com.example.test", name: "Test App", link: "", icon: "", redirect_uris: [ "" ] }
        baseUrl = process.env.YABOOKS_CORE_BASE_URL,
        appId = process.env.YABOOKS_APP_ID,
        secret = process.env.YABOOKS_APP_SECRET)
    {
        try
        {
            // check if base url is a http(s) url
            if(typeof baseUrl !== "string" || baseUrl.indexOf("http") !== 0)
                throw new Error("a valid base url to Yabooks core must be provided");

            // remove trailing slash from base url if provided
            if(baseUrl.substring(baseUrl.length - 1) === "/")
                baseUrl = baseUrl.substring(0, baseUrl.length - 1);

            // log in to Yabooks core
            let session = await axios.post(`${baseUrl}/api/v1/apps/${appId}/session`, { secret });

            // raise an error if logging in was not successful
            if(!session || !session.data || !session.data.token)
                throw new Error("could not log in to Yabooks core");

            // register app with Yabooks core
            let config = { headers: { authorization: `Bearer ${session.data.token}` } };
            return new YabooksApp(baseUrl, await axios.patch(`${baseUrl}/api/v1/apps/${appId}`, appDetails, config));
        }
        catch(error)
        {
            // re-throw error
            throw new Error("could not register Yabooks app", { cause: error });
        }
    }
});

const axios = require("axios"), { YabooksApp } = require("./app.js");
const wstcpServer = require("wstcp").server, proxy = require("express-http-proxy");

module.exports = (
{
    getLicenseKey()
    {
        return process.env.YABOOKS_APP_LICENSE_KEY;
    },

    async registerApp(appDetails = {},
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

            // TODO proxy for appDetails.link, appDetails.icon, appDetails.redirect_uris,

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
    },

    configureWebAppAsDiscoverableApp(expressApp, appDetails, onConnect)
    {
        let httpWebSocketPort = 0; // TODO
        let coreReverseTunnelPort = 0; // TODO

        wstcpServer({
            port: httpWebSocketPort,
            tcpPort: coreReverseTunnelPort,
            remote: true
        });

        expressApp.use("/.well-known/yabooks-core-tunnel",
            proxy(`http://localhost:${httpWebSocketPort}/`));

        expressApp.post("/.well-known/yabooks-app", async (req, res) =>
        {
            try
            {
                let baseUrl = req.query.baseUrl;
                let appId = req.query.appId;
                let secret = req.query.secret;
                let licenseKey = req.query.licenseKey;

                // check if base url is a http(s) url
                if(typeof baseUrl !== "string" || baseUrl.indexOf("http") !== 0)
                    throw new Error("a valid base url to Yabooks core must be provided");

                try // check if base url is accessible ...
                {
                    // log in to Yabooks core
                    let session = await axios.post(`${baseUrl}/api/v1/apps/${appId}/session`, { secret });

                    // raise an error if logging in was not successful
                    if(!session || !session.data || !session.data.token)
                        throw new Error("could not log in to Yabooks core");
                }
                catch(x) // ... otherwise respond to core that it shall connect to websocket tunnel
                {
                    baseUrl = `http://localhost:${coreReverseTunnelPort}`;

                    res.status(305).json({
                        message: "Dear core, you appear to be inaccessible to me. Please connect to my websocket tunnel."
                    });
                }

                // register app with Yabooks core
                let coreConnection = await module.exports.registerApp(appDetails, baseUrl, appId, secret);

                // provide pair of license key and core connection to app
                onConnect(licenseKey, coreConnection);
            }
            catch(error)
            {
                res.status(500).json({ error });
            }
        });
    }
});

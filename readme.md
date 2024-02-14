# set up

## install package

```bash
npm install git@github.com:Yabooks/yabooks-app.git
```

## use in a local Yabooks app
The following code snippet shows how to register a Yabooks app, which can be locally installed and started by the Yabooks core.
This way, the module will receive all information to communicate with the Yabooks core through environment variables.

```js
const YabooksCore = require("yabooks-app");

let licenseKey = YabooksCore.getLicenseKey();

let core = await YabooksCore.registerApp({
    bundle_id: "com.example.test",
    name: "My Local App",
    link: "http://localhost:8080/",
    api: "http://localhost:8080",
    icon: "http://localhost:8080/icon.svg",
    redirect_uris: [ "http://localhost:8080/oauth" ]
});
```

## use in a publicly available web apps
The following code snippet shows how to implement a Yabooks app, which is installed remotely and can be discovered by the Yabooks core.
This way, the module will receive all information to communicate with the Yabooks core once the Yabooks core discovers it and connects with it.

```js
const YaBooksCore = require("yabooks-app");

let appDetails = {
    bundle_id: "com.example.test",
    name: "My Local App",
    link: "http://localhost:8080/",
    icon: "http://localhost:8080/icon.svg",
    redirect_uris: [ "http://localhost:8080/oauth" ]
};

YabooksCore.configureWebAppAsDiscoverableApp(expressApp, appDetails, function(licenseKey, core) {
    // store core connection associated with the license key for later use
    // function will be called on every (re)connect
});
```

# communication with Yabooks core
Once the app is registered and the connection to the core is established, the `core` object can be used to communicate with the core.

```js
// call core API endpoints (get, post, put, patch, update, delete)
let identities = await core.get("/api/v1/identities");

// perform SQL statements on a SQLite document
await core.sql("507f1f77bcf86cd799439011", "insert into foo (bar) values (?)", [ "ACME, Inc." ]);
```

## communication in a user's context
To obtain a user session, an OAuth flow can be initiated:

```js
expressApp.get("/login", async (req, res) => {
    await core.oauth(res);
});

expressApp.get("/oauth", async (req, res) => {
    let context = await core.oauth(req);
    let authenticatedCoreConnection = core.asUser(context.token);
}):
```

# communication with another app

## sending a message
To send an API request to another app:

```js
let otherApp = await core.app("com.some-other-app");
let data = await otherApp.get("/api/endpoint");
```

## receiving a message
To verify which app an incoming API call comes from:

```js
expressApp.get("/api/endpoint", async (req, res) => {
    let authenticated = await core.verifyAppToken(req);

    if(authenticated)
        res.send(`Welcome, ${authenticated}!`);
    else res.status(401).send("Sorry!");
});
```

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

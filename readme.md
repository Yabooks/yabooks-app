## install package

```bash
npm install git@github.com:Yabooks/yabooks-app.git
```

## use package

```js
const YaBooksCore = require("yabooks-app");

// register app with Yabooks core
let core = await YaBooksCore.registerApp({
    bundle_id: "com.example.test"
});

// interact with Yabooks core
let identities = await core.get("/api/v1/identities");
``

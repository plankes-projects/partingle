# vue

## Project setup
* Create config.ts from config.ts.template and fill data.

```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### This is how you regenerate the API
java -jar openapi-generator-cli-4.3.1.jar generate -i server\specification\src\main\resources\openapi.yml -g typescript-axios -o clients\vue\src\generated/api-axios
Make following changes to api.ts because I did not figure out how to ignore this file yet.
* Add '/// \<reference types="node"/\>' to the top


### This is how you regenerate new icons
Run in ./public
npx pwa-asset-generator img/logo.png img/icons -i ./index.html -m ./manifest.json

### Useful links:
* https://blog.logrocket.com/how-to-write-a-vue-js-app-completely-in-typescript/
* https://buefy.org/documentation/input/
* https://fontawesome.com/icons?d=gallery

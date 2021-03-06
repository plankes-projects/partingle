# houseparty

## DEV:

### Run Server:
cd server
mvnw install
"C:\Program Files\Java\jdk-12.0.2\bin\java" -jar app\target\app-0.0.1-SNAPSHOT.jar --spring.config.location=app/application.properties

### Run Client
cd clients/vue
npm run serve

### generate client api (same as in client readme):
java -jar openapi-generator-cli-4.3.1.jar generate -i C:\Users\planke\Data\apps\houseparty\server\specification\src\main\resources\openapi.yml -g typescript-axios -o C:\Users\planke\Data\apps\houseparty\clients\vue\src\generated/api-axios
Make following changes to api.ts because I did not figure out how to ignore this file yet.
* Add '/// <reference types="node"/>' to the top
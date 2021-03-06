# Setup:
Create app/application.properties from app/application.properties.template and fill data. (this location is important otherwise 'mvnw install' does not work)
* Provide spring hibernate config
* Provide custom config variables:

# Run:

> mvnw install

This will generate code based on openapi.yml in specification project and install all dependencies.

> java -jar app/target/app-0.0.1-SNAPSHOT.jar --spring.config.location=app/application.properties

Runs the app

# Notes:
* Initial project structure based on https://reflectoring.io/spring-boot-openapi/

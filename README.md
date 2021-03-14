# Partingle

Website: https://d1n598x054kygy.cloudfront.net/

Demo: https://partingle.epicnerf.com/#/host

# Hosting
### High availablility and unlimited scaling 
High availablility with unlimited scaling can be achieved with following setup for ~90$/month.
* Client hosting: AWS Amplify
* Backend hosting: AWS Elastic Beanstalk
* DB: AWS Aurora MySQL

### Budget
Private use is much cheaper and can be handled by the cheapest server you find since server only needs to handle the user syncing. Video chat logic is 100% handled by jitsi public servers.

# Getting Started
The project consists of 2 parts:
* Java Spring server which connects to a MySQL database. See server readme for more information.
* TypeScript Vue client. See client readme for more information.

# This is a node.js based API.
It fetches stats of covid19 for only districts located in UP from our mongoDB database and if it is found to be old then response is sent from online resources and then our database is updated based on it...

# How to set environment variables to get started?
For development:- By default, env is set to development and local database is used. set cov2_node_api_python_script=enabled in order to update database if document is found to be old, start mongodb server (command: mongod, for me on cmd) and then command "npm start" for node to get started.

For production:- set env=production, set cov2_node_api_python_script=enabled if your host supports pythonScript exectution otherwise skip this env variable, set cov2_node_api_db_user=dbUserName, set cov2_node_api_db_password=dbPassword, set cov2_node_api_db_place=remote, now make sure mongodb server is on then, type command: "npm start" to start node api
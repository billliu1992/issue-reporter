var MongoClient = require("mongodb").MongoClient
var Server = require("mongodb").Server;

/* Change later */
ReporterMongoServer = {
	client : new MongoClient(new Server('localhost', 27017))
};

module.exports = ReporterMongoServer;
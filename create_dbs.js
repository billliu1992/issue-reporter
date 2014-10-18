conn = new Mongo();

db = conn.getDB("issue_db");
db.createCollection("issues");

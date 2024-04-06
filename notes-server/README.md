simple server on port 3000 that implement the http requests:

start npm server.js
then to write, change or delete note use curl:
curl http://localhost:3000/api/notes
curl -X POST -H "Content-Type: application/json" -d '{"content": "Test note content"}' http://localhost:3000/api/notes
curl -X PUT -H "Content-Type: application/json" -d '{"content": "Updated note content"}' http://localhost:3000/api/notes/1
curl -X DELETE http://localhost:3000/api/notes/1



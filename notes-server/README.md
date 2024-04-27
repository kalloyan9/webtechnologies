Simple server on port 3000 that implement writting, reading, saving and deleting of notes by the http requests using express, fs and path.
Every note has unique id by the formula : currentId = lastId + 1.

Simple example how to use it:
1- install all dependent modules with npm
2- compile servet.ts -> server.js with ts compiler
3- run server.js with npm

then to write, change or delete note use curl:
curl http://localhost:3000/api/notes
curl -X POST -H "Content-Type: application/json" -d '{"content": "Test note content"}' http://localhost:3000/api/notes
curl -X PUT -H "Content-Type: application/json" -d '{"content": "Updated note content"}' http://localhost:3000/api/notes/1
curl -X GET http://localhost:3000/api/notes/1
curl -X DELETE http://localhost:3000/api/notes/1


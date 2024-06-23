using mysql and typescript.
required: mysql, DB created and user+password authorized, nodejs and express installed for the project


DEMO:
mysql -u dev -p
123
/ select * from USERS; /
+----------+-------------------+-----------+
| username | email             | password  |
+----------+-------------------+-----------+
| user1    | user1@example.com | password1 |
| user2    | user2@example.com | password2 |
| dev      | dev@example.com   | password  |
+----------+-------------------+-----------+
// registered users
/ select * from NOTES; /
+--------------+-----------------+--------+
| title        | content         | author |
+--------------+-----------------+--------+
| updatedNote1 | Updated content | dev    |
+--------------+-----------------+--------+



CREATE A NEW NOTE:
curl -X POST -H "Content-Type: application/json" -d '{"title": "note1", "content": "New note from dev", "author": "dev"}' http://localhost:3000/notes


UPDATE A NOTE:
curl -X PUT -H "Content-Type: application/json" -d '{"newTitle": "updatedNote1", "content": "Updated content", "author": "dev"}' http://localhost:3000/notes/title/note1

GET ALL NOTES:
curl http://localhost:3000/notes
// todo - sort by 'author' == logged author

GET A NOTE BY ID:
curl http://localhost:3000/notes/title/updatedNote1

DELETE A NOTE BY ID:
curl http://localhost:3000/notes/title/updatedNote1




// document.addEventListener("DOMContentLoaded", function() {

//     function setWelcomeMessage(username) {
//         welcomeMessage.textContent = `Hi, ${username}`;
//     }
    
//     function editNoteButtonHandler(event) {
//         if (event.target.classList.contains("edit-note-btn")) {
//             const noteElements = Array.from(document.querySelectorAll(".edit-note-btn"));
//             const index = noteElements.indexOf(event.target);
//             editNodeIndex = index;

//             const existingNotes = JSON.parse(localStorage.getItem("notes")) || [];
//             const existingNote = existingNotes[index];
            
//             document.getElementById("note-name").value = existingNote.name;
//             document.getElementById("note-content").value = existingNote.content;
            
//             modal.style.display = "block";
//         }
//     }

//     newNoteForm.addEventListener("submit", function(event) {
//         event.preventDefault();

//         if (editNodeIndex !== null) {
//             deleteNote(editNodeIndex);
//         }
        
//         const noteName = document.getElementById("note-name").value;
//         const noteContent = document.getElementById("note-content").value;
        
//         const existingNotes = JSON.parse(localStorage.getItem("notes")) || [];
//         existingNotes.push({ name: noteName, content: noteContent });
        
//         localStorage.setItem("notes", JSON.stringify(existingNotes));
//         closeModal();
//         displayNotes();
//     });

//     function closeModal() {
//         modal.style.display = "none";
//         editNodeIndex = null;
//     }

//     newNoteBtn.addEventListener("click", function() {
//         document.getElementById("note-name").value = "";
//         document.getElementById("note-content").value = "";
//         modal.style.display = "block";
//     });

//     closeModalBtn.addEventListener("click", closeModal);

//     modal.addEventListener("click", function(event) {
//         if (event.target == modal) {
//             closeModal();
//         }
//     });

//     notesContainer.addEventListener("click", function(event) {
//         if (event.target.classList.contains("delete-note-btn")) {
//             deleteNoteButtonHandler(event);
//         } else if (event.target.classList.contains("edit-note-btn")) {
//             editNoteButtonHandler(event);
//         }
//     });

//     setWelcomeMessage('User');

//     displayNotes();
// });



let notesContainer = document.getElementById("notes-container");
const newNoteBtn = document.getElementById("new-note-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const modal = document.getElementById("note-modal");
const newNoteForm = document.getElementById("edit-note-form");
const welcomeMessage = document.getElementById("welcome-message");
let editNodeIndex = null;


async function displayNotes() {
    let notes = [];

    notesContainer.innerHTML = "";

    fetch('http://localhost:3001/api/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            {
                url: '/notes'
            }
        )
    }).then(res => res.json()).then(data => {
        if(data){
            data.forEach(note => console.log(note))
            notes = data;
            console.log("data is:");
            console.log(data);
            let idx = 0;
            data.forEach((note) => {
                const noteBox = document.createElement("div");
                noteBox.classList.add("note");
                noteBox.innerHTML = `
                    <h2 id="${idx}">${note.title}</h2>
                    <p>${note.content}</p>
                    <button onclick = "editNote(${idx})" class="edit-note-btn">Edit ✍️</button>
                    <button onclick = "deleteNote(${idx})" class="delete-note-btn">Delete 🙅‍♂️</button>
                `;
                notesContainer.appendChild(noteBox);
                idx++;
            });        
        }
    })
}

async function deleteNote(idx) {
    let noteTitleElement = document.getElementById(idx);
    let noteTitle = noteTitleElement.textContent.trim();
    console.log("Deleting note:", noteTitle);

    fetch('http://localhost:3001/api/notes', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            {
                url: '/notes',
                title: noteTitle
            }
        )
    }).then(res => res.json()).then(data => {
        if(data) {
            displayNotes();
        } else {
            console.log("ifndata");
        }
    });
}

async function editNote(idx) {
    let noteTitleElement = document.getElementById(idx);
    let noteTitle = noteTitleElement.textContent.trim();
    let newContent = "TODO: NEW CONTENT";
    console.log("Editing note:", noteTitle);

    fetch('http://localhost:3001/api/notes', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            {
                url: '/notes',
                title: noteTitle,
                content: newContent
            }
        )
    }).then(res => res.json()).then(data => {
        if(data) {
            displayNotes();
        } else {
            console.log("ifndata");
        }
    });
}

newNoteForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (editNodeIndex !== null) {
        deleteNote(editNodeIndex);
    }
    
    const noteName = document.getElementById("note-name").value;
    const noteContent = document.getElementById("note-content").value;
    
    const existingNotes = JSON.parse(localStorage.getItem("notes")) || [];
    existingNotes.push({ name: noteName, content: noteContent });
    
    localStorage.setItem("notes", JSON.stringify(existingNotes));
    closeModal();
    displayNotes();
});

    // function closeModal() {
    //     modal.style.display = "none";
    //     editNodeIndex = null;
    // }

    // newNoteBtn.addEventListener("click", function() {
    //     document.getElementById("note-name").value = "";
    //     document.getElementById("note-content").value = "";
    //     modal.style.display = "block";
    // });

    // closeModalBtn.addEventListener("click", closeModal);

    // modal.addEventListener("click", function(event) {
    //     if (event.target == modal) {
    //         closeModal();
    //     }
    // });

    // notesContainer.addEventListener("click", function(event) {
    //     if (event.target.classList.contains("delete-note-btn")) {
    //         deleteNoteButtonHandler(event);
    //     } else if (event.target.classList.contains("edit-note-btn")) {
    //         editNoteButtonHandler(event);
    //     }
    // });



function logout(){
    fetch('http://localhost:3001/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(res => res.json()).then(data => {
        if(data.success){
            window.location.href = data.redirect
        }
    })
}

displayNotes();
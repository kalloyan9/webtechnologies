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
                    <p class="content">${note.content}</p>
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

    document.getElementById("note-name").value = noteTitle;
    // document.getElementById("note-content").value = noteTitleElement.parentElement.getElementsByClassName("content")[0];

    modal.style.display = "block";
}

function newNoteFunction() {
    document.getElementById("note-name").value = "";
    document.getElementById("note-content").value = "";
    modal.style.display = "block";
}

async function submitFunction() {
    const noteName = document.getElementById("note-name").value;
    const noteContent = document.getElementById("note-content").value;
    console.log("submitfunction, name:", noteName, "noteContent:", noteContent);

    fetch('http://localhost:3001/api/notes', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            {
                url: '/notes',
                title: noteName,
                content: noteContent
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


function closeModalFunction() {
    modal.style.display = "none";
    editNodeIndex = null;
}

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
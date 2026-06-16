let allUserNotes = [];
let db;
let editId = null;
let calendar;
let calendarInitialized = false;

const request = indexedDB.open("MinoNotesDB", 2);

request.onupgradeneeded = function (e) {
    db = e.target.result;

    if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "id", autoIncrement: true });
    }

    if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "noteId", autoIncrement: true });
    }
};

request.onsuccess = function (e) {
    db = e.target.result;

    updateUI();
    // loadNotes();
    attachEvents();
};

// const addNoteBtn = document.getElementById("addNoteBtn");
// const noteModal = document.getElementById("noteModal");

addNoteBtn.addEventListener("click", () => {
    noteModal.classList.remove("hidden");
    calendarE1.classList.add("hidden");
});


const modal = document.getElementById("authModal");
const modalTitle = document.getElementById("modalTitle");
const submitBtn = document.getElementById("submitBtn");

let mode = "login";

document.getElementById("loginBtn").addEventListener("click", () => {
    mode = "login";
    modalTitle.textContent = "Login";
    submitBtn.textContent = "Login";
    modal.classList.remove("hidden");
});

document.getElementById("signupBtn").addEventListener("click", () => {
    mode = "signup";
    modalTitle.textContent = "Sign Up";
    submitBtn.textContent = "Sign Up";
    modal.classList.remove("hidden");
});

document.getElementById("closeBtn").addEventListener("click", () => {
    modal.classList.add("hidden");
});

submitBtn.addEventListener("click", () => {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please fill all fields");
        return;
    }

    if (mode === "signup") {
        signup(username, password);
    } else {
        login(username, password);
    }

    modal.classList.add("hidden");
});



function updateUI() {


    const username = localStorage.getItem("loggedUser");

    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const addNoteBtn = document.getElementById("addNoteBtn");
    const userBox = document.getElementById("userBox");
    const notesContainer = document.getElementById("notesContainer");
    const welcomeTxt = document.getElementById("welcomeTxt");

    if (username) {
        loginBtn.style.display = "none";
        signupBtn.style.display = "none";
        welcomeTxt.style.display = "none";
        addNoteBtn.classList.remove("hidden");
        notesContainer.classList.remove("hidden");
        userBox.innerHTML = `
            <div class="text-lg font-semibold text-blue-800 bg-pink-300 p-0.5 border rounded-xl">
                 Hi, ${username}
            </div>
        `;
        loadNotes();
    } else {
        loginBtn.style.display = "block";
        signupBtn.style.display = "block";
        welcomeTxt.style.display = "block";
        notesContainer.classList.add("hidden");
        addNoteBtn.classList.add("hidden");
        userBox.innerHTML = "";
        notesContainer.innerHTML = ""; // clear data
    }
}

function signup(username, password) {
    // 1. Username validation (only alphabets)
    const usernameRegex = /^[A-Za-z0-9]{3,}$/;
    if (!usernameRegex.test(username)) {
        alert("Combination of alphabets and numbers are allowed");
        return;
    }

    // 2. Password validation (at least 1 letter, 1 number, 1 special character)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
    if (!passwordRegex.test(password)) {
        alert("Password must contain 1 special symbol numbers and alphabet!");
        return;
    }

    let tx = db.transaction("users", "readwrite");
    let store = tx.objectStore("users");

    // 3. Check if username already exists
    let request = store.getAll();

    request.onsuccess = () => {
        let users = request.result;

        let userExists = users.some(user => user.username === username);

        if (userExists) {
            alert("User already registered!");
            return;
        }

        store.add({
            id: Date.now(),
            username,
            password
        });
        tx.oncomplete = () => {
            localStorage.setItem("loggedUser", username);
            alert("Signup successful!");
            updateUI();
        };
    };
}

function login(username, password) {
    let tx = db.transaction("users", "readonly");
    let store = tx.objectStore("users");
    let req = store.getAll();
    req.onsuccess = function (e) {
        //const user = req.result;
        const users = e.target.result;
        const user = users.find(u =>
            u.username === username && u.password === password
        );

        if (user) {

            // 🔥 persist login
            localStorage.setItem("loggedUser", username);

            alert("Login successful");

            updateUI();
            // loadNotes();

        } else {
            alert("Invalid credentials");
        }
    };
}
window.addEventListener("load", () => {

    const savedUser = localStorage.getItem("loggedUser");

    if (savedUser) {
        updateUI();
        loadNotes();
    }
});
function logout() {
    localStorage.removeItem("loggedUser");
    //  localStorage.removeItem("username"); 
    // sessionStorage.removeItem("loggedUser");
    document.getElementById("notesContainer").innerHTML = "";
    updateUI();
}


// for notes

function loadNotes() {

    const container = document.getElementById("notesContainer");
    container.innerHTML = "";

    const username = localStorage.getItem("loggedUser");

    if (!username) return;

    let tx = db.transaction("notes", "readonly");
    let store = tx.objectStore("notes");

    let req = store.getAll();

    req.onsuccess = function (e) {
        const allNotes = e.target.result;
        const username = localStorage.getItem("loggedUser");
        allUserNotes = allNotes.filter(note => note.username === username);
        allUserNotes = allNotes.filter(
                        note => note.username === username && !note.isDeleted
                        );

        renderNotes(allUserNotes);
        updateCalendar(allUserNotes);
    };

}

function renderNotes(notes) {
    const container = document.getElementById("notesContainer");
    container.innerHTML = "";

    const colors = [
        "bg-white",
        "bg-blue-50",
        "bg-pink-50",
        "bg-green-50",
        "bg-yellow-50",
        "bg-white",
        "bg-blue-100",
        "bg-pink-100",
        "bg-green-100",
        "bg-yellow-100"
    ];

    notes.forEach((note, index) => {
        const bg = colors[index % colors.length];

        container.innerHTML += `
        
            <div onclick="openNote(${note.noteId})"
                class="w-60 ${bg} shadow-md rounded-2xl p-4 border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer">
            <h2 class="font-bold text-lg text-gray-800 mb-2">
                ${note.title}
            </h2>

            <hr class="mb-2 border-gray-300">

            <p id="desc-${note.noteId}" class="text-gray-600 text-sm mb-3  line-clamp-1">
                ${note.desc}
            </p>

            <div class="text-xs text-gray-400 mb-3">
                ${note.date}
            </div>
            
             <button onclick="event.stopPropagation(); deleteNote(${note.noteId})"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded-lg">
                 Delete
            </button>

             <button onclick="event.stopPropagation(); edit(${note.noteId})""
                class="bg-red-500 hover:bg-red-600 text-white px-6 py-1 ml-10 text-sm rounded-lg">
                Edit
            </button>
            

        </div>
        `;
    });
    notes.forEach(note => {
        const btn = document.getElementById(`toggle-${note.noteId}`);
        const desc = document.getElementById(`desc-${note.noteId}`);

        btn.addEventListener("click", e => {
            e.stopPropagation(); // card click prevent
            if (desc.classList.contains("line-clamp-1")) {
                desc.classList.remove("line-clamp-1");
                btn.textContent = "Show Less";
            } else {
                desc.classList.add("line-clamp-1");
                btn.textContent = "Read More";
            }
        });
    });
}



const colors = [
    "bg-blue-50",
    "bg-pink-50",
    "bg-green-50",
    "bg-yellow-50",
    "bg-purple-50"
];

function openNote(noteId) {

    const popup = document.getElementById("popupCard");

    colors.forEach(color => popup.classList.remove(color));

    const randomColor =
        colors[Math.floor(Math.random() * colors.length)];

    popup.classList.add(randomColor);

    const note = allUserNotes.find(
        note => note.noteId === noteId
    );

    if (!note) return;

    document.getElementById("viewTitle").textContent =
        note.title;

    document.getElementById("viewDesc").textContent =
        note.desc;

    document.getElementById("viewDate").textContent =
        note.date;

    document
        .getElementById("viewNoteModal")
        .classList.remove("hidden");
}

function closeViewNote() {
    document
        .getElementById("viewNoteModal")
        .classList.add("hidden");
}

// Search logic start here


function handleSearch(e) {
    let value = typeof e === "string" ? e : e.target.value;

    console.log("Searching:", value);
    console.log("All Notes:", allUserNotes);

    value = value.toLowerCase().trim();

    const filtered = allUserNotes.filter(note =>
        note.title.toLowerCase().includes(value)
    );

    console.log("Filtered:", filtered);

    renderNotes(filtered);
}

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", handleSearch);


searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        handleSearch(e.target.value);
    }
});
window.addEventListener("load", () => {
    const searchInput = document.getElementById("searchInput");

    searchInput.addEventListener("input", handleSearch);

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            handleSearch(e);
        }
    });
});



// search logic end here


window.edit = function (noteId) {
    editId = noteId;

    const note = allUserNotes.find(n => n.noteId === noteId);

    if (!note) return;

    document.getElementById("noteTitle").value = note.title;
    document.getElementById("noteDesc").value = note.desc;

    document.getElementById("noteModal").classList.remove("hidden");

    document.getElementById("saveNoteBtn").textContent = "Update Note";
}


function attachEvents() {

    const addNoteBtn = document.getElementById("addNoteBtn");
    const noteModal = document.getElementById("noteModal");
    const saveNoteBtn = document.getElementById("saveNoteBtn");

    addNoteBtn.onclick = () => {
        noteModal.classList.remove("hidden");
    };

    saveNoteBtn.addEventListener("click", () => {

        const title = document.getElementById("noteTitle").value;
        const desc = document.getElementById("noteDesc").value;
        const username = localStorage.getItem("loggedUser");

        if (!title || !desc) {
            alert("Please fill all fields");
            return;
        }


        if (!username) {
            alert("Please login first");
            return;
        }

        let tx = db.transaction("notes", "readwrite");
        let store = tx.objectStore("notes");


        if (editId) {
            const note = allUserNotes.find(n => n.noteId === editId);
            note.title = title;
            note.desc = desc;
            store.put(note);
            editId = null;
        } else {
            const note = {
                username: username,
                title,
                desc,
                // date: new Date().toLocaleString()
                date: new Date().toISOString().split("T")[0]
            };
            store.add(note);

        }



        tx.oncomplete = () => {

            // ✔ clear inputs
            document.getElementById("noteTitle").value = "";
            document.getElementById("noteDesc").value = "";

            // ✔ hide popup
            noteModal.classList.add("hidden");

            // ✔ refresh notes
            loadNotes();
            // closeModal();
            document.getElementById("saveNoteBtn").textContent = "Save Note";
        };
    });
}

function deleteNote(id) {

    let tx = db.transaction("notes", "readwrite");
    let store = tx.objectStore("notes");

    // store.delete(id);
       let req = store.get(id);

    req.onsuccess = function () {
        let note = req.result;

        if (!note) return;

        note.isDeleted = true; // 👈 move to trash
        store.put(note);

    tx.oncomplete = () => {
        loadNotes();
    };
};
}

function edit(id) {
    const note = allUserNotes.find(n => n.id === id);

    if (!note) return;

    editingNoteId = id;

    document.getElementById("noteTitle").value = note.title;
    document.getElementById("noteDesc").value = note.desc;

    document.getElementById("noteModal").classList.remove("hidden");

    document.getElementById("saveBtn").textContent = "Update Note";
}


function closeModal() {
    document.getElementById("noteModal").classList.add("hidden");

    document.getElementById("noteTitle").value = "";
    document.getElementById("noteDesc").value = "";

    editingNoteId = null;

    document.getElementById("saveBtn").textContent = "Save Note";
}


//calender
document.addEventListener("DOMContentLoaded", () => {
    const calendarEl = document.getElementById("calendar");

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        height: "auto",
        events: [
            {
                title: "Project Deadline",
                start: "2026-06-15"
            },
            {
                title: "Meeting",
                start: "2026-06-20"
            }
        ]
    });

    calendar.render();
});

const calendarEl = document.getElementById("calendar");
document.getElementById("calendarBtn").addEventListener("click", () => {
document.getElementById("notesContainer").classList.add("hidden");
document.getElementById("welcomeTxt").classList.add("hidden");

document.getElementById("calendar").classList.remove("hidden");
 if (!calendarInitialized) {
        calendar.render();
        calendarInitialized = true;
    }

    setTimeout(() => {
         
        calendar.updateSize();
    }, 100);
});


document.addEventListener("DOMContentLoaded", () => {
    const calendarEl = document.getElementById("calendar");

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        height: "auto",
        events: []
    });

    calendar.render();
});

function updateCalendar(notes) {

    if (!calendar) return;

    const events = notes.map(note => {
        return {
            title: note.title,
            start: note.date // IMPORTANT: ISO format best hota hai
        };
    });

    calendar.removeAllEvents();
    calendar.addEventSource(events);
}
document.getElementById("closeCalendar").addEventListener("click", () => {
    calendarEl.classList.add("hidden");
});


// My notes

document.getElementById("myNotes").addEventListener("click", () => {
    currentView = "notes";
document.getElementById("notesContainer").classList.remove("hidden");
document.getElementById("welcomeTxt").classList.add("hidden");
// document.getElementById("trash").classList.add("hidden");
document.getElementById("calendar").classList.add("hidden");
loadNotes();
});

// trash functionality

function loadTrashNotes() {
    const username = localStorage.getItem("loggedUser");

    let tx = db.transaction("notes", "readonly");
    let store = tx.objectStore("notes");

    let req = store.getAll();

    req.onsuccess = function (e) {
        const allNotes = e.target.result;

        const trashNotes = allNotes.filter(
            n => n.username === username && n.isDeleted
        );

        renderTrash(trashNotes);
    };
}

function renderTrash(notes) {
    const container = document.getElementById("notesContainer");
    container.innerHTML = "";

    notes.forEach(note => {
        container.innerHTML += `
            <div class="w-60 bg-red-50 shadow-md rounded-2xl p-4 border">
                <h2 class="font-bold text-lg text-gray-800 mb-2">${note.title}</h2>
                 <hr class="mb-2 border-gray-300">
                <p class="text-sm text-gray-600 line-clamp-1">${note.desc}</p>

                <button onclick="restoreNote(${note.noteId})"
                    class="bg-green-500 hover:bg-green-300 border  text-white px-3 py-1 rounded-xl mt-2">
                    Restore
                </button>

                <button onclick="permanentDelete(${note.noteId})"
                    class="bg-red-600 hover:bg-red-500 text-white px-3 py-1 ml-10 rounded-xl mt-2">
                    Delete 
                </button>
            </div>


          

            
        `;
    });
     notes.forEach(note => {
        const btn = document.getElementById(`toggle-${note.noteId}`);
        const desc = document.getElementById(`desc-${note.noteId}`);

        btn.addEventListener("click", e => {
            e.stopPropagation(); // card click prevent
            if (desc.classList.contains("line-clamp-1")) {
                desc.classList.remove("line-clamp-1");
                btn.textContent = "Show Less";
            } else {
                desc.classList.add("line-clamp-1");
                btn.textContent = "Read More";
            }
        });
    });
    
}

function restoreNote(id) {
    let tx = db.transaction("notes", "readwrite");
    let store = tx.objectStore("notes");

    let req = store.get(id);

    req.onsuccess = function () {
        let note = req.result;
        note.isDeleted = false;

        store.put(note);

        tx.oncomplete = () => loadNotes();
    };
}

document.getElementById("trash").addEventListener("click", () => {
    loadTrashNotes();
});

function permanentDelete(id) {
    let tx = db.transaction("notes", "readwrite");
    let store = tx.objectStore("notes");

    store.delete(id);

    tx.oncomplete = () => loadTrashNotes();
}
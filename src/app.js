let allUserNotes = [];
let db;

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
            <div class="text-lg font-semibold text-gray-800">
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
    let tx = db.transaction("users", "readwrite");
    let store = tx.objectStore("users");
    store.add({
        id: Date.now(),
        username,
        password
    });
    tx.oncomplete = () => {
        alert("Signup successful!");

        // tx.oncomplete = () => {
        //     alert("Signup successful!");
        //     //sessionStorage.setItem("loggedUser", username); // temporary session
        //     updateUI();
        // };


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

        //     userNotes.forEach((note, index) => {
        //         const colors = [
        //         "bg-white",
        //         "bg-blue-50",
        //         "bg-pink-50",
        //         "bg-green-50",
        //         "bg-yellow-50"
        //         ];
        //         const bg = colors[index % colors.length];

        //     container.innerHTML += `
        //     <div class="w-60 ${bg} shadow-md rounded-2xl p-4 border border-gray-200 hover:shadow-xl transition-all duration-300">

        //     <h2 class="font-bold text-lg text-gray-800 mb-2">
        //         ${note.title}
        //     </h2>

        //     <!-- horizontal line -->
        //     <hr class="mb-2 border-gray-300">

        //     <p class="text-gray-600 text-sm mb-3">
        //         ${note.desc}
        //     </p>

        //     <div class="text-xs text-gray-400 mb-3">
        //         ${note.date}
        //     </div>

        //     <button onclick="deleteNote(${note.noteId})"
        //         class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded-lg transition">
        //         Delete
        //     </button>

        // </div>
        //         `;
        //     });
        renderNotes(allUserNotes);
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
        "bg-yellow-50"
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

            <p class="text-gray-600 text-sm mb-3">
                ${note.desc}
            </p>

            <div class="text-xs text-gray-400 mb-3">
                ${note.date}
            </div>

            <button onclick="event.stopPropagation(); deleteNote(${note.noteId})"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded-lg">
                Delete
            </button>

        </div>
        `;
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




// document.getElementById("searchInput").addEventListener("input", function (e) {
//     const value = e.target.value.toLowerCase().trim();

//     if (!value) {
//         renderNotes(allUserNotes);
//         return;
//     }

//     const filtered = allUserNotes.filter(note =>
//         note.title.toLowerCase().includes(value)
//     );

//     renderNotes(filtered);
// });


// search logic end here



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

        const note = {
            username: username,
            title,
            desc,
            date: new Date().toLocaleString()
        };

        store.add(note);

        tx.oncomplete = () => {

            // ✔ clear inputs
            document.getElementById("noteTitle").value = "";
            document.getElementById("noteDesc").value = "";

            // ✔ hide popup
            noteModal.classList.add("hidden");

            // ✔ refresh notes
            loadNotes();
        };
    });
}

function deleteNote(id) {

    let tx = db.transaction("notes", "readwrite");
    let store = tx.objectStore("notes");

    store.delete(id);

    tx.oncomplete = () => {
        loadNotes();
    };
}


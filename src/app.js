let db;

const request = indexedDB.open("MinoNotesDB", 1);

request.onupgradeneeded = function (e) {
    db = e.target.result;

    if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "id" });
    }
};

request.onsuccess = function (e) {
    db = e.target.result;

    checkUser();
};


function signup(username, password) {

    let tx = db.transaction("users", "readwrite");
    let store = tx.objectStore("users");

    store.put({
        id: 1,
        username: username,
        password: password
    });

    tx.oncomplete = () => {
        alert("Signup successful! Now login karo");
    };
}


function login(username, password) {

    let tx = db.transaction("users", "readonly");
    let store = tx.objectStore("users");

    let req = store.get(1);

    req.onsuccess = function () {
        const user = req.result;

        if (user && user.username === username && user.password === password) {

            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", username);

            alert("Login successful");

            updateUI();

        } else {
            alert("Invalid credentials");
        }
    };
}



function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");

    updateUI();
}


function checkUser() {
    updateUI();
}


function updateUI() {

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const username = localStorage.getItem("username");

    const userBox = document.getElementById("userBox");

    if (isLoggedIn) {

        userBox.innerHTML = `
            <div class="relative group flex items-center gap-2 cursor-pointer">

                <img class="w-8 h-8 rounded-full"
                     src="https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png">

                <span class="text-gray-700 font-medium">
                    ${username}
                </span>

                <span>▼</span>

                <div class="absolute top-full right-0 mt-2 w-40 bg-white shadow-lg rounded-xl
                            opacity-0 invisible group-hover:visible group-hover:opacity-100 transition">

                    <button onclick="logout()"
                        class="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500">
                        Logout
                    </button>

                </div>

            </div>
        `;

    } else {

        userBox.innerHTML = `
            <div class="flex gap-3">
                <button onclick="openLogin()" class="bg-blue-500 text-white px-4 py-1 rounded">Login</button>
                <button onclick="openSignup()" class="bg-gray-700 text-white px-4 py-1 rounded">Sign Up</button>
            </div>
        `;
    }
}


function openLogin() {
    const username = prompt("Enter username");
    const password = prompt("Enter password");

    login(username, password);
}

function openSignup() {
    const username = prompt("Choose username");
    const password = prompt("Choose password");

    signup(username, password);
}



  const userBtn = document.getElementById("userBtn");
  const dropdown = document.getElementById("dropdown");

  let open = false;

  userBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    open = !open;

    if (open) {
      dropdown.classList.remove("hidden");
    } else {
      dropdown.classList.add("hidden");
    }
  });

  // click outside → close dropdown
  document.addEventListener("click", () => {
    dropdown.classList.add("hidden");
    open = false;
  });

  // prevent dropdown from closing when clicking inside
  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

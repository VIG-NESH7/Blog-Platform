const API_URL = "http://localhost:5000/api";

let selectedPostId = null;

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(pageId).classList.add("active");

  if (pageId === "home") {
    getPosts();
  }
}

async function register() {
  const username = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, email, password })
  });

  alert("Registration successful");
  showPage("login");
}

async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    alert("Login successful");
    showPage("home");
  } else {
    alert("Invalid login");
  }
}

function logout() {
  localStorage.removeItem("token");
  alert("Logged out");
  showPage("login");
}

async function getPosts() {
  const res = await fetch(`${API_URL}/posts`);
  const posts = await res.json();

  const postsDiv = document.getElementById("posts");
  postsDiv.innerHTML = "";

  posts.forEach(post => {
    postsDiv.innerHTML += `
      <div class="post">
        <h3>${post.title}</h3>
        <p>${post.content.substring(0, 120)}...</p>
        <button onclick="viewPost('${post._id}')">Read More</button>
      </div>
    `;
  });
}

async function createPost() {
  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    return;
  }

  await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ title, content })
  });

  alert("Post created");
  document.getElementById("postTitle").value = "";
  document.getElementById("postContent").value = "";
  showPage("home");
}

async function viewPost(id) {
  selectedPostId = id;

  const res = await fetch(`${API_URL}/posts/${id}`);
  const post = await res.json();

  document.getElementById("postDetails").innerHTML = `
    <div class="post">
      <h2>${post.title}</h2>
      <p>${post.content}</p>
      <button class="delete-btn" onclick="deletePost()">Delete Post</button>
    </div>
  `;

  const commentsDiv = document.getElementById("comments");
  commentsDiv.innerHTML = "";

  post.comments?.forEach(comment => {
    commentsDiv.innerHTML += `
      <div class="comment">
        <p>${comment.text}</p>
      </div>
    `;
  });

  showPage("details");
}

async function addComment() {
  const text = document.getElementById("commentInput").value;
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login to comment");
    return;
  }

  await fetch(`${API_URL}/posts/${selectedPostId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ text })
  });

  document.getElementById("commentInput").value = "";
  viewPost(selectedPostId);
}

async function deletePost() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    return;
  }

  await fetch(`${API_URL}/posts/${selectedPostId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  alert("Post deleted");
  showPage("home");
}

getPosts();
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");
const commentForm = document.querySelector(".comment-form");
const commentList = document.getElementById("commentList");
const joinForm = document.getElementById("joinForm");
const joinMessage = document.getElementById("joinMessage");

const seedComments = [
  {
    name: "Ava",
    message: "The MVVM refactor checklist was super helpful. Thanks!",
    time: "2 hours ago",
  },
  {
    name: "Marcus",
    message: "Loved the Instruments breakdown. More performance tips please.",
    time: "1 day ago",
  },
];

const renderComments = () => {
  commentList.innerHTML = "";
  seedComments.forEach((comment) => {
    const item = document.createElement("div");
    item.className = "comment-item";
    item.innerHTML = `<strong>${comment.name}</strong><p>${comment.message}</p><span class="muted">${comment.time}</span>`;
    commentList.appendChild(item);
  });
};

const setActiveTab = (target) => {
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === target);
  });
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === target);
  });
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
});

commentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(commentForm);
  const name = formData.get("name").toString().trim();
  const message = formData.get("comment").toString().trim();

  if (!name || !message) {
    return;
  }

  seedComments.unshift({
    name,
    message,
    time: "Just now",
  });
  commentForm.reset();
  renderComments();
});

joinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(joinForm);
  const email = formData.get("email").toString().trim();

  if (!email) {
    joinMessage.textContent = "Please add a valid email address.";
    return;
  }

  joinMessage.textContent =
    "Thanks for joining! Check your inbox to confirm within 24 hours.";
  joinForm.reset();
});

renderComments();

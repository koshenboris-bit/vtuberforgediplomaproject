function escapeProfileHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let profileNewsActivity = { likedNews: [], savedNews: [], comments: [] };
let currentProfileNewsCollectionType = "saved";

function canSeeProfileNewsSaveCount() {
  return typeof isAdmin === "function" && isAdmin();
}

function renderProfileNewsCollection(items, emptyKey, type) {
  if (!items?.length) return `<div class="notice">${t(emptyKey)}</div>`;

  const icon = type === "saved" ? "fa-bookmark" : "fa-heart";
  const preview = items.slice(0, 3);

  return `
    <button class="profile-collection-btn" type="button" onclick="openProfileNewsCollection('${type}')">
      <span class="collection-stack" aria-hidden="true">
        ${preview.map((item, index) => {
          const view = localizeNews(item);
          return `<span style="--i:${index}"><i class="fa-regular fa-newspaper"></i>${escapeProfileHtml(view.title)}</span>`;
        }).join("")}
      </span>
      <span class="collection-open">
        <i class="fa-solid ${icon}"></i>
        ${type === "saved" ? t("profileOpenSavedNews") : t("profileOpenLikedNews")}
      </span>
    </button>
  `;
}

function renderProfileComments(comments) {
  return comments?.length
    ? comments.slice(0, 6).map(comment => `
      <div class="profile-comment-item">
        <strong>${escapeProfileHtml(comment.newsTitle || t("profileNewsComment"))}</strong>
        <p>${escapeProfileHtml(comment.content)}</p>
      </div>
    `).join("")
    : `<div class="notice">${t("profileNoNewsComments")}</div>`;
}

function renderProfileNewsActions(item) {
  const saveCount = canSeeProfileNewsSaveCount() ? `<span>${item.saveCount || 0}</span>` : "";

  return `
    <div class="news-actions">
      <button class="news-action ${item.likedByMe ? "active" : ""}" type="button" onclick="toggleProfileNewsLike(${item.id})" aria-label="${escapeProfileHtml(t("newsLike"))}">
        <i class="fa-${item.likedByMe ? "solid" : "regular"} fa-heart"></i>
        <span>${item.likeCount || 0}</span>
      </button>
      <button class="news-action ${item.savedByMe ? "active" : ""}" type="button" onclick="toggleProfileNewsSave(${item.id})" aria-label="${escapeProfileHtml(t("newsSave"))}">
        <i class="fa-${item.savedByMe ? "solid" : "regular"} fa-bookmark"></i>
        ${saveCount}
      </button>
      <span class="news-action muted-action" aria-label="${escapeProfileHtml(t("newsComments"))}">
        <i class="fa-regular fa-comment"></i>
        <span>${item.commentCount || 0}</span>
      </span>
    </div>
  `;
}

function renderProfileNewsCard(item, index, type) {
  const view = localizeNews(item);
  const normalized = {
    ...item,
    likedByMe: type === "liked" || Boolean(item.likedByMe),
    savedByMe: type === "saved" || Boolean(item.savedByMe),
  };

  return `
    <article class="news-card glass profile-news-card" data-news-id="${item.id}">
      <div class="news-card-content">
        <span class="news-date">${t("newsUpdate")} ${index + 1}</span>
        <h3>${escapeProfileHtml(view.title)}</h3>
        <p>${escapeProfileHtml(view.content || "")}</p>
        <div class="news-footer">
          <span>${t("newsBulletin")}</span>
          <span>${t("newsLive")}</span>
        </div>
        ${renderProfileNewsActions(normalized)}
      </div>
    </article>
  `;
}

async function loadProfileSummary() {
  const me = await apiRequest("/users/me");
  if (me?.error) {
    showToast(t("toastProfileError"), me.error, "warn");
    return;
  }

  const profileName = document.getElementById("profileName");
  const profileRole = document.getElementById("profileRole");
  const lastLesson = document.getElementById("lastLesson");
  const completedCount = document.getElementById("completedCount");
  const completedList = document.getElementById("completedList");

  if (!profileName || !profileRole || !lastLesson || !completedCount || !completedList) return;

  profileName.textContent = me.login;
  profileRole.textContent = me.role;
  lastLesson.textContent = me.lastLesson ? localizeLesson(me.lastLesson).title : t("profileNoCompleted");

  const lessons = await apiRequest("/lessons");
  const completed = (lessons || []).filter(item => item.passed);

  completedCount.textContent = String(completed.length);
  completedList.innerHTML = completed.length
    ? completed.map(item => `<span class="chip">${escapeProfileHtml(localizeLesson(item).title)}</span>`).join("")
    : `<div class="notice">${t("profileNoLessons")}</div>`;

  await loadProfileNewsActivity();
}

async function loadProfileNewsActivity() {
  const activity = await apiRequest("/users/me/news-activity");
  if (activity?.error) {
    showToast(t("toastProfileError"), activity.error, "warn");
    return;
  }

  const likedCount = document.getElementById("likedNewsCount");
  const savedCount = document.getElementById("savedNewsCount");
  const commentCount = document.getElementById("newsCommentCount");
  const likedList = document.getElementById("likedNewsList");
  const savedList = document.getElementById("savedNewsList");
  const commentsList = document.getElementById("profileNewsComments");

  if (likedCount) likedCount.textContent = String(activity.likedCount || 0);
  if (savedCount) savedCount.textContent = String(activity.savedCount || 0);
  if (commentCount) commentCount.textContent = String(activity.commentCount || 0);
  profileNewsActivity = activity || profileNewsActivity;
  if (likedList) likedList.innerHTML = renderProfileNewsCollection(activity.likedNews || [], "profileNoLikedNews", "liked");
  if (savedList) savedList.innerHTML = renderProfileNewsCollection(activity.savedNews || [], "profileNoSavedNews", "saved");
  if (commentsList) commentsList.innerHTML = renderProfileComments(activity.comments || []);
}

function openProfileNewsCollection(type) {
  currentProfileNewsCollectionType = type;
  const items = type === "saved" ? profileNewsActivity.savedNews || [] : profileNewsActivity.likedNews || [];
  const title = type === "saved" ? t("profileSavedNewsTitle") : t("profileLikedNewsTitle");
  const existing = document.getElementById("profileNewsModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "profileNewsModal";
  modal.className = "app-modal";
  modal.innerHTML = `
    <div class="app-modal-panel profile-collection-modal">
      <div class="app-modal-head">
        <div>
          <div class="news-date">${items.length} ${type === "saved" ? t("profileSavedNewsCount") : t("profileLikedNewsCount")}</div>
          <strong>${title}</strong>
        </div>
        <button class="modal-close" type="button" onclick="document.getElementById('profileNewsModal').remove()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body collection-list profile-news-card-list">
        ${items.length ? items.map((item, index) => renderProfileNewsCard(item, index, type)).join("") : `<div class="notice">${type === "saved" ? t("profileNoSavedNews") : t("profileNoLikedNews")}</div>`}
      </div>
    </div>
  `;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.remove();
  });
  document.body.appendChild(modal);
}

async function toggleProfileNewsLike(id) {
  const result = await apiRequest(`/news/${id}/like`, "POST");
  if (result?.error) return showToast(t("toastError"), result.error, "warn");
  showToast(result.active ? t("toastNewsLiked") : t("toastNewsUnliked"), "", "success");
  await loadProfileNewsActivity();
  if (document.getElementById("profileNewsModal")) openProfileNewsCollection(currentProfileNewsCollectionType);
}

async function toggleProfileNewsSave(id) {
  const result = await apiRequest(`/news/${id}/save`, "POST");
  if (result?.error) return showToast(t("toastError"), result.error, "warn");
  showToast(result.active ? t("toastNewsSaved") : t("toastNewsUnsaved"), "", "success");
  await loadProfileNewsActivity();
  if (document.getElementById("profileNewsModal")) openProfileNewsCollection(currentProfileNewsCollectionType);
}

window.addEventListener("vtuberforge:languagechange", () => {
  if (document.getElementById("profileName")) loadProfileSummary();
});

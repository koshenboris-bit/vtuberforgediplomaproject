function escapeProfileHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderProfileNewsList(items, emptyKey) {
  return items?.length
    ? items.slice(0, 6).map(item => {
      const view = localizeNews(item);
      return `<span class="chip news-chip"><i class="fa-regular fa-newspaper"></i>${escapeProfileHtml(view.title)}</span>`;
    }).join("")
    : `<div class="notice">${t(emptyKey)}</div>`;
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
  if (likedList) likedList.innerHTML = renderProfileNewsList(activity.likedNews || [], "profileNoLikedNews");
  if (savedList) savedList.innerHTML = renderProfileNewsList(activity.savedNews || [], "profileNoSavedNews");
  if (commentsList) commentsList.innerHTML = renderProfileComments(activity.comments || []);
}

window.addEventListener("vtuberforge:languagechange", () => {
  if (document.getElementById("profileName")) loadProfileSummary();
});

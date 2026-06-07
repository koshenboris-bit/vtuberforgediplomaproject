function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function canSeeNewsSaveCount() {
  return typeof isAdmin === "function" && isAdmin();
}

function renderNewsActions(item) {
  const saveCount = canSeeNewsSaveCount() ? `<span>${item.saveCount || 0}</span>` : "";

  return `
    <div class="news-actions">
      <button class="news-action ${item.likedByMe ? "active" : ""}" type="button" onclick="toggleNewsLike(${item.id})" aria-label="${escapeHtml(t("newsLike"))}">
        <i class="fa-${item.likedByMe ? "solid" : "regular"} fa-heart"></i>
        <span>${item.likeCount || 0}</span>
      </button>
      <button class="news-action ${item.savedByMe ? "active" : ""}" type="button" onclick="toggleNewsSave(${item.id})" aria-label="${escapeHtml(t("newsSave"))}">
        <i class="fa-${item.savedByMe ? "solid" : "regular"} fa-bookmark"></i>
        ${saveCount}
      </button>
      <button class="news-action muted-action" type="button" onclick="openNewsModal(${item.id})">
        <i class="fa-regular fa-comment"></i>
        <span>${item.commentCount || 0}</span>
      </button>
    </div>
  `;
}

function renderNewsCard(item, index, featured = false) {
  const view = localizeNews(item);
  return `
    <article class="news-card ${featured ? "news-card-featured" : ""} glass reveal" data-news-id="${item.id}">
      <div class="news-card-content">
        <span class="news-date">${featured ? t("featuredUpdate") : `${t("newsUpdate")} ${index + 1}`}</span>
        <h3>${escapeHtml(view.title)}</h3>
        <p>${escapeHtml(view.content)}</p>
        <div class="news-footer">
          <span>${t("newsBulletin")}</span>
          <span>${t("newsLive")}</span>
        </div>
        ${renderNewsActions(item)}
      </div>
    </article>
  `;
}

function openNewsModal(id) {
  const existing = document.getElementById("newsModal");
  if (existing) existing.remove();

  const data = window._newsCache || [];
  const item = data.find(n => n.id === id);
  if (!item) return;

  const comments = Array.isArray(item.comments) ? item.comments : [];
  const view = localizeNews(item);

  const modal = document.createElement("div");
  modal.id = "newsModal";
  modal.className = "app-modal";
  modal.innerHTML = `
    <div class="app-modal-panel news-modal-panel">
      <div class="app-modal-head">
        <div>
          <div class="news-date">${t("newsUpdate")}</div>
          <strong>${escapeHtml(view.title)}</strong>
        </div>
        <button class="modal-close" onclick="document.getElementById('newsModal').remove()" type="button"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <p class="modal-news-text">${escapeHtml(view.content)}</p>
        <div class="modal-comments">
          <div class="news-comments-head">
            <strong>${t("newsComments")}</strong>
            <span>${item.commentCount || comments.length || 0}</span>
          </div>
          ${comments.length
            ? comments.map(c => `
              <div class="news-comment" style="margin-bottom:0.75rem;">
                <div>
                  <strong>${escapeHtml(c.userLogin || "User")}</strong>
                  <small>${new Date(c.createdAt).toLocaleString()}</small>
                </div>
                <p>${escapeHtml(c.content)}</p>
              </div>
            `).join("")
            : `<div class="notice">${t("newsNoComments")}</div>`
          }
        </div>
      </div>
      <div class="app-modal-foot">
        <form class="news-comment-form" onsubmit="submitNewsComment(event, ${item.id})">
          <input
            id="commentInput-${item.id}"
            maxlength="1200"
            placeholder="${escapeHtml(t("newsCommentPlaceholder"))}" />
          <button class="btn btn-primary btn-sm" type="submit">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  `;

  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

async function loadNews() {
  const data = await apiRequest("/news");
  const news = Array.isArray(data) ? data : [];
  window._newsCache = news;

  const featured = document.getElementById("featuredNews");
  const list = document.getElementById("newsList");
  const adminList = document.getElementById("adminNewsList");

  if (featured) {
    featured.className = "news-featured-wrap";
    featured.innerHTML = news[0]
      ? renderNewsCard(news[0], 0, true)
      : `<div class="notice">${t("noNews")}</div>`;
  }

  if (list) {
    const items = news.slice(1);
    list.innerHTML = items.length
      ? items.map((item, index) => renderNewsCard(item, index + 1)).join("")
      : `<div class="notice">${t("noMoreNews")}</div>`;
  }

  if (adminList) {
    adminList.innerHTML = news.length
      ? news.map(item => `
        <div class="panel-item admin-list-item" data-search="${escapeHtml(`${localizeNews(item).title} ${localizeNews(item).content} #${item.id}`)}">
          <div class="admin-list-main">
            <div class="admin-list-meta">
              <span>${t("newsUpdate")}</span>
              <span>#${item.id}</span>
            </div>
            <strong>${escapeHtml(localizeNews(item).title)}</strong>
            <small>${escapeHtml(localizeNews(item).content)}</small>
          </div>
          <div class="panel-actions">
            <button class="btn btn-danger btn-sm" onclick="deleteNews(${item.id})"><i class="fa-solid fa-trash"></i> ${t("adminDelete")}</button>
          </div>
        </div>
      `).join("")
      : `<div class="notice">${t("adminNoNews")}</div>`;
    if (typeof updateAdminListCount === "function") updateAdminListCount("news", news.length);
    if (typeof filterAdminList === "function") filterAdminList("news");
  }
}

async function toggleNewsLike(id) {
  const result = await apiRequest(`/news/${id}/like`, "POST");
  if (result?.error) return showToast(t("toastError"), result.error, "warn");
  showToast(result.active ? t("toastNewsLiked") : t("toastNewsUnliked"), "", "success");
  await loadNews();
}

async function toggleNewsSave(id) {
  const result = await apiRequest(`/news/${id}/save`, "POST");
  if (result?.error) return showToast(t("toastError"), result.error, "warn");
  showToast(result.active ? t("toastNewsSaved") : t("toastNewsUnsaved"), "", "success");
  await loadNews();
}

async function submitNewsComment(event, id) {
  event.preventDefault();
  const input = document.getElementById(`commentInput-${id}`);
  const content = input?.value.trim();
  if (!content) return showToast(t("toastMissingData"), t("toastCommentEmpty"), "warn");

  const result = await apiRequest(`/news/${id}/comments`, "POST", { content });
  if (result?.error) return showToast(t("toastError"), result.error, "warn");
  showToast(t("toastCommentAdded"), "", "success");
  if (input) input.value = "";
  await loadNews();
  openNewsModal(id);
}

async function createNews() {
  const title = document.getElementById("newsTitle").value.trim();
  const content = document.getElementById("newsContent").value.trim();

  if (!title || !content) {
    return showToast(t("toastMissingData"), t("toastFillNews"), "warn");
  }

  const result = await apiRequest("/news", "POST", { title, content });
  if (result?.error) return showToast(t("toastError"), result.error, "warn");

  showToast(t("toastNewsCreated"), t("toastNewsAdded"), "success");
  document.getElementById("newsTitle").value = "";
  document.getElementById("newsContent").value = "";
  await loadNews();
}

async function deleteNews(id) {
  if (!confirm(t("confirmDeleteNews"))) return;
  const result = await apiRequest(`/news/${id}`, "DELETE");
  if (result?.error) return showToast(t("toastError"), result.error, "warn");
  showToast(t("toastNewsDeleted"), t("toastRemoved"), "success");
  await loadNews();
}

window.addEventListener("vtuberforge:languagechange", () => {
  if (document.getElementById("featuredNews") || document.getElementById("newsList") || document.getElementById("adminNewsList")) loadNews();
});

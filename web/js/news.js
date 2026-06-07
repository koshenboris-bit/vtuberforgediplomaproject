function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderNewsActions(item) {
  return `
    <div class="news-actions">
      <button class="news-action ${item.likedByMe ? "active" : ""}" type="button" onclick="toggleNewsLike(${item.id})" aria-label="${escapeHtml(t("newsLike"))}">
        <i class="fa-${item.likedByMe ? "solid" : "regular"} fa-heart"></i>
        <span>${item.likeCount || 0}</span>
      </button>
      <button class="news-action ${item.savedByMe ? "active" : ""}" type="button" onclick="toggleNewsSave(${item.id})" aria-label="${escapeHtml(t("newsSave"))}">
        <i class="fa-${item.savedByMe ? "solid" : "regular"} fa-bookmark"></i>
        <span>${item.saveCount || 0}</span>
      </button>
      <button class="news-action muted-action" type="button" onclick="openNewsModal(${item.id})">
        <i class="fa-regular fa-comment"></i>
        <span>${item.commentCount || 0}</span>
      </button>
    </div>
  `;
}

function renderNewsCard(item, index) {
  const view = localizeNews(item);
  return `
    <article class="news-card glass reveal" data-news-id="${item.id}" style="display:flex;flex-direction:column;">
      <div class="news-card-content" style="display:flex;flex-direction:column;flex:1;">
        <span class="news-date">${t("newsUpdate")} ${index + 1}</span>
        <h3 style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.8em;">${escapeHtml(view.title)}</h3>
        <p style="height:7em;overflow-y:auto;line-height:1.6;padding-right:4px;">${escapeHtml(view.content)}</p>
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
  modal.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:1rem;";
  modal.innerHTML = `
    <div style="background:var(--card-bg,#1a1a2e);border-radius:16px;width:100%;max-width:560px;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:1.25rem 1.25rem 0.75rem;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;">
        <div>
          <div class="news-date" style="margin-bottom:4px;">${t("newsUpdate")} —</div>
          <strong style="font-size:1rem;line-height:1.4;">${escapeHtml(view.title)}</strong>
        </div>
        <button onclick="document.getElementById('newsModal').remove()" style="background:none;border:none;cursor:pointer;font-size:1.25rem;color:inherit;opacity:0.6;flex-shrink:0;">✕</button>
      </div>
      <div style="padding:1rem 1.25rem;overflow-y:auto;flex:1;">
        <p style="line-height:1.7;margin-bottom:1.25rem;white-space:pre-wrap;">${escapeHtml(view.content)}</p>
        <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:1rem;">
          <div class="news-comments-head" style="margin-bottom:0.75rem;">
            <strong>${t("newsComments")}</strong>
            <span>${item.commentCount || comments.length || 0}</span>
          </div>
          ${comments.length
            ? comments.map(c => `
              <div class="news-comment" style="margin-bottom:0.75rem;">
                <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
                  <strong style="font-size:0.85rem;">${escapeHtml(c.userLogin || "User")}</strong>
                  <small style="opacity:0.5;">${new Date(c.createdAt).toLocaleString()}</small>
                </div>
                <p style="margin:0;font-size:0.9rem;opacity:0.85;">${escapeHtml(c.content)}</p>
              </div>
            `).join("")
            : `<div class="notice">${t("newsNoComments")}</div>`
          }
        </div>
      </div>
      <div style="padding:0.75rem 1.25rem;border-top:1px solid rgba(255,255,255,0.08);">
        <form style="display:flex;gap:8px;" onsubmit="submitNewsComment(event, ${item.id})">
          <input
            id="commentInput-${item.id}"
            maxlength="1200"
            style="flex:1;"
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
    featured.style.display = "contents";
    featured.innerHTML = news[0]
      ? renderNewsCard(news[0], 0)
      : `<div class="notice">${t("noNews")}</div>`;
  }

  if (list) {
    list.style.display = "contents";
    const items = news.slice(1);
    list.innerHTML = items.length
      ? items.map((item, index) => renderNewsCard(item, index + 1)).join("")
      : `<div class="notice">${t("noMoreNews")}</div>`;
  }

  if (adminList) {
    adminList.innerHTML = news.length
      ? news.map(item => `
        <div class="panel-item">
          <div>
            <strong>${escapeHtml(localizeNews(item).title)}</strong>
            <small>${escapeHtml(localizeNews(item).content)}</small>
          </div>
          <button class="btn btn-danger btn-sm" onclick="deleteNews(${item.id})">${t("adminDelete")}</button>
        </div>
      `).join("")
      : `<div class="notice">${t("adminNoNews")}</div>`;
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
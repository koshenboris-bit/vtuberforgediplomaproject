function lessonTypeLabel(type) {
  return type === "full" ? t("lessonFullCourse") : t("lessonIntro");
}

function lessonTypeClass(type) {
  return type === "full" ? "full" : "intro";
}

function escapeLessonHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// localizeLesson НЕ НУЖНА здесь — используется из i18n.js через window.localizeLesson

let lessonLibrary = [];

async function passLesson(lessonId) {
  const user = getStoredUser();
  if (!user?.id) {
    return showToast(t("toastNotLoggedIn"), t("toastSignInAgain"), "warn");
  }

  const result = await apiRequest(`/lessons/${lessonId}/pass/${user.id}`, "POST", null, { allowRefresh: true });
  if (result?.error) {
    return showToast(t("toastCantMark"), result.error, "warn");
  }

  showToast(t("toastCompleted"), t("toastLessonPassed"), "success");
  await loadLessons();
  if (typeof loadProfileSummary === "function") await loadProfileSummary();
}

function renderLessonCard(lesson) {
  const view = localizeLesson(lesson);
  const passed = !!lesson.passed;
  return `
    <article class="lesson-card glass reveal">
      <div class="lesson-top">
        <span class="badge ${lessonTypeClass(lesson.lessonType)}">${lessonTypeLabel(lesson.lessonType)}</span>
        ${passed ? `<span class="badge completed">${t("lessonCompleted")}</span>` : ""}
      </div>

      <h4 class="lesson-title">${view.title}</h4>
      <p>${view.description}</p>

      <div class="lesson-actions">
        <a class="btn btn-secondary btn-sm" href="${lesson.videoLink}" target="_blank" rel="noopener">
          ${t("lessonWatch")}
        </a>
        ${
          passed
            ? `<span class="lesson-progress">${t("lessonAlreadyCompleted")}</span>`
            : `<button class="btn btn-primary btn-sm" onclick="passLesson(${lesson.id})">${t("lessonMarkCompleted")}</button>`
        }
      </div>
    </article>
  `;
}

function lessonMatchesSearch(lesson, query) {
  if (!query) return true;
  const view = localizeLesson(lesson);
  const translationText = Object.values(lesson.translations || {})
    .flatMap(item => [item.title, item.description])
    .join(" ");

  const searchable = [
    view.title,
    view.description,
    lesson.title,
    lesson.description,
    translationText,
    lessonTypeLabel(lesson.lessonType),
    lesson.lessonType,
  ].join(" ").toLowerCase();

  return searchable.includes(query);
}

function renderLessons(lessons) {
  const introEl = document.getElementById("introLessons");
  const fullEl = document.getElementById("fullLessons");
  const searchEl = document.getElementById("lessonSearch");

  if (!introEl || !fullEl) return;

  const query = (searchEl?.value || "").trim().toLowerCase();
  const filteredLessons = lessons.filter(item => lessonMatchesSearch(item, query));
  const introLessons = filteredLessons.filter(item => item.lessonType === "intro");
  const fullLessons = filteredLessons.filter(item => item.lessonType === "full");
  const emptyMessage = query ? t("noSearchLessons") : null;

  introEl.innerHTML = introLessons.length
    ? introLessons.map(renderLessonCard).join("")
    : `<div class="notice">${emptyMessage || t("noIntroLessons")}</div>`;

  fullEl.innerHTML = fullLessons.length
    ? fullLessons.map(renderLessonCard).join("")
    : `<div class="notice">${emptyMessage || t("noFullLessons")}</div>`;
}

async function loadLessons() {
  const response = await apiRequest("/lessons");

  if (response?.error) {
    showToast(t("toastError"), response.error, "warn");
    return;
  }

  const lessons = Array.isArray(response) ? response : response.data || [];
  const searchEl = document.getElementById("lessonSearch");

  lessonLibrary = lessons;
  await ensureLessonsTranslation(lessonLibrary);
  renderLessons(lessonLibrary);

  if (searchEl && !searchEl.dataset.searchReady) {
    searchEl.dataset.searchReady = "true";
    searchEl.addEventListener("input", () => renderLessons(lessonLibrary));
  }
}

async function loadLessonsAdmin() {
  const data = await apiRequest("/lessons");
  if (data?.error) return [];

  const list = document.getElementById("adminLessonsList");
  if (!list) return data || [];

  await ensureLessonsTranslation(data || []);

  list.innerHTML = (data || []).map(item => `
    <div class="panel-item admin-list-item" data-search="${escapeLessonHtml(`${localizeLesson(item).title} ${localizeLesson(item).description} ${lessonTypeLabel(item.lessonType)} #${item.id}`)}">
      <div class="admin-list-main">
        <div class="admin-list-meta">
          <span class="badge ${lessonTypeClass(item.lessonType)}">${lessonTypeLabel(item.lessonType)}</span>
          <span>#${item.id}</span>
        </div>
        <strong>${localizeLesson(item).title}</strong>
        <small>${localizeLesson(item).description}</small>
      </div>
      <div class="panel-actions">
        <a class="btn btn-secondary btn-sm" href="${item.videoLink}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
        <button class="btn btn-danger btn-sm" onclick="deleteLesson(${item.id})"><i class="fa-solid fa-trash"></i> ${t("adminDelete")}</button>
      </div>
    </div>
  `).join("") || `<div class="notice">${t("adminNoLessons")}</div>`;
  if (typeof updateAdminListCount === "function") updateAdminListCount("lessons", (data || []).length);
  if (typeof filterAdminList === "function") filterAdminList("lessons");

  return data || [];
}

async function createLesson() {
  const title = document.getElementById("lessonTitle").value.trim();
  const description = document.getElementById("lessonDescription").value.trim();
  const lessonType = document.getElementById("lessonType").value;
  const videoLink = document.getElementById("lessonVideo").value.trim();

  if (!title || !description || !videoLink) {
    return showToast(t("toastMissingData"), t("toastFillLesson"), "warn");
  }

  const result = await apiRequest("/lessons", "POST", { title, description, lessonType, videoLink });
  if (result?.error) return showToast(t("toastError"), result.error, "warn");

  showToast(t("toastLessonCreated"), t("toastLessonAdded"), "success");
  document.getElementById("lessonTitle").value = "";
  document.getElementById("lessonDescription").value = "";
  document.getElementById("lessonVideo").value = "";

  await loadLessonsAdmin();
}

async function deleteLesson(id) {
  if (!confirm(t("confirmDeleteLesson"))) return;
  const result = await apiRequest(`/lessons/${id}`, "DELETE");
  if (result?.error) return showToast(t("toastError"), result.error, "warn");
  showToast(t("toastLessonDeleted"), t("toastRemoved"), "success");
  await loadLessonsAdmin();
  if (document.getElementById("introLessons")) await loadLessons();
}

window.addEventListener("vtuberforge:languagechange", () => {
  if (document.getElementById("introLessons")) {
    ensureLessonsTranslation(lessonLibrary).then(() => renderLessons(lessonLibrary));
  }
  if (document.getElementById("adminLessonsList")) loadLessonsAdmin();
});

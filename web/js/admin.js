async function initAdmin() {
  if (!isAdmin()) {
    return;
  }
  setupAdminListFilters();
  await loadLessonsAdmin();
  await loadNews();
}

const adminListExpanded = {
  lessons: false,
  news: false,
};

function setupAdminListFilters() {
  document.querySelectorAll("[data-admin-filter]").forEach(input => {
    if (input.dataset.filterReady) return;
    input.dataset.filterReady = "true";
    input.addEventListener("input", () => filterAdminList(input.dataset.adminFilter));
  });
}

function filterAdminList(type) {
  const input = document.querySelector(`[data-admin-filter="${type}"]`);
  const list = document.querySelector(`[data-admin-list="${type}"]`);
  const query = (input?.value || "").trim().toLowerCase();
  if (!list) return;

  list.classList.toggle("admin-list-expanded", Boolean(adminListExpanded[type]) || Boolean(query));
  list.querySelectorAll(".admin-list-item").forEach((item, index) => {
    const text = (item.dataset.search || item.textContent || "").toLowerCase();
    const matchesSearch = !query || text.includes(query);
    const visibleByCollapse = Boolean(adminListExpanded[type]) || Boolean(query) || index === 0;
    item.classList.toggle("hidden", !matchesSearch || !visibleByCollapse);
  });

  updateAdminCollapseButton(type);
}

function updateAdminListCount(type, count) {
  const target = document.getElementById(type === "lessons" ? "adminLessonsCount" : "adminNewsCount");
  if (target) target.textContent = String(count || 0);
}

function toggleAdminListCollapse(type) {
  adminListExpanded[type] = !adminListExpanded[type];
  filterAdminList(type);
}

function updateAdminCollapseButton(type) {
  const button = document.querySelector(`[data-admin-toggle="${type}"]`);
  const list = document.querySelector(`[data-admin-list="${type}"]`);
  if (!button || !list) return;

  const hasMore = list.querySelectorAll(".admin-list-item").length > 1;
  button.classList.toggle("hidden", !hasMore);
  button.classList.toggle("active", Boolean(adminListExpanded[type]));
  button.setAttribute("aria-expanded", String(Boolean(adminListExpanded[type])));
}

async function initAdmin() {
  if (!isAdmin()) {
    return;
  }
  setupAdminListFilters();
  await loadLessonsAdmin();
  await loadNews();
}

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

  list.querySelectorAll(".admin-list-item").forEach(item => {
    const text = (item.dataset.search || item.textContent || "").toLowerCase();
    item.classList.toggle("hidden", Boolean(query) && !text.includes(query));
  });
}

function updateAdminListCount(type, count) {
  const target = document.getElementById(type === "lessons" ? "adminLessonsCount" : "adminNewsCount");
  if (target) target.textContent = String(count || 0);
}

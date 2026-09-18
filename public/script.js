const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
let projects = [];
let activeFilter = "All";
let searchTerm = "";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
}[character]));
const tagsFor = (project) => Array.isArray(project.techStack) ? project.techStack : [];
const categoryFor = (project) => tagsFor(project)[0] || "Student work";
const accentFor = (project) => {
  const index = projects.findIndex((item) => item.id === project.id);
  return ["coral", "teal", "mustard"][index < 0 ? 0 : index % 3];
};
const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
};

async function loadProjects() {
  app.innerHTML = '<div class="status">Gathering the latest work...</div>';
  try {
    const response = await fetch("/api/projects");
    if (!response.ok) throw new Error("Could not load projects");
    projects = await response.json();
    render();
  } catch (error) {
    app.innerHTML = '<div class="status">The archive is taking a moment. <button class="button ghost" id="retry-load">Try again</button></div>';
    document.querySelector("#retry-load").addEventListener("click", loadProjects);
  }
}

function cardTemplate(project, index) {
  const tags = tagsFor(project);
  return `<a class="project-card" href="#/project/${encodeURIComponent(project.id)}" data-testid="card-project-${escapeHtml(project.id)}">
    <div class="project-cover ${accentFor(project)}"><span class="cover-number">${String(index + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}</span><span class="cover-stamp">${escapeHtml(project.title)}</span></div>
    <div class="card-body"><div class="card-top"><span>${escapeHtml(categoryFor(project))}</span><span>Entry ${String(index + 1).padStart(2, "0")}</span></div><h2>${escapeHtml(project.title)}</h2><p>${escapeHtml(project.description)}</p><div class="card-bottom"><span>${escapeHtml(tags.join(" · "))}</span><span class="arrow">↗</span></div></div>
  </a>`;
}

function homeView() {
  const categories = ["All", ...new Set(projects.map(categoryFor))];
  const visible = projects.filter((project) => {
    const matchesFilter = activeFilter === "All" || categoryFor(project) === activeFilter;
    const haystack = `${project.title} ${project.description} ${tagsFor(project).join(" ")}`.toLowerCase();
    return matchesFilter && haystack.includes(searchTerm.toLowerCase());
  });
  app.innerHTML = `<section class="hero"><div><div class="eyebrow">Vol. 01 / student work</div><h1>Small projects,<br><em>wide awake.</em></h1></div><div class="hero-copy"><strong>A living shelf for things made while learning.</strong><p>Open Desk is a considered collection of experiments, tools, and bright ideas made by students. Every project has a point of view.</p></div></section>
    <section class="toolbar"><div class="filters">${categories.map((category) => `<button class="filter ${category === activeFilter ? "active" : ""}" data-filter="${escapeHtml(category)}" data-testid="filter-${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}</div><input class="search" id="project-search" type="search" placeholder="Search the shelf" value="${escapeHtml(searchTerm)}" aria-label="Search projects" data-testid="input-project-search"></section>
    <section class="gallery" aria-label="Student projects">${visible.length ? visible.map((project) => cardTemplate(project, projects.indexOf(project))).join("") : '<div class="empty">Nothing on this shelf yet. Try another search.</div>'}</section>`;
  document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    homeView();
  }));
  document.querySelector("#project-search").addEventListener("input", (event) => {
    searchTerm = event.target.value;
    homeView();
    const input = document.querySelector("#project-search");
    input.focus();
    input.setSelectionRange(searchTerm.length, searchTerm.length);
  });
}

function detailView(project) {
  if (!project) {
    window.location.hash = "#/";
    return;
  }
  const tags = tagsFor(project);
  app.innerHTML = `<article class="detail"><a class="back-link" href="#/" data-testid="link-back-to-shelf">← Back to the shelf</a><div class="detail-head"><div class="detail-cover ${accentFor(project)}"><span class="cover-number">PROJECT / ${String(projects.indexOf(project) + 1).padStart(2, "0")}</span><span class="cover-stamp">${escapeHtml(project.title)}</span></div><div class="detail-info"><div class="eyebrow">${escapeHtml(categoryFor(project))} / submitted work</div><h1>${escapeHtml(project.title)}</h1><p class="description">${escapeHtml(project.description)}</p><div class="meta"><div><small>Made by</small><span>Student contributor</span></div><div><small>Filed as</small><span>${escapeHtml(categoryFor(project))}</span></div></div><div class="tags">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div><div class="actions"><a class="button" href="${escapeHtml(project.githubLink)}" target="_blank" rel="noopener" data-testid="link-open-project">Open repository ↗</a><button class="button danger" id="delete-project" data-testid="button-delete-project">Remove entry</button></div></div></div></article>`;
  document.querySelector("#delete-project").addEventListener("click", () => removeProject(project));
}

function addView() {
  app.innerHTML = `<section class="add-page"><div class="eyebrow">Add to the shelf</div><h1>What did you<br><em>make?</em></h1><form class="project-form" id="project-form"><div class="field full"><label for="title">Project title</label><input id="title" name="title" required placeholder="A name worth remembering" data-testid="input-project-title"></div><div class="field full"><label for="description">A short description</label><textarea id="description" name="description" required placeholder="What is it, and why did you make it?" data-testid="input-project-description"></textarea></div><div class="field"><label for="techStack">Built with</label><input id="techStack" name="techStack" required placeholder="HTML, CSS, JavaScript" data-testid="input-project-tech-stack"></div><div class="field"><label for="githubLink">Project repository</label><input id="githubLink" name="githubLink" type="url" required placeholder="https://github.com/you/project" data-testid="input-project-link"></div><div class="form-actions"><button class="button" type="submit" data-testid="button-submit-project">Place it on the shelf ↗</button><span class="form-note">You can always remove an entry later.</span></div></form></section>`;
  document.querySelector("#project-form").addEventListener("submit", submitProject);
}

async function submitProject(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "Saving...";
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not save project");
    projects.unshift(result);
    showToast("Your project is on the shelf.");
    window.location.hash = `#/project/${encodeURIComponent(result.id)}`;
  } catch (error) {
    button.disabled = false;
    button.textContent = "Place it on the shelf ↗";
    showToast(error.message);
  }
}

async function removeProject(project) {
  if (!window.confirm(`Remove "${project.title}" from the shelf?`)) return;
  try {
    const response = await fetch(`/api/projects/${encodeURIComponent(project.id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Could not remove project");
    projects = projects.filter((item) => item.id !== project.id);
    showToast("Entry removed from the shelf.");
    window.location.hash = "#/";
  } catch (error) {
    showToast("Could not remove this entry. Try again.");
  }
}

function render() {
  const [, route, id] = window.location.hash.split("/");
  if (route === "add") addView();
  else if (route === "project") detailView(projects.find((project) => String(project.id) === decodeURIComponent(id || "")));
  else homeView();
}

window.addEventListener("hashchange", render);
loadProjects();
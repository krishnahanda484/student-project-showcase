const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const dataFile = path.join(__dirname, "data", "projects.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readProjects() {
  const fileContents = fs.readFileSync(dataFile, "utf8");
  return JSON.parse(fileContents);
}

function saveProjects(projects) {
  fs.writeFileSync(dataFile, JSON.stringify(projects, null, 2) + "\n");
}

function cleanProject(body) {
  const techStack = Array.isArray(body.techStack)
    ? body.techStack
    : String(body.techStack || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return {
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    techStack: techStack.map((item) => String(item).trim()).filter(Boolean),
    githubLink: String(body.githubLink || "").trim(),
  };
}

app.get("/api/projects", (req, res) => {
  res.json(readProjects());
});

app.post("/api/projects", (req, res) => {
  const project = cleanProject(req.body);

  if (!project.title || !project.description || !project.techStack.length || !project.githubLink) {
    return res.status(400).json({
      error: "Please provide a title, description, tech stack, and GitHub link.",
    });
  }

  try {
    new URL(project.githubLink);
  } catch (error) {
    return res.status(400).json({ error: "Please provide a valid GitHub URL." });
  }

  const projects = readProjects();
  const newProject = {
    id: String(Date.now()),
    ...project,
  };

  projects.unshift(newProject);
  saveProjects(projects);
  res.status(201).json(newProject);
});

app.delete("/api/projects/:id", (req, res) => {
  const projects = readProjects();
  const nextProjects = projects.filter((project) => project.id !== req.params.id);

  if (nextProjects.length === projects.length) {
    return res.status(404).json({ error: "Project not found." });
  }

  saveProjects(nextProjects);
  res.json({ message: "Project deleted." });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Student Project Showcase is running on port ${port}`);
});
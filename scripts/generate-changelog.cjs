#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Определяем путь к CHANGELOG.md
const changelogPath = path.resolve(process.cwd(), "CHANGELOG.md");

// Получаем последний тег (релиз)
let lastTag = "";
try {
  lastTag = execSync("git describe --tags --abbrev=0").toString().trim();
} catch {
  /* ignore if no tags */
}

let log = "";
if (lastTag) {
  // Только коммиты после последнего тега
  log = execSync(
    `git log ${lastTag}..HEAD --pretty=format:"%h|%ad|%s" --date=short --no-merges`
  ).toString();
} else {
  // Все коммиты, если тегов нет
  log = execSync(
    'git log --pretty=format:"%h|%ad|%s" --date=short --no-merges'
  ).toString();
}

// Группируем по Conventional Commits
const types = {
  feat: "✨ Features",
  fix: "🐛 Bug Fixes",
  docs: "📝 Documentation",
  refactor: "🔨 Refactoring",
  chore: "🔧 Chores",
  test: "✅ Tests",
  style: "💄 Style",
  perf: "⚡ Performance",
  build: "📦 Build",
  ci: "🤖 CI",
};

const entries = log
  .split("\n")
  .map((line) => {
    const [hash, date, subject] = line.split("|");
    // Фильтруем коммиты без subject
    if (!subject || typeof subject !== "string" || !subject.trim()) return null;
    const match = subject.match(/^(\w+)(\(.+\))?:/);
    const type = match ? match[1] : "other";
    return { hash, date, subject, type };
  })
  .filter(Boolean);

// Группируем по типу
const grouped = {};
for (const entry of entries) {
  const group = types[entry.type] || "🔹 Other";
  if (!grouped[group]) grouped[group] = [];
  grouped[group].push(entry);
}

// Получаем текущую версию из package.json
let version = "";
try {
  const pkg = require(path.resolve(process.cwd(), "package.json"));
  version = pkg.version;
} catch {
  /* ignore if package.json not found */
}

const today = new Date().toISOString().slice(0, 10);

let changelog = `\n## v${version || ""} (${today})\n`;
for (const group of Object.keys(grouped)) {
  changelog += `\n### ${group}\n`;
  for (const entry of grouped[group]) {
    changelog += `- ${entry.subject} (${entry.hash}, ${entry.date})\n`;
  }
}

// Добавляем в начало CHANGELOG.md
let prev = "";
if (fs.existsSync(changelogPath)) {
  prev = fs.readFileSync(changelogPath, "utf8");
}
fs.writeFileSync(changelogPath, changelog + "\n" + prev);

console.log("CHANGELOG.md updated!");

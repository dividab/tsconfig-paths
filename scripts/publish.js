require("shelljs/global");

const versionPart = process.argv[2];
console.log(`Incrementing the ${versionPart} part of version in package.json...`);
const newVersion = incrementVersion(versionPart);
console.log(`New version is ${newVersion}, commiting rules, package.json...`);
commit(newVersion);
console.log(`Tagging with ${newVersion}...`);
gitTag(newVersion);
console.log(`Pushing...`);
push();
console.log(`Publishing to npm...`);
publish();
console.log(`Publish of new ${versionPart} versioned ${newVersion} completed successfully`);

function publish() {
  if (exec(`npm publish`).code !== 0) {
    echo("Error: Npm publish failed");
    exit(1);
  }
}

function push() {
  if (exec(`git push --follow-tags`).code !== 0) {
    echo("Error: Git push failed");
    exit(1);
  }
}

function commit(newVersion) {
  const cmd1 = `git add rules/`;
  console.log(cmd1);
  if (exec(cmd1).code !== 0) {
    echo("Error: Git commit failed");
    exit(1);
  }
  const cmd2 = `git commit package.json rules/ -m "New version ${newVersion}"`;
  console.log(cmd2);
  if (exec(cmd2).code !== 0) {
    echo("Error: Git commit failed");
    exit(1);
  }
}

function gitTag(newVersion) {
  if (exec(`git tag -a ${newVersion} -m "version ${newVersion}"`).code !== 0) {
    echo("Error: Git tag failed");
    exit(1);
  }
}

function incrementVersion(partToIncrement) {
  const fs = require("fs");
  const packageJson = JSON.parse(fs.readFileSync("package.json"));
  const parts = packageJson.version.split(".");
  if (partToIncrement === "major") {
    parts[0]++;
    parts[1] = 0;
    parts[2] = 0;
  }
  else if (partToIncrement === "minor") {
    parts[1]++;
    parts[2] = 0;
  }
  else if (partToIncrement === "patch") {
    parts[2]++;
  }
  else {
    console.log("Please specify which part to increment");
    return;
  }
  packageJson.version = parts.join(".");
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  return packageJson.version;
}


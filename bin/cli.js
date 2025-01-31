#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const projectName = process.argv[2];
const currentDir = process.cwd();
const projectDir = path.join(currentDir, projectName);

if (process.argv.length < 3) {
  console.log("You have to provide a name to your app.");
  console.log("For example :");
  console.log("    npx @wuchuheng/nextjs my-app");
  process.exit(1);
}

async function main() {
  try {
    // 2. Handling logic.
    // 2.1 Copy project files.
    console.log("Copying project files...");
    await copyDir(path.join(__dirname, "../template"), projectDir);

    execSync(`ls -ahl ${projectDir}`, { stdio: "inherit" });

    execSync(`ls -ahl ${projectDir}/template`, { stdio: "inherit" });

    // 2.1.1 List of the files in the project directory.
    execSync(`cd ${projectDir} && pwd && ls -ahl`, { stdio: "inherit" });

    console.log("Installing dependencies...");

    installAndBuild(projectDir);

    console.log("The installation is done!");
    console.log(`Done. Now run:`);

    console.log(`\x1b[1m\x1b[32m
cd ${projectName}
pnpm install
pnpm dev \x1b[0m
`);
  } catch (error) {
    console.error("An error occurred:", error.message);
    process.exit(1);
  }
}

// Helper function to copy directory recursively
function copyDir(src, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dest, { recursive: true }, (err) => {
      if (err) return reject(err);

      fs.readdir(src, { withFileTypes: true }, (err, entries) => {
        if (err) return reject(err);

        let completed = 0;
        if (entries.length === 0) resolve();

        entries.forEach((entry) => {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);

          if (entry.isDirectory()) {
            copyDir(srcPath, destPath)
              .then(() => {
                if (++completed === entries.length) resolve();
              })
              .catch(reject);
          } else {
            fs.copyFile(srcPath, destPath, (err) => {
              if (err) return reject(err);
              if (++completed === entries.length) resolve();
            });
          }
        });
      });
    });
  });
}

function installAndBuild(projectDir) {
  // 1. Handle input.
  // 1.1 Validate project directory.
  if (!projectDir) {
    throw new Error("Project directory is required.");
  }

  // 2. Handling logic.
  // 2.1 Install dependencies.
  console.log("Installing dependencies...");
  execSync(`cd ${projectDir} && pnpm install`, { stdio: "inherit" });

  execSync(`cd ${projectDir} && pwd && ls -ahl`, { stdio: "inherit" });

  // 2.2 Build the project.
  console.log("Building the project...");
  execSync(`cd ${projectDir} && pnpm build`, { stdio: "inherit" });

  // 3. Return result.
  console.log("Project built successfully.");
}

main();

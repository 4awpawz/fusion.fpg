#!/usr/bin/env node
import fs from "fs-extra";
import columnify from "columnify";
import path from "path";
import chalk from "chalk";
import { projectGenerator } from "../index.js";
import fileDirName from "../lib/fileDirName.js";

const descriptions = {
    [`${chalk.red("    -v | --version")}`]: "\tDisplays the version.",
    [`${chalk.red("    -h | --help")}`]: "\tDisplays this help screen.",
    [`${chalk.red("    n | new")} <${chalk.green("target_folder")}>`]: `Creates a new fusion.ssg project in the ${chalk.green("target_folder")} along with all its dependencies.\nThis command will fail if a folder of the same name as ${chalk.green("target_folder")} already exists\nin the current folder.`
};

const columns = columnify(descriptions, {
    showHeaders: false,
    preserveNewLines: true,
    minWidth: 30,
    maxWidth: 100
});

const help = function() {
    console.log(`${chalk.red("fpg")} - fusion.ssg project generator`);
    console.log("");
    console.log(chalk.red("SYNOPSIS"));
    console.log(`    ${chalk.red("fpg -v | --version")} `);
    console.log(`    ${chalk.red("fpg -h | --help")} `);
    console.log(`    ${chalk.red("fpg n | new")} <${chalk.green("target_folder")}>`);
    console.log("");
    console.log(chalk.red("DESCRIPTION"));
    console.log(columns);
    console.log("");
};

// version

if (process.argv.length === 3 && typeof process.argv[2] === "string" && ["-v", "--version"].includes(process.argv[2])) {
    const { __dirname } = fileDirName(import.meta);
    try {
        const version = (await fs.readJson(path.join(__dirname, "..", "..", "package.json"))).version;
        console.log(chalk.blueBright(`v${version} `));
        process.exit();
    } catch (error) {
        console.error(chalk.red(`Error: reading fpg:: package.json!`));
        process.exit();
    }
}

// help

if (process.argv.length === 2 || process.argv.length === 3
    && typeof process.argv[2] === "string" && ["-h", "--help"].includes(process.argv[2])) {
    help();
    process.exit();
}

// new

const isTargetFolderValid = function(): boolean {
    return process.argv.length === 3 && typeof process.argv[2] === "string" && process.argv[2].startsWith("n") || process.argv[2]?.startsWith("new") as boolean;
};

// Guard against target folder not being valid.
if (!isTargetFolderValid) {
    help();
    process.exit();
}
const targetFolder: string = (process.argv[3] as string);
console.log("target_folder", targetFolder);

// Guard against target folder being blank.
if (typeof targetFolder === "undefined" || targetFolder === "") {
    console.error(chalk.red(`Error: target folder cannot be blank!`));
    help();
    process.exit();
}

await projectGenerator(targetFolder);

import Generator, { BaseOptions } from "yeoman-generator";

type Arguments = {
  "project-name": string;
  author: string;
} & BaseOptions;

export default class YOTestGenerator extends Generator<Arguments> {
  projectName: string;
  author: string;
  newDirectory: boolean;

  constructor(args, opts: Arguments) {
    super(args, opts);

    this.argument("project-name", {
      type: String,
      required: false,
      default: "",
      description: "Project Name",
    });

    this.argument("author", {
      type: String,
      required: false,
      default: "",
      description: "Author",
    });

    this.option("type", {
      type: String,
      required: false,
      default: "node",
      description: "Project Type",
    });
  }

  async prompting() {
    const projectNameKey = "project-name";
    const prompts = [];
    if (!this.options[projectNameKey]) {
      prompts.push({
        type: "input",
        name: projectNameKey,
        message: "Please Type Your Project Name:",
      });
    }

    const authorKey = "author";
    if (!this.options[authorKey]) {
      prompts.push({
        type: "input",
        name: authorKey,
        message: "Please Type Author:",
      });
    }

    prompts.push({
      type: "confirm",
      name: "new-directory",
      message: "Want to create a new directory to be your directory?",
      default: false,
    });

    const results = await this.prompt(prompts);

    if (this.options[projectNameKey] === "") {
      this.projectName = results[projectNameKey];
    } else {
      this.projectName = this.options[projectNameKey];
    }

    if (this.options[authorKey] === "") {
      this.author = results[projectNameKey];
    } else {
      this.author = this.options[projectNameKey];
    }

    this.newDirectory = results["new-directory"];
    this.log(this.newDirectory);
    if (!this.projectName) {
      this.log("Project Name is required");
      throw Error("Project Name is required");
    }
  }

  async writing() {
    const packageJsonPath = this.destinationPath(
      `${this.newDirectory ? this.projectName : "."}/package.json`
    );

    this.log(`Writing Project: ${packageJsonPath}`);

    if (this.fs.exists(packageJsonPath)) {
      this.log(`Path Already Exist~ ${packageJsonPath}`);
      throw Error("Path Already Exist~");
    }

    // copy package.json file
    this.fs.copyTpl(this.templatePath('package-templ.ejs'), this._getPath('package.json'), {
      projectName: this.projectName
    })

    // copy tsconfig file
    this.fs.copy(
      this.templatePath("tsconfig-templ.json"),
      this._getPath('tsconfig.json')
    );

    // copy vscode debugger config
    this.fs.copy(
      this.templatePath("vscode-launch-templ.json"),
      this._getPath('.vscode/launch.json')
    );

    // copy index.ts file
    this.fs.copy(
      this.templatePath("index-templ.ts"),
      this._getPath('src/index.ts')
    );

    // 写入 index.d.ts file
    this.fs.write(this._getPath('types/index.d.ts'), '');

    // copy gitignore file
    this.fs.copy(
      this.templatePath(".gitignore"),
      this._getPath('.gitignore')
    );

    // copy npmrc file
    this.fs.copy(
      this.templatePath(".npmrc"),
      this._getPath('.npmrc')
    );

    // copy obfuscator.js file
    this.fs.copy(
      this.templatePath("obfuscator-templ.js"),
      this._getPath('obfuscator.js')
    );
  }

  async install() {
    this.spawnSync(`git`, [
      "init",
      this._getPath(),
    ]);
    this.spawnSync(`pnpm`, [
      "install",
      "--prefix",
      this._getPath(),
      "-D",
      "nodemon",
      "ts-node",
      "tsconfig-paths",
      "javascript-obfuscator",
      "@types/node",
    ]);
  }

  async end() {
    this.log('Project Created~')
  }

  _getPath(name?: string) {
    return this.destinationPath(`${this.newDirectory ? this.projectName : "."}/${name || ''}`)
  }
}

'use strict';
const Generators = require('yeoman-generator');
const utils = require('../utils');
const prompts = require('./prompts');
const path = require('path');
const fs = require('fs');
const packageInfo = require('../package.json');

const baseRootPath = path.resolve('../template');

class AppGenerator extends Generators.Base {
  constructor(args, options) {

    super(args, options);

    // Make options available
    this.option('skip-welcome-message', {
      desc: 'Skip the welcome message',
      type: Boolean,
      defaults: false
    });
    this.option('skip-install');

    // Use our plain template as source
    this.sourceRoot(baseRootPath);

    this.config.save();
  }

  initializing() {

    if(!this.options['skip-welcome-message']) {
      this.log(require('yeoman-welcome'));
      this.log('React全栈脚手架，前端:React/Redux/React-Router，服务端:express/artTemplate/服务端渲染.\n');
    }
  }

  prompting() {

    return this.prompt(prompts).then((answers) => {

      // Make sure to get the correct app name if it is not the default
      if(answers.appName !== utils.yeoman.getAppName()) {
        answers.appName = utils.yeoman.getAppName(answers.appName);
      }

      // Set needed global vars for yo
      this.appName = answers.appName;
      this.generatedWithVersion = parseInt(packageInfo.version.split('.').shift(), 10);

      // Set needed keys into config
      this.config.set('appName', this.appName);
      this.config.set('appPath', this.appPath);
      this.config.set('generatedWithVersion', this.generatedWithVersion);
    });
  }

  configuring() {

    // Generate our package.json. Make sure to also include the required dependencies for styles
    let defaultSettings = this.fs.readJSON(`${baseRootPath}/package.json`);
    let packageSettings = {
      name: this.appName,
      version: '0.0.1',
      description: `${this.appName} - Generated by generator-react-webpack`,
      scripts: defaultSettings.scripts,
      repository: '',
      keywords: [
        'React',
        'Redux',
        'React-Router',
        'express',
        'artTemplate',
        'es6'
      ],
      author: 'Your name here',
      devDependencies: defaultSettings.devDependencies,
      dependencies: defaultSettings.dependencies
    };

    this.fs.writeJSON(this.destinationPath('package.json'), packageSettings);
  }

  writing() {

    const excludeList = [
      'LICENSE',
      'README.md',
      'CHANGELOG.md',
      'node_modules',
      'package.json',
      '.istanbul.yml',
      '.travis.yml',
      '.DS_Store',
      '.idea'
    ];

    // Get all files in our repo and copy the ones we should
    fs.readdir(this.sourceRoot(), (err, items) => {

      for(let item of items) {

        // Skip the item if it is in our exclude list
        if(excludeList.indexOf(item) !== -1) {
          continue;
        }

        // Copy all items to our root
        let fullPath = path.join(baseRootPath, item);
        if(fs.lstatSync(fullPath).isDirectory()) {
          this.bulkDirectory(item, item);
        } else {
          if (item === '.npmignore') {
            this.copy(item, '.gitignore');
          } else {
            this.copy(item, item);
          }
        }
      }
    });
  }

  install() {
    if(!this.options['skip-install']) {
      this.installDependencies({ bower: false });
    }
  }
}

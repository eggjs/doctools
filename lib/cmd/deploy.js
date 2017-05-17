'use strict';

const path = require('path');
const runscript = require('runscript');
const ghpages = require('gh-pages');

const BuildCommand = require('./build');

// The branch that pushing document
const BRANCH = 'gh-pages';
const DOC_PUBLISHER_NAME = 'Auto Doc Publisher';
const DOC_PUBLISHER_EMAIL = 'docs@eggjs.org';

class DeployCommand extends BuildCommand {

  * run(ctx) {
    yield super.run(ctx);
    yield this.githubDeploy(ctx.argv);
  }

  * githubDeploy({ targetDir, baseDir }) {
    let repo = yield runscript('git config remote.origin.url', { stdio: 'pipe', cwd: baseDir });
    repo = repo.stdout.toString().slice(0, -1);
    if (/^http/.test(repo)) {
      repo = repo.replace('https://github.com/', 'git@github.com:');
    }
    const publishDir = path.join(targetDir, 'public');
    this.logger.info('publish %s from %s to gh-pages', repo, targetDir);
    yield publish(publishDir, {
      logger(message) { console.log(message); },
      user: {
        name: DOC_PUBLISHER_NAME,
        email: DOC_PUBLISHER_EMAIL,
      },
      branch: BRANCH,
      repo,
    });
  }

  get description() {
    return 'Build and deploy document';
  }
}

module.exports = DeployCommand;

function publish(basePath, options) {
  return done => ghpages.publish(basePath, options, done);
}

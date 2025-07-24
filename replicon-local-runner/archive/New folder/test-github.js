// test-github.js
const dotenv = require('dotenv');
dotenv.config();

(async () => {
  try {
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser();
    const repoNames = repos.map(repo => repo.name);

    console.log(JSON.stringify({
      output: `✅ GitHub authenticated.\nAccessible repos:\n- ${repoNames.join('\n- ')}`
    }));

  } catch (error) {
    console.error(JSON.stringify({
      output: `❌ GitHub error:\n${error.message}`
    }));
  }
})();

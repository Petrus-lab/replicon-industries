module.exports = async function testGitHub(token) {
  try {
    const { Octokit } = await import('octokit');
    const octokit = new Octokit({ auth: token });
    const result = await octokit.request('GET /user');
    return { status: 'success', login: result.data.login };
  } catch (error) {
    return { status: 'error', message: 'GitHub test failed.', error: error.message };
  }
};
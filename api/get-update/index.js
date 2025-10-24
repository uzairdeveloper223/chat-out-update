export default async function handler(req, res) {
  const { current_version } = req.query;

  if (!current_version) {
    return res.status(400).json({ error: 'current_version required' });
  }

  const owner = process.env.GITHUB_OWNER || 'your-github-username';
  const repo = process.env.GITHUB_REPO || 'chat-out-update';

  try {
    // Fetch latest version from repo
    const latestVersionRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/latest_version.txt`);
    if (!latestVersionRes.ok) {
      throw new Error('Failed to fetch latest version');
    }
    const latestVersion = (await latestVersionRes.text()).trim();

    if (current_version === latestVersion) {
      return res.status(200).send('63887');
    }

    // Fetch changelog
    const changelogRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/changelog_${latestVersion}.txt`);
    let changelog = 'No changelog available';
    if (changelogRes.ok) {
      changelog = await changelogRes.text();
    }

    // APK download URL
    const downloadUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/chatout_${latestVersion}.apk`;

    res.status(200).json({
      status: 'update_available',
      download_url: downloadUrl,
      changelog: changelog
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

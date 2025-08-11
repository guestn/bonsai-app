import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../button';
import { GitHubPhotoService } from '../../../services/github-photo-service';
import styles from './github-config.module.scss';

interface GitHubConfigProps {
  onConfigSaved: () => void;
}

export const GitHubConfig: FC<GitHubConfigProps> = ({ onConfigSaved }) => {
  const { t } = useTranslation();
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [token, setToken] = useState('');
  const [issueNumber, setIssueNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!owner || !repo || !token || !issueNumber) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Initialize the GitHub Photo Service
      GitHubPhotoService.initialize({
        owner,
        repo,
        token,
        issueNumber: parseInt(issueNumber, 10),
      });

      // Test the configuration by trying to access the issue
      const testUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
      const response = await fetch(testUrl, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(
          'Failed to access GitHub issue. Please check your configuration.',
        );
      }

      // Save to localStorage
      localStorage.setItem(
        'githubPhotoConfig',
        JSON.stringify({
          owner,
          repo,
          token,
          issueNumber: parseInt(issueNumber, 10),
        }),
      );

      onConfigSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSaved = () => {
    const saved = localStorage.getItem('githubPhotoConfig');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setOwner(config.owner || '');
        setRepo(config.repo || '');
        setToken(config.token || '');
        setIssueNumber(config.issueNumber?.toString() || '');
      } catch {
        // Ignore invalid saved config
      }
    }
  };

  // Load saved config on mount
  useEffect(() => {
    handleLoadSaved();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>
          {t('GITHUB_CONFIG.TITLE') || 'GitHub Photo Storage Configuration'}
        </h3>
        <p className={styles.description}>
          {t('GITHUB_CONFIG.DESCRIPTION') ||
            'Configure GitHub to store your bonsai photos for free. Photos will be uploaded to a GitHub issue.'}
        </p>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="owner">GitHub Username or Organization</label>
          <input
            id="owner"
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="your-username"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="repo">Repository Name</label>
          <input
            id="repo"
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="bonsai-photos"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="token">GitHub Personal Access Token</label>
          <input
            id="token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxx"
            className={styles.input}
          />
          <small className={styles.help}>
            Create a token with 'repo' permissions at{' '}
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Settings
            </a>
          </small>
        </div>

        <div className={styles.field}>
          <label htmlFor="issueNumber">Issue Number</label>
          <input
            id="issueNumber"
            type="number"
            value={issueNumber}
            onChange={(e) => setIssueNumber(e.target.value)}
            placeholder="1"
            className={styles.input}
          />
          <small className={styles.help}>
            Create a new issue in your repository and use its number here
          </small>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <Button
            onPress={handleSave}
            variant="primary"
            isDisabled={isLoading}
            className={styles.saveButton}
          >
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      <div className={styles.instructions}>
        <h4>Setup Instructions:</h4>
        <ol>
          <li>Create a new repository on GitHub (e.g., "bonsai-photos")</li>
          <li>Create a new issue in the repository</li>
          <li>Generate a Personal Access Token with 'repo' permissions</li>
          <li>Fill in the configuration above</li>
          <li>Click "Save Configuration"</li>
        </ol>
      </div>
    </div>
  );
};

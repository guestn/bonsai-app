import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, Label } from 'react-aria-components';
import { Button } from '../button';
import { GoogleDrivePhotoService } from '../../../services/google-drive-photo-service';
import styles from './google-drive-config.module.scss';

interface GoogleDriveConfigProps {
  onConfigSaved: () => void;
}

export const GoogleDriveConfig: FC<GoogleDriveConfigProps> = ({
  onConfigSaved,
}) => {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [folderId, setFolderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSave = async () => {
    if (!apiKey || !clientId || !folderId) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Initialize the Google Drive Photo Service
      GoogleDrivePhotoService.initialize({
        apiKey,
        clientId,
        folderId,
      });

      // Test authentication
      const authSuccess = await GoogleDrivePhotoService.authenticate();
      if (!authSuccess) {
        throw new Error('Failed to authenticate with Google Drive');
      }

      setIsAuthenticated(true);

      // Save to localStorage
      localStorage.setItem(
        'googleDrivePhotoConfig',
        JSON.stringify({
          apiKey,
          clientId,
          folderId,
        }),
      );

      onConfigSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAuth = async () => {
    if (!GoogleDrivePhotoService.isConfigured()) {
      setError('Please save configuration first');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const authSuccess = await GoogleDrivePhotoService.authenticate();
      if (authSuccess) {
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSaved = () => {
    const saved = localStorage.getItem('googleDrivePhotoConfig');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setApiKey(config.apiKey || '');
        setClientId(config.clientId || '');
        setFolderId(config.folderId || '');

        // Check if service is already configured
        if (GoogleDrivePhotoService.isConfigured()) {
          setIsAuthenticated(GoogleDrivePhotoService.isAuthenticated());
        }
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
          {t('GOOGLE_DRIVE_CONFIG.TITLE') ||
            'Google Drive Photo Storage Configuration'}
        </h3>
        <p className={styles.description}>
          {t('GOOGLE_DRIVE_CONFIG.DESCRIPTION') ||
            'Configure Google Drive to store your bonsai photos. Photos will be uploaded to a specific folder and made publicly viewable.'}
        </p>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <TextField
            value={apiKey}
            onChange={setApiKey}
            className={styles.input}
          >
            <Label>Google Cloud API Key</Label>
            <input type="password" placeholder="AIzaSy..." />
          </TextField>
          <small className={styles.help}>
            Get this from{' '}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Cloud Console
            </a>
          </small>
        </div>

        <div className={styles.field}>
          <TextField
            value={clientId}
            onChange={setClientId}
            className={styles.input}
          >
            <Label>OAuth 2.0 Client ID</Label>
            <input placeholder="123456789-abc123.apps.googleusercontent.com" />
          </TextField>
          <small className={styles.help}>
            Create OAuth 2.0 credentials in Google Cloud Console
          </small>
        </div>

        <div className={styles.field}>
          <TextField
            value={folderId}
            onChange={setFolderId}
            className={styles.input}
          >
            <Label>Google Drive Folder ID</Label>
            <input placeholder="1ABC123DEF456GHI789" />
          </TextField>
          <small className={styles.help}>
            Right-click on a Google Drive folder → "Get link" → Copy the ID from
            the URL
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

          {GoogleDrivePhotoService.isConfigured() && (
            <Button
              onPress={handleTestAuth}
              variant="secondary"
              isDisabled={isLoading}
              className={styles.testButton}
            >
              Test Authentication
            </Button>
          )}
        </div>

        {isAuthenticated && (
          <div className={styles.success}>
            ✅ Successfully authenticated with Google Drive!
          </div>
        )}
      </div>

      <div className={styles.instructions}>
        <h4>Setup Instructions:</h4>
        <ol>
          <li>
            Go to{' '}
            <a
              href="https://console.cloud.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Cloud Console
            </a>
          </li>
          <li>Create a new project or select existing one</li>
          <li>Enable the Google Drive API</li>
          <li>Create OAuth 2.0 credentials (Web application type)</li>
          <li>Add your domain to authorized origins</li>
          <li>Create a folder in Google Drive for bonsai photos</li>
          <li>Get the folder ID from the sharing link</li>
          <li>Fill in the configuration above</li>
          <li>Click "Save Configuration" and authenticate</li>
        </ol>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, Trash2, Check, X, AlertCircle, Key, RefreshCw } from 'lucide-react';
import { apiKeysService, API_PROVIDERS, StoredApiKey, ApiKeyData } from '../../services/apiKeysService';
import { ApiConnectionStatus } from './ApiConnectionStatus';

interface ApiKeyFormData {
  [provider: string]: {
    [keyName: string]: {
      value: string;
      visible: boolean;
    };
  };
}

export const ApiKeysTab: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<StoredApiKey[]>([]);
  const [formData, setFormData] = useState<ApiKeyFormData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [validating, setValidating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await apiKeysService.getApiKeys();
      setApiKeys(keys);
      
      // Initialize form data
      const newFormData: ApiKeyFormData = {};
      Object.entries(API_PROVIDERS).forEach(([provider, config]) => {
        newFormData[provider] = {};
        config.keys.forEach(key => {
          newFormData[provider][key.name] = {
            value: '',
            visible: false,
          };
        });
      });
      setFormData(newFormData);
    } catch (err) {
      setError('Failed to load API keys');
      console.error('Error loading API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (provider: string, keyName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [keyName]: {
          ...prev[provider][keyName],
          value,
        },
      },
    }));
  };

  const toggleVisibility = (provider: string, keyName: string) => {
    setFormData(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [keyName]: {
          ...prev[provider][keyName],
          visible: !prev[provider][keyName].visible,
        },
      },
    }));
  };

  const saveApiKey = async (provider: string, keyName: string) => {
    const value = formData[provider]?.[keyName]?.value;
    if (!value) return;

    const saveKey = `${provider}.${keyName}`;
    try {
      setSaving(saveKey);
      setError(null);

      const apiKeyData: ApiKeyData = {
        provider,
        key_name: keyName,
        value,
        is_active: true,
        validation_status: 'pending',
      };

      await apiKeysService.saveApiKey(apiKeyData);
      
      // Clear the form field
      setFormData(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          [keyName]: {
            ...prev[provider][keyName],
            value: '',
          },
        },
      }));

      // Reload keys to show updated status
      await loadApiKeys();
    } catch (err) {
      setError(`Failed to save ${provider} ${keyName}`);
      console.error('Error saving API key:', err);
    } finally {
      setSaving(null);
    }
  };

  const deleteApiKey = async (provider: string, keyName: string) => {
    if (!confirm(`Delete ${provider} ${keyName}? This cannot be undone.`)) return;

    try {
      setError(null);
      await apiKeysService.deleteApiKey(provider, keyName);
      await loadApiKeys();
    } catch (err) {
      setError(`Failed to delete ${provider} ${keyName}`);
      console.error('Error deleting API key:', err);
    }
  };

  const validateApiKey = async (provider: string, keyName: string) => {
    const validateKey = `${provider}.${keyName}`;
    try {
      setValidating(validateKey);
      setError(null);
      
      const isValid = await apiKeysService.validateApiKey(provider, keyName);
      
      if (isValid) {
        // Reload to show updated validation status
        await loadApiKeys();
      }
    } catch (err) {
      setError(`Failed to validate ${provider} ${keyName}`);
      console.error('Error validating API key:', err);
    } finally {
      setValidating(null);
    }
  };

  const getStoredKey = (provider: string, keyName: string): StoredApiKey | undefined => {
    return apiKeys.find(key => key.provider === provider && key.key_name === keyName);
  };

  const getValidationIcon = (storedKey?: StoredApiKey) => {
    if (!storedKey) return null;

    switch (storedKey.validation_status) {
      case 'valid':
        return <Check className="h-4 w-4 text-green-500" title="Valid" />;
      case 'invalid':
        return <X className="h-4 w-4 text-red-500" title="Invalid" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-yellow-500" title={storedKey.validation_error || 'Error'} />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" title="Pending validation" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading API keys...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Key className="h-5 w-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">API Keys Management</h3>
      </div>

      <div className="text-sm text-gray-400 bg-gray-800 p-3 rounded-lg">
        <p className="mb-2">
          Manage your API keys securely. Keys are encrypted before storage and only used for authenticated requests.
        </p>
        <p>
          Environment variables will be used as fallback if no stored keys are found.
        </p>
      </div>

      <ApiConnectionStatus />

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-300 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(API_PROVIDERS).map(([provider, config]) => (
          <div key={provider} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-white font-medium">{config.name}</h4>
                <p className="text-sm text-gray-400">{config.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              {config.keys.map(keyConfig => {
                const storedKey = getStoredKey(provider, keyConfig.name);
                const formValue = formData[provider]?.[keyConfig.name]?.value || '';
                const isVisible = formData[provider]?.[keyConfig.name]?.visible || false;
                const saveKey = `${provider}.${keyConfig.name}`;
                const isSaving = saving === saveKey;
                const isValidating = validating === saveKey;

                return (
                  <div key={keyConfig.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      {keyConfig.label}
                      {keyConfig.required && <span className="text-red-400 ml-1">*</span>}
                    </label>

                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <input
                          type={isVisible ? 'text' : 'password'}
                          value={formValue}
                          onChange={(e) => handleInputChange(provider, keyConfig.name, e.target.value)}
                          placeholder={storedKey ? 'Enter new key to update' : 'Enter API key'}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => toggleVisibility(provider, keyConfig.name)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      <button
                        onClick={() => saveApiKey(provider, keyConfig.name)}
                        disabled={!formValue || isSaving}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center space-x-1"
                      >
                        {isSaving ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>{storedKey ? 'Update' : 'Save'}</span>
                      </button>

                      {storedKey && (
                        <>
                          <button
                            onClick={() => validateApiKey(provider, keyConfig.name)}
                            disabled={isValidating}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center space-x-1"
                          >
                            {isValidating ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            <span>Test</span>
                          </button>

                          <button
                            onClick={() => deleteApiKey(provider, keyConfig.name)}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                    </div>

                    {storedKey && (
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center space-x-2">
                          <span>Status:</span>
                          {getValidationIcon(storedKey)}
                          <span className="capitalize">{storedKey.validation_status}</span>
                        </div>
                        {storedKey.last_validated_at && (
                          <span>
                            Last validated: {new Date(storedKey.last_validated_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-900/20 border border-yellow-500 text-yellow-300 p-3 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-1">Security Notice</p>
            <ul className="list-disc list-inside space-y-1">
              <li>API keys are encrypted before storage using AES encryption</li>
              <li>Keys are only decrypted when making authenticated API requests</li>
              <li>Never share your API keys or include them in screenshots</li>
              <li>Regularly rotate your keys for enhanced security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
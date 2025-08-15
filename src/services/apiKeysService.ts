import { supabase } from '../lib/supabase';
import CryptoJS from 'crypto-js';

export interface ApiKeyData {
  id?: string;
  provider: string;
  key_name: string;
  value: string; // Plain text value (never stored)
  is_active: boolean;
  last_validated_at?: string | null;
  validation_status: 'pending' | 'valid' | 'invalid' | 'error';
  validation_error?: string | null;
}

export interface StoredApiKey {
  id: string;
  provider: string;
  key_name: string;
  is_active: boolean;
  last_validated_at: string | null;
  validation_status: 'pending' | 'valid' | 'invalid' | 'error';
  validation_error: string | null;
  created_at: string;
  updated_at: string;
}

// API provider configurations
export const API_PROVIDERS = {
  coingecko: {
    name: 'CoinGecko',
    keys: [{ name: 'api_key', label: 'API Key', required: false }],
    description: 'CoinGecko Pro API for enhanced rate limits and features',
  },
  whalealert: {
    name: 'WhaleAlert',
    keys: [{ name: 'api_key', label: 'API Key', required: true }],
    description: 'Real-time whale transaction alerts',
  },
  etherscan: {
    name: 'Etherscan',
    keys: [{ name: 'api_key', label: 'API Key', required: true }],
    description: 'Ethereum blockchain data and analytics',
  },
  bitquery: {
    name: 'Bitquery',
    keys: [{ name: 'api_key', label: 'API Key', required: true }],
    description: 'Blockchain data APIs for multiple networks',
  },
  covalent: {
    name: 'Covalent',
    keys: [{ name: 'api_key', label: 'API Key', required: true }],
    description: 'Multi-blockchain data API',
  },
  coinglass: {
    name: 'Coinglass',
    keys: [{ name: 'api_key', label: 'API Key', required: true }],
    description: 'Crypto derivatives and futures data',
  },
  alpaca: {
    name: 'Alpaca',
    keys: [
      { name: 'api_key', label: 'API Key', required: true },
      { name: 'secret_key', label: 'Secret Key', required: true },
    ],
    description: 'Commission-free trading API',
  },
  groq: {
    name: 'Groq',
    keys: [{ name: 'api_key', label: 'API Key', required: true }],
    description: 'High-performance AI inference',
  },
  binance: {
    name: 'Binance',
    keys: [
      { name: 'api_key', label: 'API Key', required: false },
      { name: 'secret_key', label: 'Secret Key', required: false },
    ],
    description: 'Binance exchange API (future implementation)',
  },
} as const;

class ApiKeysService {
  private encryptionKey: string;

  constructor() {
    // Use a combination of environment variable and browser fingerprint for encryption
    // This provides basic security while keeping keys accessible to the user
    this.encryptionKey = this.generateEncryptionKey();
  }

  private generateEncryptionKey(): string {
    // Get base key from environment (fallback to default for development)
    const baseKey = import.meta.env.VITE_ENCRYPTION_KEY || 'trading-bot-default-key-2025';
    
    // Add browser fingerprint for additional security
    const fingerprint = navigator.userAgent + navigator.language + screen.width + screen.height;
    
    // Create a derived key using PBKDF2
    return CryptoJS.PBKDF2(baseKey + fingerprint, 'trading-bot-salt', {
      keySize: 256 / 32,
      iterations: 1000,
    }).toString();
  }

  private encrypt(value: string): string {
    return CryptoJS.AES.encrypt(value, this.encryptionKey).toString();
  }

  private decrypt(encryptedValue: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async getApiKeys(): Promise<StoredApiKey[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.user.id)
        .order('provider', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching API keys:', error);
      throw error;
    }
  }

  async getApiKey(provider: string, keyName: string): Promise<string | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('api_keys')
        .select('encrypted_value')
        .eq('user_id', user.user.id)
        .eq('provider', provider)
        .eq('key_name', keyName)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found - return null instead of throwing
          return null;
        }
        throw error;
      }

      if (!data) return null;

      return this.decrypt(data.encrypted_value);
    } catch (error) {
      console.error(`Error fetching API key for ${provider}.${keyName}:`, error);
      return null;
    }
  }

  async saveApiKey(apiKeyData: ApiKeyData): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const encryptedValue = this.encrypt(apiKeyData.value);

      const { error } = await supabase
        .from('api_keys')
        .upsert({
          user_id: user.user.id,
          provider: apiKeyData.provider,
          key_name: apiKeyData.key_name,
          encrypted_value: encryptedValue,
          is_active: apiKeyData.is_active,
          validation_status: 'pending',
          validation_error: null,
        }, {
          onConflict: 'user_id,provider,key_name',
        });

      if (error) throw error;

      console.log(`✅ API key saved for ${apiKeyData.provider}.${apiKeyData.key_name}`);
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  }

  async deleteApiKey(provider: string, keyName: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('user_id', user.user.id)
        .eq('provider', provider)
        .eq('key_name', keyName);

      if (error) throw error;

      console.log(`🗑️ API key deleted for ${provider}.${keyName}`);
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  }

  async updateValidationStatus(
    provider: string,
    keyName: string,
    status: 'valid' | 'invalid' | 'error',
    error?: string
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error: updateError } = await supabase
        .from('api_keys')
        .update({
          validation_status: status,
          validation_error: error || null,
          last_validated_at: new Date().toISOString(),
        })
        .eq('user_id', user.user.id)
        .eq('provider', provider)
        .eq('key_name', keyName);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating validation status:', error);
      // Don't throw here as this is not critical
    }
  }

  async validateApiKey(provider: string, keyName: string): Promise<boolean> {
    try {
      const apiKey = await this.getApiKey(provider, keyName);
      if (!apiKey) {
        await this.updateValidationStatus(provider, keyName, 'error', 'API key not found');
        return false;
      }

      let isValid = false;
      let validationError = '';

      // Validate based on provider
      switch (provider) {
        case 'coingecko':
          isValid = await this.validateCoinGeckoKey(apiKey);
          break;
        case 'alpaca':
          if (keyName === 'api_key') {
            const secretKey = await this.getApiKey(provider, 'secret_key');
            isValid = await this.validateAlpacaKeys(apiKey, secretKey || '');
          }
          break;
        case 'groq':
          isValid = await this.validateGroqKey(apiKey);
          break;
        default:
          // For other providers, just check if key is not empty
          isValid = apiKey.length > 0;
      }

      const status = isValid ? 'valid' : 'invalid';
      await this.updateValidationStatus(provider, keyName, status, validationError);

      return isValid;
    } catch (error) {
      console.error(`Error validating ${provider}.${keyName}:`, error);
      await this.updateValidationStatus(provider, keyName, 'error', String(error));
      return false;
    }
  }

  private async validateCoinGeckoKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/ping', {
        headers: {
          'x-cg-pro-api-key': apiKey,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async validateAlpacaKeys(apiKey: string, secretKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://paper-api.alpaca.markets/v2/account', {
        headers: {
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': secretKey,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async validateGroqKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get API key with fallback to environment variables
  async getApiKeyWithFallback(provider: string, keyName: string): Promise<string | null> {
    // First try to get from stored keys
    const storedKey = await this.getApiKey(provider, keyName);
    if (storedKey) return storedKey;

    // Fallback to environment variables
    const envMap: Record<string, string> = {
      'coingecko.api_key': 'VITE_COINGECKO_API_KEY',
      'alpaca.api_key': 'VITE_ALPACA_API_KEY',
      'alpaca.secret_key': 'VITE_ALPACA_SECRET_KEY',
      'groq.api_key': 'VITE_GROQ_API_KEY',
      // Add more mappings as needed
    };

    const envKey = envMap[`${provider}.${keyName}`];
    if (envKey) {
      const envValue = import.meta.env[envKey];
      if (envValue) {
        console.log(`📋 Using environment variable ${envKey} for ${provider}.${keyName}`);
        return envValue;
      }
    }

    return null;
  }
}

export const apiKeysService = new ApiKeysService();
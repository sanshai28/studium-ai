interface EnvironmentConfig {
  API_URL: string;
  APP_NAME: string;
  ENV: string;
  IS_PRODUCTION: boolean;
  IS_DEVELOPMENT: boolean;
  IS_TEST: boolean;
}

const getEnvironment = (): string => {
  return import.meta.env.VITE_ENV || import.meta.env.MODE || 'development';
};

const env = getEnvironment();

const config: EnvironmentConfig = {
  API_URL: import.meta.env.VITE_API_URL || '/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Studium AI',
  ENV: env,
  IS_PRODUCTION: env === 'production',
  IS_DEVELOPMENT: env === 'development',
  IS_TEST: env === 'test',
};

// Validate required environment variables
const validateConfig = () => {
  const required: (keyof EnvironmentConfig)[] = ['API_URL'];

  required.forEach((key) => {
    if (!config[key]) {
      console.warn(`Missing required environment variable: ${key}`);
    }
  });
};

validateConfig();

export default config;

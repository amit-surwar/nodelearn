const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const loadSecrets = async () => {
  if (process.env.NODE_ENV === "development" || process.env.USE_LOCAL_ENV === "true") {
    console.log("Using local .env file for secrets");
    return;
  }

  const secretName = process.env.SECRET_NAME || "nodelearn/production";
  const region = process.env.AWS_REGION || "ap-south-1";

  const client = new SecretsManagerClient({ region });

  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);
    const secrets = JSON.parse(response.SecretString);

    Object.entries(secrets).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });

    console.log(`Secrets loaded from AWS Secrets Manager (${secretName})`);
  } catch (error) {
    console.error(`Failed to load secrets from ${secretName}: ${error.message}`);
    throw new Error("Cannot start without secrets");
  }
};

module.exports = { loadSecrets };

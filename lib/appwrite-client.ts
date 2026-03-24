import { Client, Databases } from 'appwrite';

const client = new Client();

// Check if required env vars are set
const endpoint = process.env.NEXT_PUBLIC_ENDPOINT;
const projectId = process.env.PROJECT_ID;

if (!endpoint || !projectId) {
  console.warn('⚠️ Appwrite configuration missing - some features may not work');
  // Set placeholder values for offline mode to work
  client
    .setEndpoint(endpoint || 'https://cloud.appwrite.io/v1')
    .setProject(projectId || 'demo');
} else {
  client
    .setEndpoint(endpoint)
    .setProject(projectId);
}

export const clientDatabases = new Databases(client);
export { client };

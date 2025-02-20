import {
    Client,
    Account,
    ID,
    Databases,
    OAuthProvider,
    Avatars,
    Query,
    Storage,
  } from "react-native-appwrite";
  import * as Linking from "expo-linking";
  import { openAuthSessionAsync } from "expo-web-browser";
  
  export const config = {
    platform: "com.ak.turfujn",
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    galleriesCollectionId:
      process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
    reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
    agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
    propertiesCollectionId:
      process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,
    bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID,
    usersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
  };
  
  export const client = new Client();
  client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!);
  
  export const avatar = new Avatars(client);
  export const account = new Account(client);
  export const databases = new Databases(client);
  export const storage = new Storage(client);
  
  export async function login() {
    try {
      // Verify required environment variables
      if (!config.endpoint || !config.projectId || !config.databaseId || !config.usersCollectionId) {
        throw new Error("Missing required environment configuration");
      }

      const redirectUri = Linking.createURL("/");

      // Create OAuth2 token with better error handling
      let response;
      try {
        response = await account.createOAuth2Token(
          OAuthProvider.Google,
          redirectUri
        );
      } catch (e) {
        console.error("OAuth token creation failed:", e);
        throw new Error("Failed to initialize Google login");
      }

      if (!response) throw new Error("OAuth token creation failed - no response");

      // Handle browser session
      const browserResult = await openAuthSessionAsync(
        response.toString(),
        redirectUri
      );
      
      if (browserResult.type !== "success") {
        throw new Error("Browser authentication cancelled or failed");
      }

      const url = new URL(browserResult.url);
      const secret = url.searchParams.get("secret");
      const userId = url.searchParams.get("userId");
      
      if (!secret || !userId) {
        throw new Error("Authentication response missing required parameters");
      }

      // Create session
      let session;
      try {
        session = await account.createSession(userId, secret);
      } catch (e) {
        console.error("Session creation failed:", e);
        throw new Error("Failed to create user session");
      }

      if (!session) throw new Error("Session creation failed - no session returned");

      // Get authenticated user details from Appwrite
      try {
        const authenticatedUser = await account.get();
        
        // Check if user exists in our database
        const existingUser = await databases.listDocuments(
          config.databaseId,
          config.usersCollectionId,
          [Query.equal("userId", authenticatedUser.$id)]
        );

        if (existingUser.total === 0) {
          // First time user - Create new user profile in database
          console.log("Creating new user profile...");
          await databases.createDocument(
            config.databaseId,
            config.usersCollectionId,
            ID.unique(),
            {
              userId: authenticatedUser.$id,
              name: authenticatedUser.name,
              email: authenticatedUser.email,
              avatar: avatar.getInitials(authenticatedUser.name).toString(),
            }
          );
          console.log("New user profile created successfully");
        } else {
          // Existing user - Update last login time
          const userDoc = existingUser.documents[0];
          await databases.updateDocument(
            config.databaseId,
            config.usersCollectionId,
            userDoc.$id,
            {
              lastLogin: new Date().toISOString(),
            }
          );
          console.log("Existing user logged in successfully");
        }

        return true;
      } catch (e) {
        console.error("User data operation failed:", e);
        // Attempt to clean up the session if user data operations fail
        await account.deleteSession("current").catch(console.error);
        throw new Error("Failed to setup/update user profile");
      }

    } catch (error) {
      console.error("Login process failed:", error);
      return false;
    }
  }
  
  export async function logout() {
    try {
      const result = await account.deleteSession("current");
      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  
  export async function getCurrentUser() {
    try {
      const result = await account.get();
      if (result.$id) {
        const userAvatar = avatar.getInitials(result.name);
  
        return {
          ...result,
          avatar: userAvatar.toString(),
        };
      }
  
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  
  export async function getLatestProperties() {
    try {
      const result = await databases.listDocuments(
        config.databaseId!,
        config.propertiesCollectionId!,
        [Query.orderDesc("$createdAt"), Query.limit(5)]
      );
  
      return result.documents;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  
  export async function getProperties({
    filter,
    query,
    limit,
  }: {
    filter: string;
    query: string;
    limit?: number;
  }) {
    try {
      const buildQuery = [Query.orderDesc("$createdAt")];
  
      if (filter && filter !== "All")
        buildQuery.push(Query.equal("type", filter));
  
      if (query)
        buildQuery.push(
          Query.or([
            Query.search("name", query),
            Query.search("address", query),
            Query.search("type", query),
          ])
        );
  
      if (limit) buildQuery.push(Query.limit(limit));
  
      const result = await databases.listDocuments(
        config.databaseId!,
        config.propertiesCollectionId!,
        buildQuery
      );
  
      return result.documents;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  
  export async function getPropertyById(id: string) {
    try {
      const result = await databases.getDocument(
        config.databaseId!,
        config.propertiesCollectionId!,
        id
      );
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
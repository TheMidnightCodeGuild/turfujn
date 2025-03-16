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
import { router } from "expo-router";

export const config = {
  platform: "com.krethun.turfujn",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  galleriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
  reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
  agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
  turfsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_TURFS_COLLECTION_ID,
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID,
  usersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
  bookingsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_BOOKINGS_COLLECTION_ID,
  matchesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CRICKET_TEAMS_COLLECTION_ID,
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

    // Check if there's an active session first
    try {
      const currentSession = await account.getSession('current');
      if (currentSession) {
        // If there's an active session, delete it first
        await account.deleteSession('current');
      }
    } catch (e) {
      // No active session, proceed with login
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
            bookings: [] // Initialize empty bookings array
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
            lastLoginAt: new Date().toISOString(), // Use lastLoginAt instead of lastLogin
          }
        );
        console.log("Existing user logged in successfully");
      }
      // router.replace("/");

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
    await account.deleteSession("current");
    router.replace("/sign-in");
    return true;
  } catch (error) {
    console.error(error);
    router.replace("/sign-in");
    return false;
  }
}

export async function deleteSession(sessionId: string) {
  try {
    const result = await account.deleteSession(sessionId);
    return result;
  } catch (error) {
    console.error("Failed to delete session:", error);
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

export async function getLatestTurfs() {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.turfsCollectionId!,
      [Query.orderDesc("$createdAt"), Query.limit(5)]
    );

    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTurfs({
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
      buildQuery.push(Query.equal("sports", filter));

    if (query)
      buildQuery.push(
        Query.or([
          Query.search("name", query),
          Query.search("address", query),
          Query.search("sports", query),
        ])
      );

    if (limit) buildQuery.push(Query.limit(limit));

    const result = await databases.listDocuments(
      config.databaseId!,
      config.turfsCollectionId!,
      buildQuery
    );

    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTurfById(id: string) {
  try {
    const result = await databases.getDocument(
      config.databaseId!,
      config.turfsCollectionId!,
      id
    );
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function checkSlotAvailability(turfId: string, date: Date, slotIds: string[]) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const response = await databases.listDocuments(
      config.databaseId!,
      config.bookingsCollectionId!,
      [
        Query.equal("turfId", turfId),
        Query.greaterThanEqual("date", startOfDay.toISOString()),
        Query.lessThanEqual("date", endOfDay.toISOString()),
      ]
    );

    // Get all booked slots for the day
    const bookedSlots = response.documents.reduce((acc: string[], booking) => {
      return [...acc, ...(booking.slots || [])];
    }, []);

    // Check if any of the requested slots are already booked
    const unavailableSlots = slotIds.filter(slotId => 
      bookedSlots.includes(slotId)
    );

    return {
      available: unavailableSlots.length === 0,
      unavailableSlots,
      existingBookings: response.documents
    };
  } catch (error) {
    console.error("Error checking availability:", error);
    throw error;
  }
}

export async function createBooking(userId: string, turfId: string, date: Date, slots: string[], name: string) {
  try {
    // First create the booking
    const booking = await databases.createDocument(
      config.databaseId!,
      config.bookingsCollectionId!,
      ID.unique(),
      {
        userId,
        turfId,
        date: date.toISOString(),
        slots,
        status: "Reserved", // Set default status
        name
      }
    );

    // Update user's bookings array
    const userDocs = await databases.listDocuments(
      config.databaseId!,
      config.usersCollectionId!,
      [Query.equal("userId", userId)]
    );

    if (userDocs.documents.length > 0) {
      const userDoc = userDocs.documents[0];
      const currentBookings = userDoc.bookings || [];

      await databases.updateDocument(
        config.databaseId!,
        config.usersCollectionId!,
        userDoc.$id,
        {
          bookings: [...currentBookings, booking.$id]
        }
      );
    }

    return booking;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

export async function getUserBookings(userId: string) {
  try {
    console.log('Getting user with ID:', userId);
    
    if (!userId) throw new Error("User ID is required");

    // Get the user document
    console.log('Fetching user document...');
    const userDocs = await databases.listDocuments(
      config.databaseId!,
      config.usersCollectionId!,
      [Query.equal("userId", userId)]
    );

    if (userDocs.documents.length === 0) {
      console.log("No user found with ID:", userId);
      return null;
    }

    const userDoc = userDocs.documents[0];
    console.log('Found user:', userDoc);
    
    return userDoc;
    
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}
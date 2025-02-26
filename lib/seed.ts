import { ID } from "react-native-appwrite";
import { databases, config } from "./appwrite";
import {
  agentImages,
  galleryImages,
  turfsImages,
  reviewImages,
} from "./data";

const COLLECTIONS = {
  AGENT: config.agentsCollectionId,
  REVIEWS: config.reviewsCollectionId,
  GALLERY: config.galleriesCollectionId,
  TURF: config.turfsCollectionId,
};

const turfSports = [
  "Football",
  "Basketball", 
  "Tennis",
  "Cricket",
  "Hockey",
];

const amenities = [
  "Bathroom",
  "Washroom",
  "UPI-Accepted",
  "Card-Accepted", 
  "Changing-Room",
  "Free-Parking",
  "Showers",
  "Cricket-Kit",
  "Stumps-Provided",
];

function getRandomSubset<T>(
  array: T[],
  minItems: number,
  maxItems: number
): T[] {
  if (minItems > maxItems) {
    throw new Error("minItems cannot be greater than maxItems");
  }
  if (minItems < 0 || maxItems > array.length) {
    throw new Error(
      "minItems or maxItems are out of valid range for the array"
    );
  }

  // Generate a random size for the subset within the range [minItems, maxItems]
  const subsetSize =
    Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;

  // Create a copy of the array to avoid modifying the original
  const arrayCopy = [...array];

  // Shuffle the array copy using Fisher-Yates algorithm
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [arrayCopy[i], arrayCopy[randomIndex]] = [
      arrayCopy[randomIndex],
      arrayCopy[i],
    ];
  }

  // Return the first `subsetSize` elements of the shuffled array
  return arrayCopy.slice(0, subsetSize);
}

async function seed() {
  try {
    // Clear existing data from all collections
    for (const key in COLLECTIONS) {
      const collectionId = COLLECTIONS[key as keyof typeof COLLECTIONS];
      const documents = await databases.listDocuments(
        config.databaseId!,
        collectionId!
      );
      for (const doc of documents.documents) {
        await databases.deleteDocument(
          config.databaseId!,
          collectionId!,
          doc.$id
        );
      }
    }

    console.log("Cleared all existing data.");

    // Seed Reviews
    const reviews = [];
    for (let i = 1; i <= 20; i++) {
      const review = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.REVIEWS!,
        ID.unique(),
        {
          name: `Reviewer ${i}`,
          avatar: reviewImages[Math.floor(Math.random() * reviewImages.length)],
          review: `This is a review by Reviewer ${i}.`,
          rating: Math.floor(Math.random() * 5) + 1, // Rating between 1 and 5
        }
      );
      reviews.push(review);
    }
    console.log(`Seeded ${reviews.length} reviews.`);

    // Seed Galleries
    const galleries = [];
    for (const image of galleryImages) {
      const gallery = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.GALLERY!,
        ID.unique(),
        { image }
      );
      galleries.push(gallery);
    }

    console.log(`Seeded ${galleries.length} galleries.`);

    // Seed Agents and their Turfs
    for (let i = 1; i <= 5; i++) {
      // Create agent first
      const agent = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.AGENT!,
        ID.unique(),
        {
          name: `Agent ${i}`,
          email: `agent${i}@example.com`,
          avatar: agentImages[Math.floor(Math.random() * agentImages.length)],
        }
      );

      // Create 4 turfs for each agent
      for (let j = 1; j <= 4; j++) {
        const assignedReviews = getRandomSubset(reviews, 5, 7); // 5 to 7 reviews
        const assignedGalleries = getRandomSubset(galleries, 3, 8); // 3 to 8 galleries

        const selectedAmenities = amenities
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * amenities.length) + 1);

        const turfIndex = ((i-1) * 4) + j - 1;
        const image = turfsImages[turfIndex % turfsImages.length];

        const turf = await databases.createDocument(
          config.databaseId!,
          COLLECTIONS.TURF!,
          ID.unique(),
          {
            name: `Turf ${(i-1)*4 + j}`,
            sports: turfSports[Math.floor(Math.random() * turfSports.length)],
            description: `This is the description for Property ${(i-1)*4 + j}.`,
            address: `123 Property Street, City ${(i-1)*4 + j}`,
            geolocation: `192.168.1.${(i-1)*4 + j}, 192.168.1.${(i-1)*4 + j}`,
            price: Math.floor(Math.random() * 9000) + 1000,
            area: Math.floor(Math.random() * 3000) + 500,
            rating: Math.floor(Math.random() * 5) + 1,
            amenities: selectedAmenities,
            image: image,
            agent: agent.$id,
            reviews: assignedReviews.map((review) => review.$id),
            gallery: assignedGalleries.map((gallery) => gallery.$id),
          }
        );

        // Update agent with the turf reference
        await databases.updateDocument(
          config.databaseId!,
          COLLECTIONS.AGENT!,
          agent.$id,
          {
            turfs: [...(agent.turfs || []), turf.$id]
          }
        );

        console.log(`Seeded turf: ${turf.name} for agent: ${agent.name}`);
      }
      
      console.log(`Seeded agent: ${agent.name} with 4 turfs`);
    }

    console.log("Data seeding completed.");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

export default seed;
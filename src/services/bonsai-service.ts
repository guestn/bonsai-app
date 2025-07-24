import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { BonsaiTree, BonsaiEvent } from '../types/bonsai';

const BONSAI_COLLECTION = 'bonsai';

// Convert Firestore timestamp to string date
const timestampToDate = (timestamp: Timestamp): string => {
  return timestamp.toDate().toISOString().split('T')[0];
};

// Convert string date to Firestore timestamp
const dateToTimestamp = (dateString: string): Timestamp => {
  return Timestamp.fromDate(new Date(dateString));
};

// Helper function to safely get cost value
const getSafeCost = (cost: number | undefined): number => {
  return cost || 0;
};

// Convert Firestore document to BonsaiTree
const firestoreToBonsaiTree = (doc: any): BonsaiTree => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    species: data.species,
    initialCost: data.initialCost,
    acquisitionDate: timestampToDate(data.acquisitionDate),
    status: data.status,
    location: data.location,
    potType: data.potType,
    age: data.age,
    notes: data.notes,
    images: data.images || [],
    events:
      data.events?.map((event: any) => ({
        id: event.id,
        description: event.description,
        date: timestampToDate(event.date),
        value: event.value,
        cost: event.cost || 0,
      })) || [],
  };
};

// Convert BonsaiTree to Firestore document
const bonsaiTreeToFirestore = (tree: Omit<BonsaiTree, 'id'>) => {
  return {
    name: tree.name,
    species: tree.species,
    initialCost: tree.initialCost,
    acquisitionDate: dateToTimestamp(tree.acquisitionDate),
    status: tree.status,
    location: tree.location,
    potType: tree.potType,
    age: tree.age,
    notes: tree.notes || '',
    images: tree.images || [],
    events:
      tree.events?.map((event) => ({
        id: event.id,
        description: event.description,
        date: dateToTimestamp(event.date),
        value: event.value,
        cost: getSafeCost(event.cost),
      })) || [],
  };
};

export class BonsaiService {
  // Get all bonsai trees
  static async getAllBonsai(): Promise<BonsaiTree[]> {
    try {
      const querySnapshot = await getDocs(collection(db, BONSAI_COLLECTION));
      return querySnapshot.docs.map(firestoreToBonsaiTree);
    } catch (error) {
      console.error('Error fetching bonsai trees:', error);
      throw error;
    }
  }

  // Get a single bonsai tree by ID
  static async getBonsaiById(id: string): Promise<BonsaiTree | null> {
    try {
      const docRef = doc(db, BONSAI_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return firestoreToBonsaiTree(docSnap);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching bonsai tree:', error);
      throw error;
    }
  }

  // Create a new bonsai tree
  static async createBonsai(tree: Omit<BonsaiTree, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(
        collection(db, BONSAI_COLLECTION),
        bonsaiTreeToFirestore(tree),
      );
      return docRef.id;
    } catch (error) {
      console.error('Error creating bonsai tree:', error);
      throw error;
    }
  }

  // Create a new bonsai tree with a specific ID
  static async createBonsaiWithId(
    id: string,
    tree: Omit<BonsaiTree, 'id'>,
  ): Promise<void> {
    try {
      const docRef = doc(db, BONSAI_COLLECTION, id);
      await setDoc(docRef, bonsaiTreeToFirestore(tree));
    } catch (error) {
      console.error('Error creating bonsai tree with ID:', error);
      throw error;
    }
  }

  // Update a bonsai tree
  static async updateBonsai(
    id: string,
    tree: Partial<BonsaiTree>,
  ): Promise<void> {
    try {
      const docRef = doc(db, BONSAI_COLLECTION, id);
      const updateData: any = {};

      // Only include fields that are provided
      if (tree.name !== undefined) updateData.name = tree.name;
      if (tree.species !== undefined) updateData.species = tree.species;
      if (tree.initialCost !== undefined)
        updateData.initialCost = tree.initialCost;
      if (tree.acquisitionDate !== undefined)
        updateData.acquisitionDate = dateToTimestamp(tree.acquisitionDate);
      if (tree.status !== undefined) updateData.status = tree.status;
      if (tree.location !== undefined) updateData.location = tree.location;
      if (tree.potType !== undefined) updateData.potType = tree.potType;
      if (tree.age !== undefined) updateData.age = tree.age;
      if (tree.notes !== undefined) updateData.notes = tree.notes;
      if (tree.images !== undefined) updateData.images = tree.images;
      if (tree.events !== undefined) {
        updateData.events = tree.events.map((event) => ({
          id: event.id,
          description: event.description,
          date: dateToTimestamp(event.date),
          value: event.value,
          cost: getSafeCost(event.cost),
        }));
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating bonsai tree:', error);
      throw error;
    }
  }

  // Delete a bonsai tree
  static async deleteBonsai(id: string): Promise<void> {
    try {
      const docRef = doc(db, BONSAI_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting bonsai tree:', error);
      throw error;
    }
  }

  // Add an event to a bonsai tree
  static async addEvent(
    bonsaiId: string,
    event: Omit<BonsaiEvent, 'id'>,
  ): Promise<void> {
    try {
      const docRef = doc(db, BONSAI_COLLECTION, bonsaiId);
      const eventWithId = {
        id: `${Date.now()}`, // Simple ID generation
        description: event.description,
        date: dateToTimestamp(event.date),
        value: event.value,
        cost: getSafeCost(event.cost),
      };

      await updateDoc(docRef, {
        events: [
          ...((await this.getBonsaiById(bonsaiId))?.events || []),
          eventWithId,
        ],
      });
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  }

  // Get bonsai trees with filters
  static async getBonsaiWithFilters(filters: {
    status?: string;
    species?: string;
    search?: string;
  }): Promise<BonsaiTree[]> {
    try {
      const bonsaiCollection = collection(db, BONSAI_COLLECTION);
      const constraints = [];

      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters.species) {
        constraints.push(where('species', '==', filters.species));
      }

      const q =
        constraints.length > 0
          ? query(bonsaiCollection, ...constraints)
          : bonsaiCollection;

      const querySnapshot = await getDocs(q);
      let results = querySnapshot.docs.map(firestoreToBonsaiTree);

      // Apply search filter in memory (Firestore doesn't support full-text search)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        results = results.filter(
          (tree) =>
            tree.name.toLowerCase().includes(searchLower) ||
            tree.species.toLowerCase().includes(searchLower) ||
            tree.notes?.toLowerCase().includes(searchLower),
        );
      }

      return results;
    } catch (error) {
      console.error('Error fetching bonsai trees with filters:', error);
      throw error;
    }
  }
}

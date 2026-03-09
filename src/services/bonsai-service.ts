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
  Timestamp,
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { BonsaiTree, BonsaiEvent } from '../types/bonsai';

const BONSAI_COLLECTION = 'bonsai';
const BONSAI_NOTES_COLLECTION = 'notes';

// Convert Firestore timestamp to string date
const timestampToDate = (timestamp: Timestamp | string): string => {
  if (typeof timestamp === 'string') {
    return timestamp;
  }
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
    type: data.type,
    location: data.location,
    potType: data.potType,
    age: data.age,
    notes: data.notes,
    photos: (data.photos || []).map((photo: any) => ({
      id: photo.id,
      url: photo.url,
      fileName: photo.fileName,
      fileSize: photo.fileSize,
      contentType: photo.contentType,
      uploadedAt: photo.uploadedAt,
      takenAt: photo.takenAt,
      width: photo.width,
      height: photo.height,
      source: photo.source,
    })),
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
  const firestoreData: any = {
    name: tree.name,
    species: tree.species,
    initialCost: tree.initialCost,
    acquisitionDate: dateToTimestamp(tree.acquisitionDate),
    status: tree.status,
    type: tree.type,
    notes: tree.notes || '',
    photos: (tree.photos || []).map((photo) => {
      const cleanPhoto: any = {
        id: photo.id,
        url: photo.url,
        uploadedAt: photo.uploadedAt,
      };

      // Only add optional fields if they are defined
      if (photo.fileName !== undefined) cleanPhoto.fileName = photo.fileName;
      if (photo.fileSize !== undefined) cleanPhoto.fileSize = photo.fileSize;
      if (photo.contentType !== undefined)
        cleanPhoto.contentType = photo.contentType;
      if (photo.takenAt !== undefined) cleanPhoto.takenAt = photo.takenAt;
      if (photo.width !== undefined) cleanPhoto.width = photo.width;
      if (photo.height !== undefined) cleanPhoto.height = photo.height;
      if (photo.source !== undefined) cleanPhoto.source = photo.source;

      return cleanPhoto;
    }),
    events:
      tree.events?.map((event) => ({
        id: event.id,
        description: event.description,
        date: dateToTimestamp(event.date),
        value: event.value,
        cost: getSafeCost(event.cost),
      })) || [],
  };

  // Only add optional fields if they are defined
  if (tree.location !== undefined) firestoreData.location = tree.location;
  if (tree.potType !== undefined) firestoreData.potType = tree.potType;
  if (tree.age !== undefined) firestoreData.age = tree.age;

  return firestoreData;
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
      if (tree.type !== undefined) updateData.type = tree.type;
      if (tree.location !== undefined) updateData.location = tree.location;
      if (tree.potType !== undefined) updateData.potType = tree.potType;
      if (tree.age !== undefined) updateData.age = tree.age;
      if (tree.notes !== undefined) updateData.notes = tree.notes;
      if (tree.photos !== undefined) {
        // Filter out undefined values from photo metadata to avoid Firestore errors
        updateData.photos = tree.photos.map((photo) => {
          const cleanPhoto: any = {
            id: photo.id,
            url: photo.url,
            uploadedAt: photo.uploadedAt,
          };

          // Only add optional fields if they are defined
          if (photo.fileName !== undefined)
            cleanPhoto.fileName = photo.fileName;
          if (photo.fileSize !== undefined)
            cleanPhoto.fileSize = photo.fileSize;
          if (photo.contentType !== undefined)
            cleanPhoto.contentType = photo.contentType;
          if (photo.takenAt !== undefined) cleanPhoto.takenAt = photo.takenAt;
          if (photo.width !== undefined) cleanPhoto.width = photo.width;
          if (photo.height !== undefined) cleanPhoto.height = photo.height;
          if (photo.source !== undefined) cleanPhoto.source = photo.source;

          return cleanPhoto;
        });
      }
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
      const eventWithId: any = {
        id: `${Date.now()}`,
        description: event.description,
        date: dateToTimestamp(event.date),
        cost: getSafeCost(event.cost),
      };
      if (event.value !== undefined) {
        eventWithId.value = event.value;
      }

      // When updating events, ensure no undefined values are present
      const currentEvents = (
        (await this.getBonsaiById(bonsaiId))?.events || []
      ).map((ev) => {
        const mapped: any = {
          id: ev.id,
          description: ev.description,
          date: dateToTimestamp(ev.date),
          cost: getSafeCost(ev.cost),
        };
        if (ev.value !== undefined) mapped.value = ev.value;
        return mapped;
      });

      await updateDoc(docRef, {
        events: [
          ...currentEvents,
          Object.fromEntries(
            Object.entries(eventWithId).filter(([_, v]) => v !== undefined),
          ),
        ],
      });
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  }

  // Update an event in a bonsai tree
  static async updateEvent(
    bonsaiId: string,
    eventId: string,
    event: Omit<BonsaiEvent, 'id'>,
  ): Promise<void> {
    try {
      const docRef = doc(db, BONSAI_COLLECTION, bonsaiId);
      const currentBonsai = await this.getBonsaiById(bonsaiId);

      if (!currentBonsai) {
        throw new Error('Bonsai tree not found');
      }

      // Update the specific event
      const updatedEvents = currentBonsai.events.map((ev) => {
        if (ev.id === eventId) {
          const mapped: any = {
            id: ev.id,
            description: event.description,
            date: dateToTimestamp(event.date),
            cost: getSafeCost(event.cost),
          };
          if (event.value !== undefined) mapped.value = event.value;
          return mapped;
        }
        return {
          id: ev.id,
          description: ev.description,
          date: dateToTimestamp(ev.date),
          cost: getSafeCost(ev.cost),
          ...(ev.value !== undefined && { value: ev.value }),
        };
      });

      await updateDoc(docRef, {
        events: updatedEvents,
      });
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Delete an event from a bonsai tree
  static async deleteEvent(bonsaiId: string, eventId: string): Promise<void> {
    try {
      const docRef = doc(db, BONSAI_COLLECTION, bonsaiId);
      const currentBonsai = await this.getBonsaiById(bonsaiId);

      if (!currentBonsai) {
        throw new Error('Bonsai tree not found');
      }

      // Filter out the event to delete
      const updatedEvents = currentBonsai.events
        .filter((event) => event.id !== eventId)
        .map((ev) => {
          const mapped: any = {
            id: ev.id,
            description: ev.description,
            date: dateToTimestamp(ev.date),
            cost: getSafeCost(ev.cost),
          };
          if (ev.value !== undefined) mapped.value = ev.value;
          return mapped;
        });

      await updateDoc(docRef, {
        events: updatedEvents,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Get the general notes for all bonsai trees
  static async getNotes(): Promise<string> {
    try {
      const docRef = doc(db, BONSAI_NOTES_COLLECTION, 'notes');

      const docSnap = await getDoc(docRef);
      return docSnap.data()?.notes || '';
    } catch (error) {
      console.error('Error getting notes:', error);
      throw error;
    }
  }

  // Update a note in a bonsai tree
  static async updateNote(note: string): Promise<void> {
    try {
      const docRef = doc(db, BONSAI_NOTES_COLLECTION, 'notes');
      await updateDoc(docRef, 'notes', note);
    } catch (error) {
      console.error('Error updating note:', error);
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

  // Delete photos from a bonsai tree
  static async deletePhotos(
    bonsaiId: string,
    photoIds: string[],
  ): Promise<void> {
    try {
      // Get current bonsai tree
      const currentBonsai = await this.getBonsaiById(bonsaiId);
      if (!currentBonsai) {
        throw new Error('Bonsai tree not found');
      }

      // Remove photos from bonsai tree (no need to delete from storage for external URLs)
      const updatedPhotos =
        currentBonsai.photos?.filter((photo) => !photoIds.includes(photo.id)) ||
        [];

      // Update the bonsai tree
      await this.updateBonsai(bonsaiId, { photos: updatedPhotos });
    } catch (error) {
      console.error('Error deleting photos:', error);
      throw error;
    }
  }

  // Delete a bonsai tree and all its photos
  static async deleteBonsaiWithPhotos(id: string): Promise<void> {
    try {
      // Delete the bonsai tree document (no need to delete external URLs)
      await this.deleteBonsai(id);
    } catch (error) {
      console.error('Error deleting bonsai tree with photos:', error);
      throw error;
    }
  }
}

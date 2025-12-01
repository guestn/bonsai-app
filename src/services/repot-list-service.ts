import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const REPOT_LIST_COLLECTION = 'repotLists';

export class RepotListService {
  // Get repot list for a user
  static async getRepotList(userId: string): Promise<string[]> {
    try {
      const docRef = doc(db, REPOT_LIST_COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.treeIds || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching repot list:', error);
      throw error;
    }
  }

  // Update repot list for a user
  static async updateRepotList(
    userId: string,
    treeIds: string[],
  ): Promise<void> {
    try {
      const docRef = doc(db, REPOT_LIST_COLLECTION, userId);
      await setDoc(docRef, { treeIds }, { merge: true });
    } catch (error) {
      console.error('Error updating repot list:', error);
      throw error;
    }
  }

  // Add a tree to repot list
  static async addToRepotList(userId: string, treeId: string): Promise<void> {
    try {
      const currentList = await this.getRepotList(userId);
      if (!currentList.includes(treeId)) {
        await this.updateRepotList(userId, [...currentList, treeId]);
      }
    } catch (error) {
      console.error('Error adding to repot list:', error);
      throw error;
    }
  }

  // Remove a tree from repot list
  static async removeFromRepotList(
    userId: string,
    treeId: string,
  ): Promise<void> {
    try {
      const currentList = await this.getRepotList(userId);
      const updatedList = currentList.filter((id) => id !== treeId);
      await this.updateRepotList(userId, updatedList);
    } catch (error) {
      console.error('Error removing from repot list:', error);
      throw error;
    }
  }

  // Clear repot list for a user
  static async clearRepotList(userId: string): Promise<void> {
    try {
      await this.updateRepotList(userId, []);
    } catch (error) {
      console.error('Error clearing repot list:', error);
      throw error;
    }
  }
}

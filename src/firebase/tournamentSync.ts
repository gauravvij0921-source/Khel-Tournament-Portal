import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHelper';
import { Match, Player } from '../types';

/**
 * Listens in real-time to matches collection across all user devices.
 */
export function subscribeToMatches(onUpdate: (matches: Match[]) => void) {
  const matchesCol = collection(db, 'matches');
  return onSnapshot(
    matchesCol,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }
      const list: Match[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Match;
        list.push({ ...data, id: docSnap.id });
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'matches');
    }
  );
}

/**
 * Listens in real-time to players roster collection across all user devices.
 */
export function subscribeToPlayers(onUpdate: (players: Player[]) => void) {
  const playersCol = collection(db, 'players');
  return onSnapshot(
    playersCol,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }
      const list: Player[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Player;
        list.push({ ...data, id: docSnap.id });
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'players');
    }
  );
}

/**
 * Saves or updates a single match in Firebase Firestore.
 */
export async function saveMatchToFirebase(match: Match): Promise<void> {
  const matchRef = doc(db, 'matches', match.id);
  try {
    // Sanitize undefined fields for Firestore
    const sanitized = JSON.parse(JSON.stringify(match));
    await setDoc(matchRef, {
      ...sanitized,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `matches/${match.id}`);
    throw err;
  }
}

/**
 * Deletes a match from Firebase Firestore.
 */
export async function deleteMatchFromFirebase(matchId: string): Promise<void> {
  const matchRef = doc(db, 'matches', matchId);
  try {
    await deleteDoc(matchRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `matches/${matchId}`);
    throw err;
  }
}

/**
 * Saves or updates a player in Firebase Firestore.
 */
export async function savePlayerToFirebase(player: Player): Promise<void> {
  const playerRef = doc(db, 'players', player.id);
  try {
    const sanitized = JSON.parse(JSON.stringify(player));
    await setDoc(playerRef, sanitized, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `players/${player.id}`);
    throw err;
  }
}

/**
 * Core flow requested by user:
 * Admin uploads / syncs Google Sheet -> Batch writes all fixtures into Firebase Firestore.
 * This triggers real-time onSnapshot on every spectator and player device worldwide!
 */
export async function syncGoogleSheetToFirebase(matches: Match[], players?: Player[]): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;

  for (const m of matches) {
    const ref = doc(db, 'matches', m.id);
    const sanitized = JSON.parse(JSON.stringify(m));
    batch.set(ref, {
      ...sanitized,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    count++;
  }

  if (players && players.length > 0) {
    for (const p of players) {
      const pRef = doc(db, 'players', p.id);
      const sanitizedPlayer = JSON.parse(JSON.stringify(p));
      batch.set(pRef, sanitizedPlayer, { merge: true });
    }
  }

  // Update sync settings metadata
  const settingsRef = doc(db, 'settings', 'general');
  batch.set(settingsRef, {
    lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    totalMatches: count,
  }, { merge: true });

  try {
    await batch.commit();
    return count;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'batch_sync_google_sheets');
    throw err;
  }
}

/**
 * Seeds initial mock data to Firebase Firestore if the collections are brand new.
 */
export async function seedInitialDataToFirebaseIfEmpty(initialMatches: Match[], initialPlayers: Player[]): Promise<boolean> {
  try {
    const matchesSnap = await getDocs(collection(db, 'matches'));
    if (matchesSnap.empty) {
      console.log('Seeding initial tournament data to Firebase Firestore...');
      await syncGoogleSheetToFirebase(initialMatches, initialPlayers);
      return true;
    }
    // Also ensure Gaurav Vij and Rohit Sardana are synced as admins
    await refreshDatabaseWithAdmins(initialPlayers);
    return false;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'matches');
    return false;
  }
}

/**
 * Refreshes player database in Firestore so that ONLY Gaurav Vij and Rohit Sardana are Admins,
 * removing any obsolete admin records.
 */
export async function refreshDatabaseWithAdmins(players: Player[]): Promise<void> {
  const batch = writeBatch(db);

  // Remove obsolete test accounts from Firestore
  batch.delete(doc(db, 'players', 'p-admin'));
  batch.delete(doc(db, 'players', 'p-scorer-tt'));
  batch.delete(doc(db, 'players', 'p-scorer-cricket'));

  // Update all players in players list
  for (const p of players) {
    const pRef = doc(db, 'players', p.id);
    const sanitized = JSON.parse(JSON.stringify(p));
    batch.set(pRef, sanitized, { merge: true });
  }

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'refresh_players_admins');
  }
}

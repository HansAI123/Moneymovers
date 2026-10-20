import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  getDocFromServer,
  type Firestore,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { ProjectWorkspace } from "../types/fund";

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with specific database ID if configured
export const db: Firestore = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Validate connection per Firebase skill directive in background
async function validateFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error: any) {
    if (error?.message?.includes("the client is offline")) {
      console.warn("Firestore client is offline, local cache active.");
    }
  }
}
setTimeout(() => {
  validateFirestoreConnection();
}, 200);

// Auth Helpers
const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function registerWithEmail(email: string, pass: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function loginAsGuest(): Promise<User> {
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ----------------------------------------------------------------------
// Project Workspace Persistence (Firestore + LocalStorage Fallback)
// ----------------------------------------------------------------------

const LOCAL_STORAGE_PROJECTS_KEY = "income_evaluator_workspaces_v1";

export async function fetchUserProjects(userId: string): Promise<ProjectWorkspace[]> {
  // If guest or not signed in, immediately load from local storage
  if (!userId || userId === "guest" || !auth.currentUser) {
    return getLocalProjects(userId || "guest");
  }

  try {
    const projectsCol = collection(db, "users", userId, "projects");
    const snapshot = await getDocs(projectsCol);
    if (!snapshot.empty) {
      const projects: ProjectWorkspace[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        let holdings = data.holdings || [];
        if (typeof data.holdingsJson === "string") {
          try {
            holdings = JSON.parse(data.holdingsJson);
          } catch {
            // fallback
          }
        }
        projects.push({
          id: d.id,
          userId: data.userId || userId,
          name: data.name || "Untitled Project",
          description: data.description || "",
          accountType: data.accountType || "taxable",
          initialCapital: Number(data.initialCapital) || 100000,
          targetYieldPct: Number(data.targetYieldPct) || 8.0,
          marginalTaxRatePct: Number(data.marginalTaxRatePct) || 24,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          holdings: holdings,
        });
      });
      return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  } catch (err) {
    console.warn("Firestore fetch projects fallback to local cache:", err);
  }

  // Fallback to local storage if user has saved locally
  return getLocalProjects(userId);
}

export async function saveUserProject(userId: string, project: ProjectWorkspace): Promise<void> {
  // Always update local cache first for zero-latency UI
  saveLocalProject(userId, project);

  if (!userId || userId === "guest" || !auth.currentUser) {
    return;
  }

  try {
    const projectRef = doc(db, "users", userId, "projects", project.id);
    await setDoc(
      projectRef,
      {
        id: project.id,
        userId: userId,
        name: project.name,
        description: project.description,
        accountType: project.accountType,
        initialCapital: project.initialCapital,
        targetYieldPct: project.targetYieldPct,
        marginalTaxRatePct: project.marginalTaxRatePct,
        createdAt: project.createdAt,
        updatedAt: new Date().toISOString(),
        holdingsJson: JSON.stringify(project.holdings),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore saveProject deferred to local storage:", err);
  }
}

export async function deleteUserProject(userId: string, projectId: string): Promise<void> {
  deleteLocalProject(userId, projectId);

  if (!userId || userId === "guest" || !auth.currentUser) {
    return;
  }

  try {
    const projectRef = doc(db, "users", userId, "projects", projectId);
    await deleteDoc(projectRef);
  } catch (err) {
    console.warn("Firestore deleteProject error:", err);
  }
}

// Local Storage Helpers
function getLocalProjects(userId: string): ProjectWorkspace[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PROJECTS_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function saveLocalProject(userId: string, project: ProjectWorkspace): void {
  try {
    const existing = getLocalProjects(userId);
    const index = existing.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      existing[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      existing.unshift(project);
    }
    localStorage.setItem(`${LOCAL_STORAGE_PROJECTS_KEY}_${userId}`, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

function deleteLocalProject(userId: string, projectId: string): void {
  try {
    const existing = getLocalProjects(userId).filter((p) => p.id !== projectId);
    localStorage.setItem(`${LOCAL_STORAGE_PROJECTS_KEY}_${userId}`, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

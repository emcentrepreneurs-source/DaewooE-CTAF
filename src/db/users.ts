import { db } from './index.ts';
import { users } from './schema.ts';
import { eq, asc } from 'drizzle-orm';

export async function getAllUsers() {
  try {
    const list = await db.select().from(users).orderBy(asc(users.id));
    return list;
  } catch (error) {
    console.error('Database getAllUsers failed:', error);
    throw new Error('Failed to fetch users from database', { cause: error });
  }
}

export async function getOrCreateUser(uid: string, email: string, displayName?: string, role?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        role: role || 'user',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
          role: role || 'user',
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Failed to register or retrieve user', { cause: error });
  }
}

export async function createUser(data: { uid: string; email: string; displayName?: string; role?: string }) {
  try {
    const result = await db.insert(users)
      .values({
        uid: data.uid,
        email: data.email,
        displayName: data.displayName || data.uid,
        role: data.role || 'user',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: data.email,
          displayName: data.displayName || data.uid,
          role: data.role || 'user',
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database createUser failed:', error);
    throw new Error('Failed to create user in database', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Database getUserByUid failed:', error);
    throw new Error('Failed to get user by UID', { cause: error });
  }
}

export async function deleteUserById(id: number) {
  try {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result[0] || null;
  } catch (error) {
    console.error('Database deleteUserById failed:', error);
    throw new Error('Failed to delete user', { cause: error });
  }
}

export async function deleteUserByUid(uid: string) {
  try {
    const result = await db.delete(users).where(eq(users.uid, uid)).returning();
    return result[0] || null;
  } catch (error) {
    console.error('Database deleteUserByUid failed:', error);
    throw new Error('Failed to delete user by UID', { cause: error });
  }
}

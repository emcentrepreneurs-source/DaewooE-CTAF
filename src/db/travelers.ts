import { db } from './index.ts';
import { travelers, appSettings } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getAllTravelers(userUid?: string) {
  try {
    if (userUid) {
      return await db
        .select()
        .from(travelers)
        .where(eq(travelers.userUid, userUid))
        .orderBy(desc(travelers.createdAt));
    }
    return await db
      .select()
      .from(travelers)
      .orderBy(desc(travelers.createdAt));
  } catch (error) {
    console.error('Database getAllTravelers failed:', error);
    throw new Error('Failed to retrieve travelers from database', { cause: error });
  }
}

export async function saveTravelers(records: any[], userUid?: string) {
  try {
    if (!records || records.length === 0) return [];

    const valuesToInsert = records.map(r => ({
      id: r.id,
      userUid: userUid || r.userUid || null,
      surname: r.surname || '',
      nameGender: r.nameAndGender || r.nameGender || '',
      finalDestination: r.finalDestination || '',
      rotationType: r.rotationType || '',
      purposeOfTrip: r.purposeOfTrip || null,
      companyId: r.companyId || null,
      company: r.company || null,
      position: r.projectPosition || r.position || null,
      department: r.projectDepartment || r.department || null,
      mobileNumber: r.mobileNumber || null,
      emailAddress: r.emailAddress || null,
      substituteInAbsence: r.substituteInAbsence || null,
      frequentFlyerCard: r.frequentFlyerCard || null,
      passportNumber: r.passportOrIdNumber || r.passportNumber || null,
      dateOfBirth: r.dateOfBirth || null,
      nationality: r.nationality || null,
      passportExpiryDate: r.passportExpiryDate || null,
      signatureDate: r.signatureDate || null,
      signatureName: r.signatureName || null,
      signatureImage: r.signatureImage || null,
      flights: r.flights || [],
      accommodations: r.accommodation || r.accommodations || [],
      status: r.status || (r.isValid === false ? 'invalid' : 'ready'),
      source: r.source || 'manual',
      notes: r.notes || null,
      updatedAt: new Date(),
    }));

    const results = [];
    for (const item of valuesToInsert) {
      const inserted = await db
        .insert(travelers)
        .values(item)
        .onConflictDoUpdate({
          target: travelers.id,
          set: {
            surname: item.surname,
            nameGender: item.nameGender,
            finalDestination: item.finalDestination,
            rotationType: item.rotationType,
            purposeOfTrip: item.purposeOfTrip,
            companyId: item.companyId,
            company: item.company,
            position: item.position,
            department: item.department,
            mobileNumber: item.mobileNumber,
            emailAddress: item.emailAddress,
            substituteInAbsence: item.substituteInAbsence,
            frequentFlyerCard: item.frequentFlyerCard,
            passportNumber: item.passportNumber,
            dateOfBirth: item.dateOfBirth,
            nationality: item.nationality,
            passportExpiryDate: item.passportExpiryDate,
            signatureDate: item.signatureDate,
            signatureName: item.signatureName,
            signatureImage: item.signatureImage,
            flights: item.flights,
            accommodations: item.accommodations,
            status: item.status,
            source: item.source,
            notes: item.notes,
            updatedAt: new Date(),
          },
        })
        .returning();
      results.push(inserted[0]);
    }
    return results;
  } catch (error) {
    console.error('Database saveTravelers failed:', error);
    throw new Error('Failed to save travelers to database', { cause: error });
  }
}

export async function deleteTravelerById(id: string) {
  try {
    return await db.delete(travelers).where(eq(travelers.id, id)).returning();
  } catch (error) {
    console.error('Database deleteTravelerById failed:', error);
    throw new Error('Failed to delete traveler from database', { cause: error });
  }
}

export async function clearAllTravelers(userUid?: string) {
  try {
    if (userUid) {
      return await db.delete(travelers).where(eq(travelers.userUid, userUid)).returning();
    }
    return await db.delete(travelers).returning();
  } catch (error) {
    console.error('Database clearAllTravelers failed:', error);
    throw new Error('Failed to clear travelers', { cause: error });
  }
}

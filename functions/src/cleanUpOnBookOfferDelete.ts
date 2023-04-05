import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export const cleanUpOnBookOfferDelete =
functions.region("europe-west3").firestore
  .document("bookOffers/{docId}").onDelete(async (snap) => {
    const deletedDocId = snap.id;
    const batch = admin.firestore().batch();

    const bookOffers = await admin.firestore()
      .collection("exchangeOffers")
      .where("bookOfferId", "==", deletedDocId)
      .get();

    bookOffers.forEach((bookOffer) => {
      batch.delete(bookOffer.ref);
    });

    batch.commit();
  });

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

    const counterOffers = await admin.firestore()
      .collection("exchangeOffers")
      .where("counterOfferId", "==", deletedDocId)
      .get();

    const chats1 = await admin.firestore()
      .collection("chats")
      .where("exchangeOfferData.counterOfferId", "==", deletedDocId)
      .get();

    const chats2 = await admin.firestore()
      .collection("chats")
      .where("exchangeOfferData.bookOfferId", "==", deletedDocId)
      .get();

    bookOffers.forEach((bookOffer) => {
      batch.delete(bookOffer.ref);
    });

    counterOffers.forEach((bookOffer) => {
      batch.delete(bookOffer.ref);
    });

    chats1.forEach((chat) => {
      batch.delete(chat.ref);
    });

    chats2.forEach((chat) => {
      batch.delete(chat.ref);
    });

    batch.commit();
  });

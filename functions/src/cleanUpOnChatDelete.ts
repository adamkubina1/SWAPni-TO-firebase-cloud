import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export const cleanUpOnChatDelete =
functions.region("europe-west3").firestore
  .document("chats/{docId}").onDelete(async (snap) => {
    const deletedDocId = snap.id;
    const batch = admin.firestore().batch();

    const messages = await admin.firestore()
      .collection("chats/" + deletedDocId + "/messages")
      .get();

    messages.forEach((bookOffer) => {
      batch.delete(bookOffer.ref);
    });

    batch.commit();
  });

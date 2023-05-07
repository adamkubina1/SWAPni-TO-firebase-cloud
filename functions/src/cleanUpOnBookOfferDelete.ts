import * as admin from "firebase-admin";
import {WriteResult} from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import * as _ from "lodash";

const MAX_BATCH_SIZE = 500;

export const cleanUpOnBookOfferDelete =
functions.region("europe-west3").firestore
  .document("bookOffers/{docId}").onDelete(async (snap) => {
    const deletedDocId = snap.id;

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

    if (bookOffers.empty && counterOffers.empty &&
      chats1.empty && chats2.empty) {
      return;
    }

    const batchPromises:Array<Promise<WriteResult[]>> = [];
    const tmp = [bookOffers.docs, counterOffers.docs, chats1.docs, chats2.docs];
    const allDocsToDelete = tmp.flat();

    const chunkedAllDocsToDelete = _.chunk(allDocsToDelete, MAX_BATCH_SIZE);

    chunkedAllDocsToDelete.forEach((chunk) => {
      const batch = admin.firestore().batch();

      chunk.forEach((doc) => {
        batch.delete(doc.ref);
      });
      batchPromises.push(new Promise(() => batch.commit()));
    });

    if (batchPromises.length < 1) return;

    Promise.all(
      batchPromises
    ).catch(() => {
      throw new
      functions.https.HttpsError("internal", "Batch delete operation failed.");
    });
  });

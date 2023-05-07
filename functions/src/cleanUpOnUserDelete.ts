import * as admin from "firebase-admin";
import {WriteResult} from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import * as _ from "lodash";

const MAX_BATCH_SIZE = 500;

export const cleanUpOnUserDelete =
functions.region("europe-west3").auth.user()
  .onDelete(async (user) => {
    const userId = user.uid;

    const bookOffers = await admin.firestore()
      .collection("bookOffers")
      .where("userId", "==", userId)
      .get();

    const bookDemands = await admin.firestore()
      .collection("bookDemands")
      .where("userId", "==", userId)
      .get();

    const exchangeOffers1 = await admin.firestore()
      .collection("exchangeOffers")
      .where("senderUserId", "==", userId)
      .get();

    const exchangeOffers2 = await admin.firestore()
      .collection("exchangeOffers")
      .where("receiverUserId", "==", userId)
      .get();

    const chats1 = await admin.firestore()
      .collection("chats")
      .where("exchangeOfferData.receiverUserId", "==", userId)
      .get();

    const chats2 = await admin.firestore()
      .collection("chats")
      .where("exchangeOfferData.senderUserId", "==", userId)
      .get();

    const reviews = await admin.firestore()
      .collection("users/" + userId + "/userReviews")
      .get();

    const batchPromises:Array<Promise<WriteResult[]>> = [];
    const tmp = [bookOffers.docs, bookDemands.docs,
      exchangeOffers1.docs, exchangeOffers2.docs,
      chats1.docs, chats2.docs, reviews.docs];
    const allDocsToDelete = tmp.flat();

    if (allDocsToDelete.length < 1) return;

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

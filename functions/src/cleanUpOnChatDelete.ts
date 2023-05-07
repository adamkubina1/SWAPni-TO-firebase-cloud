import * as admin from "firebase-admin";
import {WriteResult} from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import * as _ from "lodash";

const MAX_BATCH_SIZE = 500;

export const cleanUpOnChatDelete =
functions.region("europe-west3").firestore
  .document("chats/{docId}").onDelete(async (snap) => {
    const deletedDocId = snap.id;

    const messages = await admin.firestore()
      .collection("chats/" + deletedDocId + "/messages")
      .get();

    if (messages.empty) return;

    const chunkedMessages = _.chunk(messages.docs, MAX_BATCH_SIZE);
    const batchPromises:Array<Promise<WriteResult[]>> = [];

    chunkedMessages.forEach((chunk) => {
      const batch = admin.firestore().batch();

      chunk.forEach((message) => batch.delete(message.ref));
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

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export const createBookDemand =
functions.region("europe-west3").runWith({enforceAppCheck: true})
  .https.onCall(async (data, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from App check verified app."
      );
    }
    if (!context.auth) {
      throw new functions.https.HttpsError("failed-precondition",
        "The function must be called by authenticated user.");
    }

    const bookId = data?.bookId;

    if (!(typeof bookId === "string") || bookId.length < 3 ||
    bookId.length > 24) {
      throw new functions.https.HttpsError("invalid-argument",
        "The function must be called must be called with argument" +
        "bookId as a valid string.");
    }

    const bookTitle = data?.bookTitle;

    if (!(typeof bookTitle === "string") || bookTitle.length < 3 ||
    bookTitle.length > 256) {
      throw new functions.https.HttpsError("invalid-argument",
        "The function must be called must be called with argument" +
        "bookTitle as a valid string.");
    }

    const demands = await admin.firestore().collection("/bookDemands")
      .where("userId", "==", context.auth.uid)
      .where("bookId", "==", bookId).get();

    if (!demands.empty) {
      throw new functions.https.HttpsError("cancelled",
        "No users to receive email.");
    }

    admin.firestore().collection("/bookDemands")
      .doc()
      .create({bookId: bookId, userId: context.auth.uid,
        bookTitle: bookTitle});
  });

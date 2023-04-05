import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export const createExchangeOffer =
functions.region("europe-west3").runWith({enforceAppCheck: true})
  .https.onCall((data, context) => {
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

    const bookOfferId = data?.bookOfferId;

    if (!(typeof bookOfferId === "string") || bookOfferId.length < 3 ||
    bookId.length > 24) {
      throw new functions.https.HttpsError("invalid-argument",
        "The function must be called must be called with argument" +
        "bookOfferId as a valid string.");
    }

    const targetUserId = data?.targetUserId;

    if (!(typeof targetUserId === "string") || targetUserId.length < 3 ||
    bookId.length > 24) {
      throw new functions.https.HttpsError("invalid-argument",
        "The function must be called must be called with argument" +
        "targetUserId as a valid string.");
    }

    if (targetUserId === context.auth.uid) {
      throw new functions.https.HttpsError("invalid-argument",
        "The function must be called must be called with argument" +
        "targetUserId which is not equal to requesters uid.");
    }

    const message = data?.message;
    const bookOffer = data?.bookOffer;


    admin.firestore().collection("/exchangeOffers")
      .doc()
      .create({bookOfferId: bookOfferId,
        bookId: bookId, senderUserId: context.auth.uid,
        receiverUserId: targetUserId, message: message,
        bookOffer: bookOffer,
      });
  });

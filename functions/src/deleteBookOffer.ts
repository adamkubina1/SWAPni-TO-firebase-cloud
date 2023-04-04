import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export const deleteBookOffer =
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

    const bookOfferId = data?.bookOfferId;

    if (!(typeof bookOfferId === "string") || bookOfferId.length < 3 ||
    bookOfferId.length > 24) {
      throw new functions.https.HttpsError("invalid-argument",
        "The function must be called must be called with argument" +
        "bookOfferId as a valid string id.");
    }

    const bookId = data?.bookId;

    if (!(typeof bookId === "string") || bookId.length < 3 ||
    bookId.length > 24) {
      throw new functions.https.HttpsError("invalid-argument",
        "The function must be called must be called with argument" +
        "bookId as a valid string id.");
    }

    const batch = admin.firestore().batch();
    const pathUser = admin.firestore().doc("/users/" +
    context.auth.uid + "/bookOffers/" + bookOfferId);
    const pathBook = admin.firestore().doc("/books/" +
    bookId + "/bookOffers/" + bookOfferId);


    batch.delete(pathUser);
    batch.delete(pathBook);


    batch.commit();
  });

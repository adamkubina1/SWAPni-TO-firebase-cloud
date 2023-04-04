import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export const createBookOffer =
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

    const bookState = data?.bookOffer?.bookState;

    const offerNotes = data?.bookOffer?.notes;

    const batch = admin.firestore().batch();
    const pathUser = admin.firestore().collection("/users/" +
    context.auth.uid + "/bookOffers").doc();
    const pathBook = admin.firestore().collection("/books/" +
    bookId + "/bookOffers").doc(pathUser.id);


    batch.set(pathUser, {bookId: bookId,
      bookState: bookState, notes: offerNotes});
    batch.set(pathBook, {userId: context.auth.uid,
      bookState: bookState, notes: offerNotes});


    batch.commit();
  });

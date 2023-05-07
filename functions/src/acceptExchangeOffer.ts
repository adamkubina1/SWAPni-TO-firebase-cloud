import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export const acceptExchangeOffer =
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

    const exchangeOfferId = data?.exchangeOfferId;

    if (!(typeof exchangeOfferId === "string") || exchangeOfferId.length < 3 ||
    exchangeOfferId.length > 24) {
      throw new functions.https.HttpsError("invalid-argument",
        "The function must be called must be called with argument" +
        "exchangeOfferId as a valid string.");
    }

    const bookExchangeRef = await admin.firestore()
      .collection("/exchangeOffers")
      .doc(exchangeOfferId)
      .get();

    const exchangeOfferData = bookExchangeRef.data();

    if (!exchangeOfferData ||
        exchangeOfferData?.receiverUserId !== context.auth.uid) {
      throw new functions.https.HttpsError("permission-denied",
        "The function must be called must be by creator of" +
        " linked book offer.");
    }

    const batch = admin.firestore().batch();

    const exchangeOfferPath = admin.firestore()
      .collection("/exchangeOffers").doc(exchangeOfferId);

    batch.delete(exchangeOfferPath);

    const chatPath = admin.firestore()
      .collection("/chats").doc();

    batch.create(chatPath, {exchangeOfferData});

    batch.commit();
  });

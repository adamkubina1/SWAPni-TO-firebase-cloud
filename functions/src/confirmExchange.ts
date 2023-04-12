import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export const confirmExchange =
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

    const chatId = data?.chatId;

    if (!(typeof chatId === "string") || chatId.length < 3 ||
    chatId.length > 24) {
      throw new functions.https.HttpsError("invalid-argument",
        "The function must be called must be called with argument" +
        "chatId as a valid string.");
    }

    const chat = await admin.firestore().collection("/chats").doc(chatId).get();

    if (!chat.exists) {
      throw new functions.https.HttpsError("invalid-argument",
        "The function must be called must be called with argument" +
        "chatId as a valid string.");
    }

    const chatData = chat.data();


    if (context.auth.uid !== chatData?.exchangeOfferData.receiverUserId) {
      throw new functions.https.HttpsError("permission-denied",
        "User does not have permission to execute this operation");
    }

    // This is triggering cleanup
    admin.firestore().collection("/bookOffers")
      .doc(chatData.exchangeOfferData.bookOfferId).delete();
  });

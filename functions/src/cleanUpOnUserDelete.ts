import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export const cleanUpOnUserDelete =
functions.region("europe-west3").auth.user()
  .onDelete(async (user) => {
    const userId = user.uid;

    const batch = admin.firestore().batch();

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

    bookOffers.forEach((bookOffer) => {
      batch.delete(bookOffer.ref);
    });

    bookDemands.forEach((bookDemand) => {
      batch.delete(bookDemand.ref);
    });


    exchangeOffers1.forEach((exchangeOffer) => {
      batch.delete(exchangeOffer.ref);
    });

    exchangeOffers2.forEach((exchangeOffer) => {
      batch.delete(exchangeOffer.ref);
    });

    chats1.forEach((chat) => {
      batch.delete(chat.ref);
    });

    chats2.forEach((chat) => {
      batch.delete(chat.ref);
    });

    reviews.forEach((review) => {
      batch.delete(review.ref);
    });

    batch.commit();
  });

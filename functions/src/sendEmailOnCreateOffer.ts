import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export const sendEmailOnCreateOffer =
functions.region("europe-west3").firestore
  .document("/bookOffers/{bookOffer}").onCreate(async (snapshot) => {
    const createdOfferData = snapshot.data();

    const demandsToNotify = await admin.firestore().collection("/bookDemands")
      .where("bookId", "==", createdOfferData.bookId)
      .get();


    const emailList: Array<string> = [];

    // Foreach should not be used with async
    for ( let i = 0; i < demandsToNotify.docs.length; i++) {
      await admin.auth().getUser(demandsToNotify.docs[i].data().userId).then(
        (notifiedUser) => {
          if (notifiedUser.uid !== createdOfferData.userId) {
            emailList.push(notifiedUser.email ? notifiedUser.email : "");
          }
        }
      );
    }

    if (emailList.length < 1) {
      throw new functions.https.HttpsError("cancelled",
        "No users to receive email.");
    }

    admin.firestore().collection("/mail").doc()
      .create({to: emailList, message: {
        subject: "SWAPni-TO Nová nabídka",
        text: "Dobrý den, k vámi poptávané knize " +
        createdOfferData.bookTitle + " vznikla nová nabídka.",
      }});
  });

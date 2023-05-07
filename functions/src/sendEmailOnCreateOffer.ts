import * as admin from "firebase-admin";
import {UserRecord} from "firebase-admin/auth";
import * as functions from "firebase-functions";

export const sendEmailOnCreateOffer =
functions.region("europe-west3").firestore
  .document("/bookOffers/{bookOffer}").onCreate(async (snapshot) => {
    const createdOfferData = snapshot.data();

    const demandsToNotify = await admin.firestore().collection("/bookDemands")
      .where("bookId", "==", createdOfferData.bookId)
      .get();

    if (demandsToNotify.empty) {
      return;
    }

    const emailList: Array<string> = [];
    const promises: Array<Promise<UserRecord>> = [];

    demandsToNotify.docs.forEach((demand) => {
      if (demand.data().userId) {
        promises.push(new Promise(() =>
          admin.auth().getUser(demand.data().userId)));
      }
    });

    Promise.all(promises).then((usersToNotify) => {
      usersToNotify.forEach((userToNotify) => {
        if (createdOfferData.userId === userToNotify.uid &&
            userToNotify?.email) {
          emailList.push(userToNotify.email);
        }
      });
    }).catch(() => {
      throw new functions.https.HttpsError("internal",
        "Authentification system read error.");
    });

    if (emailList.length < 1) {
      return;
    }

    admin.firestore().collection("/mail").doc()
      .create({to: emailList, message: {
        subject: "SWAPni-TO Nová nabídka",
        text: "Dobrý den, k vámi poptávané knize " +
        createdOfferData.bookTitle + " vznikla nová nabídka.",
      }});
  });

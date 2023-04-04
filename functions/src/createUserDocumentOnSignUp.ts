import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export const createUserDocumentOnSignUp =
functions.region("europe-west3").auth.user().onCreate((user) => {
  admin.firestore().collection("users")
    .doc(user.uid)
    .create({userName: "Nový uživatel", bio: "Zatím jsem nic o sobě nenapsal"});
});

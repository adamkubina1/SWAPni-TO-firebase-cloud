import * as admin from "firebase-admin";
import * as functions from "firebase-functions";


export const updateUserReviewScore =
functions.region("europe-west3").firestore
  .document("/users/{user}/userReviews/{userReviews}")
  .onWrite(async (change, context) => {
    const reviews = await admin.firestore().collection("/users/" +
 context.params.user + "/userReviews").get();

    if (reviews.empty) {
      admin.firestore().collection("/users/").doc(context.params.user)
        .set({userScore: 0, reviewsCount: 0}, {merge: true});
    }

    let totalScore = 0;
    const count = reviews.size;

    reviews.docs.forEach((review) => {
      const data = review.data();
      totalScore += Number(data.stars);
    });

    if (count == 0) {
      throw new functions.https.HttpsError("aborted",
        "Division by zero.");
    }

    const newScore = totalScore / count;

    admin.firestore().collection("/users/").doc(context.params.user)
      .set({userScore: newScore, reviewsCount: count}, {merge: true});
  });

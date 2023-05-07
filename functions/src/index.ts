/* eslint-disable indent */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {acceptExchangeOffer} from "./acceptExchangeOffer";
import {cleanUpOnBookOfferDelete} from "./cleanUpOnBookOfferDelete";
import {cleanUpOnChatDelete} from "./cleanUpOnChatDelete";
import {cleanUpOnUserDelete} from "./cleanUpOnUserDelete";
import {confirmExchange} from "./confirmExchange";
import {createBookDemand} from "./createBookDemand";
import {createBookOffer} from "./createBookOffer";
import {createExchangeOffer} from "./createExchangeOffer";
import {createUserDocumentOnSignUp} from "./createUserDocumentOnSignUp";
import {sendEmailOnCreateOffer} from "./sendEmailOnCreateOffer";
import {updateUserReviewScore} from "./updateUserReviewScore";

admin.initializeApp(functions.config().firebase);

export {
    createUserDocumentOnSignUp,
    createBookOffer,
    createExchangeOffer,
    cleanUpOnBookOfferDelete,
    acceptExchangeOffer,
    updateUserReviewScore,
    createBookDemand,
    sendEmailOnCreateOffer,
    confirmExchange,
    cleanUpOnUserDelete,
    cleanUpOnChatDelete,
};


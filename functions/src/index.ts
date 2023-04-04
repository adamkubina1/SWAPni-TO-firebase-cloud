import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {createBookOffer} from "./createBookOffer";
import {createUserDocumentOnSignUp} from "./createUserDocumentOnSignUp";
import {deleteBookOffer} from "./deleteBookOffer";

admin.initializeApp(functions.config().firebase);

export {createUserDocumentOnSignUp, createBookOffer, deleteBookOffer};

const admin = require("firebase-admin");

const serviceAccount = require("./servicesAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://apibooks-7756d-default-rtdb.europe-west1.firebasedatabase.app"
});
const db = admin.firestore();
export { db, admin };
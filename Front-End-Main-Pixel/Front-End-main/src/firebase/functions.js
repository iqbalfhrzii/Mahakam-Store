// firebase/functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.setAdminRole = functions.https.onCall((data, context) => {
  // Check if the request is made by an admin
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admins can add other admins."
    );
  }

  const { uid, role } = data;

  // Set custom claims
  return admin
    .auth()
    .setCustomUserClaims(uid, { admin: true, role: role })
    .then(() => {
      return { result: "Admin role added successfully" };
    })
    .catch((error) => {
      throw new functions.https.HttpsError("internal", error.message);
    });
});

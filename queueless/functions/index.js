const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// Configure email transporter (update with your SMTP credentials)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.pass,
  },
});

// Triggered when a queue entry status changes to "called"
exports.onQueueStatusUpdate = functions.firestore
  .document("queues/{queueId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== "called" && after.status === "called") {
      const mailOptions = {
        from: functions.config().email.user,
        to: after.email,
        subject: "It's your turn! — Queueless",
        text: `Hi ${after.name},\n\nYou're up next! Please proceed to the counter.\n\nThank you for using Queueless.`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${after.email}`);
      } catch (error) {
        console.error("Email send failed:", error);
      }
    }
    return null;
  });

// AI wait-time estimate endpoint
exports.estimateWait = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  try {
    const snapshot = await db
      .collection("queues")
      .where("status", "==", "waiting")
      .get();

    const count = snapshot.size;
    // Simple estimate: 5 minutes per person ahead
    const estimatedMinutes = count * 5;
    return res.json({ estimatedMinutes });
  } catch (error) {
    console.error("estimateWait error:", error);
    return res.status(500).json({ error: "Failed to estimate wait time." });
  }
});

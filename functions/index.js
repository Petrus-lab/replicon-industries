// Path: functions/index.js

const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

exports.sendOrderConfirmationEmail = functions.firestore
  .document('jobs/{jobId}')
  .onUpdate((change, context) => {
    const after = change.after.data();

    if (after.paymentStatus === 'Paid') {
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: after.userEmail, // Assuming user email is saved in the job document
        subject: 'Order Confirmation',
        text: `Your order for ${after.fileName} is confirmed and is now ${after.status}.`,
      };

      return transporter.sendMail(mailOptions)
        .then(() => {
          console.log('Order email sent.');
        })
        .catch((error) => {
          console.error('Error sending email:', error);
        });
    }

    return null;
  });

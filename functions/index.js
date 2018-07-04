const functions = require('firebase-functions');
const mail = require('@sendgrid/mail');

const SENDGRID_API_KEY = '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'

mail.setApiKey(SENDGRID_API_KEY);

exports.sendInvitation = functions.https.onCall(() => {
  const msg = {
    to: 'oren.hollander@gmail.com',
    from: 'invitation@homegame.app',
    subject: 'Testing 123',
    text: 'Testing Testing',
    html: '<strong>Testing again</strong>',
  };
  mail.send(msg);
  return msg;
});

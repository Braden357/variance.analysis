/**
 * Run once: node scripts/get-gmail-token.js
 * Prints a refresh token — paste it into .env.local as GMAIL_REFRESH_TOKEN
 */
const { google } = require("googleapis");
const readline = require("readline");

const CLIENT_ID = process.env.GMAIL_CLIENT_ID ?? "YOUR_CLIENT_ID_HERE";
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET ?? "YOUR_CLIENT_SECRET_HERE";
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob"; // copy-paste flow, no redirect server needed

const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/gmail.send"],
  prompt: "consent", // forces refresh_token to be returned
});

console.log("\n=== GMAIL OAUTH SETUP ===\n");
console.log("1. Open this URL in your browser:\n");
console.log(authUrl);
console.log("\n2. Authorize with your Google account");
console.log("3. Copy the authorization code shown\n");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Paste the authorization code here: ", async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2.getToken(code.trim());
    console.log("\n=== SUCCESS ===\n");
    console.log("Add this to your .env.local:\n");
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("\nAlso add the Gmail address you authorized as:");
    console.log("GMAIL_FROM=your.email@gmail.com\n");
  } catch (err) {
    console.error("Error getting tokens:", err.message);
  }
});

🛠️ Replicon Industries – Platform Operations Manual
📌 Purpose
This document outlines the full operational structure, configuration, and maintenance procedures for the Replicon Industries 3D Printing Platform.

✅ Platform Overview
Platform Name: Replicon Industries

Live Website: https://replicon-industries.vercel.app

Repository: https://github.com/Petrus-lab/replicon-industries

Deployment Service: Vercel (Production Environment)

Authentication: Firebase (Email, Google Sign-In)

Database: Firebase Firestore

Storage Bucket:

Reference: gs://replicon-industries.firebasestorage.app

Location: us-central1

🗂️ File and Folder Structure
markdown
Copy code
/public
/src
  /components
    - AdminPanel.jsx
    - AuthPage.jsx
    - LogoutButton.jsx
    - ShippingForm.jsx
    - UploadForm.jsx
  - App.jsx
  - firebase.js
  - main.jsx
  - index.js
⚙️ Firebase Configuration
🔑 Web API Key
AIzaSyCofcjuxiaqb9m6SpoSEmdi0Bku9EccZK4

🆔 Project ID
replicon-industries

🗃️ Storage Bucket
replicon-industries.appspot.com

🛡️ Admin Account
Email: admin@replicon.local

Password: PrintReady!2025

UID: rg9sFsRL5nRZdBmNule4XaqFUqB3

📝 Firestore Collections
/users/{uid}

/orders/{orderId}

/settings/pricing

/jobs/{jobId}

/shipping/{uid}

🔐 Firestore Rules
plaintext
Copy code
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    match /settings/{docId} {
      allow read: if request.auth != null && request.auth.token.admin == true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    match /jobs/{jobId} {
      allow read, write: if request.auth != null;
    }
    match /shipping/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
🗄️ Storage Rules
plaintext
Copy code
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
🛠️ Local Development Setup
bash
Copy code
npm install
npm start
🚀 Deployment Instructions
Push your changes to GitHub:

bash
Copy code
git add .
git commit -m "Your commit message here"
git push origin main
Vercel will automatically redeploy using the Production Environment.

📋 Maintenance Tasks
Periodically review Firebase rules to ensure security.

Rotate admin passwords and update the admin claim if needed.

Update dependencies with:

bash
Copy code
npm update
Monitor Vercel deployments for errors or failed builds.

📝 Notes
Any manual intervention on Firebase or Vercel should be documented here.

Maintain backup copies of Firebase and Firestore configurations.


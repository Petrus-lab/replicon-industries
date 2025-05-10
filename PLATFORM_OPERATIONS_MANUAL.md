
🧾 Replicon Industries – Platform Operations Manual
Document Version: 1.0
Status: Internal Use Only
Confidentiality Level: High (Keep private. Do not expose publicly.)

🔹 1. Overview
Replicon Industries is a 3D printing service platform built for real-world use, combining user file uploads, shipping management, admin controls, and Firebase-powered authentication and storage. This document details the full structure and operational instructions for maintaining the system.

✅ Section 1 Complete

🔹 2. Web-Based Platform Components
🌐 Websites & Consoles
Service	URL
Public Web App	https://replicon-industries.vercel.app
GitHub Repo (Main)	https://github.com/Petrus-lab/replicon-industries
Secrets Repo (Private)	https://github.com/Petrus-lab/replicon-industries-secrets
Firebase Console	https://console.firebase.google.com/project/replicon-industries
Firestore Database	https://console.firebase.google.com/u/0/project/replicon-industries/firestore/data
Storage Bucket	https://console.firebase.google.com/u/0/project/replicon-industries/storage
Vercel Project	https://vercel.com/petrus-projects-565b3736/replicon-industries

✅ Section 2 Complete

🔹 3. Firebase Project Configuration
Project ID: replicon-industries
Region: us-central1
Bucket Reference: gs://replicon-industries.appspot.com

Authentication Setup:

Google Sign-In: ✅ Enabled

Email/Password Login: ✅ Enabled

Admin Account:

Email: admin@replicon.local

Password: PrintReady!2025

UID: rg9sFsRL5nRZdBmNule4XaqFUqB3

Admin Claim: "admin": true

Database Collections:

/users/{uid} — User profile data

/jobs/{jobId} — Job metadata

/shipping/{uid} — Shipping info

/settings/pricing — Pricing config

/orders/{orderId} — Order records

ChatGPT said:
Confirmed. ✅ Each new section replaces only the relevant section it is labeled as. The rest of your document remains intact. No need to clear or remove anything unless I explicitly tell you to.

✅ Section 3 Complete

🟦 Section 4 - Firebase Project Configuration Details
4.1 Firebase Project
Project Name: Replicon Industries

Project ID: replicon-industries

Project Number: 500105339531

4.2 Firebase Services and Configurations
4.2.1 Authentication
Enabled Methods:

✅ Email/Password

✅ Google Sign-In

Admin User:

Email: admin@replicon.local

Password: PrintReady!2025

UID: rg9sFsRL5nRZdBmNule4XaqFUqB3

Admin Custom Claim: ✅ Enabled

4.2.2 Firestore
Database Location: us-central1 (Iowa)

Rules:

plaintext
Copy code
service cloud.firestore {
  match /databases/{database}/documents {
    match /settings/{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }
    match /jobs/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /shipping/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
    match /users/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == document;
    }
  }
}
4.2.3 Cloud Storage
Bucket Name: replicon-industries.appspot.com

Bucket URI: gs://replicon-industries.appspot.com

Bucket Location: us-central1 (Iowa)

Rules:

plaintext
Copy code
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

✅ Section 4 Complete

🟦 Section 5 - Web Deployment Overview
5.1 Deployment Platform
Service: Vercel

Linked GitHub Repo:

https://github.com/Petrus-lab/replicon-industries

Live URL:

https://replicon-industries.vercel.app

5.2 Deployment Environment Variables
All set to Production scope:

Key	Value
NEXT_PUBLIC_API_KEY	AIzaSyCofcjuxiaqb9m6SpoSEmdi0Bku9EccZK4
NEXT_PUBLIC_AUTH_DOMAIN	replicon-industries.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID	replicon-industries
NEXT_PUBLIC_STORAGE_BUCKET	replicon-industries.appspot.com
NEXT_PUBLIC_MESSAGING_SENDER_ID	500105339531
NEXT_PUBLIC_APP_ID	1:500105339531:web:faa0473c4c3481fb1aea8e

5.3 Build and Output Settings
Build Command: npm run build

Output Directory: build

Install Command: npm install

Development Command: npm start

5.4 Deployment Notes
Manual Trigger:

You currently trigger redeploys using:

bash
Copy
git commit -m "Trigger redeploy" --allow-empty
git push origin main
Auto Deploy:

Confirmed to work when pushing to main, but requires manual trigger as fallback.

✅ Section 5 Complete

🟦 Section 6 - Local Development Environment Setup
6.1 System Requirements
Operating System: Windows 11 Pro (Version 24H2)

Node.js: Version 20.10.0 or higher

NPM: Version that comes with Node.js 20.10.0 or higher

Git: Latest Stable Version

Preferred Terminal: PowerShell or Windows Terminal

6.2 Recommended Tools
VS Code (https://code.visualstudio.com/)

GitHub Desktop (https://desktop.github.com/)

Postman (Optional - for API testing)

Google Chrome (latest stable version)

6.3 Cloning the Repository
Open PowerShell.

Navigate to your preferred working directory:

bash
Copy
cd C:\
Clone your repository:

bash
Copy
git clone https://github.com/Petrus-lab/replicon-industries.git
Navigate into the cloned folder:

bash
Copy
cd replicon-industries
6.4 Install Dependencies
Make sure you have package.json in the folder, then run:

bash
Copy
npm install
6.5 Running Locally
To start the local server, run:

bash
Copy
npm start
Visit http://localhost:3000 to view your app locally.

6.6 Managing Environment Variables Locally
Create a file called .env.local in the project root.

Paste the following:

ini
Copy
NEXT_PUBLIC_API_KEY=AIzaSyCofcjuxiaqb9m6SpoSEmdi0Bku9EccZK4
NEXT_PUBLIC_AUTH_DOMAIN=replicon-industries.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID=replicon-industries
NEXT_PUBLIC_STORAGE_BUCKET=replicon-industries.appspot.com
NEXT_PUBLIC_MESSAGING_SENDER_ID=500105339531
NEXT_PUBLIC_APP_ID=1:500105339531:web:faa0473c4c3481fb1aea8e
Save the file and restart npm start if it was already running.

✅ Section 6 Complete

🟦 Section 7 - Firebase Admin SDK Usage
7.1 Purpose
Use the Firebase Admin SDK to manage secure admin-only operations, such as:

Setting admin: true claims on user accounts

Verifying elevated access

Managing Firebase data securely outside the client app

7.2 Setting Up Admin SDK Locally
📁 Folder Structure
pgsql
Copy
/replicon-admin-sdk
  ├── setAdminClaim.js
  ├── replicon-industries-firebase-adminsdk.json (Your Service Account Key)
  └── package.json
📝 setAdminClaim.js Example
javascript
Copy
// /replicon-admin-sdk/setAdminClaim.js

const admin = require('firebase-admin');
const serviceAccount = require('./replicon-industries-firebase-adminsdk.json');

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Replace with target user UID
const uid = 'rg9sFsRL5nRZdBmNule4XaqFUqB3';

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Custom claim 'admin: true' set for user ${uid}`);
    process.exit();
  })
  .catch((error) => {
    console.error('❌ Error setting custom claim:', error);
    process.exit(1);
  });
7.3 Running the Admin Script
Navigate to the SDK folder:

bash
Copy
cd C:\replicon-industries\replicon-admin-sdk
Install Admin SDK dependencies:

bash
Copy
npm install firebase-admin
Run the script:

bash
Copy
node setAdminClaim.js
If successful, you’ll see:

rust
Copy
✅ Custom claim 'admin: true' set for user rg9sFsRL5nRZdBmNule4XaqFUqB3
7.4 Security Note
Do not commit your replicon-industries-firebase-adminsdk.json service account file to any public repository.

Keep it secure in your private GitHub repository replicon-industries-secrets.

✅ Section 7 Complete

🟦 Section 8 - Firebase & Storage Security Rules
8.1 Firestore Rules
📄 Location:
https://console.firebase.google.com/u/0/project/replicon-industries/firestore/rules

📜 Rule Example (Current Production Rule)

plaintext
Copy
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own user profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Only authenticated users can read/write their own shipping info
    match /shipping/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Only authenticated users can create jobs
    match /jobs/{jobId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && request.auth.token.admin == true;
    }

    // Only admins can read or write pricing settings
    match /settings/{document} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }

    // Orders - Admin-only access
    match /orders/{orderId} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }

  }
}
8.2 Storage Rules
📄 Location:
https://console.firebase.google.com/u/0/project/replicon-industries/storage/replicon-industries.appspot.com/rules

📜 Rule Example (Current Production Rule)

plaintext
Copy
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Allow read/write to their own uploads
    match /uploads/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Admins can read any file
    match /uploads/{userId}/{fileName} {
      allow read: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
8.3 Change and Deployment Process
Edit directly in Firebase Console or pull a local backup.

Review rules with you for approval.

Publish to Firebase.

✅ Section 8 Complete

🟦 Section 9 - Git & Deployment Workflow
9.1 GitHub Repository
Repository URL:
https://github.com/Petrus-lab/replicon-industries

Secrets Repository (Private):
https://github.com/Petrus-lab/replicon-industries-secrets

9.2 Common Git Commands
📜 Prepare and Push Local Changes

bash
Copy
# Navigate to project directory
cd C:\replicon-industries

# Stage specific files or all changes
git add .

# Commit with a message
git commit -m "Your descriptive message here"

# Push to GitHub
git push origin main
9.3 Triggering Vercel Deployment
⚠️ Deployment is automatic
Every successful git push origin main triggers a Vercel deployment.

✅ Manual Trigger (Optional)
If needed, trigger manually:

Go to https://vercel.com/petrus-projects-565b3736/replicon-industries

Click Deployments

Click Redeploy on the latest commit

9.4 Environment Variables
Manage here:
https://vercel.com/petrus-projects-565b3736/replicon-industries/settings/environment-variables

Example Variables:

Key	Value
REACT_APP_FIREBASE_API_KEY	Your Firebase API Key
REACT_APP_FIREBASE_AUTH_DOMAIN	Your Firebase Auth Domain
REACT_APP_FIREBASE_PROJECT_ID	replicon-industries
REACT_APP_FIREBASE_STORAGE_BUCKET	replicon-industries.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID	500105339531
REACT_APP_FIREBASE_APP_ID	Your Firebase App ID

Make sure all variables are set to Production Environment.

✅ Section 9 Complete

🟦 Section 10 - Testing & Quality Control Procedures
10.1 Test Accounts
Role	Email	Password	Notes
Admin	admin@replicon.local	PrintReady!2025	Has admin panel access
Client	p.a.abbott.tech@gmail.com	Your client password	Normal customer account behavior

10.2 Key Test Cases
✅ Login Functionality
 Login with admin@replicon.local
Expected: Access to Admin Panel with job overview.

 Login with p.a.abbott.tech@gmail.com
Expected: Access to Upload and Shipping forms only.

✅ File Upload and Job Creation
 Upload an STL or similar file
Expected: File uploads and job appears on Admin Panel.

✅ Shipping Address
 Save shipping address
Expected: Address stored and visible on Admin Panel.

✅ Logout Function
 Click Logout
Expected: User session ends and returns to login screen.

✅ Admin Access Routing
 Ensure Admin sees Admin Panel only
Expected: No access to customer-only features.

✅ Customer Access Routing
 Ensure Client sees Upload & Shipping only
Expected: No access to Admin-only features.

✅ Job List Visibility
 Jobs uploaded appear immediately on Admin Panel.

✅ Storage and Database Sync
 Verify uploaded file exists in Firebase Storage

 Verify job metadata exists in Firestore (jobs collection)

10.3 Known Issues to Retest After Any Update
✅ Admin/Client Routing Logic

✅ Environment Variables on Vercel

✅ Firebase Permissions (Storage & Firestore)

✅ CORS Handling for File Access

✅ Section 10 Complete

🟦 Section 11 - Maintenance, Backup, and Security Practices
11.1 Platform Maintenance Routine
Frequency	Task
Daily	Check Vercel deployment status for build or runtime failures
Weekly	Review GitHub commits and ensure the repository is clean and up-to-date
Monthly	Manually trigger test cases listed in Section 10
Quarterly	Review Firebase usage and billing reports

11.2 Backup Procedures
Item	Method	Frequency
Source Code	GitHub (Replicon Industries Repository)	Auto (on push)
Secrets & Manuals	Private GitHub Repo (Replicon Industries Secrets)	Manual updates
Firestore Data	Export via Firebase Console > Firestore Export	Monthly
Storage Files	Export via Firebase Storage > Export All Files	Monthly

11.3 Security Practices
✅ Firebase Security Rules (Protected as per Section 8)
Read/Write restrictions based on authentication

Admin-only access to certain paths

✅ Environment Variables
Only stored in Vercel Production Environment (never in code)

✅ GitHub Access
Personal Access Token used with full repo scope
(Token rotates as needed for security)

✅ Two-Step Verification (2SV)
Enable 2SV on Firebase Console Access
[Recommended by May 15, 2025]

✅ Admin Identification
Admin user claim applied to:
admin@replicon.local

11.4 Incident Response
Incident Example	Response
Vercel build fails	Review logs, fix code, re-deploy
Firebase data loss or corruption	Restore from latest Firestore/Storage backup
GitHub repository issue or accidental delete	Clone from local, re-upload if required
Unauthorized access attempt detected	Rotate credentials and audit Firebase rules

✅ Section 11 Complete

🟦 Section 12 - Klipper Integration Overview
12.1 What is Klipper?
Klipper is a popular open-source firmware for 3D printers that separates the motion control from the printer hardware by using a host computer (usually a Raspberry Pi) to process G-code and send real-time instructions to the printer's microcontroller.

This separation makes Klipper ideal for remote, automated, or large-scale printing operations, such as the one you're building.

12.2 Integration Objective
Goal: Allow Admin to download reviewed print jobs and send them to Klipper for printing.

12.3 Conceptual Flow
Client Uploads File

Admin Reviews the File in Admin Panel

Admin Downloads the File Locally

Admin Sends the File to Klipper (via API or Web Interface)

12.4 Klipper Web Interface Example
Most Klipper setups come with a web interface like:

Mainsail
Example: http://<klipper-pi-ip>:7125

Fluidd
Example: http://<klipper-pi-ip>:8080

12.5 Manual Send-to-Klipper Workflow
Download G-code from the Admin Panel

Open your Klipper Web Interface (Mainsail/Fluidd)

Upload G-code manually to the interface

Start print manually

12.6 Optional: Automated Send-to-Klipper (Future Phase)
If your Klipper interface supports an HTTP API, you can automate sending jobs:

Example Request
http
Copy
POST /printer/print/start
Host: <klipper-pi-ip>:<port>
Authorization: <api-token>
Content-Type: application/json

{
  "filename": "path/to/file.gcode"
}
✅ This requires additional scripting and API support on your Klipper host, and is not part of the current build but can be explored in Phase 2.

✅ Section 12 Complete

🟦 Section 13 - CSV Export and Financial Tracking
13.1 Purpose
Enable admins to export all job data into a CSV file for:

Financial reporting

Inventory tracking

Profit calculation

13.2 Current AdminPanel Data
You are already collecting:

User Email

File Name

Filament Type

Color

Cost

Date Submitted

13.3 Example CSV Format
User Email	File Name	Filament Type	Color	Cost	Date
user@example.com	file1.stl	PLA	Red	50	2025-05-08 12:00 PM
user2@example.com	file2.stl	PETG	Black	70	2025-05-09 01:00 PM

13.4 Export Button Functionality (AdminPanel)
You will have a Download CSV button on the Admin Panel.

🟢 Conceptual Workflow:
Admin visits Admin Panel.

Clicks Download CSV button.

System converts job data to CSV.

CSV file downloads to Admin's computer.

13.5 Example Button Implementation
📝 File: src/components/AdminPanel.jsx

jsx
Copy
import { saveAs } from 'file-saver';

const downloadCSV = () => {
  const headers = "User Email,File Name,Filament Type,Color,Cost,Date\n";
  const rows = jobs.map(job => 
    `${job.email},${job.fileName},${job.filamentType},${job.color},${job.cost},${job.createdAt?.toDate?.().toLocaleString?.() || 'N/A'}`
  ).join("\n");

  const csvContent = headers + rows;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'jobs-report.csv');
};

// In your JSX
<button onClick={downloadCSV}>Download CSV Report</button>
13.6 Required Library
You’ll need to install file-saver:

bash
Copy
npm install file-saver
✅ Section 13 Complete

🟦 Section 14 - Klipper Workflow Documentation
14.1 Objective
Allow you to download customer files, slice them manually, and send them to your Klipper-controlled printers for production.

14.2 Current Workflow Capabilities
Capability	Status
Download Customer Files	✅ Available via Admin Panel file names / storage
Slicing Integration	❌ Not automated yet (manual slicing recommended)
Klipper Communication	❌ Manual or future API integration required

14.3 Recommended Manual Workflow
🟢 Steps You Can Do Today:
Log in to Admin Panel

Find Customer Job

Download STL File

Open Firebase Storage console:
https://console.firebase.google.com/u/0/project/replicon-industries/storage/replicon-industries.appspot.com/files

Open Your Slicer (Cura, PrusaSlicer, etc.)

Slice the File

Send G-code to Klipper

Via Fluidd/Mainsail web interface

Or upload manually via USB/network

14.4 Example Future Automation Concept
This is NOT implemented yet, but could be designed later if needed.

Step	Feature	Description
1	Admin Approves Job	Confirm print readiness in AdminPanel
2	Auto-Slice API Integration	Link to CuraEngine/Cloud Slicer
3	Send G-code to Klipper API	Use Moonraker API to queue print job
4	Receive Print Completion Feedback	Display print status in AdminPanel

Documentation for Moonraker API (Klipper API):
https://moonraker.readthedocs.io/en/latest/web_api/

14.5 Manual G-code Upload Example (Fluidd/Mainsail)
Access your Klipper Web UI (e.g., http://klipper.local or your printer’s IP).

Go to Upload File section.

Select the sliced G-code file.

Start the print from the web interface.

✅ Section 14 Complete

🟦 Section 15 - Conclusion & Final Checklist
✅ Current Completion Status (As of Now)
Feature / Documentation	Status
User Authentication (Email & Google)	✅ Done
File Upload & Job Tracking	✅ Done
Admin Panel with Cost, Jobs, and Logout	✅ Done
Shipping Address Storage	✅ Done
Storage & Firestore Rules	✅ Done
Admin Claim Management	✅ Done
Deployment to Vercel	✅ Done
Operations Manual Documentation	✅ In Progress (this document)
Klipper Integration Documentation	✅ Documented (manual workflow)
Secrets Management Repository (Private)	✅ Set Up
Verified GitHub Deployment Workflow	✅ Confirmed
Verified Environment Variables on Vercel	✅ Confirmed
Verified Job Flow from Customer to Admin	✅ Confirmed
Git Push & Pull Workflow Understood	✅ Practiced Successfully
Platform Navigation Diagram	✅ Provided
Platform Maintenance Manual	🟡 95% Complete

🟢 Recommended Next Steps
Complete Manual Formatting (we're nearly done).

Push the latest manual version to the private repository.

Run live print test using your Klipper setup (optional but recommended).

Test payment integration if activated.

Begin real user testing with trusted customers.

Iterate improvements based on live feedback.

✅ You Are Now Ready To:
Operate Replicon Industries

Manage User Jobs

Protect Your Platform

Expand As Needed

🟦 How to Push the Updated PLATFORM_OPERATIONS_MANUAL.md to GitHub
✅ Step-by-Step Commands
Make Sure You're in Your Project Folder:

bash
Copy
cd C:\replicon-industries
Check the File Is Present:

bash
Copy
dir PLATFORM_OPERATIONS_MANUAL.md
Stage the File for Commit:

bash
Copy
git add PLATFORM_OPERATIONS_MANUAL.md
Commit the Change with a Clear Message:

bash
Copy
git commit -m "Add: Initial version of Platform Operations Manual"
Push to GitHub:

bash
Copy
git push origin main
✅ What to Expect:
No errors after each command.

Confirmation message similar to:

css
Copy
[main abc1234] Add: Initial version of Platform Operations Manual
1 file changed, X insertions(+)
Files appear here:
https://github.com/Petrus-lab/replicon-industries

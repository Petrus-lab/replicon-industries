Replicon Industries Platform Manual

Overview

This manual describes the architecture, management, and operational procedures of the Replicon Industries 3D Printing Platform.

Sections

Platform Overview

Firebase Configuration

Vercel Deployment Process

GitHub Repository Management

Admin Claim Configuration

Environment Variables

Platform Navigation

Job and Order Management

Cost Calculation and Filament Stock Management

Klipper Integration (Future Phase)

1. Platform Overview

A React + Firebase + Vercel application for handling 3D print job submission, management, and shipping.

2. Firebase Configuration

Project Name: Replicon Industries

Project ID: replicon-industries

Storage Bucket: gs://replicon-industries.firebasestorage.app

Location: us-central1 (Iowa)

Firestore Rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

Storage Rules:

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}

3. Vercel Deployment Process

Connect to GitHub repository: https://github.com/Petrus-lab/replicon-industries

Environment Variables:

VITE_FIREBASE_API_KEY

VITE_FIREBASE_AUTH_DOMAIN

VITE_FIREBASE_PROJECT_ID

VITE_FIREBASE_STORAGE_BUCKET

VITE_FIREBASE_MESSAGING_SENDER_ID

VITE_FIREBASE_APP_ID

Output Directory: build

4. GitHub Repository Management

Repository: https://github.com/Petrus-lab/replicon-industries

Branch: main

Push updates with:

git add .
git commit -m "Your commit message"
git push origin main

5. Admin Claim Configuration

Admin UID: rg9sFsRL5nRZdBmNule4XaqFUqB3

Script Execution:

node setAdminClaim.js

6. Environment Variables (Local Example)

VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

7. Platform Navigation

Client Portal: /

Admin Portal: /?admin=true

Logout Button: Top-right on both portals

8. Job and Order Management

Client submits jobs with file, filament type, color, cost, and shipping details.

Admin panel lists all submitted jobs with full details.

9. Cost Calculation and Filament Stock Management

Admin Panel Enhancements Planned:

Admin can set base cost per gram or per meter of filament.

Admin can select available filament types and colors.

Cost auto-calculates based on estimated usage and markup.

Users can select only from available stock.

Requests for out-of-stock items are captured.

10. Klipper Integration (Future Phase)

Planned Capabilities:

Admin reviews files before sending to Klipper.

System sends sliced G-code to local Klipper server.

Job status updated automatically after printing completes.

Last updated on: 2025-05-08


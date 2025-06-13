# Replicon Industries – Firestore Structure Reference (June 2025)

/  
├── users/
│   └── {userId}/
│       ├── email: string
│       ├── name: string
│       ├── isAdmin: boolean
│       ├── phoneNumber: string
│       ├── defaultFinish: string  // 'raw' | 'supports_removed' | 'ready_to_go'
│       ├── defaultQuality: string // 'draft' | 'fit_check' | 'prototype' | 'production'
│
├── profiles/
│   └── {userId}/
│       ├── material: string
│       ├── color: string
│       ├── materialFinish: string
│       ├── finish: string
│       ├── quality: string
│       ├── billingAddress: object
│           ├── fullName
│           ├── phoneNumber
│           ├── line1
│           ├── line2
│           ├── suburb
│           ├── city
│           ├── postalCode
│           ├── country
│           └── fullAddress

├── shipping/
│   └── {userId}/
│       ├── defaultShipping: object
│       │   ├── fullName, phoneNumber, line1, line2, suburb, city, postalCode, country, fullAddress
│       ├── oneOffShipping: object
│       │   ├── (same fields as above)

├── jobs/
│   └── {jobId}/
│       ├── uid: string
│       ├── fileUrl: string
│       ├── fileName: string
│       ├── material: string
│       ├── color: string
│       ├── materialFinish: string
│       ├── finish: string   // post-processing level
│       ├── quality: string
│       ├── status: string
│       ├── createdAt: timestamp
│       └── cost: number (if quoted)

├── orders/
│   └── {orderId}/
│       ├── userId: string
│       ├── fileUrl: string
│       ├── material: string
│       ├── color: string
│       ├── status: string
│       └── cost: number

├── inventory/
│   └── {itemId}/
│       ├── material: string
│       ├── color: string
│       ├── finish: string
│       ├── rollSize: string (e.g. '1kg', '3kg')
│       ├── price: number
│       ├── stockLevel: number
│       ├── reorderThreshold: number
│       ├── supplier: string
│       ├── orderNumber: string
│       ├── arrivalDate: timestamp

├── settings/
│   ├── pricing/
│   │   ├── availableMaterials: array
│   │   └── availableColors: array
│   └── markupSettings: number
//
//  SecurityRules.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/18/24.
//

import Foundation

/*
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /users/{userId}/favorite_products/{userFavoriteProductId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /products/{productId} {
        allow read: if request.auth != null;
      allow create: if request.auth != null && isAdmin(request.admin.uid);
      allow update: if request.auth != null && isAdmin(request.admin.uid);
      allow delete: if false;
    }
    
    function isAdmin(userId) {
        return exists(/databases/$(database)/documents/admins/$(userId));
    }
  }
}

// read
// get - single document read
// list - queries and collection read requests
//
// write
// create - add document
// update - edit document
// delete - delete document
*/

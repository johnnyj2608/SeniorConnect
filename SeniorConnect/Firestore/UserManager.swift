//
//  UserManager.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/12/24.
//

import Foundation
import FirebaseFirestore
import FirebaseFirestoreSwift

struct Activity: Codable {
    let id: String
    let name: String
    let support: Bool
}

struct DBUser: Codable {
    
    let userId: String
    let email: String?
    let photoUrl: String?
    let dateCreated: Date?
    let preferenceLanguage: [String]?
    let favoriteActivity: Activity?
    
    init(auth: AuthDataResultModel) {
        self.userId = auth.uid
        self.email = auth.email
        self.photoUrl = auth.photoUrl
        self.dateCreated = Date()
        self.preferenceLanguage = nil
        self.favoriteActivity = nil
    }
    
    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case email = "email"
        case photoUrl = "photo_url"
        case dateCreated = "date_created"
        case languagePreference = "language_preference"
        case favoriteActivity = "favorite_activity"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.userId = try container.decode(String.self, forKey: .userId)
        self.email = try container.decodeIfPresent(String.self, forKey: .email)
        self.photoUrl = try container.decodeIfPresent(String.self, forKey: .photoUrl)
        self.dateCreated = try container.decodeIfPresent(Date.self, forKey: .dateCreated)
        self.preferenceLanguage = try container.decodeIfPresent([String].self, forKey: .languagePreference)
        self.favoriteActivity = try container.decodeIfPresent(Activity.self, forKey: .favoriteActivity)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(self.userId, forKey: .userId)
        try container.encodeIfPresent(self.email, forKey: .email)
        try container.encodeIfPresent(self.photoUrl, forKey: .photoUrl)
        try container.encodeIfPresent(self.dateCreated, forKey: .dateCreated)
        try container.encodeIfPresent(self.preferenceLanguage, forKey: .languagePreference)
        try container.encodeIfPresent(self.favoriteActivity, forKey: .favoriteActivity)
    }
}

final class UserManager {
    
    static let shared = UserManager()
    private init() {
        
    }
    
    private let userCollection: CollectionReference = Firestore.firestore().collection("users")
    
    private func userDocument(userId: String) -> DocumentReference {
        userCollection.document(userId)
    }
    
    private func userFavoriteProductsCollection(userId: String) -> CollectionReference {
        userDocument(userId: userId).collection("favorite_products")
    }
    
    private func userFavoriteProductsDocument(userId: String, favoriteProductId: String) -> DocumentReference {
        userFavoriteProductsCollection(userId: userId).document(favoriteProductId)
    }
    
    private let encoder: Firestore.Encoder = {
        let encoder = Firestore.Encoder()
//        encoder.keyEncodingStrategy = .convertToSnakeCase
        return encoder
    }()

    private let decoder: Firestore.Decoder = {
        let decoder = Firestore.Decoder()
//        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return decoder
    }()
    
    func createUser(user: DBUser) async throws {
        try userDocument(userId: user.userId).setData(
            from: user,
            merge: false)
    }
    
    func getUser(userId: String) async throws -> DBUser {
        try await userDocument(userId: userId).getDocument(
            as: DBUser.self)
    }
    
    func addLanguagePreference(userId: String, preference: String) async throws {
        let data: [String:Any] = [
            DBUser.CodingKeys.languagePreference.rawValue : FieldValue.arrayUnion([preference])
        ]
        try await userDocument(userId: userId).updateData(data)
    }
    
    func removeLanguagePreference(userId: String, preference: String) async throws {
        let data: [String:Any] = [
            DBUser.CodingKeys.languagePreference.rawValue : FieldValue.arrayRemove([preference])
        ]
        
        try await userDocument(userId: userId).updateData(data)
    }
    
    func addFavoriteActivity(userId: String, activity: Activity) async throws {
        guard let data = try? encoder.encode(activity) else {
            throw URLError(.badURL)
        }
        
        let dict: [String:Any] = [
            DBUser.CodingKeys.favoriteActivity.rawValue : data
        ]
        
        try await userDocument(userId: userId).updateData(dict)
    }
    
    func removeFavoriteActivity(userId: String) async throws {
        let data: [String:Any?] = [
            DBUser.CodingKeys.favoriteActivity.rawValue : nil
        ]
        
        try await userDocument(userId: userId).updateData(data as [AnyHashable : Any])
    }
    
    func addFavoriteProduct(userId: String, productId: Int) async throws {
        let document = userFavoriteProductsCollection(userId: userId).document()
        let documentId = document.documentID
        
        let data: [String:Any] = [
            UserFavoriteProduct.CodingKeys.id.rawValue : documentId,
            UserFavoriteProduct.CodingKeys.productId.rawValue : productId,
            UserFavoriteProduct.CodingKeys.dateCreated.rawValue : Timestamp()
        ]
        
        try await document.setData(data, merge: false)
    }
    
    func removeFavoriteProduct(userId: String, favoriteProductId: String) async throws {
        try await userFavoriteProductsDocument(userId: userId, favoriteProductId: favoriteProductId).delete()
    }
    
    func getAllFavoriteProducts(userId: String) async throws -> [UserFavoriteProduct] {
        try await userFavoriteProductsCollection(userId: userId).getDocuments(as: UserFavoriteProduct.self)
    }
}

struct UserFavoriteProduct: Codable {
    let id: String
    let productId: Int
    let dateCreated: Date
    
    enum CodingKeys: String, CodingKey {
        case id = "id"
        case productId = "product_id"
        case dateCreated = "date_created"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.productId = try container.decode(Int.self, forKey: .productId)
        self.dateCreated = try container.decode(Date.self, forKey: .dateCreated)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.productId, forKey: .productId)
        try container.encode(self.dateCreated, forKey: .dateCreated)
    }
}

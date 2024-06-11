//
//  UserManager.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/12/24.
//

import Foundation
import FirebaseFirestore
import FirebaseFirestoreSwift

//struct Activity: Codable {
//    let id: String
//    let name: String
//    let support: Bool
//}
//
//struct DBUser: Codable {
//
//    let userId: String
//    let email: String?
//    // let photoUrl: String?
//    let dateCreated: Date?
//    let preferenceLanguage: [String]?
//    let favoriteActivity: Activity?
//    let profileImagePathUrl: String?
//
//    init(auth: AuthDataResultModel) {
//        self.userId = auth.uid
//        self.email = auth.email
//        // self.photoUrl = auth.photoUrl
//        self.dateCreated = Date()
//        self.preferenceLanguage = nil
//        self.favoriteActivity = nil
//        self.profileImagePathUrl = nil
//    }
//
//    enum CodingKeys: String, CodingKey {
//        case userId = "user_id"
//        case email = "email"
//        // case photoUrl = "photo_url"
//        case dateCreated = "date_created"
//        case languagePreference = "language_preference"
//        case favoriteActivity = "favorite_activity"
//        case profileImagePathUrl = "profile_image_path_url"
//    }
//
//    init(from decoder: Decoder) throws {
//        let container = try decoder.container(keyedBy: CodingKeys.self)
//        self.userId = try container.decode(String.self, forKey: .userId)
//        self.email = try container.decodeIfPresent(String.self, forKey: .email)
//        // self.photoUrl = try container.decodeIfPresent(String.self, forKey: .photoUrl)
//        self.dateCreated = try container.decodeIfPresent(Date.self, forKey: .dateCreated)
//        self.preferenceLanguage = try container.decodeIfPresent([String].self, forKey: .languagePreference)
//        self.favoriteActivity = try container.decodeIfPresent(Activity.self, forKey: .favoriteActivity)
//        self.profileImagePathUrl = try container.decodeIfPresent(String.self, forKey: .profileImagePathUrl)
//    }
//
//    func encode(to encoder: Encoder) throws {
//        var container = encoder.container(keyedBy: CodingKeys.self)
//        try container.encode(self.userId, forKey: .userId)
//        try container.encodeIfPresent(self.email, forKey: .email)
//        // try container.encodeIfPresent(self.photoUrl, forKey: .photoUrl)
//        try container.encodeIfPresent(self.dateCreated, forKey: .dateCreated)
//        try container.encodeIfPresent(self.preferenceLanguage, forKey: .languagePreference)
//        try container.encodeIfPresent(self.favoriteActivity, forKey: .favoriteActivity)
//        try container.encodeIfPresent(self.profileImagePathUrl, forKey: .profileImagePathUrl)
//    }
//}

struct EmergencyContacts: Codable {
    let ecId: String
    let name: String
    let relationship: String
    let phone: String
    let dateCreated: Date
}

struct PrimaryCarePhysician: Codable {
    let pcpId: String
    let name: String
    let address: String
    let city: String
    let state: String
    let zipCode: String
    let phone: String
    let fax: String
    let email: String
    let hours: String
    let dateCreated: Date
}

struct SocialAdultDayCare: Codable {
    let sadcId: String
    let name: String
    let address: String
    let city: String
    let state: String
    let zipCode: String
    let phone: String
    let fax: String
    let email: String
    let hours: String
    let dateCreated: Date
}

struct InsuranceCompany: Codable {
    let insuranceId: String
    let name: String
    let dateCreated: Date
}

struct MemberInsurance: Codable {
    let userId: String
    let insuranceId: String
    let memberId: String
    let schedule: String
    let cmName: String
    let cmPhone: String
    let dateCreated: Date
}

struct DBUser: Codable {
    let userId: String
    let email: String?
    let birthDate: Date?
    let gender: String?
    let address: String?
    let city: String?
    let state: String?
    let zipCode: Int?
    let phone: String?
    let dateCreated: Date?
    let emergencyContacts: [EmergencyContacts]?
    let primaryCarePhysician: PrimaryCarePhysician?
    let socialAdultDayCare: SocialAdultDayCare?
    let insuranceCompany: MemberInsurance?
    let profileImagePathUrl: String?
    
    init(auth: AuthDataResultModel) {
        self.userId = auth.uid
        self.email = auth.email
        self.birthDate = Date()
        self.gender = "Male"
        self.address = "000 0th St"
        self.city = "New York"
        self.state = "NY"
        self.zipCode = 10000
        self.phone = "000-000-0000"
        self.dateCreated = Date()
        self.emergencyContacts = [
            EmergencyContacts(ecId: "1", name: "John Doe", relationship: "Friend", phone: "111-111-1111", dateCreated: Date()),
            EmergencyContacts(ecId: "2", name: "Jane Smith", relationship: "Family", phone: "222-222-2222", dateCreated: Date())
        ]
        self.primaryCarePhysician = PrimaryCarePhysician(pcpId: "1", name: "Dr. Smith", address: "123 Main St", city: "New York", state: "NY", zipCode: "10001", phone: "333-333-3333", fax: "444-444-4444", email: "drsmith@example.com", hours: "9:00 AM - 5:00 PM", dateCreated: Date())
        self.socialAdultDayCare = SocialAdultDayCare(sadcId: "1", name: "Sunshine Care Center", address: "456 Elm St", city: "New York", state: "NY", zipCode: "10002", phone: "555-555-5555", fax: "666-666-6666", email: "info@sunshinecare.com", hours: "8:00 AM - 4:00 PM", dateCreated: Date())
        self.insuranceCompany = MemberInsurance(userId: auth.uid, insuranceId: "1", memberId: "123456", schedule: "M-F", cmName: "Mary Johnson", cmPhone: "777-777-7777", dateCreated: Date())
        self.profileImagePathUrl = "https://example.com/profile.jpg"
    }
    
    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case birthDate = "birth_date"
        case gender = "gender"
        case address = "address"
        case city = "city"
        case state = "state"
        case zipCode = "zip_code"
        case phone = "phone"
        case email = "email"
        case dateCreated = "date_created"
        case emergencyContacts = "emergency_contacts"
        case primaryCarePhysician = "primary_care_physician"
        case socialAdultDayCare = "social_adult_day_care"
        case insuranceCompany = "insurance_company"
        case profileImagePathUrl = "profile_image_path_url"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.userId = try container.decode(String.self, forKey: .userId)
        self.birthDate = try container.decodeIfPresent(Date.self, forKey: .birthDate)
        self.gender = try container.decodeIfPresent(String.self, forKey: .gender)
        self.address = try container.decodeIfPresent(String.self, forKey: .address)
        self.city = try container.decodeIfPresent(String.self, forKey: .city)
        self.state = try container.decodeIfPresent(String.self, forKey: .state)
        self.zipCode = try container.decodeIfPresent(Int.self, forKey: .zipCode)
        self.phone = try container.decodeIfPresent(String.self, forKey: .phone)
        self.email = try container.decodeIfPresent(String.self, forKey: .email)
        self.dateCreated = try container.decodeIfPresent(Date.self, forKey: .dateCreated)
        self.emergencyContacts = try container.decodeIfPresent([EmergencyContacts].self, forKey: .emergencyContacts)
        self.primaryCarePhysician = try container.decodeIfPresent(PrimaryCarePhysician.self, forKey: .primaryCarePhysician)
        self.socialAdultDayCare = try container.decodeIfPresent(SocialAdultDayCare.self, forKey: .socialAdultDayCare)
        self.insuranceCompany = try container.decodeIfPresent(MemberInsurance.self, forKey: .insuranceCompany)
        self.profileImagePathUrl = try container.decodeIfPresent(String.self, forKey: .profileImagePathUrl)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(self.userId, forKey: .userId)
        try container.encodeIfPresent(self.birthDate, forKey: .birthDate)
        try container.encodeIfPresent(self.gender, forKey: .gender)
        try container.encodeIfPresent(self.address, forKey: .address)
        try container.encodeIfPresent(self.city, forKey: .city)
        try container.encodeIfPresent(self.state, forKey: .state)
        try container.encodeIfPresent(self.zipCode, forKey: .zipCode)
        try container.encodeIfPresent(self.phone, forKey: .phone)
        try container.encodeIfPresent(self.email, forKey: .email)
        try container.encodeIfPresent(self.dateCreated, forKey: .dateCreated)
        try container.encodeIfPresent(self.emergencyContacts, forKey: .emergencyContacts)
        try container.encodeIfPresent(self.primaryCarePhysician, forKey: .primaryCarePhysician)
        try container.encodeIfPresent(self.socialAdultDayCare, forKey: .socialAdultDayCare)
        try container.encodeIfPresent(self.insuranceCompany, forKey: .insuranceCompany)
        try container.encodeIfPresent(self.profileImagePathUrl, forKey: .profileImagePathUrl)
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
    
    private var userFavoriteProductsListener: ListenerRegistration? = nil
    
    func createUser(user: DBUser) async throws {
        try userDocument(userId: user.userId).setData(
            from: user,
            merge: false)
    }
    
    func getUser(userId: String) async throws -> DBUser {
        try await userDocument(userId: userId).getDocument(
            as: DBUser.self)
    }
    
    func updateUserProfileImagePath(userId: String, url: String?) async throws {
        let data: [String:Any] = [
            DBUser.CodingKeys.profileImagePathUrl.rawValue : url ?? NSNull()
        ]
        
        try await userDocument(userId: userId).updateData(data)
    }
}
//    func addLanguagePreference(userId: String, preference: String) async throws {
//        let data: [String:Any] = [
//            DBUser.CodingKeys.languagePreference.rawValue : FieldValue.arrayUnion([preference])
//        ]
//        try await userDocument(userId: userId).updateData(data)
//    }
//    
//    func removeLanguagePreference(userId: String, preference: String) async throws {
//        let data: [String:Any] = [
//            DBUser.CodingKeys.languagePreference.rawValue : FieldValue.arrayRemove([preference])
//        ]
//        
//        try await userDocument(userId: userId).updateData(data)
//    }
//    
//    func addFavoriteActivity(userId: String, activity: Activity) async throws {
//        guard let data = try? encoder.encode(activity) else {
//            throw URLError(.badURL)
//        }
//        
//        let dict: [String:Any] = [
//            DBUser.CodingKeys.favoriteActivity.rawValue : data
//        ]
//        
//        try await userDocument(userId: userId).updateData(dict)
//    }
//    
//    func removeFavoriteActivity(userId: String) async throws {
//        let data: [String:Any?] = [
//            DBUser.CodingKeys.favoriteActivity.rawValue : nil
//        ]
//        
//        try await userDocument(userId: userId).updateData(data as [AnyHashable : Any])
//    }
//    
//    func addFavoriteProduct(userId: String, productId: Int) async throws {
//        let document = userFavoriteProductsCollection(userId: userId).document()
//        let documentId = document.documentID
//        
//        let data: [String:Any] = [
//            UserFavoriteProduct.CodingKeys.id.rawValue : documentId,
//            UserFavoriteProduct.CodingKeys.productId.rawValue : productId,
//            UserFavoriteProduct.CodingKeys.dateCreated.rawValue : Timestamp()
//        ]
//        
//        try await document.setData(data, merge: false)
//    }
//    
//    func removeFavoriteProduct(userId: String, favoriteProductId: String) async throws {
//        try await userFavoriteProductsDocument(userId: userId, favoriteProductId: favoriteProductId).delete()
//    }
//    
//    func getAllFavoriteProducts(userId: String) async throws -> [UserFavoriteProduct] {
//        try await userFavoriteProductsCollection(userId: userId).getDocuments(as: UserFavoriteProduct.self)
//    }
//    
//    func removeListenerForAllUserFavoriteProducts() {
//        self.userFavoriteProductsListener?.remove()
//    }
//    
//    func addListenerForAllUserFavoriteProducts(userId: String) -> AnyPublisher<[UserFavoriteProduct], Error> {
//        let (publisher, listener) = userFavoriteProductsCollection(userId: userId)
//            .addSnapshotListener(as: UserFavoriteProduct.self)
//        
//        self.userFavoriteProductsListener = listener
//        return publisher
//    }
//}
//
//import Combine
//
//struct UserFavoriteProduct: Codable {
//    let id: String
//    let productId: Int
//    let dateCreated: Date
//    
//    enum CodingKeys: String, CodingKey {
//        case id = "id"
//        case productId = "product_id"
//        case dateCreated = "date_created"
//    }
//    
//    init(from decoder: Decoder) throws {
//        let container = try decoder.container(keyedBy: CodingKeys.self)
//        self.id = try container.decode(String.self, forKey: .id)
//        self.productId = try container.decode(Int.self, forKey: .productId)
//        self.dateCreated = try container.decode(Date.self, forKey: .dateCreated)
//    }
//    
//    func encode(to encoder: Encoder) throws {
//        var container = encoder.container(keyedBy: CodingKeys.self)
//        try container.encode(self.id, forKey: .id)
//        try container.encode(self.productId, forKey: .productId)
//        try container.encode(self.dateCreated, forKey: .dateCreated)
//    }
//}

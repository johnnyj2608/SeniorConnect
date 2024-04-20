//
//  StorageManager.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/19/24.
//

import Foundation
import FirebaseStorage
import SwiftUI

final class StorageManager {
    
    static let shared = StorageManager()
    private init() {
        
    }
    
    private let storage = Storage.storage().reference()
    
    private var imagesReference: StorageReference {
        storage.child("images")
    }
    
    private func userReference(userId: String) -> StorageReference {
        storage.child("users").child(userId)
    }
    
    func getPathForImage(path: String) -> StorageReference {
        Storage.storage().reference(withPath: path)
    }
    
    func getUrlForImage(path: String) async throws -> URL {
        try await getPathForImage(path: path).downloadURL()
    }
    
    func getData(userId: String, path: String) async throws -> Data {
        try await storage.child(path).data(maxSize: 3 * 1024 * 1024)
    }
    
    func getImage(userId: String, path: String) async throws -> UIImage {
        let data = try await getData(userId: userId, path: path)
        
        guard let image = UIImage(data: data) else {
            throw URLError(.badServerResponse)
        }
        return image
    }
    
    func saveImage(data: Data, userId: String) async throws -> (path: String, name: String) {
        let meta = StorageMetadata()
        meta.contentType = "image/jpeg"
        
        let path = "\(UUID().uuidString).jpeg"
        let returnedMetaData = try await userReference(userId: userId).child(path).putDataAsync(data, metadata: meta)
        guard let returnPath = returnedMetaData.path, let returnName = returnedMetaData.name else {
            throw URLError(.badServerResponse)
        }
        return (returnPath, returnName)
    }
    
    func saveImage(image: UIImage, userId: String) async throws -> (path: String, name: String) {
        guard let data = image.jpegData(compressionQuality: 1) else {
            throw URLError(.badServerResponse)
        }
        return try await saveImage(data: data, userId: userId)
    }
    
    func deleteImage(url: String) async throws {
        try await Storage.storage().reference(forURL: url).delete()
    }
}

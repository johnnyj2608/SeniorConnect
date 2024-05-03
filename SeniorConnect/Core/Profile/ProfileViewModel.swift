//
//  ProfileViewModel.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/16/24.
//

import Foundation
import SwiftUI
import PhotosUI

@MainActor
final class ProfileViewModel: ObservableObject {
    
    @Published private(set) var user: DBUser? = nil
    
    @Published var personalInfoExpanded: Bool = false
    @Published var emergencyContactExpanded: Bool = false
    @Published var primaryCarePhysicianExpanded: Bool = false
    @Published var socialAdultDayCareExpanded: Bool = false
    @Published var insuranceCompanyExpanded: Bool = false
    
    
    func loadCurrentUser() async throws {
        let authDataResult = try AuthManager.shared.getUser()
        self.user = try await UserManager.shared.getUser(userId: authDataResult.uid)
    }
    
    func addLanguagePreference(preference: String) {
        guard let user else {
            return
        }
        Task {
            try await UserManager.shared.addLanguagePreference(userId: user.userId, preference: preference)
            self.user = try await UserManager.shared.getUser(userId: user.userId)
        }
    }
    
    func removeLanguagePreference(preference: String) {
        guard let user else {
            return
        }
        Task {
            try await UserManager.shared.removeLanguagePreference(userId: user.userId, preference: preference)
            self.user = try await UserManager.shared.getUser(userId: user.userId)
        }
    }
    
    func addFavoriteActivity(activity: Activity) {
        guard let user else {
            return
        }
        Task {
            try await UserManager.shared.addFavoriteActivity(userId: user.userId, activity: activity)
            self.user = try await UserManager.shared.getUser(userId: user.userId)
        }
    }
    
    func removeFavoriteActivity() {
        guard let user else {
            return
        }
        Task {
            try await UserManager.shared.removeFavoriteActivity(userId: user.userId)
            self.user = try await UserManager.shared.getUser(userId: user.userId)
        }
    }
    
    func getProductsCount() {
        Task {
            let _ = try await ProductsManager.shared.getAllProductsCount()
        }
    }
    
    func saveProfileImage(item: PhotosPickerItem) {
        guard let user else {
            return
        }
        
        Task {
            guard let data = try await item.loadTransferable(type: Data.self) else { return
                
            }
            deleteProfileImage()
            let (path, _) = try await StorageManager.shared.saveImage(data: data, userId: user.userId)
            let url = try await StorageManager.shared.getUrlForImage(path: path)
            try await UserManager.shared.updateUserProfileImagePath(userId: user.userId, url: url.absoluteString)
        }
    }
    
    func deleteProfileImage() {
        guard let user, let url = user.profileImagePathUrl else {
            return
            
        }
        Task {
            try await StorageManager.shared.deleteImage(url: url)
            try await UserManager.shared.updateUserProfileImagePath(userId: user.userId, url: nil)
        }
    }
}

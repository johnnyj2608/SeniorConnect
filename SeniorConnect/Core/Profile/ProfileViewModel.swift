//
//  ProfileViewModel.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/16/24.
//

import Foundation

@MainActor
final class ProfileViewModel: ObservableObject {
    
    @Published private(set) var user: DBUser? = nil
    
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
}

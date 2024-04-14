//
//  ProfileView.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/12/24.
//

import SwiftUI

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
    
}

struct ProfileView: View {
    
    @StateObject private var viewModel = ProfileViewModel()
    @Binding var showSignInView: Bool
    
    let languages: [String] = ["English", "Mandarin", "Cantonese"]
    private func languageSelected(text: String) -> Bool {
        viewModel.user?.preferenceLanguage?.contains(text) == true
    }
    
    var body: some View {
        List {
            if let user = viewModel.user {
                Text("UserId: \(user.userId)")
                Text("Email: \(user.email ?? "")")
                
                VStack {
                    HStack {
                        ForEach(languages, id: \.self) { string in
                            Button(string) {
                                if languageSelected(text: string) {
                                    viewModel.removeLanguagePreference(preference: string)
                                } else {
                                    viewModel.addLanguagePreference(preference: string)
                                }
                            }
                            .font(.headline)
                            .buttonStyle(.borderedProminent)
                            .tint(languageSelected(text: string) ? .green : .red)
                        }
                    }
                    Text("Language Preference:")
                    Text("\((user.preferenceLanguage ?? [" "]).joined(separator: ", "))")
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                Button {
                    if user.favoriteActivity == nil {
                        viewModel.addFavoriteActivity(activity: Activity(id: "1", name: "Dancing", support: false))
                    } else {
                        viewModel.removeFavoriteActivity()
                    }
                } label: {
                    Text("Favorite Activity: \(user.favoriteActivity?.name ?? "")")
                }
            }
        }
        .task {
            try? await viewModel.loadCurrentUser()
        }
        .navigationTitle("Profile")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                NavigationLink {
                    SettingsView(showSignInView: $showSignInView)
                } label: {
                    Image(systemName: "gear")
                        .font(.headline)
                }
                
            }
        }
    }
}

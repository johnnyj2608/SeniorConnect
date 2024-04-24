//
//  ProfileView.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/12/24.
//

import SwiftUI
import PhotosUI

struct ProfileView: View {
    
    @StateObject private var viewModel = ProfileViewModel()
    @Binding var showSignInView: Bool
    @State private var selectedItem: PhotosPickerItem?
    @State private var url: URL? = nil
    
    let languages: [String] = ["English", "Mandarin", "Cantonese"]
    private func languageSelected(text: String) -> Bool {
        viewModel.user?.preferenceLanguage?.contains(text) == true
    }
    
    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("User")) {
                    // User information fields
                    // profile pic, name, dob, gender, address, note
                }
                
                Section(header: Text("Day care")) {
                    // Day care information fields
                    // name, address, phone, fax, hours
                }
                
                Section(header: Text("Insurance")) {
                    // Insurance information fields
                    // name, schedule, transport, medicaid
                }
                
                Section(header: Text("Contact")) {
                    // Contact information fields
                    // phone, email, EC, PCP, CM, HA
                }
                
                Section(header: Text("Preferences")) {
                    // Preferences information fields
                    // Employee (M/F), Nutrition (Diet), Allergies (Severity),
                    // Goals, Risks, Language, Functionals
                }
                
                Section(header: Text("App Settings")) {
                    // App settings toggles
                    // Dark mode, notifications
                }
                
                Section(header: Text("Feedback")) {
                    // Feedback share link, rate app link
                }
                
                Section(header: Text("Account")) {
                    // Account actions
                    // Logout, delete
                }
            }
            .navigationBarTitle("Profile")
        }
        //        List {
        //            if let user = viewModel.user {
        //                Text("UserId: \(user.userId)")
        //                Text("Email: \(user.email ?? "")")
        //
        //                VStack {
        //                    HStack {
        //                        ForEach(languages, id: \.self) { string in
        //                            Button(string) {
        //                                if languageSelected(text: string) {
        //                                    viewModel.removeLanguagePreference(preference: string)
        //                                } else {
        //                                    viewModel.addLanguagePreference(preference: string)
        //                                }
        //                            }
        //                            .font(.headline)
        //                            .buttonStyle(.borderedProminent)
        //                            .tint(languageSelected(text: string) ? .green : .red)
        //                        }
        //                    }
        //                    Text("Language Preference:")
        //                    Text("\((user.preferenceLanguage ?? [" "]).joined(separator: ", "))")
        //                        .frame(maxWidth: .infinity, alignment: .leading)
        //                }
        //                Button {
        //                    if user.favoriteActivity == nil {
        //                        viewModel.addFavoriteActivity(activity: Activity(id: "1", name: "Dancing", support: false))
        //                    } else {
        //                        viewModel.removeFavoriteActivity()
        //                    }
        //                } label: {
        //                    Text("Favorite Activity: \(user.favoriteActivity?.name ?? "")")
        //                }
        //                PhotosPicker(
        //                    selection: $selectedItem,
        //                    matching: .images,
        //                    photoLibrary: .shared()) {
        //                        Text("Selected a photo")
        //                    }
        //                if let urlString = viewModel.user?.profileImagePathUrl, let url = URL(string: urlString) {
        //                    AsyncImage(url: url) { image in
        //                        image
        //                            .resizable()
        //                            .scaledToFill()
        //                            .frame(width: 150, height: 150)
        //                            .cornerRadius(10)
        //                    } placeholder: {
        //                        ProgressView()
        //                            .frame(width: 150, height: 150)
        //                    }
        //                }
        //
        //                if viewModel.user?.profileImagePathUrl != nil {
        //                    Button("Delete image") {
        //                        viewModel.deleteProfileImage()
        //                    }
        //                }
        //            }
        //        }
        //        .task {
        //            try? await viewModel.loadCurrentUser()
        //        }
        //        .onChange(of: selectedItem, perform: { newValue in
        //            if let newValue {
        //                viewModel.saveProfileImage(item: newValue)
        //            }
        //        })
        //        .navigationTitle("Profile")
        //        .toolbar {
        //            ToolbarItem(placement: .navigationBarTrailing) {
        //                NavigationLink {
        //                    SettingsView(showSignInView: $showSignInView)
        //                } label: {
        //                    Image(systemName: "gear")
        //                        .font(.headline)
        //                }
        //
        //            }
        //        }
    }
}

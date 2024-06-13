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
    //    private func languageSelected(text: String) -> Bool {
    //        viewModel.user?.preferenceLanguage?.contains(text) == true
    //    }
    
    var body: some View {
        List {
            ZStack(alignment: Alignment(horizontal: .trailing, vertical: .top)) {
                Image(systemName: "car.side.fill")
                    .font(.system(size: 20))
                VStack(alignment: .center) {
                    Image("LOGIN")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 200, height: 200)
                        .cornerRadius(20)
                        .padding(.bottom, -10)
                    Text("LAST, FIRST")
                        .font(.system(size: 35))
                        .fontWeight(.semibold)
                        .lineLimit(2)
                        .multilineTextAlignment(.center)
                    Text("VCM #000")
                        .font(.system(size: 20))
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
            }
            .listRowSeparator(.hidden)
            .padding(.bottom, -10)

            Group {
                InfoRow(title: "Nickname", value: "江涛")
                InfoRow(title: "Birth Date", value: "00/00/0000")
                InfoRow(title: "Gender", value: "Male")
                InfoRow(title: "Phone", value: "000-000-0000")
                InfoRow(title: "Email", value: "email@email.com")
            }
            
            Section(header: Text("Address").font(.system(size: 20))) {
                InfoRow(title: "Street", value: "000 00th St")
                InfoRow(title: "City", value: "City")
                InfoRow(title: "State", value: "State")
                InfoRow(title: "Zip Code", value: "00000")
            }
            
            Section(header: Text("Contacts").font(.system(size: 20))) {
                ContactRow(name: "Ron Smith", title: "Driver", number: "000-000-0000")
                ContactRow(name: "John Doe", title: "Son", number: "000-000-0000")
                ContactRow(name: "Jane Doe", title: "Daughter", number: "000-000-0000")
                ContactRow(name: "Luigi Mario", title: "Doctor", number: "000-000-0000")
                ContactRow(name: "Medicine", title: "Pharmacy", number: "000-000-0000")
            }
            
            // Member Only
            Section(header: Text("Insurance").font(.system(size: 20))) {
                InfoRow(title: "Name", value: "Name")
                InfoRow(title: "Member ID", value: "0000000000")
                InfoRow(title: "Schedule", value: "M - F")
                InfoRow(title: "Medicaid", value: "XX00000X")
            }
            
            // Employee Only
            Section(header: Text("Documents").font(.system(size: 20))) {
                Text("Sign In Logs")
                Text("Document 1")
                Text("Document 2")
                // Button to upload documents
            }
            
            // Employee Only
            Section(header: Text("Billing").font(.system(size: 20))) {
                InfoRow(title: "Auth #", value: "XYZ0000000")
                InfoRow(title: "Auth Range", value: "01/01/24 - 12/31/24")
                InfoRow(title: "Dx Code", value: "M15.0")
                InfoRow(title: "Vacation Range", value: "N/A")
            }
            
            // Employee Only
            Section(header: Text("Actions").font(.system(size: 20))) {
                Text("Button for Vacation")
                Text("Button for Transfer") // Member Only
                Text("Button for Withdraw")
                // Confirm action by manually add date / optional note
            }
        }
        .listStyle(GroupedListStyle())
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

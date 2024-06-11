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
            VStack(alignment: .center) {
                Image("LOGIN")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 200, height: 200)
                    .cornerRadius(20)
                Text("LAST, FIRST")
                    .font(.system(size: 40))
                    .fontWeight(.semibold)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
                    .padding(.bottom, -10)
            }
            .frame(maxWidth: .infinity)
            .listRowSeparator(.hidden)
            
            InfoRow(title: "Preferred Name", value: "Chinese Name")
            InfoRow(title: "Birth Date", value: "00/00/0000")
            InfoRow(title: "Gender", value: "Male")
            InfoRow(title: "Sign-In Number", value: "000")
            
            Section(header: Text("Address")) {
                InfoRow(title: "Street", value: "000 00th St")
                InfoRow(title: "City", value: "City")
                InfoRow(title: "State", value: "State")
                InfoRow(title: "Zip Code", value: "00000")
            }
            
            Section(header: Text("Contacts")) {
                InfoRow(title: "Self", value: ">")
                InfoRow(title: "Emergency Contact 1", value: ">")
                InfoRow(title: "Emergency Contact 2", value: ">")
                InfoRow(title: "Primary Care Physician", value: ">")
                InfoRow(title: "Pharmacy", value: ">")
            }
            
            Section(header: Text("Insurance Company")) {
                InfoRow(title: "Name", value: "Name")
                InfoRow(title: "Member ID", value: "0000000000")
                InfoRow(title: "Schedule", value: "M - F")
                InfoRow(title: "Medicaid", value: "XX00000X")
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

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
            VStack {
                Image("LOGIN")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 200, height: 200)
                    .padding(.vertical, 4)
                    .cornerRadius(20)
                Text("FIRST LAST")
                    .font(.system(size: 40))
                    .fontWeight(.semibold)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
            }
            .frame(minWidth: 0, maxWidth: .infinity, alignment: .center)
            
            Section {
                DisclosureGroup(isExpanded: $viewModel.personalInfoExpanded) {
                    InfoRow(title: "Birth Date", value: "00/00/0000")
                    InfoRow(title: "Gender", value: "Male")
                    InfoRow(title: "Address", value: "000 00th St")
                    InfoRow(title: "City", value: "City")
                    InfoRow(title: "State", value: "State")
                    InfoRow(title: "Zip Code", value: "00000")
                    InfoRow(title: "Phone", value: "000-000-0000")
                    InfoRow(title: "Email", value: "email@email.com")
                } label: {
                    Text("Personal Information")
                }
            }
            
            Section {
                DisclosureGroup(isExpanded: $viewModel.emergencyContactExpanded) {
                    Section(header: Text("Emergency Contact 1")) {
                        InfoRow(title: "Name", value: "Name")
                        InfoRow(title: "Relationship", value: "Family")
                        InfoRow(title: "Phone", value: "000-000-0000")
                        InfoRow(title: "Email", value: "email@email.com")
                    }
                    Section(header: Text("Emergency Contact 2")) {
                        InfoRow(title: "Name", value: "Name")
                        InfoRow(title: "Relationship", value: "Family")
                        InfoRow(title: "Phone", value: "000-000-0000")
                        InfoRow(title: "Email", value: "email@email.com")
                    }
                } label: {
                    Text("Emergency Contact")
                }
            }
                
            Section {
                DisclosureGroup(isExpanded: $viewModel.primaryCarePhysicianExpanded) {
                    InfoRow(title: "Name", value: "Name")
                    InfoRow(title: "Address", value: "000 00th St")
                    InfoRow(title: "City", value: "City")
                    InfoRow(title: "State", value: "State")
                    InfoRow(title: "Zip Code", value: "00000")
                    InfoRow(title: "Phone", value: "000-000-0000")
                    InfoRow(title: "Fax", value: "000-000-0000")
                    InfoRow(title: "Email", value: "email@email.com")
                    InfoRow(title: "Hours", value: "8:00 AM - 3:00 PM")
                } label: {
                    Text("Primary Care Physician")
                }
            }
            
            Section {
                DisclosureGroup(isExpanded: $viewModel.socialAdultDayCareExpanded) {
                    InfoRow(title: "Name", value: "Name")
                    InfoRow(title: "Address", value: "000 00th St")
                    InfoRow(title: "City", value: "City")
                    InfoRow(title: "State", value: "State")
                    InfoRow(title: "Zip Code", value: "00000")
                    InfoRow(title: "Phone", value: "000-000-0000")
                    InfoRow(title: "Fax", value: "000-000-0000")
                    InfoRow(title: "Email", value: "email@email.com")
                    InfoRow(title: "Hours", value: "8:00 AM - 3:00 PM")
                    InfoRow(title: "Member Since", value: "April 2024")
                } label: {
                    Text("Social Adult Day Care")
                }
            }
            
            Section {
                DisclosureGroup(isExpanded: $viewModel.insuranceCompanyExpanded) {
                    InfoRow(title: "Name", value: "Name")
                    InfoRow(title: "Member ID", value: "0000000000")
                    InfoRow(title: "Schedule", value: "M - F")
                    InfoRow(title: "Medicaid", value: "XX00000X")
                    InfoRow(title: "Care Manager", value: "Name")
                    InfoRow(title: "Care Manager Phone", value: "000-000-0000")
                } label: {
                    Text("Insurance Company")
                }
            }
            
            Section(header: Text("Notes")) {
                // - Notes (Sign-in number)
            }
            
            Section(header: Text("Tickets")) {
                // - Tickets (Shows most recent)
            }
            
        }
        .listStyle(GroupedListStyle())
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

struct ProfileView_Previews: PreviewProvider {
    static var previews: some View {
        ProfileView(showSignInView: .constant(false))
    }
}

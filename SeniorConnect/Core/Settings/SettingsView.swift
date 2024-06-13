//
//  SettingsView.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/9/24.
//

import SwiftUI

struct SettingsView: View {
    
    @StateObject private var viewModel = SettingsViewModel()
    @Binding var showSignInView: Bool
    
    @State private var darkMode = false
    @State private var notifications = true
    @State private var textSize: Double = 14
    
    var body: some View {
        List {
            // Employee Only
            Section(header: Text("User Management").font(.system(size: 20))) {
                NavigationLink("Registration", destination: DetailView(title: "Registration"))
                NavigationLink("Members", destination: DetailView(title: "Members"))
                // Select Insurance -> Filter by schedule / birthday month
                // Can export member list. Palm tree if on vacation
                NavigationLink("Employees", destination: DetailView(title: "Employees"))
                // Filter by schedule / birthday month
                NavigationLink("Sign Ins", destination: DetailView(title: "Sign Ins"))
                // Filter by day, week, month, unsigned
            }
            // Employee Only
            Section(header: Text("Audit Logs").font(.system(size: 20))) {
                NavigationLink("Enrollment", destination: DetailView(title: "Enrollment"))
                // Filter by insurance / month / date
                NavigationLink("Transfers", destination: DetailView(title: "Transfers"))
                // Filter by insurance / month / date
                NavigationLink("Withdraws", destination: DetailView(title: "Withdraws"))
                // Filter by insurance / month / date
                NavigationLink("Vacations", destination: DetailView(title: "Vacations"))
                // Filter by insurance / month / date
                NavigationLink("Admins", destination: DetailView(title: "Admins"))
                // Filter by staff
            }
            Section(header: Text("Social Adult Day Care").font(.system(size: 20))) {
                NavigationLink("Edit Profile", destination: DetailView(title: "Edit Profile"))
                // If not admin, require admin approval
                NavigationLink("Submit Feedback", destination: DetailView(title: "Submit Feedback"))
                // Toggle for Anonymous. Subject and body
                NavigationLink("Contact Information", destination: DetailView(title: "Contact Information"))
                // Name, Address, Contact
                NavigationLink("Policy & Procedures", destination: DetailView(title: "Policy & Procedures"))
            }
            Section(header: Text("App Preferences").font(.system(size: 20))) {
                Toggle(isOn: $darkMode) {
                    Text("Appearance (Dark Mode)")
                }
                Toggle(isOn: $notifications) {
                    Text("Notifications")
                }
                
                VStack {
                    Text("Text Size") // Grows as slider changes
                    Slider(value: $textSize, in: 10...30, step: 1)
                }
            }
            Section(header: Text("App Information").font(.system(size: 20))) {
                NavigationLink("FAQ", destination: DetailView(title: "FAQ"))
                NavigationLink("Privacy Policy", destination: DetailView(title: "Privacy Policy"))
                NavigationLink("Terms of Service", destination: DetailView(title: "Terms of Service"))
            }
            Section(header: Text("My Account").font(.system(size: 20))) {
                NavigationLink("Change Email", destination: DetailView(title: "Change Email"))
                NavigationLink("Change Password", destination: DetailView(title: "Change Password"))
                NavigationLink("Link Accounts", destination: DetailView(title: "Link Accounts"))
            }
            Section(header: Text("Account Actions").font(.system(size: 20))) {
                Button("Log Out") {
                    Task {
                        do {
                            try viewModel.signOut()
                            showSignInView = true
                        } catch {
                            print(error)
                        }
                    }
                }
                // Leave SADC
                Button(role: .destructive) {
                    // Add confirmation for account deletion
                    Task {
                        do {
                            try await viewModel.deleteAccount()
                            showSignInView = true
                        } catch {
                            print(error)
                        }
                    }
                } label: {
                    Text("Delete Account")
                }
            }
            
//            if viewModel.authProviders.contains(.email) {
//                emailSection
//            }
        }
        .onAppear {
            viewModel.loadAuthProviders()
        }
        .navigationTitle("Settings")
        .listStyle(GroupedListStyle())
    }
}

extension SettingsView {
    private var emailSection: some View {
        Section {
            Button("Reset Password") {
                Task {
                    do {
                        try await viewModel.resetPassword()
                        print("Password reset")
                    } catch {
                        print(error)
                    }
                }
            }
            
            Button("Update Password") {
                Task {
                    do {
                        try await viewModel.resetPassword()
                        print("Password reset")
                    } catch {
                        print(error)
                    }
                }
            }
        } header: {
            Text("Email functions")
        }
    }
}

struct DetailView: View {
    var title: String
    
    var body: some View {
        List {
            Text("Item 1")
            Text("Item 2")
            Text("Item 3")
        }
        .navigationTitle(title)
        .listStyle(GroupedListStyle())
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Menu {
                    Button("Option 1") {
                        
                    }
                    Button("Option 2") {
                        
                    }
                    Button("Option 3") {
                        
                    }
                } label: {
                    Image(systemName: "line.3.horizontal.decrease.circle")
                        .font(.headline)
                }
            }
            
        }
    }
}

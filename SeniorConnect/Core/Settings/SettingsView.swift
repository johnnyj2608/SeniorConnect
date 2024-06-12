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
    var body: some View {
        List {
            Section(header: Text("Social Adult Day Care").font(.system(size: 20))) {
                // Edit Profile (Requires Employee Confirmation)
                // View Documents
                // Submit Feedback (Toggle for Anonymous)
                // Contact Information (Name, Address, Contact)
                // Policy & Procedures (BoR, Visitor, Holidays)
            }
            Section(header: Text("App Preferences").font(.system(size: 20))) {
                // Appearance (Dark Mode Toggle)
                // Notifications (Toggle)
                // Text Size (Slider)
            }
            Section(header: Text("App Information").font(.system(size: 20))) {
                // FAQ
                // Privacy Policy
                // Terms of Service
            }
            Section(header: Text("My Account").font(.system(size: 20))) {
                // Change Email
                // Change Password
                // Link Accounts
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
            
            
            
            
            if viewModel.authProviders.contains(.email) {
                emailSection
            }
        }
        .onAppear {
            viewModel.loadAuthProviders()
        }
        .navigationTitle("Settings")
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

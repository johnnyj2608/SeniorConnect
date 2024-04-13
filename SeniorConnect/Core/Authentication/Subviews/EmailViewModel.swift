//
//  EmailViewModel.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/12/24.
//

import Foundation

@MainActor
final class EmailViewModel: ObservableObject {
    
    @Published var email = ""
    @Published var password = ""
    
    func signUp() async throws {
        guard !email.isEmpty, !password.isEmpty else {
            print("No email or password found")
            // Notify user
            return
        }
        
        let authDataResult = try await AuthManager.shared.createUser(email: email, password: password)
        try await UserManager.shared.createUser(auth: authDataResult)
    }
    
    func signIn() async throws {
        guard !email.isEmpty, !password.isEmpty else {
            print("No email or password found")
            // Notify user
            return
        }
        
        try await AuthManager.shared.signIn(email: email, password: password)
    }
}

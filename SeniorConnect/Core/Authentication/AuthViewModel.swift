//
//  AuthViewModel.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/12/24.
//

import Foundation
import AuthenticationServices

@MainActor
final class AuthViewModel: ObservableObject {
    
    func signInGoogle() async throws {
        let helper = SignInGoogleHelper()
        let tokens = try await helper.signIn()
        let authDataResult = try await AuthManager.shared.signInGoogle(tokens: tokens)
        
        let user = DBUser(auth: authDataResult)
        try await UserManager.shared.createUser(user: user)
    }
    
    func SignInApple(with result: Result<ASAuthorization, Error>, nonce: String) async {
        switch result {
        case .success(let auth):
            switch auth.credential {
            case let credential as ASAuthorizationAppleIDCredential:
                
                guard let appleIDToken = credential.identityToken else {  return }
                guard let idTokenString = String(data: appleIDToken, encoding: .utf8) else { return }
                
                
                do {
                    let authDataResult = try await AuthManager.shared.signInApple(idTokenString: idTokenString, nonce: nonce, fullName: credential.fullName)
                    let user = DBUser(auth: authDataResult)
                    try await UserManager.shared.createUser(user: user)
                } catch {
                    print(error)
                }
            default:
                print("Error in retrieving auth info")
            }
        case .failure(let error):
            print("Sign in with Apple failed: \(error.localizedDescription)")
        }
    }
}

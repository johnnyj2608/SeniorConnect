//
//  SignInAppleHelper.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/11/24.
//

import Foundation
import CryptoKit
import AuthenticationServices

func handleAppleSignIn(with result: Result<ASAuthorization, Error>, nonce: String) async {
    switch result {
    case .success(let auth):
        switch auth.credential {
        case let credential as ASAuthorizationAppleIDCredential:
            
            guard let appleIDToken = credential.identityToken else {  return }
            guard let idTokenString = String(data: appleIDToken, encoding: .utf8) else { return }
            
            
            do {
                try await AuthManager.shared.signInApple(idTokenString: idTokenString, nonce: nonce, fullName: credential.fullName)
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

func randomNonceString(length: Int = 32) -> String {
    precondition(length > 0)
    var randomBytes = [UInt8](repeating: 0, count: length)
    let errorCode = SecRandomCopyBytes(kSecRandomDefault, randomBytes.count, &randomBytes)
    if errorCode != errSecSuccess {
        fatalError(
            "Unable to generate nonce. SecRandomCopyBytes failed with OSStatus \(errorCode)"
        )
    }
    
    let charset: [Character] =
    Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
    
    let nonce = randomBytes.map { byte in
        charset[Int(byte) % charset.count]
    }
    
    return String(nonce)
}

@available(iOS 13, *)
func sha256(_ input: String) -> String {
    let inputData = Data(input.utf8)
    let hashedData = SHA256.hash(data: inputData)
    let hashString = hashedData.compactMap {
        String(format: "%02x", $0)
    }.joined()
    
    return hashString
}

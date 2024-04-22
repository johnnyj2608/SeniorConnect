//
//  AuthView.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/9/24.
//

import SwiftUI
import GoogleSignIn
import GoogleSignInSwift
import AuthenticationServices

struct AuthView: View {
    
    @StateObject private var viewModel = AuthViewModel()
    @Binding var showSignInView: Bool
    @State var currentNonce = ""
    
    var body: some View {
        VStack {
            Spacer()
            NavigationLink {
                EmailView(showSignInView: $showSignInView)
            } label: {
                Text("Sign in with email")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(height: 40)
                    .frame(maxWidth: .infinity)
                    .background(Color.blue)
                    .cornerRadius(10)
            }
            GoogleSignInButton(viewModel: GoogleSignInButtonViewModel(scheme: .dark,  style: .wide, state: .normal)) {
                Task {
                    do {
                        try await viewModel.signInGoogle()
                        showSignInView = false
                    } catch {
                        print(error)
                    }
                }
            }
            
            SignInWithAppleButton { request in
                let nonce = randomNonceString()
                currentNonce = nonce
                request.requestedScopes = [.email, .fullName]
                request.nonce = sha256(nonce)
            } onCompletion: { result in
                Task {
                    await viewModel.SignInApple(with: result, nonce: currentNonce)
                    showSignInView = false
                }
            }
            .frame(height: 40)
            .cornerRadius(8)
        }
        .padding()
    }
}

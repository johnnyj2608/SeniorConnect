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
    @State private var emailSignIn: Bool = false
    @State private var yOffset: CGFloat = 0
    
    var body: some View {
        ZStack {
            VStack {
                Spacer()
                GoogleSignInButton(viewModel: GoogleSignInButtonViewModel(scheme: .light,  style: .wide, state: .normal)) {
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
                
                Button {
                    emailSignIn = true
                } label: {
                    Text("Sign in with email")
                        .font(.system(size: 18))
                        .foregroundColor(.white)
                        .frame(height: 40)
                        .frame(maxWidth: .infinity)
                        .background(Color(red: 0.7, green: 0.2, blue: 0.2))
                        .cornerRadius(10)
                }
                .sheet(isPresented: $emailSignIn) {
                    NavigationStack {
                        EmailView(showSignInView: $showSignInView)
                    }
                }
            }
            .padding()
            .background(Color(red: 111/255, green: 160/255, blue: 232/255))
            Image("LOGIN")
                .resizable()
                .frame(width: 350, height: 350)
                .offset(y: yOffset)
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                withAnimation(.easeInOut(duration: 1.0)) {
                    yOffset = -150
                }
            }
        }
    }
    
}

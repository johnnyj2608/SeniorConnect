//
//  RootView.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/9/24.
//

import SwiftUI

struct RootView: View {
    
    @State private var showSignInView: Bool = false
    
    var body: some View {
        ZStack {
            if !showSignInView {
                NavigationStack {
                    //ProfileView(showSignInView: $showSignInView)
                    ProductsView()
                }
            }
        }
        .onAppear {
            let authUser = try? AuthManager.shared.getUser()
            self.showSignInView = authUser == nil
        }
        .fullScreenCover(isPresented: $showSignInView) {
            NavigationStack {
                AuthView(showSignInView: $showSignInView)
            }
        }
    }
}

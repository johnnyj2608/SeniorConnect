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
                TabbarView(showSignInView: $showSignInView)
            } else {
                NavigationStack {
                    AuthView(showSignInView: $showSignInView)
                }
            }
        }
        .onAppear {
            let authUser = try? AuthManager.shared.getUser()
            self.showSignInView = authUser == nil
        }
    }
}

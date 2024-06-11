//
//  TabbarView.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/16/24.
//

import SwiftUI

struct TabbarView: View {
    
    @Binding var showSignInView: Bool
    
    var body: some View {
        TabView {
            NavigationStack {
                ProductsView()
            }
            .tabItem {
                Image(systemName: "house")
                Text("Home")
            }
            NavigationStack {
                ProductsView()
            }
            .tabItem {
                Image(systemName: "message")
                Text("Community")
            }
            NavigationStack {
                ProductsView()
            }
            .tabItem {
                Image(systemName: "qrcode")
                Text("Scan")
            }
            NavigationStack {
                ProfileView(showSignInView: $showSignInView)
            }
            .tabItem {
                Image(systemName: "person")
                Text("Profile")
            }
        }
    }
}

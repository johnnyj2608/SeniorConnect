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
                Image(systemName: "cart")
                Text("Products")
            }
            NavigationStack {
                FavoritesView()
            }
            .tabItem {
                Image(systemName: "star.fill")
                Text("Favorites")
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

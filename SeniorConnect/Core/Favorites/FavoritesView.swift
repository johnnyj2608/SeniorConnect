//
//  FavoritesView.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/16/24.
//

import SwiftUI

@MainActor
final class FavoritesViewModel: ObservableObject {
    
    @Published private(set) var userFavoriteProducts: [UserFavoriteProduct] = []
    
    func getFavorites() {
        Task {
            // Don't fetch uid everytime. Inject current user ID into
            // view model init OR the struct of the view init OR user defaults
            let authDataResult = try AuthManager.shared.getUser()
            self.userFavoriteProducts = try await  UserManager.shared.getAllFavoriteProducts(userId: authDataResult.uid)
        }
    }
    
    func removeFromFavorites(favoriteProductId: String) {
        Task {
            let authDataResult = try AuthManager.shared.getUser()
            try? await UserManager.shared.removeFavoriteProduct(userId: authDataResult.uid, favoriteProductId: favoriteProductId)
            getFavorites()
        }
    }
}

struct FavoritesView: View {
    
    @StateObject private var viewModel = FavoritesViewModel()
    
    var body: some View {
        List {
            ForEach(viewModel.userFavoriteProducts, id: \.id.self) { item in
                ProductCellViewBuilder(productId: String(item.productId))
                    .contextMenu {
                        Button("Remove from favorites") {
                            viewModel.removeFromFavorites(favoriteProductId: item.id)
                        }
                    }
            }
        }
        .navigationTitle("Favorites")
        .onAppear {
            viewModel.getFavorites()
        }
    }
}

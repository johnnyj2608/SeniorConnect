//
//  FavoritesViewModel.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/16/24.
//

import Foundation
import Combine

@MainActor
final class FavoritesViewModel: ObservableObject {
    
    @Published private(set) var userFavoriteProducts: [UserFavoriteProduct] = []
    private var cancellables = Set<AnyCancellable>()
    
    func addListenerForFavorites() {
        // Don't fetch uid everytime. Inject current user ID into
        // view model init OR the struct of the view init OR user defaults
        guard let authDataResult = try? AuthManager.shared.getUser() else {
            return
        }
        
        UserManager.shared.addListenerForAllUserFavoriteProducts(userId: authDataResult.uid)
            .sink { completion in
                
            } receiveValue: { [weak self] products in
                self?.userFavoriteProducts = products
            }
            .store(in: &cancellables)
    }
    
    func removeFromFavorites(favoriteProductId: String) {
        Task {
            let authDataResult = try AuthManager.shared.getUser()
            try? await UserManager.shared.removeFavoriteProduct(userId: authDataResult.uid, favoriteProductId: favoriteProductId)
        }
    }
}

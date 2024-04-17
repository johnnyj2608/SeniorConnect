//
//  FavoritesView.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/16/24.
//

import SwiftUI
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
        .onFirstAppear {
            viewModel.addListenerForFavorites()
        }
    }
}

struct OnFirstAppearViewModifier: ViewModifier {
    
    @State private var didAppear: Bool = false
    let perform: (() -> Void)?
    
    func body(content: Content) -> some View {
        content
            .onAppear {
                if !didAppear {
                    perform?()
                    didAppear = true
                }
            }
    }
}

extension View {
    func onFirstAppear(perform: (() -> Void)?) -> some View {
        modifier(OnFirstAppearViewModifier(perform: perform))
    }
}

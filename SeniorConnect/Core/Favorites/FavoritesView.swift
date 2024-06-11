////
////  FavoritesView.swift
////  SeniorConnect
////
////  Created by Johnny Jiang on 4/16/24.
////
//
//import SwiftUI
//
//struct FavoritesView: View {
//    
//    @StateObject private var viewModel = FavoritesViewModel()
//    
//    var body: some View {
//        List {
//            ForEach(viewModel.userFavoriteProducts, id: \.id.self) { item in
//                ProductCellViewBuilder(productId: String(item.productId))
//                    .contextMenu {
//                        Button("Remove from favorites") {
//                            viewModel.removeFromFavorites(favoriteProductId: item.id)
//                        }
//                    }
//            }
//        }
//        .navigationTitle("Favorites")
//        .onFirstAppear {
//            viewModel.addListenerForFavorites()
//        }
//    }
//}

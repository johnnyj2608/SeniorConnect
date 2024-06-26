//
//  ProductsViewModel.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/16/24.
//

import Foundation

@MainActor
final class ProductsViewModel: ObservableObject {
    
    @Published private(set) var products: [Product] = []
    @Published var selectedFilter: SortOption? = nil
    @Published var selectedCategory: CategoryOption? = nil
    private var lastDocument: LastDocumentSnapshot? = nil
    
    enum SortOption: String, CaseIterable {
        case noFilter
        case priceHigh
        case priceLow
        
        var priceDescending: Bool? {
            switch self {
            case .noFilter: return nil
            case .priceHigh: return true
            case .priceLow: return false
            }
        }
    }
    
    func filterSelected(option: SortOption) async throws {
        self.selectedFilter = option
        self.products = []
        self.lastDocument = nil
        self.getProducts()
    }
    
    enum CategoryOption: String, CaseIterable {
        case noCategory
        case smartphones
        case laptops
        case fragrances
        
        var categoryKey: String? {
            if self == .noCategory {
                return nil
            }
            return self.rawValue
        }
    }
    
    func categorySelected(option: CategoryOption) async throws {
        self.selectedCategory = option
        self.products = []
        self.lastDocument = nil
        self.getProducts()
    }
    
    func getProducts() {
        Task {
            let (newProducts, lastDocument) = try await ProductsManager.shared.getAllProducts(priceDescending: selectedFilter?.priceDescending, forCategory: selectedCategory?.categoryKey, count: 10, lastDocument: lastDocument?.lastDocument)
            
            self.products.append(contentsOf: newProducts)
            if let lastDocument {
                self.lastDocument = LastDocumentSnapshot(lastDocument)
            }
        }
    }
    
//    func addUserFavoriteProduct(productId: Int) {
//        Task {
//            let authDataResult = try AuthManager.shared.getUser()
//            try await UserManager.shared.addFavoriteProduct(userId: authDataResult.uid, productId: productId)
//        }
//    }
    
    func getProductsCount() {
        Task {
            let _ = try await ProductsManager.shared.getAllProductsCount()
        }
    }
}

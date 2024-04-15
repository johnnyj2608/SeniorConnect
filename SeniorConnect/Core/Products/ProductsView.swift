//
//  ProductsView.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/14/24.
//

import SwiftUI

@MainActor
final class ProductsViewModel: ObservableObject {
    
    @Published private(set) var products: [Product] = []
    @Published var selectedFilter: FilterOption? = nil
    @Published var selectedCategory: CategoryOption? = nil
    
    enum FilterOption: String, CaseIterable {
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
    
    func filterSelected(option: FilterOption) async throws {
//        switch option {
//        case .noFilter:
//            self.products = try await ProductsManager.shared.getAllProducts()
//        case .priceHigh:
//            self.products = try await ProductsManager.shared.getAllProductsSortedPrice(descending: true)
//        case .priceLow:
//            self.products = try await ProductsManager.shared.getAllProductsSortedPrice(descending: false)
//        }
        self.selectedFilter = option
        self.getProducts()
    }
    
    // Have categories in the database
    enum CategoryOption: String, CaseIterable {
        case noFilter
        case smartphones
        case laptops
        case fragrances
        
        var categoryKey: String? {
            if self == .noFilter {
                return nil
            }
            return self.rawValue
        }
    }
    
    func categorySelected(option: CategoryOption) async throws {
//        switch option {
//        case .noFilter:
//            self.products = try await ProductsManager.shared.getAllProducts()
//        case .smartphones, .laptops, .fragrances:
//            self.products = try await ProductsManager.shared.getAllProductsFilteredCategory(category: option.rawValue)
//        }
        self.selectedCategory = option
        self.getProducts()
    }
    
    func getProducts() {
        Task {
            self.products = try await ProductsManager.shared.getAllProducts(priceDescending: selectedFilter?.priceDescending, forCategory: selectedCategory?.categoryKey)
        }
    }
}

struct ProductsView: View {
    @StateObject private var viewModel = ProductsViewModel()
    var body: some View {
        List {
            ForEach(viewModel.products) { product in
                ProductsCellView(product: product)
            }
        }
        .navigationTitle("Products")
        .toolbar(content: {
            ToolbarItem(placement: .navigationBarLeading) {
                Menu("Filter: \(viewModel.selectedFilter?.rawValue ?? "NONE")") {
                    ForEach(ProductsViewModel.FilterOption.allCases, id: \.self) { option in
                        Button(option.rawValue) {
                            Task {
                                try? await viewModel.filterSelected(option: option)
                            }
                        }
                    }
                }
            }
            ToolbarItem(placement: .navigationBarTrailing) {
                Menu("Category: \(viewModel.selectedCategory?.rawValue ?? "NONE")") {
                    ForEach(ProductsViewModel.CategoryOption.allCases, id: \.self) { option in
                        Button(option.rawValue) {
                            Task {
                                try? await viewModel.categorySelected(option: option)
                            }
                        }
                    }
                }
            }
        })
        .onAppear {
            viewModel.getProducts()
        }
    }
}

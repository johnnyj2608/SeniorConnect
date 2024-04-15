//
//  ProductsManager.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/14/24.
//

import Foundation
import FirebaseFirestore
import FirebaseFirestoreSwift

final class ProductsManager {
    
    static let shared = ProductsManager()
    private init() {
        
    }
    
    private let productsCollection = Firestore.firestore().collection("products")
    
    private func productDocument(productId: String) -> DocumentReference {
        productsCollection.document(productId)
    }
        
    func uploadProduct(product: Product) async throws {
        try productDocument(productId: String(product.id)).setData(
            from:product,
            merge: false)
    }
    
    func getProduct(productId: String) async throws -> Product {
        try await productDocument(productId: productId).getDocument(as: Product.self)
    }
    
    private func getAllProducts() async throws -> [Product] {
        try await productsCollection.getDocuments(as: Product.self)
    }
    
    private func getAllProductsSortedPrice(descending: Bool) async throws -> [Product] {
        try await productsCollection
            .order(by: Product.CodingKeys.price.rawValue, descending: descending)
            .getDocuments(as: Product.self)
    }
    
    private func getAllProductsFilteredCategory(category: String) async throws -> [Product] {
        try await productsCollection
            .whereField(Product.CodingKeys.category.rawValue, isEqualTo: category)
            .getDocuments(as: Product.self)
    }
    
    private func getAllProductsPriceCategory(descending: Bool, category: String) async throws -> [Product] {
        try await productsCollection
            .whereField(Product.CodingKeys.category.rawValue, isEqualTo: category)
            .order(by: Product.CodingKeys.price.rawValue, descending: descending)
            .getDocuments(as: Product.self)
    }
    
    func getAllProducts(priceDescending: Bool?, forCategory: String?) async throws -> [Product] {
        if let priceDescending, let forCategory {
            return try await getAllProductsPriceCategory(descending: priceDescending, category: forCategory)
        } else if let priceDescending {
            return try await getAllProductsSortedPrice(descending: priceDescending)
        } else if let forCategory {
            return try await getAllProductsFilteredCategory(category: forCategory)
        }
        return try await getAllProducts()
    }
}

extension Query {
    
    func getDocuments<T>(as type: T.Type) async throws -> [T] where T: Decodable {
        let snapshot = try await self.getDocuments()
        
        return try snapshot.documents.map({ document in
            try document.data(as: T.self)
        })
    }
    
}

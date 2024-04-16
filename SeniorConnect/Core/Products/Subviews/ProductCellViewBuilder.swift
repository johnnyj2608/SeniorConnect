//
//  ProductCellViewBuilder.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/16/24.
//

import SwiftUI

struct ProductCellViewBuilder: View {
    
    let productId: String
    @State private var product: Product? = nil
    
    var body: some View {
        ZStack {
            if let product {
                ProductsCellView(product: product)
            }
        }
        .task {
            self.product = try? await ProductsManager.shared.getProduct(productId: productId)
        }
        
    }
}

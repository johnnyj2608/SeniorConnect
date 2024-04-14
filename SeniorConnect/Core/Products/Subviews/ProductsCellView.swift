//
//  ProductsCellView.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/14/24.
//

import SwiftUI

struct ProductsCellView: View {
    
    let product: Product
    
    var body: some View {
        HStack(alignment: .top) {
            AsyncImage(url: URL(string: product.thumbnail ?? "")) { image in
                image
                    .resizable()
                    .scaledToFit()
                    
                    .cornerRadius(10)
            } placeholder: {
                ProgressView()
            }
            .frame(width: 75, height: 75)
            .shadow(color: Color.black.opacity(0.3), radius: 4, x: 0, y: 2)
            
            VStack(alignment: .leading, spacing: 12) {
                Text(product.title ?? "N/A")
                    .font(.headline)
                    .foregroundColor(.primary)
                Text("Price: $" + String(product.price ?? 0))
                Text("Rating: " + String(product.rating ?? 0))
                Text("Category: " + (product.category ?? "N/A"))
                Text("Brand: " + (product.brand ?? "N/A"))
            }
            .font(.callout)
            .foregroundColor(.secondary)
        }
    }
}

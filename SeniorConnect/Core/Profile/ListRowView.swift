//
//  InfoRowView.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 5/2/24.
//

import SwiftUI

struct InfoRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
            Spacer()
            Text(value)
        }
    }
}

struct ContactRow: View {
    var name: String
    var title: String
    var number: String
    
    var body: some View {
        HStack {
            VStack (alignment: .leading) {
                Text(name)
                Text(title)
                    .foregroundColor(.secondary)
            }
            Spacer()
            Text(number)
        }
    }
}

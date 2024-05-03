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
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
        }
    }
}

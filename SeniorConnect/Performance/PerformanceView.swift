//
//  PerformanceView.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/19/24.
//

import SwiftUI

struct PerformanceView: View {
    
    @State private var title: String = "Some Title"

    var body: some View {
        Text("Hello, World!")
            .onAppear {
                configure()
                downloadProductsAndUploadToFirebase()
                
                PerformanceManager.shared.startTrace(name: "performance_screen_time")
            }
            .onDisappear {
                PerformanceManager.shared.stopTrace(name: "performance_screen_time")
            }
    }
}

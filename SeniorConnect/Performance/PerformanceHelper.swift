//
//  Performance.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/19/24.
//

import Foundation
import FirebasePerformance

func downloadProductsAndUploadToFirebase() {
    let urlString = "https://dummyjson.com/products"
    guard let url = URL(string: urlString), let metric = HTTPMetric(url: url, httpMethod: .get) else {
        return
        
    }
    metric.start()

    Task {
        do {
            let (_, response) = try await URLSession.shared.data(from: url)
            if let response = response as? HTTPURLResponse {
                metric.responseCode = response.statusCode
            }
            metric.stop()
            print("SUCCESS")
        } catch {
            print(error)
            metric.stop()
        }
    }
}

func configure() {
    PerformanceManager.shared.startTrace(name: "performance_view_loading")
    
    Task {
        try? await Task.sleep(nanoseconds: 2_000_000_000)
        PerformanceManager.shared.setValue(name: "performance_view_loading", value: "Started downloading", forAttribute: "func_state")
        try? await Task.sleep(nanoseconds: 2_000_000_000)
        PerformanceManager.shared.setValue(name: "performance_view_loading", value: "Finished downloading", forAttribute: "func_state")
        
        PerformanceManager.shared.stopTrace(name: "performance_view_loading")
    }
    
}

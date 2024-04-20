//
//  AnalyticsView.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/19/24.
//

import SwiftUI

struct AnalyticsView: View {
    var body: some View {
        VStack(spacing: 40) {
            Button("Click me!") {
                AnalyticsManager.shared.logEvent(name: "AnalyticsView_ButtonClick")
            }
            
            Button("Click me too!") {
                AnalyticsManager.shared.logEvent(name: "AnalyticsView_SecondaryButtonClick", params: [
                    "screen_title" : "Hello, world!"
                ])
            }
        }
        .analyticsScreen(name: "AnalyticsView")
        .onAppear {
            AnalyticsManager.shared.logEvent(name: "AnalyticsView_Appear")
        }
        .onDisappear {
            AnalyticsManager.shared.logEvent(name: "AnalyticsView_Disppear")
            
            AnalyticsManager.shared.setUserId(userId: "ABC123")
            AnalyticsManager.shared.setUserProperty(value: true.description, property: "user_is_premium")
        }
    }
}

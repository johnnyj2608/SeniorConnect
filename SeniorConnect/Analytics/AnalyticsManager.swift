//
//  AnalyticsManager.swift
//  SeniorConnect
//
//  Created by Johnny Jiang on 4/19/24.
//

import Foundation
import FirebaseAnalytics
import FirebaseAnalyticsSwift

final class AnalyticsManager {
    
    static let shared = AnalyticsManager()
    private init() { }
    
    func logEvent(name: String, params: [String:Any]? = nil) {
        Analytics.logEvent(name, parameters: params)
    }
    
    func setUserId(userId: String) {
        Analytics.setUserID(userId)
    }
    
    func setUserProperty(value: String?, property: String) {
        // AnalyticsEventAddPaymentInfo
        Analytics.setUserProperty(value, forName: property)
    }
    
}

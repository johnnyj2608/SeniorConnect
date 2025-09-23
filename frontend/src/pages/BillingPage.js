import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import fetchWithRefresh from "../utils/fetchWithRefresh";

const BillingPage = () => {
    const { t } = useTranslation();
    const [response, setResponse] = useState(null);

    // 🔹 Simpler test data
    const claimData = {
        firstName: "John",
        lastName: "Doe",
        memberId: "123456",
        payerId: "TEST123",
    };

    async function submitClaim() {
        try {
            const res = await fetchWithRefresh("billing/submit-claims/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(claimData),
            });

            const data = await res.json();
            setResponse(data);
        } catch (err) {
            setResponse({ error: err.message });
        }
    }

    return (
        <>
            <div className="page-header">
                <div className="page-title-row">
                    <h2 className="page-title">&#9782; {t("general.billing")}</h2>
                </div>
            </div>

            <div className="content-padding">
                <h2>Submit Claim (via Flask + Selenium)</h2>
                <button className="action-button" onClick={submitClaim}>
                    Submit Claim
                </button>
                <pre style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
                    {response
                        ? JSON.stringify(response, null, 2)
                        : "Response will appear here"}
                </pre>
            </div>
        </>
    );
};

export default BillingPage;
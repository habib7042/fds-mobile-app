import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { Member } from "./api-client";

/**
 * Generate and download a PDF statement for the member
 */
export async function generateAndDownloadStatement(member: Member): Promise<void> {
  try {
    // Create HTML content for the PDF
    const htmlContent = generateStatementHTML(member);

    // Create a temporary file path
    const fileName = `FDS_Statement_${member.accountNumber}_${new Date().getTime()}.html`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // Write HTML to file
    await FileSystem.writeAsStringAsync(filePath, htmlContent);

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: "text/html",
        UTI: "public.html",
        dialogTitle: `FDS Account Statement - ${member.name}`,
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }
  } catch (error) {
    console.error("Failed to generate statement:", error);
    throw error;
  }
}

/**
 * Generate HTML content for the statement
 */
function generateStatementHTML(member: Member): string {
  // Calculate totals
  const totalContributions = member.contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalCharges = member.fundAdjustments
    ?.filter((adj) => adj.type === "CHARGE")
    .reduce((sum, adj) => sum + adj.amount, 0) || 0;
  const totalInterest = member.fundAdjustments
    ?.filter((adj) => adj.type === "INTEREST")
    .reduce((sum, adj) => sum + adj.amount, 0) || 0;
  const balance = totalContributions + totalInterest - totalCharges;

  // Format date
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Sort contributions by date (newest first)
  const sortedContributions = [...member.contributions].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  // Sort adjustments by date (newest first)
  const sortedAdjustments = [...(member.fundAdjustments || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FDS Account Statement</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #0a7ea4;
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: #0a7ea4;
            font-size: 28px;
            margin-bottom: 5px;
        }
        
        .header p {
            color: #666;
            font-size: 14px;
        }
        
        .member-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 6px;
        }
        
        .info-group {
            display: flex;
            flex-direction: column;
        }
        
        .info-group label {
            font-weight: 600;
            color: #0a7ea4;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .info-group value {
            font-size: 16px;
            color: #333;
        }
        
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .card {
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        
        .card.balance {
            background: #e3f2fd;
            border-left: 4px solid #0a7ea4;
        }
        
        .card.contributions {
            background: #e8f5e9;
            border-left: 4px solid #22c55e;
        }
        
        .card.interest {
            background: #e8f5e9;
            border-left: 4px solid #22c55e;
        }
        
        .card.charges {
            background: #ffebee;
            border-left: 4px solid #ef4444;
        }
        
        .card-label {
            font-size: 12px;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .card-value {
            font-size: 20px;
            font-weight: bold;
            color: #333;
        }
        
        .card.balance .card-value {
            color: #0a7ea4;
        }
        
        .card.contributions .card-value {
            color: #22c55e;
        }
        
        .card.interest .card-value {
            color: #22c55e;
        }
        
        .card.charges .card-value {
            color: #ef4444;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #0a7ea4;
            margin-bottom: 15px;
            border-bottom: 2px solid #0a7ea4;
            padding-bottom: 10px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        table thead {
            background: #f0f0f0;
        }
        
        table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #ddd;
            font-size: 14px;
        }
        
        table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
            font-size: 14px;
        }
        
        table tbody tr:hover {
            background: #f9f9f9;
        }
        
        .amount {
            text-align: right;
            font-weight: 500;
        }
        
        .positive {
            color: #22c55e;
        }
        
        .negative {
            color: #ef4444;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        
        .date {
            color: #999;
            font-size: 12px;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>FDS Account Statement</h1>
            <p>Friends Development Society</p>
            <p class="date">Generated on ${formattedDate}</p>
        </div>
        
        <!-- Member Information -->
        <div class="member-info">
            <div class="info-group">
                <label>Member Name</label>
                <value>${escapeHtml(member.name)}</value>
            </div>
            <div class="info-group">
                <label>Account Number</label>
                <value>${escapeHtml(member.accountNumber)}</value>
            </div>
            <div class="info-group">
                <label>Phone</label>
                <value>${member.phone ? escapeHtml(member.phone) : "N/A"}</value>
            </div>
            <div class="info-group">
                <label>Member Since</label>
                <value>${new Date(member.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}</value>
            </div>
        </div>
        
        <!-- Summary Cards -->
        <div class="summary-cards">
            <div class="card balance">
                <div class="card-label">Current Balance</div>
                <div class="card-value">৳${balance.toFixed(2)}</div>
            </div>
            <div class="card contributions">
                <div class="card-label">Total Contributions</div>
                <div class="card-value">৳${totalContributions.toFixed(2)}</div>
            </div>
            <div class="card interest">
                <div class="card-label">Total Interest</div>
                <div class="card-value">+৳${totalInterest.toFixed(2)}</div>
            </div>
            <div class="card charges">
                <div class="card-label">Total Charges</div>
                <div class="card-value">-৳${totalCharges.toFixed(2)}</div>
            </div>
        </div>
        
        <!-- Contributions Section -->
        <div class="section">
            <div class="section-title">Contribution History (${member.contributions.length} payments)</div>
            ${
              member.contributions.length > 0
                ? `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Month/Year</th>
                        <th class="amount">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedContributions
                      .map(
                        (contrib) => `
                    <tr>
                        <td>${new Date(contrib.paymentDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}</td>
                        <td>${contrib.month}/${contrib.year}</td>
                        <td class="amount positive">+৳${contrib.amount.toFixed(2)}</td>
                    </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
            `
                : "<p style='color: #999;'>No contributions recorded</p>"
            }
        </div>
        
        <!-- Adjustments Section -->
        <div class="section">
            <div class="section-title">Adjustments History (${member.fundAdjustments?.length || 0} items)</div>
            ${
              sortedAdjustments.length > 0
                ? `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th class="amount">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedAdjustments
                      .map(
                        (adj) => `
                    <tr>
                        <td>${new Date(adj.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}</td>
                        <td>${adj.type}</td>
                        <td>${adj.description || "-"}</td>
                        <td class="amount ${adj.type === "INTEREST" ? "positive" : "negative"}">
                            ${adj.type === "INTEREST" ? "+" : "-"}৳${adj.amount.toFixed(2)}
                        </td>
                    </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
            `
                : "<p style='color: #999;'>No adjustments recorded</p>"
            }
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>This is an automated statement generated by FDS Member App</p>
            <p>For inquiries, please contact the FDS administration</p>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

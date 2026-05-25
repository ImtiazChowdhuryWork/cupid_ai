package services

import (
	"bytes"
	"fmt"
	"math"
	"time"

	"github.com/go-pdf/fpdf"
)

// Rose colour palette
const (
	roseR, roseG, roseB    = 232, 93, 117
	bgR, bgG, bgB          = 248, 247, 246
	darkR, darkG, darkB    = 45, 45, 45
	grayR, grayG, grayB    = 139, 139, 139
	lightR, lightG, lightB = 245, 232, 236
)

// GeneratePDF produces a well-formatted A4 PDF of the user data export.
func GeneratePDF(export *UserDataExport) ([]byte, error) {
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(20, 20, 20)
	pdf.SetAutoPageBreak(true, 25)

	// Support email shown in footer — uses configured value or default
	supportEmail := export.SupportEmail
	if supportEmail == "" {
		supportEmail = "support@cupidai.app"
	}

	// Register footer on every page
	pdf.SetFooterFunc(func() {
		pdf.SetY(-14)
		pdf.SetFillColor(roseR, roseG, roseB)
		pdf.Rect(0, pdf.GetY(), 210, 14, "F")
		pdf.SetFont("Arial", "", 7)
		pdf.SetTextColor(255, 255, 255)
		pdf.SetXY(0, pdf.GetY()+3)
		pdf.CellFormat(105, 5, "Cupid AI  |  "+supportEmail+"  |  cupidai.app/privacy", "", 0, "L", false, 0, "")
		pdf.CellFormat(105, 5, fmt.Sprintf("Page %d  |  Export: %s", pdf.PageNo(), export.ExportDate.Format("2 Jan 2006")), "", 0, "R", false, 0, "")
	})

	// Cover
	pdf.AddPage()
	drawWatermark(pdf)
	drawCover(pdf, export)

	// Profile & Stats
	pdf.AddPage()
	drawWatermark(pdf)
	drawSectionHeading(pdf, "Account Overview", "Section 1")
	drawProfileTable(pdf, export)
	drawStatsRow(pdf, export)

	// Insights
	pdf.AddPage()
	drawWatermark(pdf)
	drawSectionHeading(pdf, "Activity Insights", "Section 2")
	drawInsights(pdf, export)

	// Analyses
	if len(export.Analyses) > 0 {
		pdf.AddPage()
		drawWatermark(pdf)
		drawSectionHeading(pdf, "Conversation Analyses", "Section 3")
		drawAnalyses(pdf, export)
	}

	// Notifications
	if len(export.Notifications) > 0 {
		pdf.AddPage()
		drawWatermark(pdf)
		drawSectionHeading(pdf, "Notification History", "Section 4")
		drawNotifications(pdf, export)
	}

	// Support
	if len(export.SupportTickets) > 0 {
		pdf.AddPage()
		drawWatermark(pdf)
		drawSectionHeading(pdf, "Support History", "Section 5")
		drawSupport(pdf, export)
	}

	// Legal
	pdf.AddPage()
	drawWatermark(pdf)
	drawSectionHeading(pdf, "Legal & GDPR Information", "Section 6")
	drawLegal(pdf, export, supportEmail)

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// ── Watermark ─────────────────────────────────────────────────────────────
// Note: fpdf uses Latin-1 so we avoid emoji — use plain ASCII only.

func drawWatermark(pdf *fpdf.Fpdf) {
	pdf.SetFont("Arial", "B", 60)
	pdf.SetTextColor(232, 93, 117)
	pdf.SetAlpha(0.04, "Normal")

	// Diagonal "CUPID AI" text using transform
	pdf.TransformBegin()
	pdf.TransformRotate(45, 105, 148)
	pdf.SetXY(5, 110)
	pdf.CellFormat(200, 20, "CUPID AI", "", 1, "C", false, 0, "")
	pdf.TransformEnd()

	pdf.TransformBegin()
	pdf.TransformRotate(45, 105, 148)
	pdf.SetXY(5, 140)
	pdf.CellFormat(200, 20, "CUPID AI", "", 1, "C", false, 0, "")
	pdf.TransformEnd()

	// Reset
	pdf.SetAlpha(1, "Normal")
	pdf.SetTextColor(darkR, darkG, darkB)
}

// ── Cover ─────────────────────────────────────────────────────────────────

func drawCover(pdf *fpdf.Fpdf, export *UserDataExport) {
	// Rose header band
	pdf.SetFillColor(roseR, roseG, roseB)
	pdf.Rect(0, 0, 210, 62, "F")

	// App name
	pdf.SetFont("Arial", "B", 34)
	pdf.SetTextColor(255, 255, 255)
	pdf.SetXY(0, 14)
	pdf.CellFormat(210, 14, "CUPID AI", "", 1, "C", false, 0, "")

	pdf.SetFont("Arial", "", 12)
	pdf.SetXY(0, 33)
	pdf.CellFormat(210, 8, "Your Personal AI Flirting Coach", "", 1, "C", false, 0, "")

	pdf.SetFont("Arial", "I", 9)
	pdf.SetXY(0, 44)
	pdf.CellFormat(210, 7, "Personal Data Export  -  GDPR Article 15", "", 1, "C", false, 0, "")

	// Title
	pdf.SetFont("Arial", "B", 26)
	pdf.SetTextColor(darkR, darkG, darkB)
	pdf.SetXY(20, 80)
	pdf.CellFormat(170, 12, "Personal Data Export", "", 1, "L", false, 0, "")

	// Rose accent line
	pdf.SetFillColor(roseR, roseG, roseB)
	pdf.Rect(20, 96, 55, 1.5, "F")

	pdf.SetFont("Arial", "", 10)
	pdf.SetTextColor(grayR, grayG, grayB)
	pdf.SetXY(20, 102)
	pdf.MultiCell(170, 6, "This document contains a complete copy of your personal data\nstored on Cupid AI, prepared exclusively for you.", "", "L", false)

	// Info box
	pdf.SetFillColor(lightR, lightG, lightB)
	pdf.SetDrawColor(roseR, roseG, roseB)
	pdf.RoundedRect(20, 126, 170, 58, 4, "1234", "FD")

	profile := export.Profile
	rows := [][]string{
		{"Name", fmt.Sprintf("%v", profile["display_name"])},
		{"Email", fmt.Sprintf("%v", profile["email"])},
		{"Export Date", export.ExportDate.Format("2 January 2006  -  15:04 UTC")},
		{"Request ID", export.RequestID},
		{"Plan", fmt.Sprintf("%v", profile["subscription_tier"])},
	}
	y := 130.0
	for _, r := range rows {
		pdf.SetFont("Arial", "B", 8)
		pdf.SetTextColor(grayR, grayG, grayB)
		pdf.SetXY(28, y)
		pdf.CellFormat(38, 6, r[0]+":", "", 0, "L", false, 0, "")

		pdf.SetFont("Arial", "", 9)
		pdf.SetTextColor(darkR, darkG, darkB)
		pdf.SetXY(66, y)
		pdf.CellFormat(116, 6, r[1], "", 1, "L", false, 0, "")
		y += 10
	}

	// 3 stat boxes
	labels := []string{"Analyses", "Notifications", "Support Tickets"}
	values := []string{
		fmt.Sprintf("%d", len(export.Analyses)),
		fmt.Sprintf("%d", len(export.Notifications)),
		fmt.Sprintf("%d", len(export.SupportTickets)),
	}
	for i := 0; i < 3; i++ {
		x := 20.0 + float64(i)*57
		pdf.SetFillColor(255, 255, 255)
		pdf.SetDrawColor(220, 220, 220)
		pdf.RoundedRect(x, 198, 52, 26, 3, "1234", "FD")

		pdf.SetFont("Arial", "B", 18)
		pdf.SetTextColor(roseR, roseG, roseB)
		pdf.SetXY(x, 200)
		pdf.CellFormat(52, 10, values[i], "", 1, "C", false, 0, "")

		pdf.SetFont("Arial", "", 8)
		pdf.SetTextColor(grayR, grayG, grayB)
		pdf.SetXY(x, 211)
		pdf.CellFormat(52, 6, labels[i], "", 1, "C", false, 0, "")
	}

	// Confidential note
	pdf.SetFont("Arial", "I", 8)
	pdf.SetTextColor(grayR, grayG, grayB)
	pdf.SetXY(20, 235)
	pdf.MultiCell(170, 5, "CONFIDENTIAL - Generated exclusively for the account holder. Not for redistribution.", "", "C", false)
}

// ── Section heading ───────────────────────────────────────────────────────

func drawSectionHeading(pdf *fpdf.Fpdf, title, sub string) {
	pdf.SetFillColor(roseR, roseG, roseB)
	pdf.Rect(20, 20, 3.5, 14, "F")

	pdf.SetFont("Arial", "B", 17)
	pdf.SetTextColor(darkR, darkG, darkB)
	pdf.SetXY(27, 20)
	pdf.CellFormat(160, 8, title, "", 1, "L", false, 0, "")

	pdf.SetFont("Arial", "", 8)
	pdf.SetTextColor(grayR, grayG, grayB)
	pdf.SetXY(27, 29)
	pdf.CellFormat(160, 5, sub, "", 1, "L", false, 0, "")

	pdf.SetY(42)
}

// ── Profile table ─────────────────────────────────────────────────────────

func drawProfileTable(pdf *fpdf.Fpdf, export *UserDataExport) {
	label(pdf, "Account Details")
	p := export.Profile

	rows := [][]string{
		{"Full Name", fmt.Sprintf("%v", p["display_name"])},
		{"Email Address", fmt.Sprintf("%v", p["email"])},
		{"Subscription Plan", fmt.Sprintf("%v", p["subscription_tier"])},
		{"Member Since", formatDateStr(fmt.Sprintf("%v", p["created_at"]))},
		{"Account ID", fmt.Sprintf("%v", p["id"])},
	}

	for i, r := range rows {
		if i%2 == 0 {
			pdf.SetFillColor(bgR, bgG, bgB)
		} else {
			pdf.SetFillColor(255, 255, 255)
		}
		y := pdf.GetY()
		pdf.Rect(20, y, 170, 8, "F")

		pdf.SetFont("Arial", "B", 8)
		pdf.SetTextColor(grayR, grayG, grayB)
		pdf.SetXY(24, y+1)
		pdf.CellFormat(55, 6, r[0], "", 0, "L", false, 0, "")

		pdf.SetFont("Arial", "", 9)
		pdf.SetTextColor(darkR, darkG, darkB)
		pdf.SetXY(79, y+1)
		pdf.CellFormat(106, 6, r[1], "", 1, "L", false, 0, "")
	}
	pdf.Ln(10)
}

// ── Stats row ─────────────────────────────────────────────────────────────

func drawStatsRow(pdf *fpdf.Fpdf, export *UserDataExport) {
	label(pdf, "Usage Statistics")

	totalAnalyses := 0
	if v, ok := export.Streak["total_analyses"]; ok {
		switch val := v.(type) {
		case float64:
			totalAnalyses = int(val)
		case int:
			totalAnalyses = val
		}
	}

	boxes := []struct{ lbl, val, note string }{
		{"Total Analyses", fmt.Sprintf("%d", totalAnalyses), "Conversations analysed"},
		{"Notifications", fmt.Sprintf("%d", len(export.Notifications)), "In-app messages"},
		{"Support Tickets", fmt.Sprintf("%d", len(export.SupportTickets)), "Help requests"},
		{"Total Records", fmt.Sprintf("%d", totalAnalyses+len(export.Notifications)+len(export.SupportTickets)), "All stored records"},
	}

	y := pdf.GetY()
	for i, b := range boxes {
		col := i % 2
		row := i / 2
		x := 20.0 + float64(col)*88
		bY := y + float64(row)*32

		pdf.SetFillColor(lightR, lightG, lightB)
		pdf.SetDrawColor(220, 200, 208)
		pdf.RoundedRect(x, bY, 83, 26, 3, "1234", "FD")

		pdf.SetFont("Arial", "B", 18)
		pdf.SetTextColor(roseR, roseG, roseB)
		pdf.SetXY(x, bY+2)
		pdf.CellFormat(83, 10, b.val, "", 1, "C", false, 0, "")

		pdf.SetFont("Arial", "B", 8)
		pdf.SetTextColor(darkR, darkG, darkB)
		pdf.SetXY(x, bY+12)
		pdf.CellFormat(83, 5, b.lbl, "", 1, "C", false, 0, "")

		pdf.SetFont("Arial", "", 7)
		pdf.SetTextColor(grayR, grayG, grayB)
		pdf.SetXY(x, bY+18)
		pdf.CellFormat(83, 5, b.note, "", 1, "C", false, 0, "")
	}
	pdf.SetY(y + 68)
}

// ── Insights ──────────────────────────────────────────────────────────────

func drawInsights(pdf *fpdf.Fpdf, export *UserDataExport) {
	label(pdf, "What Your Data Shows")

	sentiments := map[string]int{"positive": 0, "neutral": 0, "negative": 0}
	for _, a := range export.Analyses {
		if s, ok := a["sentiment"].(string); ok {
			sentiments[s]++
		}
	}
	total := len(export.Analyses)
	topSent := "neutral"
	for k, v := range sentiments {
		if v > sentiments[topSent] {
			topSent = k
		}
	}

	memberSince := time.Time{}
	if v, ok := export.Profile["created_at"].(string); ok {
		memberSince, _ = time.Parse(time.RFC3339, v)
	}
	accountAge := "unknown"
	if !memberSince.IsZero() {
		days := int(time.Since(memberSince).Hours() / 24)
		switch {
		case days < 30:
			accountAge = fmt.Sprintf("%d days", days)
		case days < 365:
			accountAge = fmt.Sprintf("%d months", days/30)
		default:
			accountAge = fmt.Sprintf("%.1f years", float64(days)/365)
		}
	}

	avgPerWeek := 0.0
	if !memberSince.IsZero() && total > 0 {
		weeks := time.Since(memberSince).Hours() / 168
		if weeks > 0 {
			avgPerWeek = math.Round(float64(total)/weeks*10) / 10
		}
	}

	items := []struct{ num, title, body string }{
		{
			"01", "Conversation Sentiment",
			fmt.Sprintf("Across your %d analyses, the dominant sentiment was %s. Breakdown: Positive %d, Neutral %d, Negative %d. This reflects the emotional tone of conversations you sought help with.",
				total, topSent, sentiments["positive"], sentiments["neutral"], sentiments["negative"]),
		},
		{
			"02", "Usage Frequency",
			fmt.Sprintf("You average %.1f analyses per week. %s",
				avgPerWeek, usageInsight(avgPerWeek)),
		},
		{
			"03", "Account Age",
			fmt.Sprintf("Your account has been active for %s, since %s. In that time you performed %d analyses and received %d in-app notifications.",
				accountAge, memberSince.Format("January 2006"), total, len(export.Notifications)),
		},
		{
			"04", "Support Engagement",
			fmt.Sprintf("You submitted %d support ticket(s). %s",
				len(export.SupportTickets), supportInsight(len(export.SupportTickets))),
		},
	}

	for _, item := range items {
		if pdf.GetY() > 220 {
			pdf.AddPage()
			drawWatermark(pdf)
			drawSectionHeading(pdf, "Activity Insights (continued)", "Section 2")
		}
		y := pdf.GetY()

		// Rose number badge
		pdf.SetFillColor(roseR, roseG, roseB)
		pdf.RoundedRect(20, y, 12, 12, 2, "1234", "F")
		pdf.SetFont("Arial", "B", 8)
		pdf.SetTextColor(255, 255, 255)
		pdf.SetXY(20, y+3)
		pdf.CellFormat(12, 6, item.num, "", 1, "C", false, 0, "")

		// Title
		pdf.SetFont("Arial", "B", 11)
		pdf.SetTextColor(darkR, darkG, darkB)
		pdf.SetXY(36, y+1)
		pdf.CellFormat(152, 7, item.title, "", 1, "L", false, 0, "")

		// Body
		pdf.SetFont("Arial", "", 9)
		pdf.SetTextColor(grayR, grayG, grayB)
		pdf.SetX(36)
		pdf.MultiCell(152, 5, item.body, "", "L", false)

		// Rose left bar
		barH := pdf.GetY() - y + 2
		pdf.SetFillColor(roseR, roseG, roseB)
		pdf.Rect(33, y, 1.5, barH, "F")

		pdf.Ln(6)
	}
}

func usageInsight(avg float64) string {
	switch {
	case avg >= 5:
		return "You are a power user, getting the most out of Cupid AI every day."
	case avg >= 2:
		return "You engage consistently, showing regular use of the app."
	case avg >= 0.5:
		return "You use the app purposefully when you need it."
	default:
		return "You have used the app lightly so far."
	}
}

func supportInsight(n int) string {
	switch {
	case n == 0:
		return "No support contact was needed — the app has been working smoothly for you."
	case n == 1:
		return "You reached out once, showing proactive engagement with support."
	default:
		return "Multiple contacts show you are engaged and getting value from the product."
	}
}

// ── Analyses ──────────────────────────────────────────────────────────────

func drawAnalyses(pdf *fpdf.Fpdf, export *UserDataExport) {
	shown := len(export.Analyses)
	if shown > 15 {
		shown = 15
	}
	label(pdf, fmt.Sprintf("Showing %d of %d total analyses", shown, len(export.Analyses)))

	sentLabel := map[string]string{"positive": "Positive", "negative": "Negative", "neutral": "Neutral"}
	sentColor := map[string][3]int{
		"positive": {16, 185, 129},
		"negative": {244, 63, 94},
		"neutral":  {107, 114, 128},
	}

	for i, a := range export.Analyses {
		if i >= shown {
			break
		}
		if pdf.GetY() > 235 {
			pdf.AddPage()
			drawWatermark(pdf)
		}

		sent, _ := a["sentiment"].(string)
		date := formatDateStr(fmt.Sprintf("%v", a["created_at"]))
		conv := fmt.Sprintf("%v", a["conversation_text"])
		if len(conv) > 300 {
			conv = conv[:300] + "..."
		}

		y := pdf.GetY()
		col := sentColor[sent]
		if col[0] == 0 {
			col = [3]int{107, 114, 128}
		}

		// Number
		pdf.SetFont("Arial", "B", 8)
		pdf.SetTextColor(grayR, grayG, grayB)
		pdf.SetXY(20, y)
		pdf.CellFormat(10, 6, fmt.Sprintf("#%d", i+1), "", 0, "L", false, 0, "")

		// Sentiment pill
		pdf.SetFillColor(col[0], col[1], col[2])
		pdf.SetTextColor(255, 255, 255)
		pdf.SetFont("Arial", "B", 7)
		pdf.SetXY(30, y)
		pdf.CellFormat(22, 5, sentLabel[sent], "1", 0, "C", true, 0, "")

		// Date
		pdf.SetFont("Arial", "", 8)
		pdf.SetTextColor(grayR, grayG, grayB)
		pdf.SetXY(54, y)
		pdf.CellFormat(0, 5, date, "", 1, "R", false, 0, "")

		// Conversation
		pdf.SetFont("Arial", "", 8)
		pdf.SetTextColor(darkR, darkG, darkB)
		pdf.SetX(24)
		pdf.MultiCell(162, 4.5, conv, "", "L", false)

		// Divider
		pdf.SetDrawColor(230, 230, 230)
		pdf.Line(20, pdf.GetY()+1, 190, pdf.GetY()+1)
		pdf.Ln(4)
	}
}

// ── Notifications ─────────────────────────────────────────────────────────

func drawNotifications(pdf *fpdf.Fpdf, export *UserDataExport) {
	label(pdf, fmt.Sprintf("%d notifications", len(export.Notifications)))

	typeLabel := map[string]string{
		"streak": "Streak", "challenge": "Challenge", "tip": "Tip",
		"support_reply": "Support", "system": "System",
	}

	for i, n := range export.Notifications {
		if i >= 20 {
			break
		}
		if pdf.GetY() > 240 {
			pdf.AddPage()
			drawWatermark(pdf)
		}

		title := fmt.Sprintf("%v", n["title"])
		body  := fmt.Sprintf("%v", n["body"])
		nType := fmt.Sprintf("%v", n["type"])
		date  := formatDateStr(fmt.Sprintf("%v", n["created_at"]))
		read, _ := n["read"].(bool)

		tl := typeLabel[nType]
		if tl == "" {
			tl = "General"
		}

		y := pdf.GetY()

		// Type badge
		pdf.SetFillColor(roseR, roseG, roseB)
		pdf.SetTextColor(255, 255, 255)
		pdf.SetFont("Arial", "B", 7)
		pdf.SetXY(20, y)
		pdf.CellFormat(22, 5, tl, "1", 0, "C", true, 0, "")

		// Unread indicator
		if !read {
			pdf.SetFillColor(244, 63, 94)
			pdf.Circle(148, y+2.5, 2, "F")
			pdf.SetFont("Arial", "", 6)
			pdf.SetTextColor(grayR, grayG, grayB)
			pdf.SetXY(152, y)
			pdf.CellFormat(30, 5, "Unread", "", 0, "L", false, 0, "")
		}

		// Date
		pdf.SetFont("Arial", "", 7)
		pdf.SetTextColor(grayR, grayG, grayB)
		pdf.SetXY(44, y)
		pdf.CellFormat(0, 5, date, "", 1, "R", false, 0, "")

		// Title
		pdf.SetFont("Arial", "B", 9)
		pdf.SetTextColor(darkR, darkG, darkB)
		pdf.SetX(20)
		pdf.CellFormat(170, 6, title, "", 1, "L", false, 0, "")

		// Body
		pdf.SetFont("Arial", "", 8)
		pdf.SetTextColor(grayR, grayG, grayB)
		pdf.SetX(20)
		pdf.MultiCell(170, 4, body, "", "L", false)

		pdf.SetDrawColor(235, 235, 235)
		pdf.Line(20, pdf.GetY()+1, 190, pdf.GetY()+1)
		pdf.Ln(4)
	}
}

// ── Support tickets ───────────────────────────────────────────────────────

func drawSupport(pdf *fpdf.Fpdf, export *UserDataExport) {
	label(pdf, fmt.Sprintf("%d support ticket(s)", len(export.SupportTickets)))

	catColor := map[string][3]int{
		"Billing issue": {244, 63, 94}, "Bug report": {239, 68, 68},
		"Feature request": {59, 130, 246}, "General question": {107, 114, 128},
		"Account problem": {245, 158, 11},
	}

	for _, t := range export.SupportTickets {
		if pdf.GetY() > 235 {
			pdf.AddPage()
			drawWatermark(pdf)
		}

		cat    := fmt.Sprintf("%v", t["category"])
		msg    := fmt.Sprintf("%v", t["message"])
		status := fmt.Sprintf("%v", t["status"])
		date   := formatDateStr(fmt.Sprintf("%v", t["created_at"]))

		col := catColor[cat]
		if col[0] == 0 {
			col = [3]int{139, 92, 246}
		}

		y := pdf.GetY()

		// Category
		pdf.SetFillColor(col[0], col[1], col[2])
		pdf.SetTextColor(255, 255, 255)
		pdf.SetFont("Arial", "B", 7)
		pdf.SetXY(20, y)
		pdf.CellFormat(45, 5, cat, "1", 0, "C", true, 0, "")

		// Status
		pdf.SetFillColor(230, 230, 230)
		pdf.SetTextColor(darkR, darkG, darkB)
		pdf.SetXY(67, y)
		pdf.CellFormat(22, 5, status, "1", 0, "C", true, 0, "")

		// Date
		pdf.SetFont("Arial", "", 7)
		pdf.SetTextColor(grayR, grayG, grayB)
		pdf.SetXY(91, y)
		pdf.CellFormat(0, 5, date, "", 1, "R", false, 0, "")

		pdf.SetFont("Arial", "", 9)
		pdf.SetTextColor(darkR, darkG, darkB)
		pdf.SetX(20)
		pdf.MultiCell(170, 5, msg, "", "L", false)

		pdf.SetDrawColor(225, 225, 225)
		pdf.Line(20, pdf.GetY()+2, 190, pdf.GetY()+2)
		pdf.Ln(5)
	}
}

// ── Legal ─────────────────────────────────────────────────────────────────

func drawLegal(pdf *fpdf.Fpdf, export *UserDataExport, supportEmail string) {
	sections := []struct{ title, body string }{
		{"About This Export",
			"This document was generated under GDPR Article 15, which grants you the right to access your personal data. Cupid AI is committed to full transparency about the information we hold on your behalf."},
		{"What We Store",
			"Cupid AI stores: account information (email, name, subscription tier), conversation analyses you have submitted, in-app notifications you have received, and any support tickets you have raised. Conversation content is not permanently stored after response generation."},
		{"How We Use Your Data",
			"Your data is used exclusively to (1) provide the AI response generation service, (2) display your personal history and statistics, and (3) process your subscription. Your data is never sold to third parties or used for advertising."},
		{"Your Rights Under GDPR",
			"You have the right to access (Art. 15), rectify (Art. 16), erase (Art. 17), restrict processing (Art. 18), and port (Art. 20) your data. Contact " + supportEmail + " to exercise any of these rights."},
		{"Data Retention",
			"Data is held for the duration of your account. Upon account deletion, all associated records are permanently removed within 30 days. This export was generated on " + export.ExportDate.Format("2 January 2006") + " in response to request " + export.RequestID + "."},
	}

	for _, s := range sections {
		if pdf.GetY() > 230 {
			pdf.AddPage()
			drawWatermark(pdf)
		}
		label(pdf, s.title)
		pdf.SetFont("Arial", "", 9)
		pdf.SetTextColor(grayR, grayG, grayB)
		pdf.SetX(20)
		pdf.MultiCell(170, 5, s.body, "", "L", false)
		pdf.Ln(5)
	}
}

// ── Helpers ───────────────────────────────────────────────────────────────

func label(pdf *fpdf.Fpdf, text string) {
	pdf.SetFont("Arial", "B", 9)
	pdf.SetTextColor(roseR, roseG, roseB)
	pdf.SetX(20)
	pdf.CellFormat(170, 6, text, "", 1, "L", false, 0, "")

	pdf.SetDrawColor(roseR, roseG, roseB)
	pdf.Line(20, pdf.GetY(), 75, pdf.GetY())
	pdf.Ln(4)

	pdf.SetTextColor(darkR, darkG, darkB)
}

func formatDateStr(raw string) string {
	if raw == "" || raw == "<nil>" {
		return "—"
	}
	fmts := []string{
		time.RFC3339Nano, time.RFC3339,
		"2006-01-02T15:04:05Z07:00",
		"2006-01-02 15:04:05.999999 +0000 +0000",
		"2006-01-02 15:04:05 +0000 +0000",
	}
	for _, f := range fmts {
		if t, err := time.Parse(f, raw); err == nil {
			return t.Format("2 January 2006, 15:04")
		}
	}
	return raw
}

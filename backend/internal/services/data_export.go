package services

import (
	"database/sql"
	"fmt"
	"io"
	"time"

	"gopkg.in/gomail.v2"
)

// UserDataExport is the full GDPR-compliant data package for a user.
type UserDataExport struct {
	ExportDate     time.Time           `json:"export_date"`
	RequestID      string              `json:"request_id"`
	SupportEmail   string              `json:"support_email"`   // shown in PDF footer
	Profile        map[string]any      `json:"profile"`
	Analyses       []map[string]any    `json:"analyses"`
	Streak         map[string]any      `json:"streak_data"`
	Notifications  []map[string]any    `json:"notifications"`
	SupportTickets []map[string]any    `json:"support_tickets"`
}

// GenerateExport queries all data for a user and returns a structured export.
func GenerateExport(db *sql.DB, userID, requestID string) (*UserDataExport, error) {
	export := &UserDataExport{
		ExportDate: time.Now(),
		RequestID:  requestID,
	}

	// ── Profile ────────────────────────────────────────────────────────────
	row := db.QueryRow(`
		SELECT id, email, display_name, subscription_tier, created_at
		FROM users WHERE id = $1
	`, userID)
	var id, email, displayName, tier string
	var createdAt time.Time
	if err := row.Scan(&id, &email, &displayName, &tier, &createdAt); err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	export.Profile = map[string]any{
		"id": id, "email": email, "display_name": displayName,
		"subscription_tier": tier, "created_at": createdAt,
	}

	// ── Analyses ───────────────────────────────────────────────────────────
	rows, err := db.Query(`
		SELECT id, conversation_text, suggestions, sentiment, created_at
		FROM analyses WHERE user_id = $1 ORDER BY created_at DESC
	`, userID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var aID, conv, sugg, sent string
			var aCreated time.Time
			if rows.Scan(&aID, &conv, &sugg, &sent, &aCreated) == nil {
				export.Analyses = append(export.Analyses, map[string]any{
					"id": aID, "conversation_text": conv,
					"suggestions": sugg, "sentiment": sent, "created_at": aCreated,
				})
			}
		}
	}
	if export.Analyses == nil {
		export.Analyses = []map[string]any{}
	}

	// ── Streak / daily usage ───────────────────────────────────────────────
	var totalAnalyses int
	db.QueryRow(`SELECT COUNT(*) FROM analyses WHERE user_id = $1`, userID).Scan(&totalAnalyses)
	export.Streak = map[string]any{"total_analyses": totalAnalyses}

	// ── Notifications ──────────────────────────────────────────────────────
	nRows, err := db.Query(`
		SELECT id, title, body, type, read, created_at
		FROM user_notifications WHERE user_id = $1 ORDER BY created_at DESC
	`, userID)
	if err == nil {
		defer nRows.Close()
		for nRows.Next() {
			var nID, title, body, nType string
			var read bool
			var nCreated time.Time
			if nRows.Scan(&nID, &title, &body, &nType, &read, &nCreated) == nil {
				export.Notifications = append(export.Notifications, map[string]any{
					"id": nID, "title": title, "body": body,
					"type": nType, "read": read, "created_at": nCreated,
				})
			}
		}
	}
	if export.Notifications == nil {
		export.Notifications = []map[string]any{}
	}

	// ── Support tickets ────────────────────────────────────────────────────
	sRows, err := db.Query(`
		SELECT id, category, message, status, created_at
		FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC
	`, userID)
	if err == nil {
		defer sRows.Close()
		for sRows.Next() {
			var sID, cat, msg, stat string
			var sCreated time.Time
			if sRows.Scan(&sID, &cat, &msg, &stat, &sCreated) == nil {
				export.SupportTickets = append(export.SupportTickets, map[string]any{
					"id": sID, "category": cat, "message": msg,
					"status": stat, "created_at": sCreated,
				})
			}
		}
	}
	if export.SupportTickets == nil {
		export.SupportTickets = []map[string]any{}
	}

	return export, nil
}

// SendDataExportEmail generates a PDF and emails it to the user.
func SendDataExportEmail(
	host string, port int, user, password, from string,
	toEmail, toName string,
	export *UserDataExport,
) error {
	if user == "" {
		return fmt.Errorf("SMTP not configured — set SMTP_USER and SMTP_PASSWORD in .env")
	}

	// Generate PDF
	pdfBytes, err := GeneratePDF(export)
	if err != nil {
		return fmt.Errorf("PDF generation failed: %w", err)
	}

	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", "Your Cupid AI Data Export 💕")
	m.SetBody("text/html", buildEmailBody(toName, export))

	// Attach as PDF
	filename := fmt.Sprintf("CupidAI_DataExport_%s.pdf", export.ExportDate.Format("2006-01-02"))
	m.Attach(filename,
		gomail.SetCopyFunc(func(w io.Writer) error {
			_, err := w.Write(pdfBytes)
			return err
		}),
		gomail.SetHeader(map[string][]string{
			"Content-Type": {`application/pdf; name="` + filename + `"`},
		}),
	)

	d := gomail.NewDialer(host, port, user, password)
	return d.DialAndSend(m)
}

func buildEmailBody(name string, export *UserDataExport) string {
	return fmt.Sprintf(`
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px">
  <h2 style="color:#E85D75">Your Cupid AI Data Export 💕</h2>
  <p>Hi %s,</p>
  <p>As requested, here is a copy of all your personal data stored on Cupid AI.</p>
  <p><strong>Export date:</strong> %s</p>
  <p><strong>What's included:</strong></p>
  <ul>
    <li>Profile information (email, display name, subscription)</li>
    <li>%d conversation analyses</li>
    <li>%d notifications</li>
    <li>%d support tickets</li>
  </ul>
  <p>The data is attached as a JSON file (<code>cupidai_data_export.json</code>). You can open it with any text editor.</p>
  <p>If you have any questions, reply to this email or contact <a href="mailto:support@cupidai.app">support@cupidai.app</a>.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#999;font-size:12px">This email was sent in response to your GDPR data export request (Request ID: %s).</p>
</div>`,
		name,
		export.ExportDate.Format("January 2, 2006"),
		len(export.Analyses),
		len(export.Notifications),
		len(export.SupportTickets),
		export.RequestID,
	)
}

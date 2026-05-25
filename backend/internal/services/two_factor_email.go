package services

import (
	"fmt"

	"gopkg.in/gomail.v2"
)

// SendTwoFactorCode emails a 6-digit verification code to the user.
// `purposeLabel` shown in the email body (e.g. "Sign-in", "Enable 2FA", "Disable 2FA").
func SendTwoFactorCode(
	host string, port int, user, password, from string,
	toEmail, toName, code, purposeLabel string,
) error {
	if user == "" {
		return fmt.Errorf("SMTP not configured — set credentials in Mail Settings")
	}

	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", fmt.Sprintf("Cupid AI — %s verification code", purposeLabel))
	m.SetBody("text/html", buildCodeEmail(toName, code, purposeLabel))

	d := gomail.NewDialer(host, port, user, password)
	return d.DialAndSend(m)
}

func buildCodeEmail(name, code, purposeLabel string) string {
	if name == "" {
		name = "there"
	}
	return fmt.Sprintf(`
<div style="font-family:-apple-system,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#F8F7F6;">
  <div style="background:#fff;border-radius:16px;padding:32px;text-align:center;box-shadow:0 4px 16px rgba(232,93,117,0.08);">
    <h2 style="color:#E85D75;margin:0 0 8px;font-size:24px;">Cupid AI</h2>
    <p style="color:#8B8B8B;margin:0 0 28px;font-size:13px;">Your AI flirting coach</p>

    <p style="color:#2D2D2D;font-size:16px;margin-bottom:24px;">Hi %s,</p>
    <p style="color:#2D2D2D;font-size:14px;margin-bottom:24px;">
      Here is your <strong>%s</strong> verification code:
    </p>

    <div style="background:#F5E8EC;border-radius:12px;padding:24px;margin:24px 0;display:inline-block;">
      <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:800;letter-spacing:10px;color:#E85D75;">%s</span>
    </div>

    <p style="color:#8B8B8B;font-size:13px;margin-top:24px;">
      This code expires in <strong>10 minutes</strong>. If you didn't request it, you can safely ignore this email.
    </p>
  </div>
  <p style="color:#999;font-size:11px;text-align:center;margin-top:20px;">
    Cupid AI · Never share this code with anyone, including support staff.
  </p>
</div>`, name, purposeLabel, code)
}

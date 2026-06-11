import nodemailer from 'nodemailer'

// ─── Transport ───────────────────────────────────────────────────────
function createTransport() {
  const smtpUrl = process.env['SMTP_URL']

  if (smtpUrl) {
    return nodemailer.createTransport(smtpUrl)
  }

  // Dev mode: log to console
  console.warn('[Email] No SMTP_URL configured — emails will be logged to console')
  return {
    async sendMail(opts: { to: string; subject: string; html: string }) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`📧 Email to: ${opts.to}`)
      console.log(`   Subject: ${opts.subject}`)
      console.log(`   Body: ${opts.html.replace(/<[^>]*>/g, '').slice(0, 200)}...`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      return { messageId: `dev-${Date.now()}` }
    },
  }
}

const transporter = createTransport()
const FROM = process.env['EMAIL_FROM'] ?? 'Caseflow <noreply@caseflow.dev>'

// ─── Email Functions ─────────────────────────────────────────────────

export async function sendVerificationOTP(to: string, name: string, otp: string): Promise<void> {
  await transporter.sendMail({
    to,
    subject: 'Verify your Caseflow account',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #2563EB; font-size: 24px;">Welcome to Caseflow, ${name}!</h1>
        <p style="color: #334155; font-size: 16px; line-height: 1.6;">
          Enter this verification code to activate your account:
        </p>
        <div style="background: #F1F5F9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0F172A;">${otp}</span>
        </div>
        <p style="color: #64748B; font-size: 14px;">This code expires in 15 minutes.</p>
      </div>
    `,
  })
}

export async function sendPasswordReset(to: string, name: string, resetUrl: string): Promise<void> {
  await transporter.sendMail({
    to,
    subject: 'Reset your Caseflow password',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #2563EB; font-size: 24px;">Password Reset</h1>
        <p style="color: #334155; font-size: 16px; line-height: 1.6;">
          Hi ${name}, click the button below to reset your password:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: #2563EB; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748B; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  })
}

export async function sendBadgeEarned(to: string, name: string, badgeName: string, badgeDescription: string): Promise<void> {
  await transporter.sendMail({
    to,
    subject: `🏆 You earned the "${badgeName}" badge!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #7C3AED; font-size: 24px;">🏆 Badge Unlocked!</h1>
        <p style="color: #334155; font-size: 16px; line-height: 1.6;">
          Congratulations ${name}! You've earned a new badge:
        </p>
        <div style="background: #F5F3FF; border: 2px solid #7C3AED; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <h2 style="color: #7C3AED; margin: 0;">${badgeName}</h2>
          <p style="color: #6D28D9; margin: 8px 0 0;">${badgeDescription}</p>
        </div>
      </div>
    `,
  })
}

export async function sendWeeklySummary(to: string, name: string, stats: {
  casesCompleted: number
  xpEarned: number
  streak: number
  level: number
}): Promise<void> {
  await transporter.sendMail({
    to,
    subject: `Your Caseflow Weekly Summary`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #2563EB; font-size: 24px;">Weekly Summary</h1>
        <p style="color: #334155; font-size: 16px;">Great work this week, ${name}!</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
          <div style="background: #F1F5F9; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #0F172A;">${stats.casesCompleted}</div>
            <div style="color: #64748B; font-size: 12px;">Cases Completed</div>
          </div>
          <div style="background: #F5F3FF; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #7C3AED;">${stats.xpEarned}</div>
            <div style="color: #64748B; font-size: 12px;">XP Earned</div>
          </div>
          <div style="background: #FFF7ED; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #D97706;">🔥 ${stats.streak}</div>
            <div style="color: #64748B; font-size: 12px;">Day Streak</div>
          </div>
          <div style="background: #F0FDF4; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #16A34A;">Lv. ${stats.level}</div>
            <div style="color: #64748B; font-size: 12px;">Current Level</div>
          </div>
        </div>
      </div>
    `,
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ssg-givebox.vercel.app'
const LOGO_URL = `${APP_URL}/ssg-logo.png`

export async function POST(request: NextRequest) {
  try {
    const { subject, message, itemCount } = await request.json()

    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
    }

    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('email')
      .eq('is_active', true)

    if (error || !subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No active subscribers' })
    }

    const emails = subscribers.map((s: { email: string }) => s.email)

    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        emails.map((email: string) => ({
          from: 'SSG GiveBox <onboarding@resend.dev>',
          to: email,
          subject: subject || '🆕 New Items Available at SSG GiveBox!',
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #1a0505 0%, #2d0a0a 50%, #1a0505 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(180deg, #2a1010 0%, #1a0808 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #f59e0b 100%); padding: 40px 40px 30px; text-align: center;">
              <img src="${LOGO_URL}" alt="SSG Logo" width="80" height="80" style="border-radius: 50%; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
              <h1 style="color: white; font-size: 28px; font-weight: bold; margin: 20px 0 5px; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">SSG GiveBox</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0; letter-spacing: 1px;">Share More. Care More.</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #fecaca; font-size: 16px; margin: 0 0 20px; line-height: 1.6;">Hi there! 👋</p>
              
              <p style="color: #fca5a5; font-size: 15px; margin: 0 0 25px; line-height: 1.7;">${message || 'Great news! New items have been added to SSG GiveBox and are ready for pickup.'}</p>
              
              ${itemCount ? `
              <!-- Item Count Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #dc2626 0%, #f59e0b 100%); border-radius: 16px; padding: 30px; text-align: center;">
                    <p style="color: white; font-size: 56px; font-weight: bold; margin: 0; text-shadow: 0 4px 15px rgba(0,0,0,0.3);">${itemCount}</p>
                    <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 10px 0 0; font-weight: 500;">New Items Available</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Pickup Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin: 25px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <p style="color: #fbbf24; font-size: 14px; font-weight: bold; margin: 0 0 15px; text-transform: uppercase; letter-spacing: 1px;">📅 Pickup Details</p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #fecaca; font-size: 15px;">📍</td>
                        <td style="padding: 8px 0 8px 12px; color: #fecaca; font-size: 15px;">Beside SSG Office</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #fecaca; font-size: 15px;">🗓️</td>
                        <td style="padding: 8px 0 8px 12px; color: #fecaca; font-size: 15px;">Every Friday</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #fecaca; font-size: 15px;">⏰</td>
                        <td style="padding: 8px 0 8px 12px; color: #fecaca; font-size: 15px;">8:00 AM - 9:00 PM</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #f87171; font-size: 14px; margin: 25px 0; line-height: 1.6; text-align: center; font-style: italic;">Don't miss out - items are available on a first come, first served basis!</p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 20px;">
                    <a href="${APP_URL}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 8px 25px rgba(220,38,38,0.4);">View Available Items →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: rgba(0,0,0,0.3); padding: 25px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #f87171; font-size: 13px; margin: 0 0 8px; font-weight: 500;">Supreme Student Government</p>
              <p style="color: rgba(248,113,113,0.7); font-size: 12px; margin: 0;">CTU Daanbantayan Campus</p>
              <p style="color: rgba(248,113,113,0.5); font-size: 11px; margin: 15px 0 0;">You received this email because you subscribed to SSG GiveBox notifications.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `,
        }))
      ),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend batch error:', error)
      return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Notifications sent to ${emails.length} subscribers` 
    })
  } catch (error) {
    console.error('Error broadcasting notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ssg-givebox.vercel.app'
const LOGO_URL = `${APP_URL}/ssg-logo.png`

export async function POST(request: NextRequest) {
  try {
    const { email, donorName, itemsDonated, totalItems, donationDate } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    if (!donorName || !itemsDonated) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured - email would be sent to:', email)
      return NextResponse.json({ success: true, message: 'Thank you recorded' })
    }

    const formattedDate = new Date(donationDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SSG GiveBox <onboarding@resend.dev>',
        to: email,
        subject: '💝 Thank You for Your Generous Donation - SSG GiveBox',
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

          <!-- Thank You Badge -->
          <tr>
            <td style="padding: 30px 40px 0; text-align: center;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #dc2626 0%, #f59e0b 100%); padding: 12px 24px; border-radius: 50px;">
                    <p style="color: white; font-size: 14px; font-weight: bold; margin: 0;">💝 Heartfelt Gratitude</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px 40px;">
              <p style="color: #fecaca; font-size: 16px; margin: 0 0 20px; line-height: 1.6;">Dear ${donorName},</p>
              
              <p style="color: #fca5a5; font-size: 15px; margin: 0 0 25px; line-height: 1.7;">On behalf of the <strong style="color: #fbbf24;">Supreme Student Government</strong> of CTU Daanbantayan Campus, we extend our deepest gratitude for your generous donation to the <strong style="color: #fbbf24;">SSG GiveBox</strong> program.</p>

              <!-- Donation Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin: 25px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <p style="color: #fbbf24; font-size: 14px; font-weight: bold; margin: 0 0 15px; text-transform: uppercase; letter-spacing: 1px;">Your Donation Details</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: rgba(254,202,202,0.7); font-size: 13px;">Date:</td>
                        <td style="padding: 8px 0; color: #fecaca; font-size: 14px; font-weight: 500; text-align: right;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(254,202,202,0.7); font-size: 13px;">Total Items:</td>
                        <td style="padding: 8px 0; color: #fecaca; font-size: 14px; font-weight: 500; text-align: right;">${totalItems} ${totalItems === 1 ? 'item' : 'items'}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 15px 0 8px; color: rgba(254,202,202,0.7); font-size: 13px; border-top: 1px solid rgba(255,255,255,0.1);">Items Donated:</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 8px 0; color: #fecaca; font-size: 14px; line-height: 1.6;">${itemsDonated}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Impact Message -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #dc2626 0%, #f59e0b 100%); border-radius: 16px; padding: 25px; text-align: center;">
                    <p style="color: white; font-size: 17px; margin: 0; font-weight: 500; line-height: 1.6;">Your kindness will directly help fellow students in need. Thank you for making a difference! 🌟</p>
                  </td>
                </tr>
              </table>

              <p style="color: #fca5a5; font-size: 15px; margin: 25px 0; line-height: 1.7;">Your contribution embodies the spirit of <em style="color: #fbbf24;">"bayanihan"</em> and strengthens our community. Through your generosity, we are able to support students who need essential items, helping them focus on their education and personal growth.</p>

              <p style="color: #fca5a5; font-size: 15px; margin: 25px 0; line-height: 1.7;">The items you donated will be made available to students through our weekly distribution program. Every Friday, students can visit the SSG Office to claim items they need, and your donation will be part of that positive impact.</p>

              <!-- Appreciation Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(251,191,36,0.1); border-radius: 12px; border-left: 4px solid #fbbf24; margin: 25px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #fecaca; font-size: 15px; margin: 0; line-height: 1.7; font-style: italic;">"The best way to find yourself is to lose yourself in the service of others." - Mahatma Gandhi</p>
                  </td>
                </tr>
              </table>

              <p style="color: #fca5a5; font-size: 15px; margin: 25px 0; line-height: 1.7;">We hope to continue working with generous individuals like you to build a more caring and supportive campus community. Should you wish to make future donations or have any questions about the SSG GiveBox program, please don't hesitate to reach out to us.</p>

              <p style="color: #f87171; font-size: 16px; margin: 30px 0 10px;">With sincere appreciation,</p>
              <p style="color: #fbbf24; font-size: 16px; margin: 0; font-weight: 600;">The Supreme Student Government</p>
              <p style="color: #fca5a5; font-size: 14px; margin: 5px 0 0;">CTU Daanbantayan Campus</p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 30px 0 10px;">
                    <a href="${APP_URL}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 8px 25px rgba(220,38,38,0.4);">Visit SSG GiveBox →</a>
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
              <p style="color: rgba(248,113,113,0.5); font-size: 11px; margin: 15px 0 0;">This is an official acknowledgment from SSG GiveBox for your donation.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      
      // Parse error for better messaging
      let errorMessage = 'Failed to send email'
      try {
        const errorData = JSON.parse(error)
        if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch (e) {
        // If parsing fails, use the raw error
        errorMessage = error
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: 'Check if the email is verified in Resend (free tier requires verified recipients)'
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Thank you email sent successfully' })
  } catch (error) {
    console.error('Error sending thank you email:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

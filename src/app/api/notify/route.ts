import { NextRequest, NextResponse } from 'next/server'

// This API sends notification emails to subscribers
// You'll need to set up a Resend account (free tier: 100 emails/day)
// Get your API key from https://resend.com

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured - email would be sent to:', email)
      // Still return success so the subscription is saved
      return NextResponse.json({ success: true, message: 'Subscription saved' })
    }

    // Send welcome email for new subscribers
    if (type === 'welcome') {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SSG GiveBox <onboarding@resend.dev>',
          to: email,
          subject: '🎉 Welcome to SSG GiveBox Notifications!',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #fef7f0; }
                .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; }
                .title { color: #DC2626; font-size: 24px; font-weight: bold; margin: 0; }
                .tagline { color: #F59E0B; font-size: 14px; margin-top: 5px; }
                .content { color: #374151; line-height: 1.6; }
                .highlight { background: linear-gradient(135deg, #DC2626, #F59E0B); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="header">
                    <div class="title">SSG GiveBox</div>
                    <div class="tagline">Share More. Care More.</div>
                  </div>
                  
                  <div class="content">
                    <p>Hi there! 👋</p>
                    
                    <p>Thank you for subscribing to <strong>SSG GiveBox</strong> notifications! You're now part of our community of caring students.</p>
                    
                    <div class="highlight">
                      <p style="margin: 0; font-size: 18px;">🔔 You'll be notified when new items are available!</p>
                    </div>
                    
                    <p><strong>What to expect:</strong></p>
                    <ul>
                      <li>📦 Weekly updates on new donated items</li>
                      <li>📢 Important announcements from SSG</li>
                      <li>🎁 Special donation drives and events</li>
                    </ul>
                    
                    <p>Remember, items are available for pickup every <strong>Friday</strong> at the SSG Office. First come, first served!</p>
                    
                    <p>See you soon! 💝</p>
                  </div>
                  
                  <div class="footer">
                    <p>Supreme Student Government • CTU Daanbantayan Campus</p>
                    <p>You received this email because you subscribed to SSG GiveBox notifications.</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Resend error:', error)
        // Still return success - subscription is saved even if email fails
        return NextResponse.json({ success: true, message: 'Subscription saved' })
      }
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ success: true, message: 'Subscription saved' })
  }
}

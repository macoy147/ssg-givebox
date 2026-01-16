import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

// This API sends notification emails to ALL active subscribers
// Call this when new items are added or announcements are published

export async function POST(request: NextRequest) {
  try {
    const { subject, message, itemCount } = await request.json()

    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
    }

    // Get all active subscribers
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

    const emails = subscribers.map(s => s.email)

    // Send batch email using Resend
    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        emails.map(email => ({
          from: 'SSG GiveBox <onboarding@resend.dev>',
          to: email,
          subject: subject || '🆕 New Items Available at SSG GiveBox!',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #fef7f0; }
                .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .title { color: #DC2626; font-size: 24px; font-weight: bold; margin: 0; }
                .tagline { color: #F59E0B; font-size: 14px; margin-top: 5px; }
                .content { color: #374151; line-height: 1.6; }
                .highlight { background: linear-gradient(135deg, #DC2626, #F59E0B); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; }
                .highlight-number { font-size: 48px; font-weight: bold; margin: 0; }
                .highlight-text { font-size: 16px; margin-top: 5px; }
                .cta { display: inline-block; background: #DC2626; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px; }
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
                    
                    <p>${message || 'Great news! New items have been added to SSG GiveBox and are ready for pickup.'}</p>
                    
                    ${itemCount ? `
                    <div class="highlight">
                      <p class="highlight-number">${itemCount}</p>
                      <p class="highlight-text">New Items Available</p>
                    </div>
                    ` : ''}
                    
                    <p><strong>📅 Pickup Details:</strong></p>
                    <ul>
                      <li>📍 SSG Office, 2nd Floor Admin Building</li>
                      <li>🗓️ Every Friday</li>
                      <li>⏰ 8:00 AM - 12:00 PM</li>
                    </ul>
                    
                    <p>Don't miss out - items are available on a first come, first served basis!</p>
                    
                    <center>
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ssg-givebox.vercel.app'}" class="cta">
                        View Available Items →
                      </a>
                    </center>
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

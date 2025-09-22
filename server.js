import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PWD,
  },
});

app.post('/api/contact', (req, res) => {
  const { name, email, phone, company, timeline, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are mandatory fields." });
  }

  const adminHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Company:</strong> ${company || 'N/A'}</p>
      <p><strong>Timeline:</strong> ${timeline || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    </div>`;

  const userHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body, html { margin: 0; padding: 0; }
        .container {
          width: 100%;
          max-width: 600px;
          margin: auto;
          font-family: Arial, sans-serif;
          background-color: #1a1a1a;
          color: #e0e0e0;
          line-height: 1.6;
        }
        .header, .footer {
          padding: 20px;
          text-align: center;
          background-color: #2c2c2c;
        }
        .content {
          padding: 30px;
          background-color: #1a1a1a;
        }
        
        .content > p,
        .footer > p {
        color: #ffff;
        }
        .signature {
          padding-top: 20px;
        }
        .disclaimer {
          padding: 20px;
          background-color: #1a1a1a;
          font-size: 10px;
          color: #777;
          text-align: justify;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://res.cloudinary.com/dihzozrtp/image/upload/v1758482562/companyLogo_vribay.png" alt="Company Logo" style="max-width: 150px; height: auto;">
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>I hope this message finds you well. Thank you for reaching out to us. We value your interest and are eager to discuss your ERP needs further.</p>
          <p>We have received your message and our team will promptly review your submission. We will get back to you shortly to schedule a discussion on how we can best proceed toward our mutual goals.</p>
          <p>If you have any questions or need assistance, please don’t hesitate to contact us directly.</p>
          <p>We look forward to collaborating with you.</p>
          <p class="signature">Best Regards,<br>Megha Kumari - Business Consultant</p>
        </div>
        <div class="footer">
          <p style="margin: 0; padding-bottom: 5px; font-size: 16px;"><strong>Think ERP Solutions, India</strong></p>
          <p style="margin: 0; padding-bottom: 5px;">Call: +91-8797327756</p>
          <p style="margin: 0; padding-bottom: 5px;">WhatsApp: +91-8797327756</p>
          <p style="margin: 0;"><a href="https://www.thinkerpsolutions.com" style="color: #61A3EF;">www.thinkerpsolutions.com</a></p>
        </div>
        <div class="disclaimer">
          <p>This email and any attachments are intended solely for the use of the intended recipient(s) and may contain confidential or privileged information. If you are not the intended recipient, please notify the sender immediately, delete the email from your system, and refrain from copying, distributing, or using any of the information. Any unauthorized review, use, disclosure, or distribution is prohibited. The views and opinions expressed in this email are those of the sender and do not necessarily reflect the views of the company. Please consider the environment before printing this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;

  const adminMailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `New Contact Form Submission from ${name} at ${company || 'N/A'}`,
    html: adminHtml,
  };

  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Confirmation: Your Message to Think ERP Solutions`,
    html: userHtml,
  };

  transporter.sendMail(adminMailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email to admin:', error);
      return res.status(500).json({ error: 'Failed to send email to admin.' });
    }
    console.log('Admin email sent:', info.response);

    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.error('Error sending acknowledgement email to user:', error);
      } else {
        console.log('User email sent:', info.response);
      }
      return res.status(200).json({ success: true, message: 'Emails sent successfully!' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is Running on http://localhost:${PORT}`);
});
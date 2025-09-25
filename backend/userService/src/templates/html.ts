export const otpEMailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Your OTP Code</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 20px;
            color: #2d3748;
        }
        
        .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .otp-container {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border: 2px dashed #cbd5e0;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        
        .otp-label {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #718096;
            margin-bottom: 15px;
        }
        
        .otp-code {
            font-size: 36px;
            font-weight: 700;
            font-family: 'Courier New', monospace;
            color: #2d3748;
            letter-spacing: 8px;
            background-color: #ffffff;
            padding: 15px 25px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            display: inline-block;
            margin-bottom: 15px;
        }
        
        .otp-validity {
            font-size: 14px;
            color: #e53e3e;
            font-weight: 500;
        }
        
        .security-notice {
            background-color: #fef5e7;
            border-left: 4px solid #f6ad55;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 30px 0;
        }
        
        .security-notice h3 {
            font-size: 16px;
            font-weight: 600;
            color: #c05621;
            margin-bottom: 10px;
        }
        
        .security-notice p {
            font-size: 14px;
            color: #9c4221;
            line-height: 1.6;
        }
        
        .help-section {
            background-color: #f7fafc;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
        }
        
        .help-section h3 {
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 10px;
        }
        
        .help-section p {
            font-size: 14px;
            color: #4a5568;
            line-height: 1.6;
        }
        
        .footer {
            background-color: #2d3748;
            color: #a0aec0;
            padding: 30px;
            text-align: center;
        }
        
        .footer p {
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .footer .company-name {
            font-weight: 600;
            color: #ffffff;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #a0aec0;
            text-decoration: none;
            font-size: 12px;
            padding: 8px 12px;
            border: 1px solid #4a5568;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        .social-links a:hover {
            background-color: #4a5568;
            color: #ffffff;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .otp-code {
                font-size: 28px;
                letter-spacing: 4px;
                padding: 12px 20px;
            }
            
            .help-section, .security-notice {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>Email Verification</h1>
            <p>Secure access to your account</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <div class="greeting">
                Hello {{userName}},
            </div>
            
            <div class="message">
                We received a request to verify your email address for your account. To complete the verification process, please use the One-Time Password (OTP) below:
            </div>
            
            <!-- OTP Container -->
            <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">{{otpCode}}</div>
                <div class="otp-validity">⏰ This code expires in 10 minutes</div>
            </div>
            
            <!-- Security Notice -->
            <div class="security-notice">
                <h3>🔒 Security Notice</h3>
                <p>
                    This code is confidential and should not be shared with anyone. Our team will never ask you for this code via phone or email. If you didn't request this verification, please ignore this email or contact our support team.
                </p>
            </div>
            
            <!-- Help Section -->
            <div class="help-section">
                <h3>Need Help?</h3>
                <p>
                    If you're having trouble with the verification process or didn't request this code, please contact our support team at <strong>support@Whispr.com</strong> or visit our help center.
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p class="company-name">Whispr</p>
            <p>Making your digital experience secure and seamless</p>
            <p style="font-size: 12px; margin-top: 15px;">
                This is an automated email. Please do not reply to this message.
            </p>
            
            <div class="social-links">
                <a href="#">Help Center</a>
                <a href="#">Contact Us</a>
            </div>
        </div>
    </div>
</body>
</html>
`

export const verfiedEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome! Verification Successful</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .success-icon {
            font-size: 48px;
            margin-bottom: 15px;
            animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
            0%, 20%, 60%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
            80% {
                transform: translateY(-5px);
            }
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 20px;
            color: #2d3748;
        }
        
        .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .success-container {
            background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
            border: 2px solid #68d391;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        
        .success-title {
            font-size: 20px;
            font-weight: 600;
            color: #2f855a;
            margin-bottom: 15px;
        }
        
        .success-message {
            font-size: 16px;
            color: #276749;
            line-height: 1.6;
        }
        
        .cta-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            color: white;
        }
        
        .cta-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .cta-description {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 25px;
            line-height: 1.6;
        }
        
        .cta-button {
            display: inline-block;
            background-color: #ffffff;
            color: #667eea;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        
        .cta-button:hover {
            background-color: transparent;
            color: #ffffff;
            border-color: #ffffff;
        }
        
        .features-section {
            background-color: #f7fafc;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
        }
        
        .features-title {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .feature-item {
            text-align: center;
            padding: 15px;
        }
        
        .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .feature-title {
            font-size: 14px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 8px;
        }
        
        .feature-description {
            font-size: 12px;
            color: #4a5568;
            line-height: 1.5;
        }
        
        .support-section {
            background-color: #edf2f7;
            border-left: 4px solid #667eea;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 30px 0;
        }
        
        .support-section h3 {
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 10px;
        }
        
        .support-section p {
            font-size: 14px;
            color: #4a5568;
            line-height: 1.6;
        }
        
        .footer {
            background-color: #2d3748;
            color: #a0aec0;
            padding: 30px;
            text-align: center;
        }
        
        .footer p {
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .footer .company-name {
            font-weight: 600;
            color: #ffffff;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #a0aec0;
            text-decoration: none;
            font-size: 12px;
            padding: 8px 12px;
            border: 1px solid #4a5568;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        .social-links a:hover {
            background-color: #4a5568;
            color: #ffffff;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .success-container, .cta-section, .features-section, .support-section {
                padding: 20px;
                margin: 20px 0;
            }
            
            .feature-grid {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            .cta-button {
                display: block;
                margin: 0 auto;
                width: fit-content;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="success-icon">🎉</div>
            <h1>Verification Successful!</h1>
            <p>Welcome to the community</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <div class="greeting">
                Congratulations {{userName}}!
            </div>
            
            <div class="message">
                Your email has been successfully verified and your account is now fully activated. You're all set to explore everything our platform has to offer.
            </div>
            
            <!-- Success Container -->
            <div class="success-container">
                <div class="success-title">✅ Account Verified</div>
                <div class="success-message">
                    Your journey begins now! You have full access to all features and can start using our application immediately.
                </div>
            </div>
            
            <!-- Call to Action -->
            <div class="cta-section">
                <div class="cta-title">Ready to Get Started?</div>
                <div class="cta-description">
                    Jump right in and discover all the amazing features waiting for you. Our platform is designed to make your experience seamless and enjoyable.
                </div>
                <a href="{{loginUrl}}" class="cta-button">Access Your Account</a>
            </div>
            
            <!-- Features Section -->
            <div class="features-section">
                <div class="features-title">What You Can Do Now</div>
                <div class="feature-grid">
                    <div class="feature-item">
                        <div class="feature-icon">⚡</div>
                        <div class="feature-title">Lightning Fast</div>
                        <div class="feature-description">Experience blazing-fast performance with our optimized platform</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🔒</div>
                        <div class="feature-title">Secure & Private</div>
                        <div class="feature-description">Your data is protected with enterprise-grade security measures</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">📱</div>
                        <div class="feature-title">Multi-Device</div>
                        <div class="feature-description">Access your account seamlessly across all your devices</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🎯</div>
                        <div class="feature-title">Personalized</div>
                        <div class="feature-description">Tailored experience that adapts to your preferences</div>
                    </div>
                </div>
            </div>
            
            <!-- Support Section -->
            <div class="support-section">
                <h3>🤝 Need Help Getting Started?</h3>
                <p>
                    Our support team is here to help you every step of the way. Check out our getting started guide, browse our help center, or reach out to us directly at <strong>support@Whispr.com</strong>
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p class="company-name">Whispr</p>
            <p>Thank you for choosing us for your digital journey</p>
            <p style="font-size: 12px; margin-top: 15px;">
                This is an automated welcome email. You can update your email preferences in your account settings.
            </p>
            
            <div class="social-links">
                <a href="#">Help Center</a>
                <a href="#">Contact Us</a>
                <a href="#">About</a>
            </div>
        </div>
    </div>
</body>
</html>
`
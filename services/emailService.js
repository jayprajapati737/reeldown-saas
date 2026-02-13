const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Generate recovery token
const generateRecoveryToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Send recovery email to disabled superadmin
const sendRecoveryEmail = async (user, recoveryToken) => {
    const transporter = createTransporter();

    const recoveryLink = `${process.env.FRONTEND_URL || 'https://reeldown-saas-production.up.railway.app'}/recovery?token=${recoveryToken}`;

    const mailOptions = {
        from: `"ReelDown Admin" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🔐 Account Recovery - Superadmin Access Disabled',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">Account Recovery Required</h2>
                <p>Hello ${user.name},</p>
                <p>Your superadmin account has been disabled. To recover your account with limited access, please click the link below:</p>
                <div style="margin: 30px 0;">
                    <a href="${recoveryLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Recover Account
                    </a>
                </div>
                <p><strong>Important:</strong></p>
                <ul>
                    <li>This link is valid for 15 minutes</li>
                    <li>You will be granted limited admin access</li>
                    <li>Full superadmin access requires approval from another superadmin</li>
                </ul>
                <p>If you did not request this, please contact support immediately.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">ReelDown SaaS Platform</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Recovery email sent to:', user.email);
        return true;
    } catch (error) {
        console.error('Error sending recovery email:', error);
        return false;
    }
};

// Send approval notification to active superadmins
const sendApprovalNotification = async (superadmins, requestingUser) => {
    const transporter = createTransporter();

    const approvalLink = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/admin`;

    for (const admin of superadmins) {
        const mailOptions = {
            from: `"ReelDown Admin" <${process.env.EMAIL_USER}>`,
            to: admin.email,
            subject: '⚠️ Superadmin Approval Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #667eea;">Superadmin Approval Required</h2>
                    <p>Hello ${admin.name},</p>
                    <p><strong>${requestingUser.name}</strong> (${requestingUser.email}) has requested full superadmin access restoration.</p>
                    <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
                        <p style="margin: 0;"><strong>User Details:</strong></p>
                        <p style="margin: 5px 0;">Name: ${requestingUser.name}</p>
                        <p style="margin: 5px 0;">Email: ${requestingUser.email}</p>
                        <p style="margin: 5px 0;">Current Role: ${requestingUser.role}</p>
                    </div>
                    <div style="margin: 30px 0;">
                        <a href="${approvalLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Review Request
                        </a>
                    </div>
                    <p>Please log in to the admin dashboard to approve or deny this request.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">ReelDown SaaS Platform</p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Approval notification sent to:', admin.email);
        } catch (error) {
            console.error('Error sending approval notification:', error);
        }
    }
};

// Send approval confirmation
const sendApprovalConfirmation = async (user) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"ReelDown Admin" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '✅ Superadmin Access Restored',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #10b981;">Access Restored Successfully</h2>
                <p>Hello ${user.name},</p>
                <p>Your full superadmin access has been restored.</p>
                <div style="background: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
                    <p style="margin: 0; color: #065f46;"><strong>✓ Full superadmin privileges activated</strong></p>
                </div>
                <p>You can now access all administrative features.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">ReelDown SaaS Platform</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Approval confirmation sent to:', user.email);
        return true;
    } catch (error) {
        console.error('Error sending approval confirmation:', error);
        return false;
    }
};

// Generic send email function
const sendEmail = async (options) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"ReelDown Admin" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html || options.text // Support both HTML or text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent to:', options.to);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    generateRecoveryToken,
    sendRecoveryEmail,
    sendApprovalNotification,
    sendApprovalConfirmation,
    sendEmail
};

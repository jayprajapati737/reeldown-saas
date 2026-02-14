const https = require('https');

async function testLogin() {
    require('dotenv').config();
    const email = 'jaykuma809254@gmail.com';
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
        console.error('❌ ADMIN_PASSWORD environment variable is not set!');
        process.exit(1);
    }

    const data = JSON.stringify({ email, password });

    const options = {
        hostname: 'reeldown-saas-production.up.railway.app',
        port: 443,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    console.log(`Attempting login to: https://${options.hostname}${options.path}`);

    const req = https.request(options, res => {
        console.log(`Status Code: ${res.statusCode}`);

        let responseBody = '';

        res.on('data', d => {
            responseBody += d;
        });

        res.on('end', () => {
            try {
                const jsonResponse = JSON.parse(responseBody);
                console.log('\n--- Response Body ---');
                console.log(JSON.stringify(jsonResponse, null, 2));

                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('\n✅ Login HTTP Request Successful');
                    if (jsonResponse.user) {
                        console.log(`🔎 User ID from Production: ${jsonResponse.user.id}`);
                        console.log(`   User Role: ${jsonResponse.user.role}`);
                        console.log(`   User Plan: ${jsonResponse.user.plan}`);
                    }

                    if (jsonResponse.user && ['superadmin', 'admin', 'moderator'].includes(jsonResponse.user.role)) {
                        console.log(`✅ Role Valid: ${jsonResponse.user.role}`);
                    } else {
                        console.log(`❌ Role Invalid: ${jsonResponse.user ? jsonResponse.user.role : 'No user object'}`);
                    }
                } else {
                    console.log('\n❌ Login Failed');
                }
            } catch (e) {
                console.error('Error parsing JSON:', e);
                console.log('Raw response:', responseBody);
            }
        });
    });

    req.on('error', error => {
        console.error('❌ Request Error:', error);
    });

    req.write(data);
    req.end();
}

testLogin();

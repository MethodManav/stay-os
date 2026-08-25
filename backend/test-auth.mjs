

async function test() {
  try {
    const loginRes = await fetch('http://localhost:5001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password' })
    });
    
    const loginData = await loginRes.json();
    console.log('Login status:', loginRes.status);
    console.log('Login body:', loginData);
    
    const cookie = loginRes.headers.get('set-cookie');
    console.log('Set-Cookie:', cookie);
    
    let headers = {};
    if (cookie) {
      headers['Cookie'] = cookie;
    }
    
    const meRes = await fetch('http://localhost:5001/api/v1/auth/me', {
      method: 'GET',
      headers
    });
    
    const meData = await meRes.json();
    console.log('Me status:', meRes.status);
    console.log('Me body:', meData);
    
  } catch (err) {
    console.error('Test error:', err);
  }
}

test();

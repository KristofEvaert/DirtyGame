const http = require('http');

const testMimeTypes = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/assets/main-d990597a.js',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('📋 Response Headers:');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    console.log(`Content-Length: ${res.headers['content-length']}`);
    
    if (res.headers['content-type'] === 'application/javascript') {
      console.log('✅ SUCCESS: JavaScript file served with correct MIME type!');
    } else {
      console.log('❌ ERROR: Wrong MIME type for JavaScript file');
      console.log(`   Expected: application/javascript`);
      console.log(`   Got: ${res.headers['content-type']}`);
    }
    
    process.exit(0);
  });

  req.on('error', (err) => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  });

  req.end();
};

console.log('🧪 Testing MIME types...');
console.log('🌐 Connecting to http://localhost:3001/assets/main-d990597a.js');
testMimeTypes();

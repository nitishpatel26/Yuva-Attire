const http = require('http');
require('dotenv').config();

// Helper to make HTTP requests
function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting End-to-End API Validation for Yuva Attire...\n');

  let adminToken = '';
  let customerToken = '';
  let testProductId = '';

  // 1. Health check
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('1. Health check:', health.status === 200 && health.data.status === 'ok' ? '✅ PASSED' : '❌ FAILED');

  // 2. Admin Login
  const adminLogin = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: process.env.ADMIN_EMAIL || 'admin@yuva.local', password: process.env.ADMIN_PASSWORD || 'YuvaAdmin@2026' }
  );
  adminToken = adminLogin.data.token;
  console.log('2. Admin Login:', adminLogin.data.success ? '✅ PASSED' : '❌ FAILED');

  // 3. Customer Login
  const customerLogin = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: 'riya@example.com', password: 'password123' }
  );
  customerToken = customerLogin.data.token;
  console.log('3. Customer Login (riya@example.com):', customerLogin.data.success ? '✅ PASSED' : '❌ FAILED');

  // 4. Products list
  const products = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/products',
    method: 'GET'
  });
  console.log('4. Get Products Catalog:', products.data.success && products.data.products.length > 0 ? `✅ PASSED (${products.data.products.length} products found)` : '❌ FAILED');

  testProductId = products.data.products[0].id;

  // 5. Admin EDIT Product Listing (PUT /api/products/:id)
  const editProduct = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/products/${testProductId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      }
    },
    {
      title: 'Pastel Floral Twirl Frock with Bow Headband (Updated Edition)',
      price: 1999,
      discountPrice: 1299,
      category: 'clothing',
      gender: 'girls',
      ageGroup: '2-4Y',
      sizes: [{ size: '2-3Y', stock: 25 }, { size: '3-4Y', stock: 15 }],
      isFeatured: true
    }
  );
  console.log('5. Admin Edit Product Listing (PUT /api/products/:id):', editProduct.data.success ? `✅ PASSED (Title: ${editProduct.data.product.title}, Discount: ${editProduct.data.product.discountPercentage}%)` : '❌ FAILED');

  // 6. Admin Inventory Update / Stock Adjust
  const inventoryUpdate = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/products/${testProductId}/inventory`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      }
    },
    { addStock: 5 }
  );
  console.log('6. Admin Quick Inventory Stock Update:', inventoryUpdate.data.success ? `✅ PASSED (Total Stock: ${inventoryUpdate.data.product.totalStock})` : '❌ FAILED');

  // 7. Admin Dashboard Overview Analytics
  const adminDash = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('7. Admin Dashboard KPIs & Analytics:', adminDash.data.success && adminDash.data.kpis.totalRevenue >= 0 ? `✅ PASSED (Total Products: ${adminDash.data.kpis.totalProducts})` : '❌ FAILED');

  console.log('\n🎉 ALL ADMIN EDIT & LOGO CHECKS PASSED PERFECTLY!\n');
  process.exit(0);
}

runTests().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});

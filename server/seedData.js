const bcrypt = require('bcryptjs');
const db = require('./db');

function syncAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@yuva.local').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'YuvaAdmin@2026';
  const adminPasswordHash = bcrypt.hashSync(adminPassword, 10);

  const existingAdmin = db.findOne('users', (u) => u.role === 'admin' || u.email.toLowerCase() === adminEmail);

  if (existingAdmin) {
    db.updateById('users', existingAdmin.id, {
      email: adminEmail,
      password: adminPasswordHash,
      role: 'admin'
    });
    console.log(`🔐 Admin account synchronized from environment: ${adminEmail}`);
  } else {
    const newAdmin = {
      id: 'usr_admin_01',
      name: 'Yuva Admin',
      email: adminEmail,
      password: adminPasswordHash,
      role: 'admin',
      isVip: true,
      vipExpiry: '2028-12-31T23:59:59.000Z',
      phone: '+91 9876543210',
      addresses: [
        {
          id: 'addr_1',
          name: 'Yuva Attire Headquarters',
          street: '45, Fashion Avenue, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          phone: '+91 9876543210',
          isDefault: true
        }
      ],
      createdAt: new Date().toISOString()
    };
    db.insert('users', newAdmin);
    console.log(`🔐 Admin account created from environment: ${adminEmail}`);
  }
}

async function seedDatabase() {
  // Always synchronize admin account from current environment variables (Local .env or PROD)
  syncAdminUser();

  // Check if already seeded with products
  if (db.find('products').length > 0) {
    console.log('Database already has products. Skipping product seed.');
    return;
  }

  console.log('Seeding initial data for Yuva Attire...');

  const userPasswordHash = bcrypt.hashSync('password123', 10);

  const adminUser = {
    id: 'usr_admin_01',
    name: 'Yuva Admin',
    email: adminEmail,
    password: adminPasswordHash,
    role: 'admin',
    isVip: true,
    vipExpiry: '2028-12-31T23:59:59.000Z',
    phone: '+91 9876543210',
    addresses: [
      {
        id: 'addr_1',
        name: 'Yuva Attire Headquarters',
        street: '45, Fashion Avenue, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        phone: '+91 9876543210',
        isDefault: true
      }
    ],
    createdAt: new Date().toISOString()
  };

  const sampleCustomer = {
    id: 'usr_cust_01',
    name: 'Riya Sharma',
    email: 'riya@example.com',
    password: userPasswordHash,
    role: 'customer',
    isVip: true,
    vipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    phone: '+91 9123456789',
    addresses: [
      {
        id: 'addr_cust_1',
        name: 'Riya Sharma',
        street: 'Flat 402, Sunshine Heights, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        phone: '+91 9123456789',
        isDefault: true
      }
    ],
    createdAt: new Date().toISOString()
  };

  db.insert('users', adminUser);
  db.insert('users', sampleCustomer);

  // 2. Seed Coupons
  const coupons = [
    {
      code: 'WELCOME10',
      discountPercent: 10,
      maxDiscount: 500,
      minOrder: 499,
      description: '10% off on your first order over ₹499'
    },
    {
      code: 'KIDSFEST20',
      discountPercent: 20,
      maxDiscount: 1000,
      minOrder: 1499,
      description: '20% off on festival kids collection above ₹1499'
    },
    {
      code: 'YUVAVIP15',
      discountPercent: 15,
      maxDiscount: 1500,
      minOrder: 999,
      description: 'Exclusive 15% VIP shopping discount'
    }
  ];

  coupons.forEach((c) => db.insert('coupons', c));

  // 3. Seed Products (High quality Yuva Attire kids items across Boys, Girls, Infants, Shoes, Toys, Accessories)
  const products = [
    {
      id: 'prod_001',
      title: 'Pastel Floral Twirl Frock with Bow Headband',
      description: 'Premium soft cotton blend pastel twirl frock with elegant floral patterns, gentle inner lining, and matching elasticated headband for birthday parties and celebrations.',
      category: 'clothing',
      subCategory: 'dresses',
      gender: 'girls',
      ageGroup: '2-4Y',
      price: 1899,
      discountPrice: 1199,
      discountPercentage: 37,
      sku: 'YUV-GRL-001',
      rating: 4.8,
      reviewsCount: 142,
      isNewArrival: true,
      isBestSeller: true,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: [
        { size: '1-2Y', stock: 12 },
        { size: '2-3Y', stock: 18 },
        { size: '3-4Y', stock: 10 },
        { size: '4-5Y', stock: 6 }
      ],
      totalStock: 46,
      isSoldOut: false,
      tags: ['Party Wear', 'Cotton', 'Summer', 'Frock'],
      colors: ['Pastel Pink', 'Mint Green'],
      fabric: '100% Breathable Cotton with Satin Bow',
      careInstructions: 'Gentle hand wash in cold water'
    },
    {
      id: 'prod_002',
      title: 'Dapper Blazer, Waistcoat & Chino 3-Piece Party Suit',
      description: 'Sophisticated 3-piece tuxedo set for young gentlemen. Tailored slim-fit blazer with functional pockets, matching buttoned vest, and comfortable flex-waistband chinos.',
      category: 'clothing',
      subCategory: 'party-wear',
      gender: 'boys',
      ageGroup: '4-8Y',
      price: 2999,
      discountPrice: 1899,
      discountPercentage: 37,
      sku: 'YUV-BOY-002',
      rating: 4.9,
      reviewsCount: 98,
      isNewArrival: true,
      isBestSeller: true,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: [
        { size: '4-5Y', stock: 8 },
        { size: '5-6Y', stock: 14 },
        { size: '6-7Y', stock: 9 },
        { size: '7-8Y', stock: 4 }
      ],
      totalStock: 35,
      isSoldOut: false,
      tags: ['Suit', 'Party', 'Formal', 'Wedding'],
      colors: ['Royal Navy', 'Charcoal Grey'],
      fabric: 'Fine Poly-Cotton Suiting Blend',
      careInstructions: 'Dry clean recommended'
    },
    {
      id: 'prod_003',
      title: 'Ultra-Soft Organic Cotton Baby Rompers (Pack of 3)',
      description: 'Hypoallergenic 100% GOTS certified organic cotton onesies with easy two-way front snaps for effortless diaper changes and skin-friendly tagless comfort.',
      category: 'clothing',
      subCategory: 'sets',
      gender: 'infants',
      ageGroup: '0-24M',
      price: 1499,
      discountPrice: 899,
      discountPercentage: 40,
      sku: 'YUV-INF-003',
      rating: 4.9,
      reviewsCount: 230,
      isNewArrival: false,
      isBestSeller: true,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: [
        { size: '0-3M', stock: 20 },
        { size: '3-6M', stock: 15 },
        { size: '6-12M', stock: 18 },
        { size: '12-18M', stock: 12 },
        { size: '18-24M', stock: 10 }
      ],
      totalStock: 75,
      isSoldOut: false,
      tags: ['Newborn', 'Organic Cotton', 'Essentials', 'Daily Wear'],
      colors: ['Cloud White / Honey / Sky Blue'],
      fabric: '100% GOTS Certified Organic Cotton',
      careInstructions: 'Machine wash warm, tumble dry low'
    },
    {
      id: 'prod_004',
      title: 'LED Light-Up Chunky High-Top Sneakers',
      description: 'Fun, eye-catching cushioned sneakers with USB-rechargeable multi-color LED sole modes, anti-skid rubber grip, and easy hook-and-loop velcro straps.',
      category: 'shoes',
      subCategory: 'sneakers',
      gender: 'unisex',
      ageGroup: '4-8Y',
      price: 2199,
      discountPrice: 1399,
      discountPercentage: 36,
      sku: 'YUV-SHO-004',
      rating: 4.7,
      reviewsCount: 88,
      isNewArrival: true,
      isBestSeller: true,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: [
        { size: 'UK 8 (Kids)', stock: 8 },
        { size: 'UK 9 (Kids)', stock: 12 },
        { size: 'UK 10 (Kids)', stock: 15 },
        { size: 'UK 11 (Kids)', stock: 6 },
        { size: 'UK 12 (Kids)', stock: 5 }
      ],
      totalStock: 46,
      isSoldOut: false,
      tags: ['Light Up', 'Sneakers', 'Sporty', 'Party Shoes'],
      colors: ['Neon White', 'Space Black'],
      fabric: 'Breathable Mesh & PU Leather',
      careInstructions: 'Wipe with damp cloth'
    },
    {
      id: 'prod_005',
      title: 'Wooden Montessori Multi-Activity Learning Cube & Blocks',
      description: 'Eco-friendly natural pinewood 5-in-1 sensory development toy with bead maze, shape sorter, spinning gears, time clock, and xylophone for toddlers.',
      category: 'toys',
      subCategory: 'educational-toys',
      gender: 'unisex',
      ageGroup: '0-24M',
      price: 2499,
      discountPrice: 1599,
      discountPercentage: 36,
      sku: 'YUV-TOY-005',
      rating: 4.9,
      reviewsCount: 165,
      isNewArrival: false,
      isBestSeller: true,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: [
        { size: 'Standard Box', stock: 24 }
      ],
      totalStock: 24,
      isSoldOut: false,
      tags: ['Montessori', 'Wooden Toy', 'STEM', 'Brain Booster'],
      colors: ['Multi-color Pastel'],
      fabric: 'Solid Eco-Wood with Non-toxic Water Paint',
      careInstructions: 'Wipe clean with dry cloth'
    },
    {
      id: 'prod_006',
      title: 'Traditional Silk Jacquard Kurta-Dhoti Set with Dupatta',
      description: 'Festive traditional Indian ethnic wear for young boys. Rich woven gold zari accents, skin-friendly cotton inner lining, and pre-stitched elastic waistband dhoti.',
      category: 'clothing',
      subCategory: 'ethnic',
      gender: 'boys',
      ageGroup: '2-4Y',
      price: 2499,
      discountPrice: 1499,
      discountPercentage: 40,
      sku: 'YUV-ETH-006',
      rating: 4.8,
      reviewsCount: 110,
      isNewArrival: true,
      isBestSeller: false,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: [
        { size: '2-3Y', stock: 10 },
        { size: '3-4Y', stock: 8 },
        { size: '4-5Y', stock: 12 }
      ],
      totalStock: 30,
      isSoldOut: false,
      tags: ['Diwali', 'Ethnic Wear', 'Kurta', 'Festive'],
      colors: ['Mustard Yellow', 'Royal Maroon'],
      fabric: 'Art Silk Blend with 100% Cotton Lining',
      careInstructions: 'Dry clean only'
    },
    {
      id: 'prod_007',
      title: 'Shimmer Sequin Tulle Layered Princess Gown',
      description: 'Magical fairy-tale evening gown featuring sparkling bodice sequins, voluminous multi-tiered soft mesh tulle, and a big satin sash bow at the back.',
      category: 'clothing',
      subCategory: 'dresses',
      gender: 'girls',
      ageGroup: '4-8Y',
      price: 3299,
      discountPrice: 1999,
      discountPercentage: 39,
      sku: 'YUV-GRL-007',
      rating: 4.9,
      reviewsCount: 175,
      isNewArrival: true,
      isBestSeller: true,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: [
        { size: '4-5Y', stock: 6 },
        { size: '5-6Y', stock: 9 },
        { size: '6-7Y', stock: 7 },
        { size: '7-8Y', stock: 11 }
      ],
      totalStock: 33,
      isSoldOut: false,
      tags: ['Princess Dress', 'Birthday', 'Tulle', 'Party'],
      colors: ['Lavender Mist', 'Blush Pink', 'Champagne Gold'],
      fabric: 'Sequin & Tulle Mesh with Cotton Underlayer',
      careInstructions: 'Dry clean or gentle hand wash'
    },
    {
      id: 'prod_008',
      title: 'Glitter Ballerina Flat Shoes with Pearl Strap',
      description: 'Comfortable non-slip party bellies for girls with anti-chafing padded insole, flexible outsole, and dazzling rhinestone pearl buckle strap.',
      category: 'shoes',
      subCategory: 'party-shoes',
      gender: 'girls',
      ageGroup: '2-4Y',
      price: 1599,
      discountPrice: 999,
      discountPercentage: 38,
      sku: 'YUV-SHO-008',
      rating: 4.6,
      reviewsCount: 74,
      isNewArrival: false,
      isBestSeller: false,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: [
        { size: 'UK 6 (Kids)', stock: 5 },
        { size: 'UK 7 (Kids)', stock: 8 },
        { size: 'UK 8 (Kids)', stock: 10 },
        { size: 'UK 9 (Kids)', stock: 7 }
      ],
      totalStock: 30,
      isSoldOut: false,
      tags: ['Party Shoes', 'Ballerina', 'Glitter'],
      colors: ['Rose Gold', 'Silver Sparkle'],
      fabric: 'Glitter Vegan Leather with Rubber Sole',
      careInstructions: 'Wipe with soft clean cloth'
    },
    {
      id: 'prod_009',
      title: 'Cute Dino 3D Anti-Lost Toddler Backpack with Leash',
      description: 'Ergonomic water-resistant lightweight neoprene mini backpack with safety detachable rein strap, breathable padded back panel, and chest harness clip.',
      category: 'accessories',
      subCategory: 'bags',
      gender: 'unisex',
      ageGroup: '0-24M',
      price: 1299,
      discountPrice: 749,
      discountPercentage: 42,
      sku: 'YUV-ACC-009',
      rating: 4.8,
      reviewsCount: 92,
      isNewArrival: true,
      isBestSeller: true,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: [
        { size: 'Mini (2-4L)', stock: 18 }
      ],
      totalStock: 18,
      isSoldOut: false,
      tags: ['Backpack', 'Dinosaur', 'Travel', 'Toddler Bag'],
      colors: ['Dino Green', 'Sky Blue'],
      fabric: 'Waterproof Neoprene Fabric',
      careInstructions: 'Hand wash with mild soap'
    },
    {
      id: 'prod_010',
      title: 'Remote Control Stunt Flip Car with Smoke & Lights',
      description: '360-degree rotating high-speed all-terrain stunt crawler vehicle with cool exhaust smoke mist generator, double-sided driving, and rechargeable battery pack.',
      category: 'toys',
      subCategory: 'action-toys',
      gender: 'boys',
      ageGroup: '4-8Y',
      price: 2299,
      discountPrice: 1449,
      discountPercentage: 37,
      sku: 'YUV-TOY-010',
      rating: 4.9,
      reviewsCount: 121,
      isNewArrival: true,
      isBestSeller: true,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1532330393533-443990a51d10?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: [
        { size: 'Box with Remote', stock: 15 }
      ],
      totalStock: 15,
      isSoldOut: false,
      tags: ['RC Car', 'Stunt Toy', 'Rechargeable', 'LED Lights'],
      colors: ['Flame Red', 'Electric Blue'],
      fabric: 'Durable ABS Shockproof Body',
      careInstructions: 'Keep away from water submersion'
    },
    {
      id: 'prod_011',
      title: 'Cool Camo Print Cargo Joggers & Graphic Hoodie Set',
      description: 'Street-style cozy winter/autumn 2-piece set with fleece-lined brushed cotton fabric, ribbed cuffs, functional cargo flap pockets, and cool typography.',
      category: 'clothing',
      subCategory: 'casuals',
      gender: 'boys',
      ageGroup: '8-12Y',
      price: 2499,
      discountPrice: 1599,
      discountPercentage: 36,
      sku: 'YUV-BOY-011',
      rating: 4.7,
      reviewsCount: 65,
      isNewArrival: true,
      isBestSeller: false,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: [
        { size: '8-9Y', stock: 7 },
        { size: '9-10Y', stock: 8 },
        { size: '10-11Y', stock: 5 },
        { size: '11-12Y', stock: 0 }
      ],
      totalStock: 20,
      isSoldOut: false,
      tags: ['Winter Wear', 'Hoodie', 'Cargo', 'Casual'],
      colors: ['Olive Camo', 'Charcoal Heather'],
      fabric: 'Rich French Terry Fleece Cotton',
      careInstructions: 'Machine wash with like colors'
    },
    {
      id: 'prod_012',
      title: 'Disney Frozen Inspired Elsa Wand, Tiara & Hair Braid Set',
      description: 'Magical 5-piece royal accessories kit featuring a rhinestone tiara crown, crystal magic wand, clip-on blue snowflake braid, satin gloves, and jewel ring.',
      category: 'accessories',
      subCategory: 'costume-accessories',
      gender: 'girls',
      ageGroup: '2-4Y',
      price: 999,
      discountPrice: 499,
      discountPercentage: 50,
      sku: 'YUV-ACC-012',
      rating: 4.9,
      reviewsCount: 205,
      isNewArrival: false,
      isBestSeller: true,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: [
        { size: 'One Size', stock: 35 }
      ],
      totalStock: 35,
      isSoldOut: false,
      tags: ['Princess Tiara', 'Elsa', 'Costume', 'Pretend Play'],
      colors: ['Ice Blue & Silver'],
      fabric: 'Polished Resin, Satin & Faux Crystals',
      careInstructions: 'Store in protective pouch'
    }
  ];

  products.forEach((p) => db.insert('products', p));

  // 4. Seed VIP Memberships
  db.insert('vipMemberships', {
    id: 'vip_mem_01',
    userId: 'usr_cust_01',
    userName: 'Riya Sharma',
    userEmail: 'riya@example.com',
    phone: '+91 9123456789',
    amount: 1000,
    plan: '1_YEAR_VIP',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    razorpayPaymentId: 'pay_demo_vip_982341',
    status: 'ACTIVE',
    totalSavings: 450,
    createdAt: new Date().toISOString()
  });

  // 5. Seed Sample Orders
  const sampleOrder = {
    id: 'ord_demo_01',
    orderNumber: 'YUV-2026-9042',
    userId: 'usr_cust_01',
    customerName: 'Riya Sharma',
    customerEmail: 'riya@example.com',
    customerPhone: '+91 9123456789',
    shippingAddress: {
      name: 'Riya Sharma',
      street: 'Flat 402, Sunshine Heights, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      phone: '+91 9123456789'
    },
    items: [
      {
        productId: 'prod_001',
        title: 'Pastel Floral Twirl Frock with Bow Headband',
        image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
        size: '2-3Y',
        color: 'Pastel Pink',
        quantity: 1,
        price: 1199,
        subtotal: 1199
      },
      {
        productId: 'prod_004',
        title: 'LED Light-Up Chunky High-Top Sneakers',
        image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80',
        size: 'UK 9 (Kids)',
        color: 'Neon White',
        quantity: 1,
        price: 1399,
        subtotal: 1399
      }
    ],
    subtotal: 2598,
    discount: 0,
    vipDiscount: 389.7,
    shippingFee: 0,
    tax: 0,
    totalAmount: 2208.3,
    paymentMethod: 'razorpay',
    paymentStatus: 'PAID',
    orderStatus: 'PROCESSING',
    razorpayOrderId: 'order_demo_883921',
    razorpayPaymentId: 'pay_demo_772194',
    trackingNumber: 'DELHIVERY-YUV-882190',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  };

  db.insert('orders', sampleOrder);

  // 6. Seed Payment Transaction Record
  db.insert('payments', {
    id: 'pay_tx_001',
    transactionId: 'TXN_YUV_9921',
    orderId: 'ord_demo_01',
    userId: 'usr_cust_01',
    customerName: 'Riya Sharma',
    customerEmail: 'riya@example.com',
    amount: 2208.3,
    currency: 'INR',
    method: 'Razorpay UPI / Card',
    status: 'SUCCESS',
    razorpayOrderId: 'order_demo_883921',
    razorpayPaymentId: 'pay_demo_772194',
    razorpaySignature: 'sig_demo_verified_9921',
    type: 'ORDER',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  });

  db.insert('payments', {
    id: 'pay_tx_002',
    transactionId: 'TXN_VIP_1001',
    orderId: 'vip_mem_01',
    userId: 'usr_cust_01',
    customerName: 'Riya Sharma',
    customerEmail: 'riya@example.com',
    amount: 1000,
    currency: 'INR',
    method: 'Razorpay Cards / Netbanking',
    status: 'SUCCESS',
    razorpayOrderId: 'order_vip_demo_11',
    razorpayPaymentId: 'pay_demo_vip_982341',
    razorpaySignature: 'sig_demo_vip_verified',
    type: 'VIP_MEMBERSHIP',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  });

  console.log('Database seeded successfully with Yuva Attire Kids collections!');
}

module.exports = { seedDatabase };

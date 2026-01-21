import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.orderMessage.deleteMany();
  await prisma.orderHistory.deleteMany();
  await prisma.orderNote.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.projectPost.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  
  // Clean up user-related records that might cause FK errors
  await prisma.media.deleteMany();
  await prisma.userActivity.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.pageView.deleteMany();
  await prisma.adPlacement.deleteMany();
  await prisma.advertisement.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.directMessage.deleteMany();
  
  await prisma.user.deleteMany();

  // Create Users
  console.log('👥 Creating users...');
  const adminPassword = await hash('admin123', 10);
  const userPassword = await hash('user123', 10);
  const editorPassword = await hash('editor123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@fidevoltz.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phoneNumber: '+234 801 234 5678',
      address: '123 Tech Street, Lagos, Nigeria',
      bio: 'FideVoltz Administrator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: 'editor@fidevoltz.com',
      name: 'Editor User',
      passwordHash: editorPassword,
      role: 'EDITOR',
      phoneNumber: '+234 802 345 6789',
      bio: 'Content Editor at FideVoltz',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor',
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@fidevoltz.com',
      name: 'Regular User',
      passwordHash: userPassword,
      role: 'USER',
      phoneNumber: '+234 803 456 7890',
      address: '789 User Street, Lagos, Nigeria',
      bio: 'Regular FideVoltz User',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      passwordHash: userPassword,
      role: 'USER',
      phoneNumber: '+234 804 567 8901',
      address: '456 Maker Lane, Abuja, Nigeria',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      passwordHash: userPassword,
      role: 'USER',
      phoneNumber: '+234 805 678 9012',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    },
  });

  console.log(`✅ Created 5 users`);
  console.log('   Admin: admin@fidevoltz.com / admin123');
  console.log('   Editor: editor@fidevoltz.com / editor123');
  console.log('   User: user@fidevoltz.com / user123');
  console.log('   User: john@example.com / user123');
  console.log('   User: jane@example.com / user123');


  // Create Categories
  console.log('📁 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Development Boards' } }),
    prisma.category.create({ data: { name: 'Sensors' } }),
    prisma.category.create({ data: { name: 'Robotics' } }),
    prisma.category.create({ data: { name: 'Tools' } }),
    prisma.category.create({ data: { name: 'Accessories' } }),
    prisma.category.create({ data: { name: 'Kits' } }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create Products (20 products)
  console.log('📦 Creating products...');
  const products = await Promise.all([
    // Development Boards
    prisma.product.create({
      data: {
        name: 'Arduino Uno R3',
        description: 'The classic Arduino board with ATmega328P microcontroller. Perfect for beginners and prototyping.',
        price: 24.99,
        stock: 50,
        minStock: 10,
        sku: 'ARD-UNO-R3',
        categoryId: categories[0].id,
        image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'ESP32 DevKit V1',
        description: 'Powerful WiFi and Bluetooth enabled microcontroller with dual-core processor.',
        price: 8.50,
        stock: 100,
        minStock: 20,
        sku: 'ESP32-DEVKIT',
        categoryId: categories[0].id,
        image: 'https://images.unsplash.com/photo-1608538776654-2e45f9583347?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Raspberry Pi 4 Model B (4GB)',
        description: 'Complete single-board computer with 4GB RAM, perfect for IoT and embedded projects.',
        price: 55.00,
        stock: 30,
        minStock: 5,
        sku: 'RPI4-4GB',
        categoryId: categories[0].id,
        image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Arduino Nano',
        description: 'Compact Arduino board perfect for breadboard projects and space-constrained applications.',
        price: 12.99,
        stock: 75,
        minStock: 15,
        sku: 'ARD-NANO',
        categoryId: categories[0].id,
        image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400',
      },
    }),

    // Sensors
    prisma.product.create({
      data: {
        name: 'DHT22 Temperature & Humidity Sensor',
        description: 'High-precision digital temperature and humidity sensor with calibrated output.',
        price: 5.99,
        stock: 120,
        minStock: 25,
        sku: 'DHT22-SENSOR',
        categoryId: categories[1].id,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'HC-SR04 Ultrasonic Sensor',
        description: 'Ultrasonic distance sensor with 2cm to 400cm range. Great for robotics projects.',
        price: 3.50,
        stock: 150,
        minStock: 30,
        sku: 'HCSR04',
        categoryId: categories[1].id,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'PIR Motion Sensor',
        description: 'Passive infrared sensor for motion detection. Perfect for security and automation.',
        price: 4.25,
        stock: 90,
        minStock: 20,
        sku: 'PIR-SENSOR',
        categoryId: categories[1].id,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'MQ-2 Gas Sensor',
        description: 'Detects LPG, propane, methane, and smoke. Essential for safety projects.',
        price: 6.50,
        stock: 60,
        minStock: 15,
        sku: 'MQ2-GAS',
        categoryId: categories[1].id,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      },
    }),

    // Robotics
    prisma.product.create({
      data: {
        name: 'SG90 Micro Servo Motor',
        description: 'Compact servo motor with 180-degree rotation. Perfect for robot arms and mechanisms.',
        price: 2.99,
        stock: 200,
        minStock: 40,
        sku: 'SG90-SERVO',
        categoryId: categories[2].id,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'L298N Motor Driver Module',
        description: 'Dual H-Bridge motor driver for controlling DC motors and stepper motors.',
        price: 7.99,
        stock: 80,
        minStock: 15,
        sku: 'L298N-DRIVER',
        categoryId: categories[2].id,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Robot Car Chassis Kit',
        description: '4WD robot car chassis with motors, wheels, and mounting plate.',
        price: 18.50,
        stock: 40,
        minStock: 8,
        sku: 'ROBOT-CHASSIS',
        categoryId: categories[2].id,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      },
    }),

    // Tools
    prisma.product.create({
      data: {
        name: 'Soldering Iron Kit',
        description: 'Complete soldering kit with adjustable temperature iron, stand, and accessories.',
        price: 24.99,
        stock: 45,
        minStock: 10,
        sku: 'SOLDER-KIT',
        categoryId: categories[3].id,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Digital Multimeter',
        description: 'Professional digital multimeter for voltage, current, and resistance measurements.',
        price: 15.99,
        stock: 35,
        minStock: 8,
        sku: 'MULTIMETER',
        categoryId: categories[3].id,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      },
    }),

    // Accessories
    prisma.product.create({
      data: {
        name: 'Breadboard 830 Points',
        description: 'Solderless breadboard with 830 tie points. Essential for prototyping.',
        price: 3.50,
        stock: 150,
        minStock: 30,
        sku: 'BREADBOARD-830',
        categoryId: categories[4].id,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Jumper Wires Set (120pcs)',
        description: 'Assorted male-to-male, male-to-female, and female-to-female jumper wires.',
        price: 4.99,
        stock: 180,
        minStock: 35,
        sku: 'JUMPER-120',
        categoryId: categories[4].id,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Resistor Kit (600pcs)',
        description: 'Complete resistor assortment from 10Ω to 1MΩ in organized storage box.',
        price: 8.99,
        stock: 70,
        minStock: 15,
        sku: 'RESISTOR-600',
        categoryId: categories[4].id,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      },
    }),

    // Kits
    prisma.product.create({
      data: {
        name: 'Arduino Starter Kit',
        description: 'Complete beginner kit with Arduino Uno, sensors, LEDs, and project book.',
        price: 49.99,
        stock: 25,
        minStock: 5,
        sku: 'ARD-STARTER',
        categoryId: categories[5].id,
        image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'IoT Smart Home Kit',
        description: 'ESP32-based smart home kit with sensors, relays, and cloud connectivity.',
        price: 65.00,
        stock: 20,
        minStock: 4,
        sku: 'IOT-HOME-KIT',
        categoryId: categories[5].id,
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Robotics Learning Kit',
        description: 'Educational robotics kit with motors, sensors, and programming guide.',
        price: 89.99,
        stock: 15,
        minStock: 3,
        sku: 'ROBOT-LEARN',
        categoryId: categories[5].id,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create Carts for users
  console.log('🛒 Creating carts...');
  const cart1 = await prisma.cart.create({
    data: {
      userId: user1.id,
      items: {
        create: [
          { productId: products[0].id, quantity: 1 }, // Arduino Uno
          { productId: products[4].id, quantity: 2 }, // DHT22
        ],
      },
    },
  });

  const cart2 = await prisma.cart.create({
    data: {
      userId: user2.id,
      items: {
        create: [
          { productId: products[16].id, quantity: 1 }, // Arduino Starter Kit
        ],
      },
    },
  });

  console.log(`✅ Created 2 carts with items`);

  // Create Project Posts
  console.log('📝 Creating project posts...');
  const projects = await Promise.all([
    prisma.projectPost.create({
      data: {
        title: 'Building a Smart Home Temperature Monitor with ESP32',
        slug: 'smart-home-temperature-monitor-esp32',
        content: `<h2>Introduction</h2><p>Learn how to build a WiFi-enabled temperature and humidity monitoring system using ESP32 and DHT22 sensor.</p><h3>Components Needed</h3><ul><li>ESP32 DevKit</li><li>DHT22 Temperature Sensor</li><li>Breadboard and Jumper Wires</li><li>USB Cable</li></ul><h3>Circuit Diagram</h3><p>Connect the DHT22 sensor to the ESP32: VCC to 3.3V, GND to GND, DATA to GPIO4</p><h3>Code</h3><pre><code>#include &lt;DHT.h&gt;\n#include &lt;WiFi.h&gt;\n\n#define DHTPIN 4\n#define DHTTYPE DHT22\n\nDHT dht(DHTPIN, DHTTYPE);\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n}\n\nvoid loop() {\n  float temp = dht.readTemperature();\n  float humidity = dht.readHumidity();\n  \n  Serial.print("Temperature: ");\n  Serial.print(temp);\n  Serial.print("°C, Humidity: ");\n  Serial.print(humidity);\n  Serial.println("%");\n  \n  delay(2000);\n}</code></pre><h3>Conclusion</h3><p>You now have a working temperature monitoring system!</p>`,
        category: 'IoT',
        status: 'PUBLISHED',
        authorId: admin.id,
      },
    }),
    prisma.projectPost.create({
      data: {
        title: 'Arduino-Based Line Following Robot',
        slug: 'arduino-line-following-robot',
        content: `<h2>Build Your Own Line Following Robot</h2><h3>Overview</h3><p>Create an autonomous robot that can follow a black line on a white surface using Arduino and IR sensors.</p><h3>Required Components</h3><ul><li>Arduino Uno</li><li>L298N Motor Driver</li><li>2x DC Motors</li><li>2x IR Sensors</li><li>Robot Chassis</li><li>Battery Pack</li></ul><h3>How It Works</h3><p>The IR sensors detect the line and send signals to Arduino, which controls the motors to keep the robot on track.</p>`,
        category: 'Robotics',
        status: 'PUBLISHED',
        authorId: admin.id,
      },
    }),
    prisma.projectPost.create({
      data: {
        title: 'IoT Weather Station with Cloud Logging',
        slug: 'iot-weather-station-cloud-logging',
        content: `<h2>Complete IoT Weather Station</h2><p>Build a comprehensive weather station that logs data to the cloud using ESP32.</p><h3>Sensors Used</h3><ul><li>DHT22 (Temperature & Humidity)</li><li>BMP180 (Pressure)</li><li>Rain Sensor</li><li>Light Sensor (LDR)</li></ul><h3>Cloud Integration</h3><p>We'll use ThingSpeak for data logging and visualization.</p>`,
        category: 'IoT',
        status: 'PUBLISHED',
        authorId: admin.id,
      },
    }),
    prisma.projectPost.create({
      data: {
        title: 'Home Automation with Voice Control',
        slug: 'home-automation-voice-control',
        content: `<h2>Voice-Controlled Home Automation</h2><p>Control your home appliances using voice commands with Google Assistant and ESP32.</p><h3>What You'll Learn</h3><ul><li>IoT protocols</li><li>Cloud integration</li><li>Voice recognition</li><li>Relay control</li></ul>`,
        category: 'Automation',
        status: 'PUBLISHED',
        authorId: admin.id,
      },
    }),
    prisma.projectPost.create({
      data: {
        title: 'Raspberry Pi Security Camera with Motion Detection',
        slug: 'raspberry-pi-security-camera',
        content: `<h2>DIY Security Camera System</h2><p>Build a smart security camera using Raspberry Pi and Python.</p><h3>Hardware</h3><ul><li>Raspberry Pi 4</li><li>Pi Camera Module</li><li>PIR Motion Sensor</li><li>SD Card (32GB+)</li></ul>`,
        category: 'Security',
        status: 'PUBLISHED',
        authorId: admin.id,
      },
    }),
    prisma.projectPost.create({
      data: {
        title: 'Getting Started with Arduino Programming',
        slug: 'getting-started-arduino-programming',
        content: `<h2>Arduino Programming for Beginners</h2><p>Learn the basics of Arduino programming with practical examples.</p><h3>Topics Covered</h3><ul><li>Setup and loop functions</li><li>Digital I/O</li><li>Analog reading</li><li>Serial communication</li><li>Libraries</li></ul>`,
        category: 'Programming',
        status: 'PUBLISHED',
        authorId: admin.id,
      },
    }),
  ]);

  console.log(`✅ Created ${projects.length} project posts`);

  // Create Comments
  console.log('💬 Creating comments...');
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Great tutorial! Very clear instructions.',
        postId: projects[0].id,
        userId: user1.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'This helped me complete my school project. Thank you!',
        postId: projects[0].id,
        userId: user2.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Can you add more details about the WiFi setup?',
        postId: projects[0].id,
        userId: user1.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Awesome robot project! My kids loved building this.',
        postId: projects[1].id,
        userId: user2.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'The code works perfectly. Thanks for sharing!',
        postId: projects[2].id,
        userId: user1.id,
        status: 'APPROVED',
      },
    }),
  ]);

  console.log(`✅ Created ${comments.length} comments`);

  // Orders will be created later with comprehensive data including messages and history

  // Create Notifications
  console.log('🔔 Creating notifications...');
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: user1.id,
        type: 'SYSTEM',
        title: 'Welcome to FideVoltz!',
        message: 'Welcome to FideVoltz! Start exploring our products.',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: user2.id,
        type: 'PRODUCT',
        title: 'Check out our latest products',
        message: 'Check out our latest Arduino and ESP32 boards!',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: user1.id,
        type: 'COMMENT',
        title: 'New comment reply',
        message: 'Someone replied to your comment on "Smart Home Temperature Monitor"',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'ORDER',
        title: 'New order received',
        message: 'New order received from John Doe',
        isRead: false,
      },
    }),
  ]);

  console.log(`✅ Created ${notifications.length} notifications`);

  // Create Support Tickets
  console.log('🎫 Creating support tickets...');
  const tickets = await Promise.all([
    prisma.supportTicket.create({
      data: {
        userId: user1.id,
        userEmail: user1.email,
        subject: 'Question about ESP32 programming',
        description: 'I\'m having trouble connecting my ESP32 to WiFi. Can you help?',
        status: 'OPEN',
      },
    }),
    prisma.supportTicket.create({
      data: {
        userId: user2.id,
        userEmail: user2.email,
        subject: 'Order delivery delay',
        description: 'My order was supposed to arrive yesterday but hasn\'t arrived yet.',
        status: 'OPEN',
      },
    }),
    prisma.supportTicket.create({
      data: {
        userId: user1.id,
        userEmail: user1.email,
        subject: 'Product recommendation needed',
        description: 'Which Arduino board is best for robotics projects?',
        status: 'RESOLVED',
      },
    }),
  ]);

  console.log('✅ Created support tickets');

  // Create comprehensive test orders with various statuses
  console.log('📦 Creating test orders with messages and history...');
  
  // Order 1: Completed order for regular user
  const order1 = await prisma.order.create({
    data: {
      userId: regularUser.id,
      totalAmount: 89.97,
      paymentGateway: 'paystack',
      paymentStatus: 'paid',
      status: 'COMPLETED',
      shippingAddress: '789 User Street, Lagos, Nigeria',
      trackingNumber: 'TRK123456789',
      carrier: 'DHL',
      estimatedDelivery: new Date('2025-01-20'),
      actualDelivery: new Date('2025-01-18'),
      items: {
        create: [
          { productId: products[0].id, quantity: 2, price: 29.99 },
          { productId: products[1].id, quantity: 1, price: 29.99 },
        ],
      },
      history: {
        create: [
          {
            status: 'PENDING',
            changedBy: regularUser.id,
            note: 'Order placed',
            createdAt: new Date('2025-01-10'),
          },
          {
            status: 'PROCESSING',
            changedBy: admin.id,
            note: 'Payment confirmed, preparing shipment',
            createdAt: new Date('2025-01-11'),
          },
          {
            status: 'SHIPPED',
            changedBy: admin.id,
            note: 'Package shipped via DHL',
            createdAt: new Date('2025-01-12'),
          },
          {
            status: 'IN_TRANSIT',
            changedBy: admin.id,
            createdAt: new Date('2025-01-14'),
          },
          {
            status: 'DELIVERED',
            changedBy: admin.id,
            note: 'Delivered successfully',
            createdAt: new Date('2025-01-18'),
          },
          {
            status: 'COMPLETED',
            changedBy: admin.id,
            createdAt: new Date('2025-01-19'),
          },
        ],
      },
      messages: {
        create: [
          {
            senderId: regularUser.id,
            message: 'When will my order be shipped?',
            createdAt: new Date('2025-01-11T10:00:00'),
          },
          {
            senderId: admin.id,
            message: 'Your order will be shipped today! Tracking number: TRK123456789',
            createdAt: new Date('2025-01-11T14:30:00'),
          },
          {
            senderId: regularUser.id,
            message: 'Thank you! Looking forward to receiving it.',
            createdAt: new Date('2025-01-11T15:00:00'),
          },
        ],
      },
    },
  });

  // Order 2: In transit order for user1
  const order2 = await prisma.order.create({
    data: {
      userId: user1.id,
      totalAmount: 124.95,
      paymentGateway: 'stripe',
      paymentStatus: 'paid',
      status: 'IN_TRANSIT',
      shippingAddress: '456 Maker Lane, Abuja, Nigeria',
      trackingNumber: 'TRK987654321',
      carrier: 'FedEx',
      estimatedDelivery: new Date('2025-01-25'),
      items: {
        create: [
          { productId: products[2].id, quantity: 3, price: 24.99 },
          { productId: products[3].id, quantity: 2, price: 24.99 },
        ],
      },
      history: {
        create: [
          {
            status: 'PENDING',
            changedBy: user1.id,
            createdAt: new Date('2025-01-15'),
          },
          {
            status: 'PROCESSING',
            changedBy: admin.id,
            note: 'Order confirmed',
            createdAt: new Date('2025-01-16'),
          },
          {
            status: 'SHIPPED',
            changedBy: admin.id,
            note: 'Shipped via FedEx',
            createdAt: new Date('2025-01-17'),
          },
          {
            status: 'IN_TRANSIT',
            changedBy: admin.id,
            createdAt: new Date('2025-01-19'),
          },
        ],
      },
      messages: {
        create: [
          {
            senderId: admin.id,
            message: 'Your order has been shipped! You can track it with: TRK987654321',
            createdAt: new Date('2025-01-17T09:00:00'),
          },
        ],
      },
    },
  });

  // Order 3: Processing order for user2
  const order3 = await prisma.order.create({
    data: {
      userId: user2.id,
      totalAmount: 67.48,
      paymentGateway: 'paystack',
      paymentStatus: 'paid',
      status: 'PROCESSING',
      shippingAddress: '321 Tech Avenue, Port Harcourt, Nigeria',
      items: {
        create: [
          { productId: products[4].id, quantity: 1, price: 34.99 },
          { productId: products[5].id, quantity: 2, price: 16.24 },
        ],
      },
      history: {
        create: [
          {
            status: 'PENDING',
            changedBy: user2.id,
            createdAt: new Date('2025-01-20'),
          },
          {
            status: 'PROCESSING',
            changedBy: admin.id,
            note: 'Payment verified, preparing items',
            createdAt: new Date('2025-01-21'),
          },
        ],
      },
      messages: {
        create: [
          {
            senderId: user2.id,
            message: 'Can I change my shipping address?',
            createdAt: new Date('2025-01-21T11:00:00'),
            isRead: true,
          },
          {
            senderId: admin.id,
            message: 'Yes, please provide the new address and we will update it.',
            createdAt: new Date('2025-01-21T11:30:00'),
            isRead: true,
          },
        ],
      },
    },
  });

  // Order 4: Pending order for regular user
  const order4 = await prisma.order.create({
    data: {
      userId: regularUser.id,
      totalAmount: 45.99,
      paymentGateway: 'opay',
      paymentStatus: 'pending',
      status: 'PENDING',
      shippingAddress: '789 User Street, Lagos, Nigeria',
      items: {
        create: [
          { productId: products[6].id, quantity: 1, price: 45.99 },
        ],
      },
      history: {
        create: [
          {
            status: 'PENDING',
            changedBy: regularUser.id,
            note: 'Awaiting payment confirmation',
            createdAt: new Date('2025-01-22'),
          },
        ],
      },
    },
  });

  // Order 5: Shipped order for user1
  const order5 = await prisma.order.create({
    data: {
      userId: user1.id,
      totalAmount: 156.45,
      paymentGateway: 'stripe',
      paymentStatus: 'paid',
      status: 'SHIPPED',
      shippingAddress: '456 Maker Lane, Abuja, Nigeria',
      trackingNumber: 'TRK555666777',
      carrier: 'UPS',
      estimatedDelivery: new Date('2025-01-28'),
      items: {
        create: [
          { productId: products[7].id, quantity: 2, price: 39.99 },
          { productId: products[8].id, quantity: 3, price: 25.49 },
        ],
      },
      history: {
        create: [
          {
            status: 'PENDING',
            changedBy: user1.id,
            createdAt: new Date('2025-01-18'),
          },
          {
            status: 'PROCESSING',
            changedBy: admin.id,
            createdAt: new Date('2025-01-19'),
          },
          {
            status: 'SHIPPED',
            changedBy: admin.id,
            note: 'Express shipping via UPS',
            createdAt: new Date('2025-01-22'),
          },
        ],
      },
      messages: {
        create: [
          {
            senderId: user1.id,
            message: 'Please use express shipping if possible.',
            createdAt: new Date('2025-01-19T08:00:00'),
            isRead: true,
          },
          {
            senderId: admin.id,
            message: 'Sure! We have upgraded your shipping to UPS Express at no extra cost.',
            createdAt: new Date('2025-01-19T10:00:00'),
            isRead: true,
          },
        ],
      },
    },
  });

  console.log('✅ Created 5 test orders with various statuses');
  console.log('   - 1 COMPLETED order with full history');
  console.log('   - 1 IN_TRANSIT order');
  console.log('   - 1 PROCESSING order');
  console.log('   - 1 PENDING order');
  console.log('   - 1 SHIPPED order');

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Carts: 2 with items`);
  console.log(`   - Orders: 3 with multiple items`);
  console.log(`   - Notifications: ${notifications.length}`);
  console.log(`   - Support Tickets: ${tickets.length}`);
  console.log('\n🔑 Test Credentials:');
  console.log('   Admin: admin@fidevoltz.com / admin123');
  console.log('   Editor: editor@fidevoltz.com / user123');
  console.log('   User: john@example.com / user123');
  console.log('   User: jane@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

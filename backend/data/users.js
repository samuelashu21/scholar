import bcrypt from "bcryptjs";

const users = [
  // ================= ADMIN =================
  { 
    FirstName: "Admin", 
    LastName: "User",
    email: "admin@gmail.com",
    password: bcrypt.hashSync("Abegaz$%", 10),
    phone: "+251911000001",
    role: "admin",

    verified: true,
    accountStatus: "active",

    profileImage: "/images/admin.png",

    loginCount: 25,

    isOnline: true,
    lastLogin: new Date(),
    lastSeen: new Date(),

    address: {
      kebele: "14",
      city: "Addis Ababa",
      state: "Addis Ababa",
      postalCode: "1000",
      country: "Ethiopia",
    },
  },

  // ================= SELLER =================
  {
    FirstName: "Seller",
    LastName: "User",
    email: "seller@gmail.com",
    password: bcrypt.hashSync("Abegaz$%", 10),
    phone: "+251911000002",
    role: "seller",
 
    verified: true,
    accountStatus: "active",

    profileImage: "/images/seller.png",

    loginCount: 12,

    sellerProfile: {
      storeName: "Tech Store Ethiopia",
      storeDescription:
        "Best electronics and gadgets store in Ethiopia",
      storeLogo: "/images/store-logo.png",
      rating: 4.8,
      totalSales: 320,
    },

    sellerRequest: {
      isRequested: true,
      status: "approved",
      requestedAt: new Date(),
      approvedAt: new Date(),

      subscriptionType: "paid_1_year",
      subscriptionLevel: 3,

      subscriptionStart: new Date(),

      subscriptionEnd: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ),

      boostActive: true,
    },

    isOnline: false,
    lastLogin: new Date(),
    lastSeen: new Date(),

    address: {
      kebele: "05",
      city: "Bahir Dar",
      state: "Amhara",
      postalCode: "6000",
      country: "Ethiopia",
    },
  },

  // ================= CUSTOMER =================
  {
    FirstName: "Customer",
    LastName: "Customer",
    email: "customer@gmail.com",
    password: bcrypt.hashSync("Abegaz$%", 10),
    phone: "+251911000003",
    role: "customer",

    verified: true,
    accountStatus: "active",

    profileImage: "/images/customer.png",

    loginCount: 5,

    isOnline: true,
    lastLogin: new Date(),
    lastSeen: new Date(),

    wishlist: [],

    address: {
      kebele: "09",
      city: "Gondar",
      state: "Amhara",
      postalCode: "7000",
      country: "Ethiopia",
    },
  },

  // ================= SECOND CUSTOMER =================
  {
    FirstName: "Liya",
    LastName: "Bekele",
    email: "liya@gmail.com",
    password: bcrypt.hashSync("Abegaz$%", 10),
    phone: "+251911000004",
    role: "customer",

    verified: false,
    accountStatus: "active",

    profileImage: "/images/default-profile.png",

    loginCount: 2,

    isOnline: false,
    lastSeen: new Date(),

    wishlist: [],

    address: {
      kebele: "03",
      city: "Hawassa",
      state: "Sidama",
      postalCode: "8000",
      country: "Ethiopia",
    },
  },
];

export default users; 
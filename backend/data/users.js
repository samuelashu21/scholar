import bcrypt from "bcryptjs";

const users = [
  {
    FirstName: "Admin",
    LastName: "User",
    email: "admin@gmail.com",
    password: bcrypt.hashSync("Abegaz$%", 10),
    phone: "+251911000001",
    role: "admin",
    verified: true,
    accountStatus: "active",
  },
  {
    FirstName: "Seller",
    LastName: "User",
    email: "seller@gmail.com",
    password: bcrypt.hashSync("Abegaz$%", 10),
    phone: "+251911000002",
    role: "seller",
    verified: true,
    accountStatus: "active",
  },
  {
    FirstName: "Samuel",
    LastName: "Customer",
    email: "customer@gmail.com",
    password: bcrypt.hashSync("Abegaz$%", 10),
    phone: "+251911000003",
    role: "customer",
    verified: true,
    accountStatus: "active",
  },
];

export default users;
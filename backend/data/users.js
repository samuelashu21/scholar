import bcrypt from "bcryptjs";

const users = [
  {
    name: "Admin",
    email: "admin@gmail.com", 
    password: bcrypt.hashSync("Abegaz$%", 10),
    isAdmin: true,
    isSeller: false,
  },
  {
    name: "Seller", 
    email: "seller@gmail.com",
    password: bcrypt.hashSync("Abegaz$%", 10),
    isAdmin: false,
    isSeller: true,
  },
   {
    name: "samuelcustomer", 
    email: "customer@gmail.com",
    password: bcrypt.hashSync("Abegaz$%", 10),
    isAdmin: false,
    isSeller: false,
  },
]; 

export default users;

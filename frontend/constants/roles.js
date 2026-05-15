export const ROLES = Object.freeze({
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
});

export const getUserRole = (user) => {
  if (!user) return ROLES.CUSTOMER;
  if (user.role && Object.values(ROLES).includes(user.role)) return user.role;
  if (user.isAdmin) return ROLES.ADMIN;
  if (user.isSeller) return ROLES.SELLER;
  return ROLES.CUSTOMER;
};

export const isAdminUser = (user) => getUserRole(user) === ROLES.ADMIN;
export const isSellerUser = (user) => getUserRole(user) === ROLES.SELLER;
export const isCustomerUser = (user) => getUserRole(user) === ROLES.CUSTOMER;

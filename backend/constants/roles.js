export const ROLES = Object.freeze({
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
});

export const normalizeRole = (role) => {
  if (role === "user") return ROLES.CUSTOMER;
  if (Object.values(ROLES).includes(role)) return role;
  return ROLES.CUSTOMER;
};  

export const resolveUserRole = (user) => {
  if (!user) return ROLES.CUSTOMER;
  return normalizeRole(user.role);
};

export const isAdminRole = (user) => resolveUserRole(user) === ROLES.ADMIN;
export const isSellerRole = (user) => resolveUserRole(user) === ROLES.SELLER;
export const isSellerOrAdminRole = (user) =>
  isSellerRole(user) || isAdminRole(user); 
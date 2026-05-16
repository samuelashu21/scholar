export const ROLES = Object.freeze({
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
});

export const normalizeRole = (role) => {
  if (typeof role !== "string") return ROLES.CUSTOMER;
  if (role === "user") return ROLES.CUSTOMER;
  if (Object.values(ROLES).includes(role)) return role;
  return ROLES.CUSTOMER;
};

export const getUserRole = (user) => {
  if (!user) return ROLES.CUSTOMER;
  if (!Object.prototype.hasOwnProperty.call(user, "role")) {
    return ROLES.CUSTOMER;
  }
  return normalizeRole(user.role);
};

export const isAdminUser = (user) => getUserRole(user) === ROLES.ADMIN;
export const isSellerUser = (user) => getUserRole(user) === ROLES.SELLER;
export const isSellerOrAdminUser = (user) =>
  isSellerUser(user) || isAdminUser(user);

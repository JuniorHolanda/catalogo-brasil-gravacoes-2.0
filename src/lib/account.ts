export type AccountOrderStatus = "awaiting" | "producing" | "problem";

export type AccountOrder = {
  number: string;
  status: AccountOrderStatus;
};

export type AccountUser = {
  name: string;
  companyName?: string;
  email?: string;
  profileImageUrl?: string;
  recentOrders: AccountOrder[];
};

export type AccountOrderStatus = "awaiting" | "approved" | "rejected" | "producing" | "problem" | "completed" | "cancelled";

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

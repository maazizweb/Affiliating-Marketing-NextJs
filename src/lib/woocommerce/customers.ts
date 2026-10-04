import "server-only";
import type { WCCustomer } from "@/types/woocommerce";
import { wooRequest } from "./client";

export async function getCustomer(id: number): Promise<WCCustomer> {
  const { data } = await wooRequest<WCCustomer>(`/customers/${id}`);
  return data;
}

export async function createCustomer(input: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<WCCustomer> {
  const { data } = await wooRequest<WCCustomer>("/customers", { method: "POST", body: input });
  return data;
}

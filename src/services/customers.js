// services/customers.js
import { supabase } from "../supabaseClient";

export async function getCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("join_date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addCustomer(customer) {
  const { data, error } = await supabase
    .from("customers")
    .insert([customer])
    .select();

  if (error) throw error;
  return data[0];
}

export async function updateCustomer(id, updates) {
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
}

export async function deleteCustomer(id) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}

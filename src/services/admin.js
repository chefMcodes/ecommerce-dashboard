import { supabase } from "../supabaseClient";

// Get admin by id
export async function getAdminById(id) {
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Update admin profile
export async function updateAdmin(id, updates) {
  const { data, error } = await supabase
    .from("admins")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

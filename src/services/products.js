import { supabase } from "../supabaseClient";

// ✅ Upload image to Supabase Storage
async function uploadImage(file) {
  if (!file) return null;

  try {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("products") // bucket name
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error.message);
      throw new Error("Image upload failed");
    }

    // Get public URL
    const { data } = supabase.storage.from("products").getPublicUrl(fileName);

    return data.publicUrl;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// ✅ Fetch all products
export async function getProducts() {
  const { data, error } = await supabase.from("products").select("*");
  if (error) throw error;
  return data;
}

// ✅ Add new product with image upload
export async function addProduct(product) {
  let imageUrl = null;

  if (product.image instanceof File) {
    imageUrl = await uploadImage(product.image);
  } else {
    imageUrl = product.image || null;
  }

  const { data, error } = await supabase
    .from("products")
    .insert([{ ...product, image: imageUrl }])
    .select();

  if (error) throw error;
  return data[0];
}

// ✅ Update product
export async function updateProduct(product) {
  let imageUrl = null;

  if (product.image instanceof File) {
    imageUrl = await uploadImage(product.image);
  } else {
    imageUrl = product.image || null;
  }

  const { data, error } = await supabase
    .from("products")
    .update({ ...product, image: imageUrl })
    .eq("id", product.id)
    .select();

  if (error) throw error;
  return data[0];
}

// ✅ Delete product
export async function deleteProduct(id) {
  const { data: orders, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("product_id", id);

  if (orderError) throw orderError;

  if (orders.length > 0) {
    throw new Error(
      "Cannot delete product: There are existing orders for this product."
    );
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

import { supabase } from "../supabaseClient";

// Fetch all orders with customer details
export async function getOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, product_name, quantity, total_price, status, created_at, customer_name, customer_email"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Get orders by customer
export async function getOrdersByCustomer(customerId) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, product_name, quantity, total_price, status, created_at, customer_name, customer_email"
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Get single order by ID
export async function getOrderById(id) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, product_name, quantity, total_price, status, created_at, customer_id"
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Create a new order
export async function createOrder(order) {
  let productPrice = order.product_price; // pass this from UI when adding order

  // fallback: if productPrice not passed, fetch it from products table
  if (!productPrice && order.product_id) {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("price")
      .eq("id", order.product_id)
      .single();

    if (productError) throw productError;
    productPrice = product.price;
  }

  const totalPrice = productPrice * order.quantity;

  const { data, error } = await supabase
    .from("orders")
    .insert([
      {
        customer_id: order.customer_id,
        product_id: order.product_id,
        product_name: order.product_name, // ✅ matches your schema
        quantity: order.quantity,
        total_price: totalPrice,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        status: order.status || "pending", // ✅ default status if not provided
        created_at: new Date().toISOString(), // ✅ required since no default
      },
    ])
    .select(
      "id, product_name, quantity, total_price, status, created_at, customer_id, customer_email, customer_name"
    );

  if (error) throw error;
  return data[0];
}

// Add an order (with customer details included)
export async function addOrder(order) {
  const { data, error } = await supabase
    .from("orders")
    .insert([order])
    .select(
      "id, product_name, quantity, total_price, status, created_at, customers_name, customer_email)"
    )
    .single();

  if (error) throw error;
  return data;
}

// Update order status
export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete order
export async function deleteOrder(id) {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const munshiApi = {
  async lookupStudent(query) {
    const res = await fetch(`${API_BASE}/munshi/student/lookup?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Student lookup failed');
    return data.data;
  },

  async getMenu() {
    const res = await fetch(`${API_BASE}/munshi/menu/current`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch menu');
    return data.data;
  },

  async addMealItem(payload) {
    const res = await fetch(`${API_BASE}/munshi/menu/item`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add meal');
    return data.data;
  },


  async deleteMealItem(mealType, itemId) {
    // Using POST instead of DELETE to avoid potential method blocking/handling issues
    const res = await fetch(`${API_BASE}/munshi/menu/delete-item/${mealType}/${itemId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.message || "Failed to delete meal item");
      return data;
    } catch (e) {
      console.error("Delete API Error:", text);
      throw new Error(`Server returned error: ${text.substring(0, 100)}...`);
    }
  },

  async updateMealItem(mealType, itemId, updates) {
    const res = await fetch(`${API_BASE}/munshi/menu/item/${mealType}/${itemId}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.message || "Failed to update meal item");
      return data;
    } catch (e) {
      console.error("Update API Error:", text);
      throw new Error(`Server returned error: ${text.substring(0, 100)}...`);
    }
  },

  async createOrder(studentId, items, mealType) {
    const res = await fetch(`${API_BASE}/munshi/order`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        studentId,
        items: items.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
        mealType,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create order');
    return data.data;
  },

  async getOrders(params = {}) {
    const sp = new URLSearchParams(params).toString();
    const url = sp ? `${API_BASE}/munshi/orders?${sp}` : `${API_BASE}/munshi/orders`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
    return data.data;
  },

  async getMessOffRequests() {
    const res = await fetch(`${API_BASE}/munshi/mess-off-requests`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch mess-off requests');
    return data.data;
  },

  async updateMessOffStatus(requestId, status) {
    const res = await fetch(`${API_BASE}/munshi/mess-off/${requestId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update request');
    return data.data;
  },
};

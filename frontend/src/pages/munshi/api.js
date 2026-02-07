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
    const res = await fetch(`${API_BASE}/menu/current`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch menu');
    return data.data;
  },

  async addMealItem(payload) {
    const res = await fetch(`${API_BASE}/menu/item`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add meal');
    return data.data;
  },

  async createOrder(studentId, items, mealType) {
    const res = await fetch(`${API_BASE}/munshi/order`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        studentId,
        items: items.map((i) => ({ name: i.name, price: i.price })),
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

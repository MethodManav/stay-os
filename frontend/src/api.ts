const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class ApiClient {
  private organizationId: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.organizationId = localStorage.getItem('stayos_active_tenant_id');
  }

  public setOrganizationId(id: string | null) {
    this.organizationId = id;
    if (id) {
      localStorage.setItem('stayos_active_tenant_id', id);
    } else {
      localStorage.removeItem('stayos_active_tenant_id');
    }
  }

  public getOrganizationId(): string | null {
    return this.organizationId;
  }

  public clearSession() {
    this.setOrganizationId(null);
    localStorage.removeItem('stayos_v1_user');
    localStorage.removeItem('stayos_v1_onboarding_completed');
  }
  private async refreshAccessTokens(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Refresh failed');
        }

        const json = await response.json();
        return json.success;
      } catch (err) {
        this.clearSession();
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  public async request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const headers = { ...options.headers };

    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.organizationId) {
      headers['x-organization-id'] = this.organizationId;
    }

    const finalOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include'
    };

    let response = await fetch(url, finalOptions);

    // Auto-refresh on 401 Unauthorized
    if (response.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
      const refreshed = await this.refreshAccessTokens();
      if (refreshed) {
        // Retry request
        response = await fetch(url, finalOptions);
      }
    }

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || json.error?.message || `Request failed with status ${response.status}`);
    }

    return json;
  }

  // Auth Operations
  public async login(credentials: any) {
    const json = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (json.data?.user?.organizations?.length > 0) {
      this.setOrganizationId(json.data.user.organizations[0].organizationId);
    }
    return json.data;
  }

  public async registerOnboard(data: any) {
    const json = await this.request('/auth/register-onboard', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const orgId = json.data?.organization?.id || json.data?.organization?._id;
    if (orgId) {
      this.setOrganizationId(orgId);
    }
    return json.data;
  }

  public async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST'
      });
    } catch (e) {
      // Ignore logout errors
    } finally {
      this.clearSession();
    }
  }

  public async getMe() {
    return this.request('/auth/me');
  }

  // Business Profile Operations
  public async getBusinessProfile() {
    return this.request('/businesses/me');
  }

  public async updateBusinessProfile(data: any) {
    return this.request('/businesses/me', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Room Type Operations
  public async getRoomTypes() {
    return this.request('/room-types');
  }

  public async createRoomType(data: any) {
    return this.request('/room-types', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updateRoomType(id: string, data: any) {
    return this.request(`/room-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  public async deleteRoomType(id: string) {
    return this.request(`/room-types/${id}`, {
      method: 'DELETE'
    });
  }

  // Physical Room Operations
  public async getRooms() {
    return this.request('/rooms');
  }

  public async createRoom(data: any) {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updateRoom(id: string, data: any) {
    return this.request(`/rooms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  public async deleteRoom(id: string) {
    return this.request(`/rooms/${id}`, {
      method: 'DELETE'
    });
  }

  // Booking Operations
  public async getBookings() {
    return this.request('/bookings');
  }

  public async createBooking(data: any) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updateBooking(id: string, data: any) {
    return this.request(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  public async deleteBooking(id: string) {
    return this.request(`/bookings/${id}`, {
      method: 'DELETE'
    });
  }

  public async checkInBooking(id: string) {
    return this.request(`/bookings/${id}/check-in`, {
      method: 'POST'
    });
  }

  public async checkOutBooking(id: string) {
    return this.request(`/bookings/${id}/check-out`, {
      method: 'POST'
    });
  }

  public async cancelBooking(id: string) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'POST'
    });
  }

  // Guest Operations
  public async getGuests() {
    return this.request('/guests');
  }

  public async createGuest(data: any) {
    return this.request('/guests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updateGuest(id: string, data: any) {
    return this.request(`/guests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Website Template Operations
  public async getWebsiteProfile() {
    return this.request('/websites/me');
  }

  public async createWebsiteProfile(data: any) {
    return this.request('/websites', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updateWebsiteProfile(data: any) {
    return this.request('/websites/me', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // AI & Conversation Operations
  public async getConversations() {
    return this.request('/ai/conversations');
  }

  public async getConversationById(id: string) {
    return this.request(`/ai/conversations/${id}`);
  }

  public async updateConversationStatus(id: string, status: 'active' | 'resolved' | 'escalated') {
    return this.request(`/ai/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  public async addStaffMessage(conversationId: string, sender: 'guest' | 'staff' | 'ai', text: string) {
    return this.request(`/ai/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ sender, text })
    });
  }

  public async sendGuestMessage(guestName: string, guestPhone: string, text: string) {
    return this.request('/ai/message', {
      method: 'POST',
      body: JSON.stringify({ guestName, guestPhone, text })
    });
  }

  public async getKBItems() {
    return this.request('/ai/kb');
  }

  public async createKBItem(data: any) {
    return this.request('/ai/kb', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Public Hotel Operations (No authentication headers needed, calls public/business endpoints)
  public async getPublicBusiness(slug: string) {
    const url = `${API_BASE_URL}/public/businesses/${slug}`;
    const response = await fetch(url);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `Request failed with status ${response.status}`);
    }
    return json.data;
  }

  public async getPublicRooms(slug: string) {
    const url = `${API_BASE_URL}/public/businesses/${slug}/rooms`;
    const response = await fetch(url);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `Request failed with status ${response.status}`);
    }
    return json.data;
  }

  public async checkPublicAvailability(slug: string, checkIn: string, checkOut: string) {
    const url = `${API_BASE_URL}/public/businesses/${slug}/availability?checkIn=${checkIn}&checkOut=${checkOut}`;
    const response = await fetch(url);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `Request failed with status ${response.status}`);
    }
    return json.data;
  }

  public async createPublicBooking(slug: string, data: any) {
    const url = `${API_BASE_URL}/public/businesses/${slug}/bookings`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `Request failed with status ${response.status}`);
    }
    return json.data;
  }
}

export const api = new ApiClient();
export default api;

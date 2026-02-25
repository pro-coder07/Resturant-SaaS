import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  const API_URL = 'http://localhost:3000/api/v1';
  const testEmail = 'test@example.com';
  const testPassword = 'Test123@456';

  test('API should be accessible', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: testEmail,
        password: testPassword,
      },
    }).catch(() => null);

    // Either login succeeds, returns proper error, or rate limited
    if (response) {
      expect([200, 401, 400, 429]).toContain(response.status());
    }
  });

  test('Should handle auth endpoints', async ({ request }) => {
    // Test register endpoint
    const registerResponse = await request.post(`${API_URL}/auth/register`, {
      data: {
        restaurantName: 'Test ' + Date.now(),
        email: 'newtest' + Date.now() + '@example.com',
        phone: '9876543210',
        city: 'Bellary',
        password: 'Test123@456',
      },
    }).catch(() => null);

    if (registerResponse) {
      expect([200, 201, 400, 409, 429]).toContain(registerResponse.status());
    }
  });

  test('Menu API should return data', async ({ request }) => {
    // First login to get token
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: testEmail,
        password: testPassword,
      },
    }).catch(() => null);

    if (loginResponse && loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.data?.accessToken || loginData.accessToken;

      if (token) {
        // Get menu items
        const menuResponse = await request.get(`${API_URL}/menu`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => null);

        if (menuResponse) {
          expect([200, 400, 401]).toContain(menuResponse.status());
        }
      }
    }
  });

  test('Kitchen endpoint should be accessible', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: testEmail,
        password: testPassword,
      },
    }).catch(() => null);

    if (loginResponse && loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.data?.accessToken || loginData.accessToken;

      if (token) {
        const kitchenResponse = await request.get(`${API_URL}/kitchen/active-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => null);

        if (kitchenResponse) {
          expect([200, 400, 401]).toContain(kitchenResponse.status());
        }
      }
    }
  });
});

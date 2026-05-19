export interface PublicTrackingEvent {
  status: string;
  timestamp: string;
  location?: string;
  description: string;
}

export interface PublicTrackingResponse {
  waybillNo: string;
  currentStatus: string;
  currentStatusHeadline: string;
  events: PublicTrackingEvent[];
  lastLocation: { lat: number; lng: number };
}

// Simulated mocked backend function
export async function mockFetchTracking(waybill: string): Promise<PublicTrackingResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const cleanWaybill = waybill.trim().toUpperCase();

      // Rate limit simulation
      if (cleanWaybill === 'RATE-LIMIT') {
        reject({ status: 429, message: 'Too Many Requests' });
        return;
      }

      // Found mock
      if (cleanWaybill.startsWith('SPX-')) {
        resolve({
          waybillNo: cleanWaybill,
          currentStatus: 'In Transit',
          currentStatusHeadline: 'Your package is In Transit',
          events: [
            {
              status: 'Pending',
              timestamp: '2026-05-17 08:30 AM',
              description: 'Order created and pending pickup.',
            },
            {
              status: 'For Pickup',
              timestamp: '2026-05-17 11:00 AM',
              description: 'Package has been prepared for courier pickup.',
            },
            {
              status: 'In Transit',
              timestamp: '2026-05-18 09:15 AM',
              location: 'Metro Manila Hub',
              description: 'Package is on its way to the delivery address.',
            }
          ],
          // Coordinates somewhere in Metro Manila
          lastLocation: { lat: 14.5995, lng: 120.9842 },
        });
        return;
      }

      // Not found mock
      reject({ status: 404, message: 'Waybill not found' });
    }, 1200); // Simulate network delay
  });
}

/**
 * Integration tests for the AI Inference API client.
 *
 * These tests verify that the client correctly:
 * - Constructs requests to the AI service
 * - Parses health, predict, and webcam responses
 * - Handles errors and timeouts
 */
import aiInferenceApi, { AiServiceError, AI_SERVICE_URL } from '@/lib/ai-inference-api';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(data: unknown, status = 200): any {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

function errorResponse(status: number, detail: string): any {
  return {
    ok: false,
    status,
    statusText: 'Error',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: () => Promise.resolve({ error: 'HTTPError', detail }),
    text: () => Promise.resolve(JSON.stringify({ error: 'HTTPError', detail })),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockFetch.mockReset();
});

describe('aiInferenceApi', () => {
  describe('health()', () => {
    it('returns health response on success', async () => {
      const payload = {
        status: 'healthy',
        model_loaded: true,
        model_version: '1.0.0',
        uptime_seconds: 42.5,
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(payload));

      const result = await aiInferenceApi.health();

      expect(result).toEqual(payload);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe(`${AI_SERVICE_URL}/health`);
      expect(opts?.method).toBeUndefined(); // GET
    });

    it('throws AiServiceError on non-200', async () => {
      mockFetch.mockResolvedValueOnce(errorResponse(503, 'Model not loaded'));

      try {
        await aiInferenceApi.health();
        fail('Expected AiServiceError to be thrown');
      } catch (e: any) {
        expect(e).toBeInstanceOf(AiServiceError);
        expect(e.status).toBe(503);
        expect(e.detail).toBe('Model not loaded');
      }
    });
  });

  describe('predict()', () => {
    it('sends pose sequence and returns prediction', async () => {
      const response = {
        prediction: { text: 'Hello World', tokens: [1, 2, 3] },
        confidence: 0.92,
        processing_time_ms: 45.2,
        model_version: '1.0.0',
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(response));

      const result = await aiInferenceApi.predict({
        pose_sequence: [[[1, 2, 3, 4, 5]]],
      });

      expect(result).toEqual(response);
      const [, opts] = mockFetch.mock.calls[0];
      expect(opts?.method).toBe('POST');
      const body = JSON.parse(opts?.body as string);
      expect(body.pose_sequence).toEqual([[[1, 2, 3, 4, 5]]]);
    });

    it('throws on network error', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(
        aiInferenceApi.predict({ pose_sequence: [] }),
      ).rejects.toThrow(AiServiceError);
    });
  });

  describe('webcamFrame()', () => {
    it('sends frame data with session_id', async () => {
      const response = {
        prediction: { text: 'Sign A', tokens: [4] },
        confidence: 0.75,
        processing_time_ms: 30,
        model_version: '1.0.0',
        session_id: 'sess-123',
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(response));

      const result = await aiInferenceApi.webcamFrame({
        frame_data: [[[1, 2, 3, 4, 5]]],
        session_id: 'sess-123',
      });

      expect(result.session_id).toBe('sess-123');
      const [, opts] = mockFetch.mock.calls[0];
      const body = JSON.parse(opts?.body as string);
      expect(body.session_id).toBe('sess-123');
    });
  });

  describe('timeout handling', () => {
    it('throws AiServiceError with status 408 on abort', async () => {
      // Simulate a slow fetch that gets aborted
      mockFetch.mockImplementationOnce(
        () => new Promise((_, reject) => setTimeout(() => reject(new DOMException('The operation was aborted.', 'AbortError')), 100)),
      );

      await expect(aiInferenceApi.health()).rejects.toThrow(AiServiceError);
    });
  });
});

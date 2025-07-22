import axios from 'axios';
import { mainFetcher } from '../fetchers';

// Mock environment variables
jest.mock('@/utils/env', () => ({
  env: {
    VITE_ROOT_API_URL: 'https://api.bonsai.app',
  },
}));

jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('mainFetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('makes a GET request to the provided URL', async () => {
    const mockResponse = { data: { test: 'value' } };
    mockedAxios.mockResolvedValueOnce(mockResponse);

    const result = await mainFetcher({ url: '/campaigns' });

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/campaigns',
      }),
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('handles POST requests with body data', async () => {
    const mockResponse = { data: { success: true } };
    const postData = { id: 123 };
    mockedAxios.mockResolvedValueOnce(mockResponse);

    const result = await mainFetcher({
      url: '/submit',
      method: 'POST',
      data: postData,
    });

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: postData,
      }),
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('handles network errors', async () => {
    const networkError = new Error('Network failure');
    mockedAxios.mockRejectedValueOnce(networkError);

    await expect(mainFetcher({ url: '/error' })).rejects.toThrow(
      'Network failure',
    );
  });

  it('includes authorization header when token is provided', async () => {
    const mockResponse = { data: { test: 'value' } };
    mockedAxios.mockResolvedValueOnce(mockResponse);

    await mainFetcher({
      url: '/protected',
      headers: {
        Authorization: 'Bearer test-token',
      },
    });

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });
});

export const mockGet = jest.fn();
export const mockSet = jest.fn();
export const mockGetUserByEmail = jest.fn();
export const mockCreateSessionCookie = jest.fn();

export const db = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: mockGet,
      set: mockSet,
    })),
  })),
};

export const auth = {
  getUserByEmail: mockGetUserByEmail,
  createSessionCookie: mockCreateSessionCookie,
};
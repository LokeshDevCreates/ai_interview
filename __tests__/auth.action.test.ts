/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mock firebase BEFORE importing auth.action
 */
jest.mock("@/firebase/admin", () => ({
    db: {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(),
          set: jest.fn(),
        })),
      })),
    },
    auth: {
        getUserByEmail: jest.fn(),
        createSessionCookie: jest.fn(),
        verifySessionCookie: jest.fn(),
      },
  }));
  
  const mockCookieGet = jest.fn();
  const mockCookieSet = jest.fn();
  const mockCookieDelete = jest.fn();
  
  jest.mock("next/headers", () => ({
    cookies: async () => ({
      get: mockCookieGet,
      set: mockCookieSet,
      delete: mockCookieDelete,
    }),
  }));
  
  // Now import AFTER mocking
  import { signUp, signIn } from "@/lib/actions/auth.action";
  import { db, auth } from "@/firebase/admin";
  
  describe("Auth Actions", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, "error").mockImplementation(() => {});
    });
  
    describe("signUp", () => {
        it("creates user if not exists", async () => {
          const mockGet = jest.fn().mockResolvedValue({ exists: false });
          const mockSet = jest.fn().mockResolvedValue(undefined);
      
          (db.collection as jest.Mock).mockReturnValue({
            doc: jest.fn().mockReturnValue({
              get: mockGet,
              set: mockSet,
            }),
          });
      
          const result = await signUp({
            uid: "123",
            name: "Test",
            email: "test@test.com",
          } as any);
      
          expect(result.success).toBe(true);
        });
      
        it("returns error if user exists", async () => {
          const mockGet = jest.fn().mockResolvedValue({ exists: true });
      
          (db.collection as jest.Mock).mockReturnValue({
            doc: jest.fn().mockReturnValue({
              get: mockGet,
              set: jest.fn(),
            }),
          });
      
          const result = await signUp({
            uid: "123",
            name: "Test",
            email: "test@test.com",
          } as any);
      
          expect(result.success).toBe(false);
        });
      });
  
    describe("signIn", () => {
      it("signs in successfully", async () => {
        (auth.getUserByEmail as jest.Mock).mockResolvedValue({ uid: "123" });
        (auth.createSessionCookie as jest.Mock).mockResolvedValue("token");
  
        const result = await signIn({
          email: "test@test.com",
          idToken: "fake-token",
        } as any);
  
        expect(result.success).toBe(true);
      });
  
      it("returns error if user not found", async () => {
        (auth.getUserByEmail as jest.Mock).mockResolvedValue(null);
  
        const result = await signIn({
          email: "test@test.com",
          idToken: "fake-token",
        } as any);
  
        expect(result.success).toBe(false);
      });
    });
  });

  describe("getCurrentUser", () => {
    it("returns user if session is valid and user exists", async () => {
        const { auth, db } = await import("@/firebase/admin");
      
        // Mock cookie
        mockCookieGet.mockReturnValue({ value: "valid-session" });
      
        // Mock session verification
        (auth.verifySessionCookie as jest.Mock).mockResolvedValue({
          uid: "123",
        });
      
        // Mock Firestore user
        (db.collection as jest.Mock).mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              exists: true,
              id: "123",
              data: () => ({
                name: "Test User",
                email: "test@test.com",
              }),
            }),
          }),
        });
      
        const { getCurrentUser } = await import("@/lib/actions/auth.action");
      
        const result = await getCurrentUser();
      
        expect(result).not.toBeNull();
        expect(result?.id).toBe("123");
        expect(result?.name).toBe("Test User");
      });
      it("returns null if session verification fails", async () => {
        const { auth } = await import("@/firebase/admin");
      
        mockCookieGet.mockReturnValue({ value: "invalid-session" });
      
        (auth.verifySessionCookie as jest.Mock).mockRejectedValue(
          new Error("Invalid session")
        );
      
        const { getCurrentUser } = await import("@/lib/actions/auth.action");
      
        const result = await getCurrentUser();
      
        expect(result).toBeNull();
      });
      it("returns null if user does not exist in database", async () => {
        const { auth, db } = await import("@/firebase/admin");
      
        mockCookieGet.mockReturnValue({ value: "valid-session" });
      
        (auth.verifySessionCookie as jest.Mock).mockResolvedValue({
          uid: "123",
        });
      
        (db.collection as jest.Mock).mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              exists: false,
            }),
          }),
        });
      
        const { getCurrentUser } = await import("@/lib/actions/auth.action");
      
        const result = await getCurrentUser();
      
        expect(result).toBeNull();
      });  
  });
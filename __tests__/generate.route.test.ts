/* eslint-disable @typescript-eslint/no-explicit-any */
// Polyfill Next.js Response.json
global.Response = class {
  body: any;
  status: number;

  constructor(body: any, init?: { status?: number }) {
    this.body = body;
    this.status = init?.status || 200;
  }

  static json(body: any, init?: { status?: number }) {
    return new Response(JSON.stringify(body), init);
  }

  async json() {
    return JSON.parse(this.body);
  }
} as any;
jest.mock("@/firebase/admin", () => ({
  db: {
    collection: jest.fn(),
  },
}));

jest.mock("ai", () => ({
  generateText: jest.fn(),
}));

jest.mock("@ai-sdk/google", () => ({
  google: jest.fn(),
}));

jest.mock("@/lib/utils", () => ({
  getRandomInterviewCover: jest.fn(),
}));
  
  import { GET } from "@/app/api/vapi/generate/route";
  
  describe("GET /api/generate", () => {
    it("returns thank you response", async () => {
      const response = await GET();
      const data = await response.json();
  
      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: "THANK YOU!",
      });
    });
  });

  import { POST } from "@/app/api/vapi/generate/route";
  import { generateText } from "ai";
  import { db } from "@/firebase/admin";
  
  describe("POST /api/generate", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, "error").mockImplementation(() => {});
    });
  
    it("creates interview successfully", async () => {
      // Mock AI response
      (generateText as jest.Mock).mockResolvedValue({
        text: JSON.stringify(["Q1", "Q2"]),
      });
  
      // Mock Firestore
      (db.collection as jest.Mock).mockReturnValue({
        add: jest.fn().mockResolvedValue({}),
      });
  
      const mockRequest = {
        json: async () => ({
          type: "technical",
          role: "Frontend Developer",
          level: "junior",
          techstack: "React,Next.js",
          amount: 2,
          userid: "123",
        }),
      } as Request;
  
      const response = await POST(mockRequest);
      const data = await response.json();
  
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
    it("returns 500 if AI generation fails", async () => {
      (generateText as jest.Mock).mockRejectedValue(
        new Error("AI failed")
      );
    
      const mockRequest = {
        json: async () => ({
          type: "technical",
          role: "Frontend Developer",
          level: "junior",
          techstack: "React,Next.js",
          amount: 2,
          userid: "123",
        }),
      } as Request;
    
      const response = await POST(mockRequest);
      const data = await response.json();
    
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
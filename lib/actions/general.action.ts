'use server';

import { getFirebaseAdmin } from "@/firebase/admin";

export async function getInterviewsByUserId(userId: string | undefined): Promise<Interview[]> {
    // console.log("🔍 [getInterviewsByUserId] CALLED");
    // console.log("🔍 [getInterviewsByUserId] userId received:", userId);
    const { db } = getFirebaseAdmin();
    if (!userId) {
        console.warn("⚠️ [getInterviewsByUserId] userId is undefined or empty — returning []");
        return [];
    }

    try {
        // console.log("📡 [getInterviewsByUserId] Executing Firestore query: collection=interviews, where userId ==", userId);

        const snapshot = await db
            .collection('interviews')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        // console.log("📦 [getInterviewsByUserId] snapshot.empty:", snapshot.empty);
        // console.log("📦 [getInterviewsByUserId] snapshot.size:", snapshot.size);

        // snapshot.docs.forEach((doc, index) => {
        //     console.log(`📄 [getInterviewsByUserId] Doc[${index}] id:`, doc.id);
        //     console.log(`📄 [getInterviewsByUserId] Doc[${index}] data:`, JSON.stringify(doc.data(), null, 2));
        // });

        const result = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        })) as Interview[];

        // console.log("✅ [getInterviewsByUserId] Returning result count:", result.length);

        return result;

    } catch (error) {
        console.error("❌ [getInterviewsByUserId] Firestore error:", error);
        return [];
    }
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[]> {
    // console.log("🔍 [getLatestInterviews] CALLED");
    // console.log("🔍 [getLatestInterviews] params received:", JSON.stringify(params, null, 2));

    const { userId, limit = 20 } = params;
    const { db } = getFirebaseAdmin();
    if (!userId) {
        console.warn("⚠️ [getLatestInterviews] userId is undefined or empty — returning []");
        return [];
    }

    try {
        // console.log("📡 [getLatestInterviews] Executing Firestore query: collection=interviews, finalized==true, userId !=", userId, "limit:", limit);

        const snapshot = await db
            .collection('interviews')
            .orderBy('createdAt', 'desc')
            .where('finalized', '==', true)
            .where('userId', '!=', userId)
            .limit(limit)
            .get();

        // console.log("📦 [getLatestInterviews] snapshot.empty:", snapshot.empty);
        // console.log("📦 [getLatestInterviews] snapshot.size:", snapshot.size);

        // snapshot.docs.forEach((doc, index) => {
        //     console.log(`📄 [getLatestInterviews] Doc[${index}] id:`, doc.id);
        //     console.log(`📄 [getLatestInterviews] Doc[${index}] data:`, JSON.stringify(doc.data(), null, 2));
        // });

        const result = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        })) as Interview[];

        // console.log("✅ [getLatestInterviews] Returning result count:", result.length);

        return result;

    } catch (error) {
        console.error("❌ [getLatestInterviews] Firestore error:", error);
        return [];
    }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
    // console.log("🔍 [getInterviewById] CALLED");
    // console.log("🔍 [getInterviewById] id received:", id);

    const { db } = getFirebaseAdmin();
    if (!id) {
        console.warn("⚠️ [getInterviewById] id is undefined or empty — returning null");
        return null;
    }

    try {
        // console.log("📡 [getInterviewById] Fetching document from collection=interviews, doc id:", id);

        const docSnap = await db
            .collection('interviews')
            .doc(id)
            .get();

        // console.log("📦 [getInterviewById] document exists:", docSnap.exists);

        if (!docSnap.exists) {
            console.warn("⚠️ [getInterviewById] No document found for id:", id);
            return null;
        }

        // console.log("📄 [getInterviewById] document data:", JSON.stringify(docSnap.data(), null, 2));

        return {
            id: docSnap.id,
            ...docSnap.data()
        } as Interview;

    } catch (error) {
        console.error("❌ [getInterviewById] Firestore error:", error);
        return null;
    }
}

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript } = params;

    // console.log("🔍 [createFeedback] CALLED");
    // console.log("🔍 [createFeedback] interviewId:", interviewId);
    // console.log("🔍 [createFeedback] userId:", userId);
    // console.log("🔍 [createFeedback] transcript length:", transcript?.length);

    if (!interviewId || !userId) {
        console.error("❌ [createFeedback] Missing interviewId or userId");
        return { success: false, message: 'Missing required parameters' };
    }

    if (!process.env.GROQ_API_KEY) {
        console.error("❌ [createFeedback] GROQ_API_KEY is not set in environment variables");
        return {
            success: false,
            message: 'Groq API key is missing. Please contact administrator.'
        };
    }

    try {
        const formattedTranscript = transcript
            .map((sentence: { role: string; content: string }) => (
                `- ${sentence.role}: ${sentence.content}\n`
            )).join('');

        // console.log("📡 [createFeedback] Calling Groq API...");

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional interviewer analyzing mock interviews. Your task is to evaluate candidates based on structured categories and provide detailed, constructive feedback. You must respond with valid JSON only.'
                    },
                    {
                        role: 'user',
                        content: `Analyze this interview transcript and provide a detailed evaluation. Be thorough and honest - if there are mistakes or areas for improvement, point them out clearly.

Transcript:
${formattedTranscript}

Provide your evaluation in the following JSON format (respond with ONLY valid JSON, no markdown formatting or additional text):

{
  "totalScore": 75,
  "categoryScores": [
    {
      "name": "Communication Skills",
      "score": 80,
      "comment": "detailed 2-3 sentence comment about clarity, articulation, and structured responses"
    },
    {
      "name": "Technical Knowledge",
      "score": 70,
      "comment": "detailed 2-3 sentence comment about understanding of key concepts for the role"
    },
    {
      "name": "Problem-Solving",
      "score": 75,
      "comment": "detailed 2-3 sentence comment about ability to analyze problems and propose solutions"
    },
    {
      "name": "Cultural & Role Fit",
      "score": 78,
      "comment": "detailed 2-3 sentence comment about alignment with company values and job role"
    },
    {
      "name": "Confidence & Clarity",
      "score": 72,
      "comment": "detailed 2-3 sentence comment about confidence, engagement, and clarity in responses"
    }
  ],
  "strengths": [
    "specific strength 1",
    "specific strength 2",
    "specific strength 3"
  ],
  "areasForImprovement": [
    "specific area for improvement 1",
    "specific area for improvement 2",
    "specific area for improvement 3"
  ],
  "finalAssessment": "comprehensive 3-4 sentence final assessment covering overall performance, key takeaways, and recommendations"
}

CRITICAL: Return ONLY the JSON object above with actual values. No markdown, no code blocks, no explanations.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000,
                response_format: { type: "json_object" }
            })
        });

        // console.log("📦 [createFeedback] Groq API response status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ [createFeedback] Groq API error response:", errorText);
            throw new Error(`Groq API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;

        // console.log("📦 [createFeedback] Raw AI response text:", text);

        let feedbackData;
        try {
            let cleanedText = text.trim();
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            cleanedText = cleanedText.trim();

            // console.log("📦 [createFeedback] Cleaned text before JSON.parse:", cleanedText);

            feedbackData = JSON.parse(cleanedText);
            // console.log("✅ [createFeedback] JSON parsed successfully");
        } catch (parseError) {
            console.error("❌ [createFeedback] JSON parse failed. Raw text was:", text);
            console.error("❌ [createFeedback] Parse error:", parseError);
            throw new Error('Invalid response format from AI. Please try again.');
        }

        // console.log("📦 [createFeedback] feedbackData keys:", Object.keys(feedbackData));

        if (!feedbackData.totalScore || !feedbackData.categoryScores || !feedbackData.strengths ||
            !feedbackData.areasForImprovement || !feedbackData.finalAssessment) {
            console.error("❌ [createFeedback] Missing required fields. feedbackData:", JSON.stringify(feedbackData, null, 2));
            throw new Error('Incomplete feedback data received from AI');
        }

        const { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } = feedbackData;

        // console.log("📡 [createFeedback] Saving feedback to Firestore...");

        const { db } = getFirebaseAdmin();
        const feedback = await db.collection('feedback').add({
            interviewId,
            userId,
            totalScore,
            categoryScores,
            strengths,
            areasForImprovement,
            finalAssessment,
            createdAt: new Date().toISOString()
        });

        // console.log("✅ [createFeedback] Feedback saved. Document id:", feedback.id);

        return { success: true, feedbackId: feedback.id };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("❌ [createFeedback] Error:", error);

        if (error.message?.includes('API key') || error.message?.includes('Unauthorized')) {
            return { success: false, message: 'Groq API key error. Please check your configuration.' };
        }

        if (error.message?.includes('rate_limit') || error.message?.includes('429')) {
            return { success: false, message: 'Rate limit exceeded. Please wait a moment and try again.' };
        }

        if (error.message?.includes('Invalid response format') || error.message?.includes('Incomplete feedback')) {
            return { success: false, message: 'Failed to parse AI feedback. Please try again.' };
        }

        return { success: false, message: error.message || 'Failed to generate feedback. Please try again.' };
    }
}

export async function getFeedbackByInterviewId(
    params: GetFeedbackByInterviewIdParams
  ): Promise<Feedback | null> {
  
    const { db } = getFirebaseAdmin();
    const { interviewId, userId } = params;
  
    if (!interviewId || !userId) {
      console.warn("⚠️ Missing interviewId or userId — returning null");
      return null;
    }
  
    try {
      const snapshot = await db
        .collection('feedback')
        .where('interviewId', '==', interviewId)
        .where('userId', '==', userId)
        .limit(1)
        .get();
  
      // ✅ IMPORTANT FIX
      if (snapshot.empty) {
        console.warn(
          "⚠️ No feedback found for interviewId:",
          interviewId,
          "userId:",
          userId
        );
        return null;
      }
  
      const feedbackDoc = snapshot.docs[0];
  
      return {
        id: feedbackDoc.id,
        ...feedbackDoc.data()
      } as Feedback;
  
    } catch (error) {
      console.error("❌ getFeedbackByInterviewId error:", error);
      return null;
    }
  }
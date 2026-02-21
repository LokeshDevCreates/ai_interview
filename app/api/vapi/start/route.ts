export async function POST() {
    const response = await fetch('https://api.vapi.ai/call/web', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.VAPI_WEB_TOKEN}`
        },
        body: JSON.stringify({
            workflowId: process.env.VAPI_WORKFLOW_ID,
        })
    });

    const data = await response.json();
    console.log('🔍 Vapi response:', JSON.stringify(data, null, 2));

    return Response.json(data, { status: response.status });
}
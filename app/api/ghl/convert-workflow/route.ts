import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/ghl/convert-workflow - Convert GHL workflow to plain language
export async function POST(request: NextRequest) {
  try {
    const { workflow } = await request.json();

    if (!workflow) {
      return NextResponse.json({
        success: false,
        error: 'Workflow data is required'
      }, { status: 400 });
    }

    const openAIKey = process.env.OPENAI_API_KEY;
    
    if (!openAIKey) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured'
      }, { status: 503 });
    }

    // Build prompt for AI to convert workflow to plain language
    const prompt = `You are an expert at analyzing marketing automation workflows and converting them into clear, plain language descriptions.

Analyze this GoHighLevel workflow and create a plain language prompt that could be used to recreate it:

Workflow Name: ${workflow.name}
Workflow ID: ${workflow.id}
Status: ${workflow.status || 'unknown'}

Workflow Structure:
${JSON.stringify(workflow, null, 2)}

Create a detailed plain language description that includes:
1. The purpose/goal of the workflow
2. What triggers it
3. Each step in sequence with timing
4. The type of messages (email/SMS)
5. Any conditions or branching logic
6. Tags or actions applied

Format your response as a clear, conversational prompt that someone could use to recreate this workflow. Start with "Create a workflow that..." and be specific about all details.

Example format:
"Create a workflow that sends a 3-email welcome series to new customers. It should be triggered when a contact is tagged with 'new_customer'. Send the first email immediately with a welcome message and company introduction. Wait 2 days, then send the second email with product tips and resources. Wait another 3 days, then send a final email with a special offer and call-to-action. Tag contacts as 'welcomed' after completion."`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing marketing automation workflows and converting them into clear, actionable plain language descriptions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    const plainLanguagePrompt = data.choices[0].message.content;

    return NextResponse.json({
      success: true,
      originalWorkflow: {
        id: workflow.id,
        name: workflow.name,
        status: workflow.status
      },
      plainLanguagePrompt,
      message: 'Workflow converted to plain language successfully'
    });

  } catch (error) {
    console.error('Error converting workflow:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to convert workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

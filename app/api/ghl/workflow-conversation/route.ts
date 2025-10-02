import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/ghl/workflow-conversation - Have a conversation with AI about workflow
export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    const openAIKey = process.env.OPENAI_API_KEY;
    
    if (!openAIKey) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured'
      }, { status: 503 });
    }

    // Build conversation messages
    const messages = [
      {
        role: 'system',
        content: `You are an expert marketing automation consultant helping users create GoHighLevel workflows.
        
Your job is to:
1. Ask clarifying questions to understand their needs
2. Suggest best practices for email/SMS sequences
3. Help them define timing, content, and triggers
4. Once you have enough information, provide a complete workflow specification

When asking questions, be conversational and helpful. Ask about:
- Who is the target audience?
- What is the goal of the workflow?
- How many messages do they want?
- What channel (email, SMS, or both)?
- What should trigger the workflow?
- What timing between messages?

When you're ready to create the workflow, respond with a JSON object in this format:
{
  "ready": true,
  "workflow": {
    "name": "Workflow Name",
    "description": "What this workflow does",
    "trigger": {
      "type": "manual|form_submission|tag_added|opportunity_created",
      "config": {}
    },
    "steps": [
      {
        "type": "email|sms|wait|tag",
        "delay": 0,
        "subject": "Email subject (if email)",
        "content": "Message content with {{contact.first_name}} tokens",
        "tags": ["tag1"]
      }
    ]
  }
}

Otherwise, just respond conversationally to gather more information.`
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Try to parse as JSON to see if workflow is ready
    let workflowReady = false;
    let workflow = null;

    try {
      const parsed = JSON.parse(aiResponse);
      if (parsed.ready && parsed.workflow) {
        workflowReady = true;
        workflow = parsed.workflow;
      }
    } catch (e) {
      // Not JSON, just a conversational response
    }

    return NextResponse.json({
      success: true,
      message: aiResponse,
      workflowReady,
      workflow,
      conversationHistory: [
        ...(conversationHistory || []),
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse }
      ]
    });

  } catch (error) {
    console.error('Error in workflow conversation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

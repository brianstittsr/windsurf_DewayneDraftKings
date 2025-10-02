import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/ghl/generate-workflow - Generate workflow from plain language
export async function POST(request: NextRequest) {
  try {
    const { description, type, template, customization } = await request.json();

    if (!description && !template) {
      return NextResponse.json({
        success: false,
        error: 'Description or template is required'
      }, { status: 400 });
    }

    // Dynamic import to avoid build issues
    const { aiWorkflowGenerator } = await import('../../../../lib/ai-workflow-generator');

    let workflow;

    if (template) {
      // Generate from template
      workflow = await aiWorkflowGenerator.generateFromTemplate(template, customization || '');
    } else if (type === 'email_sequence') {
      // Generate email sequence
      const numEmails = parseInt(request.nextUrl.searchParams.get('count') || '3');
      workflow = await aiWorkflowGenerator.generateEmailSequence(description, numEmails);
    } else if (type === 'sms_sequence') {
      // Generate SMS sequence
      const numMessages = parseInt(request.nextUrl.searchParams.get('count') || '3');
      workflow = await aiWorkflowGenerator.generateSMSSequence(description, numMessages);
    } else if (type === 'nurture') {
      // Generate nurture workflow
      workflow = await aiWorkflowGenerator.generateNurtureWorkflow(description);
    } else {
      // Generate general workflow
      workflow = await aiWorkflowGenerator.generateWorkflow({
        description,
        type: type || 'mixed'
      });
    }

    return NextResponse.json({
      success: true,
      workflow,
      message: 'Workflow generated successfully'
    });

  } catch (error) {
    console.error('Error generating workflow:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

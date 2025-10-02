import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/ghl/create-workflow - Create workflow in GoHighLevel
export async function POST(request: NextRequest) {
  try {
    const { workflow } = await request.json();

    if (!workflow) {
      return NextResponse.json({
        success: false,
        error: 'Workflow data is required'
      }, { status: 400 });
    }

    // Dynamic import
    const { ghlService } = await import('../../../../lib/gohighlevel-service');

    // Convert AI-generated workflow to GHL format
    const ghlWorkflow = {
      name: workflow.name,
      description: workflow.description,
      trigger: workflow.trigger,
      actions: workflow.steps.map((step: any, index: number) => {
        if (step.type === 'email') {
          return {
            type: 'email',
            data: {
              subject: step.subject,
              body: step.content,
              delay: step.delay || 0
            }
          };
        } else if (step.type === 'sms') {
          return {
            type: 'sms',
            data: {
              message: step.content,
              delay: step.delay || 0
            }
          };
        } else if (step.type === 'wait') {
          return {
            type: 'wait',
            data: {
              duration: step.delay || 24,
              unit: 'hours'
            }
          };
        } else if (step.type === 'tag') {
          return {
            type: 'tag',
            data: {
              tags: step.tags || []
            }
          };
        }
        return step;
      })
    };

    // Create in GoHighLevel
    const result = await ghlService.createWorkflow(ghlWorkflow);

    return NextResponse.json({
      success: true,
      workflowId: result.id,
      workflow: result,
      message: 'Workflow created in GoHighLevel successfully'
    });

  } catch (error) {
    console.error('Error creating workflow in GHL:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create workflow in GoHighLevel',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

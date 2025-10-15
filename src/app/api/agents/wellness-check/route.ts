import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wellnessMetrics } from '@/db/schema';

// Micro-coping strategies
const COPING_STRATEGIES = [
  {
    name: 'Box Breathing',
    duration: '30 seconds',
    steps: ['Breathe in for 4 counts', 'Hold for 4 counts', 'Breathe out for 4 counts', 'Hold for 4 counts', 'Repeat 3 times'],
    benefit: 'Reduces stress and improves focus'
  },
  {
    name: 'Progressive Muscle Relaxation',
    duration: '2 minutes',
    steps: ['Tense shoulders for 5 seconds, release', 'Clench fists for 5 seconds, release', 'Tighten jaw, then relax', 'Roll neck gently', 'Take 3 deep breaths'],
    benefit: 'Releases physical tension'
  },
  {
    name: '5-4-3-2-1 Grounding',
    duration: '2 minutes',
    steps: ['Name 5 things you see', 'Name 4 things you can touch', 'Name 3 things you hear', 'Name 2 things you smell', 'Name 1 thing you taste'],
    benefit: 'Reduces anxiety and centers awareness'
  },
  {
    name: 'Quick Hydration Break',
    duration: '1 minute',
    steps: ['Drink a full glass of water slowly', 'Stretch arms overhead', 'Take 5 deep breaths', 'Close eyes for 10 seconds'],
    benefit: 'Rehydrates and refreshes'
  },
  {
    name: 'Micro-Walk',
    duration: '3 minutes',
    steps: ['Walk briskly for 90 seconds', 'Do 10 shoulder rolls', 'Shake out arms and legs', 'Return with 3 deep breaths'],
    benefit: 'Boosts energy and circulation'
  }
];

export async function POST(request: NextRequest) {
  try {
    const { user_id, staff_id, mood_score, note, action } = await request.json();

    // Action: 'prompt' for wellness check prompt, 'log' to save mood rating
    if (action === 'prompt') {
      // Return wellness check prompt with coping strategies
      const selectedStrategies = COPING_STRATEGIES
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      return NextResponse.json({
        success: true,
        message: 'How are you feeling right now? Rate your mood from 1-10.',
        prompt: {
          question: 'On a scale of 1-10, how would you rate your current mood and energy?',
          scale: '1 = Exhausted/Stressed, 10 = Energized/Calm',
          follow_up: 'Would you like to try a quick wellness technique?'
        },
        coping_strategies: selectedStrategies
      });
    }

    if (action === 'log') {
      // Save mood rating to database
      if (!user_id || mood_score === undefined) {
        return NextResponse.json(
          { error: 'user_id and mood_score are required' },
          { status: 400 }
        );
      }

      if (mood_score < 1 || mood_score > 10) {
        return NextResponse.json(
          { error: 'mood_score must be between 1 and 10' },
          { status: 400 }
        );
      }

      await db.insert(wellnessMetrics).values({
        user_id,
        timestamp: new Date(),
        mood_score,
        note: note || null
      });

      // Provide supportive response based on mood score
      let response_message = '';
      let recommendations = [];

      if (mood_score <= 3) {
        response_message = 'We notice you\'re having a tough shift. Please consider taking a short break if possible.';
        recommendations = [
          'Alert your supervisor if you need support',
          'Take a 5-minute break in the wellness room',
          'Stay hydrated and have a light snack',
          'Consider speaking with the staff counselor'
        ];
      } else if (mood_score <= 6) {
        response_message = 'You\'re managing well. A quick wellness technique might help refresh you.';
        recommendations = [
          'Try a 2-minute breathing exercise',
          'Stretch or take a brief walk',
          'Connect with a colleague for support',
          'Remind yourself of your positive impact'
        ];
      } else {
        response_message = 'Great to see you\'re doing well! Keep up the good work.';
        recommendations = [
          'Maintain your energy with regular hydration',
          'Continue taking micro-breaks when possible',
          'Your positive energy helps the team!'
        ];
      }

      return NextResponse.json({
        success: true,
        message: 'Mood logged successfully',
        mood_score,
        response: response_message,
        recommendations,
        supportive_note: 'Your wellbeing matters. Thank you for the incredible work you do.'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "prompt" or "log"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('WellnessCheck error:', error);
    return NextResponse.json(
      { error: 'Failed to process wellness check' },
      { status: 500 }
    );
  }
}
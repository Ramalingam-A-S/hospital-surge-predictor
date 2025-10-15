import { NextRequest, NextResponse } from 'next/server';

// Clinical protocol snippets
const PROTOCOLS = {
  trauma: {
    name: 'Trauma Protocol',
    steps: [
      'Ensure scene safety and BSI precautions',
      'Primary survey: ABCDE (Airway, Breathing, Circulation, Disability, Exposure)',
      'Control major bleeding with direct pressure',
      'Establish IV access and fluid resuscitation if needed',
      'Immobilize C-spine if mechanism suggests injury',
      'Secondary survey: head-to-toe assessment',
      'Continuous monitoring of vitals'
    ],
    sop_link: '/protocols/trauma-response.pdf'
  },
  respiratory: {
    name: 'Respiratory Distress Protocol',
    steps: [
      'Position patient upright if conscious',
      'Administer high-flow oxygen (15L/min via NRB)',
      'Assess respiratory rate, SpO2, and work of breathing',
      'Auscultate lung sounds bilaterally',
      'Consider bronchodilator if wheezing present',
      'Prepare for assisted ventilation if SpO2 <90%',
      'Monitor for deterioration'
    ],
    sop_link: '/protocols/respiratory-emergency.pdf'
  },
  cardiac: {
    name: 'Cardiac Arrest Protocol',
    steps: [
      'Verify unresponsiveness and call for help/defibrillator',
      'Begin high-quality CPR (30:2 ratio, rate 100-120/min)',
      'Attach AED/monitor as soon as available',
      'Analyze rhythm: shockable vs non-shockable',
      'If VF/VT: shock, resume CPR immediately',
      'Establish IV/IO access',
      'Administer epinephrine 1mg every 3-5 minutes',
      'Consider reversible causes (Hs and Ts)'
    ],
    sop_link: '/protocols/acls-algorithm.pdf'
  }
};

export async function POST(request: NextRequest) {
  try {
    const { symptoms, vitals } = await request.json();

    if (!symptoms || symptoms.trim().length === 0) {
      return NextResponse.json(
        { error: 'Symptom summary is required' },
        { status: 400 }
      );
    }

    const symptomsLower = symptoms.toLowerCase();
    
    // Basic differential diagnosis based on keywords
    const differentials = [];
    let primaryProtocol = null;

    // Trauma indicators
    if (symptomsLower.match(/injury|trauma|accident|fall|bleeding|wound|fracture/)) {
      differentials.push({
        condition: 'Traumatic Injury',
        priority: 'high',
        indicators: ['mechanism of injury', 'visible trauma', 'bleeding']
      });
      primaryProtocol = PROTOCOLS.trauma;
    }

    // Respiratory indicators
    if (symptomsLower.match(/breathing|dyspnea|shortness|wheez|cough|respiratory|chest pain/)) {
      differentials.push({
        condition: 'Respiratory Distress',
        priority: 'high',
        indicators: ['dyspnea', 'abnormal breath sounds', 'low SpO2']
      });
      if (!primaryProtocol) primaryProtocol = PROTOCOLS.respiratory;
    }

    // Cardiac indicators
    if (symptomsLower.match(/chest pain|cardiac|heart|palpitation|syncope|collapse|unresponsive/)) {
      differentials.push({
        condition: 'Cardiac Event',
        priority: 'critical',
        indicators: ['chest pain', 'diaphoresis', 'altered consciousness']
      });
      if (!primaryProtocol) primaryProtocol = PROTOCOLS.cardiac;
    }

    // Vitals interpretation
    const vitalsConcerns = [];
    if (vitals) {
      if (vitals.bp_systolic && vitals.bp_systolic < 90) {
        vitalsConcerns.push('Hypotension - consider shock');
      }
      if (vitals.heart_rate && vitals.heart_rate > 120) {
        vitalsConcerns.push('Tachycardia - assess for underlying cause');
      }
      if (vitals.respiratory_rate && vitals.respiratory_rate > 24) {
        vitalsConcerns.push('Tachypnea - respiratory compromise');
      }
      if (vitals.spo2 && vitals.spo2 < 92) {
        vitalsConcerns.push('Hypoxia - administer oxygen immediately');
      }
      if (vitals.temperature && vitals.temperature > 38.5) {
        vitalsConcerns.push('Fever - consider infection/sepsis');
      }
    }

    // Default protocol if no match
    if (!primaryProtocol) {
      primaryProtocol = {
        name: 'General Assessment Protocol',
        steps: [
          'Obtain full set of vital signs',
          'Perform focused history and physical exam',
          'Assess level of consciousness (AVPU/GCS)',
          'Identify chief complaint and onset',
          'Document findings and trending',
          'Consult with senior physician for management plan'
        ],
        sop_link: '/protocols/general-assessment.pdf'
      };
    }

    return NextResponse.json({
      success: true,
      differentials: differentials.length > 0 ? differentials : [{
        condition: 'Undifferentiated Presentation',
        priority: 'medium',
        indicators: ['requires further assessment']
      }],
      vitals_interpretation: vitalsConcerns.length > 0 ? vitalsConcerns : ['Vitals within normal parameters'],
      stabilization_checklist: primaryProtocol.steps,
      protocol: primaryProtocol.name,
      sop_reference: primaryProtocol.sop_link,
      safety_reminder: '⚠️ CRITICAL: This is an AI-assisted clinical decision support tool. Always consult with a senior physician or attending before implementing any treatment plan. Verify all recommendations against current protocols and patient-specific factors.'
    });

  } catch (error) {
    console.error('MedAssist error:', error);
    return NextResponse.json(
      { error: 'Failed to generate clinical assistance' },
      { status: 500 }
    );
  }
}
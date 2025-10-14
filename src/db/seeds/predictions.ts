import { db } from '@/db';
import { aiAnalyses } from '@/db/schema';

async function main() {
    const samplePredictions = [
        // Hospital H001 - Predictions 1-12
        // Low Risk (4 predictions)
        {
            snapshotId: 1,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 8,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.89,
            createdAt: new Date('2024-01-15T08:00:00Z').toISOString(),
        },
        {
            snapshotId: 2,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 12,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.91,
            createdAt: new Date('2024-01-15T10:00:00Z').toISOString(),
        },
        {
            snapshotId: 3,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 7,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.93,
            createdAt: new Date('2024-01-15T12:00:00Z').toISOString(),
        },
        {
            snapshotId: 4,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 10,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.87,
            createdAt: new Date('2024-01-15T14:00:00Z').toISOString(),
        },
        // Medium Risk (5 predictions)
        {
            snapshotId: 5,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 22,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.82,
            createdAt: new Date('2024-01-15T16:00:00Z').toISOString(),
        },
        {
            snapshotId: 6,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 28,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.79,
            createdAt: new Date('2024-01-15T18:00:00Z').toISOString(),
        },
        {
            snapshotId: 7,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 18,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.85,
            createdAt: new Date('2024-01-15T20:00:00Z').toISOString(),
        },
        {
            snapshotId: 8,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 31,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.77,
            createdAt: new Date('2024-01-15T22:00:00Z').toISOString(),
        },
        {
            snapshotId: 9,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 25,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.81,
            createdAt: new Date('2024-01-16T00:00:00Z').toISOString(),
        },
        // High Risk (3 predictions)
        {
            snapshotId: 10,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 52,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.86,
            createdAt: new Date('2024-01-16T02:00:00Z').toISOString(),
        },
        {
            snapshotId: 11,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 65,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.84,
            createdAt: new Date('2024-01-16T04:00:00Z').toISOString(),
        },
        {
            snapshotId: 12,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 47,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.88,
            createdAt: new Date('2024-01-16T06:00:00Z').toISOString(),
        },

        // Hospital H002 - Predictions 13-24
        // Low Risk (4 predictions)
        {
            snapshotId: 13,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 9,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.90,
            createdAt: new Date('2024-01-15T08:00:00Z').toISOString(),
        },
        {
            snapshotId: 14,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 11,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.92,
            createdAt: new Date('2024-01-15T10:00:00Z').toISOString(),
        },
        {
            snapshotId: 15,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 6,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.94,
            createdAt: new Date('2024-01-15T12:00:00Z').toISOString(),
        },
        {
            snapshotId: 16,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 13,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.88,
            createdAt: new Date('2024-01-15T14:00:00Z').toISOString(),
        },
        // Medium Risk (5 predictions)
        {
            snapshotId: 17,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 20,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.83,
            createdAt: new Date('2024-01-15T16:00:00Z').toISOString(),
        },
        {
            snapshotId: 18,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 33,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.76,
            createdAt: new Date('2024-01-15T18:00:00Z').toISOString(),
        },
        {
            snapshotId: 19,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 17,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.86,
            createdAt: new Date('2024-01-15T20:00:00Z').toISOString(),
        },
        {
            snapshotId: 20,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 29,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.78,
            createdAt: new Date('2024-01-15T22:00:00Z').toISOString(),
        },
        {
            snapshotId: 21,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 24,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.80,
            createdAt: new Date('2024-01-16T00:00:00Z').toISOString(),
        },
        // High Risk (3 predictions)
        {
            snapshotId: 22,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 58,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.85,
            createdAt: new Date('2024-01-16T02:00:00Z').toISOString(),
        },
        {
            snapshotId: 23,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 68,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.82,
            createdAt: new Date('2024-01-16T04:00:00Z').toISOString(),
        },
        {
            snapshotId: 24,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 43,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.89,
            createdAt: new Date('2024-01-16T06:00:00Z').toISOString(),
        },

        // Hospital H003 - Predictions 25-36
        // Low Risk (4 predictions)
        {
            snapshotId: 25,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 14,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.91,
            createdAt: new Date('2024-01-15T08:00:00Z').toISOString(),
        },
        {
            snapshotId: 26,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 5,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.95,
            createdAt: new Date('2024-01-15T10:00:00Z').toISOString(),
        },
        {
            snapshotId: 27,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 9,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.90,
            createdAt: new Date('2024-01-15T12:00:00Z').toISOString(),
        },
        {
            snapshotId: 28,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 11,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.86,
            createdAt: new Date('2024-01-15T14:00:00Z').toISOString(),
        },
        // Medium Risk (5 predictions)
        {
            snapshotId: 29,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 26,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.81,
            createdAt: new Date('2024-01-15T16:00:00Z').toISOString(),
        },
        {
            snapshotId: 30,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 19,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.84,
            createdAt: new Date('2024-01-15T18:00:00Z').toISOString(),
        },
        {
            snapshotId: 31,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 35,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.75,
            createdAt: new Date('2024-01-15T20:00:00Z').toISOString(),
        },
        {
            snapshotId: 32,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 23,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.83,
            createdAt: new Date('2024-01-15T22:00:00Z').toISOString(),
        },
        {
            snapshotId: 33,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 30,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.79,
            createdAt: new Date('2024-01-16T00:00:00Z').toISOString(),
        },
        // High Risk (3 predictions)
        {
            snapshotId: 34,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 55,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.87,
            createdAt: new Date('2024-01-16T02:00:00Z').toISOString(),
        },
        {
            snapshotId: 35,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 62,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.83,
            createdAt: new Date('2024-01-16T04:00:00Z').toISOString(),
        },
        {
            snapshotId: 36,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 41,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.90,
            createdAt: new Date('2024-01-16T06:00:00Z').toISOString(),
        },

        // Hospital H004 - Predictions 37-48
        // Low Risk (4 predictions)
        {
            snapshotId: 37,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 15,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.85,
            createdAt: new Date('2024-01-15T08:00:00Z').toISOString(),
        },
        {
            snapshotId: 38,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 8,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.92,
            createdAt: new Date('2024-01-15T10:00:00Z').toISOString(),
        },
        {
            snapshotId: 39,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 12,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.89,
            createdAt: new Date('2024-01-15T12:00:00Z').toISOString(),
        },
        {
            snapshotId: 40,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 6,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.94,
            createdAt: new Date('2024-01-15T14:00:00Z').toISOString(),
        },
        // Medium Risk (5 predictions)
        {
            snapshotId: 41,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 21,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.82,
            createdAt: new Date('2024-01-15T16:00:00Z').toISOString(),
        },
        {
            snapshotId: 42,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 34,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.76,
            createdAt: new Date('2024-01-15T18:00:00Z').toISOString(),
        },
        {
            snapshotId: 43,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 16,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.88,
            createdAt: new Date('2024-01-15T20:00:00Z').toISOString(),
        },
        {
            snapshotId: 44,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 27,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.80,
            createdAt: new Date('2024-01-15T22:00:00Z').toISOString(),
        },
        {
            snapshotId: 45,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 32,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.77,
            createdAt: new Date('2024-01-16T00:00:00Z').toISOString(),
        },
        // High Risk (3 predictions)
        {
            snapshotId: 46,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 49,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.88,
            createdAt: new Date('2024-01-16T02:00:00Z').toISOString(),
        },
        {
            snapshotId: 47,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 70,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.80,
            createdAt: new Date('2024-01-16T04:00:00Z').toISOString(),
        },
        {
            snapshotId: 48,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 56,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.86,
            createdAt: new Date('2024-01-16T06:00:00Z').toISOString(),
        },

        // Hospital H005 - Predictions 49-60
        // Low Risk (4 predictions)
        {
            snapshotId: 49,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 10,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.90,
            createdAt: new Date('2024-01-15T08:00:00Z').toISOString(),
        },
        {
            snapshotId: 50,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 7,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.93,
            createdAt: new Date('2024-01-15T10:00:00Z').toISOString(),
        },
        {
            snapshotId: 51,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 13,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.87,
            createdAt: new Date('2024-01-15T12:00:00Z').toISOString(),
        },
        {
            snapshotId: 52,
            riskLevel: 'Low',
            predictedAdditionalPatients6h: 9,
            recommendedActions: [
                { action: 'Continue routine monitoring', priority: 'low' },
                { action: 'Maintain current staffing levels', priority: 'low' }
            ],
            alertMessage: 'All systems operating normally. No immediate concerns.',
            confidenceScore: 0.91,
            createdAt: new Date('2024-01-15T14:00:00Z').toISOString(),
        },
        // Medium Risk (5 predictions)
        {
            snapshotId: 53,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 25,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.81,
            createdAt: new Date('2024-01-15T16:00:00Z').toISOString(),
        },
        {
            snapshotId: 54,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 18,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.85,
            createdAt: new Date('2024-01-15T18:00:00Z').toISOString(),
        },
        {
            snapshotId: 55,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 33,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.76,
            createdAt: new Date('2024-01-15T20:00:00Z').toISOString(),
        },
        {
            snapshotId: 56,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 22,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.83,
            createdAt: new Date('2024-01-15T22:00:00Z').toISOString(),
        },
        {
            snapshotId: 57,
            riskLevel: 'Medium',
            predictedAdditionalPatients6h: 29,
            recommendedActions: [
                { action: 'Prepare additional beds in emergency ward', priority: 'medium' },
                { action: 'Call in on-call staff if trend continues', priority: 'medium' },
                { action: 'Monitor oxygen and ventilator supplies closely', priority: 'high' }
            ],
            alertMessage: 'Moderate patient influx expected. Prepare for increased demand.',
            confidenceScore: 0.78,
            createdAt: new Date('2024-01-16T00:00:00Z').toISOString(),
        },
        // High Risk (3 predictions)
        {
            snapshotId: 58,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 54,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.87,
            createdAt: new Date('2024-01-16T02:00:00Z').toISOString(),
        },
        {
            snapshotId: 59,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 61,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.84,
            createdAt: new Date('2024-01-16T04:00:00Z').toISOString(),
        },
        {
            snapshotId: 60,
            riskLevel: 'High',
            predictedAdditionalPatients6h: 45,
            recommendedActions: [
                { action: 'Activate emergency response protocol', priority: 'critical' },
                { action: 'Call in all available off-duty staff immediately', priority: 'critical' },
                { action: 'Arrange immediate supply replenishment for oxygen and medicines', priority: 'critical' },
                { action: 'Coordinate with nearby hospitals for potential patient transfers', priority: 'high' },
                { action: 'Set up triage area for incoming patients', priority: 'high' }
            ],
            alertMessage: 'CRITICAL: High patient surge predicted. Immediate action required.',
            confidenceScore: 0.91,
            createdAt: new Date('2024-01-16T06:00:00Z').toISOString(),
        },
    ];

    await db.insert(predictions).values(samplePredictions);

    console.log('✅ Predictions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});
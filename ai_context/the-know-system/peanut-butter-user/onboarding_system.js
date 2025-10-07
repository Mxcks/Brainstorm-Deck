/**
 * pB Onboarding Personality Assessment System
 * Percentage-based scoring for 3-question personality detection
 */

class OnboardingAssessment {
    constructor() {
        this.questions = [
            {
                id: 1,
                question: "What's your main focus right now?",
                options: {
                    A: "Completing a specific project quickly",
                    B: "Learning something new and exciting", 
                    C: "Building better habits and routines",
                    D: "Understanding a complex topic thoroughly"
                }
            },
            {
                id: 2,
                question: "When starting something new, you prefer to:",
                options: {
                    A: "Jump in and figure it out as you go",
                    B: "Find others to collaborate and brainstorm with",
                    C: "Take it step-by-step with clear guidance",
                    D: "Research and plan everything first"
                }
            },
            {
                id: 3,
                question: "What motivates you most?",
                options: {
                    A: "Achieving results and hitting targets",
                    B: "Creative expression and recognition",
                    C: "Steady progress and supportive feedback",
                    D: "Mastering skills and deep understanding"
                }
            }
        ];
    }

    /**
     * Calculate personality percentages from user answers
     * @param {Array} answers - Array of 'A', 'B', 'C', or 'D' answers
     * @returns {Object} Personality type percentages and analysis
     */
    calculatePersonality(answers) {
        if (answers.length !== 3) {
            throw new Error('Must provide exactly 3 answers');
        }

        // Count answers for each type
        const counts = {
            red: 0,      // A answers
            yellow: 0,   // B answers  
            green: 0,    // C answers
            blue: 0      // D answers
        };

        answers.forEach(answer => {
            switch(answer.toUpperCase()) {
                case 'A': counts.red++; break;
                case 'B': counts.yellow++; break;
                case 'C': counts.green++; break;
                case 'D': counts.blue++; break;
                default: throw new Error(`Invalid answer: ${answer}`);
            }
        });

        // Calculate percentages
        const percentages = {
            red: Math.round((counts.red / 3) * 100),
            yellow: Math.round((counts.yellow / 3) * 100),
            green: Math.round((counts.green / 3) * 100),
            blue: Math.round((counts.blue / 3) * 100)
        };

        // Determine primary and secondary types
        const sortedTypes = Object.entries(percentages)
            .sort(([,a], [,b]) => b - a)
            .filter(([,percentage]) => percentage > 0);

        const primaryType = sortedTypes[0];
        const secondaryType = sortedTypes.length > 1 ? sortedTypes[1] : null;

        return {
            percentages,
            primaryType: {
                type: primaryType[0],
                percentage: primaryType[1]
            },
            secondaryType: secondaryType ? {
                type: secondaryType[0], 
                percentage: secondaryType[1]
            } : null,
            typeDescription: this.generateTypeDescription(percentages, primaryType, secondaryType),
            aiAdaptation: this.generateAIAdaptation(percentages, primaryType, secondaryType)
        };
    }

    /**
     * Generate human-readable personality description
     */
    generateTypeDescription(percentages, primaryType, secondaryType) {
        const typeNames = {
            red: 'Results-Oriented',
            yellow: 'Creative & Social', 
            green: 'Steady & Supportive',
            blue: 'Analytical & Thorough'
        };

        if (primaryType[1] === 100) {
            return `Pure ${typeNames[primaryType[0]]} - You have a clear, focused approach`;
        }

        if (secondaryType && secondaryType[1] >= 33) {
            return `${typeNames[primaryType[0]]} with ${typeNames[secondaryType[0]]} tendencies - You blend ${primaryType[0]} drive with ${secondaryType[0]} qualities`;
        }

        return `Primarily ${typeNames[primaryType[0]]} - You lean toward ${primaryType[0]} approaches`;
    }

    /**
     * Generate AI adaptation message for user
     */
    generateAIAdaptation(percentages, primaryType, secondaryType) {
        const adaptations = {
            red: "I'll give you quick, direct answers and focus on results",
            yellow: "I'll make our interactions engaging and collaborative",
            green: "I'll provide step-by-step guidance with plenty of support", 
            blue: "I'll give you comprehensive information and detailed explanations"
        };

        let message = `Great! Based on your answers, ${adaptations[primaryType[0]]}.`;

        if (secondaryType && secondaryType[1] >= 33) {
            const secondaryAdaptation = {
                red: "with quick action steps",
                yellow: "with creative examples", 
                green: "with patient pacing",
                blue: "with thorough details"
            };
            message += ` I'll also blend in ${secondaryAdaptation[secondaryType[0]]} to match your ${secondaryType[0]} side.`;
        }

        return message;
    }

    /**
     * Get personality-specific communication style
     */
    getCommunicationStyle(percentages) {
        const dominant = Object.entries(percentages)
            .sort(([,a], [,b]) => b - a)[0];

        const styles = {
            red: {
                responseLength: 'brief',
                tone: 'direct',
                pacing: 'fast',
                detailLevel: 'results_focused'
            },
            yellow: {
                responseLength: 'engaging',
                tone: 'enthusiastic', 
                pacing: 'energetic',
                detailLevel: 'story_based'
            },
            green: {
                responseLength: 'supportive',
                tone: 'patient',
                pacing: 'steady',
                detailLevel: 'step_by_step'
            },
            blue: {
                responseLength: 'comprehensive',
                tone: 'thorough',
                pacing: 'methodical', 
                detailLevel: 'detailed'
            }
        };

        return styles[dominant[0]];
    }

    /**
     * Example usage and testing
     */
    static example() {
        const assessment = new OnboardingAssessment();
        
        // Test different answer combinations
        const testCases = [
            ['A', 'A', 'A'], // Pure Red
            ['A', 'A', 'C'], // Red-Green mix
            ['B', 'D', 'C'], // Balanced mix
            ['D', 'D', 'D']  // Pure Blue
        ];

        testCases.forEach((answers, index) => {
            console.log(`\nTest Case ${index + 1}: ${answers.join(', ')}`);
            const result = assessment.calculatePersonality(answers);
            console.log('Percentages:', result.percentages);
            console.log('Description:', result.typeDescription);
            console.log('AI Adaptation:', result.aiAdaptation);
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OnboardingAssessment;
}

// Run example if called directly
if (typeof require !== 'undefined' && require.main === module) {
    OnboardingAssessment.example();
}

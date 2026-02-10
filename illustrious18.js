/**
 * The Illustrious 18 - Blackjack Card Counting Deviations
 * These are the 18 most important index plays for the Hi-Lo counting system
 */

const ILLUSTRIOUS_18 = [
    {
        id: 1,
        name: "Insurance",
        playerHand: "Any",
        dealerUpcard: "A",
        basicStrategy: "No Insurance",
        deviation: "Take Insurance",
        index: 3,
        explanation: "When the true count is +3 or higher, the deck is rich in tens, making insurance a positive EV play."
    },
    {
        id: 2,
        name: "16 vs 10",
        playerHand: "16",
        dealerUpcard: "10",
        basicStrategy: "Hit",
        deviation: "Stand",
        index: 0,
        explanation: "At true count 0 or higher, standing on 16 vs 10 becomes the better play. The high count means more tens remain, making the dealer more likely to bust."
    },
    {
        id: 3,
        name: "15 vs 10",
        playerHand: "15",
        dealerUpcard: "10",
        basicStrategy: "Hit",
        deviation: "Stand",
        index: 4,
        explanation: "Only stand on 15 vs 10 when the true count is +4 or higher. This is a borderline play requiring a very high count."
    },
    {
        id: 4,
        name: "10,10 vs 5",
        playerHand: "10,10",
        dealerUpcard: "5",
        basicStrategy: "Stand",
        deviation: "Split",
        index: 5,
        explanation: "Split tens against a 5 only at +5 or higher. This is a very aggressive play that signals a massive player edge."
    },
    {
        id: 5,
        name: "10,10 vs 6",
        playerHand: "10,10",
        dealerUpcard: "6",
        basicStrategy: "Stand",
        deviation: "Split",
        index: 4,
        explanation: "Split tens against a 6 at +4 or higher. Slightly lower threshold than against a 5 due to the dealer's weaker position."
    },
    {
        id: 6,
        name: "10 vs 10",
        playerHand: "10",
        dealerUpcard: "10",
        basicStrategy: "Hit",
        deviation: "Double",
        index: 4,
        explanation: "Double 10 vs 10 at +4 or higher. This is a very aggressive play requiring a massive player edge."
    },
    {
        id: 7,
        name: "12 vs 3",
        playerHand: "12",
        dealerUpcard: "3",
        basicStrategy: "Hit",
        deviation: "Stand",
        index: 2,
        explanation: "Stand on 12 vs 3 at +2 or higher. The dealer's weak upcard combined with a rich deck makes standing better."
    },
    {
        id: 8,
        name: "12 vs 2",
        playerHand: "12",
        dealerUpcard: "2",
        basicStrategy: "Hit",
        deviation: "Stand",
        index: 3,
        explanation: "Stand on 12 vs 2 at +3 or higher. The dealer's 2 is deceptively strong, requiring a higher count to deviate."
    },
    {
        id: 9,
        name: "11 vs A",
        playerHand: "11",
        dealerUpcard: "A",
        basicStrategy: "Hit",
        deviation: "Double",
        index: 1,
        explanation: "Double 11 vs Ace at +1 or higher. With a rich deck, doubling becomes profitable even against the dealer's strong ace."
    },
    {
        id: 10,
        name: "9 vs 2",
        playerHand: "9",
        dealerUpcard: "2",
        basicStrategy: "Hit",
        deviation: "Double",
        index: 1,
        explanation: "Double 9 vs 2 at +1 or higher. The dealer's weak 2 makes this a profitable double with any positive count."
    },
    {
        id: 11,
        name: "10 vs A",
        playerHand: "10",
        dealerUpcard: "A",
        basicStrategy: "Hit",
        deviation: "Double",
        index: 4,
        explanation: "Double 10 vs Ace at +4 or higher. The ace is the dealer's strongest card, requiring a high count to double."
    },
    {
        id: 12,
        name: "9 vs 7",
        playerHand: "9",
        dealerUpcard: "7",
        basicStrategy: "Hit",
        deviation: "Double",
        index: 3,
        explanation: "Double 9 vs 7 at +3 or higher. The 7 is weaker than it appears, and a high count makes doubling profitable."
    },
    {
        id: 13,
        name: "16 vs 9",
        playerHand: "16",
        dealerUpcard: "9",
        basicStrategy: "Hit",
        deviation: "Stand",
        index: 5,
        explanation: "Stand on 16 vs 9 at +5 or higher. Against the dealer's strong 9, you need a very high count to stand."
    },
    {
        id: 14,
        name: "13 vs 2",
        playerHand: "13",
        dealerUpcard: "2",
        basicStrategy: "Stand",
        deviation: "Hit",
        index: -1,
        explanation: "Basic strategy is to stand on 13 vs 2. Only hit when the true count is below -1 (very negative counts)."
    },
    {
        id: 15,
        name: "12 vs 4",
        playerHand: "12",
        dealerUpcard: "4",
        basicStrategy: "Stand",
        deviation: "Hit",
        index: 0,
        explanation: "Basic strategy is to stand on 12 vs 4. Only hit when the true count is negative (below 0)."
    },
    {
        id: 16,
        name: "12 vs 5",
        playerHand: "12",
        dealerUpcard: "5",
        basicStrategy: "Stand",
        deviation: "Hit",
        index: -1,
        explanation: "Stand on 12 vs 5 at -1 or higher. Only hit when the true count is below -1."
    },
    {
        id: 17,
        name: "12 vs 6",
        playerHand: "12",
        dealerUpcard: "6",
        basicStrategy: "Stand",
        deviation: "Hit",
        index: -1,
        explanation: "Basic strategy is to stand on 12 vs 6. Only hit when the true count is below -1."
    },
    {
        id: 18,
        name: "13 vs 3",
        playerHand: "13",
        dealerUpcard: "3",
        basicStrategy: "Stand",
        deviation: "Hit",
        index: -2,
        explanation: "Basic strategy is to stand on 13 vs 3. Only hit when the true count is below -2."
    }
];

// Edge case generators for educational value
const EDGE_CASES = {
    // Generate true counts near the index to teach nuances
    getEdgeCaseTrueCount(index) {
        const offsets = [-2, -1, 0, 1, 2];
        const offset = offsets[Math.floor(Math.random() * offsets.length)];
        return Math.max(-5, index + offset);
    },
    
    // Determine if this is an edge case scenario
    isEdgeCase(trueCount, index) {
        return Math.abs(trueCount - index) <= 1;
    },
    
    // Generate explanation for edge cases
    getEdgeCaseExplanation(trueCount, index, deviation, basicStrategy) {
        const diff = trueCount - index;
        const trueCountDisplay = trueCount >= 0 ? `+${trueCount}` : `${trueCount}`;
        if (diff === 0) {
            return `This is AT the index (${index}). Both plays are nearly equal in value here.`;
        } else if (diff === 1) {
            return `True count (${trueCountDisplay}) is 1 above the index (${index}). The deviation is clearly correct.`;
        } else if (diff === -1) {
            return `True count (${trueCountDisplay}) is 1 below the index (${index}). Basic strategy is correct here, but it's close.`;
        } else if (diff > 1) {
            return `True count (${trueCountDisplay}) is well above the index (${index}). The deviation is strongly correct.`;
        } else {
            return `True count (${trueCountDisplay}) is well below the index (${index}). Stick to basic strategy.`;
        }
    }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ILLUSTRIOUS_18, EDGE_CASES };
}
/**
 * 🧠 AI Engine Level 4 – Main Analyzer
 * Kết hợp: TF-IDF + Cosine Similarity + Synonym Expansion + Keyword Bonus
 */
import { CATEGORY_DOCS, SYNONYMS } from "./aiDataset.js";
import {
    tokenize,
    normalize,
    expandSynonyms,
    buildVector,
    cosineSimilarity,
    keywordBonus
} from "./ai.tfidf.js";

// ───────────────────────────────────────────────
// Build full vocabulary từ tất cả category docs
// ───────────────────────────────────────────────
const buildVocabulary = (docs) => {
    const vocab = new Set();
    docs.forEach(doc => {
        tokenize(doc).forEach(w => vocab.add(w));
    });
    return Array.from(vocab);
};

// ───────────────────────────────────────────────
// Main analyze function
// ───────────────────────────────────────────────
export const analyzeAdvanced = (prompt) => {
    // Step 1: Expand synonyms → giúp AI hiểu ngôn ngữ tự nhiên
    const expandedPrompt = expandSynonyms(prompt, SYNONYMS);

    // Step 2: Tokenize input
    const inputWords = tokenize(expandedPrompt);

    // Step 3: Lấy tất cả category docs
    const allCategoryDocs = Object.values(CATEGORY_DOCS);

    // Step 4: Build shared vocabulary
    const vocabulary = buildVocabulary(allCategoryDocs);

    // Step 5: Build vector cho input
    const allDocsTokenized = allCategoryDocs.map(d => tokenize(d));
    const inputVector = buildVector(inputWords, vocabulary, allDocsTokenized);

    // Step 6: Tính similarity với từng category
    const scores = {};
    const details = {};

    for (const [category, doc] of Object.entries(CATEGORY_DOCS)) {
        const catWords = tokenize(doc);
        const catVector = buildVector(catWords, vocabulary, allDocsTokenized);

        // Cosine similarity (main score)
        const cosScore = cosineSimilarity(inputVector, catVector);

        // Keyword bonus (hybrid layer)
        const bonus = keywordBonus(inputWords, catWords);

        // Final score = cosine + bonus (capped at 1)
        scores[category] = Math.min(cosScore + bonus, 1);

        details[category] = {
            cosine: cosScore.toFixed(4),
            bonus: bonus.toFixed(4),
            final: scores[category].toFixed(4)
        };
    }

    // Step 7: Rank categories
    const ranked = Object.entries(scores)
        .sort((a, b) => b[1] - a[1]);

    // Step 8: Confidence assessment
    const topScore = ranked[0][1];
    let confidence = "low";
    if (topScore > 0.15) confidence = "high";
    else if (topScore > 0.05) confidence = "medium";

    return {
        originalPrompt: prompt,
        expandedPrompt,
        inputTokens: inputWords,
        scores,
        details,
        rankedCategories: ranked,
        bestCategory: ranked[0][0],
        bestScore: topScore,
        confidence
    };
};

// ───────────────────────────────────────────────
// Generate AI response message
// ───────────────────────────────────────────────
export const generateAIResponse = (result) => {
    const { bestCategory, confidence, rankedCategories, bestScore } = result;

    const topTwo = rankedCategories.slice(0, 2).map(([cat]) => cat);

    const responses = {
        high: [
            `📚 Tôi nghĩ bạn sẽ yêu thích sách **${bestCategory}**! Đây là kết quả phân tích của tôi dựa trên những gì bạn chia sẻ.`,
            `🎯 Phân tích cho thấy **${bestCategory}** là lựa chọn phù hợp nhất với bạn. Hãy xem những cuốn sách tuyệt vời dưới đây!`,
            `🧠 AI của tôi dự đoán bạn đang tìm kiếm sách **${bestCategory}**. Tự tin đến ${Math.round(bestScore * 100)}%!`
        ],
        medium: [
            `🤔 Tôi nghĩ bạn có thể thích **${topTwo.join("** hoặc **")}**. Để tôi gợi ý một số cuốn hay!`,
            `💡 Dựa trên phân tích, **${bestCategory}** có vẻ phù hợp với bạn – nhưng cũng có thể là **${topTwo[1]}**!`
        ],
        low: [
            `🔍 Hmm, tôi chưa chắc lắm... Để tôi gợi ý cho bạn một số sách hay nhất của chúng tôi nhé!`,
            `📖 Tôi sẽ gợi ý một số cuốn sách nổi bật – bạn có thể tìm thấy điều mình thích!`
        ]
    };

    const pool = responses[confidence];
    return pool[Math.floor(Math.random() * pool.length)];
};

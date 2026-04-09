import Book from "../models/Book.js";
import { analyzeAdvanced, generateAIResponse } from "../services/aiEngine.js";

// ───────────────────────────────────────────────
// POST /api/ai/chat
// Body: { message: string }
// ───────────────────────────────────────────────
export const chat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "Vui lòng nhập tin nhắn"
            });
        }

        // Step 1: Phân tích input bằng AI Engine
        const analysis = analyzeAdvanced(message.trim());

        // Step 2: Generate AI response text
        const aiMessage = generateAIResponse(analysis);

        // Step 3: Query sách theo kết quả AI
        let books;
        const { bestCategory, confidence } = analysis;

        if (confidence === "low") {
            // Confidence thấp → trả sách phổ biến nhất
            books = await Book.find({ inStock: true })
                .sort({ rating: -1, numReviews: -1 })
                .limit(8)
                .select("title author price originalPrice image rating numReviews category");
        } else {
            // Confidence cao/medium → lọc theo category AI dự đoán
            books = await Book.find({
                category: bestCategory,
                inStock: true
            })
                .sort({ rating: -1 })
                .limit(8)
                .select("title author price originalPrice image rating numReviews category");

            // Nếu category không đủ sách → lấy thêm từ category xếp hạng 2
            if (books.length < 4 && analysis.rankedCategories.length > 1) {
                const fallbackCategory = analysis.rankedCategories[1][0];
                const extraBooks = await Book.find({
                    category: fallbackCategory,
                    inStock: true,
                    _id: { $nin: books.map(b => b._id) }
                })
                    .sort({ rating: -1 })
                    .limit(8 - books.length)
                    .select("title author price originalPrice image rating numReviews category");

                books = [...books, ...extraBooks];
            }
        }

        // Step 4: Trả response
        res.json({
            success: true,
            aiMessage,
            analysis: {
                bestCategory,
                confidence,
                topCategories: analysis.rankedCategories.slice(0, 3).map(([cat, score]) => ({
                    category: cat,
                    score: parseFloat(score.toFixed(4))
                })),
                inputTokens: analysis.inputTokens
            },
            books
        });

    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({
            success: false,
            error: "AI đang bận, vui lòng thử lại sau!"
        });
    }
};

// ───────────────────────────────────────────────
// POST /api/ai/analyze (debug endpoint)
// ───────────────────────────────────────────────
export const analyzeOnly = (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "message required" });

        const result = analyzeAdvanced(message);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

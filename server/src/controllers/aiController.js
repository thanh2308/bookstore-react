import Book from "../models/Book.js";
import { analyzeAdvanced, generateAIResponse } from "../services/aiEngine.js";

const DEFAULT_LIMIT = 8;

const CATEGORY_PATTERNS = [
  { category: "Kỹ năng sống", patterns: ["ky nang song", "self help"] },
  { category: "Tiểu thuyết", patterns: ["tieu thuyet", "fiction", "novel"] },
  {
    category: "Khoa học",
    patterns: ["khoa hoc", "science", "cong nghe", "tech"],
  },
  {
    category: "Kinh tế",
    patterns: ["kinh te", "tai chinh", "dau tu", "business"],
  },
  { category: "Văn học Việt Nam", patterns: ["van hoc viet nam", "viet nam"] },
  {
    category: "Thiếu nhi",
    patterns: ["thieu nhi", "tre em", "children", "kids"],
  },
];

const normalizeVietnamese = (text) =>
  String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

const escapeRegex = (text) =>
  String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizePriceNumber = (value) => {
  if (!value) return null;

  let text = String(value).toLowerCase().trim();
  const isK = /k\b|ngh/i.test(text);

  text = text.replace(/[^\d]/g, "");
  if (!text) return null;

  const parsed = Number.parseInt(text, 10);
  if (!Number.isFinite(parsed)) return null;

  return isK ? parsed * 1000 : parsed;
};

const normalizeScoreNumber = (value) => {
  if (!value) return null;

  const text = String(value)
    .replace(/,/g, ".")
    .replace(/[^\d.]/g, "");
  if (!text) return null;

  const parsed = Number.parseFloat(text);
  return Number.isFinite(parsed) ? parsed : null;
};

const cleanCapturedText = (value) => {
  if (!value) return null;

  const cleaned = String(value)
    .replace(
      /(gia|giá|duoi|dưới|tren|trên|tu|từ|den|đến|sao|rating|sap xep|sắp xếp|con hang|còn hàng|het hang|hết hàng).*/i,
      "",
    )
    .trim();

  return cleaned.length >= 2 ? cleaned : null;
};

const extractCategoryFilter = (message) => {
  const normalized = normalizeVietnamese(message);
  const matched = CATEGORY_PATTERNS.find((item) =>
    item.patterns.some((pattern) => normalized.includes(pattern)),
  );
  return matched?.category || null;
};

const extractPriceFilter = (message) => {
  const input = String(message || "").toLowerCase();

  const rangeMatch = input.match(
    /(từ|tu)\s*([\d\.,\s]+k?)\s*(đến|den|\-)\s*([\d\.,\s]+k?)/i,
  );
  if (rangeMatch) {
    const min = normalizePriceNumber(rangeMatch[2]);
    const max = normalizePriceNumber(rangeMatch[4]);
    if (Number.isFinite(min) && Number.isFinite(max)) {
      return {
        min: Math.min(min, max),
        max: Math.max(min, max),
      };
    }
  }

  const underMatch = input.match(
    /(dưới|duoi|nhỏ hơn|nho hon|<|tối đa|toi da)\s*([\d\.,\s]+k?)/i,
  );
  if (underMatch) {
    const max = normalizePriceNumber(underMatch[2]);
    if (Number.isFinite(max)) return { max };
  }

  const overMatch = input.match(
    /(trên|tren|lớn hơn|lon hon|>|tối thiểu|toi thieu)\s*([\d\.,\s]+k?)/i,
  );
  if (overMatch) {
    const min = normalizePriceNumber(overMatch[2]);
    if (Number.isFinite(min)) return { min };
  }

  return null;
};

const extractRatingFilter = (message) => {
  const input = String(message || "").toLowerCase();

  const rangeMatch = input.match(
    /(từ|tu)\s*([\d\.,]+)\s*(đến|den|\-)\s*([\d\.,]+)\s*sao/i,
  );
  if (rangeMatch) {
    const min = normalizeScoreNumber(rangeMatch[2]);
    const max = normalizeScoreNumber(rangeMatch[4]);
    if (Number.isFinite(min) && Number.isFinite(max)) {
      return { min: Math.min(min, max), max: Math.max(min, max) };
    }
  }

  const minMatch = input.match(
    /(trên|tren|>=|tối thiểu|toi thieu)\s*([\d\.,]+)\s*sao/i,
  );
  if (minMatch) {
    const min = normalizeScoreNumber(minMatch[2]);
    if (Number.isFinite(min)) return { min };
  }

  const maxMatch = input.match(
    /(dưới|duoi|<=|tối đa|toi da)\s*([\d\.,]+)\s*sao/i,
  );
  if (maxMatch) {
    const max = normalizeScoreNumber(maxMatch[2]);
    if (Number.isFinite(max)) return { max };
  }

  const exactMatch = input.match(/([\d\.,]+)\s*sao/i);
  if (exactMatch) {
    const min = normalizeScoreNumber(exactMatch[1]);
    if (Number.isFinite(min)) return { min };
  }

  return null;
};

const extractSortOption = (message) => {
  const normalized = normalizeVietnamese(message);

  if (/(re nhat|gia thap nhat|gia tang dan)/.test(normalized)) {
    return { label: "giá tăng dần", sort: { price: 1 } };
  }
  if (/(dat nhat|gia cao nhat|gia giam dan)/.test(normalized)) {
    return { label: "giá giảm dần", sort: { price: -1 } };
  }
  if (/(danh gia cao|rating cao|nhieu sao|ban chay)/.test(normalized)) {
    return { label: "đánh giá cao", sort: { rating: -1, numReviews: -1 } };
  }
  if (/(moi nhat|newest)/.test(normalized)) {
    return { label: "mới nhất", sort: { createdAt: -1 } };
  }
  if (/(cu nhat|oldest)/.test(normalized)) {
    return { label: "cũ nhất", sort: { createdAt: 1 } };
  }

  return null;
};

const extractStockFilter = (message) => {
  const normalized = normalizeVietnamese(message);

  if (/(het hang|khong con hang|out of stock)/.test(normalized)) return false;
  if (/(con hang|san co|available)/.test(normalized)) return true;

  return null;
};

const extractAuthorFilter = (message) => {
  const explicitMatch = message.match(
    /(?:tác giả|tac gia|author)\s*[:\-]?\s*([^,.;\n]+)/i,
  );
  if (explicitMatch) return cleanCapturedText(explicitMatch[1]);

  const byMatch = message.match(/(?:của|cua)\s+([^,.;\n]+)/i);
  if (byMatch) {
    const candidate = cleanCapturedText(byMatch[1]);
    if (candidate && candidate.split(/\s+/).length >= 2) return candidate;
  }

  return null;
};

const extractTitleFilter = (message) => {
  const titleMatch = message.match(
    /(?:tên sách|ten sach|title)\s*[:\-]?\s*["“]?([^"”\n,.;]+)["”]?/i,
  );
  if (titleMatch) return cleanCapturedText(titleMatch[1]);

  const quoted = message.match(/["“]([^"”\n]{2,80})["”]/);
  if (quoted) return cleanCapturedText(quoted[1]);

  return null;
};

const extractKeywordFilter = (message) => {
  const keywordMatch = message.match(
    /(?:từ khóa|tu khoa|keyword|chủ đề|chu de|về)\s*[:\-]?\s*([^,.;\n]+)/i,
  );
  if (!keywordMatch) return null;

  return cleanCapturedText(keywordMatch[1]);
};

const extractLimit = (message) => {
  const match = String(message || "").match(
    /(?:top|lay|lấy|hien|hiển thị|show)\s*(\d{1,2})/i,
  );
  if (!match) return DEFAULT_LIMIT;

  const limit = Number.parseInt(match[1], 10);
  if (!Number.isFinite(limit) || limit <= 0) return DEFAULT_LIMIT;
  return Math.min(limit, 20);
};

const buildRangeQuery = (range) => {
  if (!range) return null;

  const query = {};
  if (Number.isFinite(range.min)) query.$gte = range.min;
  if (Number.isFinite(range.max)) query.$lte = range.max;

  return Object.keys(query).length > 0 ? query : null;
};

const extractSearchCriteria = (message) => ({
  category: extractCategoryFilter(message),
  price: extractPriceFilter(message),
  rating: extractRatingFilter(message),
  stock: extractStockFilter(message),
  sort: extractSortOption(message),
  author: extractAuthorFilter(message),
  title: extractTitleFilter(message),
  keyword: extractKeywordFilter(message),
  limit: extractLimit(message),
});

const hasExplicitCriteria = (criteria) =>
  Boolean(
    criteria.category ||
    criteria.price ||
    criteria.rating ||
    criteria.sort ||
    criteria.author ||
    criteria.title ||
    criteria.keyword ||
    criteria.stock !== null,
  );

const buildBookQueryFromCriteria = (criteria) => {
  const query = {};

  if (criteria.category) query.category = criteria.category;

  const priceQuery = buildRangeQuery(criteria.price);
  if (priceQuery) query.price = priceQuery;

  const ratingQuery = buildRangeQuery(criteria.rating);
  if (ratingQuery) query.rating = ratingQuery;

  if (criteria.stock === true) query.inStock = true;
  else if (criteria.stock === false) query.inStock = false;
  else query.inStock = true;

  if (criteria.author)
    query.author = { $regex: escapeRegex(criteria.author), $options: "i" };
  if (criteria.title)
    query.title = { $regex: escapeRegex(criteria.title), $options: "i" };

  if (criteria.keyword) {
    const keywordRegex = {
      $regex: escapeRegex(criteria.keyword),
      $options: "i",
    };
    query.$or = [
      { title: keywordRegex },
      { author: keywordRegex },
      { category: keywordRegex },
      { description: keywordRegex },
    ];
  }

  return query;
};

const formatCriteriaHint = (criteria) => {
  const hints = [];
  const currency = (value) => new Intl.NumberFormat("vi-VN").format(value);

  if (criteria.category) hints.push(`danh mục ${criteria.category}`);

  if (criteria.price?.min !== undefined && criteria.price?.max !== undefined) {
    hints.push(
      `giá ${currency(criteria.price.min)}đ - ${currency(criteria.price.max)}đ`,
    );
  } else if (criteria.price?.max !== undefined) {
    hints.push(`giá dưới ${currency(criteria.price.max)}đ`);
  } else if (criteria.price?.min !== undefined) {
    hints.push(`giá trên ${currency(criteria.price.min)}đ`);
  }

  if (
    criteria.rating?.min !== undefined &&
    criteria.rating?.max !== undefined
  ) {
    hints.push(`đánh giá ${criteria.rating.min} - ${criteria.rating.max} sao`);
  } else if (criteria.rating?.min !== undefined) {
    hints.push(`đánh giá từ ${criteria.rating.min} sao`);
  }

  if (criteria.author) hints.push(`tác giả chứa "${criteria.author}"`);
  if (criteria.title) hints.push(`tên sách chứa "${criteria.title}"`);
  if (criteria.keyword) hints.push(`từ khóa "${criteria.keyword}"`);
  if (criteria.stock === true) hints.push("còn hàng");
  if (criteria.stock === false) hints.push("hết hàng");
  if (criteria.sort?.label) hints.push(`sắp xếp ${criteria.sort.label}`);

  return hints.length > 0 ? `🔎 Tôi đã lọc theo: ${hints.join(", ")}.` : "";
};

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
        error: "Vui lòng nhập tin nhắn",
      });
    }

    const prompt = message.trim();

    // Step 1: Phân tích input bằng AI Engine + parse criteria
    const analysis = analyzeAdvanced(prompt);
    const criteria = extractSearchCriteria(prompt);
    const criteriaQuery = buildBookQueryFromCriteria(criteria);
    const isCriteriaSearch = hasExplicitCriteria(criteria);

    // Step 2: Generate AI response text
    let aiMessage = generateAIResponse(analysis);

    // Step 3: Query sách theo kết quả AI
    let books;
    const { bestCategory, confidence } = analysis;

    if (isCriteriaSearch) {
      const sort = criteria.sort?.sort || { rating: -1, numReviews: -1 };

      books = await Book.find(criteriaQuery)
        .sort(sort)
        .limit(criteria.limit)
        .select(
          "title author price originalPrice image rating numReviews category inStock stockQuantity",
        );

      if (books.length === 0 && criteria.stock === null && !criteria.category) {
        books = await Book.find({
          ...criteriaQuery,
          inStock: { $in: [true, false] },
        })
          .sort(sort)
          .limit(criteria.limit)
          .select(
            "title author price originalPrice image rating numReviews category inStock stockQuantity",
          );
      }
    } else if (confidence === "low") {
      // Confidence thấp → trả sách phổ biến nhất
      books = await Book.find({ inStock: true })
        .sort({ rating: -1, numReviews: -1 })
        .limit(8)
        .select(
          "title author price originalPrice image rating numReviews category inStock stockQuantity",
        );
    } else {
      // Confidence cao/medium → lọc theo category AI dự đoán
      books = await Book.find({
        category: bestCategory,
        inStock: true,
      })
        .sort({ rating: -1 })
        .limit(8)
        .select(
          "title author price originalPrice image rating numReviews category inStock stockQuantity",
        );

      // Nếu category không đủ sách → lấy thêm từ category xếp hạng 2
      if (books.length < 4 && analysis.rankedCategories.length > 1) {
        const fallbackCategory = analysis.rankedCategories[1][0];
        const extraBooks = await Book.find({
          category: fallbackCategory,
          inStock: true,
          _id: { $nin: books.map((b) => b._id) },
        })
          .sort({ rating: -1 })
          .limit(8 - books.length)
          .select(
            "title author price originalPrice image rating numReviews category inStock stockQuantity",
          );

        books = [...books, ...extraBooks];
      }
    }

    // Fallback nếu AI theo category không ra kết quả
    if (books.length === 0 && !isCriteriaSearch) {
      books = await Book.find({
        inStock: true,
      })
        .sort({ rating: -1, numReviews: -1 })
        .limit(8)
        .select(
          "title author price originalPrice image rating numReviews category inStock stockQuantity",
        );
    }

    const criteriaHint = formatCriteriaHint(criteria);
    if (criteriaHint) {
      aiMessage = `${aiMessage}\n\n${criteriaHint}`;
    }

    // Step 4: Trả response
    res.json({
      success: true,
      aiMessage,
      analysis: {
        bestCategory,
        confidence,
        topCategories: analysis.rankedCategories
          .slice(0, 3)
          .map(([cat, score]) => ({
            category: cat,
            score: parseFloat(score.toFixed(4)),
          })),
        inputTokens: analysis.inputTokens,
      },
      filters: {
        ...criteria,
      },
      books,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      success: false,
      error: "AI đang bận, vui lòng thử lại sau!",
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

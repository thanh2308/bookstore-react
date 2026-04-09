/**
 * 🔢 TF-IDF Engine + Cosine Similarity
 * Đây là core của Fake AI Level 4
 */

// ───────────────────────────────────────────────
// 0. Vietnamese Stopwords – từ không mang nghĩa phân loại
// ───────────────────────────────────────────────
const STOPWORDS = new Set([
    'toi', 'ban', 'minh', 'chung', 'ho', 'no',
    'muon', 'can', 'hay', 'nen', 'da', 'dang', 'se', 'duoc',
    'va', 'hoac', 'nhung', 'ma', 'vi', 'de', 'trong', 'tren', 'duoi',
    'mot', 'cac', 'nhung', 'nhieu', 'it',
    'hoc', 'biet', 'tim', 'xem', 'doc', 'tim', 'goi', 'the',
    'cach', 'nhu', 'gi', 'nao', 'khi', 'deu', 'cung', 'chi',
    'rat', 'qua', 'lam', 'nhat', 'hon', 'nua', 'them', 'khac',
    'the', 'nay', 'do', 'ay', 'vay', 'biet', 'hieu',
    'sach', 'cuon', 'quyen', 'tap'
]);

// ───────────────────────────────────────────────
// 1. Normalize: bỏ dấu, lowercase, trim
// ───────────────────────────────────────────────
export const normalize = (text) =>
    text
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")   // bỏ dấu tiếng Việt
        .replace(/[^a-z0-9\s]/g, " ")       // bỏ ký tự đặc biệt
        .replace(/\s+/g, " ")               // chuẩn hóa khoảng trắng
        .trim();

// ───────────────────────────────────────────────
// 2. Tokenize: tách từ và lọc stopwords
// ───────────────────────────────────────────────
export const tokenize = (text) =>
    normalize(text)
        .split(" ")
        .filter(w => w.length > 1 && !STOPWORDS.has(w));   // bỏ từ ngắn + stopwords

// ───────────────────────────────────────────────
// 3. Synonym expansion
// ───────────────────────────────────────────────
export const expandSynonyms = (text, synonymMap) => {
    let expanded = text.toLowerCase();
    for (const [orig, replacement] of Object.entries(synonymMap)) {
        const regex = new RegExp(normalize(orig), "gi");
        expanded = expanded.replace(regex, " " + normalize(replacement) + " ");
    }
    return expanded;
};

// ───────────────────────────────────────────────
// 4. TF – Term Frequency
// ───────────────────────────────────────────────
const tf = (word, docWords) => {
    const count = docWords.filter(w => w === word).length;
    return count / docWords.length;
};

// ───────────────────────────────────────────────
// 5. IDF – Inverse Document Frequency
// ───────────────────────────────────────────────
const idf = (word, allDocs) => {
    const docsContaining = allDocs.filter(doc => doc.includes(word)).length;
    return Math.log((allDocs.length + 1) / (1 + docsContaining)) + 1;
};

// ───────────────────────────────────────────────
// 6. Build TF-IDF vector
// ───────────────────────────────────────────────
export const buildVector = (words, vocab, allDocs) => {
    return vocab.map(term => {
        if (!words.includes(term)) return 0;
        return tf(term, words) * idf(term, allDocs);
    });
};

// ───────────────────────────────────────────────
// 7. Cosine Similarity
// ───────────────────────────────────────────────
export const cosineSimilarity = (vecA, vecB) => {
    const dot = vecA.reduce((sum, val, i) => sum + val * (vecB[i] || 0), 0);
    const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
};

// ───────────────────────────────────────────────
// 8. Simple keyword bonus (Hybrid: TF-IDF + Keyword)
// ───────────────────────────────────────────────
export const keywordBonus = (inputWords, categoryWords) => {
    const matches = inputWords.filter(w => categoryWords.includes(w)).length;
    return matches * 0.05; // mỗi match cộng 0.05 điểm bonus
};

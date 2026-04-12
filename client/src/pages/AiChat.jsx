import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { addToCart } from "../redux/cartSlice";
import { useToast } from "../components/Toast";
import "./AiChat.css";

// ─── Quick prompts để inspire user ───────────────
const QUICK_PROMPTS = [
  "Sách khoa học dưới 100000, trên 4 sao",
  "Top 5 sách kinh tế của tác giả Robert, giá dưới 200k",
  "Tôi đang bị stress và muốn cải thiện bản thân",
  "Sách hay về đầu tư tài chính",
  "Truyện lãng mạn tình cảm",
  "Sách khoa học công nghệ AI",
  "Sách cho trẻ em học tốt",
  "Văn học Việt Nam hay nhất",
];

// ─── Parse markdown-like bold **text** ───────────
const parseMarkdown = (text) => {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
};

// ─── AI Response Message Component ───────────────
const AIMessage = ({ content, isTyping }) => (
  <div className="message ai">
    <div className="message-avatar">🤖</div>
    <div className="message-bubble">
      {isTyping ? (
        <div className="typing-indicator">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      ) : (
        <span dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
      )}
    </div>
  </div>
);

// ─── User Message Component ───────────────────────
const UserMessage = ({ content }) => (
  <div className="message user">
    <div className="message-avatar">👤</div>
    <div className="message-bubble">{content}</div>
  </div>
);

// ─── Analysis Panel Component ─────────────────────
const AnalysisPanel = ({ analysis }) => {
  const maxScore = Math.max(
    ...analysis.topCategories.map((c) => c.score),
    0.001,
  );

  return (
    <div className="ai-analysis-panel">
      <div className="panel-header">
        <span>🔬</span>
        <span>Phân tích TF-IDF Engine</span>
        <span className={`confidence-badge ${analysis.confidence}`}>
          {analysis.confidence === "high"
            ? "🎯 Cao"
            : analysis.confidence === "medium"
              ? "🤔 Trung bình"
              : "❓ Thấp"}
        </span>
      </div>
      <div className="panel-body">
        {/* Score bars */}
        <div className="category-scores">
          {analysis.topCategories.map((cat, i) => (
            <div className="score-row" key={cat.category}>
              <div className="score-label">
                <span>
                  {i === 0 ? "🏆" : i === 1 ? "🥈" : "🥉"} {cat.category}
                </span>
                <span className="score-pct">
                  {(cat.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="score-bar-track">
                <div
                  className={`score-bar-fill ${i === 0 ? "top" : ""}`}
                  style={{ width: `${(cat.score / maxScore) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Tokens */}
        {analysis.inputTokens?.length > 0 && (
          <>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                marginBottom: "0.5rem",
                fontWeight: 600,
              }}
            >
              🔤 Từ khóa được nhận diện:
            </p>
            <div className="token-chips">
              {analysis.inputTokens.slice(0, 12).map((token, i) => (
                <span className="token-chip" key={i}>
                  {token}
                </span>
              ))}
              {analysis.inputTokens.length > 12 && (
                <span className="token-chip">
                  +{analysis.inputTokens.length - 12}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Book Results Component ───────────────────────
const BookResults = ({ books, category, onAddToCart }) => {
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

  return (
    <div className="ai-books-section">
      <div className="books-section-header">
        <div className="books-section-title">
          <span>📚</span>
          <span>Gợi ý cho bạn {category ? `– ${category}` : ""}</span>
        </div>
        <span className="books-count-badge">{books.length} cuốn</span>
      </div>
      <div className="ai-books-grid">
        {books.map((book) => {
          const bookId = book._id || book.id;
          const isOutOfStock = book.inStock === false;

          return (
            <div className="ai-book-card" key={bookId}>
              <Link to={`/book/${bookId}`} className="ai-book-link">
                <div className="ai-book-img-wrap">
                  <img
                    src={
                      book.image?.startsWith("http")
                        ? book.image
                        : `http://localhost:5000${book.image}`
                    }
                    alt={book.title}
                    onError={(e) => {
                      e.target.src = `https://placehold.co/200x280/6366f1/white?text=${encodeURIComponent(book.title?.slice(0, 10) || "Book")}`;
                    }}
                  />
                </div>
                <div className="ai-book-info">
                  <div className="ai-book-cat">{book.category}</div>
                  <div className="ai-book-title">{book.title}</div>
                  <div className="ai-book-author">{book.author}</div>
                  <div className="ai-book-footer">
                    <span className="ai-book-price">
                      {formatPrice(book.price)}
                    </span>
                    <span className="ai-book-rating">
                      ⭐ {book.rating?.toFixed(1) || "–"}
                    </span>
                  </div>
                </div>
              </Link>

              <button
                className="ai-add-cart-btn"
                onClick={() => onAddToCart(book)}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? "Hết hàng" : "🛒 Thêm vào giỏ"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main AiChat Page ─────────────────────────────
const AiChat = () => {
  const dispatch = useDispatch();
  const { success, warning } = useToast();

  const [messages, setMessages] = useState([
    {
      type: "ai",
      content:
        "👋 Xin chào! Tôi là **BookAI** – trợ lý gợi ý sách thông minh của bạn!\n\nHãy mô tả sở thích, tâm trạng hoặc chủ đề bạn muốn đọc – tôi sẽ dùng **TF-IDF** để phân tích và gợi ý sách phù hợp nhất! 📚",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [lastBooks, setLastBooks] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || input).trim();
      if (!trimmed || isLoading) return;

      // Add user message
      setMessages((prev) => [...prev, { type: "user", content: trimmed }]);
      setInput("");
      setIsLoading(true);
      setLastAnalysis(null);
      setLastBooks(null);

      try {
        const { data } = await axios.post("http://localhost:5000/api/ai/chat", {
          message: trimmed,
        });

        if (data.success) {
          // Add AI response
          setMessages((prev) => [
            ...prev,
            {
              type: "ai",
              content: data.aiMessage,
            },
          ]);
          setLastAnalysis(data.analysis);
          setLastBooks(data.books);
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            content:
              "😅 Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại!",
          },
        ]);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [input, isLoading],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
    sendMessage(prompt);
  };

  const handleAddToCart = useCallback(
    (book) => {
      const normalizedStock =
        Number.isFinite(book.stockQuantity) && book.stockQuantity > 0
          ? book.stockQuantity
          : book.inStock === false
            ? 0
            : 9999;

      if (normalizedStock === 0 || book.inStock === false) {
        warning(`"${book.title}" hiện đã hết hàng`);
        return;
      }

      dispatch(
        addToCart({
          ...book,
          _id: book._id || book.id,
          id: book._id || book.id,
          stockQuantity: normalizedStock,
          quantity: 1,
        }),
      );

      success(`Đã thêm "${book.title}" vào giỏ hàng!`);
    },
    [dispatch, success, warning],
  );

  return (
    <div className="ai-page">
      {/* ── Hero ── */}
      <div className="ai-hero">
        <div className="ai-hero-badge">✨ Fake AI Level 4 – TF-IDF Engine</div>
        <h1>🧠 BookAI Assistant</h1>
        <p>Mô tả sở thích của bạn – AI sẽ phân tích và gợi ý sách phù hợp!</p>

        <div className="ai-quick-prompts">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              className="quick-chip"
              onClick={() => handleQuickPrompt(prompt)}
              disabled={isLoading}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main container ── */}
      <div className="ai-container">
        {/* Chat Window */}
        <div className="chat-window">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="chat-welcome-icon">🤖</div>
                <h3>BookAI đang chờ bạn!</h3>
                <p>Hãy nhập tin nhắn hoặc chọn gợi ý nhanh bên trên</p>
              </div>
            ) : (
              messages.map((msg, i) =>
                msg.type === "ai" ? (
                  <AIMessage key={i} content={msg.content} />
                ) : (
                  <UserMessage key={i} content={msg.content} />
                ),
              )
            )}

            {/* Typing indicator */}
            {isLoading && <AIMessage isTyping />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="chat-input-bar">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Nhập tiêu chí tìm sách theo nhu cầu c"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
            />
            <button
              className="chat-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              aria-label="Gửi tin nhắn"
            >
              {isLoading ? "⏳" : "➤"}
            </button>
          </div>
        </div>

        {/* Analysis Panel – hiện sau khi có kết quả */}
        {lastAnalysis && <AnalysisPanel analysis={lastAnalysis} />}

        {/* Book Results */}
        {lastBooks && lastBooks.length > 0 && (
          <BookResults
            books={lastBooks}
            category={lastAnalysis?.bestCategory}
            onAddToCart={handleAddToCart}
          />
        )}
      </div>
    </div>
  );
};

export default AiChat;

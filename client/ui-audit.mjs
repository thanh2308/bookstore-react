import { chromium } from "playwright";
import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";

const clientDir = process.cwd();
const baseURL = "http://127.0.0.1:5173";

const svgCover = (title, fill = "#256d5a") => {
  const escapedTitle = title.replace(/[&<>"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  })[c]);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="520" viewBox="0 0 360 520">
    <rect width="360" height="520" rx="18" fill="${fill}"/>
    <rect x="34" y="42" width="292" height="436" rx="12" fill="#fffaf0" opacity=".94"/>
    <rect x="58" y="82" width="244" height="8" fill="${fill}" opacity=".35"/>
    <text x="180" y="246" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#173f36">${escapedTitle}</text>
    <text x="180" y="292" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#6f3f26">BookStore</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const books = [
  { _id: "1", title: "Nghệ Thuật Tư Duy Rành Mạch", author: "Rolf Dobelli", category: "Kỹ năng sống", image: svgCover("Tu duy", "#256d5a"), price: 86000, originalPrice: 125000, rating: 4.8, numReviews: 128, inStock: true, stockQuantity: 12 },
  { _id: "2", title: "Dữ Liệu Lớn Và Chuyển Đổi Số Trong Kinh Doanh", author: "Bernard Marr", category: "Kinh tế", image: svgCover("Data", "#2f6f9f"), price: 152000, originalPrice: 189000, rating: 4.6, numReviews: 72, inStock: true, stockQuantity: 5 },
  { _id: "3", title: "Một Cuốn Sách Có Tựa Đề Rất Dài Để Kiểm Tra Việc Cắt Dòng Trong Card", author: "Tác giả kiểm thử giao diện", category: "Văn học Việt Nam", image: svgCover("Long title", "#9f5f37"), price: 99000, originalPrice: 0, rating: 4.2, numReviews: 9, inStock: false, stockQuantity: 0 },
  { _id: "4", title: "AI Cho Người Mới Bắt Đầu", author: "Melanie Mitchell", category: "Khoa học", image: svgCover("AI", "#17473b"), price: 134000, originalPrice: 160000, rating: 4.9, numReviews: 44, inStock: true, stockQuantity: 20 },
];

const waitForServer = (url, timeoutMs = 30000) =>
  new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      http.get(url, (res) => {
        res.resume();
        resolve();
      }).on("error", () => {
        if (Date.now() - started > timeoutMs) reject(new Error(`Timed out waiting for ${url}`));
        else setTimeout(tick, 500);
      });
    };
    tick();
  });

const server = spawn("npm.cmd", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"], {
  cwd: clientDir,
  shell: true,
  stdio: "pipe",
});

try {
  await waitForServer(baseURL);
  const browser = await chromium.launch();
  const results = [];

  for (const target of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport: { width: target.width, height: target.height } });
    await page.addInitScript(() => localStorage.setItem("promoBannerDismissed", "true"));
    await page.route("**/api/books**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ books, currentPage: 1, totalPages: 1, total: books.length }),
      });
    });

    await page.goto(baseURL, { waitUntil: "networkidle" });
    await page.locator(".book-card").first().waitFor({ timeout: 10000 });

    const metrics = await page.evaluate(() => {
      const viewportWidth = window.innerWidth;
      const doc = document.documentElement;
      const cards = Array.from(document.querySelectorAll(".book-card")).slice(0, 8);
      const boxes = cards.map((card) => {
        const rect = card.getBoundingClientRect();
        const title = card.querySelector(".book-title");
        const button = card.querySelector(".add-to-cart-btn");
        const image = card.querySelector(".book-image");
        const price = card.querySelector(".current-price");
        return {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          titleLinesOk: title ? title.getBoundingClientRect().height <= 52 : false,
          buttonTouchOk: button ? button.getBoundingClientRect().height >= 40 : false,
          buttonTextOk: button ? button.scrollWidth <= button.clientWidth + 1 : false,
          imageVisible: image ? image.getBoundingClientRect().width > 80 && image.getBoundingClientRect().height > 140 : false,
          priceVisible: price ? price.getBoundingClientRect().width > 40 : false,
        };
      });

      const overlaps = [];
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const a = boxes[i];
          const b = boxes[j];
          if (!(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top)) overlaps.push([i, j]);
        }
      }

      return {
        viewportWidth,
        horizontalOverflow: doc.scrollWidth - viewportWidth,
        cardCount: cards.length,
        boxes,
        overlaps,
        cardHeightSpread: boxes.length ? Math.max(...boxes.map((b) => b.height)) - Math.min(...boxes.map((b) => b.height)) : 999,
      };
    });

    await page.screenshot({ path: path.join("C:\\tmp", `bookstore-${target.name}-audit.png`), fullPage: true });
    results.push({ target: target.name, ...metrics });
    await page.close();
  }

  await browser.close();

  const failures = [];
  for (const result of results) {
    if (result.horizontalOverflow > 2) failures.push(`${result.target}: horizontal overflow ${result.horizontalOverflow}px`);
    if (result.cardCount < 4) failures.push(`${result.target}: expected cards to render`);
    if (result.overlaps.length) failures.push(`${result.target}: card overlap ${JSON.stringify(result.overlaps)}`);
    if (result.cardHeightSpread > 90) failures.push(`${result.target}: card height spread ${Math.round(result.cardHeightSpread)}px`);
    result.boxes.forEach((box, index) => {
      if (!box.titleLinesOk) failures.push(`${result.target}: card ${index + 1} title too tall`);
      if (!box.buttonTouchOk) failures.push(`${result.target}: card ${index + 1} button touch target too small`);
      if (!box.buttonTextOk) failures.push(`${result.target}: card ${index + 1} button text overflows`);
      if (!box.imageVisible) failures.push(`${result.target}: card ${index + 1} image not visible enough`);
      if (!box.priceVisible) failures.push(`${result.target}: card ${index + 1} price not visible`);
    });
  }

  console.log(JSON.stringify({ results, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  server.kill();
}

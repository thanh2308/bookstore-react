export const getReviewCount = (book) => {
  const fromNumReviews = Number(book?.numReviews) || 0;
  const fromArrayLength = Array.isArray(book?.reviews)
    ? book.reviews.length
    : 0;
  return Math.max(fromNumReviews, fromArrayLength);
};

export const getDisplayRating = (book) => {
  const value = Number(book?.rating);
  return Number.isFinite(value) ? value.toFixed(1) : "N/A";
};

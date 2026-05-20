export const getReviewCount = (book, options = {}) => {
  const { source = "auto" } = options;
  const fromNumReviews = Number(book?.numReviews) || 0;
  const fromArrayLength = Array.isArray(book?.reviews)
    ? book.reviews.length
    : 0;

  if (source === "array") {
    return fromArrayLength;
  }

  if (source === "numReviews") {
    return fromNumReviews;
  }

  // Auto mode: prefer review list if present to keep count consistent with visible reviews.
  if (Array.isArray(book?.reviews)) {
    return fromArrayLength;
  }

  return fromNumReviews;
};

export const getDisplayRating = (book, options = {}) => {
  const reviewCount = getReviewCount(book, options);
  if (reviewCount <= 0) {
    return "N/A";
  }

  const value = Number(book?.rating);
  return Number.isFinite(value) ? value.toFixed(1) : "N/A";
};

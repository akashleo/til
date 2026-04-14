import removeMarkdown from "remove-markdown";

export function slugify(text: string): string {
  const baseSlug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50); // Limit length

  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${timestamp}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Extract a clean preview from Markdown content.
 * - Gets the first paragraph (text before first \n\n)
 * - Strips all Markdown formatting
 * - Truncates to maxWords (default 25)
 * - Adds "..." if truncated
 */
export function getPreviewText(content: string, maxWords: number = 25): string {
  if (!content || content.trim().length === 0) {
    return "";
  }

  // Extract first paragraph (text before first double newline)
  const firstParagraph = content.split("\n\n")[0] || "";

  // Strip Markdown formatting
  const plainText = removeMarkdown(firstParagraph, {
    stripListLeaders: true,
    gfm: true,
    useImgAltText: true,
  });

  // Clean up extra whitespace
  const cleanedText = plainText.replace(/\s+/g, " ").trim();

  // Split into words and limit
  const words = cleanedText.split(" ");
  if (words.length <= maxWords) {
    return cleanedText;
  }

  // Truncate and add ellipsis
  const truncated = words.slice(0, maxWords).join(" ");
  return truncated + "...";
}

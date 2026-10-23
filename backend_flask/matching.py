def evaluate_match(lost, found):
    reasons = []
    category_score = 100 if lost.category == found.category else 20
    if category_score == 100:
        reasons.append(f"Matching category: {lost.category}")

    # Text token overlap
    lost_words = set(f"{lost.title} {lost.description}".lower().split())
    found_words = set(f"{found.title} {found.description}".lower().split())
    common = lost_words.intersection(found_words)
    text_score = min(100, len(common) * 15)
    if text_score > 30:
        reasons.append("Shared distinctive keywords in title and description")

    brand_color_score = 0
    if lost.brand and found.brand and lost.brand.lower() == found.brand.lower():
        brand_color_score += 50
        reasons.append(f"Matching brand: {lost.brand}")
    if lost.color and found.color and lost.color.lower() == found.color.lower():
        brand_color_score += 50
        reasons.append(f"Matching color: {lost.color}")

    overall = int(category_score * 0.35 + text_score * 0.35 + brand_color_score * 0.3)
    confidence = 'high' if overall >= 75 else ('medium' if overall >= 50 else 'low')

    return {
        'overallScore': overall,
        'confidenceLevel': confidence,
        'reasons': reasons
    }

# valuation.py
from typing import Dict, Any

def valuation_heuristic(fields: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate property valuation based on fields.
    
    Args:
        fields: Dictionary containing property information
        
    Returns:
        Dictionary with est_per_m2, est_total, and breakdown
    """
    
    # Base price per m2 depending on property type
    base_per_m2 = 20000000  # VNĐ/m2 default fallback (20M VND/m2)
    
    # Adjust by property type
    if fields.get("category") == "land":
        base_per_m2 *= 1.05
    elif fields.get("category") == "house":
        base_per_m2 *= 1.02

    # If user provided total price, blend with user data
    if fields.get("price_est_input") and fields.get("size"):
        try:
            user_per_m2 = fields["price_est_input"] / fields["size"]
            # Blend: 40% model, 60% user input
            base_per_m2 = (base_per_m2 * 0.4) + (user_per_m2 * 0.6)
        except (TypeError, ZeroDivisionError):
            pass

    # Adjustment factor starts at 1.0
    adj = 1.0
    
    # Condition adjustment
    condition = (fields.get("condition") or "").lower()
    if "mới" in condition or "new" in condition:
        adj += 0.08
    elif "tốt" in condition or "good" in condition:
        adj += 0.04
    elif "khá" in condition or "fair" in condition:
        adj += 0.00
    elif "cũ" in condition or "old" in condition:
        adj -= 0.12

    # Age penalty (building age)
    if fields.get("year_built"):
        try:
            age = 2025 - int(fields["year_built"])
            if age > 30:
                adj -= 0.10
            elif age > 20:
                adj -= 0.07
            elif age > 10:
                adj -= 0.04
            elif age < 2:
                adj += 0.05  # Brand new bonus
        except (TypeError, ValueError):
            pass

    # Area effect (small apartments have premium, large have discount)
    if fields.get("size"):
        try:
            a = float(fields["size"])
            if a < 40:
                adj += 0.05  # Small premium
            elif a > 200:
                adj -= 0.06  # Large discount
        except (TypeError, ValueError):
            pass

    # Location bonus (if city is Hanoi or HCMC)
    region = (fields.get("region") or "").lower()
    if "hà nội" in region or "hanoi" in region or "hcm" in region or "ho chi minh" in region or "saigon" in region:
        adj += 0.10

    # Calculate final valuation
    est_per_m2 = max(0, base_per_m2 * adj)
    est_total = est_per_m2 * (fields.get("size") or 0)

    # Return breakdown for transparency
    breakdown = {
        "base_per_m2": round(base_per_m2),
        "adj_factor": round(adj, 3),
        "components": {
            "category": fields.get("category", "unknown"),
            "condition_adj": condition or "unknown",
            "age_years": (2025 - fields.get("year_built")) if fields.get("year_built") else None,
            "size": fields.get("size"),
            "region": fields.get("region"),
            "location_bonus": 0.10 if "hà nội" in region or "hanoi" in region or "hcm" in region or "ho chi minh" in region or "saigon" in region else 0
        }
    }

    return {
        "est_per_m2": round(est_per_m2),
        "est_total": round(est_total),
        "breakdown": breakdown
    }


def estimate_valuation_from_data(property_data: dict) -> float:
    """
    Quick estimate valuation from property data.
    
    Args:
        property_data: Dictionary with property details
        
    Returns:
        Estimated total value in VND
    """
    result = valuation_heuristic(property_data)
    return result["est_total"]

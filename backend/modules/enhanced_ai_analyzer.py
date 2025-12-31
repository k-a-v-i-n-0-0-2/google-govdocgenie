# ==================== modules/enhanced_ai_analyzer.py ====================
# FINAL STABLE VERSION (NEW GOOGLE GENAI SDK) - FIXED

import json
from datetime import datetime
from config import Config
from modules.local_ai_model import SimpleLocalAIModel

# NEW Gemini SDK
import google.generativeai as genai

class EnhancedAIAnalyzer:
    def __init__(self):
        self.config = Config()
        self.local_model = SimpleLocalAIModel()

        self.gemini_model = None
        if self.config.GEMINI_API_KEY:
            try:
                genai.configure(api_key=self.config.GEMINI_API_KEY)
                # Use the latest stable Gemini model
                self.gemini_model = genai.GenerativeModel("models/gemini-2.5-flash")
                print("✅ Gemini initialized successfully (using gemini-2.5-flash)")
            except Exception as e:
                print(f"⚠️ Gemini init failed: {e}")
        else:
            print("⚠️ GEMINI_API_KEY not found. Gemini disabled.")


    # --------------------------------------------------
    # MAIN ANALYSIS PIPELINE
    # --------------------------------------------------
    def analyze_with_cross_check(self, extracted_data, validation_results, text_data):
        print("\n🔍 RUNNING COMPLIANCE ANALYSIS")

        # Step 1: Local AI
        local_result = self.local_model.predict(text_data, validation_results)

        # Step 2: Rule-based
        rule_result = self._rule_based_analysis(extracted_data, validation_results)

        # Step 3: Cross-check
        final_decision = self._cross_check_decisions(
            local_result["prediction"],
            rule_result["decision"],
            extracted_data,
            validation_results,
        )

        # Step 4: Confidence
        confidence = self._calculate_confidence(
            final_decision, extracted_data, validation_results
        )

        # Step 5: Reasons
        reasons = self._generate_detailed_reasons(
            final_decision, extracted_data, validation_results
        )

        # Step 6: Summary
        summary = self._generate_summary(final_decision, reasons)

        # Step 7: Gemini advisory (optional)
        gemini_verification = None
        if self.gemini_model:  # ✅ FIXED: Changed from self.gemini_client to self.gemini_model
            gemini_verification = self._gemini_verification(
                extracted_data, validation_results
            )

        result = {
            "success": True,
            "analysis": {
                "decision": final_decision,
                "confidence": confidence,
                "reasons": reasons,
                "summary": summary,
                "analysis_source": "local_ai_model",
                "timestamp": datetime.now().isoformat(),
            },
            "local_decision": local_result["prediction"],
            "rule_based_decision": rule_result["decision"],
        }

        if gemini_verification:
            result["analysis"]["gemini_verification"] = gemini_verification
            result["analysis"]["analysis_source"] = "cross_verified"

        return result

    # --------------------------------------------------
    # GEMINI VERIFICATION (ADVISORY ONLY)
    # --------------------------------------------------
    def _gemini_verification(self, extracted_data, validation_results):
        try:
            prompt = self._create_gemini_prompt(extracted_data, validation_results)
            response = self.gemini_model.generate_content(prompt)
            return self._parse_gemini_response(response.text)
        except Exception as e:
            print(f"⚠️ Gemini verification skipped: {e}")
            return None

    # --------------------------------------------------
    # GEMINI PROMPT
    # --------------------------------------------------
    def _create_gemini_prompt(self, extracted_data, validation_results):
        return f"""
You are a strict compliance assistant.

TASK:
Verify ONLY document format validity.
Do NOT assume anything.
Do NOT use external knowledge.

FORMAT RULES:
- GST: 15 characters
- PAN: 10 characters
- Udyam: UDYAM-XX-00-0000000

Return ONLY valid JSON.

EXTRACTED DATA:
{json.dumps(extracted_data, indent=2)}

VALIDATION RESULTS:
{json.dumps(validation_results, indent=2)}

JSON RESPONSE FORMAT:
{{
  "overall_verdict": "AGREES" | "DISAGREES" | "INCONCLUSIVE",
  "confidence": 0.0-1.0,
  "notes": "short explanation"
}}
"""

    # --------------------------------------------------
    # GEMINI RESPONSE PARSER
    # --------------------------------------------------
    def _parse_gemini_response(self, text):
        try:
            text = text.strip()
            if "```" in text:
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()
            return json.loads(text)
        except Exception:
            return {
                "overall_verdict": "INCONCLUSIVE",
                "confidence": 0.5,
                "notes": "Unable to parse Gemini response",
            }

    # --------------------------------------------------
    # RULE-BASED ANALYSIS
    # --------------------------------------------------
    def _rule_based_analysis(self, extracted_data, validation_results):
        valid_docs = 0

        for key in ["gst_number", "pan_number", "udyam_number"]:
            if extracted_data.get(key) and validation_results.get(key, {}).get(
                "valid", False
            ):
                valid_docs += 1

        has_signature = validation_results.get("signature", {}).get("found", False)
        name_ok = validation_results.get("name_consistency", {}).get(
            "consistent", True
        )

        if valid_docs == 3 and has_signature and name_ok:
            decision = "APPROVE"
        elif valid_docs >= 2:
            decision = "NEEDS MORE DOCUMENTS"
        else:
            decision = "REJECT"

        return {"decision": decision}

    # --------------------------------------------------
    # CROSS CHECK
    # --------------------------------------------------
    def _cross_check_decisions(
        self, local_decision, rule_decision, extracted_data, validation_results
    ):
        if local_decision == rule_decision:
            return local_decision

        score = self._calculate_evidence_score(extracted_data, validation_results)

        if score >= 80:
            return "APPROVE"
        elif score >= 60:
            return "NEEDS MORE DOCUMENTS"
        return "REJECT"

    # --------------------------------------------------
    # SCORING & CONFIDENCE
    # --------------------------------------------------
    def _calculate_evidence_score(self, extracted_data, validation_results):
        score = 0

        for key in ["gst_number", "pan_number", "udyam_number"]:
            if extracted_data.get(key):
                score += 10
            if validation_results.get(key, {}).get("valid", False):
                score += 10

        if validation_results.get("signature", {}).get("found", False):
            score += 20

        return min(score, 100)

    def _calculate_confidence(self, decision, extracted_data, validation_results):
        score = self._calculate_evidence_score(extracted_data, validation_results)
        return round(min(0.5 + score / 200, 0.99), 2)

    # --------------------------------------------------
    # OUTPUT TEXT
    # --------------------------------------------------
    def _generate_detailed_reasons(self, decision, extracted_data, validation_results):
        reasons = []

        for key, label in [
            ("gst_number", "GST"),
            ("pan_number", "PAN"),
            ("udyam_number", "Udyam"),
        ]:
            if not extracted_data.get(key):
                reasons.append(f"❌ {label} missing")
            elif not validation_results.get(key, {}).get("valid", False):
                reasons.append(f"❌ {label} invalid format")
            else:
                reasons.append(f"✅ {label} valid")

        if validation_results.get("signature", {}).get("found", False):
            reasons.append("✅ Signature present")
        else:
            reasons.append("❌ Signature missing")

        return reasons

    def _generate_summary(self, decision, reasons):
        fails = len([r for r in reasons if r.startswith("❌")])
        if decision == "APPROVE":
            return "✅ All compliance checks passed"
        elif decision == "NEEDS MORE DOCUMENTS":
            return f"⚠️ {fails} issues need correction"
        return f"❌ {fails} critical compliance failures"
"""
RoadDamagePipeline — orchestrates the real YOLOv8 analysis flow.

Pipeline steps (Milestone 3):
    1. Resolve + decode the input image (EXIF-corrected, original resolution).
    2. Run YOLOv8 detection (detector) → normalized boxes + labels.
    3. Classify severity + scores (severity).
    4. Estimate repair cost (cost_estimator).
    5. Generate repair recommendation (recommender).
    6. Draw + save the annotated image (annotator).
    7. Assemble the result dict — structurally identical to the mock
       ``AIService.analyze_image()`` output so the AIAnalysisService + API
       contract remain unchanged, plus new fields:
       ``annotated_image_url``, ``processing_time_ms``, ``mock: False``.

Scaffold only — full implementation lands in Milestone 3.
"""

from __future__ import annotations

from typing import Any, Dict


class RoadDamagePipeline:
    """Full real-inference pipeline producing a structured AI result."""

    def run(
        self,
        image_path: str,
        report_id: str | None = None,
        analysis_id: str | None = None,
    ) -> Dict[str, Any]:
        """
        Run the full analysis pipeline on an image.

        Args:
            image_path: Stored/static/absolute path to the image.
            report_id: Optional report identifier for traceability.
            analysis_id: Optional analysis identifier (used to name the annotated file).

        Returns:
            Structured result dict matching the AIResponse contract (mock=False).
        """
        raise NotImplementedError("Implemented in Milestone 3.")


# Module-level singleton for convenient imports.
pipeline = RoadDamagePipeline()


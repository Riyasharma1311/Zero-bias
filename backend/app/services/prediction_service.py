from typing import Dict, List, Optional, Tuple, Any
import pandas as pd
from datetime import datetime, timedelta
import logging
from pathlib import Path
from scipy import stats

from app.core.config import get_settings
from app.models.patient import Patient, VitalSigns, RiskAssessment

settings = get_settings()
logger = logging.getLogger(__name__)

# Configure model paths
MODEL_BASE_PATH = Path(settings.MODEL_PATH) if hasattr(settings, 'MODEL_PATH') else Path("models")
CURRENT_MODEL_VERSION = "v1.0.0"

# Trend analysis settings
TREND_WINDOW_DAYS = 90  # Analyze trends over 90 days
SIGNIFICANT_CHANGE = 0.1  # 10% change is considered significant


class PredictionService:
    """Service for heart health risk predictions."""
    
    @staticmethod
    def _calculate_bmi(height: float, weight: float) -> float:
        """Calculate BMI from height (cm) and weight (kg)."""
        height_m = height / 100
        return weight / (height_m * height_m)
    
    @staticmethod
    def _get_latest_vitals(vitals: List[VitalSigns]) -> Optional[VitalSigns]:
        """Get the most recent vital signs."""
        if not vitals:
            return None
        return max(vitals, key=lambda v: v.measured_at)
    
    @staticmethod
    def _calculate_risk_factors(
        patient: Patient,
        latest_vitals: Optional[VitalSigns]
    ) -> Dict[str, float]:
        """Calculate risk factors from patient data."""
        factors = {}
        
        # Age calculation
        if patient.date_of_birth:
            age = (datetime.utcnow() - patient.date_of_birth).days / 365.25
            factors["age"] = age
        
        # BMI calculation
        if patient.height and patient.weight:
            factors["bmi"] = PredictionService._calculate_bmi(
                patient.height, patient.weight
            )
        
        # Vital signs
        if latest_vitals:
            if latest_vitals.heart_rate:
                factors["heart_rate"] = latest_vitals.heart_rate
            if latest_vitals.blood_pressure_systolic:
                factors["systolic_bp"] = latest_vitals.blood_pressure_systolic
            if latest_vitals.blood_pressure_diastolic:
                factors["diastolic_bp"] = latest_vitals.blood_pressure_diastolic
            if latest_vitals.oxygen_saturation:
                factors["oxygen_saturation"] = latest_vitals.oxygen_saturation
        
        # Medical conditions (simplified for demo)
        conditions = patient.chronic_conditions.lower() if patient.chronic_conditions else ""
        factors["has_diabetes"] = "diabetes" in conditions
        factors["has_hypertension"] = "hypertension" in conditions
        factors["has_heart_disease"] = any(x in conditions for x in ["heart disease", "cardiovascular"])
        
        return factors
    
    @staticmethod
    def _calculate_confidence(factors: Dict[str, float]) -> float:
        """
        Calculate confidence score based on available data.
        More available factors = higher confidence.
        """
        # Define factor weights
        weights = {
            "age": 1.0,
            "bmi": 0.8,
            "heart_rate": 0.7,
            "systolic_bp": 0.9,
            "diastolic_bp": 0.9,
            "oxygen_saturation": 0.6,
            "has_diabetes": 0.5,
            "has_hypertension": 0.5,
            "has_heart_disease": 0.5
        }
        
        # Calculate weighted confidence
        available_weight = sum(
            weights[factor] for factor in factors.keys()
            if factor in weights
        )
        max_weight = sum(weights.values())
        
        return min(available_weight / max_weight, 1.0)
    
    @staticmethod
    def _calculate_cardiovascular_age(
        actual_age: float,
        risk_score: float,
        factors: Dict[str, float]
    ) -> float:
        """
        Calculate cardiovascular age based on risk factors.
        Higher risk = older cardiovascular age.
        """
        # Base calculation (simplified for demo)
        cv_age = actual_age
        
        # Adjust for risk score
        cv_age += (risk_score / 100) * 10
        
        # Adjust for specific factors
        if factors.get("has_heart_disease"):
            cv_age += 5
        if factors.get("has_hypertension"):
            cv_age += 3
        if factors.get("has_diabetes"):
            cv_age += 3
        
        # BMI adjustment
        bmi = factors.get("bmi")
        if bmi:
            if bmi > 30:  # Obese
                cv_age += 4
            elif bmi > 25:  # Overweight
                cv_age += 2
        
        return cv_age
    
    @staticmethod
    def generate_recommendations(
        factors: Dict[str, float],
        risk_scores: Dict[str, float]
    ) -> List[str]:
        """Generate personalized health recommendations."""
        recommendations = []
        
        # High blood pressure recommendations
        if factors.get("systolic_bp", 0) > 140 or factors.get("diastolic_bp", 0) > 90:
            recommendations.extend([
                "Monitor your blood pressure regularly",
                "Consider reducing sodium intake",
                "Consult your doctor about blood pressure management"
            ])
        
        # BMI recommendations
        bmi = factors.get("bmi")
        if bmi:
            if bmi > 30:
                recommendations.append(
                    "Consider working with a healthcare provider on a weight management plan"
                )
            elif bmi > 25:
                recommendations.append(
                    "Consider lifestyle changes to achieve a healthy weight"
                )
        
        # Heart rate recommendations
        heart_rate = factors.get("heart_rate")
        if heart_rate:
            if heart_rate > 100:
                recommendations.append(
                    "Your heart rate is elevated. Consider stress reduction techniques"
                )
        
        # Risk-based recommendations
        if risk_scores.get("heart_attack_risk", 0) > 20:
            recommendations.extend([
                "Schedule regular check-ups with your cardiologist",
                "Consider discussing preventive medications with your doctor"
            ])
        
        # General recommendations
        recommendations.extend([
            "Maintain a heart-healthy diet rich in fruits, vegetables, and whole grains",
            "Aim for at least 150 minutes of moderate exercise per week",
            "Get adequate sleep (7-9 hours per night)",
            "Manage stress through relaxation techniques"
        ])
        
        return recommendations
    
    @classmethod
    async def predict_risk(cls, patient: Patient) -> Tuple[Dict[str, float], float, List[str]]:
        """
        Predict heart health risks for a patient.
        
        Args:
            patient: Patient model instance
            
        Returns:
            Tuple of (risk_scores, confidence_score, recommendations)
        """
        # Get latest vital signs
        latest_vitals = cls._get_latest_vitals(patient.vital_signs)
        
        # Calculate risk factors
        factors = cls._calculate_risk_factors(patient, latest_vitals)
        
        # Calculate base risk scores (simplified for demo)
        age = factors.get("age", 0)
        base_risk = min((age / 100) * 20, 20)  # Age-based baseline
        
        # Adjust for various factors
        risk_modifiers = 0
        
        # BMI impact
        bmi = factors.get("bmi")
        if bmi:
            if bmi > 30:  # Obese
                risk_modifiers += 10
            elif bmi > 25:  # Overweight
                risk_modifiers += 5
        
        # Blood pressure impact
        systolic = factors.get("systolic_bp")
        diastolic = factors.get("diastolic_bp")
        if systolic and diastolic:
            if systolic > 140 or diastolic > 90:
                risk_modifiers += 15
            elif systolic > 120 or diastolic > 80:
                risk_modifiers += 5
        
        # Medical conditions impact
        if factors.get("has_heart_disease"):
            risk_modifiers += 20
        if factors.get("has_hypertension"):
            risk_modifiers += 15
        if factors.get("has_diabetes"):
            risk_modifiers += 10
        
        # Calculate final risk scores
        heart_attack_risk = min(base_risk + risk_modifiers, 100)
        stroke_risk = min(base_risk + risk_modifiers * 0.8, 100)  # Slightly lower
        
        risk_scores = {
            "heart_attack_risk": heart_attack_risk,
            "stroke_risk": stroke_risk
        }
        
        # Calculate cardiovascular age
        risk_scores["cardiovascular_age"] = cls._calculate_cardiovascular_age(
            age, heart_attack_risk, factors
        )
        
        # Calculate confidence score
        confidence_score = cls._calculate_confidence(factors)
        
        # Generate recommendations
        recommendations = cls.generate_recommendations(factors, risk_scores)
        
        # Log prediction for auditing
        logger.info(
            "Risk prediction generated",
            extra={
                "patient_id": patient.id,
                "risk_scores": risk_scores,
                "confidence": confidence_score,
                "factors": factors,
                "model_version": CURRENT_MODEL_VERSION
            }
        )
        
        return risk_scores, confidence_score, recommendations 

    @staticmethod
    def _analyze_vital_signs_trend(
        vitals: List[VitalSigns],
        window_days: int = TREND_WINDOW_DAYS
    ) -> Dict[str, Any]:
        """
        Analyze trends in vital signs over time.
        
        Args:
            vitals: List of vital signs records
            window_days: Number of days to analyze
            
        Returns:
            Dictionary of trend analysis results
        """
        if not vitals:
            return {}
        
        # Convert to pandas DataFrame for analysis
        df = pd.DataFrame([{
            'measured_at': v.measured_at,
            'heart_rate': v.heart_rate,
            'systolic_bp': v.blood_pressure_systolic,
            'diastolic_bp': v.blood_pressure_diastolic,
            'oxygen_saturation': v.oxygen_saturation
        } for v in vitals])
        
        # Filter to window
        cutoff_date = datetime.utcnow() - timedelta(days=window_days)
        df = df[df['measured_at'] >= cutoff_date]
        
        if len(df) < 2:
            return {}
        
        trends = {}
        
        # Analyze each vital sign
        for column in ['heart_rate', 'systolic_bp', 'diastolic_bp', 'oxygen_saturation']:
            if df[column].notna().sum() < 2:
                continue
            
            # Calculate trend
            x = (df['measured_at'] - df['measured_at'].min()).dt.total_seconds()
            y = df[column].fillna(method='ffill')
            slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
            
            # Calculate percent change
            first_value = y.iloc[0]
            last_value = y.iloc[-1]
            percent_change = (last_value - first_value) / first_value
            
            # Determine trend direction
            if abs(percent_change) >= SIGNIFICANT_CHANGE:
                direction = "increasing" if percent_change > 0 else "decreasing"
            else:
                direction = "stable"
            
            trends[column] = {
                'direction': direction,
                'percent_change': percent_change * 100,
                'p_value': p_value,
                'is_significant': p_value < 0.05,
                'first_value': first_value,
                'last_value': last_value,
                'num_measurements': len(y)
            }
        
        return trends

    @staticmethod
    def _analyze_risk_trend(
        assessments: List[RiskAssessment],
        window_days: int = TREND_WINDOW_DAYS
    ) -> Dict[str, Any]:
        """
        Analyze trends in risk assessments over time.
        
        Args:
            assessments: List of risk assessment records
            window_days: Number of days to analyze
            
        Returns:
            Dictionary of trend analysis results
        """
        if not assessments:
            return {}
        
        # Convert to pandas DataFrame
        df = pd.DataFrame([{
            'assessed_at': a.assessed_at,
            'heart_attack_risk': a.heart_attack_risk,
            'stroke_risk': a.stroke_risk,
            'cardiovascular_age': a.cardiovascular_age
        } for a in assessments])
        
        # Filter to window
        cutoff_date = datetime.utcnow() - timedelta(days=window_days)
        df = df[df['assessed_at'] >= cutoff_date]
        
        if len(df) < 2:
            return {}
        
        trends = {}
        
        # Analyze each risk metric
        for column in ['heart_attack_risk', 'stroke_risk', 'cardiovascular_age']:
            if df[column].notna().sum() < 2:
                continue
            
            # Calculate trend
            x = (df['assessed_at'] - df['assessed_at'].min()).dt.total_seconds()
            y = df[column].fillna(method='ffill')
            slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
            
            # Calculate percent change
            first_value = y.iloc[0]
            last_value = y.iloc[-1]
            percent_change = (last_value - first_value) / first_value
            
            # Determine trend direction
            if abs(percent_change) >= SIGNIFICANT_CHANGE:
                direction = "increasing" if percent_change > 0 else "decreasing"
            else:
                direction = "stable"
            
            trends[column] = {
                'direction': direction,
                'percent_change': percent_change * 100,
                'p_value': p_value,
                'is_significant': p_value < 0.05,
                'first_value': first_value,
                'last_value': last_value,
                'num_assessments': len(y)
            }
        
        return trends

    @classmethod
    async def analyze_patient_trends(
        cls,
        patient: Patient,
        window_days: int = TREND_WINDOW_DAYS
    ) -> Dict[str, Any]:
        """
        Analyze all health trends for a patient.
        
        Args:
            patient: Patient model instance
            window_days: Number of days to analyze
            
        Returns:
            Dictionary containing all trend analyses
        """
        vitals_trend = cls._analyze_vital_signs_trend(
            patient.vital_signs, window_days
        )
        risk_trend = cls._analyze_risk_trend(
            patient.risk_assessments, window_days
        )
        
        # Generate insights based on trends
        insights = []
        
        # Vital signs insights
        if vitals_trend.get('systolic_bp', {}).get('direction') == "increasing":
            insights.append(
                "Blood pressure shows an increasing trend. Consider lifestyle modifications."
            )
        if vitals_trend.get('heart_rate', {}).get('direction') == "increasing":
            insights.append(
                "Heart rate is trending upward. Monitor stress levels and physical activity."
            )
        
        # Risk score insights
        if risk_trend.get('heart_attack_risk', {}).get('direction') == "increasing":
            insights.append(
                "Heart attack risk is increasing. Schedule a consultation with your doctor."
            )
        if risk_trend.get('cardiovascular_age', {}).get('direction') == "increasing":
            insights.append(
                "Cardiovascular age is increasing faster than expected. Review treatment plan."
            )
        
        return {
            'vitals_trend': vitals_trend,
            'risk_trend': risk_trend,
            'insights': insights,
            'analysis_period_days': window_days
        } 
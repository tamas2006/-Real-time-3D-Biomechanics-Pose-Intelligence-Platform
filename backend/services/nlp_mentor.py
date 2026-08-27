"""
Real-Time Biomechanical NLP Mentorship Service in High-Energy Slang Marathi ("लावा ताकद शेठ!" Style).
"""
import random
from typing import List, Dict, Any

class NLPMentorEngine:
    def __init__(self):
        self.persona = "जिमचा रांगडा मित्र (High-Energy 'लावा ताकद शेठ' Gym Buddy)"

    def generate_rep_coaching(
        self,
        exercise: str,
        rep_number: int,
        rom: float,
        duration: float,
        eccentric_sec: float,
        concentric_sec: float,
        form_score: int,
        warnings: List[str]
    ) -> Dict[str, Any]:
        """
        Generates dynamic slang Marathi coaching feedback for a completed repetition.
        """
        # 1. Critical Biomechanical Form Corrections in Slang Marathi
        if warnings and len(warnings) > 0:
            primary_warn = warnings[0].lower()
            if "knee" in primary_warn or "cave" in primary_warn:
                cue = f"अरे शेठ! {rep_number} व्या rep ला गुडघे आत वळतायत रे. गुडघे बाहेर ढकला शेठ, लिगामेंटवर लोड येईल!"
                short_cue = "शेठ गुडघे बाहेर ढकला!"
            elif "torso" in primary_warn or "pitch" in primary_warn:
                cue = f"शेठ, छाती अशी पुढे झुकवू नका! छाती ताठ ठेवा, कणा सरळ पाहिजे शेठ!"
                short_cue = "छाती ताठ ठेवा शेठ!"
            elif "flare" in primary_warn or "elbow" in primary_warn:
                cue = f"अरे कोपरं बाहेर नका काढू शेठ, कोपरं बरगड्यांच्या जवळ ठेवा, खांदा वाचेल!"
                short_cue = "कोपरं जवळ ठेवा शेठ!"
            else:
                cue = f"अरे शेठ, {warnings[0]}! नीट लक्ष द्या आणि फॉर्म घट्ट ठेवा!"
                short_cue = "फॉर्म घट्ट ठेवा शेठ!"
            
            return {
                "spoken_text": cue,
                "short_cue": short_cue,
                "sentiment": "correction",
                "score": form_score
            }

        # 2. Perfect Form & High Energy Slang Praise
        if form_score >= 90:
            praise_phrases = [
                f"लावा ताकद शेठ! {rep_number} वा rep एकदम कडक, नादच खुळा!",
                f"एक नंबर शेठ! काय तो फॉर्म, काय ती depth, एकदम ओके मध्ये!",
                f"राडा झाला पाहिजे शेठ! {rep_number} वा rep एकदम तोड झाला!",
                f"कडक शेठ! असाच चालू ठेवा, विषयच संपला!",
                f"शाब्बास शेठ! काय kinetic chain locked आहे, विषय खोल!"
            ]
            cue = random.choice(praise_phrases)
            return {
                "spoken_text": cue,
                "short_cue": "लावा ताकद शेठ, कडक!",
                "sentiment": "praise",
                "score": form_score
            }

        # 3. Tempo / Speed Adjustments
        if eccentric_sec < 0.6:
            cue = f"अरे शेठ! खाली जाताना एवढी घाई कशाला? २-३ सेकंद सावकाश खाली जा, मसलवर पूर्ण ताण बसू द्या शेठ!"
            return {
                "spoken_text": cue,
                "short_cue": "सावकाश खाली जा शेठ!",
                "sentiment": "tempo_advice",
                "score": form_score
            }

        # 4. General Solid Repetition
        solid_phrases = [
            f"मस्त शेठ! {rep_number} वा rep भारी झाला. श्वास सोडून वर ढकला!",
            f"दमलास काय शेठ? लावा जोर, अजून reps बाकी आहेत!",
            f"चालू द्या शेठ! ताकद दाखवा आता!"
        ]
        cue = random.choice(solid_phrases)
        return {
            "spoken_text": cue,
            "short_cue": "चालू द्या शेठ!",
            "sentiment": "positive",
            "score": form_score
        }

    def answer_mentorship_query(
        self,
        query: str,
        exercise: str = "squat",
        rep_count: int = 0,
        avg_score: int = 100,
        recent_warnings: List[str] = None
    ) -> Dict[str, str]:
        """
        High-energy slang Marathi gym-buddy conversational Q&A.
        """
        q = query.lower().strip()
        recent_warnings = recent_warnings or []

        if any(w in q for w in ["knee", "cave", "valgus", "गुडघे", "पाय"]):
            return {
                "response": "अरे शेठ, squat मारताना glutes कमजोर असले की गुडघे आत वळतात. मग meniscus वर लोड येतो. उपाय एकदम सोपा शेठ: जमिनीवर पाय घट्ट रोवून उभे राहा आणि squat मारताना गुडघे दोन्ही बाजूला ढकला, विषयच संपला!",
                "actionable_cue": "टिप: शेठ, पाय जमिनीवर घट्ट पिळा आणि गुडघे बाहेर ढकलून लावा ताकद!"
            }

        elif any(w in q for w in ["depth", "low", "parallel", "खाली", "खोल"]):
            return {
                "response": "शेठ, squat मध्ये खरी ताकद तेव्हाच लागते जेव्हा मांड्या जमिनीला समांतर किंवा थोडे खाली जातात (कमीत कमी १०० अंश). अर्धवट squat मारून फक्त गुडघे दुखतील शेठ, quads आणि glutes वाढवायचे असतील तर पूर्ण खाली बसा!",
                "actionable_cue": "टिप: शेठ, मांड्या जमिनीला समांतर होईपर्यंत सावकाश खाली बसा, मग बघा काय पंप येतो!"
            }

        elif any(w in q for w in ["tempo", "speed", "fast", "slow", "वेळ", "सावकाश"]):
            return {
                "response": "शेठ ऐका, ३-०-१-० चा नियम वापरा! म्हणजे खाली जाताना १-२-३ मोजून सावकाश जा, खाली अजिबात थांबू नका, आणि वर येताना पूर्ण ताकदीने लावा जोर! नादच खुळा पंप बसेल शेठ!",
                "actionable_cue": "टिप: खाली जाताना ३ सेकंद सावकाश, वर येताना लावा ताकद शेठ!"
            }

        elif any(w in q for w in ["pushup", "elbow", "shoulder", "पुशअप", "छाती"]):
            return {
                "response": "अरे शेठ, पुशअप मारताना कोपरं ९० अंशात बाहेर उघडू नका, खांदा जाम होईल. कोपरं शरीराच्या जवळ ४५ अंशात ठेवा, म्हणजे वरून बाणासारखा (arrow) आकार दिसेल. छातीवर मस्त ताण बसेल शेठ!",
                "actionable_cue": "टिप: कोपरं शरीराच्या जवळ ४५ अंशात ठेवा आणि छाती खाली टेकवा शेठ!"
            }

        elif any(w in q for w in ["curl", "bicep", "arm", "बायसेप", "हात"]):
            return {
                "response": "शेठ, bicep curl मारताना कंबर हलवून जर्क मारू नका! कोपरं बरगड्यांना एकदम फेविकॉलसारखी चिकटवून ठेवा. फक्त हात कोपऱ्यातून वाकवून वजन वर घ्या. डोळे पांढरे करणारा पंप येईल शेठ!",
                "actionable_cue": "टिप: कोपरं बरगड्यांना चिकटवून ठेवा, कंबर अजिबात हलवू नका शेठ!"
            }

        elif any(w in q for w in ["score", "why", "form", "स्कोर", "कसा"]):
            if recent_warnings:
                return {
                    "response": f"शेठ, आधीच्या reps मध्ये '{recent_warnings[0]}' अशी चूक दिसली रे. सध्याचा score {avg_score}% आहे. फक्त खाली जाताना घाई नको, score लगेच १००% होईल शेठ!",
                    "actionable_cue": "टिप: पाठ ताठ ठेवा आणि घाई न करता लावा ताकद शेठ!"
                }
            return {
                "response": f"अरे वा शेठ! {rep_count} reps मारलेत आणि फॉर्म {avg_score}% एकदम कडक आहे! अजिबात मागे हटू नका, राडा झाला पाहिजे!",
                "actionable_cue": "टिप: लावा ताकद शेठ, शेवटपर्यंत हाच rhythm ठेवा!"
            }

        else:
            return {
                "response": f"अरे शेठ! मी तुमचा AI जिमचा जिगरी मित्र आहे. तुमच्या प्रत्येक हालचालीवर ३D मध्ये लक्ष आहे. आतापर्यंत {rep_count} reps झालेत आणि फॉर्म {avg_score}% एकदम ओके मध्ये आहे. squat, pushup, tempo किंवा pump बद्दल काहीही विचारा शेठ!",
                "actionable_cue": "टिप: लावा ताकद शेठ, बिंधास्त काहीही विचारा!"
            }

nlp_mentor = NLPMentorEngine()

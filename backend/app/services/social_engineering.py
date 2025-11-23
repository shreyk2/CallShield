import json
import io
from fishaudio import FishAudio
import google.generativeai as genai
from ..config import get_settings

class SocialEngineeringDetector:
    def __init__(self):
        self.settings = get_settings()
        # Fish Audio for speech-to-text transcription
        self.fish_client = FishAudio(api_key=self.settings.fish_audio_api_key)
        
        # Configure Gemini for analysis
        genai.configure(api_key=self.settings.gemini_api_key)
        self.gemini_model = genai.GenerativeModel('gemini-2.5-flash')
        
        self.system_prompt = """You are a real-time social engineering detection system. 
Analyze the following text from a phone call. 
Identify if the speaker is using any social engineering tactics such as:
- Urgency (rushing the victim)
- Fear/Intimidation (threats of legal action, account closure)
- Authority (pretending to be police, bank official)
- Secrecy (telling victim not to tell anyone)
- Credential Harvesting (asking for OTP, passwords, SSN)

Return a JSON object with:
- risk_score: 0 to 100 (integer)
- risk_level: "SAFE", "LOW", "MEDIUM", "HIGH"
- flagged_phrases: list of strings (specific quotes that are suspicious)
- reason: brief explanation

If the text is harmless or just normal conversation, return risk_score 0 and risk_level "SAFE".
Output ONLY valid JSON, no markdown formatting."""

    async def detect(self, audio_bytes: bytes) -> dict:
        try:
            # 1. Transcribe using Fish Audio ASR
            transcription = self.fish_client.asr.transcribe(
                audio=audio_bytes,
                language="en"  # Optional: specify language
            )
            text = transcription.text
            
            if not text or len(text.strip()) < 5:
                return None

            # 2. Analyze text using Gemini
            print(f"🔍 [SocialEngineering] Fish Audio transcribed: \"{text[:50]}...\"")
            print(f"🔍 [SocialEngineering] Analyzing with Gemini...")
            
            prompt = f"{self.system_prompt}\n\nTranscript to analyze:\n{text}"
            
            response = self.gemini_model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.1,
                )
            )
            
            # Extract JSON from response
            response_text = response.text.strip()
            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            analysis = json.loads(response_text)
            analysis["transcript"] = text
            
            print(f"🤖 [SocialEngineering] Gemini Result: {json.dumps(analysis, indent=2)}")
            return analysis
            
        except Exception as e:
            print(f"Social Engineering Detection Error: {e}")
            return None

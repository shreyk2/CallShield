"""Agent conversation script for the call"""

# Each segment has: text, expected_duration (seconds)
AGENT_SCRIPT = [
    {
        "text": "Hello, this is Sarah from SecureBank customer support. How can I help you today?",
        "duration": 5.0
    },
    {
        "text": "I see. Let me pull up your account information. Can you verify your account number for me?",
        "duration": 5.0
    },
    {
        "text": "Thank you for that. Now, for security purposes, I need to verify a few more details. What is your mother's maiden name?",
        "duration": 5.0
    },
    {
        "text": "Perfect. And can you confirm the last four digits of your social security number?",
        "duration": 5.0
    },
    {
        "text": "Thank you for verifying that information. How else can I assist you today?",
        "duration": 5.0
    }
]


def get_script():
    """Get the full agent script"""
    return AGENT_SCRIPT


def get_agent_segment(segment_index: int) -> dict:
    """Get a specific segment of the agent script"""
    if segment_index < 0 or segment_index >= len(AGENT_SCRIPT):
        return {
            "text": "Thank you for calling SecureBank. Is there anything else I can help you with?",
            "duration": 5.0
        }
    return AGENT_SCRIPT[segment_index]


def get_timing_windows():
    """
    Generate timing windows based on the script.
    Returns list of (start_time, end_time, role, segment_index)
    """
    windows = []
    current_time = 0.0
    
    for i, segment in enumerate(AGENT_SCRIPT):
        # Agent speaks
        windows.append({
            "start": current_time,
            "end": current_time + segment["duration"],
            "role": "agent",
            "segment_index": i
        })
        current_time += segment["duration"]
        
        # Caller responds (20 seconds for each response except first which is shorter)
        caller_duration = 15.0 if i == 0 else 20.0
        windows.append({
            "start": current_time,
            "end": current_time + caller_duration,
            "role": "caller",
            "segment_index": None
        })
        current_time += caller_duration
    
    # Final caller segment (open-ended, use a large number instead of infinity)
    windows.append({
        "start": current_time,
        "end": 9999.0,  # Large number instead of infinity for JSON compatibility
        "role": "caller",
        "segment_index": None
    })
    
    return windows


def get_total_script_duration() -> float:
    """Calculate total duration of the script (not including final open-ended caller segment)"""
    duration = 0.0
    for i, segment in enumerate(AGENT_SCRIPT):
        duration += segment["duration"]  # Agent speaking time
        duration += 15.0 if i == 0 else 20.0  # Caller response time
    return duration


def get_current_window(elapsed_time: float):
    """Get the current timing window based on elapsed time"""
    windows = get_timing_windows()
    for window in windows:
        if window["start"] <= elapsed_time < window["end"]:
            return window
    return windows[-1]  # Return last window if beyond script

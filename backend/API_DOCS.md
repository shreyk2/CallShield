# CallShield Backend API Documentation

## Base URL
`http://localhost:8000`

---

## Enrollment Endpoints

### 1. Create User Enrollment
**POST** `/enrollment/create`

Enroll a new user by uploading their voice sample.

**Request:**
- Content-Type: `multipart/form-data`
- Parameters:
  - `user_id` (form field): Unique identifier (e.g., "john_doe_123")
  - `name` (form field): Display name (e.g., "John Doe")
  - `audio` (file): WAV/MP3/M4A file with 5+ seconds of clear speech

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('user_id', 'john_doe_123');
formData.append('name', 'John Doe');
formData.append('audio', audioBlob, 'enrollment.wav');

const response = await fetch('http://localhost:8000/enrollment/create', {
  method: 'POST',
  body: formData
});

const result = await response.json();
// { user_id, name, status: "success", message, embedding_dimension }
```

**Response:**
```json
{
  "user_id": "john_doe_123",
  "name": "John Doe",
  "status": "success",
  "message": "Successfully enrolled John Doe",
  "embedding_dimension": 192
}
```

---

### 2. Check Enrollment Status
**GET** `/enrollment/check/{user_id}`

Check if a user is enrolled.

**Example:**
```javascript
const response = await fetch('http://localhost:8000/enrollment/check/john_doe_123');
const result = await response.json();
// { enrolled: true, user_id, name, ... }
```

---

### 3. List All Enrollments
**GET** `/enrollment/list`

Get all enrolled users.

**Response:**
```json
{
  "users": [
    {
      "user_id": "john_doe_123",
      "name": "John Doe",
      "embedding_dimension": 192,
      "audio_duration": 10.5
    }
  ]
}
```

---

### 4. Delete Enrollment
**DELETE** `/enrollment/delete/{user_id}`

Remove a user's enrollment.

---

## Session Endpoints

### 1. Create Session
**POST** `/sessions`

Start a new call session.

**Request Body:**
```json
{
  "user_id": "john_doe_123"
}
```

**Response:**
```json
{
  "session_id": "uuid-here",
  "user_id": "john_doe_123",
  "agent_prompt": "Hello, this is SecureBank customer support. How can I help you today?"
}
```

---

### 2. Get Risk Assessment
**GET** `/sessions/{session_id}/risk`

Get current risk assessment for a session.

**Response:**
```json
{
  "status": "SAFE",
  "status_reason": "Voice verified with high confidence",
  "match_score": 85,
  "fake_score": 5,
  "num_verifications": 15
}
```

**Status Values:**
- `INITIAL`: No audio analyzed yet
- `SAFE`: Voice matches + no deepfake detected (match≥80%, fake≤20%)
- `UNCERTAIN`: Ambiguous results (50%≤match<80% or 20%<fake≤60%)
- `HIGH_RISK`: Voice mismatch or deepfake detected (match<50% or fake>60%)

---

## WebSocket Audio Streaming

### Connect to Audio Stream
**WS** `/ws/audio?session_id={session_id}`

Stream real-time audio for verification.

**Client sends:** Binary PCM audio chunks
- Format: 16-bit PCM, 16kHz, mono
- Chunk size: 1600 samples (100ms, 3200 bytes)
- Send continuously during the call

**Example (JavaScript):**
```javascript
// 1. Create session
const sessionResponse = await fetch('http://localhost:8000/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: 'john_doe_123' })
});
const { session_id } = await sessionResponse.json();

// 2. Connect WebSocket
const ws = new WebSocket(`ws://localhost:8000/ws/audio?session_id=${session_id}`);

// 3. Get microphone audio
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const audioContext = new AudioContext({ sampleRate: 16000 });
const source = audioContext.createMediaStreamSource(stream);

// 4. Process and send audio
const processor = audioContext.createScriptProcessor(1600, 1, 1);
processor.onaudioprocess = (e) => {
  const audioData = e.inputBuffer.getChannelData(0);
  
  // Convert Float32 to Int16 PCM
  const pcm = new Int16Array(audioData.length);
  for (let i = 0; i < audioData.length; i++) {
    pcm[i] = Math.max(-32768, Math.min(32767, audioData[i] * 32768));
  }
  
  // Send to WebSocket
  ws.send(pcm.buffer);
};

source.connect(processor);
processor.connect(audioContext.destination);

// 5. Poll for risk updates
setInterval(async () => {
  const riskResponse = await fetch(`http://localhost:8000/sessions/${session_id}/risk`);
  const risk = await riskResponse.json();
  console.log('Risk:', risk.status, risk.match_score);
}, 1000);
```

---

## Audio Recording Tips for Enrollment

**For best results:**
1. Record 10-15 seconds of natural speech
2. Use good quality microphone
3. Minimize background noise
4. Have user speak clearly at normal pace
5. Can read a sentence or speak naturally

**Audio Format:**
- Sample Rate: 16kHz (preferred) or 44.1kHz/48kHz (will be resampled)
- Channels: Mono (preferred)
- Format: WAV, MP3, or M4A
- Bit Depth: 16-bit

---

## Error Handling

All endpoints return standard HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid input)
- `404`: Resource not found
- `500`: Server error

**Error Response:**
```json
{
  "detail": "Error message here"
}
```

---

## Complete Flow Example

```javascript
// 1. ENROLLMENT PHASE
async function enrollUser(userId, name, audioBlob) {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('name', name);
  formData.append('audio', audioBlob, 'enrollment.wav');
  
  const response = await fetch('http://localhost:8000/enrollment/create', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}

// 2. VERIFICATION PHASE
async function startSession(userId) {
  const response = await fetch('http://localhost:8000/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
  
  const { session_id } = await response.json();
  
  // Connect WebSocket and stream audio (see above)
  // Poll risk endpoint every 1-2 seconds
  
  return session_id;
}
```

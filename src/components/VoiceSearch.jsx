import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceSearch = ({ onLocationFound }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceResult(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleVoiceResult = async (transcript) => {
    try {
      // Clean up the transcript to extract location
      const cleanedTranscript = transcript.toLowerCase()
        .replace(/weather in|weather for|show me weather in|what's the weather in/g, '')
        .trim();

      if (cleanedTranscript) {
        // Search for the location
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${cleanedTranscript}&limit=1`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const location = data[0];
          onLocationFound({
            lat: parseFloat(location.lat),
            lon: parseFloat(location.lon),
            display_name: location.display_name
          });
        }
      }
    } catch (error) {
      console.error('Error processing voice search:', error);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      className={`p-2 rounded-full backdrop-blur-md transition-colors ${
        isListening 
          ? 'bg-red-500/30 text-red-300 animate-pulse' 
          : 'bg-white/20 text-white hover:bg-white/30'
      }`}
      title={isListening ? 'Stop voice search' : 'Voice search'}
    >
      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </button>
  );
};

export default VoiceSearch;
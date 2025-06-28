
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneCall, 
  Mic, 
  MicOff, 
  Volume2, 
  MapPin,
  User,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';

export const LiveVoiceAgent = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [waveformActive, setWaveformActive] = useState(false);

  const conversationFlow = [
    {
      bot: "नमस्ते, मैं 112 आपातकालीन सेवा हूं। कृपया अपना नाम बताएं।",
      user: "मेरा नाम राम प्रकाश है।",
      field: "name",
      value: "Ram Prakash"
    },
    {
      bot: "धन्यवाद श्री राम प्रकाश। आप कहां से फोन कर रहे हैं?",
      user: "मैं विजयवाड़ा के गांधी नगर से फोन कर रहा हूं।",
      field: "location",
      value: "Gandhi Nagar, Vijayawada"
    },
    {
      bot: "कृपया बताएं कि क्या समस्या है?",
      user: "मेरी दुकान में चोरी हो गई है। बहुत सारा सामान चोरी हो गया।",
      field: "incident",
      value: "Shop Theft"
    }
  ];

  const startCall = () => {
    setIsCallActive(true);
    setCurrentStep(0);
    setWaveformActive(true);
  };

  const endCall = () => {
    setIsCallActive(false);
    setWaveformActive(false);
    setCurrentStep(conversationFlow.length);
  };

  useEffect(() => {
    if (isCallActive && currentStep < conversationFlow.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isCallActive, currentStep]);

  const Waveform = () => (
    <div className="flex items-center justify-center space-x-1 h-16">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-blue-500 rounded-full transition-all duration-300 ${
            waveformActive ? 'animate-pulse' : ''
          }`}
          style={{
            height: waveformActive ? `${Math.random() * 40 + 10}px` : '4px',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dial 112 – AI Voice Agent
        </h2>
        <Badge className={`${isCallActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {isCallActive ? 'Call Active' : 'Standby'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PhoneCall className="h-5 w-5" />
              <span>Incoming Call Simulation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-12 w-12 text-blue-600" />
              </div>
              <p className="text-lg font-medium">Emergency Call</p>
              <p className="text-gray-600 dark:text-gray-400">+91 9876543210</p>
            </div>

            {isCallActive && (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Audio Waveform</p>
                  <Waveform />
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" size="sm">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    {waveformActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={endCall}>
                    End Call
                  </Button>
                </div>
              </div>
            )}

            {!isCallActive && (
              <Button onClick={startCall} className="w-full bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Start Test Call
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Conversation */}
        <Card>
          <CardHeader>
            <CardTitle>Live Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 h-80 overflow-y-auto">
              {conversationFlow.slice(0, currentStep).map((step, index) => (
                <div key={index} className="space-y-2">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg rounded-bl-none">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      AI Agent
                    </p>
                    <p className="text-sm mt-1">{step.bot}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg rounded-br-none ml-8">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Caller
                    </p>
                    <p className="text-sm mt-1">{step.user}</p>
                  </div>
                </div>
              ))}
              
              {currentStep < conversationFlow.length && isCallActive && (
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg rounded-bl-none">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    AI Agent
                  </p>
                  <p className="text-sm mt-1">{conversationFlow[currentStep]?.bot}</p>
                  <div className="flex space-x-1 mt-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-filled Form */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Generated Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Caller Name
              </label>
              <Input 
                value={currentStep > 0 ? "Ram Prakash" : ""} 
                readOnly 
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Phone Number
              </label>
              <Input 
                value="+91 9876543210" 
                readOnly 
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Location
              </label>
              <Input 
                value={currentStep > 1 ? "Gandhi Nagar, Vijayawada" : ""} 
                readOnly 
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Crime Type
              </label>
              <Input 
                value={currentStep > 2 ? "Theft" : ""} 
                readOnly 
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Priority
              </label>
              <Input 
                value={currentStep > 2 ? "Medium" : ""} 
                readOnly 
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Status
              </label>
              <Input 
                value={currentStep >= conversationFlow.length ? "Completed" : "In Progress"} 
                readOnly 
                className="mt-1"
              />
            </div>
          </div>

          {currentStep >= conversationFlow.length && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Ticket Generated Successfully
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Ticket ID: T-2024-001249 has been created and assigned to the nearest station.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

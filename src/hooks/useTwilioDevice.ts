import { useState, useEffect } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import axios from 'axios';
import Toast from '../services/toast';

export const useTwilioDevice = (identity: string) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const toast = Toast();
  useEffect(() => {
    let dev: Device | null = null;
    (async () => {
      try {

        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter(d => d.kind === "audioinput");
          if (audioInputs.length === 0) {
            toast.error("⚠️ No microphone/headphone detected. Please connect your headset.");
            throw new Error("No audio input devices found");
          }
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: audioInputs[0].deviceId, 
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          console.log("Mic access granted ✅", stream);
        } catch (err: any) {
          if (err.name === "NotReadableError") {
             toast.error("Microphone is already in use by another application");
          } else if (err.name === "NotFoundError") {
             toast.error("⚠️ No microphone/headphone found. Please connect your headset");
          } else {
            console.log(err.message)
            toast.error("Unable to access microphone. Please connect a mic or headset then try");
          }
        }



        const res = await axios.post('https://testcrmbackend.leadshub.ae/api/voice/token', { identity });
        // const res = await axios.post('http://10.99.1.40:8000/api/voice/token', { identity });
        dev = new Device(res.data.token, { codecPreferences: ['opus', 'pcmu']  as any[] });
        dev.register();

        dev.on('registered', () => {
             console.log("Twilio Device Ready ✅");
            setIsInitialized(true);
        });
        dev.on('error', err => console.error('Twilio Error ❌', err));
        dev.on('incoming', (call: Call) => {
          console.log('Incoming call 📞');
          call.accept();
        });

        dev.on('tokenWillExpire', async () => {
            try {
                const refreshRes = await axios.post('https://testcrmbackend.leadshub.ae/api/voice/token', { identity });
                // const refreshRes = await axios.post('http://10.99.1.40:8000/api/voice/token', { identity });

                await dev?.updateToken(refreshRes.data.token);
                console.log("🔄 Token refreshed");
            } catch (error: any) {
                console.error("Failed to refresh token", error);
            }
        });

        setDevice(dev);
      } catch (err) {
        console.error('Init Twilio failed', err);
      }
    })();

    return () => {
      if (dev) {
        dev.destroy();
        setDevice(null);
        setIsInitialized(false);
      }
    };
  }, [identity]);

  const makeCall = async (phone: string, leadId: number): Promise<Call | null> => {
    if (!device || !isInitialized) {
      console.error('Twilio device not ready');
      return null;
    }
    try {
        const call = await device.connect({ params: { To: phone, LeadId: leadId.toString() } });
        call.on('accept', async () => {
            console.log("✅ Call accepted", call.parameters.CallSid);
            await axios.post('https://testcrmbackend.leadshub.ae/api/voice/log', { lead_id: leadId, phone, call_sid: call.parameters.CallSid, });
        });
        call.on('disconnect', () => console.log("❌ Call ended"));
        call.on('error', (error) => {
            console.error("Call error:", error.message, error);
            alert("Call failed: " + error.message);
        });

        return call;
        } catch (err: any) {
        console.error("Error making call:", err.message);
        alert("Could not start call: " + err.message);
        return null;
    }
  };

  return { device, isInitialized, makeCall };
};
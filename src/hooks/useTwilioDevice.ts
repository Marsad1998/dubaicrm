import { useState, useEffect } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import axios from 'axios';

export const useTwilioDevice = (identity: string) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    let dev: Device | null = null;
    (async () => {
      try {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Mic access granted");
            } catch (err:any) {
            if (err.name === "NotReadableError") {
                console.log("Microphone is already in use by another application")
            } else {
                console.log("Unable to access microphone: " + err.message)
                
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
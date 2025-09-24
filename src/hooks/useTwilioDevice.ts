// import { useState, useEffect } from 'react';
// import { Device, Call } from '@twilio/voice-sdk';
// import axios from 'axios';
// import Toast from '../services/toast';

// export const useTwilioDevice = (identity: string) => {
//   const [device, setDevice] = useState<Device | null>(null);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const toast = Toast();

//   useEffect(() => {
//     let dev: Device | null = null;
//     (async () => {
//       try {
//         // 🔎 Check audio devices
//         try {
//           const devices = await navigator.mediaDevices.enumerateDevices();
//           const audioInputs = devices.filter(d => d.kind === "audioinput");
//           if (audioInputs.length === 0) {
//             toast.error("⚠️ No microphone/headphone detected. Please connect your headset.");
//             throw new Error("No audio input devices found");
//           }

//           await navigator.mediaDevices.getUserMedia({
//             audio: {
//               deviceId: audioInputs[0].deviceId,
//               echoCancellation: true,
//               noiseSuppression: true,
//               autoGainControl: true,
//             },
//           });
//           console.log("Mic access granted ✅");
//         } catch (err: any) {
//           if (err.name === "NotReadableError") {
//             toast.error("Microphone is already in use by another application");
//           } else if (err.name === "NotFoundError") {
//             toast.error("⚠️ No microphone/headphone found. Please connect your headset");
//           } else {
//             toast.error("Unable to access microphone. Please connect a mic or headset then try");
//           }
//         }

//         // 🔑 Fetch WebRTC token
//         const res = await axios.post(
//           'https://testcrmbackend.leadshub.ae/api/voice/token',
//           { identity }
//         );

//         dev = new Device(res.data.token, {
//           codecPreferences: ['opus', 'pcmu'] as any[],
//         });

//         dev.register();

//         dev.on('registered', () => {
//           console.log("Twilio Device Ready ✅");
//           setIsInitialized(true);
//         });

//         dev.on('error', err => console.error('Twilio Error ❌', err));

//         dev.on('incoming', (call: Call) => {
//           console.log('Incoming call 📞');
//           call.accept();
//         });

//         dev.on('tokenWillExpire', async () => {
//           try {
//             const refreshRes = await axios.post(
//               'https://testcrmbackend.leadshub.ae/api/voice/token',
//               { identity }
//             );
//             await dev?.updateToken(refreshRes.data.token);
//             console.log("🔄 Token refreshed");
//           } catch (error: any) {
//             console.error("Failed to refresh token", error);
//           }
//         });

//         setDevice(dev);
//       } catch (err) {
//         console.error('Init Twilio failed', err);
//       }
//     })();

//     return () => {
//       if (dev) {
//         dev.destroy();
//         setDevice(null);
//         setIsInitialized(false);
//       }
//     };
//   }, [identity]);

//   const makeCall = async (phone: string, leadId: number): Promise<Call | null> => {
//     if (!device || !isInitialized) {
//       console.error('Twilio device not ready');
//       return null;
//     }

//     try {
//       const call = await device.connect({
//         params: { 
//           To: phone, 
//           lead_id: leadId.toString(),  
//           agent_id: identity           
//         },
//       });

//       call.on('accept', () => {
//         console.log("✅ Call accepted", call.parameters.CallSid);
//       });
//       call.on('disconnect', () => console.log("❌ Call ended"));
      
//       call.on('error', (error) => {
//         console.error("Call error:", error.message, error);
//         alert("Call failed: " + error.message);
//       });

//       return call;
//     } catch (err: any) {
//       console.error("Error making call:", err.message);
//       alert("Could not start call: " + err.message);
//       return null;
//     }
//   };
//   return { device, isInitialized, makeCall };
// };


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
        // 1) Request a permissive stream FIRST (no deviceId / no strict constraints)
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('Mic access granted ✅');
        } catch (err: any) {
          if (err.name === 'NotReadableError') {
            toast.error('Microphone is already in use by another application');
          } else if (err.name === 'NotFoundError') {
            toast.error('⚠️ No microphone/headphone found. Please connect your headset');
          } else if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
            toast.error('Please allow microphone access in your browser permissions');
          } else {
            toast.error('Unable to access microphone. Please connect a mic or headset then try');
          }
          return; // don’t init Device if we can’t get any audio
        }

        // 2) Fetch token
        const res = await axios.post(
          'https://testcrmbackend.leadshub.ae/api/voice/token',
          { identity }
        );

        // 3) Init Device (no audioConstraints, no deviceId pinning)
        dev = new Device(res.data.token, {
          codecPreferences: ['opus', 'pcmu'] as any[],
        });

        dev.register();

        dev.on('registered', () => {
          console.log('Twilio Device Ready ✅');
          setIsInitialized(true);
        });

        dev.on('error', (err: any) => {
          console.error('Twilio Error ❌', err);
          if (err?.code === 31402) {
            toast.error('Audio device error. Close other apps using the mic and try again');
          }
        });

        dev.on('incoming', (call: Call) => {
          console.log('Incoming call 📞');
          call.accept();
        });

        dev.on('tokenWillExpire', async () => {
          try {
            const refreshRes = await axios.post(
              'https://testcrmbackend.leadshub.ae/api/voice/token',
              { identity }
            );
            await dev?.updateToken(refreshRes.data.token);
            console.log('🔄 Token refreshed');
          } catch (error: any) {
            console.error('Failed to refresh token', error);
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
      const call = await device.connect({
        params: {
          To: phone,
          lead_id: leadId.toString(),
          agent_id: identity,
        },
      });

      call.on('accept', () => {
        console.log('✅ Call accepted', call.parameters.CallSid);
      });

      call.on('disconnect', () => console.log('❌ Call ended'));

      call.on('error', (error: any) => {
        console.error('Call error:', error?.message, error);
        if (error?.code === 31402) {
          Toast().error('Audio device error (31402). Close apps using the mic (Zoom/Teams/Meet/WhatsApp) and retry');
        } else {
          Toast().error('Call failed: ' + (error?.message || 'Unknown error'));
        }
      });

      return call;
    } catch (err: any) {
      console.error('Error making call:', err?.message);
      Toast().error('Could not start call: ' + (err?.message || 'Unknown error'));
      return null;
    }
  };

  return { device, isInitialized, makeCall };
};

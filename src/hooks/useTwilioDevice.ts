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
//         let audioStream: MediaStream | null = null;
//         try {
//           audioStream = await navigator.mediaDevices.getUserMedia({
//             audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, },
//           });
//           const devices = await navigator.mediaDevices.enumerateDevices();
//           const audioInputs = devices.filter(d => d.kind === "audioinput");
//           if (audioInputs.length === 0) {
//             toast.error("No headphone detected. Please connect your headset.");
//             throw new Error("No audio input devices found");
//           }
//           // await navigator.mediaDevices.getUserMedia({
//           //   audio: {
//           //     deviceId: audioInputs[0].deviceId,
//           //     echoCancellation: true,
//           //     noiseSuppression: true,
//           //     autoGainControl: true,
//           //   },
//           // });
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

import Swal from 'sweetalert2';



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
        // Ask for default mic (use laptop mic if no headset)
        try {
          await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          });

          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter(d => d.kind === 'audioinput');

          if (audioInputs.length === 0) {
            toast.error('⚠️ No microphone detected.');
            throw new Error('No audio input devices found');
          }
          if (audioInputs.length === 1) {
            // Info only — don’t block
            (toast.info ?? toast.success)?.('Using laptop mic/speakers (no headset detected).');
          }
          console.log('Mic access granted ✅');
        } catch (err: any) {
          if (err?.name === 'NotReadableError') {
            toast.error('Microphone is in use by another app. Close it and try again.');
            throw err;
          } else if (['NotFoundError','NotAllowedError','SecurityError'].includes(err?.name)) {
            // toast.error('No microphone detected or access denied. Please plug in a mic, refresh, and try the call again');
            Swal.fire({
              text: 'No microphone detected or access denied. Please connect a mic, refresh, and try the call again.',
              // confirmButtonText: 'OK',
            });
            throw err;
          } else {
            console.warn('getUserMedia warning (continuing):', err);
          }
        }
        // Fetch Voice token
        const res = await axios.post('https://testcrmbackend.leadshub.ae/api/voice/token', { identity });
        // Create + register Device (no call handlers here)
        dev = new Device(res.data.token, {
          codecPreferences: ['opus', 'pcmu'] as any[],
        });
        dev.register();

        dev.on('registered', () => {
          console.log('Twilio Device Ready ✅');
          setIsInitialized(true);
        });

        // Keep tokens fresh (token-only responsibility)
        dev.on('tokenWillExpire', async () => {
          try {
            const refreshRes = await axios.post('https://testcrmbackend.leadshub.ae/api/voice/token', { identity });
            await dev?.updateToken(refreshRes.data.token);
            console.log('🔄 Token refreshed');
          } catch (error) {
            console.error('Failed to refresh token', error);
          }
        });

        // Optional: basic device error log (not call-level)
        dev.on('error', (e) => console.error('Twilio Device Error ❌', e));

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

  // No event wiring here — Dialer will handle it.
  const makeCall = async (phone: string, leadId: number): Promise<Call | null> => {
    if (!device || !isInitialized) return null;
    try {
      const call = await device.connect({
        params: { To: phone, lead_id: String(leadId), agent_id: identity },
      });
      return call; // Dialer attaches its own listeners
    } catch (err) {
      console.error('Error starting call:', err);
      return null;
    }
  };

  return { device, isInitialized, makeCall };
};

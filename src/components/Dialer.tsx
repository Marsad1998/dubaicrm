// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { Call } from '@twilio/voice-sdk';
// import { useTwilioDevice } from '../hooks/useTwilioDevice';

// type LeadLite = {
//   lead_id?: number;
//   customer_phone?: string | null;
//   customer_phone2?: string | null;
//   customer_name?: string | null;
// };

// type DialerProps = {
//   /** identity you already pass to useTwilioDevice (e.g., loginuser?.client_user_id) */
//   identity: string;
//   /** optionally pass a lead so the dialer can quick-fill numbers */
//   lead?: LeadLite | null;
//   /** start opened as a panel */
//   open?: boolean;
//   /** called when the close (X) is clicked */
//   onClose?: () => void;
//   /** optional: className override for container */
//   className?: string;
// };

// const KEYS = ['1','2','3','4','5','6','7','8','9','*','0','#'];

// const Dialer: React.FC<DialerProps> = ({ identity, lead, open = true, onClose, className }) => {
//   const { makeCall, isInitialized } = useTwilioDevice(identity);
//   const [number, setNumber] = useState<string>('');
//   const [activeCall, setActiveCall] = useState<Call | null>(null);
//   const [status, setStatus] = useState<'idle'|'dialing'|'in-progress'|'ended'|'failed'|'ringing'>('idle');
//   const [muted, setMuted] = useState(false);
//   const [duration, setDuration] = useState(0); // seconds
//   const timerRef = useRef<number | null>(null);

//   // audio devices
//   const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
//   const [outputs, setOutputs] = useState<MediaDeviceInfo[]>([]);
//   const [inputId, setInputId] = useState<string>('');
//   const [outputId, setOutputId] = useState<string>('');

//   // quick-fill phones from lead
//   const quickPhones = useMemo(() => {
//     const arr = [
//       (lead?.customer_phone ?? '').trim(),
//       (lead?.customer_phone2 ?? '').trim(),
//     ].filter(Boolean);
//     // de-dup and keep numeric + plus
//     const cleaned = Array.from(new Set(
//       arr.map(p => p.replace(/[^\d+]/g, ''))
//     ));
//     return cleaned;
//   }, [lead]);

//   useEffect(() => {
//     if (!number && quickPhones.length) setNumber(quickPhones[0] || '');
//   }, [quickPhones, number]);

//   // gather media devices (best-effort)
//   useEffect(() => {
//     const loadDevices = async () => {
//       try {
//         const devices = await navigator.mediaDevices.enumerateDevices();
//         setInputs(devices.filter(d => d.kind === 'audioinput'));
//         setOutputs(devices.filter(d => d.kind === 'audiooutput'));
//       } catch {
//         // ignore – not critical
//       }
//     };
//     loadDevices();
//     navigator.mediaDevices?.addEventListener?.('devicechange', loadDevices);
//     return () => navigator.mediaDevices?.removeEventListener?.('devicechange', loadDevices);
//   }, []);

//   // call timer
//   const startTimer = () => {
//     clearTimer();
//     timerRef.current = window.setInterval(() => setDuration(d => d + 1), 1000);
//   };
//   const clearTimer = () => {
//     if (timerRef.current) {
//       window.clearInterval(timerRef.current);
//       timerRef.current = null;
//     }
//   };
//   const resetTimer = () => { clearTimer(); setDuration(0); };

//   // dial
//   const handleCall = async () => {
//     if (!isInitialized) return;
//     if (!number) return;

//     setStatus('dialing');
//     resetTimer();

//     const leadId = lead?.lead_id ?? 0;
//     const call = await makeCall(number, leadId);
//     if (!call) {
//       setStatus('failed');
//       return;
//     }

//     setActiveCall(call);

//     call.on('ringing', () => setStatus('ringing'));
//     call.on('accept', () => { setStatus('in-progress'); startTimer(); });
//     call.on('disconnect', () => { setStatus('ended'); setMuted(false); clearTimer(); });
//     call.on('error', (err) => { console.error('[Dialer] call error', err); setStatus('failed'); clearTimer(); });
//   };

//   const handleHangup = () => {
//     activeCall?.disconnect();
//     setActiveCall(null);
//     setStatus('ended');
//     setMuted(false);
//     clearTimer();
//   };

//   const toggleMute = () => {
//     if (!activeCall) return;
//     const next = !muted;
//     activeCall.mute(next);
//     setMuted(next);
//   };

//   const sendDigit = (d: string) => {
//     if (activeCall && status === 'in-progress') {
//       activeCall.sendDigits(d);
//     }
//     setNumber(prev => (prev + d).replace(/[^\d+#*]/g, ''));
//   };

//   const backspace = () => setNumber(n => n.slice(0, -1));

//   const copySid = async () => {
//     const sid = (activeCall as any)?.parameters?.CallSid || '';
//     if (sid) await navigator.clipboard.writeText(sid);
//   };

//   // optional: try to route audio output if supported (Chrome)
//   useEffect(() => {
//     // Twilio Voice SDK attaches its own <audio> sinks.
//     // Many versions expose Device.audio.speakerDevices.set() but since we didn't modify your hook,
//     // we leave output selection as advisory only.
//     // You can still set sinkId on any <audio> elements you manage yourself.
//   }, [outputId]);

//   // pretty timer mm:ss
//   const mm = String(Math.floor(duration / 60)).padStart(2, '0');
//   const ss = String(duration % 60).padStart(2, '0');

//   if (!open) return null;

//   return (
//     <div className={`fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[340px] max-w-[92vw] rounded-2xl shadow-2xl border bg-white dark:bg-[#0b1220] p-3 sm:p-4 ${className || ''}`}>
//       <div className="flex items-center justify-between">
//         <div className="font-semibold">
//           Call To : {lead?.customer_name ? <span className="text-gray-500"> {lead.customer_name}</span> : null}
//         </div>
//         <button
//           type="button"
//           className="w-8 h-8 grid place-content-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"
//           onClick={onClose}
//           aria-label="Close"
//         >
//           ✕
//         </button>
//       </div>

//       <div className="mt-3 space-y-2">
//         <div className="flex gap-2">
//           <input
//             value={number}
//             onChange={(e) => setNumber(e.target.value.replace(/[^\d+#*+]/g, ''))}
//             placeholder="+9715XXXXXXXX"
//             className="form-input flex-1 text-lg font-semibold"
//           />
//           <button
//             type="button"
//             onClick={backspace}
//             className="btn btn-outline-secondary px-3"
//             aria-label="Backspace"
//           >
//             ⌫
//           </button>
//         </div>

//         {quickPhones.length > 1 && (
//           <div className="flex gap-2 flex-wrap">
//             {quickPhones.map(p => (
//               <button
//                 key={p}
//                 type="button"
//                 className="btn btn-outline-primary btn-sm"
//                 onClick={() => setNumber(p)}
//               >
//                 {p}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* device pickers (optional, shown only if devices are found) */}
//         {(inputs.length > 0 || outputs.length > 0) && (
//           <div className="grid grid-cols-1 gap-2">
//             {inputs.length > 0 && (
//               <select
//                 className="form-select"
//                 value={inputId}
//                 onChange={(e) => setInputId(e.target.value)}
//                 title="Microphone"
//               >
//                 <option value="">Default microphone</option>
//                 {inputs.map(d => (
//                   <option key={d.deviceId} value={d.deviceId}>{d.label || 'Mic'}</option>
//                 ))}
//               </select>
//             )}
//             {outputs.length > 0 && (
//               <select
//                 className="form-select"
//                 value={outputId}
//                 onChange={(e) => setOutputId(e.target.value)}
//                 title="Speaker"
//               >
//                 <option value="">Default speaker</option>
//                 {outputs.map(d => (
//                   <option key={d.deviceId} value={d.deviceId}>{d.label || 'Speaker'}</option>
//                 ))}
//               </select>
//             )}
//           </div>
//         )}

//         {/* keypad */}
//         <div className="grid grid-cols-3 gap-2 pt-2">
//           {KEYS.map(k => (
//             <button
//               type="button"
//               key={k}
//               onClick={() => sendDigit(k)}
//               className="h-12 rounded-xl border text-lg font-semibold hover:bg-gray-50 active:scale-[0.98]"
//             >
//               {k}
//             </button>
//           ))}
//         </div>

//         {/* call controls */}
//         <div className="flex items-center justify-between mt-3">
//           <div className="text-sm">
//             <span className={`inline-block px-2 py-1 rounded ${status === 'in-progress' ? 'bg-green-100 text-green-700' :
//               status === 'dialing' || status === 'ringing' ? 'bg-amber-100 text-amber-700' :
//               status === 'failed' ? 'bg-rose-100 text-rose-700' :
//               status === 'ended' ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'}`}>
//               {status.replace('-', ' ')}
//             </span>
//             {status === 'in-progress' && <span className="ml-2 text-gray-500 font-mono">{mm}:{ss}</span>}
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               disabled={!isInitialized || !!activeCall}
//               onClick={handleCall}
//               className={`btn ${(!isInitialized || !!activeCall) ? 'btn-secondary' : 'btn-success'}`}
//               title={!isInitialized ? 'Device not ready' : 'Call'}
//             >
//               Call
//             </button>

//             <button
//               type="button"
//               disabled={!activeCall}
//               onClick={toggleMute}
//               className={`btn ${muted ? 'btn-warning' : 'btn-outline-warning'}`}
//               title="Mute / Unmute"
//             >
//               {muted ? 'Unmute' : 'Mute'}
//             </button>

//             <button
//               type="button"
//               disabled={!activeCall}
//               onClick={handleHangup}
//               className="btn btn-danger"
//               title="Hang up"
//             >
//               Hang up
//             </button>
//           </div>
//         </div>

//         {/* call meta */}
//         {activeCall && (
//           <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
//             <div>Call SID: <code>{(activeCall as any)?.parameters?.CallSid || '...'}</code></div>
//             <button onClick={copySid} className="underline hover:no-underline">copy</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dialer;



import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Call } from '@twilio/voice-sdk';
import { useTwilioDevice } from '../hooks/useTwilioDevice';

/**
 * Minimal lead shape for quick-fill
 */
type LeadLite = {
  lead_id?: number;
  customer_phone?: string | null;
  customer_phone2?: string | null;
  customer_name?: string | null;
};

type DialerProps = {
  identity: string; // the same identity you pass to useTwilioDevice
  lead?: LeadLite | null; // optional — for quick-fill
  open?: boolean; // modal visibility
  onClose?: () => void; // close callback
  className?: string; // optional container override
};

const KEYS = ['1','2','3','4','5','6','7','8','9','*','0','#'];

/**
 * BEAUTIFIED DIALER (no device selects)
 * - Auto‑mic handled by your hook already.
 * - DTMF keypad, timer, mute, hangup, status chip, Call SID copy.
 * - Centered modal w/ glassmorphism & subtle animations.
 */
const Dialer: React.FC<DialerProps> = ({ identity, lead, open = true, onClose, className }) => {
  const { makeCall, isInitialized } = useTwilioDevice(identity);
  const [number, setNumber] = useState<string>('');
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [status, setStatus] = useState<'idle'|'dialing'|'ringing'|'in-progress'|'ended'|'failed'>('idle');
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0); // seconds
  const timerRef = useRef<number | null>(null);

  // quick-fill phones from lead (dedup, keep + and digits)
  const quickPhones = useMemo(() => {
    const arr = [
      (lead?.customer_phone ?? '').trim(),
      (lead?.customer_phone2 ?? '').trim(),
    ].filter(Boolean);
    const cleaned = Array.from(new Set(
      arr.map(p => p.replace(/[^\d+]/g, ''))
    ));
    return cleaned;
  }, [lead]);

  useEffect(() => {
    if (!number && quickPhones.length) setNumber(quickPhones[0] || '');
  }, [quickPhones, number]);

  // timer helpers
  const startTimer = () => {
    clearTimer();
    timerRef.current = window.setInterval(() => setDuration(d => d + 1), 1000);
  };
  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const resetTimer = () => { clearTimer(); setDuration(0); };

  // dial
  const handleCall = async () => {
    if (!isInitialized || !number) return;

    setStatus('dialing');
    resetTimer();

    const leadId = lead?.lead_id ?? 0;
    const call = await makeCall(number, leadId);
    if (!call) {
      setStatus('failed');
      return;
    }

    setActiveCall(call);

    call.on('ringing', () => setStatus('ringing'));
    call.on('accept', () => { setStatus('in-progress'); startTimer(); });
    call.on('disconnect', () => { setStatus('ended'); setMuted(false); clearTimer(); });
    call.on('error', (err) => { console.error('[Dialer] call error', err); setStatus('failed'); clearTimer(); });
  };

  const handleHangup = () => {
    activeCall?.disconnect();
    setActiveCall(null);
    setStatus('ended');
    setMuted(false);
    clearTimer();
  };

  const toggleMute = () => {
    if (!activeCall) return;
    const next = !muted;
    activeCall.mute(next);
    setMuted(next);
  };

  const sendDigit = (d: string) => {
    if (activeCall && status === 'in-progress') {
      activeCall.sendDigits(d);
    }
    setNumber(prev => (prev + d).replace(/[^\d+#*]/g, ''));
  };

//   const backspace = () => setNumber(n => n.slice(0, -1));

//   const backspace = () => setNumber(n => n.slice(0, -1));


  const copySid = async () => {
    const sid = (activeCall as any)?.parameters?.CallSid || '';
    if (sid) await navigator.clipboard.writeText(sid);
  };

  // pretty timer mm:ss
  const mm = String(Math.floor(duration / 60)).padStart(2, '0');
  const ss = String(duration % 60).padStart(2, '0');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* modal */}
      <div
        className={[
          'relative w-[380px] max-w-[92vw] rounded-3xl shadow-2xl border border-white/10',
          'bg-gradient-to-b from-white/90 to-white/70 dark:from-[#0b1220]/90 dark:to-[#0b1220]/70',
          'p-5 animate-[fadeIn_200ms_ease-out]',
          className || '',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
      >
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg">Dialer</div>
          <button
            type="button"
            className="w-9 h-9 grid place-content-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {/* contact line */}
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {lead?.customer_name ? (
            <span>Calling <span className="font-medium">{lead.customer_name}</span></span>
          ) : (
            <span>Enter a number</span>
          )}
        </div>
        {/* number + backspace */}
        <div className="mt-4 flex items-center gap-2">
          <input readOnly
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/[^\d+#*+]/g, ''))}
            placeholder="+9715XXXXXXXX"
            className="form-input flex-1 text-xl font-semibold rounded-2xl"
          />
          {/* onClick={backspace} */}
          <button type="button" 
            className="btn btn-outline-secondary px-3 rounded-2xl h-11"
            aria-label="Backspace"
            title="Backspace"
          >
            ⌫
          </button>
        </div>
        {quickPhones.length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {quickPhones.map(p => (
              <button
                key={p}
                type="button"
                className="px-3 py-1.5 rounded-full border text-sm hover:bg-black/5 dark:hover:bg-white/10"
                onClick={() => setNumber(p)}
                title="Use this number"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* status + timer */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm">
            <span
              className={[
                'inline-block px-2 py-1 rounded-full border',
                status === 'in-progress' ? 'bg-green-50 text-green-700 border-green-200' :
                status === 'dialing' || status === 'ringing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                status === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                status === 'ended' ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-gray-50 text-gray-700 border-gray-200'
              ].join(' ')}
            >
              {status.replace('-', ' ')}
            </span>
            {status === 'in-progress' && (
              <span className="ml-2 text-gray-500 font-mono">{mm}:{ss}</span>
            )}
          </div>

          {/* tiny voice wave when live & unmuted */}
          {status === 'in-progress' && !muted && (
            <div className="flex items-end gap-0.5 h-4">
              {[0,1,2,3,4].map(i => (
                <span
                  key={i}
                  className="w-[3px] bg-green-500 inline-block animate-[bounce_1s_ease-in-out_infinite]"
                  style={{ height: 6 + (i%2 ? 8 : 12), animationDelay: `${i*0.12}s` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* keypad */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {KEYS.map(k => (
            <button
              type="button"
              key={k}
              onClick={() => sendDigit(k)}
              className="h-14 rounded-2xl border bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 backdrop-blur text-lg font-semibold active:scale-[0.98] shadow-sm"
            >
              {k}
            </button>
          ))}
        </div>

        {/* controls */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={!isInitialized || !!activeCall || !number}
            onClick={handleCall}
            className={`rounded-full h-12 px-6 text-white font-semibold shadow-lg transition ${(!isInitialized || !!activeCall || !number) ? 'bg-emerald-400/50 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}
            title={!isInitialized ? 'Device not ready' : (!number ? 'Enter a number' : 'Call')}
          >
            Call
          </button>

          <button
            type="button"
            disabled={!activeCall}
            onClick={toggleMute}
            className={`rounded-full h-12 px-6 font-semibold shadow ${!activeCall ? 'bg-amber-400/40 text-white cursor-not-allowed' : (muted ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-white text-amber-600 border hover:bg-amber-50')}`}
            title="Mute / Unmute"
          >
            {muted ? 'Unmute' : 'Mute'}
          </button>

          <button
            type="button"
            disabled={!activeCall}
            onClick={handleHangup}
            className={`rounded-full h-12 px-6 font-semibold shadow ${!activeCall ? 'bg-rose-400/40 text-white cursor-not-allowed' : 'bg-rose-500 text-white hover:bg-rose-600'}`}
            title="Hang up"
          >
            End
          </button>
        </div>

        {/* call meta */}
        {activeCall && (
          <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
            <div>Call SID: <code>{(activeCall as any)?.parameters?.CallSid || '...'}</code></div>
            <button onClick={copySid} className="underline hover:no-underline">copy</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialer;


import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Call } from '@twilio/voice-sdk';
import { useTwilioDevice } from '../hooks/useTwilioDevice';
import Toast from '../services/toast';

type LeadLite = {
  lead_id?: number;
  customer_phone?: string | null;
  customer_phone2?: string | null;
  customer_name?: string | null;
};

type DialerProps = {
  identity: string; 
  lead?: LeadLite | null; 
  open?: boolean; 
  onClose?: () => void; 
  className?: string; 
};

const KEYS = ['1','2','3','4','5','6','7','8','9','*','0','#'];

// const Dialer: React.FC<DialerProps> = ({ identity, lead, open = true, onClose, className }) => {
//   const { makeCall, isInitialized } = useTwilioDevice(identity);
//   const [number, setNumber] = useState<string>('');
//   const [activeCall, setActiveCall] = useState<Call | null>(null);
//   const [status, setStatus] = useState<'idle'|'dialing'|'ringing'|'in-progress'|'ended'|'failed'>('idle');
//   const [muted, setMuted] = useState(false);
//   const [duration, setDuration] = useState(0); // seconds
//   const timerRef = useRef<number | null>(null);
//   const toast = Toast();

//   // quick-fill phones from lead (dedup, keep + and digits)
//   const quickPhones = useMemo(() => {
//     const arr = [
//       (lead?.customer_phone ?? '').trim(),
//       (lead?.customer_phone2 ?? '').trim(),
//     ].filter(Boolean);
//     const cleaned = Array.from(new Set(
//       arr.map(p => p.replace(/[^\d+]/g, ''))
//     ));
//     return cleaned;
//   }, [lead]);

//   useEffect(() => {
//     if (!number && quickPhones.length) setNumber(quickPhones[0] || '');
//   }, [quickPhones, number]);

//   // timer helpers
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
//     if (!isInitialized || !number) return;

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

//     call.on('error', (err: any) => {
//     setStatus('failed');
//     clearTimer();
//     if (err?.code === 31402) {
//       toast.error('Audio device error (31402). Close other apps using the mic and retry');
//     } else {
//       toast.error('Call error: ' + (err?.message || 'Unknown error'));
//     }
//   });
//     // call.on('error', (err) => { console.error('[Dialer] call error', err); setStatus('failed'); clearTimer(); });
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

//   const copySid = async () => {
//     const sid = (activeCall as any)?.parameters?.CallSid || '';
//     if (sid) await navigator.clipboard.writeText(sid);
//   };

//   // pretty timer mm:ss
//   const mm = String(Math.floor(duration / 60)).padStart(2, '0');
//   const ss = String(duration % 60).padStart(2, '0');

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-[999] flex items-center justify-center">
//       {/* backdrop */}
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

//       {/* modal */}
//       <div
//         className={[
//           'relative w-[380px] max-w-[92vw] rounded-3xl shadow-2xl border border-white/10',
//           'bg-gradient-to-b from-white/90 to-white/70 dark:from-[#0b1220]/90 dark:to-[#0b1220]/70',
//           'p-5 animate-[fadeIn_200ms_ease-out]',
//           className || '',
//         ].join(' ')}
//         role="dialog"
//         aria-modal="true"
//       >
//         {/* header */}
//         <div className="flex items-center justify-between">
//           <div className="font-semibold text-lg">Dialer</div>
//           <button
//             type="button"
//             className="w-9 h-9 grid place-content-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
//             onClick={onClose}
//             aria-label="Close"
//           >
//             ✕
//           </button>
//         </div>
//         {/* contact line */}
//         <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
//           {lead?.customer_name ? (
//             <span>Calling <span className="font-medium">{lead.customer_name}</span></span>
//           ) : (
//             <span>Enter a number</span>
//           )}
//         </div>
//         {/* number + backspace */}
//         <div className="mt-4 flex items-center gap-2">
//           <input readOnly
//             value={number}
//             onChange={(e) => setNumber(e.target.value.replace(/[^\d+#*+]/g, ''))}
//             placeholder="+9715XXXXXXXX"
//             className="form-input flex-1 text-xl font-semibold rounded-2xl"
//           />
//           {/* onClick={backspace} */}
//           <button type="button" 
//             className="btn btn-outline-secondary px-3 rounded-2xl h-11"
//             aria-label="Backspace"
//             title="Backspace"
//           >
//             ⌫
//           </button>
//         </div>
//         {quickPhones.length > 0 && (
//           <div className="mt-2 flex gap-2 flex-wrap">
//             {quickPhones.map(p => (
//               <button
//                 key={p}
//                 type="button"
//                 className="px-3 py-1.5 rounded-full border text-sm hover:bg-black/5 dark:hover:bg-white/10"
//                 onClick={() => setNumber(p)}
//                 title="Use this number"
//               >
//                 {p}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* status + timer */}
//         <div className="mt-3 flex items-center justify-between">
//           <div className="text-sm">
//             <span
//               className={[
//                 'inline-block px-2 py-1 rounded-full border',
//                 status === 'in-progress' ? 'bg-green-50 text-green-700 border-green-200' :
//                 status === 'dialing' || status === 'ringing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
//                 status === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-200' :
//                 status === 'ended' ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-gray-50 text-gray-700 border-gray-200'
//               ].join(' ')}
//             >
//               {status.replace('-', ' ')}
//             </span>
//             {status === 'in-progress' && (
//               <span className="ml-2 text-gray-500 font-mono">{mm}:{ss}</span>
//             )}
//           </div>
//           {status === 'in-progress' && !muted && (
//             <div className="flex items-end gap-0.5 h-4">
//               {[0,1,2,3,4].map(i => (
//                 <span
//                   key={i}
//                   className="w-[3px] bg-green-500 inline-block animate-[bounce_1s_ease-in-out_infinite]"
//                   style={{ height: 6 + (i%2 ? 8 : 12), animationDelay: `${i*0.12}s` }}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* keypad */}
//         <div className="mt-4 grid grid-cols-3 gap-3">
//           {KEYS.map(k => (
//             <button
//               type="button"
//               key={k}
//               onClick={() => sendDigit(k)}
//               className="h-14 rounded-2xl border bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 backdrop-blur text-lg font-semibold active:scale-[0.98] shadow-sm"
//             >
//               {k}
//             </button>
//           ))}
//         </div>

//         {/* controls */}
//         <div className="mt-4 flex items-center justify-center gap-3">
//           <button
//             type="button"
//             disabled={!isInitialized || !!activeCall || !number}
//             onClick={handleCall}
//             className={`rounded-full h-12 px-6 text-white font-semibold shadow-lg transition ${(!isInitialized || !!activeCall || !number) ? 'bg-emerald-400/50 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}
//             title={!isInitialized ? 'Device not ready' : (!number ? 'Enter a number' : 'Call')}
//           >
//             Call
//           </button>

//           <button
//             type="button"
//             disabled={!activeCall}
//             onClick={toggleMute}
//             className={`rounded-full h-12 px-6 font-semibold shadow ${!activeCall ? 'bg-amber-400/40 text-white cursor-not-allowed' : (muted ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-white text-amber-600 border hover:bg-amber-50')}`}
//             title="Mute / Unmute"
//           >
//             {muted ? 'Unmute' : 'Mute'}
//           </button>

//           <button
//             type="button"
//             disabled={!activeCall}
//             onClick={handleHangup}
//             className={`rounded-full h-12 px-6 font-semibold shadow ${!activeCall ? 'bg-rose-400/40 text-white cursor-not-allowed' : 'bg-rose-500 text-white hover:bg-rose-600'}`}
//             title="Hang up"
//           >
//             End
//           </button>
//         </div>

//         {/* call meta */}
//         {activeCall && (
//           <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
//             <div>Call SID: <code>{(activeCall as any)?.parameters?.CallSid || '...'}</code></div>
//             <button onClick={copySid} className="underline hover:no-underline">copy</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dialer;





// components/Dialer.tsx
const Dialer: React.FC<DialerProps> = ({ identity, lead, open = true, onClose, className }) => {
  const { makeCall, isInitialized } = useTwilioDevice(identity);
  const [number, setNumber] = useState<string>('');
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [status, setStatus] = useState<'idle'|'dialing'|'ringing'|'in-progress'|'ended'|'failed'>('idle');
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<number | null>(null);
  const toast = Toast();

  // quick-fill phones from lead
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
  
  const resetTimer = () => { 
    clearTimer(); 
    setDuration(0); 
  };

  // dial function
  const handleCall = async () => {
    if (!isInitialized || !number) return;

    setStatus('dialing');
    resetTimer();

    try {
      const leadId = lead?.lead_id ?? 0;
      const call = await makeCall(number, leadId);
      
      if (!call) {
        setStatus('failed');
        toast.error('Failed to initiate call');
        return;
      }

      setActiveCall(call);

      // Set up call event listeners
      call.on('ringing', () => {
        setStatus('ringing');
        console.log('Call ringing');
      });
      
      call.on('accept', () => { 
        setStatus('in-progress'); 
        startTimer(); 
        console.log('Call accepted');
      });
      
      call.on('disconnect', () => { 
        setStatus('ended'); 
        setMuted(false); 
        clearTimer();
        console.log('Call disconnected');
      });

      call.on('error', (err: any) => {
        setStatus('failed');
        clearTimer();
        
        if (err?.code === 31402) {
            toast.error('Please close other apps using the microphone and try again.');
          } else if (err?.code === 31003) {
            toast.error('Please check your internet connection.');
          } else if (err?.code === 31208) {
            toast.error('The number may be invalid or unreachable.');
          } else if (err?.code === 31005) {
            toast.error('Client is busy unavailable — the number may be unreachable, inactive, or blocked.');
          } else if (err?.code === 31001) {
            toast.error('Call failed to connect, Please try again later.');
          } else if (err?.code === 31002) {
            toast.error('Network error, Unable to reach the destination.');
          } else if (err?.code === 31004) {
            toast.error('Call timed out, The destination did not answer in time.');
          } else if (err?.code === 31006) {
            toast.error('Call dropped, The connection was lost unexpectedly.');
          } else if (err?.code === 31205) {
            toast.error('Call canceled, The caller ended the call before it connected.');
          } else {
            toast.error('Call error: ' + (err?.message || 'Unknown error occurred.'));
          }
      });

      call.on('cancel', () => {
        setStatus('ended');
        clearTimer();
        toast.success('Call cancelled')
        
      });

    } catch (error: any) {
      // console.error('Call initiation error:', error);
      setStatus('failed');
      toast.error('Failed to start call: ' + (error?.message || 'Unknown error'));
    }
  };

  const handleHangup = () => {
    if (activeCall) {
      activeCall.disconnect();
      console.log('Manual hangup');
    }
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

  // FIX: Uncomment and fix backspace function
  const backspace = () => setNumber(n => n.slice(0, -1));

  const copySid = async () => {
    const sid = (activeCall as any)?.parameters?.CallSid || '';
    if (sid) {
      await navigator.clipboard.writeText(sid);
      toast.success('Call SID copied to clipboard');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (activeCall && status === 'in-progress') {
        activeCall.disconnect();
      }
    };
  }, []);

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
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg">Dialer</div>
          <button
            type="button"
            className="w-9 h-9 grid place-content-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
            onClick={onClose}
            aria-label="Close"
          > ✕ </button>
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
          <input 
            value={number}
            // onChange={(e) => setNumber(e.target.value.replace(/[^\d+#*]/g, ''))}
            placeholder="+9715XXXXXXXX"
            className="form-input flex-1 text-xl font-semibold rounded-2xl"
          />
          {/* FIX: Add backspace button functionality */}
          <button 
            type="button" 
            // onClick={backspace}
            className="btn btn-outline-secondary px-3 rounded-2xl h-11"
            aria-label="Backspace"
            title="Backspace"
            disabled={!number.length}
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
              disabled={status === 'dialing' || status === 'ringing'}
            >
              {k}
            </button>
          ))}
        </div>

        {/* controls */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={!isInitialized || !!activeCall || !number || status === 'dialing' || status === 'ringing'}
            onClick={handleCall}
            className={`rounded-full h-12 px-6 text-white font-semibold shadow-lg transition ${
              (!isInitialized || !!activeCall || !number || status === 'dialing' || status === 'ringing') 
                ? 'bg-emerald-400/50 cursor-not-allowed' 
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
            title={!isInitialized ? 'Device not ready' : (!number ? 'Enter a number' : (activeCall ? 'Call in progress' : 'Call'))}
          >
            {status === 'dialing' || status === 'ringing' ? 'Calling...' : 'Call'}
          </button>

          <button
            type="button"
            disabled={!activeCall || status !== 'in-progress'}
            onClick={toggleMute}
            className={`rounded-full h-12 px-6 font-semibold shadow ${
              !activeCall || status !== 'in-progress' 
                ? 'bg-amber-400/40 text-white cursor-not-allowed' 
                : (muted ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-white text-amber-600 border hover:bg-amber-50')
            }`}
            title={!activeCall ? 'No active call' : (muted ? 'Unmute' : 'Mute')}
          >
            {muted ? 'Unmute' : 'Mute'}
          </button>

          <button
            type="button"
            disabled={!activeCall || status === 'ended'}
            onClick={handleHangup}
            className={`rounded-full h-12 px-6 font-semibold shadow ${
              !activeCall || status === 'ended' 
                ? 'bg-rose-400/40 text-white cursor-not-allowed' 
                : 'bg-rose-500 text-white hover:bg-rose-600'
            }`}
            title={!activeCall ? 'No active call' : 'Hang up'}
          >
            End
          </button>
        </div>

        {/* call meta */}
        {activeCall && (
          <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
            <div>Call SID: <code className="truncate max-w-[120px] inline-block align-middle">
              {(activeCall as any)?.parameters?.CallSid || '...'}
            </code></div>
            <button onClick={copySid} className="underline hover:no-underline text-xs">copy</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialer;


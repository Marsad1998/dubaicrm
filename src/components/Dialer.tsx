// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { Call } from '@twilio/voice-sdk';
// import { useTwilioDevice } from '../hooks/useTwilioDevice';
// import Toast from '../services/toast';

// type LeadLite = {
//   lead_id?: number;
//   customer_phone?: string | null;
//   customer_phone2?: string | null;
//   customer_name?: string | null;
// };

// type DialerProps = {
//   identity: string; 
//   lead?: LeadLite | null; 
//   open?: boolean; 
//   onClose?: () => void; 
//   className?: string; 
// };

// const KEYS = ['1','2','3','4','5','6','7','8','9','*','0','#'];

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

const Dialer: React.FC<DialerProps> = ({ identity, lead, open = true, onClose, className }) => {
  const { makeCall, isInitialized } = useTwilioDevice(identity);
  const [number, setNumber] = useState<string>('');
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [status, setStatus] = useState<'idle'|'dialing'|'ringing'|'in-progress'|'ended'|'failed'|'busy'|'no-answer'|'canceled'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<number | null>(null);
  const toast = Toast();

  // Status messages mapping
  const statusMessages = {
    'idle': 'Ready to call',
    'dialing': 'Dialing...',
    'ringing': 'Ringing...',
    'in-progress': 'Call in progress',
    'ended': 'Call ended',
    'failed': 'Call failed',
    'busy': 'Line busy - User declined or is on another call',
    'no-answer': 'No answer - User didn\'t pick up',
    'canceled': 'Call canceled'
  };

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

  // Update status message whenever status changes
  useEffect(() => {
    setStatusMessage(statusMessages[status] || status);
  }, [status]);

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

  // Enhanced error and status handler
  const getStatusFromError = (error: any): ['busy' | 'no-answer' | 'failed' | 'canceled' | 'ended', string] => {
    if (!error) return ['ended', 'Call completed'];
    
    // Twilio specific error codes for call status
    const code = error.code;
    const message = error.message || '';
    
    if (code === 31005 || message.includes('busy') || message.includes('Busy')) {
      return ['busy', 'User is busy or line is occupied'];
    } else if (code === 31004 || message.includes('no-answer') || message.includes('No answer')) {
      return ['no-answer', 'No answer - user didn\'t pick up'];
    } else if (code === 31208 || message.includes('rejected')) {
      return ['busy', 'Call rejected by user'];
    } else if (code === 31003) {
      return ['failed', 'Connection error - check internet'];
    } else if (code === 31402) {
      return ['failed', 'Audio device error - check microphone'];
    } else if (message.includes('canceled') || code === 31001) {
      return ['canceled', 'Call canceled'];
    } else {
      return ['failed', `Call failed: ${message || 'Unknown error'}`];
    }
  };

  // dial function
  const handleCall = async () => {
    if (!isInitialized || !number) return;

    setStatus('dialing');
    setStatusMessage('Dialing...');
    resetTimer();

    try {
      const leadId = lead?.lead_id ?? 0;
      const call = await makeCall(number, leadId);
      
      if (!call) {
        setStatus('failed');
        setStatusMessage('Failed to initiate call');
        toast.error('Failed to initiate call');
        return;
      }

      setActiveCall(call);

      // Enhanced call event listeners with proper status handling
      call.on('ringing', () => {
        setStatus('ringing');
        setStatusMessage('Ringing...');
        console.log('Call ringing');
      });
      
      call.on('accept', () => { 
        setStatus('in-progress'); 
        setStatusMessage('Call connected');
        startTimer(); 
        console.log('Call accepted');
        toast.success('Call connected!');
      });
      
      call.on('disconnect', (error) => { 
        const [newStatus, message] = getStatusFromError(error);
        setStatus(newStatus);
        setStatusMessage(message);
        setMuted(false); 
        clearTimer();
        
        // Show appropriate toast message
        if (newStatus === 'busy') {
          toast.warning('Line busy - user unavailable');
        } else if (newStatus === 'no-answer') {
          toast.warning('No answer - user didn\'t pick up');
        } else if (newStatus === 'ended') {
          toast.info('Call completed');
        }
        
        console.log('Call disconnected:', message);
      });

      call.on('error', (err: any) => {
        const [newStatus, message] = getStatusFromError(err);
        setStatus(newStatus);
        setStatusMessage(message);
        clearTimer();
        console.error('Call error:', err);
        
        // Show appropriate toast based on status
        if (newStatus === 'busy') {
          toast.warning('Line busy - user unavailable');
        } else if (newStatus === 'no-answer') {
          toast.warning('No answer');
        } else {
          toast.error(message);
        }
      });

      call.on('cancel', () => {
        setStatus('canceled');
        setStatusMessage('Call canceled');
        clearTimer();
        toast.info('Call canceled');
      });

    } catch (error: any) {
      console.error('Call initiation error:', error);
      setStatus('failed');
      setStatusMessage('Failed to start call');
      toast.error('Failed to start call: ' + (error?.message || 'Unknown error'));
    }
  };

  const handleHangup = () => {
    if (activeCall) {
      activeCall.disconnect();
      setStatus('ended');
      setStatusMessage('Call ended manually');
      toast.info('Call ended');
      console.log('Manual hangup');
    }
    setActiveCall(null);
    setMuted(false);
    clearTimer();
  };

  const toggleMute = () => {
    if (!activeCall) return;
    const next = !muted;
    activeCall.mute(next);
    setMuted(next);
    toast.info(next ? 'Microphone muted' : 'Microphone unmuted');
  };

  const sendDigit = (d: string) => {
    if (activeCall && status === 'in-progress') {
      activeCall.sendDigits(d);
      toast.info(`Sent digit: ${d}`);
    }
    setNumber(prev => (prev + d).replace(/[^\d+#*]/g, ''));
  };

  const backspace = () => {
    setNumber(n => n.slice(0, -1));
  };

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
      if (activeCall && (status === 'in-progress' || status === 'ringing' || status === 'dialing')) {
        activeCall.disconnect();
      }
    };
  }, [activeCall, status]);

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
          'relative w-[420px] max-w-[92vw] rounded-3xl shadow-2xl border border-white/10',
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
            onChange={(e) => setNumber(e.target.value.replace(/[^\d+#*]/g, ''))}
            placeholder="+9715XXXXXXXX"
            className="form-input flex-1 text-xl font-semibold rounded-2xl"
          />
          <button 
            type="button" 
            onClick={backspace}
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

        {/* Enhanced status display */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span
                className={[
                  'inline-block px-2 py-1 rounded-full border text-xs font-medium',
                  status === 'in-progress' ? 'bg-green-50 text-green-700 border-green-200' :
                  status === 'dialing' || status === 'ringing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  status === 'busy' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  status === 'no-answer' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  status === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  status === 'ended' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                  status === 'canceled' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
                ].join(' ')}
              >
                {status.replace('-', ' ').toUpperCase()}
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
          
          {/* Status message */}
          <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
            {statusMessage}
          </div>
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
            disabled={!activeCall || status === 'ended' || status === 'failed' || status === 'busy' || status === 'no-answer'}
            onClick={handleHangup}
            className={`rounded-full h-12 px-6 font-semibold shadow ${
              !activeCall || status === 'ended' || status === 'failed' || status === 'busy' || status === 'no-answer'
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





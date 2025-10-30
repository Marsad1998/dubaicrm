import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useRef, useEffect } from 'react';
import { fetchVoiceRecordingUrl } from '../slices/dashboardSlice';
import { useDashboardStates } from '../hooks/useDashboardStates';

interface CallLogData {
    id: number;
    lead_id: number;
    agent_id: number;
    call_sid: string;
    from: string;
    to: string;
    call_status: string;
    duration: number;
    direction: string;
    recording_url: string | null;
    created_at: string | null;
    updated_at: string | null;
}

interface CallLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: CallLogData[] | null;
}

const CallLogModal: React.FC<CallLogModalProps> = ({ isOpen, onClose, data }) => {
    const [currentAudio, setCurrentAudio] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // ✅ FIXED
    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const { dispatch } = useDashboardStates();

    const handlePlayRecording = async (recordingUrl: string) => {
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();   // actually stop playback
            setIsPlaying(false);
            return;
        }
        
        const recordingSid = recordingUrl.split('/').pop()?.replace('.mp3', '') || '';
        if (!recordingSid) return;

        try {
            setIsLoading(true);
            const result = await dispatch(fetchVoiceRecordingUrl(recordingSid));

            if (fetchVoiceRecordingUrl.fulfilled.match(result)) {
                const playableUrl = result.payload;

                if (currentAudio === playableUrl && audioRef.current) {
                    if (isPlaying) {
                        audioRef.current.pause();
                    } else {
                        audioRef.current.play();
                    }
                } else {
                    setCurrentAudio(playableUrl);
                    setTimeout(() => {
                        audioRef.current?.play();
                    }, 0);
                }
            }
        } finally {
            setIsLoading(false); // ✅ Stop loading after request
        }
    };

    const handleAudioEnded = () => setIsPlaying(false);
    const handleAudioPlay = () => setIsPlaying(true);
    const handleAudioPause = () => setIsPlaying(false);

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        return () => {
            if (currentAudio) URL.revokeObjectURL(currentAudio);
        };
    }, [currentAudio]);

    return (
        <>
            {currentAudio && (
                <audio
                    ref={audioRef}
                    src={currentAudio}
                    onEnded={handleAudioEnded}
                    onPlay={handleAudioPlay}
                    onPause={handleAudioPause}
                    onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                    onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                    onError={() => {
                        console.error('Error playing audio');
                        setIsPlaying(false);
                    }}
                />
            )}

            <Transition show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-60" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="p-5">
                                        <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
                                            Call Recordings
                                        </h3>

                                        {data && data.length > 0 ? (
                                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                                {data.map((call) => (
                                                    <div
                                                        key={call.id}
                                                        className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg"
                                                    >
                                                        <div className="flex items-center space-x-4">
                                                            {call.recording_url ? (
                                                                <div>
                                                                    <button
                                                                        type="button"
                                                                        className={`btn btn-sm ${
                                                                            isPlaying
                                                                                ? 'btn-outline-danger'
                                                                                : 'btn-outline-primary'
                                                                        }`}
                                                                        onClick={() => handlePlayRecording(call.recording_url!)}
                                                                        disabled={isLoading} // ✅ Works now
                                                                    >
                                                                        {isPlaying ? (
                                                                            <span className="flex items-center">
                                                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                                                    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                                                                                </svg>
                                                                                Pause
                                                                            </span>
                                                                        ) : (
                                                                            <span className="flex items-center">
                                                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                                                    <path d="M8 5v14l11-7z" />
                                                                                </svg>
                                                                                Play
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                    {isPlaying && (
                                                                        <span className="ml-2 text-xs text-gray-600 dark:text-gray-300">
                                                                            {Math.floor(currentTime)}s / {Math.floor(duration)}s
                                                                        </span>
                                                                    )}

                                                                </div>
                                                                
                                                            ) : (
                                                                <div className="w-20 text-center text-sm text-gray-500 dark:text-gray-400">
                                                                    No Recording
                                                                </div>
                                                            )}

                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-black dark:text-white">
                                                                    Duration: {formatDuration(call.duration)}
                                                                </span>
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Agent: {call.agent_id}
                                                                </span>
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    From: {call.from} → To: {call.to}
                                                                </span>
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Status: {call.call_status}
                                                                </span>
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Created: {new Date(call.created_at || '').toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* {call.recording_url && (
                                                            <a
                                                                href={`/api/voice/recording/${call.recording_url
                                                                    .split('/')
                                                                    .pop()
                                                                    ?.replace('.mp3', '')}`}
                                                                download={`call-recording-${call.call_sid}.mp3`}
                                                                className="btn btn-outline-success btn-sm"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                                                                </svg>
                                                                Download
                                                            </a>
                                                        )} */}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-black dark:text-white">
                                                No call recordings available
                                            </div>
                                        )}

                                        <div className="flex justify-end items-center mt-6">
                                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={onClose}>
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default CallLogModal;

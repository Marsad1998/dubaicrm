import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../slices/themeConfigSlice';
import IconSend from '../../components/Icon/IconSend';
import IconMenu from '../../components/Icon/IconMenu';
import IconSearch from '../../components/Icon/IconSearch';
import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import echo from '../../lib/echo';

const endpoints = {
  OutboundInboutApi: `${getBaseUrl()}/whatsapp/chat/outbound_inbound_contact`,
  messages: (phone: string) => `${getBaseUrl()}/whatsapp/chat/messages/${phone}`,
  markRead: (phone: string) => `${getBaseUrl()}/whatsapp/chat/messages/${phone}/read`,
  sendMessage: `${getBaseUrl()}/whatsapp/chat/send-message`,
};

interface WhatsAppMessage {
  id: number;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'received';
  message: string;
  template_name?: string | null;
  template_id?: number | null;
  message_time: string;
  sid?: string | null;
}

interface ChatContact {
  phone: string;
  last_message: string;
  last_message_time: string;
  message_count: number;
  unread_count: number;
  avatar_color: string;
}

interface IncomingMessageData {
  sid: string | null | undefined;
  direction: string;
  id: number;
  from: string;
  payload: string;
  created_at: string;
  status: string;
  template?: { friendly_name?: string };
}

const Chat = () => {
  const dispatch = useDispatch();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [isShowChatMenu, setIsShowChatMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileTab, setProfileTab] = useState('Media');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // ✅ Ref to always have latest selectedContact inside WebSocket closure
  const selectedContactRef = useRef<ChatContact | null>(null);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    dispatch(setPageTitle('WhatsApp Chat'));
    loadContacts();
  }, [dispatch]);

  // ✅ WebSocket: runs ONCE, uses ref to get current selectedContact
  useEffect(() => {
    const channel = echo.channel('whatsapp-messages');

    channel.listen('.message.sent', (e: { chat: IncomingMessageData }) => {
      const chat = e.chat;
      if (!chat) return;

      const phone = chat.from.replace('whatsapp:', '');
      let messageBody = '';
      try {
        messageBody = JSON.parse(chat.payload)?.body ?? '';
      } catch {
        // ignore parse errors
      }

      const current = selectedContactRef.current;

      if (chat.direction === 'inbound') {
        // Update contacts sidebar
        setContacts(prev => {
          const exists = prev.find(c => c.phone === phone);
          const isOpen = current?.phone === phone;
          if (exists) {
            return prev
              .map(c => c.phone === phone
                ? { ...c, last_message: messageBody, last_message_time: chat.created_at, message_count: c.message_count + 1, unread_count: isOpen ? 0 : c.unread_count + 1 }
                : c
              )
              .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());
          }
          return [
            { phone, last_message: messageBody, last_message_time: chat.created_at, message_count: 1, unread_count: 1, avatar_color: '#' + Math.floor(Math.random() * 16777215).toString(16) },
            ...prev,
          ];
        });

        // If this contact is open, append to messages
        if (current?.phone === phone) {
          setMessages(prev => [...prev, {
            id: chat.id,
            direction: 'inbound',
            status: (chat.status as WhatsAppMessage['status']) || 'received',
            message: messageBody,
            template_name: chat.template?.friendly_name ?? null,
            message_time: chat.created_at,
            sid: chat.sid,
          }]);
          markMessagesAsRead(phone);
        }

      } else if (chat.direction === 'outbound' && chat.sid) {
        // ✅ Update existing message status by SID (no new message added)
        if (current?.phone === phone) {
          setMessages(prev =>
            prev.map(msg =>
              msg.sid === chat.sid
                ? { ...msg, status: chat.status as WhatsAppMessage['status'] }
                : msg
            )
          );
        }
      }
    });

    return () => {
      echo.leave('whatsapp-messages');
    };
  }, []); // ✅ empty deps — uses ref, no stale closure

  const loadContacts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(endpoints.OutboundInboutApi);
      if (res.data?.status) setContacts(res.data.data as ChatContact[]);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (phone: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get(endpoints.messages(phone));
      if (res.data?.status) {
        setMessages(res.data.data as WhatsAppMessage[]);
        await markMessagesAsRead(phone);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (phone: string) => {
    try {
      await apiClient.post(endpoints.markRead(phone));
      setContacts(prev => prev.map(c => c.phone === phone ? { ...c, unread_count: 0 } : c));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const selectContact = (contact: ChatContact) => {
    setSelectedContact(contact);
    setShowProfile(false);
    loadMessages(contact.phone);
    setIsShowChatMenu(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || loading) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // ✅ Temp message with a local tempId to track it
    const tempId = Date.now();
    const tempMessage: WhatsAppMessage = {
      id: tempId,
      direction: 'outbound',
      status: 'sent',
      message: messageText,
      message_time: new Date().toISOString(),
       sid: `temp_${tempId}`, 
      // sid: null, 
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      setLoading(true);
      const templateId = messages[0]?.template_id ? Number(messages[0].template_id) : null;

      const res = await apiClient.post(endpoints.sendMessage, {
        to: selectedContact.phone,
        message: messageText,
        template_id: templateId,
      });

      if (res.data?.status) {
        const realSid: string | null = res.data?.data?.sid ?? res.data?.sid ?? null;
        const realId: number = res.data?.data?.id ?? tempId;

        setMessages(prev =>
          prev.map(msg => msg.id === tempId ? { ...msg, id: realId, sid: realSid, status: 'sent' } : msg )
        );
      }

      // if (res.data?.status) {
      //   const realSid: string | null = res.data?.data?.sid ?? res.data?.sid ?? null;
      //   const realId: number = res.data?.data?.id ?? tempId;

      //   setMessages(prev =>
      //     prev.map(msg => msg.id === tempId ? { ...msg, id: realId, sid: realSid, status: 'sent' } : msg )
      //   );
      // } else {
        else { 
          setMessages(prev =>
          prev.map(msg => msg.id === tempId ? { ...msg, status: 'failed' } : msg)
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev =>
        prev.map(msg => msg.id === tempId ? { ...msg, status: 'failed' } : msg)
      );
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.phone.toLowerCase().includes(searchContact.toLowerCase())
  );

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return formatTime(dateString);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getInitials = (phone: string) => phone.replace(/\D/g, '').slice(-4) || 'WA';

  const getStatusIcon = (status: string) => {
    if (status === 'read') return (
      <svg className="w-4 h-4" viewBox="0 0 16 11" fill="#53bdeb">
        <path d="M11.071.653a.75.75 0 0 1 .025 1.06L4.92 8.33l-3.02-2.7a.75.75 0 0 1 1.003-1.117l1.97 1.76L10.01.678a.75.75 0 0 1 1.061-.025Z"/>
        <path d="M14.571.653a.75.75 0 0 1 .025 1.06l-6.8 7.2a.75.75 0 0 1-1.085-.025L5.236 7.01a.75.75 0 1 1 1.028-1.092l1.048 1.285 6.2-6.575a.75.75 0 0 1 1.059.025Z"/>
      </svg>
    );
    if (status === 'delivered') return (
      <svg className="w-4 h-4" viewBox="0 0 16 11" fill="#667781">
        <path d="M11.071.653a.75.75 0 0 1 .025 1.06L4.92 8.33l-3.02-2.7a.75.75 0 0 1 1.003-1.117l1.97 1.76L10.01.678a.75.75 0 0 1 1.061-.025Z"/>
        <path d="M14.571.653a.75.75 0 0 1 .025 1.06l-6.8 7.2a.75.75 0 0 1-1.085-.025L5.236 7.01a.75.75 0 1 1 1.028-1.092l1.048 1.285 6.2-6.575a.75.75 0 0 1 1.059.025Z"/>
      </svg>
    );
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 12 11" fill="#667781">
        <path d="M10.95.47a.75.75 0 0 1 .08 1.057L5.114 8.44 1.22 5.1a.75.75 0 1 1 .97-1.143l2.716 2.309 5.002-5.72A.75.75 0 0 1 10.95.47Z"/>
      </svg>
    );
  };

  return (
    <div>
      <div className={`flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full ${isShowChatMenu ? 'min-h-[999px]' : ''}`}>

        {/* Contacts Sidebar */}
        <div
          className={`flex-none w-[320px] absolute xl:relative z-10 xl:h-full hidden xl:flex flex-col overflow-hidden rounded-md shadow ${isShowChatMenu ? '!flex' : ''}`}
          style={{ background: '#f0f2f5' }}
        >
          <div className="flex justify-between items-center px-4 h-16 flex-shrink-0" style={{ background: '#f0f2f5' }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#25d366] flex items-center justify-center text-white font-bold text-sm">WA</div>
              <h2 className="text-[#111b21] font-semibold text-base">WhatsApp Chats</h2>
            </div>
            <button type="button" className="xl:hidden text-[#54656f]" onClick={() => setIsShowChatMenu(false)}><IconMenu /></button>
          </div>

          <div className="px-3 py-2">
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none bg-white text-[#111b21]"
                placeholder="Search contacts..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#54656f]"><IconSearch /></span>
            </div>
          </div>

          <div className="h-px w-full" style={{ background: '#e9edef' }} />

          <div className="flex-1 overflow-y-auto">
            {loading && contacts.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin border-2 border-[#25d366] border-t-transparent rounded-full w-8 h-8 mx-auto" />
                <p className="mt-2 text-sm text-[#667781]">Loading contacts...</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.phone}
                  className="flex items-center px-4 py-3 cursor-pointer transition-colors border-b"
                  style={{ borderColor: '#e9edef', background: selectedContact?.phone === contact.phone ? '#ffffff' : 'transparent' }}
                  onClick={() => selectContact(contact)}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm" style={{ backgroundColor: contact.avatar_color }}>
                    {getInitials(contact.phone)}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-medium text-sm truncate text-[#111b21]">{contact.phone}</p>
                      <span className="text-xs whitespace-nowrap ml-2" style={{ color: contact.unread_count > 0 ? '#25d366' : '#667781' }}>
                        {formatDate(contact.last_message_time)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <p className="text-xs truncate text-[#667781]">{contact.last_message}</p>
                      {contact.unread_count > 0 && (
                        <span className="text-white text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center ml-2 flex-shrink-0 font-medium bg-[#25d366]">
                          {contact.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {!loading && filteredContacts.length === 0 && (
              <div className="text-center py-10 px-4">
                <p className="font-medium text-[#667781]">No contacts found</p>
                <p className="text-sm mt-1 text-[#8696a0]">WhatsApp messages will appear here automatically</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="panel p-0 flex-1 flex overflow-hidden" style={{ background: '#e5ddd5' }}>
          {!selectedContact ? (
            <div className="flex-1 flex items-center justify-center" style={{ background: '#f0f2f5' }}>
              <div className="text-center">
                <div className="w-40 h-40 mx-auto mb-6 rounded-full flex items-center justify-center bg-white shadow-md">
                  <svg viewBox="0 0 24 24" className="w-24 h-24" fill="#25d366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.189-1.248-6.189-3.515-8.444" />
                  </svg>
                </div>
                <h3 className="text-2xl font-light mb-2 text-[#41525d]">WhatsApp Business Chat</h3>
                <p className="text-[#667781]">Select a contact to start chatting</p>
                <p className="text-sm mt-1 text-[#8696a0]">Incoming WhatsApp messages will appear automatically</p>
                <button className="xl:hidden mt-5 px-6 py-2 rounded-full text-white text-sm font-medium bg-[#25d366]" onClick={() => setIsShowChatMenu(true)}>View Chats</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="flex justify-between items-center px-4 h-16 flex-shrink-0" style={{ background: '#f0f2f5', borderBottom: '1px solid #e9edef' }}>
                  <div className="flex items-center space-x-3">
                    <button type="button" className="xl:hidden text-[#54656f]" onClick={() => setIsShowChatMenu(true)}><IconMenu /></button>
                    <button className="flex items-center space-x-3 hover:opacity-80 transition-opacity" onClick={() => setShowProfile(v => !v)}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: selectedContact.avatar_color }}>
                        {getInitials(selectedContact.phone)}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm text-[#111b21]">{selectedContact.phone}</p>
                        <p className="text-xs text-[#667781]">{selectedContact.message_count} messages · click for info</p>
                      </div>
                    </button>
                  </div>
                  <button type="button" className="p-2 rounded-full hover:bg-[#d9dbe0] text-[#54656f] transition-colors" onClick={() => setShowProfile(v => !v)}>
                    <IconHorizontalDots />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4" style={{ background: '#e5ddd5' }}>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin border-2 border-t-transparent rounded-full w-8 h-8" style={{ borderColor: '#25d366', borderTopColor: 'transparent' }} />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {messages.map((message, index) => {
                        const showDate = index === 0 || new Date(message.message_time).toDateString() !== new Date(messages[index - 1]?.message_time).toDateString();
                        const showAvatar = index === messages.length - 1 || messages[index + 1]?.direction !== message.direction;
                        return (
                          <div key={message.id}>
                            {showDate && (
                              <div className="flex justify-center my-4">
                                <span className="text-xs px-3 py-1 rounded-full shadow-sm bg-white text-[#54656f]">
                                  {new Date(message.message_time).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                              </div>
                            )}
                            <div className={`flex items-end mb-0.5 ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                              {message.direction === 'inbound' && (
                                <div className="w-8 flex-shrink-0 mr-1 mb-1">
                                  {showAvatar && (
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: selectedContact.avatar_color }}>
                                      {getInitials(selectedContact.phone)}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div
                                className="relative max-w-xs lg:max-w-md px-3 pt-2 pb-5 shadow-sm"
                                style={{
                                  background: message.direction === 'outbound' ? '#d9fdd3' : '#ffffff',
                                  borderRadius: message.direction === 'outbound' ? '8px 0px 8px 8px' : '0px 8px 8px 8px',
                                }}
                              >
                                {message.direction === 'outbound'
                                  ? <span className="absolute top-0 -right-2 w-0 h-0" style={{ borderLeft: '8px solid #d9fdd3', borderBottom: '8px solid transparent' }} />
                                  : <span className="absolute top-0 -left-2 w-0 h-0" style={{ borderRight: '8px solid #ffffff', borderBottom: '8px solid transparent' }} />
                                }
                                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#111b21]">{message.message}</p>
                                <div className="absolute bottom-1 right-2 flex items-center space-x-1">
                                  <span className="text-[10px] text-[#667781]">{formatTime(message.message_time)}</span>
                                  {message.direction === 'outbound' && message.status && getStatusIcon(message.status)}
                                </div>
                              </div>
                              {message.direction === 'outbound' && <div className="w-2 flex-shrink-0 ml-1" />}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="px-4 py-3 flex items-center space-x-2 flex-shrink-0" style={{ background: '#f0f2f5', borderTop: '1px solid #e9edef' }}>
                  <input
                    type="text"
                    className="flex-1 rounded-lg px-4 py-2.5 text-sm focus:outline-none bg-white text-[#111b21]"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    type="button"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-40"
                    style={{ background: newMessage.trim() ? '#25d366' : '#aebac1' }}
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || loading}
                  >
                    <IconSend className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Profile Panel */}
              {showProfile && (
                <div className="w-[320px] flex-shrink-0 flex flex-col overflow-hidden border-l bg-white" style={{ borderColor: '#e9edef' }}>
                  <div className="px-4 h-16 flex items-center space-x-4 flex-shrink-0" style={{ background: '#f0f2f5' }}>
                    <button onClick={() => setShowProfile(false)} className="text-[#54656f]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <h2 className="font-medium text-base text-[#111b21]">Contact Info</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col items-center px-6 pt-8 pb-6 border-b" style={{ borderColor: '#e9edef' }}>
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-md" style={{ backgroundColor: selectedContact.avatar_color }}>
                        {getInitials(selectedContact.phone)}
                      </div>
                      <h3 className="text-xl font-semibold text-[#111b21]">{selectedContact.phone}</h3>
                      <p className="text-sm mt-1 text-[#667781]">WhatsApp Contact</p>
                    </div>
                    <div className="px-6 py-4 border-b" style={{ borderColor: '#e9edef' }}>
                      <p className="text-xs font-medium uppercase tracking-wide mb-2 text-[#25d366]">About</p>
                      <p className="text-sm text-[#111b21]">Available</p>
                    </div>
                    <div className="px-6 py-4 border-b" style={{ borderColor: '#e9edef' }}>
                      <p className="text-xs font-medium uppercase tracking-wide mb-3 text-[#25d366]">Stats</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl p-3 text-center bg-[#f0f2f5]">
                          <p className="text-2xl font-bold text-[#25d366]">{selectedContact.message_count}</p>
                          <p className="text-xs mt-1 text-[#667781]">Total Messages</p>
                        </div>
                        <div className="rounded-xl p-3 text-center bg-[#f0f2f5]">
                          <p className="text-2xl font-bold text-[#25d366]">{selectedContact.unread_count}</p>
                          <p className="text-xs mt-1 text-[#667781]">Unread</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex border-b" style={{ borderColor: '#e9edef' }}>
                        {['Media', 'Files', 'Links'].map((tab) => (
                          <button key={tab} onClick={() => setProfileTab(tab)} className="flex-1 py-3 text-sm font-medium transition-colors"
                            style={{ color: profileTab === tab ? '#25d366' : '#667781', borderBottom: profileTab === tab ? '2px solid #25d366' : '2px solid transparent' }}>
                            {tab}
                          </button>
                        ))}
                      </div>
                      <div className="p-4">
                        {profileTab === 'Media' && (
                          <div className="grid grid-cols-3 gap-1">
                            {['#25d366', '#128c7e', '#075e54', '#34b7f1', '#00bfa5', '#43a047'].map((color, i) => (
                              <div key={i} className="aspect-square rounded-md flex items-center justify-center" style={{ background: color + '22' }}>
                                <svg className="w-6 h-6" fill={color} viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                              </div>
                            ))}
                          </div>
                        )}
                        {profileTab === 'Files' && (
                          <div className="space-y-2">
                            {['document.pdf', 'report.xlsx', 'notes.docx'].map((f) => (
                              <div key={f} className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer bg-[#f0f2f5]">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#25d36622' }}>
                                  <svg className="w-4 h-4" fill="#25d366" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                                </div>
                                <span className="text-sm text-[#111b21]">{f}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {profileTab === 'Links' && (
                          <div className="space-y-2">
                            {['https://example.com', 'https://google.com'].map((link) => (
                              <div key={link} className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer bg-[#f0f2f5]">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#34b7f122' }}>
                                  <svg className="w-4 h-4" fill="#34b7f1" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                                </div>
                                <span className="text-sm truncate text-[#34b7f1]">{link}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

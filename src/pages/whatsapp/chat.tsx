// src/pages/WhatsApp/Chat.tsx
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { IRootState } from '../../store';
import { setPageTitle } from '../../slices/themeConfigSlice';

import IconSend from '../../components/Icon/IconSend';
import IconMenu from '../../components/Icon/IconMenu';
import IconSearch from '../../components/Icon/IconSearch';
import IconPhone from '../../components/Icon/IconPhone';
import IconVideo from '../../components/Icon/IconVideo';
import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';

import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';

const endpoints = {
  // Chat-related endpoints
  OutboundInboutApi: `${getBaseUrl()}/whatsapp/chat/outbound_inbout_contact`,
  messages: (phone: string) => `${getBaseUrl()}/whatsapp/chat/messages/${phone}`,
  markRead: (phone: string) => `${getBaseUrl()}/whatsapp/chat/messages/${phone}/read`,
  sendMessage: `${getBaseUrl()}/whatsapp/chat/send-message`,
};

interface WhatsAppMessage {
  id: number;
  from: string;
  body: string;
  button_text?: string;
  button_payload?: string;
  created_at: string;
  template?: {
    id: number;
    friendly_name: string;
  };
  type: 'inbound' | 'outbound';
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

interface ChatContact {
  phone: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  template_id?: number;
}

const Chat = () => {
  const dispatch = useDispatch();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [isShowChatMenu, setIsShowChatMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(setPageTitle('WhatsApp Chat'));
    LoadOutboundInboudContact();
    setupPusherListener();
  }, [dispatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const setupPusherListener = () => {
    // Listen for new incoming WhatsApp messages
    // @ts-ignore
    window.Echo
      .channel('whatsapp-messages')
      .listen('.message.received', (data: any) => {
        console.log('📨 New message received:', data);

        if (selectedContact && data.from === selectedContact.phone) {
          setMessages((prev) => [
            ...prev,
            {
              id: data.id,
              from: data.from,
              body: data.body,
              button_text: data.button_text,
              button_payload: data.button_payload,
              created_at: data.created_at,
              template: data.template,
              type: 'inbound',
            },
          ]);
        }

        // Update contacts list
        updateContactsWithNewMessage(data);
      });
  };

  const updateContactsWithNewMessage = (messageData: any) => {
    setContacts((prev) => {
      const existingContact = prev.find((c) => c.phone === messageData.from);

      if (existingContact) {
        return prev.map((c) =>
          c.phone === messageData.from
            ? {
                ...c,
                last_message: messageData.body,
                last_message_time: new Date().toLocaleTimeString(),
                unread_count: c.unread_count + 1,
              }
            : c
        );
      }

      // New contact
      return [
        {
          phone: messageData.from,
          last_message: messageData.body,
          last_message_time: new Date().toLocaleTimeString(),
          unread_count: 1,
          template_id: messageData.template?.id,
        },
        ...prev,
      ];
    });
  };

  const LoadOutboundInboudContact = async () => {
    try {
      const res = await apiClient.get(endpoints.OutboundInboutApi);
      const data = res.data;
      if (data?.status) {
        setContacts(data.data as ChatContact[]);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const loadMessages = async (phone: string) => {
    try {
      const res = await apiClient.get(endpoints.messages(phone));
      const data = res.data;
      if (data?.status) {
        setMessages(data.data as WhatsAppMessage[]);
        await markMessagesAsRead(phone);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const markMessagesAsRead = async (phone: string) => {
    try {
      await apiClient.post(endpoints.markRead(phone));
      // Update contacts to reset unread count
      setContacts((prev) =>
        prev.map((c) => (c.phone === phone ? { ...c, unread_count: 0 } : c))
      );
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const selectContact = (contact: ChatContact) => {
    setSelectedContact(contact);
    loadMessages(contact.phone);
    setIsShowChatMenu(false);
  };

//   const sendMessage = async () => {
//     if (!newMessage.trim() || !selectedContact) return;

//     try {
//       const res = await apiClient.post(endpoints.sendMessage, {
//         to: selectedContact.phone,
//         message: newMessage.trim(),
//       });

//       const result = res.data;

//       if (result?.status) {
//         // Add message to local state immediately
//         const tempMessage: WhatsAppMessage = {
//           id: Date.now(), // Temporary ID
//           from: selectedContact.phone,
//           body: newMessage.trim(),
//           created_at: new Date().toISOString(),
//           type: 'outbound',
//           status: 'sent',
//         };

//         setMessages((prev) => [...prev, tempMessage]);
//         setNewMessage('');

//         // Update contact last message
//         setContacts((prev) =>
//           prev.map((c) =>
//             c.phone === selectedContact.phone
//               ? {
//                   ...c,
//                   last_message: newMessage.trim(),
//                   last_message_time: new Date().toLocaleTimeString(),
//                 }
//               : c
//           )
//         );
//       }
//     } catch (error) {
//       console.error('Failed to send message:', error);
//     }
//   };


    const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    try {
        // Get the last template used with this contact
        const lastMessageRes = await apiClient.get(`${getBaseUrl()}/whatsapp/last-template/${selectedContact.phone}`);
        const lastTemplate = lastMessageRes.data.data;

        if (!lastTemplate) {
        alert('No campaign template found for this contact');
        return;
        }

        const res = await apiClient.post(`${getBaseUrl()}/whatsapp/campaign-reply`, {
        to: selectedContact.phone,
        message: newMessage.trim(),
        template_id: lastTemplate.id
        });

        const result = res.data;

        if (result?.status) {
        // Add message to local state
        const tempMessage: WhatsAppMessage = {
            id: Date.now(),
            from: selectedContact.phone,
            body: newMessage.trim(),
            created_at: new Date().toISOString(),
            type: 'outbound',
            status: 'sent',
            // template_id: lastTemplate.id
        };

        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage('');

        // Update contact last message
        setContacts((prev) =>
            prev.map((c) =>
            c.phone === selectedContact.phone
                ? {
                    ...c,
                    last_message: newMessage.trim(),
                    last_message_time: new Date().toLocaleTimeString(),
                }
                : c
            )
        );
        }
    } catch (error) {
        console.error('Failed to send message:', error);
        alert('Failed to send reply. Please try again.');
    }
    };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  console.log(contacts);

  const filteredContacts = contacts.filter((c) =>
    
    c.phone.toLowerCase().includes(searchContact.toLowerCase())

    
  );

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div
        className={`flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full ${
          isShowChatMenu ? 'min-h-[999px]' : ''
        }`}
      >
        {/* Contacts Sidebar */}
        <div
          className={`panel p-4 flex-none max-w-xs w-full absolute xl:relative z-10 space-y-4 xl:h-full hidden xl:block overflow-hidden ${
            isShowChatMenu ? '!block' : ''
          }`}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">WhatsApp Chats</h2>
            <button
              type="button"
              className="xl:hidden hover:text-primary"
              onClick={() => setIsShowChatMenu(false)}
            >
              <IconMenu />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              className="form-input peer ltr:pr-9 rtl:pl-9"
              placeholder="Search contacts..."
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
            />
            <div className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 peer-focus:text-primary">
              <IconSearch />
            </div>
          </div>

          <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>

          <div className="space-y-2 max-h-[calc(100vh_-_200px)] overflow-y-auto">
            {filteredContacts.map((contact) => (
               
              <div
                key={contact.phone}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedContact?.phone === contact.phone
                    ? 'bg-primary text-white shadow-md'
                    : 'hover:bg-gray-100 dark:hover:bg-[#1b2e4b]'
                }`}
                onClick={() => selectContact(contact)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold truncate ${
                        selectedContact?.phone === contact.phone
                          ? 'text-white'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {contact.phone}
                    </p>
                    <p
                      className={`text-sm truncate ${
                        selectedContact?.phone === contact.phone
                          ? 'text-white/80'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {contact.last_message}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1 ml-2">
                    <span
                      className={`text-xs ${
                        selectedContact?.phone === contact.phone
                          ? 'text-white/70'
                          : 'text-gray-500'
                      }`}
                    >
                      {contact.last_message_time}
                    </span>
                    {contact.unread_count > 0 && (
                      <span className="bg-danger text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {contact.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredContacts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No contacts found</p>
                <p className="text-sm mt-2">
                  WhatsApp messages will appear here automatically
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="panel p-0 flex-1">
          {!selectedContact ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 opacity-50">
                  {/* WhatsApp Icon SVG */}
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.189-1.248-6.189-3.515-8.444" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">WhatsApp Business Chat</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Select a contact to start chatting
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Incoming WhatsApp messages will appear automatically
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="xl:hidden hover:text-primary"
                    onClick={() => setIsShowChatMenu(true)}
                  >
                    <IconMenu />
                  </button>
                  <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">W</span>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedContact.phone}</p>
                    <p className="text-xs text-gray-500">WhatsApp Business</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button type="button" className="hover:text-primary">
                    <IconPhone />
                  </button>
                  <button type="button" className="hover:text-primary">
                    <IconVideo />
                  </button>
                  <button type="button" className="hover:text-primary">
                    <IconHorizontalDots />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <PerfectScrollbar className="flex-1 p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'outbound' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                        message.type === 'outbound'
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.body}</p>
                      <div
                        className={`text-xs mt-1 ${
                          message.type === 'outbound' ? 'text-white/70' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.created_at)}
                        {message.type === 'outbound' && message.status && (
                          <span className="ml-2 capitalize">• {message.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </PerfectScrollbar>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="form-input flex-1"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <IconSend className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;


// 

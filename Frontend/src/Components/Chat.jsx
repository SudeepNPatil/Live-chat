import React, { useEffect, useState, useRef } from 'react';
import { Send, MessageCircle, PhoneIcon, PhoneOutgoingIcon, PhoneIncoming } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket } from '../Socket/Socket';

export function Chat() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate()
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [calling, setCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.connect();
    socket.emit('join-room', roomId);

    socket.on('receive-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    window.addEventListener('beforeunload', () => {
      socket.disconnect();
    });
    return () => {
        socket.off("receive-message");
    };
  }, [roomId]);

useEffect(() => {

    socket.on("call-request", () => {
    console.log("📥 Incoming call received"); // 👈 check this

    setIncomingCall(true);
  });

  socket.on("call-accepted", () => {
    console.log("✅ Accepted");

    setCalling(false);

    navigate(`/video/${roomId}`, { state: { isCaller: true } }); // 🚀 go to video
  });

  socket.on("call-rejected", () => {
    console.log("❌ Rejected");

    setCalling(false);

    alert("Call rejected");
  });

  return () => {
    socket.off("call-accepted");
    socket.off("call-rejected");
    socket.off("call-request");
  };
}, []);

  const sendMessage = () => {
    if (!text.trim()) return;

    const newMessage = {
      text: text.trim(),
      from: 'me',
      timestamp: new Date(),
    };

    socket.emit('send-message', {
      roomId,
      text,
    });

    setText('');

    setMessages((prev) => [...prev, newMessage]);
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

const handleCall = () => {
  socket.emit("call-request", { roomId }); // 🔔 signal only
  setCalling(true);
};

const acceptCall = () => {
  socket.emit("call-accepted", { roomId });

  setIncomingCall(false);

  navigate(`/video/${roomId}`, { state: { isCaller: false } }); // 🚀 go to video
};

const rejectCall = () => {
  socket.emit("call-rejected", { roomId });

  setIncomingCall(false);
};

  return (
    <>
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Chat Room</h2>
              <p className="text-sm text-gray-500">{roomId}</p>
            </div>
          </div>
          <button
            onClick={handleCall}
            className="text-black px-4 py-2 rounded-lg bg-gray-100 hover:scale-95"
          >
            <PhoneIcon />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-4 h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.from === 'me'
                    ? 'justify-end'
                    : msg.from === 'system'
                    ? 'justify-center'
                    : 'justify-start'
                }`}
              >
                {msg.from === 'system' ? (
                  <div className="bg-gray-200 rounded-full px-4 py-2 text-sm text-gray-600">
                    {msg.text}
                  </div>
                ) : (
                  <div className="flex flex-col max-w-xs md:max-w-md lg:max-w-lg">
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        msg.from === 'me'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="break-words leading-relaxed">{msg.text}</p>
                    </div>
                    <span
                      className={`text-xs text-gray-400 mt-1 px-2 ${
                        msg.from === 'me' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {msg.from === 'me' ? 'You' : 'Friend'} •{' '}
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="flex-1 bg-gray-100 rounded-lg border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <textarea
              ref={inputRef}
              className="w-full bg-transparent text-gray-900 placeholder-gray-400 px-4 py-3 rounded-lg resize-none focus:outline-none"
              placeholder="Type your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="1"
              style={{
                minHeight: '48px',
                maxHeight: '128px',
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            className={`p-3 rounded-lg transition-all ${
              text.trim()
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
      
    </div>

    {calling && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 ">
          <div className="bg-white p-6 rounded-xl flex flex-col gap-4 h-[45%] w-[40%] items-center">
            <PhoneOutgoingIcon size={40} className='mt-10'/>
            <p className='text-xl text-center font-bold '>📞 Calling...</p>
            <p className='text-gray-700 text-sm'>Call is about connect, please wait for a mument.</p>
            <button onClick={() => setCalling(false)} className='py-2 px-4 w-full rounded-xl border hover:bg-red-100'>Cancel</button>
          </div>
        </div>
      )}

      {incomingCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 ">
          <div className="bg-white p-6 rounded-xl flex flex-col gap-4 h-[45%] w-[40%] items-center">
             <PhoneIncoming size={40} className='mt-10'/>
          <p className='text-xl text-center font-bold'>📞 Incoming Call</p>
          <p className='text-gray-700 text-sm'>Accept the Call and enjoy with your loved one.</p>
          <div className='flex flex-row gap-8 w-full'>
            <button onClick={acceptCall} className='py-2 px-4 w-full rounded-xl border hover:bg-green-100'>Accept</button>
            <button onClick={rejectCall} className='py-2 px-4 w-full rounded-xl border hover:bg-red-100'>Reject</button>
           </div>
        </div>

        </div>
      )}

    </>
  );
}

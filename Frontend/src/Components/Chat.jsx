import React, { useEffect, useState, useRef } from 'react';
import { Send, MessageCircle, PhoneIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { socket } from '../Socket/Socket';

export function Chat() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

const [users, setUsers] = useState([]);
const [otherUser, setOtherUser] = useState(null);
const [callActive, setCallActive] = useState(false);

const localVideoRef = useRef(null);
const remoteVideoRef = useRef(null);
const peerConnection = useRef(null);
const localStream = useRef(null);

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

    socket.on("users-in-room", (usersList) => {
    setUsers(usersList);

    const other = usersList.find(id => id !== socket.id);
    setOtherUser(other);
  });

  socket.on("incoming-call", async ({ from, offer }) => {
  setCallActive(true); // 👈 FIRST

  setTimeout(async () => {

    localStream.current = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = localStream.current;

    peerConnection.current = createPeerConnection();

    localStream.current.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    await peerConnection.current.setRemoteDescription(offer);

    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.emit("answer-call", {
      to: from,
      answer,
    });

  }, 100);
});

    socket.on("call-answered", async ({ answer }) => {
      await peerConnection.current.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(candidate);
      }
    });

    window.addEventListener('beforeunload', () => {
      socket.disconnect();
    });
    return () => {
        socket.off("receive-message");
        socket.off("incoming-call");
        socket.off("call-answered");
        socket.off("ice-candidate");
    };
  }, [roomId]);

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

const createPeerConnection = () => {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  // ✅ CREATE ONE GLOBAL REMOTE STREAM
  const remoteStream = new MediaStream();

  // ✅ SET IT ONCE
  if (remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = remoteStream;
  }

  // ✅ ADD TRACKS INTO SAME STREAM
  pc.ontrack = (event) => {
    console.log("TRACK:", event.track.kind);

    remoteStream.addTrack(event.track);
  };

  pc.onicecandidate = (event) => {
    if (event.candidate && otherUser) {
      socket.emit("ice-candidate", {
        to: otherUser,
        candidate: event.candidate
      });
    }
  };

  return pc;
};

const startCall = async () => {
  if (!otherUser) return alert("No user in room");

  // 🔥 FIRST show video UI
  setCallActive(true);

  // wait for UI to render
  setTimeout(async () => {

    localStream.current = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // now ref exists ✅
    localVideoRef.current.srcObject = localStream.current;

    peerConnection.current = createPeerConnection();

    localStream.current.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("call-user", {
      to: otherUser,
      offer,
    });

  }, 100); // small delay for render
};

  return (
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
            onClick={startCall}
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

      {callActive && (
        <div className="flex gap-4 justify-center p-4 bg-black/40 fixed inset-0 w-screen h-screen">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-[50%] h-[50%] rounded-lg"
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-[50%] h-[50%] rounded-lg"
          />
        </div>
      )}
    </div>
  );
}

import {
  Check,
  Copy,
  MessageSquareMore,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
const VITE_URL = import.meta.env.VITE_URL;

export default function Home() {
  const [modal, setmodal] = useState(false);
  const [copy, setcopy] = useState(false);
  const [link, setlink] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  const createchat = () => {
    const roomid = uuidv4();
    setlink(`${VITE_URL}/chat/${roomid}`);
    setmodal(true);
  };

  const copytext = () => {
    const text = document.getElementById('texttocopy').textContent;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setcopy(true);
        setTimeout(() => setcopy(false), 2000);
      })
      .catch((err) => {
        console.log(err);
        setcopy(false);
      });
  };

  const handleJoinChat = () => {
    if (joinCode.includes('https')) {
      const partlist = joinCode.split('/');
      const id = partlist[partlist.length - 1];
      window.location.href = `/chat/${id}`;
    } else {
      navigate(`/chat/${joinCode}`);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full h-auto py-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>

      <div className="relative z-10 flex flex-col gap-8 items-center max-w-5xl px-4">
        <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-full px-4 py-2 shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            Fast & Secure Messaging
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center leading-tight tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Start a Live Chat with Your Loved Ones
        </h1>

        <p className="text-lg text-gray-600 text-center max-w-2xl">
          Connect instantly with friends and family. No signup required. Just
          create a room and share the link.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
          <button
            onClick={() => createchat()}
            className="flex-1 py-4 px-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <span className="flex items-center justify-center gap-2">
              <MessageSquareMore className="w-5 h-5" />
              Create New Chat
            </span>
          </button>

          <div className="flex-1 flex flex-row items-center gap-2 bg-white border-2 border-gray-200 py-3 px-4 rounded-xl shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            <ExternalLink className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinChat()}
              className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400"
              placeholder="Paste link or code here..."
            />
            {joinCode && (
              <button
                onClick={handleJoinChat}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-medium transition-all"
              >
                Join
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-8 w-full max-w-3xl">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquareMore className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Instant Chat</h3>
            <p className="text-sm text-gray-600">Start chatting in seconds</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ExternalLink className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Easy Sharing</h3>
            <p className="text-sm text-gray-600">Share link with anyone</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">No Sign-up</h3>
            <p className="text-sm text-gray-600">Jump right in, hassle-free</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-20 mt-10">
        <p className="text-sm text-black opacity-75">
          © 2026 All rights reserved.
        </p>
        <p className="text-sm text-black opacity-75">Made with ❤ by Sudeep</p>
      </div>

      {modal && (
        <div className="fixed bg-black/50 backdrop-blur-sm inset-0 flex justify-center items-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl relative p-8 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setmodal(false)}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex flex-col items-center gap-6 mt-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquareMore className="w-8 h-8 text-blue-600" />
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Share Your Chat Link
                </h2>
                <p className="text-gray-600">
                  Send this link to your friend to start chatting
                </p>
              </div>

              <div className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
                <p
                  id="texttocopy"
                  className="text-blue-600 font-medium text-sm flex-1 overflow-hidden text-ellipsis"
                >
                  {link}
                </p>
                <button
                  onClick={() => copytext()}
                  className={`p-2 rounded-lg transition-all ${
                    copy
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                  }`}
                >
                  {copy ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Share this link on WhatsApp, Instagram, Telegram, or any
                platform
              </p>

              <button
                onClick={() => window.open(link, '_blank')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Join Chat Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect } from "react";
import { socket } from '../Socket/Socket';
import { useNavigate, useParams } from 'react-router-dom';
import { CameraIcon, CameraOff, LucidePhoneOff, MicIcon, MicOff, UserIcon } from "lucide-react";
import { useState } from "react";
import { useRef } from "react";
import { useLocation } from "react-router-dom";

export default function Video(){
const { roomId } = useParams();
const navigate = useNavigate()
const [mic,setmic] = useState('on');
const [video,setvideo] = useState('on')
const localVideoRef = useRef(null);
const remoteVideoRef = useRef(null);
const [localStream, setLocalStream] = useState(null);
const [remoteStream, setRemoteStream] = useState(null);
const [seconds, setSeconds] = useState(0);
const location = useLocation();
const isCaller = location.state?.isCaller;

const socketRef = useRef(null);
const peerRef = useRef(null);
const streamRef = useRef(null);

useEffect(() => {
    socket.connect();
    socket.emit('join-room', roomId);        
                
   startMedia()
    return () => {
    socket.disconnect();
    };
}, []);

useEffect(() => {
  socket.on("offer", async ({ offer }) => {
    createPeer();

    await peerRef.current.setRemoteDescription(offer);

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    socket.emit("answer", { roomId, answer });
  });

  return () => socket.off("offer");
}, []);

useEffect(() => {
  socket.on("answer", async ({ answer }) => {
    await peerRef.current.setRemoteDescription(answer);
  });

  return () => socket.off("answer");
}, []);

useEffect(() => {
  if (localVideoRef.current && localStream) {
    localVideoRef.current.srcObject = localStream;
  }
}, [localStream]);

useEffect(() => {
  if (remoteVideoRef.current && remoteStream) {
    remoteVideoRef.current.srcObject = remoteStream;
  }
}, [remoteStream]);

useEffect(() => {
  socket.on("ice-candidate", async ({ candidate }) => {
    if (peerRef.current && candidate) {
      await peerRef.current.addIceCandidate(candidate);
    }
  });

  return () => socket.off("ice-candidate");
}, []);


const handlemic = ()=>{
  const audioTracks = streamRef.current.getAudioTracks();

  if (audioTracks.length === 0) return;

  const enabled = audioTracks[0].enabled;
  audioTracks[0].enabled = !enabled;
  !enabled?setmic('on'):setmic('off');

  console.log("Mic:", !enabled ? "ON" : "OFF");
}

const handleCamara = ()=>{
   const videoTracks = streamRef.current.getVideoTracks();

  if (videoTracks.length === 0) return;

  const enabled = videoTracks[0].enabled;
  videoTracks[0].enabled = !enabled;
  !enabled?setvideo('on'):setvideo('off')
  console.log("Camera:", !enabled ? "ON" : "OFF");
}

const endCall = () => {
  streamRef.current.getTracks().forEach(track => track.stop());

  if (peerRef.current) {
    peerRef.current.close();
  }

  socket.disconnect();
  navigate('/')
};


 async function startMedia() {
        try{
        const stream = await navigator.mediaDevices.getUserMedia({
            video:true,
            audio:true,
        })

      streamRef.current = stream;
      setLocalStream(stream);

     if (isCaller) {
      startCall();
    }

    }catch(err){
        console.log("media error", err);
    streamRef.current = new MediaStream();
    }
    }

const createPeer = () => {
  const peer = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", {
        roomId,
        candidate: event.candidate,
      });
    }
  };

peer.ontrack = (event) => {
  console.log("🎥 Remote stream received");
  setRemoteStream(event.streams[0]);
};

  streamRef.current.getTracks().forEach((track) => {
    peer.addTrack(track, streamRef.current);
  });

  peerRef.current = peer;
};

const startCall = async () => {
  createPeer();

  const offer = await peerRef.current.createOffer();
  await peerRef.current.setLocalDescription(offer);

  socket.emit("offer", { roomId, offer });
};

useEffect(() => {
  let interval;

    interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

  return () => clearInterval(interval);
}, []);

const formatTime = (totalSeconds) => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return [
    hrs.toString().padStart(2, '0'),
    mins.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':');
};
 
return (
 <div className="h-screen w-full bg-white flex flex-col overflow-hidden relative" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
 
      {/* Top bar */}
      <div className="h-[10%] bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-gray-400 text-xs font-medium tracking-widest uppercase">Live</span>
        </div>
        <span className="text-gray-700 text-sm font-semibold tracking-tight">some one</span>
        <span className="text-gray-300 text-xs font-medium tabular-nums">{formatTime(seconds)}</span>
      </div>
 
      {/* Remote Video */}
    <div className="relative flex flex-col items-center gap-4 z-10 w-full h-[75%]">

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {!remoteStream && (
          <div className="absolute flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-white shadow-md border flex items-center justify-center text-gray-300">
              <UserIcon size={50} />
            </div>
            <span className="text-gray-400 text-xs">Camera off</span>
          </div>
        )}

        {/* Self Video PiP */}
        <div className="absolute bottom-2 z-50 right-5 w-[45dvw] h-[25dvh] sm:w-[350px] sm:h-[262px] bg-white rounded-2xl border flex items-center justify-center overflow-hidden">
          {localStream?
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover rounded-2xl"/>
          :
          <div className="text-gray-300">
            <UserIcon size={30} />
          </div>
          }
          <span className="absolute bottom-2 left-2.5 text-[14px] text-gray-400 font-medium">You</span>
        </div>

        </div>
 

 
      {/* Control Bar */}
      <div className="h-[15%] w-full z-40 border-gray-100 flex items-center justify-center gap-3 shrink-0">
 
        {/* Mic */}
        <button onClick={handlemic} className="flex flex-col items-center justify-center gap-1.5 p-2 px-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300 transition-all duration-150 cursor-pointer outline-none">
         {mic === 'off'?
         <>
         <MicOff />
          <span className="text-[10px] font-medium text-gray-400 tracking-wide">Unmute</span>
          </>
          :
          <>
          <MicIcon />
          <span className="text-[10px] font-medium text-gray-400 tracking-wide">Mute</span>
            </>
         }
          
        </button>
 
        {/* Camera */}
        <button onClick={handleCamara} className="flex flex-col items-center justify-center p-2 gap-1.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300 transition-all duration-150 cursor-pointer outline-none">
          {video === 'off'?
          <>
          <CameraOff />
          <span className="text-[8px] font-medium text-gray-400 tracking-wide">Camera on</span>
          </>
          :
          <>
          <CameraIcon />
          <span className="text-[8px] font-medium text-gray-400 tracking-wide">Camera Off</span>
          </>

          }

        </button>
 
        {/* End Call */}
        <button onClick={endCall} className="flex flex-col items-center justify-center gap-1.5 p-2 px-4 rounded-2xl bg-red-500 border border-red-500 text-white hover:bg-red-600 transition-all duration-150 cursor-pointer outline-none shadow-sm">
          <LucidePhoneOff />
          <span className="text-[8px] font-medium tracking-wide">End</span>
        </button>
 
      </div>
    </div>
)};
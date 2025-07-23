import React, { useState, useRef, useEffect } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { motion } from "motion/react";

const Call = (props) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [callStatus, setCallStatus] = useState("incoming");
  const sliderRef = useRef(null);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);

    if (percentage <= 20) {
      setCallStatus("declined");
      props?.handleAns(false);
      setIsDragging(false);
    } else if (percentage >= 80) {
      setCallStatus("accepted");
      props?.handleAns(true);
      setIsDragging(false);
    }
  };

  const handlePointerUp = () => {
    if (isDragging && callStatus === "incoming") {
      setSliderPosition(50); // Return to center
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
      document.addEventListener("pointercancel", handlePointerUp);
    }

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging, callStatus]);

  return (
    <div className="mt-1 w-48 object-cover">
      <div
        ref={sliderRef}
        className="relative bg-white/10 rounded-full h-12 backdrop-blur-sm border border-white/20 select-none touch-none"
      >
        {sliderPosition <= 30 && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-transparent rounded-full" />
        )}
        {sliderPosition >= 70 && (
          <div className="absolute inset-0 bg-gradient-to-l from-green-500/30 to-transparent rounded-full" />
        )}

        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400">
          <PhoneOff className="w-6 h-6" />
        </div>

        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400">
          <Phone className="w-6 h-6" />
        </div>

        {/* Slider button with smooth motion */}
        <motion.div
          className="absolute top-1 h-9 w-9 bg-white rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing select-none touch-none"
          animate={{
            left: `calc(${sliderPosition}% - 24px)`,
            scale: isDragging ? 1.1 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          layout
          onPointerDown={handlePointerDown}
          style={{ zIndex: 10 }}
        >
          <Video className="w-6 h-6 text-gray-700" />
        </motion.div>
      </div>
    </div>
  );
};

export default Call;

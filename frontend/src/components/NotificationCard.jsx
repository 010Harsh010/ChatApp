import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiSolidVolumeMute } from "react-icons/bi";
import { formatTimeAgo } from "../converter.js";
import users from "../Server/user.js";

const NotificationCard = (props) => {
    const user = new users();
    const [disabled, setDisabled] = useState(false);
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const componentId = useRef(`notification-${props?.data?._id}-${Date.now()}`).current;

    const acceptRequest = async () => {
        if (isProcessing || disabled) return; // Prevent multiple calls
        
        try {
            console.log(`Accepting request for notification ${props?.data?._id}`);
            setIsProcessing(true);
            setIsDragging(false);
            
            const id = props?.data?._id;
            const response = await user.acceptRequest(id);
            setDisabled(true);
            console.log('Accept response:', response);
        } catch (error) {
            console.error('Accept error:', error.message);
            setIsProcessing(false); // Reset on error
        }
    }

    async function rejectRequest() {
        if (isProcessing || disabled) return; // Prevent multiple calls
        
        try {
            console.log(`Rejecting request for notification ${props?.data?._id}`);
            setIsProcessing(true);
            setIsDragging(false);
            
            const res = await user.rejectRequest({ id: props?.data?._id });
            console.log('Reject response:', res);
            
            // Give a small delay to allow exit animation before removing from state
            setTimeout(() => {
                props.deleteNotification?.({ id: props?.data?._id });
            }, 200);
        } catch (error) {
            console.error('Reject error:', error.message);
            alert("Error rejecting request");
            setIsProcessing(false);
        }
    }

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDrag = (event, info) => {
        setDragX(info.offset.x);
    };

    const handleDragEnd = (event, info) => {
        const threshold = 120;
        
        if (Math.abs(info.offset.x) > threshold) {
            if (info.offset.x > threshold) {
                // Swipe right - Accept
                acceptRequest();
            } else {
                // Swipe left - Reject
                rejectRequest();
            }
        }
        
        // Always reset drag state after drag ends
        setIsDragging(false);
        setDragX(0);
    };

    const getBackgroundColor = () => {
        if (!isDragging) return 'transparent';
        if (dragX > 60) return 'rgba(34, 197, 94, 0.2)'; // Green for accept
        if (dragX < -60) return 'rgba(239, 68, 68, 0.2)'; // Red for reject
        return 'transparent';
    };

    const getActionText = () => {
        if (!isDragging) return '';
        if (dragX > 60) return 'Release to Accept';
        if (dragX < -60) return 'Release to Reject';
        return '';
    };

    // Check if this specific notification is draggable - make it more specific
    const isDraggable = React.useMemo(() => {
        return !disabled && 
               !isProcessing && 
               props?.data?.status === "unseen" && 
               props?.data?.message?.includes("send you a friend request.") 
            //    props?.data?._id; // Ensure we have a valid ID
    }, [disabled, isProcessing, props?.data?.status, props?.data?.message, props?.data?._id]);
    
    // Reset drag state when component updates - but only for THIS component
    useEffect(() => {
        if (disabled || isProcessing) {
            setIsDragging(false);
            setDragX(0);
        }
    }, [disabled, isProcessing]);

    // Log for debugging - remove in production
    useEffect(() => {
        console.log(`Notification ${props?.data?._id}: isDraggable=${isDraggable}, disabled=${disabled}, isProcessing=${isProcessing}`);
    }, [isDraggable, disabled, isProcessing, props?.data?._id]);

    return (
        <AnimatePresence
           key={`notification-${props?.data?._id}`}
        >
            {!disabled && (
                <motion.div
                    
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-2xl h-auto"
                    data-notification-id={props?.data?._id} // For debugging
                >
                    {/* Background Action Indicators */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none"
                        style={{ backgroundColor: getBackgroundColor() }}
                        animate={{ backgroundColor: getBackgroundColor() }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Accept Action (Left side - shows when dragging right) */}
                        <motion.div
                            className="flex items-center gap-2 text-green-500"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ 
                                opacity: dragX > 60 ? 1 : 0,
                                x: dragX > 60 ? 0 : -20
                            }}
                            transition={{ duration: 0.2 }}
                        >
                            <span className="text-2xl">✓</span>
                            <span className="font-semibold">Accept</span>
                        </motion.div>

                        {/* Reject Action (Right side - shows when dragging left) */}
                        <motion.div
                            className="flex items-center gap-2 text-red-500"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ 
                                opacity: dragX < -60 ? 1 : 0,
                                x: dragX < -60 ? 0 : 20
                            }}
                            transition={{ duration: 0.2 }}
                        >
                            <span className="font-semibold">Reject</span>
                            <span className="text-2xl">✕</span>
                        </motion.div>
                    </motion.div>

                    {/* Main Notification Card */}
                    <motion.div
                        drag={isDraggable ? "x" : false}
                        dragConstraints={{ left: -200, right: 200 }}
                        dragElastic={0.2}
                        dragMomentum={false}
                        onDragStart={handleDragStart}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                        animate={{ x: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`w-full h-[72px] m-1 flex flex-row justify-center items-center rounded-2xl relative z-10 ${
                            isDraggable 
                                ? 'cursor-grab active:cursor-grabbing hover:bg-[#272A30]' 
                                : 'cursor-default'
                        } bg-[#1a1d23]`}
                        style={{ 
                            backgroundColor: disabled ? '#1a1d23' : undefined,
                            cursor: isProcessing ? 'not-allowed' : undefined,
                            touchAction: isDraggable ? 'pan-y' : 'auto' // Allow vertical scrolling but enable horizontal drag
                        }}
                        whileHover={isDraggable ? { scale: 1.02 } : {}}
                        whileDrag={{ scale: 1.05, zIndex: 50 }}
                    >
                        <div className='h-[100%] flex justify-center items-center w-[17%] rounded-full'>
                            <motion.img 
                                src={props?.data?.senderInfo?.[0]?.avatar} 
                                className='object-cover h-[49px] w-[49px] rounded-full' 
                                alt="avatar"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            />
                        </div>
                        
                        <div className='h-[44px] w-[83%]'>
                            <div className='h-[50%] w-full flex flex-row justify-center items-center'>
                                <div className='w-[70%]'>
                                    <motion.h1 
                                        className='text-1xl font-semibold text-white'
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        {props?.data?.senderInfo?.[0]?.username}
                                    </motion.h1>
                                </div>
                                
                                <div className='w-[30%] flex justify-end mr-6'>
                                    {isDraggable && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-xs text-gray-400 text-center"
                                        >
                                            {isProcessing ? (
                                                <div className="flex items-center gap-1">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full"
                                                    />
                                                </div>
                                            ) : (
                                                <div>👈 Swipe 👉</div>
                                            )}
                                        </motion.div>
                                    )}
                                    {disabled && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-green-500 font-semibold text-sm"
                                        >
                                            ✓ Accepted
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                            
                            <div className='h-[50%] w-full flex flex-row justify-center items-center'>
                                <div className='w-[80%]'>
                                    <motion.p 
                                        className='text-sm text-gray-400'
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        {props?.data?.message}
                                    </motion.p>
                                </div>
                                <div className='w-[20%] flex justify-center mt-3 ml-1 align-bottom items-center'>
                                    <motion.p 
                                        className='text-xs text-gray-400'
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        {formatTimeAgo(props?.data?.createdAt)}
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Hint */}
                    <AnimatePresence>
                        {isDragging && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full z-20"
                            >
                                {getActionText()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default NotificationCard;
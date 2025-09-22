import React, { useState, useEffect, useRef } from 'react';
import { ChatRoom, ChatMessage, User } from '../types';
import { PaperAirplaneIcon } from './icons';

interface ChatProps {
    chatRooms: ChatRoom[];
    chatMessages: ChatMessage[];
    currentUser: User;
    allUsers: User[];
    onSendMessage: (roomId: string, text: string) => void;
}

const Chat: React.FC<ChatProps> = ({ chatRooms, chatMessages, currentUser, allUsers, onSendMessage }) => {
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Select the first room by default
    useEffect(() => {
        if (!selectedRoomId && chatRooms.length > 0) {
            setSelectedRoomId(chatRooms[0].id);
        }
    }, [chatRooms, selectedRoomId]);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, selectedRoomId]);

    const handleSendMessage = () => {
        if (messageText.trim() && selectedRoomId) {
            onSendMessage(selectedRoomId, messageText.trim());
            setMessageText('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const getRoomDisplayName = (room: ChatRoom) => {
        if (room.type === 'direct') {
            const otherUserId = room.memberIds.find(id => id !== currentUser.id);
            const otherUser = allUsers.find(u => u.id === otherUserId);
            return otherUser ? otherUser.nama : 'Unknown User';
        }
        return room.name;
    };
    
    const getRoomAvatar = (room: ChatRoom) => {
        const name = getRoomDisplayName(room);
        return name.charAt(0).toUpperCase();
    }

    const selectedRoomMessages = chatMessages.filter(msg => msg.roomId === selectedRoomId);

    return (
        <div className="flex h-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            {/* Room List Sidebar */}
            <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800">Daftar Obrolan</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chatRooms.map(room => (
                        <button 
                            key={room.id} 
                            onClick={() => setSelectedRoomId(room.id)}
                            className={`w-full flex items-center p-3 text-left transition-colors duration-200 border-b border-slate-100 ${selectedRoomId === room.id ? 'bg-sky-100' : 'hover:bg-slate-100'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 mr-3 flex-shrink-0">
                               {getRoomAvatar(room)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold ${selectedRoomId === room.id ? 'text-sky-800' : 'text-slate-800'} truncate`}>{getRoomDisplayName(room)}</p>
                                <p className="text-xs text-slate-500 truncate">{room.lastMessage?.text || 'Tidak ada pesan'}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="w-2/3 flex flex-col">
                {selectedRoomId ? (
                    <>
                        <div className="p-4 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">{getRoomDisplayName(chatRooms.find(r => r.id === selectedRoomId)!)}</h3>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto bg-slate-100 space-y-4">
                            {selectedRoomMessages.map(msg => {
                                const sender = allUsers.find(u => u.id === msg.senderId);
                                const isCurrentUser = msg.senderId === currentUser.id;
                                return (
                                    <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                                        {!isCurrentUser && (
                                             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">{sender?.nama.charAt(0)}</div>
                                        )}
                                        <div className={`max-w-md p-3 rounded-lg ${isCurrentUser ? 'bg-sky-600 text-white' : 'bg-white border'}`}>
                                            <p className="text-sm">{msg.text}</p>
                                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-sky-200' : 'text-slate-400'} text-right`}>{new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t bg-white flex items-center gap-2">
                            <input
                                type="text"
                                value={messageText}
                                onChange={e => setMessageText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ketik pesan..."
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-sky-500"
                            />
                            <button onClick={handleSendMessage} className="bg-slate-700 text-white rounded-full p-3 hover:bg-slate-800">
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        Pilih percakapan untuk memulai.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
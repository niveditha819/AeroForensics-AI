import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';

export interface Room {
  id: string;
  anomaly_id: string | null;
  title: string;
  created_by: string;
  created_at: string;
  status: string;
}

export interface RoomMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: string;
  timestamp: string;
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
}

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase.from('incident_rooms').select('*').order('created_at', { ascending: false });
      setRooms(data ?? []);
    };
    fetchRooms();

    const channel = supabase
      .channel('incident_rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_rooms' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRooms((prev) => [payload.new as Room, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!activeRoom) {
      setMessages([]);
      setParticipants([]);
      return;
    }
    const fetchMessages = async () => {
      const { data } = await supabase.from('room_messages').select('*').eq('room_id', activeRoom).order('timestamp', { ascending: true });
      setMessages(data ?? []);
    };
    const fetchParticipants = async () => {
      const { data } = await supabase.from('room_participants').select('*').eq('room_id', activeRoom);
      setParticipants(data ?? []);
    };
    fetchMessages();
    fetchParticipants();

    const msgChannel = supabase
      .channel(`room_messages:${activeRoom}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_messages', filter: `room_id=eq.${activeRoom}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as RoomMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
    };
  }, [activeRoom]);

  const createRoom = useCallback(async (title: string, anomalyId?: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    await supabase.from('incident_rooms').insert({
      title,
      anomaly_id: anomalyId || null,
      created_by: userId,
      status: 'open',
    });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeRoom) return;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    await supabase.from('room_messages').insert({
      room_id: activeRoom,
      user_id: userId,
      content,
      message_type: 'text',
    });
  }, [activeRoom]);

  return { rooms, messages, participants, activeRoom, setActiveRoom, createRoom, sendMessage };
}

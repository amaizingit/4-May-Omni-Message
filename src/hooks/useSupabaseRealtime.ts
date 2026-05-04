import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useSupabaseRealtime(setChats: any, setMessages?: any, setLeads?: any, setOrders?: any) {
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    console.log("[REALTIME] Starting Supabase Realtime subscriptions...");

    const chatsChannel = supabase
      .channel('public:chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, (payload: any) => {
        console.log("[REALTIME] Chat change detected:", payload);
        if (payload.eventType === 'INSERT') {
          setChats((prev: any) => {
            if (prev.find((c: any) => String(c.id) === String(payload.new.id))) return prev;
            return [payload.new, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setChats((prev: any) => prev.map((c: any) => 
            String(c.id) === String(payload.new.id) ? { ...c, ...payload.new } : c
          ));
        } else if (payload.eventType === 'DELETE') {
          setChats((prev: any) => prev.filter((c: any) => String(c.id) !== String(payload.old.id)));
        }
      })
      .subscribe();

    const messagesChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
        console.log("[REALTIME] New message detected:", payload);
        // We typically update the specific chat's messages list
        setChats((prev: any) => {
          return prev.map((chat: any) => {
            if (String(chat.id) === String(payload.new.chat_id)) {
              // Avoid duplicates
              const exists = chat.messages?.find((m: any) => String(m.id) === String(payload.new.id));
              if (exists) return chat;
              
              const updatedChat = {
                ...chat,
                lastMsg: payload.new.text,
                last_time: payload.new.time || new Date().toISOString(),
                messages: [...(chat.messages || []), payload.new]
              };
              return updatedChat;
            }
            return chat;
          });
        });
      })
      .subscribe();

    const leadsChannel = supabase
      .channel('public:leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload: any) => {
        if (!setLeads) return;
        if (payload.eventType === 'INSERT') {
          setLeads((prev: any) => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setLeads((prev: any) => prev.map((l: any) => 
            String(l.id) === String(payload.new.id) || l.email === payload.new.email ? payload.new : l
          ));
        }
      })
      .subscribe();

    const ordersChannel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload: any) => {
        if (!setOrders) return;
        if (payload.eventType === 'INSERT') {
          setOrders((prev: any) => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setOrders((prev: any) => prev.map((o: any) => 
            String(o.id) === String(payload.new.id) ? payload.new : o
          ));
        }
      })
      .subscribe();

    return () => {
      console.log("[REALTIME] Cleaning up Supabase Realtime subscriptions...");
      supabase.removeChannel(chatsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [setChats, setLeads, setOrders]);
}

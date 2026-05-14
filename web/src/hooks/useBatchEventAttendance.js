import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useBatchEventAttendance(eventIds, userId) {
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventIds || eventIds.length === 0) {
      setAttendanceMap({});
      setLoading(false);
      return;
    }
    
    fetchAllAttendees();
  }, [eventIds?.join(','), userId]);

  const fetchAllAttendees = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          id,
          event_id,
          user_id,
          created_at,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .in('event_id', eventIds)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const grouped = {};
      eventIds.forEach(id => {
        grouped[id] = {
          attendees: [],
          isGoing: false,
          count: 0
        };
      });

      (data || []).forEach(attendee => {
        const eventId = attendee.event_id;
        if (!grouped[eventId]) {
          grouped[eventId] = { attendees: [], isGoing: false, count: 0 };
        }
        grouped[eventId].attendees.push(attendee);
        grouped[eventId].count++;
        if (userId && attendee.user_id === userId) {
          grouped[eventId].isGoing = true;
        }
      });

      setAttendanceMap(grouped);
    } catch (err) {
      console.error('Error fetching batch attendees:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (eventId) => {
    if (!userId || !eventId) return;

    const currentData = attendanceMap[eventId] || { attendees: [], isGoing: false, count: 0 };

    try {
      if (currentData.isGoing) {
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', userId);

        if (error) throw error;
        
        setAttendanceMap(prev => ({
          ...prev,
          [eventId]: {
            attendees: prev[eventId].attendees.filter(a => a.user_id !== userId),
            isGoing: false,
            count: Math.max(0, prev[eventId].count - 1)
          }
        }));
      } else {
        const { data, error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: userId
          })
          .select(`
            id,
            event_id,
            user_id,
            created_at,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .single();

        if (error) throw error;
        
        setAttendanceMap(prev => ({
          ...prev,
          [eventId]: {
            attendees: [...(prev[eventId]?.attendees || []), data],
            isGoing: true,
            count: (prev[eventId]?.count || 0) + 1
          }
        }));
      }
    } catch (err) {
      console.error('Error toggling attendance:', err);
      await fetchAllAttendees();
    }
  };

  return {
    attendanceMap,
    loading,
    toggleAttendance,
    getEventData: (eventId) => attendanceMap[eventId] || { attendees: [], isGoing: false, count: 0 }
  };
}

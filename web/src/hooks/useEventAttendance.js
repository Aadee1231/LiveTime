import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useEventAttendance(eventId, userId) {
  const [attendees, setAttendees] = useState([]);
  const [isGoing, setIsGoing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    fetchAttendees();
  }, [eventId, userId]);

  const fetchAttendees = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          id,
          user_id,
          created_at,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setAttendees(data || []);
      
      if (userId) {
        const userIsGoing = data?.some(attendee => attendee.user_id === userId);
        setIsGoing(userIsGoing);
      }
    } catch (err) {
      console.error('Error fetching attendees:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async () => {
    if (!userId) return;

    try {
      if (isGoing) {
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', userId);

        if (error) throw error;
        
        setAttendees(prev => prev.filter(a => a.user_id !== userId));
        setIsGoing(false);
      } else {
        const { data, error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: userId
          })
          .select(`
            id,
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
        
        setAttendees(prev => [...prev, data]);
        setIsGoing(true);
      }
    } catch (err) {
      console.error('Error toggling attendance:', err);
      await fetchAttendees();
    }
  };

  return {
    attendees,
    isGoing,
    loading,
    toggleAttendance,
    attendeeCount: attendees.length
  };
}

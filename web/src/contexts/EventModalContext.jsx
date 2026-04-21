import { createContext, useContext, useState } from 'react';

const EventModalContext = createContext();

export function EventModalProvider({ children }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const openEventModal = (event) => {
    setSelectedEvent(event);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  return (
    <EventModalContext.Provider value={{ selectedEvent, openEventModal, closeEventModal }}>
      {children}
    </EventModalContext.Provider>
  );
}

export function useEventModal() {
  const context = useContext(EventModalContext);
  if (!context) {
    throw new Error('useEventModal must be used within EventModalProvider');
  }
  return context;
}

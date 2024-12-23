import React, { useState, useEffect } from 'react';
import api from '../api';

const Dashboard = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events');
        setEvents(data);
      } catch (err) {
        alert('Failed to fetch events');
      }
    };
    fetchEvents();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <ul>
        {events.map((event) => (
          <li key={event._id}>
            {event.name} - {event.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
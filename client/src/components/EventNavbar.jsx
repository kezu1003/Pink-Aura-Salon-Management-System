import React from 'react'
import { PlusIcon } from 'lucide-react';
import { Link } from 'react-router';

const EventNavbar = () => {
  return (
    <header className='bg-base-300 border-b border-base-content/10'>
        <div className='mx-auto max-w-6xl p-4'>
            <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-bold'>Event Dashboard</h1>
                <div className='flex items-center gap-4'>
                    <Link to={"/events/create"} className="btn btn-primary">
                        <PlusIcon className='size-5'/>
                        <span>Create New Event</span>
                    </Link>
                </div>
        </div>
      </div>
    </header>
  );
};

export default EventNavbar;

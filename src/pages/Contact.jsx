import React from 'react';
import Button from '../components/Button';

const Contact = () => {
  return (
    <div className="container section">
      <h1 className="text-center text-primary mb-xl">Contact Us</h1>
      
      <div className="max-w-md mx-auto bg-white p-xl rounded-lg shadow-sm border border-gray-200">
        <form className="flex flex-col gap-md" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-muted mb-xs">Name</label>
            <input type="text" className="w-full p-sm border border-gray-300 rounded" placeholder="Your Name" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-xs">Email</label>
            <input type="email" className="w-full p-sm border border-gray-300 rounded" placeholder="you@example.com" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-xs">Message</label>
            <textarea className="w-full p-sm border border-gray-300 rounded h-32" placeholder="How can we help?"></textarea>
          </div>
          
          <Button variant="primary" className="btn-block">Send Message</Button>
        </form>
      </div>
    </div>
  );
};

export default Contact;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import './PsychometricTest.css';

const PsychometricTest = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/complete-profile', { replace: true });
  }, [navigate]);

  return (
    <div className="complete-profile-page flex-center p-xl">
      <Loader className="animate-spin" />
      <p className="text-muted">Redirecting to Trader Application...</p>
    </div>
  );
};

export default PsychometricTest;

import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpa o cache
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redireciona para a página de login
    navigate('/login');
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      Sair
    </Button>
  );
} 
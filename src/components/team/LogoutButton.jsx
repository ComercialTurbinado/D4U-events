import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    // Limpa o cache
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redireciona para a página de login
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">
        {user?.name || 'Usuário'}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        Sair
      </Button>
    </div>
  );
} 
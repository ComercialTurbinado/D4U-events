import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Adicionar console.log para depuração
console.log('VITE_API_URL no login:', import.meta.env.VITE_API_URL);

// Garantir que estamos usando a URL base e não a URL com /entities
const API_URL = import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // A URL de autenticação não deve incluir /entities
      const authUrl = `${API_URL}/auth`;
      console.log('Enviando requisição para:', authUrl);
      console.log('Dados:', { email: formData.email, password: formData.password });
      
      const response = await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        console.error("❌ Erro ao converter resposta em JSON:", err);
      }

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        console.error("Resposta com erro:", data);
        setError(`${data.message || "Erro"}\n\n${data.error || ""}`); 
      }

    } catch (error) {
      console.error("❌ Erro na requisição de login:", error);
      setError("Erro de conexão com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px] custom-card">
        <CardHeader className="flex items-center justify-center">
          <img src="https://iili.io/3R5bk1R.png" alt="logo" className="text-center mb-5" width="100px" />
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
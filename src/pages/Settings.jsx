import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, User, Shield } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Personalize as configurações do sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Geral
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Conta
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Privacidade
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Ajuste as configurações gerais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme-mode">Modo Escuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Alterna entre tema claro e escuro
                  </p>
                </div>
                <Switch
                  id="theme-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Salvar Automaticamente</Label>
                  <p className="text-sm text-gray-500">
                    Salva alterações automaticamente
                  </p>
                </div>
                <Switch id="auto-save" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="experimental">Recursos Experimentais</Label>
                  <p className="text-sm text-gray-500">
                    Habilita recursos em fase de testes
                  </p>
                </div>
                <Switch id="experimental" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Escolha quando e como receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Notificações por Email</Label>
                  <p className="text-sm text-gray-500">
                    Receba atualizações por email
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="task-reminders">Lembretes de Tarefas</Label>
                  <p className="text-sm text-gray-500">
                    Receba lembretes para tarefas próximas do prazo
                  </p>
                </div>
                <Switch id="task-reminders" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="event-updates">Atualizações de Eventos</Label>
                  <p className="text-sm text-gray-500">
                    Receba notificações sobre alterações em eventos
                  </p>
                </div>
                <Switch id="event-updates" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Conta</CardTitle>
              <CardDescription>
                Gerencie suas preferências de conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profile-visibility">Visibilidade do Perfil</Label>
                  <p className="text-sm text-gray-500">
                    Controle quem pode ver seu perfil
                  </p>
                </div>
                <Switch id="profile-visibility" />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-gray-500">
                    Adiciona uma camada extra de segurança
                  </p>
                </div>
                <Switch id="two-factor" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacidade e Segurança</CardTitle>
              <CardDescription>
                Gerencie suas configurações de privacidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-collection">Coleta de Dados</Label>
                  <p className="text-sm text-gray-500">
                    Permite a coleta de dados de uso para melhorias
                  </p>
                </div>
                <Switch id="data-collection" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cookies">Cookies</Label>
                  <p className="text-sm text-gray-500">
                    Permite o uso de cookies para melhorar a experiência
                  </p>
                </div>
                <Switch id="cookies" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
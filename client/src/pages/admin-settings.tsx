import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";

export default function AdminSettings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    storeName: "",
    logoUrl: "",
    themeColor: "#3B82F6",
    textColor: "#FFFFFF",
    pixKey: "",
    pagseguroToken: "",
    pagseguroApiUrl: "",
    supportEmail: "",
    whatsappContact: "",
  });

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || "",
        logoUrl: settings.logoUrl || "",
        themeColor: settings.themeColor || "#3B82F6",
        textColor: settings.textColor || "#FFFFFF",
        pixKey: (settings as any).pixKey || "",
        pagseguroToken: settings.pagseguroToken || "",
        pagseguroApiUrl: settings.pagseguroApiUrl || "",
        supportEmail: (settings as any).supportEmail || "",
        whatsappContact: (settings as any).whatsappContact || "",
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao salvar");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Configurações salvas com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Configurações</h2>
        <p className="text-gray-400 text-sm mt-1">Gerencie as configurações da sua loja</p>
      </div>

      {/* Store Identity */}
      <div
        className="p-6 rounded-lg border"
        style={{ backgroundColor: "#1E1E1E", borderColor: "rgba(255,255,255,0.1)" }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Identidade da Loja</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Nome da Loja</Label>
            <Input
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              style={{ backgroundColor: "#242424", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">E-mail de Suporte</Label>
            <Input
              type="email"
              value={formData.supportEmail}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              style={{ backgroundColor: "#242424", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">WhatsApp (apenas números)</Label>
            <Input
              value={formData.whatsappContact}
              onChange={(e) => setFormData({ ...formData, whatsappContact: e.target.value })}
              placeholder="5585988007000"
              style={{ backgroundColor: "#242424", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">URL da Logo</Label>
            <Input
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              style={{ backgroundColor: "#242424", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div
        className="p-6 rounded-lg border"
        style={{ backgroundColor: "#1E1E1E", borderColor: "rgba(255,255,255,0.1)" }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Aparência</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Cor do Tema</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={formData.themeColor}
                onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                className="w-16 h-10 p-1"
                style={{ backgroundColor: "#242424" }}
              />
              <Input
                value={formData.themeColor}
                onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                className="flex-1"
                style={{ backgroundColor: "#242424", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Cor do Texto</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={formData.textColor}
                onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                className="w-16 h-10 p-1"
                style={{ backgroundColor: "#242424" }}
              />
              <Input
                value={formData.textColor}
                onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                className="flex-1"
                style={{ backgroundColor: "#242424", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div
        className="p-6 rounded-lg border"
        style={{ backgroundColor: "#1E1E1E", borderColor: "rgba(255,255,255,0.1)" }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Pagamento</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Chave PIX</Label>
            <Input
              value={formData.pixKey}
              onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
              style={{ backgroundColor: "#242424", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Token PagSeguro</Label>
            <Input
              type="password"
              value={formData.pagseguroToken}
              onChange={(e) => setFormData({ ...formData, pagseguroToken: e.target.value })}
              style={{ backgroundColor: "#242424", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">URL da API PagSeguro</Label>
            <Input
              value={formData.pagseguroApiUrl}
              onChange={(e) => setFormData({ ...formData, pagseguroApiUrl: e.target.value })}
              placeholder="https://api.pagseguro.com"
              style={{ backgroundColor: "#242424", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={() => updateMutation.mutate(formData)}
        disabled={updateMutation.isPending}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10"
      >
        {updateMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Salvar Configurações
      </Button>
    </div>
  );
}

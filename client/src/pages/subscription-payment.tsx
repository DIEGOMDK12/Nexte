import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Copy, Check, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function SubscriptionPaymentPage() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    toast({ title: "Chave Pix copiada!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f0a2e 100%)",
      }}
    >
      <Card
        style={{
          backgroundColor: "#1E1E1E",
          borderColor: "rgba(59, 130, 246, 0.5)",
        }}
        className="w-full max-w-md border"
      >
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-blue-400" />
            <CardTitle className="text-white">Ativação da Assinatura</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-gray-300 text-sm mb-2">Plano Mensal</p>
            <p className="text-3xl font-bold text-white">R$ 10,00</p>
            <p className="text-gray-400 text-xs mt-2">Renovação automática a cada 30 dias</p>
          </div>

          <div className="space-y-3">
            <p className="text-gray-400 text-sm font-medium">Chave Pix para Pagamento:</p>

            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-3">PIX (Chave CPF):</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xl font-bold text-white">973.182.722-68</p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleCopyKey("973.182.722-68")}
                  data-testid="button-copy-pix-key"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 space-y-3">
            <p className="text-yellow-300 text-sm font-medium">⚠️ IMPORTANTE:</p>
            <p className="text-gray-300 text-sm">
              Após o pagamento de R$ 10,00, você deve entrar em contato com o suporte (WhatsApp ou E-mail) e enviar o comprovante para ativação manual da sua conta.
            </p>
          </div>

          <a
            href={`https://wa.me/5592985528004?text=Ol%C3%A1%2C%20gostaria%20de%20ativar%20minha%20assinatura%20mensal.%20Segue%20em%20anexo%20o%20comprovante%20de%20pagamento.`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="button-contact-support"
          >
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2" data-testid="button-whatsapp-support">
              <MessageCircle className="w-4 h-4" />
              Contatar Suporte via WhatsApp
            </Button>
          </a>

          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="w-full text-white border-gray-600 hover:bg-gray-800"
            data-testid="button-back-home"
          >
            Voltar à Página Inicial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

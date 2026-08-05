'use client';

import { useUser, useDoc } from '@/firebase';
import { useState, useEffect } from 'react';
import { handleGetAiInsights } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, TrendingUp, Target, AlertTriangle, Lightbulb, ArrowRight, Loader2, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { GenerateAiInsightsOutput } from '@/ai/flows/generate-ai-insights';

export default function AiAnalysisPage() {
  const { user } = useUser();
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const [insights, setInsights] = useState<GenerateAiInsightsOutput | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    if (!userData) return;
    setLoading(true);
    const result = await handleGetAiInsights({
      role: userData.role,
      userName: userData.displayName || 'Kullanıcı',
      contextData: {
        school: userData.school,
        grade: userData.grade,
        branch: userData.branch
      }
    });

    if (result.success && result.data) {
      setInsights(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userData) {
      fetchInsights();
    }
  }, [userData]);

  if (loading && !insights) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-6 min-h-[60vh]">
        <div className="relative">
          <div className="h-20 w-20 animate-spin rounded-[2rem] border-[6px] border-accent border-t-transparent shadow-[0_0_40px_rgba(245,158,11,0.2)]" />
          <Brain className="absolute inset-0 m-auto h-8 w-8 text-accent animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-black text-primary uppercase tracking-tighter italic">AI Analiz Merkezi Hazırlanıyor</p>
          <p className="text-sm text-muted-foreground font-medium italic">Verileriniz işleniyor ve size özel stratejiler oluşturuluyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20">
            <Sparkles className="h-3 w-3" /> Canlı Analiz Aktif
          </div>
          <h2 className="text-5xl font-black tracking-tighter italic text-primary uppercase leading-none">
            Yapay Zeka <br /><span className="text-accent">Analiz Merkezi</span>
          </h2>
        </div>
        <Button 
          onClick={fetchInsights} 
          disabled={loading}
          className="h-16 px-8 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-2xl shadow-primary/20"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5" />}
          Analizleri Güncelle
        </Button>
      </div>

      {insights && (
        <>
          {/* Summary Card */}
          <Card className="rounded-[3rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-primary text-white p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/30 transition-all duration-1000"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
              <div className="h-24 w-24 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl shrink-0">
                <Brain className="h-12 w-12 text-accent" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black italic tracking-tight">Durum Özeti</h3>
                <p className="text-lg leading-relaxed font-medium opacity-90 italic">
                  "{insights.summary}"
                </p>
              </div>
            </div>
          </Card>

          {/* Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {insights.insights.map((item, i) => {
              const Icon = {
                prediction: TrendingUp,
                suggestion: Lightbulb,
                analysis: Target,
                action_plan: Target,
                motivation: Sparkles,
                risk: AlertTriangle
              }[item.type] || Target;

              return (
                <Card key={i} className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-[0_20px_40px_-15px_rgba(15,23,42,0.1)] bg-white p-8 transition-all hover:-translate-y-2 border border-primary/5">
                  <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2",
                    item.type === 'risk' ? 'bg-destructive' : 'bg-accent'
                  )}></div>
                  <div className="space-y-6">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:rotate-6",
                      item.type === 'risk' ? 'bg-destructive text-white' : 'bg-primary text-white'
                    )}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2">
                          {item.type.replace('_', ' ')}
                        </Badge>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          item.priority === 'high' ? 'text-destructive' : item.priority === 'medium' ? 'text-accent' : 'text-primary'
                        )}>
                          {item.priority} Önem
                        </span>
                      </div>
                      <h4 className="font-black text-xl italic tracking-tight text-primary leading-tight">{item.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">{item.description}</p>
                    </div>
                    {item.actionLabel && (
                      <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-accent group-hover:translate-x-2 transition-transform">
                        {item.actionLabel} <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Next Steps Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <Card className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white p-10 space-y-8">
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-black italic tracking-tighter uppercase">AI Aksiyon Planı</h4>
                <Target className="h-8 w-8 text-accent" />
              </div>
              <div className="space-y-4">
                {insights.nextSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-5 p-6 bg-[#F8FAFC] rounded-[2rem] border border-primary/5 hover:bg-white hover:shadow-xl transition-all group">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary font-black flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                      {i + 1}
                    </div>
                    <p className="text-sm font-bold text-primary italic leading-tight">{step}</p>
                    <CheckCircle2 className="ml-auto h-5 w-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-8">
              <Card className="rounded-[3rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-accent text-white p-10 space-y-6 relative overflow-hidden group">
                <Lightbulb className="absolute top-6 right-6 h-12 w-12 opacity-20 group-hover:scale-125 transition-transform" />
                <h4 className="text-xl font-black italic tracking-tight uppercase">AI Motivasyon</h4>
                <p className="text-lg font-bold italic leading-relaxed">
                  "Başarı bir varış noktası değil, bir yolculuktur. Senin bu disiplinli çalışman, hedefine ulaşmak için en büyük gücün olacak."
                </p>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-3/4 animate-pulse"></div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl space-y-2">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Doğruluk Tahmini</p>
                   <p className="text-4xl font-black text-primary italic">%94</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl space-y-2">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Veri Puanı</p>
                   <p className="text-4xl font-black text-accent italic">A+</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

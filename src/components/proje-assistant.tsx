'use client';

import {
  handleGenerateContent,
  handleGenerateDocx,
  handleOptimizeContent,
  handleExtractProjectInfo,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  FileText,
  Loader2,
  PlusCircle,
  RefreshCw,
  Share2,
  Trash2,
  Wand2,
} from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import FileSaver from 'file-saver';
import { cn } from '@/lib/utils';

const sampleText =
  'Projemizin amacı, okulumuzun bahçesindeki bitki çeşitliliğini incelemek ve bu bitkilerin yerel ekosistem için önemini ortaya koymaktır. Öğrenciler, farklı bitki türlerini fotoğraflayacak, dijital bir herbaryum oluşturacak ve bu bitkilerin özelliklerini araştıracaklar. Bu süreçte, teknolojiyi kullanarak doğayı daha yakından tanıma fırsatı bulacaklar. Proje sonunda, okul web sitesinde yayınlanacak bir dijital sergi ve bilgilendirici posterler hazırlanacaktır. Bu çalışma, öğrencilerin araştırma, gözlem ve sunum becerilerini geliştirmeyi hedeflemektedir.';

const anaAlanOptions = [
  'Bilişim ve Yazılım',
  'Biyoloji',
  'Coğrafya',
  'Değerler Eğitimi',
  'Fizik',
  'Kimya',
  'Matematik',
  'Tarih',
  'Teknolojik Tasarım',
  'Türk Dili ve Edebiyatı',
];
const tematikKonuOptions = [
  'Akıllı Ulaşım Sistemleri',
  'Artırılmış, Sanal ve Karma Gerçeklik Teknolojileri',
  'Biyoçeşitlilik',
  'Dijital Dönüşüm',
  'Doğal Afetler ve Afet Yönetimi',
  'Gıda Arzı Güvenliği',
  'Havacılık ve Uzay',
  'İnsan Sağlığı ve Teknolojileri',
  'Nesnelerin İnterneti',
  'Siber Güvenlik',
  'Yapay Zeka',
];
const altProjeTuruOptions = ['Araştırma', 'Tasarım', 'İnceleme'];

type WordCounts = {
  amac: number;
  yontem: number;
  beklenenSonuc: number;
};

export function ProjeAssistant() {
  const [draft, setDraft] = useState('');
  const [amac, setAmac] = useState('');
  const [yontem, setYontem] = useState('');
  const [beklenenSonuc, setBeklenenSonuc] = useState('');
  const [projectName, setProjectName] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [students, setStudents] = useState(['']);
  const [mainArea, setMainArea] = useState('');
  const [thematicSubject, setThematicSubject] = useState('');
  const [projectType, setProjectType] = useState('');
  const [scores, setScores] = useState({
    ozgunluk: 0,
    formatUygunlugu: 0,
    dilAnlatim: 0,
    genelUygunluk: 0,
  });
  const [wordCounts, setWordCounts] = useState<WordCounts>({
    amac: 0,
    yontem: 0,
    beklenenSonuc: 0,
  });

  const [isGenerating, startGenerating] = useTransition();
  const [isOptimizing, startOptimizing] = useTransition();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const { toast } = useToast();
  const exportRef = useRef<HTMLDivElement>(null);

  const countWords = (str: string) =>
    str.trim() === '' ? 0 : str.trim().split(/\s+/).length;

  useEffect(() => {
    setWordCounts({
      amac: countWords(amac),
      yontem: countWords(yontem),
      beklenenSonuc: countWords(beklenenSonuc),
    });
  }, [amac, yontem, beklenenSonuc]);

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    setDraft(pastedText);
    if (pastedText.trim().length > 10) {
      startGenerating(async () => {
        const genResult = await handleGenerateContent({ draftText: pastedText });
        let newAmac = '',
          newYontem = '',
          newBeklenenSonuc = '';
        if (genResult.success && genResult.data) {
          newAmac = genResult.data.amac;
          newYontem = genResult.data.yontem;
          newBeklenenSonuc = genResult.data.beklenenSonuc;
          setAmac(newAmac);
          setYontem(newYontem);
          setBeklenenSonuc(newBeklenenSonuc);
          toast({
            title: 'Dönüşüm Başarılı',
            description: 'Proje metniniz TÜBİTAK formatına dönüştürüldü.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Hata',
            description: genResult.error,
          });
        }

        const extractResult = await handleExtractProjectInfo({
          projectText: pastedText,
        });
        if (extractResult.success && extractResult.data) {
          setProjectName(extractResult.data.projectName);
          setAdvisor(extractResult.data.advisor);
          setStudents(
            extractResult.data.students.length > 0
              ? extractResult.data.students
              : ['']
          );
          setMainArea(extractResult.data.mainArea);
          setThematicSubject(extractResult.data.thematicSubject);
          setProjectType(extractResult.data.projectType);
          toast({
            title: 'Bilgiler Çıkarıldı',
            description: 'Proje bilgileri formunuza otomatik olarak eklendi.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Hata',
            description: extractResult.error,
          });
        }

        if (newAmac || newYontem || newBeklenenSonuc) {
          const optResult = await handleOptimizeContent({
            amac: newAmac,
            yontem: newYontem,
            beklenenSonuc: newBeklenenSonuc,
          });
          if (optResult.success && optResult.data) {
            setScores(optResult.data.suitabilityScores);
            toast({
              title: 'Puanlar Hesaplandı',
              description:
                'Projenizin uygunluk puanları otomatik olarak hesaplandı.',
              className: 'bg-accent text-accent-foreground',
            });
          }
        }
      });
    }
  };

  const onOptimize = (
    section: 'amac' | 'yontem' | 'beklenenSonuc' | 'all'
  ) => {
    if (!amac && !yontem && !beklenenSonuc) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description:
          'Lütfen önce içerik üretin veya ilgili alanları doldurun.',
      });
      return;
    }
    startOptimizing(async () => {
      const result = await handleOptimizeContent({ amac, yontem, beklenenSonuc });
      if (result.success && result.data) {
        setAmac(result.data.amac);
        setYontem(result.data.yontem);
        setBeklenenSonuc(result.data.beklenenSonuc);
        setScores(result.data.suitabilityScores);
        toast({
          title: 'Optimizasyon Başarılı',
          description: 'Proje içeriğiniz yapay zeka ile geliştirildi.',
          className: 'bg-accent text-accent-foreground',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: result.error,
        });
      }
    });
  };

  const handleStudentUpdate = (index: number, value: string) => {
    const newStudents = [...students];
    newStudents[index] = value;
    setStudents(newStudents);
  };

  const addStudent = () => setStudents([...students, '']);
  const removeStudent = (index: number) => {
    if (students.length > 1) {
      setStudents(students.filter((_, i) => i !== index));
    }
  };

  const resetForm = () => {
    setDraft('');
    setAmac('');
    setYontem('');
    setBeklenenSonuc('');
    setProjectName('');
    setAdvisor('');
    setStudents(['']);
    setMainArea('');
    setThematicSubject('');
    setProjectType('');
    setScores({
      ozgunluk: 0,
      formatUygunlugu: 0,
      dilAnlatim: 0,
      genelUygunluk: 0,
    });
  };

  const handleExport = async (format: 'pdf' | 'word') => {
    if (!exportRef.current) return;
    setIsExporting(format);

    try {
      if (format === 'pdf') {
        const canvas = await html2canvas(exportRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        if (imgWidth > 0 && imgHeight > 0) {
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const imgX = (pdfWidth - imgWidth * ratio) / 2;
          const imgY = 10;
          pdf.addImage(
            imgData,
            'PNG',
            imgX,
            imgY,
            imgWidth * ratio,
            imgHeight * ratio
          );
          pdf.save(`${projectName || 'proje'}.pdf`);
        } else {
          console.error('Invalid image dimensions for PDF export');
          toast({
            variant: 'destructive',
            title: 'Dışa Aktarma Hatası',
            description: 'PDF için geçersiz resim boyutları.',
          });
        }
      } else if (format === 'word') {
        const htmlString = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${exportRef.current.innerHTML}</body></html>`;
        const result = await handleGenerateDocx(htmlString);

        if (result.success && result.data) {
          FileSaver.saveAs(
            `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${result.data}`,
            `${projectName || 'proje'}.docx`
          );
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: 'destructive',
        title: 'Dışa Aktarma Hatası',
        description: 'Dosya oluşturulurken bir sorun oluştu.',
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      let shareText = `Proje: ${projectName}\n\n`;
      shareText += `Amaç: ${amac}\n\n`;
      shareText += `Yöntem: ${yontem}\n\n`;
      shareText += `Beklenen Sonuç: ${beklenenSonuc}\n\n`;
      navigator
        .share({
          title: `TÜBİTAK 4006 Projesi: ${projectName}`,
          text: shareText,
        })
        .catch(err => console.error('Paylaşım hatası:', err));
    } else {
      toast({
        description: 'Tarayıcınız bu özelliği desteklemiyor.',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-primary-600 font-headline">
                Proje4006 Dönüştürücü
              </h1>
              <p className="text-sm text-muted-foreground">
                Metni yapıştırın, yapay zeka projenizi TÜBİTAK formatına
                dönüştürsün.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Button variant="outline" size="sm" onClick={resetForm}>
                <RefreshCw className="mr-2" />
                Yeniden Üret
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('word')}
                disabled={!!isExporting}
              >
                {isExporting === 'word' ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Download className="mr-2" />
                )}
                Word İndir
              </Button>
              <Button
                size="sm"
                onClick={() => handleExport('pdf')}
                disabled={!!isExporting}
              >
                {isExporting === 'pdf' ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Download className="mr-2" />
                )}
                PDF İndir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="space-y-8">
          <Card className="relative shadow-lg">
            {(isGenerating || isOptimizing) && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <CardHeader>
              <CardTitle>Proje Metnini Yapıştır (Otomatik Dönüşüm)</CardTitle>
              <CardDescription>
                Projenizin ham metnini buraya yapıştırın. Yapıştırır yapıştırmaz
                dönüşüm başlar...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Örnek: Okulumuzun bahçesindeki bitki çeşitliliğini ve ekosistemdeki yerini araştırmak..."
                className="min-h-[150px] text-base"
                value={draft}
                onPaste={onPaste}
                onChange={e => setDraft(e.target.value)}
                disabled={isGenerating || isOptimizing}
              />
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setDraft(sampleText);
                  toast({
                    description:
                      'Örnek metin yapıştırıldı. Dilerseniz metin üzerinde değişiklik yapabilirsiniz.',
                  });
                }}
              >
                <FileText className="mr-2" />
                Örnek Metin Kullan
              </Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Amaç',
                value: amac,
                setter: setAmac,
                limit: 100,
                key: 'amac',
              },
              {
                title: 'Yöntem',
                value: yontem,
                setter: setYontem,
                limit: 150,
                key: 'yontem',
              },
              {
                title: 'Beklenen Sonuç',
                value: beklenenSonuc,
                setter: setBeklenenSonuc,
                limit: 100,
                key: 'beklenenSonuc',
              },
            ].map(item => (
              <Card key={item.key} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl">
                    {item.title}
                    <Button
                      size="sm"
                      onClick={() => onOptimize('all')}
                      disabled={isGenerating || isOptimizing}
                      variant="default"
                    >
                      {isOptimizing ? (
                        <Loader2 className="animate-spin mr-2" />
                      ) : (
                        <Wand2 className="mr-2" />
                      )}
                      Geliştir
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <Textarea
                    value={item.value}
                    onChange={e => item.setter(e.target.value)}
                    className="min-h-[200px] text-base"
                    disabled={isGenerating || isOptimizing}
                  />
                </CardContent>
                <CardFooter>
                  <p
                    className={cn(
                      'text-sm text-muted-foreground',
                      wordCounts[item.key as keyof WordCounts] > item.limit &&
                        'text-destructive font-medium'
                    )}
                  >
                    {wordCounts[item.key as keyof WordCounts]} / {item.limit}{' '}
                    kelime
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Proje Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="proje-adi">Proje Adı</Label>
                  <Input
                    id="proje-adi"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Alt Proje Türü</Label>
                    <Select value={projectType} onValueChange={setProjectType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {altProjeTuruOptions.map(opt => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ana Alanı</Label>
                    <Select value={mainArea} onValueChange={setMainArea}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {anaAlanOptions.map(opt => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tematik Konu</Label>
                    <Select
                      value={thematicSubject}
                      onValueChange={setThematicSubject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {tematikKonuOptions.map(opt => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="danisman">Danışman Öğretmen</Label>
                  <Input
                    id="danisman"
                    value={advisor}
                    onChange={e => setAdvisor(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Öğrenciler</Label>
                  <div className="space-y-2">
                    {students.map((student, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={student}
                          onChange={e =>
                            handleStudentUpdate(index, e.target.value)
                          }
                          placeholder={`Öğrenci ${index + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStudent(index)}
                          disabled={students.length === 1}
                          aria-label="Öğrenciyi kaldır"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addStudent}
                      className="mt-2"
                    >
                      <PlusCircle className="mr-2" />
                      Öğrenci Ekle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Uygunluk Puanları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Özgünlük', value: scores.ozgunluk },
                    {
                      label: 'Format Uygunluğu',
                      value: scores.formatUygunlugu,
                    },
                    { label: 'Dil & Anlatım', value: scores.dilAnlatim },
                    { label: 'Genel Uygunluk', value: scores.genelUygunluk },
                  ].map(score => (
                    <div key={score.label}>
                      <div className="flex justify-between items-center text-sm mb-1 text-muted-foreground">
                        <span className="font-medium">{score.label}</span>
                        <span className="font-semibold text-foreground">
                          {score.value}%
                        </span>
                      </div>
                      <Progress
                        value={score.value}
                        className={
                          score.value > 80
                            ? '[&>div]:bg-accent'
                            : score.value > 50
                            ? '[&>div]:bg-primary'
                            : ''
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Button
                onClick={handleShare}
                variant="secondary"
                className="w-full"
              >
                <Share2 className="mr-2" />
                Mobilden Paylaş
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>
          <strong>Kullanım Notu:</strong> Bu araç, TÜBİTAK 4006 proje
          hazırlama sürecini hızlandırmak için tasarlanmış bir yardımcıdır.
          Üretilen metinleri proje hedeflerinize göre kontrol edip düzenlemeniz
          önerilir.
        </p>
      </footer>

      {/* Hidden element for exports */}
      <div ref={exportRef} style={{ display: 'none' }}>
        <div
          style={{
            fontFamily: 'Times New Roman, serif',
            fontSize: '12pt',
            margin: '2.54cm',
          }}
        >
          <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
            PROJE ADI: {projectName.toUpperCase()}
          </p>
          <br />
          <p>
            <strong>ALT PROJE TÜRÜ:</strong> {projectType}
          </p>
          <p>
            <strong>ANA ALANI:</strong> {mainArea}
          </p>
          <p>
            <strong>TEMATİK KONUSU:</strong> {thematicSubject}
          </p>
          <br />
          <p>
            <strong>DANIŞMAN:</strong> {advisor.toUpperCase()}
          </p>
          <div>
            <p>
              <strong>ÖĞRENCİLER:</strong>
            </p>
            <ol>
              {students
                .filter(s => s.trim() !== '')
                .map((s, i) => (
                  <li key={i}>{s.toUpperCase()}</li>
                ))}
            </ol>
          </div>
          <br />
          <p>
            <strong>AMAÇ:</strong>
          </p>
          <p>{amac}</p>
          <br />
          <p>
            <strong>YÖNTEM:</strong>
          </p>
          <p>{yontem}</p>
          <br />
          <p>
            <strong>BEKLENEN SONUÇ:</strong>
          </p>
          <p>{beklenenSonuc}</p>
        </div>
      </div>
    </div>
  );
}

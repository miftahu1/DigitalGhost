
import { useMemo } from 'react';
import { useDecryptedMemories } from '@/hooks/use-decrypted-memories';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { History, Calendar } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';

export const EchoesOfThePast = () => {
  const { decryptedMemories, loading } = useDecryptedMemories();

  const echoes = useMemo(() => {
    if (!decryptedMemories) return [];
    const today = new Date();
    return decryptedMemories.filter(memory => {
      const memoryDate = memory.createdAt?.seconds ? new Date(memory.createdAt.seconds * 1000) : parseISO(memory.createdAt);
      return isSameDay(today, memoryDate) && today.getFullYear() !== memoryDate.getFullYear();
    });
  }, [decryptedMemories]);

  if (loading || echoes.length === 0) {
    return null; // Don't render the component if there are no echoes or if it's loading
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="glass-morphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Echoes of the Past</CardTitle>
          <CardDescription>On this day, years ago...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {echoes.map(echo => (
            <div key={echo.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <p className="font-semibold text-sm">{echo.content}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(echo.createdAt?.seconds ? new Date(echo.createdAt.seconds * 1000) : parseISO(echo.createdAt), 'PPP')}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

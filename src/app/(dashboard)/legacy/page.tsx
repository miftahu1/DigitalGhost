'use client';

import { useState } from 'react';
import { useDecryptedMemories } from '@/hooks/use-decrypted-memories';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Lock, Unlock, Send, History, Loader2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const LegacyPage = () => {
  const { decryptedMemories, loading } = useDecryptedMemories();
  const [selectedMemories, setSelectedMemories] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [unlockDate, setUnlockDate] = useState<Date | undefined>();
  const [isLocked, setIsLocked] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const handleSelectMemory = (memoryId: string) => {
    setSelectedMemories(prev =>
      prev.includes(memoryId) ? prev.filter(id => id !== memoryId) : [...prev, memoryId]
    );
  };

  const handleLockCapsule = () => {
    setIsLocking(true);
    // Simulate backend call
    setTimeout(() => {
      console.log('Capsule locked with:', {
        selectedMemories,
        message,
        recipient,
        unlockDate,
      });
      setIsLocked(true);
      setIsLocking(false);
    }, 2000);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
          <Card className="glass-morphism max-w-lg">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full">
                <Lock className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="mt-4">Your Time Capsule is Sealed</CardTitle>
              <CardDescription>A digital echo sent to the future, carrying your thoughts and memories.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">It will be delivered to <span className="font-bold text-primary">{recipient}</span> on <span className="font-bold text-primary">{unlockDate ? format(unlockDate, 'PPP') : 'the selected date'}</span>.</p>
              <Button variant="outline" onClick={() => setIsLocked(false)}><Unlock className="mr-2 h-4 w-4"/> Create Another Capsule</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8 pb-12">
      <div className="text-center px-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Cognitive Legacy</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-2">Curate a collection of your memories, add a personal message, and seal it as a time capsule for someone to receive in the future.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto px-4">
        
        {/* Left Column - Memory Selection */}
        <div className="lg:col-span-2">
          <Card className="glass-morphism h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-primary" /> Select Your Echoes</CardTitle>
              <CardDescription>Choose the memories you want to include in your time capsule. {selectedMemories.length} selected.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[450px] overflow-y-auto p-2 rounded-md bg-white/5 custom-scrollbar">
                {decryptedMemories.map(memory => (
                  <motion.div 
                    key={memory.id} 
                    layout
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => handleSelectMemory(memory.id)}
                  >
                    <Checkbox
                      id={memory.id}
                      checked={selectedMemories.includes(memory.id)}
                      className="mt-1"
                    />
                    <label htmlFor={memory.id} className="text-sm flex-1 cursor-pointer">{memory.content}</label>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Capsule Configuration */}
        <div className="space-y-6 md:space-y-8">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Send className="w-5 h-5 text-primary"/> Address the Future</CardTitle>
              <CardDescription>Write a message and set the delivery details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="A message to the recipient, explaining the significance of these memories..."
                  className="bg-white/5 min-h-[120px]"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient's Email</Label>
                  <Input
                    id="recipient"
                    type="email"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    placeholder="future.friend@example.com"
                    className="bg-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unlock Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal bg-white/5 hover:bg-white/10"
                      >
                        {unlockDate ? format(unlockDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 glass-morphism" align="start">
                      <Calendar
                        mode="single"
                        selected={unlockDate}
                        onSelect={setUnlockDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button onClick={handleLockCapsule} size="lg" className="w-full" disabled={isLocking || !recipient || !unlockDate || selectedMemories.length === 0}>
            {isLocking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            Seal Time Capsule
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default LegacyPage;

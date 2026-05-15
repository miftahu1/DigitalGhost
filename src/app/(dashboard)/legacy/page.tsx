"use client";

import { useState } from 'react';
import { useDecryptedMemories } from '@/hooks/use-decrypted-memories';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Lock, Unlock, Send, History } from 'lucide-react';

const LegacyPage = () => {
  const { decryptedMemories, loading } = useDecryptedMemories();
  const [selectedMemories, setSelectedMemories] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const handleSelectMemory = (memoryId: string) => {
    setSelectedMemories(prev =>
      prev.includes(memoryId) ? prev.filter(id => id !== memoryId) : [...prev, memoryId]
    );
  };

  const handleLockCapsule = () => {
    // Here you would typically send the data to a secure backend
    // to be stored until the unlock date.
    console.log('Capsule locked with:', {
      selectedMemories,
      message,
      recipient,
      unlockDate,
    });
    setIsLocked(true);
  };

  if (loading) {
    return <div>Loading your legacy...</div>;
  }

  if (isLocked) {
    return (
      <div className="text-center">
        <Lock className="w-16 h-16 mx-auto my-8" />
        <h1 className="text-2xl font-bold">Your Time Capsule is Locked</h1>
        <p className="text-lg text-muted-foreground">It will be sent to {recipient} on {unlockDate}.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <Card className="glass-morphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Send className="w-5 h-5 text-primary" /> Create Your Legacy</CardTitle>
          <CardDescription>Select memories and write a message to be delivered in the future.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Select Memories for Your Time Capsule</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto p-2 rounded-md bg-white/5">
              {decryptedMemories.map(memory => (
                <div key={memory.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/10">
                  <Checkbox
                    id={memory.id}
                    onCheckedChange={() => handleSelectMemory(memory.id)}
                  />
                  <label htmlFor={memory.id} className="text-sm truncate">{memory.content}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Your Message to the Future</h3>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your message..."
              className="bg-white/5"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Recipient's Email</h3>
              <input
                type="email"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder="future@example.com"
                className="w-full p-2 rounded-md bg-white/5"
              />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Unlock Date</h3>
              <input
                type="date"
                value={unlockDate}
                onChange={e => setUnlockDate(e.dat.value)}
                className="w-full p-2 rounded-md bg-white/5"
              />
            </div>
          </div>

          <Button onClick={handleLockCapsule} className="w-full">
            <Lock className="mr-2 h-4 w-4" /> Lock Time Capsule
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LegacyPage;

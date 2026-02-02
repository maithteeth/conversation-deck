"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Shuffle, Trash2, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type ConversationCard = { id: string; text: string }
type Deck = { id: string; name: string; cards: ConversationCard[] }

export default function ConversationDeck() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedDeckId, setSelectedDeckId] = useState<string>("")
  const [newDeckName, setNewDeckName] = useState("")
  const [newCardText, setNewCardText] = useState("")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem("conv-decks")
    if (saved) {
      const parsed = JSON.parse(saved)
      setDecks(parsed)
      if (parsed.length > 0) setSelectedDeckId(parsed[0].id)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("conv-decks", JSON.stringify(decks))
  }, [decks])

  const selectedDeck = decks.find(d => d.id === selectedDeckId)

  const nextCard = () => {
    if (!selectedDeck) return
    setDirection(1)
    setCurrentCardIndex((prev) => (prev + 1) % selectedDeck.cards.length)
    setIsFlipped(false)
  }

  const addDeck = () => {
    if (!newDeckName) return
    const newDeck = { id: Date.now().toString(), name: newDeckName, cards: [] }
    setDecks([...decks, newDeck])
    setNewDeckName("")
    setSelectedDeckId(newDeck.id)
  }

  const addCard = () => {
    if (!newCardText || !selectedDeckId) return
    setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: [...d.cards, { id: Date.now().toString(), text: newCardText }] } : d))
    setNewCardText("")
  }

  return (
    <main className="min-h-[100dvh] bg-neutral-900 text-white p-4 font-sans overflow-hidden">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-neutral-800 pb-4">
          <h1 className="text-xl font-black tracking-widest text-red-500">TRUMP-TALK</h1>
          <div className="flex gap-2">
            <Input 
              placeholder="新デッキ" 
              value={newDeckName} 
              onChange={(e) => setNewDeckName(e.target.value)}
              className="h-8 bg-neutral-800 border-neutral-700 text-xs w-24"
            />
            <Button onClick={addDeck} size="sm" className="bg-red-600 h-8"><Plus size={16}/></Button>
          </div>
        </header>

        <Tabs defaultValue="play" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-neutral-800 rounded-xl">
            <TabsTrigger value="play">PLAY</TabsTrigger>
            <TabsTrigger value="edit">デッキ編成</TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="mt-6 outline-none">
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {decks.map(d => (
                <button 
                  key={d.id} 
                  onClick={() => {setSelectedDeckId(d.id); setCurrentCardIndex(0);}}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${selectedDeckId === d.id ? "bg-red-600 text-white" : "bg-neutral-800 text-neutral-400"}`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            {selectedDeck && selectedDeck.cards.length > 0 ? (
              <div className="relative h-[65vh] flex flex-col items-center justify-between">
                <div className="relative w-full aspect-[2.5/3.5] max-w-[300px]">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={currentCardIndex}
                      custom={direction}
                      initial={{ x: 300, opacity: 0, rotate: 10 }}
                      animate={{ x: 0, opacity: 1, rotate: isFlipped ? 180 : 0 }}
                      exit={{ x: -300, opacity: 0, rotate: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -100) nextCard()
                      }}
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    >
                      <Card className="w-full h-full bg-white border-[12px] border-white shadow-2xl rounded-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden">
                        {/* トランプ意匠 */}
                        <div className="absolute top-4 left-4 text-red-600 flex flex-col items-center">
                          <span className="font-bold text-lg">A</span>
                          <Heart size={16} fill="currentColor" />
                        </div>
                        <div className="absolute bottom-4 right-4 text-red-600 flex flex-col items-center rotate-180">
                          <span className="font-bold text-lg">A</span>
                          <Heart size={16} fill="currentColor" />
                        </div>
                        
                        <p className="text-2xl font-black text-neutral-900 text-center leading-tight px-4">
                          {selectedDeck.cards[currentCardIndex].text}
                        </p>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="w-full flex gap-3 mt-8">
                  <Button onClick={() => {
                    const shuffled = [...selectedDeck.cards].sort(() => Math.random() - 0.5)
                    setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: shuffled } : d))
                    setCurrentCardIndex(0)
                  }} variant="outline" className="flex-1 border-neutral-700 bg-transparent py-6">
                    <Shuffle className="mr-2" size={18}/> SHUFFLE
                  </Button>
                  <Button onClick={nextCard} className="flex-[2] bg-red-600 hover:bg-red-500 py-6 text-xl font-black">
                    NEXT
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[50vh] flex items-center justify-center border-2 border-dashed border-neutral-800 rounded-3xl text-neutral-500">
                カードを登録してください
              </div>
            )}
          </TabsContent>

          <TabsContent value="edit" className="space-y-4">
            {selectedDeck && (
              <>
                <div className="p-4 bg-neutral-800 rounded-xl border border-neutral-700">
                  <span className="text-[10px] text-red-500 font-bold tracking-widest uppercase">Editing Deck</span>
                  <h2 className="text-xl font-black">{selectedDeck.name}</h2>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="問いかけを追加..." value={newCardText} onChange={(e) => setNewCardText(e.target.value)} className="bg-neutral-800 border-neutral-700" />
                  <Button onClick={addCard} className="bg-red-600"><Plus/></Button>
                </div>
                <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-2">
                  {selectedDeck.cards.map((c) => (
                    <div key={c.id} className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
                      <span className="text-sm">{c.text}</span>
                      <Button variant="ghost" size="sm" onClick={() => setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: d.cards.filter(card => card.id !== c.id) } : d))} className="text-neutral-500"><Trash2 size={16}/></Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
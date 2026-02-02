"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Shuffle, Trash2, Layers, BookOpen } from "lucide-react"
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
    if (!selectedDeck || selectedDeck.cards.length === 0) return
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
    <main className="min-h-[100dvh] bg-slate-950 text-slate-200 p-4 font-sans overflow-hidden">
      <div className="max-w-md mx-auto space-y-4">
        <header className="py-2">
          <h1 className="text-xl font-black tracking-widest text-blue-500 text-center uppercase">Conversation Deck</h1>
        </header>

        <Tabs defaultValue="play" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900 border border-slate-800 rounded-xl mb-4">
            <TabsTrigger value="play" className="data-[state=active]:bg-blue-600 font-bold">PLAY</TabsTrigger>
            <TabsTrigger value="edit" className="data-[state=active]:bg-blue-600 font-bold">デッキ編成</TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="mt-2 outline-none">
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {decks.map(d => (
                <button 
                  key={d.id} 
                  onClick={() => {setSelectedDeckId(d.id); setCurrentCardIndex(0);}}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0 border ${selectedDeckId === d.id ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "bg-slate-900 border-slate-800 text-slate-500"}`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            {selectedDeck && selectedDeck.cards.length > 0 ? (
              <div className="relative h-[65vh] flex flex-col items-center justify-between mt-4">
                <div className="relative w-full aspect-[2.5/3.5] max-w-[320px]">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={currentCardIndex}
                      custom={direction}
                      initial={{ x: 400, opacity: 0, rotate: 5 }}
                      animate={{ x: 0, opacity: 1, rotate: isFlipped ? 180 : 0 }}
                      exit={{ x: -400, opacity: 0, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => { if (info.offset.x < -100) nextCard() }}
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="absolute inset-0 cursor-pointer"
                    >
                      <Card className="w-full h-full bg-slate-900 border-4 border-slate-700 shadow-2xl rounded-xl flex flex-col items-center justify-center p-8 relative">
                        <div className="absolute inset-2 border border-slate-800 pointer-events-none rounded-lg" />
                        <div className="absolute top-4 right-4 text-slate-700"><Layers size={20}/></div>
                        <div className="absolute bottom-4 left-4 text-slate-700"><BookOpen size={20}/></div>
                        
                        <p className="text-2xl font-bold text-slate-100 text-center leading-relaxed tracking-tight">
                          {selectedDeck.cards[currentCardIndex].text}
                        </p>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="w-full flex gap-3 mt-10">
                  <Button onClick={() => {
                    const shuffled = [...selectedDeck.cards].sort(() => Math.random() - 0.5)
                    setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: shuffled } : d))
                    setCurrentCardIndex(0)
                  }} variant="outline" className="flex-1 border-slate-700 bg-slate-900 py-6 text-slate-400 font-bold uppercase tracking-wider">
                    <Shuffle className="mr-2" size={18}/> Shuffle
                  </Button>
                  <Button onClick={nextCard} className="flex-[2] bg-blue-600 hover:bg-blue-500 py-6 text-xl font-black shadow-lg shadow-blue-900/20">
                    NEXT CARD
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[50vh] flex items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-600 italic">
                デッキを編成してください
              </div>
            )}
          </TabsContent>

          <TabsContent value="edit" className="space-y-6">
            <section className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-inner">
              <h3 className="text-xs font-bold text-blue-500 tracking-widest uppercase">New Deck</h3>
              <div className="flex gap-2">
                <Input placeholder="新しいデッキ名..." value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} className="bg-slate-950 border-slate-800 focus:border-blue-500" />
                <Button onClick={addDeck} className="bg-blue-600 shrink-0 px-6"><Plus size={20}/></Button>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase">Target Deck</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {decks.map(d => (
                  <button 
                    key={d.id} 
                    onClick={() => setSelectedDeckId(d.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${selectedDeckId === d.id ? "bg-slate-800 border-blue-500 text-blue-400" : "bg-slate-950 border-slate-800 text-slate-600"}`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>

              {selectedDeck && (
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="会話カードを追加..." 
                      value={newCardText} 
                      onChange={(e) => setNewCardText(e.target.value)} 
                      className="bg-slate-900 border-slate-800" 
                    />
                    <Button onClick={addCard} className="bg-slate-700 hover:bg-blue-600"><Plus size={20}/></Button>
                  </div>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedDeck.cards.map((c) => (
                      <div key={c.id} className="flex justify-between items-center p-4 bg-slate-900/40 rounded-xl border border-slate-800 group hover:border-slate-600 transition-colors">
                        <span className="text-sm text-slate-300 font-medium">{c.text}</span>
                        <Button variant="ghost" size="sm" onClick={() => setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: d.cards.filter(card => card.id !== c.id) } : d))} className="text-slate-600 hover:text-red-500 hover:bg-transparent">
                          <Trash2 size={16}/>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
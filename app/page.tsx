"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Shuffle, Trash2, Layers, BookOpen, Copy, Check } from "lucide-react"
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
  const [copied, setCopied] = useState(false)

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
    setCopied(false)
  }

  const copyToClipboard = () => {
    if (selectedDeck && selectedDeck.cards[currentCardIndex]) {
      navigator.clipboard.writeText(selectedDeck.cards[currentCardIndex].text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
    <main className="min-h-[100dvh] bg-white text-zinc-900 p-6 font-sans antialiased tracking-tight">
      <div className="max-w-md mx-auto space-y-8">
        <header className="py-2 border-b border-zinc-100">
          <h1 className="text-sm font-light tracking-[0.4em] text-center uppercase text-zinc-400">Dialogue Deck</h1>
        </header>

        <Tabs defaultValue="play" className="w-full">
          <TabsList className="bg-transparent border-b border-zinc-100 rounded-none h-12 mb-8 p-0 gap-8">
            <TabsTrigger value="play" className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 text-zinc-400 text-xs font-bold uppercase tracking-widest transition-all px-0">Play</TabsTrigger>
            <TabsTrigger value="edit" className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 text-zinc-400 text-xs font-bold uppercase tracking-widest transition-all px-0">Deck Edit</TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="m-0 outline-none">
            <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
              {decks.map(d => (
                <button 
                  key={d.id} 
                  onClick={() => {setSelectedDeckId(d.id); setCurrentCardIndex(0); setCopied(false);}}
                  className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all border rounded-sm ${selectedDeckId === d.id ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-300 border-zinc-100 hover:border-zinc-200"}`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            {selectedDeck && selectedDeck.cards.length > 0 ? (
              <div className="relative h-[60vh] bg-[#fdfdfd] rounded-[40px] flex flex-col items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-zinc-100 overflow-hidden px-6">
                {/* Minimal Table Decor */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
                
                <div className="relative w-full max-w-[280px] aspect-[3/4] z-10">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={currentCardIndex}
                      custom={direction}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0, rotate: isFlipped ? 180 : 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ type: "spring", stiffness: 250, damping: 30 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => { if (info.offset.x < -100) nextCard() }}
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="absolute inset-0 cursor-pointer"
                    >
                      <Card className="w-full h-full bg-white border border-zinc-100 shadow-[0_15px_50px_rgba(0,0,0,0.05)] rounded-[32px] flex flex-col items-center justify-center p-10 relative">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(); }}
                          className="absolute top-6 left-6 text-zinc-200 hover:text-zinc-900 z-10 hover:bg-zinc-50 rounded-full transition-colors"
                        >
                          {copied ? <Check size={16} className="text-zinc-900" /> : <Copy size={16} />}
                        </Button>

                        <div className="absolute top-7 right-7 text-zinc-50"><Layers size={20}/></div>
                        <div className="absolute bottom-7 left-7 text-zinc-50"><BookOpen size={20}/></div>
                        
                        <p className="text-xl font-medium text-zinc-800 text-center leading-relaxed tracking-tight">
                          {selectedDeck.cards[currentCardIndex].text}
                        </p>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="w-full flex gap-3 mt-12 z-10">
                  <Button onClick={() => {
                    const shuffled = [...selectedDeck.cards].sort(() => Math.random() - 0.5)
                    setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: shuffled } : d))
                    setCurrentCardIndex(0)
                  }} variant="ghost" className="flex-1 text-zinc-300 hover:text-zinc-900 font-bold uppercase tracking-widest text-[9px] h-12">
                    <Shuffle className="mr-2" size={14}/> Shuffle
                  </Button>
                  <Button onClick={nextCard} className="flex-[2] bg-zinc-900 text-white hover:bg-zinc-800 h-12 rounded-full text-[10px] font-bold tracking-[0.2em] shadow-lg shadow-zinc-200 transition-all active:scale-95">
                    NEXT CARD
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[50vh] flex flex-col items-center justify-center bg-zinc-50 rounded-[40px] text-zinc-300 gap-4">
                <div className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center">
                  <Plus size={20} strokeWidth={1} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Add your cards</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="edit" className="space-y-12">
            <section className="space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-300 tracking-[0.2em] uppercase px-1">Create Deck</h3>
              <div className="flex gap-2">
                <Input placeholder="Deck name..." value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} className="bg-white border-zinc-100 h-12 rounded-none border-t-0 border-x-0 border-b focus-visible:ring-0 focus-visible:border-zinc-900 px-0" />
                <Button onClick={addDeck} className="bg-zinc-900 hover:bg-zinc-800 text-white h-12 w-12 rounded-full shrink-0 shadow-xl shadow-zinc-100"><Plus size={24}/></Button>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-[10px] font-bold text-zinc-300 tracking-[0.2em] uppercase px-1">Manage Cards</h3>
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {decks.map(d => (
                  <button 
                    key={d.id} 
                    onClick={() => setSelectedDeckId(d.id)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all border ${selectedDeckId === d.id ? "bg-zinc-100 border-zinc-100 text-zinc-900" : "bg-white border-zinc-100 text-zinc-300 hover:border-zinc-200"}`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>

              {selectedDeck && (
                <div className="space-y-6 pt-2">
                  <div className="flex gap-2">
                    <Input placeholder="Conversation card..." value={newCardText} onChange={(e) => setNewCardText(e.target.value)} className="bg-white border-zinc-100 h-12 rounded-none border-t-0 border-x-0 border-b focus-visible:ring-0 focus-visible:border-zinc-900 px-0" />
                    <Button onClick={addCard} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-12 w-12 rounded-full shrink-0"><Plus size={24}/></Button>
                  </div>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedDeck.cards.map((c) => (
                      <div key={c.id} className="flex justify-between items-center py-4 border-b border-zinc-50 group hover:border-zinc-200 transition-all">
                        <span className="text-sm text-zinc-500 font-medium group-hover:text-zinc-900 transition-colors">{c.text}</span>
                        <Button variant="ghost" size="sm" onClick={() => setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: d.cards.filter(card => card.id !== c.id) } : d))} className="text-zinc-200 hover:text-zinc-900 hover:bg-transparent">
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